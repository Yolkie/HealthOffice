"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhotoFile } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PhotoPreviewProps {
  photos: PhotoFile[];
  onRemove: (index: number) => void;
  propertyId: string;
}

export const PhotoPreview: React.FC<PhotoPreviewProps> = ({
  photos,
  onRemove,
  propertyId,
}) => {
  const [previewIndex, setPreviewIndex] = React.useState<number | null>(null);

  const filteredPhotos = photos.filter((photo) => photo.propertyId === propertyId);

  if (filteredPhotos.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4">
        {filteredPhotos.map((photo, index) => {
          const actualIndex = photos.indexOf(photo);
          return (
            <div key={actualIndex} className="relative group">
              <div className="relative aspect-square overflow-hidden rounded-md border">
                <img
                  src={photo.preview || photo.url || photo.base64 || ""}
                  alt={photo.filename}
                  className="h-full w-full object-cover cursor-pointer"
                  onClick={() => setPreviewIndex(actualIndex)}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(actualIndex);
                  }}
                  aria-label={`Remove ${photo.filename}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground truncate">
                {photo.filename}
              </p>
            </div>
          );
        })}
      </div>

      {previewIndex !== null && (
        <Dialog open={previewIndex !== null} onOpenChange={() => setPreviewIndex(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{photos[previewIndex]?.filename}</DialogTitle>
            </DialogHeader>
            <div className="relative w-full h-[70vh]">
              <img
                src={photos[previewIndex]?.preview || photos[previewIndex]?.url || photos[previewIndex]?.base64 || ""}
                alt={photos[previewIndex]?.filename}
                className="h-full w-full object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

