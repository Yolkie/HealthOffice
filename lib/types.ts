export interface OfficeProperty {
  id: string;
  name: string;
  description?: string;
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
  reporterName: string;
  branchName: string;
  dateStarted: string;
  dateEnded: string;
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
  {
    id: "electrical-outlets-switches",
    name: "Electrical Outlets & Switches",
    description:
      "Check for firm mounting, no burn marks, no loose covers, and confirm switches/outlets operate properly.",
  },
  {
    id: "network-data-ports",
    name: "Network & Data Ports",
    description:
      "Ensure ports are intact, not loose, and free from dust. Confirm labels are readable and cables fit securely.",
  },
  {
    id: "cctv-cameras-tv-printers",
    name: "CCTV Cameras, TV, Printers",
    description:
      "Verify devices power on, cables are secure, and lenses/screens are clean. Note any unusual noise, blinking indicators, or offline status.",
  },
  {
    id: "signage-logo-wall",
    name: "Signage / Logo Wall",
    description: "Check for dirt, peeling pieces, loose mounting, or dim/failed lights.",
  },
  {
    id: "aircon",
    name: "Aircon",
    description:
      "Ensure proper cooling, steady airflow, no unusual noise, and no visible leaks.",
  },
  {
    id: "aircon-tambol",
    name: "Aircon Tambol",
    description:
      "Check the container/pan for water levels, proper drainage, and ensure there is no overflow or foul smell.",
  },
  {
    id: "tables",
    name: "Tables",
    description: "Test stability, check for wobbling, loose screws, scratches, or surface damage.",
  },
  {
    id: "chairs",
    name: "Chairs",
    description:
      "Inspect wheels, hydraulics, screws, and armrests. Ensure height adjustment works and chair is stable.",
  },
  {
    id: "cabinets",
    name: "Cabinets",
    description: "Check hinges, locks, handles, and sliding tracks. Ensure doors open/close smoothly.",
  },
  {
    id: "light-fixtures",
    name: "Light Fixtures",
    description: "Verify bulbs/tubes are working, covers are intact, and no flickering is present.",
  },
  {
    id: "blinds-curtains",
    name: "Blinds / Curtains",
    description: "Test opening/closing, check for misalignment, tears, or jammed mechanisms.",
  },
  {
    id: "walls-ceiling",
    name: "Walls & Ceiling",
    description: "Look for cracks, stains, peeling paint, or signs of leaks.",
  },
  {
    id: "carpet",
    name: "Carpet",
    description: "Check for stains, tears, uneven patches, or loose edges.",
  },
  {
    id: "door",
    name: "Door",
    description:
      "Inspect hinges, locks, and alignment. Ensure smooth opening/closing with no unusual resistance.",
  },
  {
    id: "reception-counter",
    name: "Reception Counter",
    description:
      "Check stability, cleanliness, and any loose panels, screws, or chipped surfaces.",
  },
  {
    id: "glass-panels-windows",
    name: "Glass Panels & Windows",
    description:
      "Check for cracks, chips, loose frames, and ensure they open/close properly if operable.",
  },
  {
    id: "flooring-tiles-vinyl",
    name: "Flooring (Tiles / Vinyl)",
    description:
      "Inspect for cracks, lifting edges, uneven surfaces, or stains.",
  },
  {
    id: "pest-control-signs",
    name: "Pest Control Signs",
    description:
      "Ensure signs are visible, intact, and not tampered with. Replace if faded or missing.",
  },
];

export const BRANCH_OPTIONS = [
  "Iloilo Branch",
  "Pampanga Branch",
  "Cebu Branch",
  "Davao Branch",
  "Head Office",
  "Lipa Branch",
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


