import { z } from 'zod';

// URL validation schema
export const createLinkSchema = z.object({
  originalUrl: z
    .string()
    .min(1, 'URL is required')
    .url('Please enter a valid URL')
    .refine((url) => {
      // Additional URL validation
      try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return false;
      }
    }, 'URL must use HTTP or HTTPS protocol'),
  
  title: z
    .string()
    .max(100, 'Title must be less than 100 characters')
    .optional(),
  
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  
  customCode: z
    .string()
    .min(3, 'Custom code must be at least 3 characters')
    .max(20, 'Custom code must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Custom code can only contain letters, numbers, hyphens, and underscores')
    .optional()
});

// Click tracking schema
export const trackClickSchema = z.object({
  shortCode: z.string().min(1, 'Short code is required'),
  userAgent: z.string().optional(),
  referer: z.string().optional(),
  ip: z.string().optional()
});

// Analytics query schema
export const analyticsQuerySchema = z.object({
  linkId: z.string().min(1, 'Link ID is required'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().min(1).max(1000).optional()
});

// Location data validation
export const locationDataSchema = z.object({
  query: z.string().optional(), // IP address
  status: z.string().optional(),
  country: z.string().optional(),
  countryCode: z.string().optional(),
  region: z.string().optional(),
  regionName: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  lat: z.number().optional(),
  lon: z.number().optional(),
  timezone: z.string().optional(),
  isp: z.string().optional(),
  org: z.string().optional(),
  as: z.string().optional()
});

// Utility function to validate URLs
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Utility function to sanitize and validate short codes
export function sanitizeShortCode(code: string): string {
  return code.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20);
}

// Utility function to validate IP addresses
export function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  if (ipv4Regex.test(ip)) {
    return ip.split('.').every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }
  
  return ipv6Regex.test(ip);
}

// Utility function to clean and validate user agent strings
export function sanitizeUserAgent(userAgent?: string): string {
  if (!userAgent) return 'Unknown';
  // Remove potentially harmful characters and limit length
  return userAgent.replace(/[<>\"']/g, '').slice(0, 500);
}

// Utility function to clean referer URLs
export function sanitizeReferer(referer?: string): string | undefined {
  if (!referer) return undefined;
  try {
    const url = new URL(referer);
    return url.origin + url.pathname; // Remove query params and fragments
  } catch {
    return undefined;
  }
}

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type TrackClickInput = z.infer<typeof trackClickSchema>;
export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
export type LocationDataInput = z.infer<typeof locationDataSchema>;