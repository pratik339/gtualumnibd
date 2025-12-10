import { z } from 'zod';

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
