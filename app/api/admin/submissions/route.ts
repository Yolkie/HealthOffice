import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reporterGroups = await prisma.submission.groupBy({
      by: ["reporterName"],
      _count: {
        _all: true,
      },
      _max: {
        submissionDate: true,
      },
    });

    const list = reporterGroups
      .map((group) => ({
        reporterName: group.reporterName,
        submissionsCount: group._count._all,
        lastSubmissionDate: group._max.submissionDate,
      }))
      .sort((a, b) => {
        if (!a.lastSubmissionDate || !b.lastSubmissionDate) {
          return 0;
        }

        return b.lastSubmissionDate.getTime() - a.lastSubmissionDate.getTime();
      });

    return NextResponse.json({ reporters: list });
  } catch (error) {
    console.error("Admin list error:", error);
    return NextResponse.json(
      { error: "Failed to load submissions" },
      { status: 500 }
    );
  }
}


