# Setup Guide

## Quick Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
```bash
# Copy the template
cp env.template .env.local

# Edit .env.local and add your n8n webhook URL (optional for local testing)
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Open Browser
Navigate to: http://localhost:3000

## Testing Without n8n Webhook

You can test the application locally without configuring the n8n webhook:

1. The form UI will work perfectly
2. You can fill out all fields
3. You can upload photos
4. Form validation will work
5. When you submit, you'll see an error (expected) - this is because the webhook URL is not configured

To test the full flow, you'll need to:
1. Set up an n8n instance
2. Create a webhook workflow
3. Add the webhook URL to `.env.local`

## Environment Variables

### Required (for full functionality)
- `N8N_WEBHOOK_URL` - Your n8n webhook endpoint URL

### Optional
- `N8N_WEBHOOK_KEY` - API key for webhook authentication (if required)
- `NEXT_PUBLIC_APP_URL` - Application URL (defaults to localhost:3000)
- `NEXT_PUBLIC_MAX_FILE_SIZE` - Max file size in bytes (default: 5MB)
- `NEXT_PUBLIC_MAX_PHOTOS_PER_PROPERTY` - Max photos per property (default: 5)

## Troubleshooting

### Port Already in Use
If port 3000 is in use, Next.js will automatically use the next available port.

### Build Errors
Make sure you have Node.js 18+ installed:
```bash
node --version
```

### TypeScript Errors
Run type checking:
```bash
npx tsc --noEmit
```

## Next Steps

1. Test the form locally
2. Configure your n8n webhook
3. Test the full submission flow
4. Customize the office properties list in `lib/types.ts` if needed


