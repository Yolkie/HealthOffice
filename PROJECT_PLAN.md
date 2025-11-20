# Monthly Office Health Check-Up Website - Detailed Plan

## 1. Project Overview

### 1.1 Purpose
A web application that allows users to conduct monthly office health check-ups by reporting on the condition of various office properties, uploading photos when repairs are needed, and automatically generating AI-processed summary reports via email.

### 1.2 Key Features
- Interactive form for reporting office property conditions
- Photo upload functionality for documenting issues
- Real-time form validation and user feedback
- Integration with n8n webhook for data processing
- AI-powered report generation
- Automated email delivery of summary reports

---

## 2. Technology Stack

### 2.1 Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Shadcn/ui or Radix UI
- **Form Handling**: React Hook Form with Zod validation
- **File Upload**: Custom implementation with preview capability
- **State Management**: React Context API or Zustand (if needed)

### 2.2 Backend/Integration
- **API Routes**: Next.js API Routes for webhook proxy
- **Webhook Integration**: n8n webhook endpoint
- **Image Processing**: Base64 encoding for photo uploads
- **Email Service**: Handled by n8n workflow

### 2.3 Development Tools
- **Package Manager**: npm or pnpm
- **Linting**: ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript strict mode

---

## 3. Architecture & Data Flow

### 3.1 System Architecture
```
User Browser
    ↓
Next.js Frontend (Form UI)
    ↓
Next.js API Route (Proxy/Validation)
    ↓
n8n Webhook Endpoint
    ↓
AI Processing (n8n workflow)
    ↓
Email Service (n8n workflow)
    ↓
Designated Email Address
```

### 3.2 Data Flow
1. User fills out the health check-up form
2. Form validates input client-side
3. Photos are converted to base64 or uploaded to temporary storage
4. Form data is sent to Next.js API route
5. API route validates and formats data
6. Data is forwarded to n8n webhook
7. n8n processes data with AI
8. Summary report is generated
9. Email is sent with report and attachments

---

## 4. Component Structure

### 4.1 Page Components
```
app/
├── page.tsx                    # Main landing page with form
├── layout.tsx                  # Root layout
├── api/
│   └── submit-checkup/
│       └── route.ts           # API route for form submission
└── components/
    ├── HealthCheckForm.tsx    # Main form component
    ├── PropertyItem.tsx       # Individual property row
    ├── PhotoUpload.tsx        # Photo upload component
    ├── PhotoPreview.tsx       # Photo preview component
    └── ui/                    # Shadcn/ui components
        ├── button.tsx
        ├── input.tsx
        ├── textarea.tsx
        ├── select.tsx
        └── card.tsx
```

### 4.2 Component Breakdown

#### 4.2.1 HealthCheckForm Component
- **Purpose**: Main container for the health check-up form
- **Features**:
  - Form state management
  - Validation handling
  - Submit functionality
  - Loading states
  - Success/error feedback

#### 4.2.2 PropertyItem Component
- **Purpose**: Individual office property row
- **Features**:
  - Property name display
  - Condition selector (Good/Needs Fixing)
  - Conditional comment field (shown when "Needs Fixing")
  - Photo upload trigger (shown when "Needs Fixing")

#### 4.2.3 PhotoUpload Component
- **Purpose**: Handle photo uploads
- **Features**:
  - Drag-and-drop support
  - File picker
  - Multiple file selection
  - Image preview
  - File size validation
  - Image compression (optional)

#### 4.2.4 PhotoPreview Component
- **Purpose**: Display uploaded photos
- **Features**:
  - Thumbnail display
  - Remove photo functionality
  - Full-size preview modal

---

## 5. Form Design & Fields

### 5.1 Form Structure

#### 5.1.1 Header Section
- Title: "Monthly Office Health Check-Up"
- Subtitle: Brief instructions
- Date: Auto-populated current date

#### 5.1.2 Office Properties Section
A list of common office properties with condition options:

**Properties List:**
1. Air Conditioning / HVAC
2. Lighting
3. Plumbing
4. Electrical Outlets
5. Windows & Doors
6. Flooring
7. Walls & Ceiling
8. Furniture
9. Kitchen Facilities
10. Restrooms
11. Parking Area
12. Security Systems
13. Internet/Network Connectivity
14. Fire Safety Equipment
15. Elevators (if applicable)

**For Each Property:**
- Property name (read-only)
- Condition selector: Radio buttons or toggle
  - "Good" (default)
  - "Needs Fixing"
- Comments field (conditional, shown when "Needs Fixing")
  - Textarea for detailed description
  - Character limit: 500 characters
- Photo upload (conditional, shown when "Needs Fixing")
  - Multiple photos allowed per property
  - Max file size: 5MB per photo
  - Accepted formats: JPG, PNG, WebP
  - Max photos per property: 5

#### 5.1.3 Additional Comments Section
- General comments textarea
- Character limit: 1000 characters

#### 5.1.4 Submission Section
- Submit button
- Loading indicator
- Success/error messages

### 5.2 Form Validation Rules

**Client-Side Validation:**
- At least one property must be marked as "Needs Fixing" if photos are uploaded
- Comments required when "Needs Fixing" is selected
- Photo file size: Max 5MB
- Photo format: JPG, PNG, WebP only
- Total form data size: Max 20MB

**Server-Side Validation:**
- Re-validate all client-side rules
- Sanitize text inputs
- Verify image files are valid
- Check webhook endpoint availability

---

## 6. API Integration

### 6.1 Next.js API Route Structure

**Endpoint**: `/api/submit-checkup`
**Method**: POST
**Content-Type**: application/json

**Request Body Format:**
```json
{
  "submissionDate": "2024-01-15T10:30:00Z",
  "properties": [
    {
      "id": "air-conditioning",
      "name": "Air Conditioning",
      "condition": "Needs Fixing",
      "comments": "Not cooling properly in the main office area.",
      "photos": [
        {
          "filename": "ac-unit-1.jpg",
          "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
          "mimeType": "image/jpeg"
        }
      ]
    },
    {
      "id": "lighting",
      "name": "Lighting",
      "condition": "Good",
      "comments": null,
      "photos": []
    }
  ],
  "additionalComments": "Overall office condition is good except for AC issues."
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Health check-up submitted successfully",
  "submissionId": "uuid-here"
}
```

### 6.2 n8n Webhook Integration

**Webhook Configuration:**
- Endpoint URL: Configured in environment variables
- Authentication: API key or token (if required)
- Method: POST
- Content-Type: application/json

**Data Transformation:**
- Format data according to n8n workflow requirements
- Include metadata (timestamp, user agent, etc.)
- Handle errors and retries

---

## 7. UI/UX Design

### 7.1 Design Principles
- **Clean & Minimal**: Uncluttered interface focusing on the form
- **Mobile-First**: Responsive design for all screen sizes
- **Accessible**: WCAG 2.1 AA compliance
- **Intuitive**: Clear labels and instructions
- **Feedback**: Visual feedback for all user actions

### 7.2 Color Scheme
- Primary: Professional blue (#2563eb)
- Success: Green (#10b981)
- Warning: Amber (#f59e0b)
- Error: Red (#ef4444)
- Background: Light gray (#f9fafb)
- Text: Dark gray (#111827)

### 7.3 Layout Structure
```
┌─────────────────────────────────────┐
│         Header (Logo/Title)         │
├─────────────────────────────────────┤
│   Monthly Office Health Check-Up    │
│   [Date: Auto-populated]            │
├─────────────────────────────────────┤
│                                     │
│   Office Properties Section         │
│   ┌─────────────────────────────┐   │
│   │ Property 1                  │   │
│   │ [○ Good] [● Needs Fixing]   │   │
│   │ [Comments textarea]          │   │
│   │ [Upload Photos]              │   │
│   └─────────────────────────────┘   │
│   ... (repeat for each property)    │
│                                     │
├─────────────────────────────────────┤
│   Additional Comments               │
│   [Large textarea]                  │
├─────────────────────────────────────┤
│   [Submit Button]                   │
└─────────────────────────────────────┘
```

### 7.4 Responsive Breakpoints
- Mobile: < 640px (single column, stacked)
- Tablet: 640px - 1024px (optimized layout)
- Desktop: > 1024px (full width, comfortable spacing)

### 7.5 User Experience Flow
1. User lands on page
2. Form loads with all properties listed
3. User reviews each property
4. For properties needing fixing:
   - Select "Needs Fixing"
   - Add comments
   - Upload photos (optional)
5. Add general comments (optional)
6. Click submit
7. Loading state shown
8. Success message displayed
9. Form can be reset or user can navigate away

---

## 8. Photo Upload Implementation

### 8.1 Upload Strategy
**Option 1: Base64 Encoding (Recommended for small files)**
- Convert images to base64 strings
- Include in JSON payload
- Simple implementation
- Limited by payload size

**Option 2: Temporary Storage + URLs**
- Upload to temporary storage (e.g., S3, Cloudinary)
- Send URLs in payload
- Better for large files
- Requires additional infrastructure

**Recommendation**: Start with base64, migrate to Option 2 if needed

### 8.2 Image Processing
- **Compression**: Compress images before upload (reduce file size by 60-80%)
- **Resizing**: Resize large images to max 1920x1080
- **Format**: Convert to JPEG for consistency
- **Validation**: Verify file is a valid image

### 8.3 Photo Preview
- Thumbnail grid display
- Click to view full size
- Remove photo option
- Loading indicator during upload

---

## 9. Security Considerations

### 9.1 Data Security
- **Input Sanitization**: Sanitize all text inputs
- **File Validation**: Verify file types and sizes
- **Rate Limiting**: Prevent spam submissions
- **CORS**: Configure proper CORS headers
- **HTTPS**: Enforce HTTPS in production

### 9.2 Privacy
- **Data Retention**: Define data retention policy
- **Photo Privacy**: Ensure photos are handled securely
- **GDPR Compliance**: Consider data protection regulations

### 9.3 Authentication (Optional)
- Consider adding authentication if needed
- API key protection for webhook
- CSRF protection

---

## 10. Error Handling

### 10.1 Client-Side Errors
- Form validation errors (display inline)
- File upload errors (show specific message)
- Network errors (retry mechanism)
- User-friendly error messages

### 10.2 Server-Side Errors
- Webhook failures (retry with exponential backoff)
- Invalid data (return specific error messages)
- Rate limiting (inform user)
- Logging for debugging

### 10.3 Error Messages
- Clear, actionable messages
- No technical jargon
- Suggest solutions when possible

---

## 11. Testing Strategy

### 11.1 Unit Tests
- Form validation logic
- Image processing functions
- Data transformation utilities

### 11.2 Integration Tests
- API route functionality
- Webhook integration
- End-to-end form submission

### 11.3 E2E Tests
- Complete user flow
- Photo upload scenarios
- Error handling scenarios

### 11.4 Manual Testing Checklist
- [ ] Form renders correctly on all devices
- [ ] All properties are listed
- [ ] Condition selection works
- [ ] Comments appear/disappear correctly
- [ ] Photo upload works
- [ ] Photo preview displays
- [ ] Form validation works
- [ ] Submit button works
- [ ] Success message displays
- [ ] Error handling works
- [ ] Mobile responsiveness

---

## 12. Environment Configuration

### 12.1 Environment Variables
```env
# n8n Webhook
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/office-health-checkup
N8N_WEBHOOK_KEY=your-api-key-here

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_MAX_FILE_SIZE=5242880  # 5MB in bytes
NEXT_PUBLIC_MAX_PHOTOS_PER_PROPERTY=5

# Email (if needed for direct email)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
```

---

## 13. n8n Workflow Design (Guidance)

### 13.1 Workflow Steps
1. **Webhook Trigger**: Receive form submission
2. **Data Parsing**: Extract and structure data
3. **AI Processing**: 
   - Analyze form data
   - Process images (if AI supports vision)
   - Generate summary report
   - Prioritize issues
4. **Report Generation**: Format summary report
5. **Email Composition**: Create email with report
6. **Email Delivery**: Send to designated address

### 13.2 AI Processing Considerations
- Use AI to:
  - Summarize all issues
  - Categorize issues by severity
  - Suggest priority actions
  - Extract key information from photos
- AI Model Options:
  - OpenAI GPT-4 Vision (for image analysis)
  - Claude (Anthropic)
  - Custom model via API

### 13.3 Email Template Structure
```
Subject: Monthly Office Health Check-Up Summary - [Date]

Body:
Dear [Recipient],

The monthly office health check-up has been completed. Below is a summary of findings:

[AI-Generated Summary]

Issues Requiring Attention:
1. [Priority] [Property Name]: [Description]
   - Photos: [attached]

2. [Priority] [Property Name]: [Description]
   - Photos: [attached]

Properties in Good Condition:
- [List of properties]

Recommendations:
[AI-generated recommendations]

Best regards,
Office Health Check-Up System
```

---

## 14. Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Set up Next.js project
- [ ] Configure TailwindCSS and UI components
- [ ] Create basic layout and structure
- [ ] Implement form component structure

### Phase 2: Form Development (Week 1-2)
- [ ] Create property list component
- [ ] Implement condition selection
- [ ] Add comments functionality
- [ ] Implement form validation

### Phase 3: Photo Upload (Week 2)
- [ ] Build photo upload component
- [ ] Implement image preview
- [ ] Add image compression
- [ ] Test file handling

### Phase 4: API Integration (Week 2-3)
- [ ] Create API route
- [ ] Implement data formatting
- [ ] Set up n8n webhook integration
- [ ] Add error handling

### Phase 5: Testing & Refinement (Week 3)
- [ ] Write unit tests
- [ ] Perform integration testing
- [ ] Test on multiple devices
- [ ] Fix bugs and optimize

### Phase 6: Deployment (Week 4)
- [ ] Set up production environment
- [ ] Configure environment variables
- [ ] Deploy application
- [ ] Test end-to-end workflow

---

## 15. Future Enhancements

### 15.1 Potential Features
- User authentication and history
- Dashboard for viewing past submissions
- Email notifications to submitter
- PDF report generation
- Multi-language support
- Property categories and filtering
- Search functionality
- Analytics dashboard

### 15.2 Performance Optimizations
- Image lazy loading
- Form data caching
- Progressive web app (PWA) support
- Offline capability

---

## 16. Success Metrics

### 16.1 Key Performance Indicators
- Form completion rate
- Average time to complete form
- Photo upload success rate
- Webhook delivery success rate
- User satisfaction (if feedback collected)

### 16.2 Monitoring
- Error rates
- API response times
- Webhook delivery times
- User session analytics

---

## 17. Documentation Requirements

### 17.1 Technical Documentation
- API documentation
- Component documentation
- Setup instructions
- Deployment guide

### 17.2 User Documentation
- User guide
- FAQ
- Troubleshooting guide

---

## 18. Maintenance Plan

### 18.1 Regular Tasks
- Monitor error logs
- Update dependencies
- Review and optimize performance
- Backup data (if stored)

### 18.2 Updates
- Security patches
- Feature enhancements
- Bug fixes
- UI/UX improvements

---

## Conclusion

This plan provides a comprehensive roadmap for building the Monthly Office Health Check-Up website. The implementation should follow modern web development best practices, prioritize user experience, and ensure reliable integration with the n8n workflow system.

The modular component structure allows for easy maintenance and future enhancements, while the responsive design ensures accessibility across all devices.


