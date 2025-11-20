# Monthly Office Health Check-Up Website

A web application for conducting monthly office health check-ups, reporting property conditions, uploading photos, and generating AI-processed summary reports.

## 📋 Overview

This application allows users to:
- Report on the condition of various office properties
- Upload photos when repairs are needed
- Submit data to n8n for AI processing
- Receive automated email summary reports

## 🏗️ Project Structure

```
OfficeHealth/
├── PROJECT_PLAN.md          # Detailed implementation plan
├── README.md                # This file
└── [Future implementation files]
```

## 📚 Documentation

For detailed planning information, see **[PROJECT_PLAN.md](./PROJECT_PLAN.md)**

The project plan includes:
- Technology stack and architecture
- Component structure and design
- Form fields and validation rules
- API integration specifications
- UI/UX design guidelines
- Security considerations
- Testing strategy
- Implementation phases

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm, yarn, or pnpm package manager

### Installation

1. **Install dependencies:**
```bash
npm install
# or
pnpm install
# or
yarn install
```

2. **Configure environment variables:**
   
   Copy the environment template file:
   ```bash
   cp env.template .env.local
   ```
   
   Edit `.env.local` and add your n8n webhook configuration:
   ```env
   N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/office-health-checkup
   N8N_WEBHOOK_KEY=your-api-key-here
   DATABASE_URL="file:./prisma/data.db"
   ```
   
   **Note:** For local testing without n8n, you can leave these empty. The form will still work but submissions will fail (which is expected for testing the UI).

3. **Create the SQLite database (one time per environment):**
```bash
npx prisma db push
```

4. **Run development server:**
```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

## 🐳 Docker

You can run the app in a container on your Ubuntu server.

### Build image

```bash
docker build -t office-health-checkup .
```

### Run container

```bash
docker run -d \
  -p 3000:3000 \
  --name office-health \
  --env-file .env.local \
  office-health-checkup
```

## 🛠️ Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Shadcn/ui
- **Form Handling**: React Hook Form + Zod
- **Integration**: n8n Webhook

## 📝 Key Features

- ✅ Interactive health check-up form
- ✅ Reporter name, branch, and timeframe capture so each submission is traceable
- ✅ Guided property instructions so inspectors know exactly what to check
- ✅ Multiple office property reporting
- ✅ Photo upload with preview
- ✅ Real-time form validation
- ✅ Admin panel at `/admin` with submission history and “needs fixing” tracker
- ✅ n8n webhook integration
- ✅ AI-powered report generation
- ✅ Automated email delivery

## 🔄 Data Flow

```
User Form → Next.js API → n8n Webhook → AI Processing → Email Report
```

## 📦 Form Submission Format

```json
{
  "reporterName": "Juan Dela Cruz",
  "branchName": "Head Office",
  "dateStarted": "2024-01-01",
  "dateEnded": "2024-01-05",
  "submissionDate": "2024-01-15T10:30:00Z",
  "properties": [
    {
      "id": "aircon",
      "name": "Aircon",
      "condition": "Needs Fixing",
      "comments": "Not cooling properly.",
      "photos": [
        {
          "filename": "ac-unit.jpg",
          "base64": "data:image/jpeg;base64,...",
          "mimeType": "image/jpeg"
        }
      ]
    }
  ],
  "additionalComments": "General comments here"
}
```

## 🗂️ Admin Panel (`/admin`)

- Accessible by navigating directly to `/admin` (not linked from the main UI)
- Shows a master list of reporters who have submitted check-ups
- Clicking a name reveals their full submission history, including:
  - Submission date, branch, inspection timeframe
  - All properties marked **Needs Fixing**, with comments and photo links
- Data is backed by a SQLite database via Prisma (run `npx prisma db push` before first use)
- Photo binaries stay in object storage; the database only stores metadata/paths

## 🔐 Security

- Input sanitization
- File type and size validation
- Rate limiting
- HTTPS enforcement
- Secure webhook communication

## 📱 Responsive Design

- Mobile-first approach
- Works on all screen sizes
- Touch-friendly interface
- Accessible (WCAG 2.1 AA)

## 🧪 Testing

- Unit tests for validation logic
- Integration tests for API routes
- E2E tests for complete user flow
- Manual testing checklist included

## 📅 Implementation Timeline

See [PROJECT_PLAN.md](./PROJECT_PLAN.md) for detailed phases:
- Phase 1: Foundation
- Phase 2: Form Development
- Phase 3: Photo Upload
- Phase 4: API Integration
- Phase 5: Testing & Refinement
- Phase 6: Deployment

## 📁 Project Structure

```
OfficeHealth/
├── app/
│   ├── api/
│   │   └── submit-checkup/
│   │       └── route.ts          # API endpoint for form submission
│   ├── globals.css               # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main page
├── components/
│   ├── ui/                      # Shadcn/ui components
│   ├── HealthCheckForm.tsx      # Main form component
│   ├── PropertyItem.tsx         # Individual property row
│   ├── PhotoUpload.tsx          # Photo upload component
│   └── PhotoPreview.tsx         # Photo preview component
├── lib/
│   ├── types.ts                 # TypeScript types
│   ├── validation.ts            # Zod schemas
│   ├── image-utils.ts           # Image processing utilities
│   └── utils.ts                 # Utility functions
├── PROJECT_PLAN.md              # Detailed implementation plan
├── TECHNICAL_SPEC.md            # Technical specifications
└── README.md                    # This file
```

## 🧪 Testing Locally

1. **Test the form UI:**
   - Fill out the form with different property conditions
   - Upload photos to test the image upload functionality
   - Test form validation by submitting without required fields

2. **Test without n8n webhook:**
   - The form will work but submissions will show an error (expected)
   - This allows you to test the UI and form validation

3. **Test with n8n webhook:**
   - Set up your n8n webhook URL in `.env.local`
   - Submit the form and verify data is sent correctly
   - Check your n8n workflow receives the data

## 🤝 Contributing

The project is fully implemented and ready for use. For development guidelines, see `PROJECT_PLAN.md`.

## 📄 License

[To be determined]

---

For detailed information, please refer to **[PROJECT_PLAN.md](./PROJECT_PLAN.md)**

