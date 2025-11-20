export interface OBSConfig {
  provider: "aws-s3" | "azure-blob" | "generic";
  enabled: boolean;
  endpoint?: string;
  region?: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  pathPrefix?: string;
  publicUrl?: string;
}

const normalizeUrl = (url?: string) => {
  if (!url) {
    return undefined;
  }

  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

export const getOBSConfig = (): OBSConfig | null => {
  const enabled = process.env.OBS_ENABLED === "true";
  
  if (!enabled) {
    return null;
  }

  const provider = (process.env.OBS_PROVIDER || "aws-s3") as "aws-s3" | "azure-blob" | "generic";
  const bucket = process.env.OBS_BUCKET;
  const accessKeyId = process.env.OBS_ACCESS_KEY_ID || "";
  const secretAccessKey = process.env.OBS_SECRET_ACCESS_KEY || "";

  if (!bucket || !accessKeyId || !secretAccessKey) {
    console.warn("OBS is enabled but configuration is incomplete");
    return null;
  }

  return {
    provider,
    enabled: true,
    endpoint: normalizeUrl(process.env.OBS_ENDPOINT),
    region: process.env.OBS_REGION || "us-east-1",
    bucket,
    accessKeyId,
    secretAccessKey,
    pathPrefix: process.env.OBS_PATH_PREFIX || "office-health-checkup",
    publicUrl: normalizeUrl(process.env.OBS_PUBLIC_URL),
  };
};

