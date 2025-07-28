/**
 * Vendor Validation Utilities - Temporary Build Fix
 * 
 * Validation functions for vendor price management data
 */

import { z } from 'zod';
import { 
  VendorPriceManagement
} from '../types/vendor-price-management';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for notification settings
 */
const notificationSettingsSchema = z.object({
  emailReminders: z.boolean(),
  reminderFrequency: z.enum(['daily', 'weekly', 'monthly']),
  escalationEnabled: z.boolean(),
  escalationDays: z.number().min(1).max(30),
  preferredContactTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
});

/**
 * Schema for price collection preferences
 */
const priceCollectionPreferencesSchema = z.object({
  preferredCurrency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'THB', 'JPY', 'CNY', 'CHF', 'INR']),
  defaultLeadTime: z.number().min(1).max(365),
  communicationLanguage: z.enum(['en-US', 'en-GB', 'en-CA', 'en-AU', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR', 'zh-CN', 'ja-JP', 'ko-KR']),
  notificationPreferences: notificationSettingsSchema
});

/**
 * Schema for performance metrics
 */
const performanceMetricsSchema = z.object({
  responseRate: z.number().min(0).max(100),
  averageResponseTime: z.number().min(0),
  dataQualityScore: z.number().min(0).max(100),
  lastSubmissionDate: z.string().optional(),
  totalCampaignsInvited: z.number().min(0),
  totalCampaignsCompleted: z.number().min(0)
});

/**
 * Main vendor price management schema
 */
const vendorPriceManagementSchema = z.object({
  id: z.string().optional(),
  baseVendorId: z.string(),
  priceCollectionPreferences: priceCollectionPreferencesSchema,
  performanceMetrics: performanceMetricsSchema.optional(),
  assignedCategories: z.array(z.string()),
  status: z.enum(['active', 'inactive', 'suspended']),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  createdBy: z.string()
});

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate vendor price management data
 */
export function validateVendorPriceManagement(data: any): { 
  success: boolean; 
  data?: VendorPriceManagement; 
  errors?: z.ZodError 
} {
  try {
    const validData = vendorPriceManagementSchema.parse(data);
    return { success: true, data: validData as unknown as VendorPriceManagement };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

/**
 * Format validation errors for API response
 */
export function formatValidationErrors(error: z.ZodError): Array<{
  path: string;
  message: string;
}> {
  return error.errors.map(err => ({
    path: err.path.join('.'),
    message: err.message
  }));
}

/**
 * Generate a secure invitation token
 */
export function generateInvitationToken(): string {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// NOTE: Many functions are commented out due to missing type definitions
// These would need the full type definitions to work properly