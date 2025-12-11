import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import AdminPanel from "@/components/admin/AdminPanel";
import UserManagement from "@/components/admin/UserManagement";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Admin Panel | Office Health Check-Up",
};

export default async function AdminPage() {
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
    redirect("/login");
  }

  const { data: allSubmissions, error } = await supabase
    .from("Submission")
    .select("*")
    .order("submissionDate", { ascending: false });

  if (error || !allSubmissions) {
    console.error("Admin Page: Failed to load submissions:", error);
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load data. Please check your connection and credentials.
      </div>
    );
  }

  const reporterMap = new Map<
    string,
    { count: number; lastSubmissionDate: Date | null }
  >();

  for (const submission of allSubmissions) {
    const name = submission.reporterName.trim();
    if (!name) continue;

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

  const reporters = Array.from(reporterMap.entries())
    .map(([reporterName, data]) => ({
      reporterName,
      submissionsCount: data.count,
      lastSubmissionDate: data.lastSubmissionDate?.toISOString() ?? null,
    }))
    .sort((a, b) => {
      if (!a.lastSubmissionDate || !b.lastSubmissionDate) return 0;
      return b.lastSubmissionDate.localeCompare(a.lastSubmissionDate);
    });

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto max-w-6xl px-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Admin Panel
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          View submissions per reporter. Click a name to review their historical
          reports and problem areas.
        </p>
        <AdminPanel initialReporters={reporters} />
        <UserManagement />
      </div>
    </div>
  );
}

