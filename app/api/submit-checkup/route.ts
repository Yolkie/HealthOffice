import { NextRequest, NextResponse } from "next/server";
import { formSubmissionSchema } from "@/lib/validation";
import { supabase } from "@/lib/supabase";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validationResult = formSubmissionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verify session and get user
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", message: "You must be logged in to submit" },
        { status: 401 }
      );
    }

    // Use logged-in user's username/name
    const reporterName = user.user_metadata.username || user.email?.split("@")[0] || "Unknown Reporter";

    console.log("Saving submission for user:", reporterName);
    console.log("Branch:", data.branchName);

    // Persist submission in database
    const { data: submissionRecord, error: submissionError } = await supabase
      .from("Submission")
      .insert({
        reporterName: reporterName,
        branchName: data.branchName,
        dateStarted: new Date(data.dateStarted).toISOString(),
        dateEnded: new Date(data.dateEnded).toISOString(),
        submissionDate: new Date(data.submissionDate).toISOString(),
        additionalComments: data.additionalComments ?? null,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      })
      .select()
      .single();

    if (submissionError || !submissionRecord) {
      console.error("Supabase submission error:", submissionError);
      throw new Error("Failed to save submission");
    }

    const propertiesData = data.properties.map((property) => ({
      submissionId: submissionRecord.id,
      propertyId: property.id,
      propertyName: property.name,
      condition: property.condition,
      comments: property.comments,
      photosJson: JSON.stringify(
        property.photos.map(({ filename, url, obsKey, mimeType, size, propertyId: propId }) => ({
          filename,
          url,
          obsKey,
          mimeType,
          size,
          propertyId: propId,
        }))
      ),
    }));

    const { error: propertiesError } = await supabase
      .from("PropertyReport")
      .insert(propertiesData);

    if (propertiesError) {
      console.error("Supabase properties error:", propertiesError);
      // Ideally we should rollback here, but for now just throw
      throw new Error("Failed to save properties");
    }

    console.log("Submission saved successfully with ID:", submissionRecord.id);
    console.log("Saved reporterName:", submissionRecord.reporterName);

    // Get webhook URL from environment variables
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const webhookKey = process.env.N8N_WEBHOOK_KEY;

    if (!webhookUrl) {
      console.error("N8N_WEBHOOK_URL is not configured");
      return NextResponse.json(
        {
          success: false,
          error: "Webhook configuration error",
          message: "Server configuration is incomplete",
        },
        { status: 500 }
      );
    }

    // Prepare payload for n8n webhook
    const payload = {
      reporterName: submissionRecord.reporterName,
      branchName: submissionRecord.branchName,
      dateStarted: submissionRecord.dateStarted,
      dateEnded: submissionRecord.dateEnded,
      submissionDate: submissionRecord.submissionDate,
      properties: data.properties,
      additionalComments: submissionRecord.additionalComments,
      metadata: submissionRecord.metadata
        ? JSON.parse(submissionRecord.metadata)
        : null,
    };

    // Forward to n8n webhook
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (webhookKey) {
        headers["Authorization"] = `Bearer ${webhookKey}`;
      }

      const webhookResponse = await fetch(webhookUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        console.error("Webhook error:", errorText);
        return NextResponse.json(
          {
            success: false,
            error: "Webhook request failed",
            message: `Failed to submit to webhook: ${webhookResponse.status}`,
          },
          { status: 502 }
        );
      }

      const webhookResult = await webhookResponse.json().catch(() => ({}));

      return NextResponse.json(
        {
          success: true,
          message: "Health check-up submitted successfully",
          submissionId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          webhookResponse: webhookResult,
        },
        { status: 200 }
      );
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      return NextResponse.json(
        {
          success: false,
          error: "Network error",
          message: "Failed to connect to webhook endpoint",
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}


