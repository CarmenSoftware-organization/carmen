/**
 * Vendor Price Management Types and Constants
 */

// Vendor Status Options
export const VENDOR_STATUSES = ['active', 'inactive', 'suspended'] as const;
export type VendorStatus = typeof VENDOR_STATUSES[number];

// Default Currency Options
export const DEFAULT_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'CAD', 'AUD', 
  'JPY', 'CHF', 'CNY', 'INR', 'THB'
] as const;
export type DefaultCurrency = typeof DEFAULT_CURRENCIES[number];

// Notification Frequency Options
export const REMINDER_FREQUENCIES = ['daily', 'weekly', 'monthly'] as const;
export type ReminderFrequency = typeof REMINDER_FREQUENCIES[number];

// Communication Languages
export const COMMUNICATION_LANGUAGES = [
  'en-US', 'en-GB', 'en-CA', 'en-AU',
  'es-ES', 'fr-FR', 'de-DE', 'it-IT',
  'pt-BR', 'zh-CN', 'ja-JP', 'ko-KR'
] as const;
export type CommunicationLanguage = typeof COMMUNICATION_LANGUAGES[number];

// Vendor Price Management Interface
export interface VendorPriceManagement {
  id: string;
  baseVendorId: string; // Reference to the base vendor record
  
  // Price Collection Preferences
  priceCollectionPreferences: {
    preferredCurrency: DefaultCurrency;
    defaultLeadTime: number; // in days
    communicationLanguage: CommunicationLanguage;
    notificationPreferences: NotificationSettings;
  };
  
  // Performance Metrics
  performanceMetrics: {
    responseRate: number; // percentage
    averageResponseTime: number; // in hours
    dataQualityScore: number; // 0-100 score
    lastSubmissionDate?: string;
    totalCampaignsInvited: number;
    totalCampaignsCompleted: number;
  };
  
  // Categories assigned to this vendor for price collection
  assignedCategories: string[];
  
  // Status and metadata
  status: VendorStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Notification Settings Interface
export interface NotificationSettings {
  emailReminders: boolean;
  reminderFrequency: ReminderFrequency;
  escalationEnabled: boolean;
  escalationDays: number;
  preferredContactTime: string; // HH:MM format
}

// Filter Options
export interface VendorFilters {
  status?: VendorStatus[];
  categories?: string[];
  performanceRange?: {
    field: 'responseRate' | 'dataQualityScore';
    min: number;
    max: number;
  };
  lastSubmissionRange?: {
    startDate: string;
    endDate: string;
  };
}

// Sort Configuration
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// Pagination Configuration
export interface PaginationConfig {
  page: number;
  limit: number;
  total?: number;
}

// API Response Interface
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  pagination?: PaginationConfig;
}

// Performance Metrics Summary
export interface PerformanceMetricsSummary {
  totalVendors: number;
  activeVendors: number;
  averageResponseRate: number;
  averageDataQuality: number;
  totalCampaigns: number;
  completedCampaigns: number;
}