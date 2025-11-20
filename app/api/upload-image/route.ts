import { NextRequest, NextResponse } from "next/server";
import { uploadToOBS } from "@/lib/obs-upload";
import { getOBSConfig } from "@/lib/obs-config";
import { VALIDATION_RULES } from "@/lib/types";

export async function HEAD() {
  // Check if OBS is enabled
  const config = getOBSConfig();
  if (!config) {
    return new NextResponse(null, { status: 503 });
  }
  return new NextResponse(null, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    // Check if OBS is enabled
    const config = getOBSConfig();
    if (!config) {
      return NextResponse.json(
        {
          success: false,
          error: "OBS is not configured",
          message: "Object storage is not enabled or configured",
        },
        { status: 503 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const propertyId = formData.get("propertyId") as string;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No file provided",
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!VALIDATION_RULES.photos.allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type",
          message: `Allowed types: ${VALIDATION_RULES.photos.allowedTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > VALIDATION_RULES.photos.maxFileSize) {
      return NextResponse.json(
        {
          success: false,
          error: "File too large",
          message: `File size exceeds ${VALIDATION_RULES.photos.maxFileSize / 1024 / 1024}MB limit`,
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to OBS
    const result = await uploadToOBS(buffer, file.name, file.type);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Upload failed",
          message: result.error || "Failed to upload to object storage",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        url: result.url,
        key: result.key,
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        propertyId: propertyId || "",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

