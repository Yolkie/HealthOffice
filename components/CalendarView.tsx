"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, isSameDay, parseISO } from "date-fns";
import "react-day-picker/dist/style.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Submission = {
    id: string;
    submissionDate: string;
    branchName: string;
    reporterName: string;
    properties: any[];
};

interface CalendarViewProps {
    submissions: Submission[];
}

export default function CalendarView({ submissions }: CalendarViewProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    // Create a set of dates that have submissions
    const submissionDates = submissions.map((s) => parseISO(s.submissionDate));

    // Find submissions for the selected date
    const selectedSubmissions = selectedDate
        ? submissions.filter((s) => isSameDay(parseISO(s.submissionDate), selectedDate))
        : [];

    const modifiers = {
        submitted: submissionDates,
    };

    const modifiersStyles = {
        submitted: {
            color: "white",
            backgroundColor: "#2563eb", // blue-600
            fontWeight: "bold",
            borderRadius: "50%",
        },
    };

    return (
        <div className="grid gap-8 md:grid-cols-[auto_1fr]">
            <Card className="w-fit">
                <CardContent className="p-4">
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        modifiers={modifiers}
                        modifiersStyles={modifiersStyles}
                        footer={
                            selectedDate ? (
                                <p className="mt-4 text-center text-sm text-slate-600">
                                    Selected: {format(selectedDate, "PP")}
                                </p>
                            ) : (
                                <p className="mt-4 text-center text-sm text-slate-600">
                                    Pick a day.
                                </p>
                            )
                        }
                    />
                </CardContent>
            </Card>

            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-slate-900">
                    {selectedDate
                        ? `Submissions for ${format(selectedDate, "MMMM d, yyyy")}`
                        : "Select a date to view submissions"}
                </h2>

                {selectedSubmissions.length > 0 ? (
                    selectedSubmissions.map((submission) => (
                        <Card key={submission.id}>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    {submission.branchName}
                                </CardTitle>
                                <p className="text-sm text-slate-500">
                                    Submitted at {format(parseISO(submission.submissionDate), "p")}
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Properties Reported:</p>
                                    <ul className="list-disc pl-5 text-sm text-slate-600">
                                        {submission.properties.map((p: any) => (
                                            <li key={p.id}>
                                                <span className="font-medium">{p.propertyName}:</span>{" "}
                                                <span
                                                    className={
                                                        p.condition === "Good"
                                                            ? "text-green-600"
                                                            : p.condition === "Needs Fixing"
                                                                ? "text-red-600"
                                                                : "text-slate-500"
                                                    }
                                                >
                                                    {p.condition}
                                                </span>
                                                {p.comments && ` - ${p.comments}`}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
                        No submissions found for this date.
                    </div>
                )}
            </div>
        </div>
    );
}
