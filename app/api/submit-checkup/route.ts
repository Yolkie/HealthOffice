import { NextRequest, NextResponse } from "next/server";
import { formSubmissionSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

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

    const trimmedReporterName = data.reporterName.trim();
    console.log("Saving submission with reporterName:", trimmedReporterName);
    console.log("Branch:", data.branchName);
    console.log("Date Started:", data.dateStarted);
    console.log("Date Ended:", data.dateEnded);

    if (!trimmedReporterName || trimmedReporterName.length < 2) {
      console.error("Invalid reporterName:", trimmedReporterName);
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          message: "Reporter name is required and must be at least 2 characters",
        },
        { status: 400 }
      );
    }

    // Persist submission in database
    let submissionRecord;
    try {
      submissionRecord = await prisma.submission.create({
        data: {
          reporterName: trimmedReporterName,
          branchName: data.branchName,
          dateStarted: new Date(data.dateStarted),
          dateEnded: new Date(data.dateEnded),
          submissionDate: new Date(data.submissionDate),
          additionalComments: data.additionalComments ?? null,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
          properties: {
            create: data.properties.map((property) => ({
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
            })),
          },
        },
        include: {
          properties: true,
        },
      });

      console.log("Submission saved successfully with ID:", submissionRecord.id);
      console.log("Saved reporterName:", submissionRecord.reporterName);
      console.log("Saved branchName:", submissionRecord.branchName);
      console.log("Number of properties saved:", submissionRecord.properties.length);

      // Verify the record was actually saved
      const verification = await prisma.submission.findUnique({
        where: { id: submissionRecord.id },
        select: { id: true, reporterName: true, branchName: true },
      });

      if (!verification) {
        console.error("CRITICAL: Submission record not found after creation!");
        throw new Error("Database verification failed");
      }

      console.log("Database verification successful:", verification);
    } catch (dbError) {
      console.error("Database error during submission save:", dbError);
      if (dbError instanceof Error) {
        console.error("Error message:", dbError.message);
        console.error("Error stack:", dbError.stack);
      }
      return NextResponse.json(
        {
          success: false,
          error: "Database error",
          message: "Failed to save submission to database",
          details: dbError instanceof Error ? dbError.message : "Unknown error",
        },
        { status: 500 }
      );
    }

    // Get webhook URL from environment variables
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const webhookKey = process.env.N8N_WEBHOOK_KEY;

    // Prepare payload for n8n webhook
    const payload = {
      reporterName: submissionRecord.reporterName,
      branchName: submissionRecord.branchName,
      dateStarted: submissionRecord.dateStarted.toISOString(),
      dateEnded: submissionRecord.dateEnded.toISOString(),
      submissionDate: submissionRecord.submissionDate.toISOString(),
      properties: data.properties,
      additionalComments: submissionRecord.additionalComments,
      metadata: submissionRecord.metadata
        ? JSON.parse(submissionRecord.metadata)
        : null,
    };

    // Forward to n8n webhook (non-blocking - database save already succeeded)
    let webhookSuccess = false;
    let webhookError = null;

    if (webhookUrl) {
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

        if (webhookResponse.ok) {
          webhookSuccess = true;
          const webhookResult = await webhookResponse.json().catch(() => ({}));
          console.log("Webhook call successful");
          return NextResponse.json(
            {
              success: true,
              message: "Health check-up submitted successfully",
              submissionId: submissionRecord.id,
              timestamp: new Date().toISOString(),
              webhookResponse: webhookResult,
            },
            { status: 200 }
          );
        } else {
          const errorText = await webhookResponse.text();
          console.error("Webhook error:", errorText);
          webhookError = `Webhook returned status ${webhookResponse.status}`;
        }
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        webhookError = fetchError instanceof Error ? fetchError.message : "Network error";
      }
    } else {
      console.warn("N8N_WEBHOOK_URL is not configured - skipping webhook call");
      webhookError = "Webhook URL not configured";
    }

    // Database save succeeded, but webhook failed - still return success
    return NextResponse.json(
      {
        success: true,
        message: "Health check-up saved successfully",
        submissionId: submissionRecord.id,
        timestamp: new Date().toISOString(),
        warning: webhookError ? `Data saved but webhook failed: ${webhookError}` : undefined,
      },
      { status: 200 }
    );
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


