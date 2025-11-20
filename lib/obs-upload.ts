import { OBSConfig, getOBSConfig } from "./obs-config";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export interface UploadResult {
  url: string;
  key: string;
  success: boolean;
  error?: string;
}

export const uploadToOBS = async (
  file: Buffer,
  filename: string,
  contentType: string
): Promise<UploadResult> => {
  const config = getOBSConfig();

  if (!config) {
    throw new Error("OBS is not configured or enabled");
  }

  try {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `${config.pathPrefix}/${timestamp}-${sanitizedFilename}`;

    if (config.provider === "aws-s3" || config.provider === "generic") {
      return await uploadToS3(config, file, key, contentType);
    } else if (config.provider === "azure-blob") {
      // Azure Blob Storage implementation would go here
      throw new Error("Azure Blob Storage not yet implemented");
    } else {
      throw new Error(`Unsupported OBS provider: ${config.provider}`);
    }
  } catch (error) {
    console.error("OBS upload error:", error);
    return {
      url: "",
      key: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

const uploadToS3 = async (
  config: OBSConfig,
  file: Buffer,
  key: string,
  contentType: string
): Promise<UploadResult> => {
  const s3Client = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: config.provider === "generic", // For S3-compatible services
  });

  try {
    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: "public-read", // Make files publicly accessible
    });

    await s3Client.send(command);

    // Construct public URL
    let url: string;
    if (config.publicUrl) {
      url = `${config.publicUrl}/${key}`;
    } else if (config.endpoint) {
      url = `${config.endpoint}/${config.bucket}/${key}`;
    } else {
      url = `https://${config.bucket}.s3.${config.region}.amazonaws.com/${key}`;
    }

    return {
      url,
      key,
      success: true,
    };
  } catch (error) {
    console.error("S3 upload error:", error);
    throw error;
  }
};

