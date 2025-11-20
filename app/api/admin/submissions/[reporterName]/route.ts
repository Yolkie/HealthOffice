import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { reporterName: string } }
) {
  try {
    const reporterName = decodeURIComponent(params.reporterName);
    const submissions = await prisma.submission.findMany({
      where: { reporterName },
      orderBy: { submissionDate: "desc" },
      include: {
        properties: true,
      },
    });

    const payload = submissions.map((submission) => ({
      id: submission.id,
      reporterName: submission.reporterName,
      branchName: submission.branchName,
      dateStarted: submission.dateStarted,
      dateEnded: submission.dateEnded,
      submissionDate: submission.submissionDate,
      additionalComments: submission.additionalComments,
      needsFixing: submission.properties
        .filter((prop) => prop.condition === "Needs Fixing")
        .map((prop) => ({
          id: prop.id,
          propertyId: prop.propertyId,
          propertyName: prop.propertyName,
          comments: prop.comments,
          photos: (prop.photos as Array<{
            filename?: string;
            url?: string;
            obsKey?: string;
            mimeType?: string;
            size?: number;
          }>)?.map((photo) => ({
            filename: photo.filename,
            url: photo.url,
            obsKey: photo.obsKey,
            mimeType: photo.mimeType,
            size: photo.size,
          })),
        })),
    }));

    return NextResponse.json({
      reporterName,
      submissions: payload,
    });
  } catch (error) {
    console.error("Admin reporter history error:", error);
    return NextResponse.json(
      { error: "Failed to load reporter history" },
      { status: 500 }
    );
  }
}

