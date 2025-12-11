import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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

    if (!user || user.user_metadata.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { count, error: countError } = await supabase
      .from("Submission")
      .select("*", { count: "exact" });

    if (countError) {
      console.error("Supabase count error:", countError);
      throw new Error("Failed to count submissions");
    }


    const { data: allSubmissions, error: fetchError } = await supabase
      .from("Submission")
      .select("id, reporterName, submissionDate")
      .order("submissionDate", { ascending: false });

    if (fetchError || !allSubmissions) {
      console.error("Supabase fetch error:", fetchError);
      throw new Error("Failed to fetch submissions");
    }

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
          new Date(submission.submissionDate) > existing.lastSubmissionDate
        ) {
          existing.lastSubmissionDate = new Date(submission.submissionDate);
        }
      } else {
        reporterMap.set(name, {
          count: 1,
          lastSubmissionDate: new Date(submission.submissionDate),
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



    return NextResponse.json({ reporters: list });
  } catch (error) {
    console.error("Admin list error:", error);
    return NextResponse.json(
      { error: "Failed to load submissions" },
      { status: 500 }
    );
  }
}


