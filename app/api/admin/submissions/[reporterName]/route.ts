import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { reporterName: string } }
) {
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

    const reporterName = decodeURIComponent(params.reporterName);

    const { data: submissions, error } = await supabase
      .from("Submission")
      .select("*, properties:PropertyReport(*)")
      .eq("reporterName", reporterName.trim())
      .order("submissionDate", { ascending: false });

    if (error || !submissions) {
      console.error("Supabase history error:", error);
      throw new Error("Failed to load history");
    }

    const payload = submissions.map((submission: any) => ({
      id: submission.id,
      reporterName: submission.reporterName,
      branchName: submission.branchName,
      dateStarted: submission.dateStarted,
      dateEnded: submission.dateEnded,
      submissionDate: submission.submissionDate,
      additionalComments: submission.additionalComments,
      needsFixing: (submission.properties as any[])
        .filter((prop: any) => prop.condition === "Needs Fixing")
        .map((prop: any) => {
          const photos =
            (prop.photosJson
              ? (JSON.parse(prop.photosJson) as Array<{
                filename?: string;
                url?: string;
                obsKey?: string;
                mimeType?: string;
                size?: number;
              }>)
              : []) ?? [];

          return {
            id: prop.id,
            propertyId: prop.propertyId,
            propertyName: prop.propertyName,
            comments: prop.comments,
            photos,
          };
        }),
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

