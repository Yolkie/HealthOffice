"use client";

import * as React from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhotoFile, VALIDATION_RULES } from "@/lib/types";
import { processImageFile, validateImageFile, fileToBase64 } from "@/lib/image-utils";
import { PhotoPreview } from "./PhotoPreview";

interface PhotoUploadProps {
  propertyId: string;
  photos: PhotoFile[];
  onPhotosChange: (photos: PhotoFile[]) => void;
  maxFiles?: number;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  propertyId,
  photos,
  onPhotosChange,
  maxFiles = VALIDATION_RULES.photos.maxPerProperty,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const propertyPhotos = photos.filter((photo) => photo.propertyId === propertyId);
  const remainingSlots = maxFiles - propertyPhotos.length;

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    setIsProcessing(true);

    try {
      const newFiles: PhotoFile[] = [];
      const filesArray = Array.from(files);

      if (propertyPhotos.length + filesArray.length > maxFiles) {
        throw new Error(`Maximum ${maxFiles} photos allowed per property`);
      }

      // Check if OBS is enabled
      const obsEnabled = await checkOBSEnabled();

      for (const file of filesArray) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        let processedPhoto: PhotoFile;

        if (obsEnabled) {
          // Upload to OBS
          processedPhoto = await uploadToOBS(file, propertyId);
        } else {
          // Fallback to base64
          processedPhoto = await processImageFile(file, propertyId);
        }

        newFiles.push(processedPhoto);
      }

      const updatedPhotos = [...photos, ...newFiles];
      onPhotosChange(updatedPhotos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process images");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const checkOBSEnabled = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/upload-image", {
        method: "HEAD",
      });
      return response.status !== 503;
    } catch {
      return false;
    }
  };

  const uploadToOBS = async (file: File, propertyId: string): Promise<PhotoFile> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("propertyId", propertyId);

    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to upload to object storage");
    }

    const result = await response.json();

    // Create preview from file for immediate display
    const preview = await fileToBase64(file);

    return {
      filename: result.filename || file.name,
      url: result.url,
      obsKey: result.key,
      mimeType: result.mimeType || file.type,
      size: result.size || file.size,
      propertyId,
      preview,
    };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const handleRemovePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(updatedPhotos);
  };

  if (remainingSlots <= 0) {
    return (
      <div className="mt-4">
        <p className="text-sm text-muted-foreground mb-2">
          Maximum {maxFiles} photos reached for this property
        </p>
        <PhotoPreview
          photos={photos}
          onRemove={handleRemovePhoto}
          propertyId={propertyId}
        />
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        }`}
      >
        <Upload className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mb-2" />
        <p className="text-xs sm:text-sm text-muted-foreground mb-2">
          Drag and drop photos here, or click to select
        </p>
        <p className="text-xs text-muted-foreground mb-3 sm:mb-4">
          Up to {remainingSlots} more photo{remainingSlots !== 1 ? "s" : ""} (Max 5MB each, JPG/PNG/WebP)
        </p>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileInputChange}
          disabled={isProcessing}
          className="hidden"
          id={`photo-upload-${propertyId}`}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Select Photos"}
        </Button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {propertyPhotos.length > 0 && (
        <PhotoPreview
          photos={photos}
          onRemove={handleRemovePhoto}
          propertyId={propertyId}
        />
      )}
    </div>
  );
};


