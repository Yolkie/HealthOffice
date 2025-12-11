"use client";

import { useEffect, useState } from "react";
import CalendarView from "@/components/CalendarView";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const res = await fetch("/api/my-submissions");
                if (!res.ok) {
                    if (res.status === 401) {
                        window.location.href = "/login";
                        return;
                    }
                    throw new Error("Failed to fetch submissions");
                }
                const data = await res.json();
                setSubmissions(data.submissions);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-center text-red-600">
                    <p>Error: {error}</p>
                    <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10">
            <div className="container mx-auto max-w-6xl px-4">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            My Submission History
                        </h1>
                        <p className="mt-2 text-sm text-slate-600">
                            View your past monthly check-up reports.
                        </p>
                    </div>
                    <Link
                        href="/"
                        className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 border border-slate-300"
                    >
                        Back to Form
                    </Link>
                </div>

                <CalendarView submissions={submissions} />
            </div>
        </div>
    );
}
