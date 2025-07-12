import { z } from "zod";

// Domain validation schema
export const domainSchema = z.object({
  domain: z
    .string()
    .min(1, "Domain is required")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,
      "Invalid domain format"
    )
    .max(253, "Domain name is too long"),
});

// Echo API validation schema
export const echoSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(1000, "Message is too long"),
});

// Blog search validation schema
export const blogSearchSchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query is too long"),
  limit: z.number().min(1).max(50).optional().default(10),
});

// Visitor data validation schema
export const visitorDataSchema = z.object({
  userAgent: z.string().optional(),
  ip: z
    .string()
    .regex(
      /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
      "Invalid IP address"
    )
    .optional(),
  timestamp: z.number().optional(),
  page: z
    .string()
    .regex(/^https?:\/\/[^\s/$.?#].[^\s]*$/, "Invalid URL format")
    .optional(),
});

export type DomainRequest = z.infer<typeof domainSchema>;
export type EchoRequest = z.infer<typeof echoSchema>;
export type BlogSearchRequest = z.infer<typeof blogSearchSchema>;
export type VisitorDataRequest = z.infer<typeof visitorDataSchema>;
