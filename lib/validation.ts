import { z } from "zod";
import { VALIDATION_RULES } from "./types";

export const propertySubmissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  condition: z.enum(["Good", "Needs Fixing", "Not Available"]),
  comments: z.string().nullable(),
  photos: z.array(
    z.object({
      filename: z.string(),
      base64: z.string().optional(),
      url: z.string().optional(),
      obsKey: z.string().optional(),
      mimeType: z.string(),
      size: z.number(),
      propertyId: z.string(),
      preview: z.string().optional(),
    }).refine(
      (data) => data.base64 || data.url,
      {
        message: "Photo must have either base64 data or OBS URL",
      }
    )
  ),
}).refine(
  (data) => {
    if (data.condition === "Needs Fixing") {
      return data.comments !== null && data.comments.trim().length > 0;
    }
    return true;
  },
  {
    message: "Comments are required when condition is 'Needs Fixing'",
    path: ["comments"],
  }
).refine(
  (data) => {
    if (data.comments) {
      return data.comments.length <= VALIDATION_RULES.comments.maxLength;
    }
    return true;
  },
  {
    message: `Comments must not exceed ${VALIDATION_RULES.comments.maxLength} characters`,
    path: ["comments"],
  }
).refine(
  (data) => {
    // If condition is "Not Available", clear comments and photos
    if (data.condition === "Not Available") {
      return true;
    }
    return true;
  }
);

export const formSubmissionSchema = z.object({
  branchName: z
    .string()
    .min(1, "Branch name is required")
    .max(120, "Branch name must not exceed 120 characters"),
  submissionDate: z.string().datetime(),
  properties: z.array(propertySubmissionSchema).min(1),
  additionalComments: z
    .string()
    .nullable()
    .refine(
      (val) => !val || val.length <= VALIDATION_RULES.additionalComments.maxLength,
      {
        message: `Additional comments must not exceed ${VALIDATION_RULES.additionalComments.maxLength} characters`,
      }
    ),
  metadata: z
    .object({
      userAgent: z.string().optional(),
      screenResolution: z.string().optional(),
      timezone: z.string().optional(),
    })
    .optional(),
}).refine(
  (data) => {
    const totalSize = data.properties.reduce((sum, prop) => {
      return sum + prop.photos.reduce((photoSum, photo) => photoSum + photo.size, 0);
    }, 0);
    return totalSize <= VALIDATION_RULES.photos.maxTotalSize;
  },
  {
    message: `Total photo size exceeds ${VALIDATION_RULES.photos.maxTotalSize / 1024 / 1024}MB limit`,
    path: ["properties"],
  }
);

export type FormSubmissionInput = z.infer<typeof formSubmissionSchema>;


