# Technical Specifications

## Form Field Specifications

### Office Properties List

```typescript
interface OfficeProperty {
  id: string;
  name: string;
  category?: string;
}

const OFFICE_PROPERTIES: OfficeProperty[] = [
  { id: "electrical-outlets-switches", name: "Electrical Outlets & Switches" },
  { id: "network-data-ports", name: "Network & Data Ports" },
  { id: "cctv-cameras-tv-printers", name: "CCTV Cameras, TV, Printers" },
  { id: "signage-logo-wall", name: "Signage / Logo Wall" },
  { id: "aircon", name: "Aircon" },
  { id: "aircon-tambol", name: "Aircon Tambol" },
  { id: "tables", name: "Tables" },
  { id: "chairs", name: "Chairs" },
  { id: "cabinets", name: "Cabinets" },
  { id: "light-fixtures", name: "Light Fixtures" },
  { id: "blinds-curtains", name: "Blinds / Curtains" },
  { id: "walls-ceiling", name: "Walls & Ceiling" },
  { id: "carpet", name: "Carpet" },
  { id: "door", name: "Door" },
  { id: "reception-counter", name: "Reception Counter" },
  { id: "glass-panels-windows", name: "Glass Panels & Windows" },
  { id: "flooring-tiles-vinyl", name: "Flooring (Tiles / Vinyl)" },
  { id: "pest-control-signs", name: "Pest Control Signs" },
];

const BRANCH_OPTIONS = [
  "Iloilo Branch",
  "Pampanga Branch",
  "Cebu Branch",
  "Davao Branch",
  "Head Office",
];
```

### Form Data Structure

```typescript
interface PropertySubmission {
  id: string;
  name: string;
  condition: "Good" | "Needs Fixing" | "Not Available";
  comments: string | null;
  photos: PhotoFile[];
}

interface PhotoFile {
  filename: string;
  base64?: string;
  url?: string;
  mimeType: string;
  size: number;
  propertyId: string;
  preview?: string;
  obsKey?: string;
}

interface FormSubmission {
  reporterName: string;
  branchName: string;
  submissionDate: string; // ISO 8601 format
  properties: PropertySubmission[];
  additionalComments: string | null;
  metadata?: {
    userAgent?: string;
    screenResolution?: string;
    timezone?: string;
  };
}
```

### Validation Rules

```typescript
const VALIDATION_RULES = {
  comments: {
    maxLength: 500,
    required: true, // when condition is "Needs Fixing"
  },
  additionalComments: {
    maxLength: 1000,
    required: false,
  },
  photos: {
    maxPerProperty: 5,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    maxTotalSize: 20 * 1024 * 1024, // 20MB total
  },
};
```

---

## API Specifications

### POST /api/submit-checkup

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```typescript
{
  reporterName: string;
  branchName: string;
  submissionDate: string; // ISO 8601
  properties: PropertySubmission[];
  additionalComments: string | null;
  metadata?: {
    userAgent?: string;
    screenResolution?: string;
    timezone?: string;
  };
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Health check-up submitted successfully",
  "submissionId": "uuid-v4",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "properties[0].comments",
      "message": "Comments are required when condition is 'Needs Fixing'"
    }
  ]
}
```

**413 Payload Too Large**
```json
{
  "success": false,
  "error": "Total payload size exceeds 20MB limit"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Failed to submit to webhook",
  "message": "Webhook endpoint unavailable"
}
```

**503 Service Unavailable**
```json
{
  "success": false,
  "error": "Service temporarily unavailable",
  "retryAfter": 60
}
```

---

## n8n Webhook Payload Format

### Expected Input Format

```json
{
  "reporterName": "Juan Dela Cruz",
  "branchName": "Head Office",
  "submissionDate": "2024-01-15T10:30:00Z",
  "properties": [
    {
      "id": "aircon",
      "name": "Aircon",
      "condition": "Needs Fixing",
      "comments": "Not cooling properly in the main office area. Temperature is consistently above 75°F.",
      "photos": [
        {
          "filename": "ac-unit-main-20240115.jpg",
          "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
          "mimeType": "image/jpeg",
          "size": 245678,
          "propertyId": "aircon"
        }
      ]
    },
    {
      "id": "light-fixtures",
      "name": "Light Fixtures",
      "condition": "Good",
      "comments": null,
      "photos": []
    }
  ],
  "additionalComments": "Overall office condition is good. Main concern is the AC system which needs immediate attention.",
  "metadata": {
    "userAgent": "Mozilla/5.0...",
    "screenResolution": "1920x1080",
    "timezone": "America/New_York"
  }
}
```

### Expected Output Format (for AI Processing)

The n8n workflow should process this data and generate:

```json
{
  "summary": {
    "totalProperties": 15,
    "propertiesInGoodCondition": 14,
    "propertiesNeedingFixing": 1,
    "totalPhotos": 2,
    "priorityIssues": [
      {
        "property": "Air Conditioning",
        "severity": "High",
        "description": "AC system not cooling properly",
        "recommendation": "Schedule HVAC technician inspection"
      }
    ]
  },
  "report": {
    "text": "AI-generated summary text...",
    "html": "<html>...</html>",
    "markdown": "Markdown formatted report..."
  }
}
```

---

## Image Processing Specifications

### Base64 Encoding Format
```
data:image/{mimeType};base64,{base64String}
```

### Image Compression Settings
```typescript
const COMPRESSION_SETTINGS = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8, // 80% quality
  format: "image/jpeg",
};
```

### File Size Calculation
```typescript
// Before compression: Original file size
// After compression: Target ~60-80% reduction
// Example: 5MB → ~1-2MB
```

---

## Email Template Specifications

### Email Structure

**Subject Line:**
```
Monthly Office Health Check-Up Summary - {Date}
```

**From:**
```
Office Health Check-Up System <noreply@yourdomain.com>
```

**To:**
```
{Designated Email Address}
```

**Body Format:**
```
Dear [Recipient],

The monthly office health check-up has been completed on {Date}.

SUMMARY
-------
Total Properties Checked: {count}
Properties in Good Condition: {count}
Properties Needing Attention: {count}
Total Photos Submitted: {count}

ISSUES REQUIRING ATTENTION
--------------------------
{AI-generated prioritized list}

PROPERTIES IN GOOD CONDITION
----------------------------
{List of properties}

RECOMMENDATIONS
---------------
{AI-generated recommendations}

Please see attached photos for detailed documentation.

Best regards,
Office Health Check-Up System
```

**Attachments:**
- All submitted photos organized by property
- Optional: PDF summary report

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Form validation failed |
| `FILE_TOO_LARGE` | 413 | File size exceeds limit |
| `INVALID_FILE_TYPE` | 400 | File type not allowed |
| `WEBHOOK_ERROR` | 502 | n8n webhook unavailable |
| `PROCESSING_ERROR` | 500 | Internal processing error |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

---

## Rate Limiting

```typescript
const RATE_LIMITS = {
  submissions: {
    window: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 submissions per hour
  },
  photoUploads: {
    window: 60 * 1000, // 1 minute
    max: 20, // 20 photos per minute
  },
};
```

---

## Environment Variables

```env
# Required
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/office-health-checkup
N8N_WEBHOOK_KEY=your-api-key-here

# Optional
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
NEXT_PUBLIC_MAX_PHOTOS_PER_PROPERTY=5
NEXT_PUBLIC_MAX_TOTAL_SIZE=20971520

# Development
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
```

---

## Component Props Interfaces

### HealthCheckForm Props
```typescript
interface HealthCheckFormProps {
  onSubmit?: (data: FormSubmission) => void;
  onError?: (error: Error) => void;
  initialData?: Partial<FormSubmission>;
}
```

### PropertyItem Props
```typescript
interface PropertyItemProps {
  property: OfficeProperty;
  value: PropertySubmission;
  onChange: (value: PropertySubmission) => void;
  errors?: ValidationError[];
}
```

### PhotoUpload Props
```typescript
interface PhotoUploadProps {
  propertyId: string;
  maxFiles?: number;
  maxSize?: number;
  acceptedTypes?: string[];
  onUpload: (files: PhotoFile[]) => void;
  existingPhotos?: PhotoFile[];
}
```

---

## State Management

### Form State Structure
```typescript
interface FormState {
  properties: Map<string, PropertySubmission>;
  additionalComments: string;
  photos: Map<string, PhotoFile[]>; // key: propertyId
  isSubmitting: boolean;
  errors: ValidationError[];
  touched: Set<string>;
}
```

### Validation State
```typescript
interface ValidationError {
  field: string;
  message: string;
  code: string;
}
```

---

## Accessibility Requirements

### ARIA Labels
- All form inputs must have proper labels
- Error messages must be associated with inputs
- Photo upload areas must have descriptive labels
- Submit button must indicate loading state

### Keyboard Navigation
- Tab order must be logical
- All interactive elements must be keyboard accessible
- Focus indicators must be visible
- Escape key closes modals/previews

### Screen Reader Support
- Form sections must have proper headings
- Dynamic content changes must be announced
- Error messages must be announced immediately
- Success messages must be announced

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Initial Load Time | < 2 seconds |
| Form Interaction Response | < 100ms |
| Photo Upload Start | < 500ms |
| Photo Compression | < 2 seconds per image |
| Form Submission | < 3 seconds |
| API Response Time | < 1 second |

---

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari, Chrome Mobile

---

## Security Headers

```typescript
const SECURITY_HEADERS = {
  "Content-Security-Policy": "default-src 'self'",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};
```

---

This technical specification should be used as a reference during implementation to ensure consistency and correctness.


