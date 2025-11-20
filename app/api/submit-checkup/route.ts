import { NextRequest, NextResponse } from "next/server";
import { formSubmissionSchema } from "@/lib/validation";

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

    // Get webhook URL from environment variables
    const webhookUrl = "https://workflow.discoverycapital.com.ph/webhook-test/90bff59c-798a-4ec9-aab7-1efcc118b7c7";
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
      reporterName: data.reporterName,
      branchName: data.branchName,
      submissionDate: data.submissionDate,
      properties: data.properties,
      additionalComments: data.additionalComments,
      metadata: data.metadata,
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


