import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalCount = await prisma.submission.count();
    console.log("Total submissions in database:", totalCount);

    const allSubmissions = await prisma.submission.findMany({
      select: {
        id: true,
        reporterName: true,
        submissionDate: true,
      },
      orderBy: {
        submissionDate: "desc",
      },
    });

    console.log("Total submissions found:", allSubmissions.length);
    console.log("Sample submissions (first 5):", allSubmissions.slice(0, 5).map(s => ({
      id: s.id,
      reporterName: s.reporterName,
      reporterNameLength: s.reporterName.length,
      submissionDate: s.submissionDate,
    })));

    const reporterMap = new Map<
      string,
      { count: number; lastSubmissionDate: Date | null }
    >();

    for (const submission of allSubmissions) {
      const name = submission.reporterName.trim();
      if (!name) {
        console.warn("Found submission with empty reporterName:", submission);
        continue;
      }

      const existing = reporterMap.get(name);
      if (existing) {
        existing.count++;
        if (
          !existing.lastSubmissionDate ||
          submission.submissionDate > existing.lastSubmissionDate
        ) {
          existing.lastSubmissionDate = submission.submissionDate;
        }
      } else {
        reporterMap.set(name, {
          count: 1,
          lastSubmissionDate: submission.submissionDate,
        });
      }
    }

    const list = Array.from(reporterMap.entries())
      .map(([reporterName, data]) => ({
        reporterName,
        submissionsCount: data.count,
        lastSubmissionDate: data.lastSubmissionDate,
      }))
      .sort((a, b) => {
        if (!a.lastSubmissionDate || !b.lastSubmissionDate) {
          return 0;
        }
        return b.lastSubmissionDate.getTime() - a.lastSubmissionDate.getTime();
      });

    console.log("Reporters list:", list);

    return NextResponse.json({ reporters: list });
  } catch (error) {
    console.error("Admin list error:", error);
    return NextResponse.json(
      { error: "Failed to load submissions" },
      { status: 500 }
    );
  }
}


