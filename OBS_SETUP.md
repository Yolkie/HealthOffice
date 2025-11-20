# OBS (Object Storage Service) Configuration Guide

This guide explains how to configure Object Storage Service (OBS) for image uploads in the Office Health Check-Up application.

## Overview

The application supports uploading images to object storage services instead of embedding them as base64 strings. This provides several benefits:

- **Reduced payload size**: Images are stored separately, making form submissions lighter
- **Better performance**: Faster form submissions and loading
- **Scalability**: Object storage is designed for handling large files
- **Cost efficiency**: More efficient storage and bandwidth usage

## Supported Providers

- **AWS S3**: Amazon Web Services Simple Storage Service
- **Generic S3-compatible**: Any S3-compatible service (e.g., DigitalOcean Spaces, MinIO, etc.)
- **Azure Blob Storage**: Coming soon

## Configuration

### Step 1: Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Enable OBS
OBS_ENABLED=true

# Provider (aws-s3, azure-blob, or generic)
OBS_PROVIDER=aws-s3

# Bucket/Container name
OBS_BUCKET=your-bucket-name

# Region (for AWS S3)
OBS_REGION=us-east-1

# Endpoint (leave empty for AWS S3, required for S3-compatible services)
OBS_ENDPOINT=

# Access credentials
OBS_ACCESS_KEY_ID=your-access-key-id
OBS_SECRET_ACCESS_KEY=your-secret-access-key

# Optional: Path prefix for organizing files
OBS_PATH_PREFIX=office-health-checkup

# Optional: Custom public URL (if different from default)
OBS_PUBLIC_URL=https://your-cdn-domain.com
```

### Step 2: AWS S3 Setup

#### Create an S3 Bucket

1. Log in to AWS Console
2. Navigate to S3 service
3. Click "Create bucket"
4. Choose a unique bucket name
5. Select a region
6. Configure public access settings (if you want public URLs)

#### Create IAM User and Access Keys

1. Navigate to IAM service
2. Create a new user with programmatic access
3. Attach a policy with the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

4. Save the Access Key ID and Secret Access Key

#### Configure CORS (if needed)

Add CORS configuration to your bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

### Step 3: S3-Compatible Service Setup

For services like DigitalOcean Spaces, MinIO, or other S3-compatible storage:

1. Set `OBS_PROVIDER=generic`
2. Set `OBS_ENDPOINT` to your service endpoint (e.g., `https://nyc3.digitaloceanspaces.com`)
3. Configure bucket and credentials as above

### Step 4: Install Dependencies

The AWS SDK is already included in `package.json`. If you need to install it manually:

```bash
npm install @aws-sdk/client-s3
```

## How It Works

### Upload Flow

1. User selects an image in the form
2. Frontend checks if OBS is enabled via HEAD request to `/api/upload-image`
3. If enabled:
   - Image is uploaded to OBS via `/api/upload-image` endpoint
   - OBS returns a public URL
   - URL is stored in the form data
4. If disabled:
   - Image is compressed and converted to base64
   - Base64 string is embedded in the form data

### Form Submission

When the form is submitted:
- If OBS is used: Photos array contains `url` and `obsKey` fields
- If base64 is used: Photos array contains `base64` field
- The n8n webhook receives the appropriate format

## Testing

### Test OBS Configuration

1. Set `OBS_ENABLED=true` in `.env.local`
2. Configure all required OBS environment variables
3. Start the development server: `npm run dev`
4. Upload an image in the form
5. Check the browser console for any errors
6. Verify the image appears in your OBS bucket

### Fallback Behavior

If OBS is not configured or fails:
- The application automatically falls back to base64 encoding
- Users can still submit forms with images
- No functionality is lost

## Troubleshooting

### Images Not Uploading

1. **Check environment variables**: Ensure all required variables are set
2. **Verify credentials**: Test your access keys with AWS CLI or similar tool
3. **Check bucket permissions**: Ensure the IAM user has PutObject permission
4. **Review server logs**: Check console for error messages

### CORS Errors

If you see CORS errors in the browser:
- Configure CORS on your bucket
- Ensure your domain is allowed in CORS settings

### 503 Service Unavailable

If the upload endpoint returns 503:
- OBS is not enabled (`OBS_ENABLED=false`)
- Required environment variables are missing
- Check server logs for specific error messages

## Security Considerations

1. **Never commit credentials**: Keep `.env.local` in `.gitignore`
2. **Use IAM roles**: In production, consider using IAM roles instead of access keys
3. **Restrict permissions**: Only grant necessary S3 permissions
4. **Use HTTPS**: Always use HTTPS for API endpoints
5. **Validate files**: The application validates file types and sizes before upload

## Production Deployment

For production:

1. Set environment variables in your hosting platform (Vercel, AWS, etc.)
2. Ensure OBS credentials are secure and rotated regularly
3. Consider using environment-specific buckets
4. Set up monitoring for upload failures
5. Configure CDN if using custom public URL

## Disabling OBS

To disable OBS and use base64 encoding:

```env
OBS_ENABLED=false
```

The application will automatically use base64 encoding for all images.

