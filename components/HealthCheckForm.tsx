"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PropertyItem } from "./PropertyItem";
import {
  BRANCH_OPTIONS,
  OFFICE_PROPERTIES,
  PropertySubmission,
  FormSubmission,
  VALIDATION_RULES,
} from "@/lib/types";
import { formSubmissionSchema, FormSubmissionInput } from "@/lib/validation";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface HealthCheckFormProps {
  onSubmit?: (data: FormSubmission) => void;
  onError?: (error: Error) => void;
}

export const HealthCheckForm: React.FC<HealthCheckFormProps> = ({
  onSubmit,
  onError,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<"idle" | "success" | "error">("idle");
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const todayISO = React.useMemo(() => new Date().toISOString().split("T")[0], []);
  const firstDayISO = React.useMemo(() => {
    const current = new Date();
    current.setDate(1);
    return current.toISOString().split("T")[0];
  }, []);

  const defaultValues: FormSubmissionInput = {
    reporterName: "",
    branchName: BRANCH_OPTIONS[0],
    dateStarted: firstDayISO,
    dateEnded: todayISO,
    submissionDate: new Date().toISOString(),
    properties: OFFICE_PROPERTIES.map((prop) => ({
      id: prop.id,
      name: prop.name,
      condition: "Good" as const,
      comments: null,
      photos: [],
    })),
    additionalComments: null,
    metadata: {
      userAgent: typeof window !== "undefined" ? navigator.userAgent : undefined,
      screenResolution:
        typeof window !== "undefined"
          ? `${window.screen.width}x${window.screen.height}`
          : undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormSubmissionInput>({
    resolver: zodResolver(formSubmissionSchema),
    defaultValues,
    mode: "onChange",
  });

  const properties = watch("properties");
  const reporterName = watch("reporterName");
  const branchName = watch("branchName");
  const dateStarted = watch("dateStarted");
  const dateEnded = watch("dateEnded");
  const additionalComments = watch("additionalComments");

  const handlePropertyChange = (index: number, value: PropertySubmission) => {
    const updatedProperties = [...properties];
    updatedProperties[index] = value;
    setValue("properties", updatedProperties, { shouldValidate: true });
  };

  const handleFormSubmit = async (data: FormSubmissionInput) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setSubmitError(null);

    try {
      const response = await fetch("/api/submit-checkup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.message || `Server error: ${response.status}`
        );
      }

      const result = await response.json();
      setSubmitStatus("success");
      
      if (onSubmit) {
        onSubmit(data as FormSubmission);
      }

      // Reset form after successful submission
      setTimeout(() => {
        setValue("reporterName", "");
        setValue("branchName", BRANCH_OPTIONS[0]);
        setValue("dateStarted", firstDayISO);
        setValue("dateEnded", todayISO);
        setValue("properties", defaultValues.properties);
        setValue("additionalComments", null);
        setSubmitStatus("idle");
      }, 3000);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to submit form");
      setSubmitStatus("error");
      setSubmitError(error.message);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl">Branch Information</CardTitle>
          <CardDescription className="text-sm italic">
            Provide your name, select the branch, and indicate when the check-up started and ended.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <div>
            <Label htmlFor="reporter-name" className="text-sm">
              Name <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs italic text-muted-foreground">
              Please enter your full name for tracking and follow-up.
            </p>
            <Input
              id="reporter-name"
              placeholder="e.g., Juan Dela Cruz"
              value={reporterName}
              onChange={(e) => setValue("reporterName", e.target.value, { shouldValidate: true })}
              className="mt-1"
              aria-invalid={errors.reporterName ? "true" : "false"}
              aria-describedby={errors.reporterName ? "reporter-name-error" : undefined}
            />
            {errors.reporterName && (
              <p id="reporter-name-error" className="mt-1 text-xs text-destructive" role="alert">
                {errors.reporterName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="branch-name" className="text-sm">
              Branch Name <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs italic text-muted-foreground">
              Select the branch you are reporting from to tag the submission correctly.
            </p>
            <select
              id="branch-name"
              value={branchName}
              onChange={(e) =>
                setValue("branchName", e.target.value as FormSubmissionInput["branchName"], {
                  shouldValidate: true,
                })
              }
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-invalid={errors.branchName ? "true" : "false"}
              aria-describedby={errors.branchName ? "branch-name-error" : undefined}
            >
              {BRANCH_OPTIONS.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
            {errors.branchName && (
              <p id="branch-name-error" className="mt-1 text-xs text-destructive" role="alert">
                {errors.branchName.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="date-started" className="text-sm">
                Date Started <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs italic text-muted-foreground">
                Choose the date when this monthly check-up began.
              </p>
              <Input
                id="date-started"
                type="date"
                value={dateStarted}
                max={dateEnded}
                onChange={(e) => setValue("dateStarted", e.target.value, { shouldValidate: true })}
                className="mt-1"
                aria-invalid={errors.dateStarted ? "true" : "false"}
                aria-describedby={errors.dateStarted ? "date-started-error" : undefined}
              />
              {errors.dateStarted && (
                <p id="date-started-error" className="mt-1 text-xs text-destructive" role="alert">
                  {errors.dateStarted.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="date-ended" className="text-sm">
                Date Ended <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs italic text-muted-foreground">
                Choose the date when the inspection was completed.
              </p>
              <Input
                id="date-ended"
                type="date"
                value={dateEnded}
                min={dateStarted}
                onChange={(e) => setValue("dateEnded", e.target.value, { shouldValidate: true })}
                className="mt-1"
                aria-invalid={errors.dateEnded ? "true" : "false"}
                aria-describedby={errors.dateEnded ? "date-ended-error" : undefined}
              />
              {errors.dateEnded && (
                <p id="date-ended-error" className="mt-1 text-xs text-destructive" role="alert">
                  {errors.dateEnded.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl">Monthly Office Health Check-Up</CardTitle>
          <CardDescription className="text-sm">
            Please review each office property and report its condition. Date:{" "}
            {formatDate(new Date().toISOString())}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          {OFFICE_PROPERTIES.map((property, index) => {
            const propertyValue = properties[index];
            const propertyErrors = errors.properties?.[index];

            return (
              <PropertyItem
                key={property.id}
                property={property}
                value={propertyValue}
                onChange={(value) => handlePropertyChange(index, value)}
                errors={{
                  comments: propertyErrors?.comments?.message,
                  photos: propertyErrors?.photos?.message,
                }}
              />
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl">Additional Comments</CardTitle>
          <CardDescription className="text-sm italic">
            Share any general observations about the branch condition or follow-up notes.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div>
            <Label htmlFor="additional-comments" className="text-sm">
              General Comments
            </Label>
            <Textarea
              id="additional-comments"
              value={additionalComments || ""}
              onChange={(e) => setValue("additionalComments", e.target.value || null)}
              placeholder="Enter any additional comments..."
              maxLength={VALIDATION_RULES.additionalComments.maxLength}
              className="mt-1"
              rows={4}
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-muted-foreground">
                {(additionalComments || "").length} /{" "}
                {VALIDATION_RULES.additionalComments.maxLength} characters
              </p>
              {errors.additionalComments && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.additionalComments.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {errors.properties && typeof errors.properties.message === "string" && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-destructive" role="alert">
            {errors.properties.message}
          </p>
        </div>
      )}

      {submitStatus === "success" && (
        <div className="rounded-lg border border-green-500 bg-green-50 dark:bg-green-950 p-3 sm:p-4 flex items-start sm:items-center gap-2">
          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs sm:text-sm text-green-800 dark:text-green-200">
            Health check-up submitted successfully! The report will be processed and emailed.
          </p>
        </div>
      )}

      {submitStatus === "error" && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-3 sm:p-4 flex items-start sm:items-center gap-2">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive flex-shrink-0 mt-0.5 sm:mt-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-destructive">Submission failed</p>
            <p className="text-xs sm:text-sm text-destructive/80 break-words">{submitError}</p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
          className="w-full sm:w-auto min-w-[120px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Check-Up"
          )}
        </Button>
      </div>
    </form>
  );
};


