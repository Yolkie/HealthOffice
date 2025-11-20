export interface OfficeProperty {
  id: string;
  name: string;
  category?: string;
}

export interface PhotoFile {
  filename: string;
  base64?: string; // Fallback if OBS is not used
  url?: string; // OBS URL if uploaded to object storage
  mimeType: string;
  size: number;
  propertyId: string;
  preview?: string;
  obsKey?: string; // OBS object key for reference
}

export interface PropertySubmission {
  id: string;
  name: string;
  condition: "Good" | "Needs Fixing" | "Not Available";
  comments: string | null;
  photos: PhotoFile[];
}

export interface FormSubmission {
  branchName: string;
  submissionDate: string;
  properties: PropertySubmission[];
  additionalComments: string | null;
  metadata?: {
    userAgent?: string;
    screenResolution?: string;
    timezone?: string;
  };
}

export const OFFICE_PROPERTIES: OfficeProperty[] = [
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

export const OFFICE_BRANCHES: string[] = [
  "Head Office",
  "Branch A",
  "Branch B",
  "Warehouse",
  "Others",
];

export const VALIDATION_RULES = {
  comments: {
    maxLength: 500,
    required: true,
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


