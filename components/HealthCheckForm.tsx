"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyItem } from "./PropertyItem";
import {
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

  const defaultValues: FormSubmissionInput = {
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
          <CardDescription className="text-sm">
            Any additional information or general observations about the office condition
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


