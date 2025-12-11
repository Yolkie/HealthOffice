import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const debugInfo = {
      env: {
        url: url ? `${url.substring(0, 20)}...` : "MISSING",
        key: key ? `${key.substring(0, 10)}...` : "MISSING",
      },
      tests: {} as any,
    };

    // Test 1: Exact Admin Page Query
    const { data: adminPageData, error: adminPageError } = await supabase
      .from("Submission")
      .select("id, reporterName, branchName, submissionDate, createdAt")
      .order("submissionDate", { ascending: false });

    debugInfo.tests.AdminPageQuery = {
      count: adminPageData?.length,
      sample: adminPageData?.slice(0, 3),
      error: adminPageError,
    };

    // Test 2: Exact Admin API Query (List)
    const { count: apiCount, error: apiCountError } = await supabase
      .from("Submission")
      .select("*", { count: "exact", head: true });

    debugInfo.tests.AdminApiCount = {
      count: apiCount,
      error: apiCountError,
    };

    // Test 3: Select * (Control)
    const { data: controlData, error: controlError } = await supabase
      .from("Submission")
      .select("*")
      .limit(5);

    debugInfo.tests.ControlSelectAll = {
      count: controlData?.length,
      sample: controlData,
      error: controlError,
    };

    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      {
        error: "Failed to run diagnostics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
