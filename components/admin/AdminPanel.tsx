"use client";

import * as React from "react";

type ReporterSummary = {
  reporterName: string;
  submissionsCount: number;
  lastSubmissionDate: string | null;
};

type SubmissionHistory = {
  id: string;
  reporterName: string;
  branchName: string;
  dateStarted: string;
  dateEnded: string;
  submissionDate: string;
  additionalComments: string | null;
  needsFixing: Array<{
    id: string;
    propertyId: string;
    propertyName: string;
    comments: string | null;
    photos?: Array<{
      filename?: string;
      url?: string;
      obsKey?: string;
      mimeType?: string;
      size?: number;
    }>;
  }>;
};

interface AdminPanelProps {
  initialReporters: ReporterSummary[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({ initialReporters }) => {
  const [reporters, setReporters] = React.useState(initialReporters);
  const [selectedReporter, setSelectedReporter] = React.useState<string | null>(
    initialReporters[0]?.reporterName ?? null
  );
  const [history, setHistory] = React.useState<SubmissionHistory[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchReporters = React.useCallback(async () => {
    try {
      const response = await fetch("/api/admin/submissions");
      if (!response.ok) {
        throw new Error("Failed to load reporters");
      }

      const data = await response.json();
      setReporters(data.reporters);
    } catch (err) {
      console.error(err);
      setError("Unable to refresh reporter list");
    }
  }, []);

  React.useEffect(() => {
    if (!selectedReporter) {
      setHistory([]);
      return;
    }

    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/admin/submissions/${encodeURIComponent(selectedReporter)}`
        );
        if (!response.ok) {
          throw new Error("Failed to load reporter history");
        }
        const data = await response.json();
        setHistory(data.submissions);
      } catch (err) {
        console.error(err);
        setError("Unable to load submission history");
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [selectedReporter]);

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Master List</h2>
          <button
            className="text-xs text-blue-600 hover:underline"
            onClick={fetchReporters}
          >
            Refresh
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {reporters.length} unique reporter
          {reporters.length === 1 ? "" : "s"} recorded.
        </p>

        <div className="mt-4 space-y-2">
          {reporters.length === 0 && (
            <p className="text-sm text-slate-500">
              No submissions have been recorded yet.
            </p>
          )}
          {reporters.map((reporter) => (
            <button
              key={reporter.reporterName}
              onClick={() => setSelectedReporter(reporter.reporterName)}
              className={`w-full rounded-lg border p-3 text-left transition ${
                selectedReporter === reporter.reporterName
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <p className="font-medium">{reporter.reporterName}</p>
              <p className="text-xs text-slate-500">
                {reporter.submissionsCount} submission
                {reporter.submissionsCount === 1 ? "" : "s"}
              </p>
              {reporter.lastSubmissionDate && (
                <p className="text-xs text-slate-400">
                  Last:{" "}
                  {new Date(reporter.lastSubmissionDate).toLocaleDateString()}
                </p>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {selectedReporter ? (
          <>
            <h2 className="text-xl font-semibold text-slate-900">
              {selectedReporter}
            </h2>
            <p className="text-sm text-slate-500">
              History of monthly office health submissions.
            </p>

            {isLoading && (
              <p className="mt-4 text-sm text-slate-500">Loading history...</p>
            )}
            {error && (
              <p className="mt-4 text-sm text-red-500" role="alert">
                {error}
              </p>
            )}
            {!isLoading && history.length === 0 && !error && (
              <p className="mt-4 text-sm text-slate-500">
                No submissions recorded for this reporter yet.
              </p>
            )}

            <div className="mt-4 space-y-4">
              {history.map((submission) => (
                <div
                  key={submission.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    <span className="font-medium text-slate-900">
                      {new Date(submission.submissionDate).toLocaleDateString(
                        undefined,
                        { year: "numeric", month: "long", day: "numeric" }
                      )}
                    </span>
                    <span>•</span>
                    <span>{submission.branchName}</span>
                    <span>•</span>
                    <span>
                      {new Date(submission.dateStarted).toLocaleDateString()} –{" "}
                      {new Date(submission.dateEnded).toLocaleDateString()}
                    </span>
                  </div>

                  {submission.additionalComments && (
                    <p className="mt-2 text-sm text-slate-600">
                      Notes: {submission.additionalComments}
                    </p>
                  )}

                  <div className="mt-3">
                    <p className="text-sm font-semibold text-slate-900">
                      Needs Fixing
                    </p>
                    {submission.needsFixing.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No issues were marked as needing fixes.
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-2">
                        {submission.needsFixing.map((issue) => (
                          <li
                            key={issue.id}
                            className="rounded-lg border border-slate-200 bg-white p-3 text-sm"
                          >
                            <p className="font-medium text-slate-900">
                              {issue.propertyName}
                            </p>
                            {issue.comments && (
                              <p className="text-slate-600">
                                {issue.comments}
                              </p>
                            )}
                            {issue.photos && issue.photos.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-slate-500">
                                  Photos:
                                </p>
                                <ul className="mt-1 space-y-1 text-xs text-slate-500">
                                  {issue.photos.map((photo, index) => (
                                    <li key={index}>
                                      {photo.url ? (
                                        <a
                                          href={photo.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-blue-600 hover:underline"
                                        >
                                          {photo.filename || photo.url}
                                        </a>
                                      ) : (
                                        photo.filename ?? "Attachment"
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-500">
            Select a reporter from the list to view their submission history.
          </p>
        )}
      </section>
    </div>
  );
};

export default AdminPanel;












