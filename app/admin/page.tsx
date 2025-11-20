import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import AdminPanel from "@/components/admin/AdminPanel";

export const metadata: Metadata = {
  title: "Admin Panel | Office Health Check-Up",
};

export default async function AdminPage() {
  const reporterGroups = await prisma.submission.groupBy({
    by: ["reporterName"],
    _count: {
      _all: true,
    },
    _max: {
      submissionDate: true,
    },
  });

  const reporters = reporterGroups
    .map((group) => ({
      reporterName: group.reporterName,
      submissionsCount: group._count._all,
      lastSubmissionDate: group._max.submissionDate?.toISOString() ?? null,
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
      </div>
    </div>
  );
}

