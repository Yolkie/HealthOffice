import { z } from "zod";
import { BRANCH_OPTIONS, VALIDATION_RULES } from "./types";

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

const isValidDate = (value: string) => {
  if (!value) {
    return false;
  }

  const timestamp = Date.parse(value);
  return !Number.isNaN(timestamp);
};

export const formSubmissionSchema = z.object({
  reporterName: z
    .string()
    .min(2, "Name is required")
    .max(150, "Name must not exceed 150 characters"),
  branchName: z.enum(BRANCH_OPTIONS as [string, ...string[]], {
    errorMap: () => ({ message: "Please select a branch" }),
  }),
  dateStarted: z
    .string()
    .refine(isValidDate, "Please provide a valid start date"),
  dateEnded: z
    .string()
    .refine(isValidDate, "Please provide a valid end date"),
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
})
  .refine(
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
  )
  .refine(
    (data) => {
      if (!isValidDate(data.dateStarted) || !isValidDate(data.dateEnded)) {
        return false;
      }

      return new Date(data.dateStarted).getTime() <= new Date(data.dateEnded).getTime();
    },
    {
      message: "Date Ended must be the same or later than Date Started",
      path: ["dateEnded"],
    }
  );

export type FormSubmissionInput = z.infer<typeof formSubmissionSchema>;


