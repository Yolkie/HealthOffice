"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OfficeProperty, PropertySubmission, VALIDATION_RULES } from "@/lib/types";
import { PhotoUpload } from "./PhotoUpload";
import { PhotoFile } from "@/lib/types";

interface PropertyItemProps {
  property: OfficeProperty;
  value: PropertySubmission;
  onChange: (value: PropertySubmission) => void;
  errors?: {
    comments?: string;
    photos?: string;
  };
}

export const PropertyItem: React.FC<PropertyItemProps> = ({
  property,
  value,
  onChange,
  errors,
}) => {
  const [photos, setPhotos] = React.useState<PhotoFile[]>(value.photos || []);

  const handleConditionChange = (condition: "Good" | "Needs Fixing" | "Not Available") => {
    const updatedValue: PropertySubmission = {
      ...value,
      condition,
      comments: condition === "Needs Fixing" ? value.comments || "" : null,
      photos: condition === "Needs Fixing" ? photos : [],
    };
    onChange(updatedValue);
    if (condition !== "Needs Fixing") {
      setPhotos([]);
    }
  };

  const handleCommentsChange = (comments: string) => {
    onChange({
      ...value,
      comments,
    });
  };

  const handlePhotosChange = (newPhotos: PhotoFile[]) => {
    setPhotos(newPhotos);
    onChange({
      ...value,
      photos: newPhotos.filter((p) => p.propertyId === property.id),
    });
  };

  const showDetails = value.condition === "Needs Fixing";

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div>
        <Label className="text-base font-semibold">{property.name}</Label>
        {property.description && (
          <p className="mt-1 text-sm text-gray-500">{property.description}</p>
        )}
        <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3 sm:gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`condition-${property.id}`}
              value="Good"
              checked={value.condition === "Good"}
              onChange={() => handleConditionChange("Good")}
              className="h-4 w-4 text-primary"
            />
            <span className="whitespace-nowrap">Good</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`condition-${property.id}`}
              value="Needs Fixing"
              checked={value.condition === "Needs Fixing"}
              onChange={() => handleConditionChange("Needs Fixing")}
              className="h-4 w-4 text-primary"
            />
            <span className="whitespace-nowrap">Needs Fixing</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`condition-${property.id}`}
              value="Not Available"
              checked={value.condition === "Not Available"}
              onChange={() => handleConditionChange("Not Available")}
              className="h-4 w-4 text-primary"
            />
            <span className="whitespace-nowrap">Not Available</span>
          </label>
        </div>
      </div>

      {showDetails && (
        <div className="space-y-4 pt-2 border-t">
          <div>
            <Label htmlFor={`comments-${property.id}`} className="text-sm">
              Comments <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id={`comments-${property.id}`}
              value={value.comments || ""}
              onChange={(e) => handleCommentsChange(e.target.value)}
              placeholder="Please describe the issue..."
              maxLength={VALIDATION_RULES.comments.maxLength}
              className="mt-1"
              aria-invalid={errors?.comments ? "true" : "false"}
              aria-describedby={errors?.comments ? `comments-error-${property.id}` : undefined}
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-muted-foreground">
                {(value.comments || "").length} / {VALIDATION_RULES.comments.maxLength} characters
              </p>
              {errors?.comments && (
                <p
                  id={`comments-error-${property.id}`}
                  className="text-xs text-destructive"
                  role="alert"
                >
                  {errors.comments}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label className="text-sm">Photos (Optional)</Label>
            <PhotoUpload
              propertyId={property.id}
              photos={photos}
              onPhotosChange={handlePhotosChange}
            />
            {errors?.photos && (
              <p className="mt-1 text-xs text-destructive" role="alert">
                {errors.photos}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


