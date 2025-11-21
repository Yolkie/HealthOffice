import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const count = await prisma.submission.count();
    const allSubmissions = await prisma.submission.findMany({
      select: {
        id: true,
        reporterName: true,
        branchName: true,
        submissionDate: true,
        createdAt: true,
      },
      orderBy: {
        submissionDate: "desc",
      },
      take: 10,
    });

    return NextResponse.json({
      totalCount: count,
      recentSubmissions: allSubmissions,
      databaseUrl: process.env.DATABASE_URL,
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      {
        error: "Failed to query database",
        message: error instanceof Error ? error.message : "Unknown error",
        databaseUrl: process.env.DATABASE_URL,
      },
      { status: 500 }
    );
  }
}

