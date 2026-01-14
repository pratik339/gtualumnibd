import { z } from 'zod';

// Text field length limits
export const TEXT_LIMITS = {
  full_name: 100,
  job_title: 200,
  company: 200,
  location_city: 100,
  location_country: 100,
  achievements: 5000,
  experience: 5000,
  projects: 5000,
  rejection_reason: 2000,
  enrollment_number: 50,
} as const;

// Text validation schemas with length limits
export const fullNameSchema = z
  .string()
  .trim()
  .min(1, { message: 'Full name is required' })
  .max(TEXT_LIMITS.full_name, { message: `Full name must be less than ${TEXT_LIMITS.full_name} characters` });

export const jobTitleSchema = z
  .string()
  .max(TEXT_LIMITS.job_title, { message: `Job title must be less than ${TEXT_LIMITS.job_title} characters` })
  .or(z.literal(''));

export const companySchema = z
  .string()
  .max(TEXT_LIMITS.company, { message: `Company must be less than ${TEXT_LIMITS.company} characters` })
  .or(z.literal(''));

export const locationSchema = z
  .string()
  .max(TEXT_LIMITS.location_city, { message: `Location must be less than ${TEXT_LIMITS.location_city} characters` })
  .or(z.literal(''));

export const achievementsSchema = z
  .string()
  .max(TEXT_LIMITS.achievements, { message: `Achievements must be less than ${TEXT_LIMITS.achievements} characters` })
  .or(z.literal(''));

export const experienceSchema = z
  .string()
  .max(TEXT_LIMITS.experience, { message: `Experience must be less than ${TEXT_LIMITS.experience} characters` })
  .or(z.literal(''));

export const projectsSchema = z
  .string()
  .max(TEXT_LIMITS.projects, { message: `Projects must be less than ${TEXT_LIMITS.projects} characters` })
  .or(z.literal(''));

export const enrollmentNumberSchema = z
  .string()
  .max(TEXT_LIMITS.enrollment_number, { message: `Enrollment number must be less than ${TEXT_LIMITS.enrollment_number} characters` })
  .or(z.literal(''));

// URL validation schemas
export const linkedinUrlSchema = z
  .string()
  .url({ message: 'Please enter a valid URL' })
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return parsed.hostname.includes('linkedin.com');
      } catch {
        return false;
      }
    },
    { message: 'Please enter a valid LinkedIn URL' }
  )
  .or(z.literal(''));

export const facebookUrlSchema = z
  .string()
  .url({ message: 'Please enter a valid URL' })
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return parsed.hostname.includes('facebook.com') || parsed.hostname.includes('fb.com');
      } catch {
        return false;
      }
    },
    { message: 'Please enter a valid Facebook URL' }
  )
  .or(z.literal(''));

export const whatsappNumberSchema = z
  .string()
  .regex(/^\+?[1-9]\d{6,14}$/, { message: 'Please enter a valid phone number with country code' })
  .or(z.literal(''));

export const emailSchema = z
  .string()
  .email({ message: 'Please enter a valid email address' })
  .max(255, { message: 'Email must be less than 255 characters' })
  .or(z.literal(''));

// Allowed image MIME types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size must be less than 5MB',
    };
  }

  return { valid: true };
}

// Sanitize URL for external links
export function sanitizeExternalUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

// Sanitize WhatsApp number for URL
export function sanitizeWhatsAppNumber(number: string): string {
  return number.replace(/\D/g, '');
}

// Validate text length helper
export function validateTextLength(text: string, maxLength: number): { valid: boolean; error?: string } {
  if (text.length > maxLength) {
    return {
      valid: false,
      error: `Text must be less than ${maxLength} characters`,
    };
  }
  return { valid: true };
}
