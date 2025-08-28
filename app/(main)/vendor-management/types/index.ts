// Core data models for Vendor Pricelist Management System
// Based on requirements from .kiro/specs/vendor-pricelist-management/

export interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface VendorMetrics {
  responseRate: number
  averageResponseTime: number
  qualityScore: number
  onTimeDeliveryRate: number
  totalCampaigns: number
  completedSubmissions: number
  averageCompletionTime: number
  lastSubmissionDate?: Date
}

export interface Vendor {
  id: string
  name: string
  contactEmail: string
  contactPhone?: string
  address: Address
  status: 'active' | 'inactive'
  preferredCurrency: string
  paymentTerms?: string
  performanceMetrics: VendorMetrics
  createdAt: Date
  updatedAt: Date
  createdBy: string
  // Additional vendor profile fields
  companyRegistration?: string
  taxId?: string
  taxProfile?: string
  taxRate?: number  // Tax rate percentage (0-100)
  website?: string
  businessType?: string
  certifications?: string[]
  languages?: string[]
  notes?: string
}

export interface ProductInstance {
  id: string              // Unique instance ID (e.g., "beef-ribeye-kg")
  productId: string       // Original product ID (e.g., "beef-ribeye")
  orderUnit: string       // Selected order unit for this instance
  displayName?: string    // Optional custom name for display
}

export interface ProductSelection {
  categories: string[]
  subcategories: string[]
  itemGroups: string[]
  specificItems: string[]           // Legacy: simple product IDs
  productInstances?: ProductInstance[]  // New: product instances with units
}

export interface CustomField {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'select' | 'textarea'
  required: boolean
  options?: string[] // For select type
  defaultValue?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

export interface PricelistTemplate {
  id: string
  name: string
  description?: string
  productSelection: ProductSelection
  customFields: CustomField[]
  instructions: string
  validityPeriod: number // days
  status: 'draft' | 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
  createdBy: string
  // Additional template settings
  allowMultiMOQ: boolean
  requireLeadTime: boolean
  defaultCurrency: string
  supportedCurrencies: string[]
  maxItemsPerSubmission?: number
  notificationSettings: {
    sendReminders: boolean
    reminderDays: number[]
    escalationDays: number
  }
}

export interface RequestForPricingSchedule {
  type: 'one-time' | 'recurring' | 'event-based'
  startDate: Date
  endDate?: Date
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
    interval: number
    daysOfWeek?: number[]
    dayOfMonth?: number
  }
  eventTrigger?: {
    event: string
    conditions: Record<string, any>
  }
}

export interface VendorInvitation {
  id: string
  vendorId: string
  token: string
  pricelistId: string
  campaignId: string
  sentAt?: Date
  accessedAt?: Date
  submittedAt?: Date
  expiresAt: Date
  status: 'pending' | 'sent' | 'delivered' | 'accessed' | 'submitted' | 'expired' | 'cancelled'
  deliveryStatus?: {
    attempts: number
    lastAttempt?: Date
    failureReason?: string
  }
  remindersSent: number
  lastReminderSent?: Date
  ipAddress?: string
  userAgent?: string
}

export interface RequestForPricingAnalytics {
  totalVendors: number
  invitationsSent: number
  invitationsDelivered: number
  portalAccesses: number
  submissionsStarted: number
  submissionsCompleted: number
  responseRate: number
  averageResponseTime: number
  completionRate: number
  qualityScore: number
  vendorEngagement: {
    vendorId: string
    accessCount: number
    timeSpent: number
    completionPercentage: number
    lastActivity: Date
  }[]
}

export interface RequestForPricing {
  id: string
  name: string
  description?: string
  templateId: string
  vendorIds: string[]
  schedule: RequestForPricingSchedule
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  invitations: VendorInvitation[]
  analytics: RequestForPricingAnalytics
  createdAt: Date
  updatedAt: Date
  createdBy: string
  // Additional campaign settings
  deadlineBuffer: number // hours before expiry to send final reminder
  maxSubmissionAttempts: number
  requireManagerApproval: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  tags: string[]
}

export interface MOQPricing {
  id: string
  moq: number
  unit: string
  unitPrice: number
  conversionFactor?: number
  leadTime?: number
  notes?: string
  validFrom?: Date
  validTo?: Date
}

export interface PricelistItem {
  id: string
  productId: string
  productCode: string
  productName: string
  productDescription?: string
  category: string
  subcategory?: string
  pricing: MOQPricing[]
  currency: string
  leadTime?: number
  notes?: string
  customFieldValues?: Record<string, any>
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  qualityScore?: number
  validationErrors?: ValidationError[]
  lastModified: Date
  certifications?: string[]
}

export interface Certification {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
}

export interface VendorPricelist {
  id: string
  pricelistNumber: string // Display-friendly pricelist number (e.g., "PL-2025-001")
  vendorId: string
  campaignId: string
  templateId: string
  invitationId: string
  currency: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'expired'
  items: PricelistItem[]
  validFrom: Date
  validTo: Date
  submittedAt?: Date
  approvedAt?: Date
  rejectedAt?: Date
  rejectionReason?: string
  approvedBy?: string
  createdAt: Date
  updatedAt: Date
  // Additional pricelist metadata
  completionPercentage: number
  qualityScore: number
  totalItems: number
  completedItems: number
  lastAutoSave: Date
  submissionNotes?: string
  internalNotes?: string
  version: number
  parentPricelistId?: string // For revisions
}

export interface SessionActivity {
  id: string
  timestamp: Date
  action: string
  details?: Record<string, any>
  ipAddress: string
  userAgent: string
  duration?: number
  success: boolean
  errorMessage?: string
}

export interface PortalSession {
  token: string
  vendorId: string
  pricelistId: string
  campaignId: string
  invitationId: string
  expiresAt: Date
  ipAddress: string
  userAgent: string
  accessLog: SessionActivity[]
  createdAt: Date
  lastAccessAt: Date
  // Additional session management
  isActive: boolean
  maxConcurrentSessions: number
  sessionTimeout: number // minutes
  extendedCount: number
  maxExtensions: number
  securityFlags: {
    suspiciousActivity: boolean
    multipleIPs: boolean
    unusualUserAgent: boolean
  }
}

export interface ValidationError {
  field: string
  code: string
  message: string
  severity: 'error' | 'warning' | 'info'
  suggestions?: string[]
  context?: Record<string, any>
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  qualityScore: number
  validatedFields: string[]
  timestamp: Date
}

export interface BusinessRule {
  id: string
  name: string
  description: string
  type: 'validation' | 'approval' | 'notification' | 'assignment'
  conditions: {
    field: string
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'regex'
    value: any
    logicalOperator?: 'AND' | 'OR'
  }[]
  actions: {
    type: string
    parameters: Record<string, any>
  }[]
  priority: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface EmailTemplate {
  id: string
  name: string
  type: 'invitation' | 'reminder' | 'confirmation' | 'approval' | 'rejection'
  subject: string
  htmlContent: string
  textContent: string
  variables: string[]
  language: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface NotificationSettings {
  id: string
  userId: string
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  preferences: {
    campaignUpdates: boolean
    vendorSubmissions: boolean
    validationErrors: boolean
    systemAlerts: boolean
  }
  quietHours: {
    enabled: boolean
    startTime: string
    endTime: string
    timezone: string
  }
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  entityType: string
  entityId: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  timestamp: Date
  ipAddress: string
  userAgent: string
  success: boolean
  errorMessage?: string
  context?: Record<string, any>
}

export interface SystemConfiguration {
  id: string
  key: string
  value: any
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  description: string
  category: 'security' | 'performance' | 'notifications' | 'validation' | 'ui'
  isEditable: boolean
  defaultValue: any
  validationRules?: {
    required?: boolean
    min?: number
    max?: number
    pattern?: string
    options?: any[]
  }
  updatedAt: Date
  updatedBy: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, any>
  }
  metadata?: {
    total?: number
    page?: number
    limit?: number
    hasMore?: boolean
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Filter and Search Types
export interface VendorFilters {
  status?: ('active' | 'inactive' | 'suspended')[]
  currency?: string[]
  performanceMin?: number
  performanceMax?: number
  responseRateMin?: number
  lastSubmissionAfter?: Date
  lastSubmissionBefore?: Date
  search?: string
}

export interface RequestForPricingFilters {
  status?: ('draft' | 'active' | 'paused' | 'completed' | 'cancelled')[]
  priority?: ('low' | 'medium' | 'high' | 'urgent')[]
  tags?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  templateId?: string
  createdBy?: string
  search?: string
}

export interface PricelistFilters {
  status?: ('draft' | 'submitted' | 'approved' | 'rejected' | 'expired')[]
  currency?: string[]
  vendorIds?: string[]
  campaignId?: string
  qualityScoreMin?: number
  validityRange?: {
    start: Date
    end: Date
  }
  tags?: string[]
  search?: string
}

// All types are already exported above with export interface