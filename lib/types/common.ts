/**
 * Common Types and Utilities
 * 
 * Shared types used across multiple domains in the Carmen ERP application.
 * These types provide consistency and reusability throughout the codebase.
 */

// ====== MONEY AND CURRENCY ======

/**
 * Represents a monetary amount with currency
 */
export interface Money {
  amount: number;
  currency: string;
}

// Currency and ExchangeRate types moved to finance.ts for better organization

// ====== STATUS TYPES ======

/**
 * Common document status types used across modules
 */
export enum DocumentStatus {
  Draft = 'draft',
  InProgress = 'inprogress',
  Approved = 'approved',
  Converted = 'converted',
  Rejected = 'rejected',
  Void = 'void',
  // Aliases for common usage
  Completed = 'converted'
}

/**
 * Workflow stage status
 */
export enum WorkflowStatus {
  Draft = 'draft',
  Pending = 'pending',
  Approved = 'approved',
  Review = 'review',
  Rejected = 'rejected'
}

/**
 * Generic approval status
 */
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'review_required';

/**
 * Activity status for various operations
 */
export type ActivityStatus = 'active' | 'inactive' | 'suspended' | 'archived';

// ====== DATE AND TIME ======

/**
 * Date range interface for filtering and reporting
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Timestamp information for audit trails
 */
export interface AuditTimestamp {
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}

// ====== PAGINATION AND FILTERING ======

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

/**
 * Pagination response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Sort configuration
 */
export interface SortConfig<T = any> {
  field: keyof T;
  direction: 'asc' | 'desc';
}

/**
 * Generic filter interface
 */
export interface FilterConfig {
  [key: string]: any;
}

// ====== CONTACT INFORMATION ======

/**
 * Address information
 */
export interface Address {
  id: string;
  addressLine: string;
  subDistrictId?: string;
  districtId?: string;
  provinceId?: string;
  postalCode?: string;
  country?: string;
  addressType?: AddressType;
  isPrimary?: boolean;
}

/**
 * Address types
 */
export enum AddressType {
  MAIN = 'MAIN',
  BILLING = 'BILLING',
  SHIPPING = 'SHIPPING',
  BRANCH = 'BRANCH'
}

/**
 * Contact information
 */
export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  isPrimary?: boolean;
  notes?: string;
}

// ====== MEASUREMENT AND UNITS ======

/**
 * Unit of measurement
 */
export interface Unit {
  id: string;
  name: string;
  symbol: string;
  category: UnitCategory;
  baseUnit?: string; // For conversion calculations
  conversionFactor?: number;
  isActive: boolean;
}

/**
 * Unit categories
 */
export type UnitCategory = 'weight' | 'volume' | 'length' | 'count' | 'time' | 'temperature';

/**
 * Quantity with unit
 */
export interface Quantity {
  value: number;
  unit: string;
}

// ====== WORKFLOW AND APPROVAL ======

/**
 * Workflow stage definition (generic workflow configuration)
 * Note: For procurement-specific workflow stages, use the WorkflowStage enum from procurement.ts
 */
export interface WorkflowStageDefinition {
  id: string;
  name: string;
  description?: string;
  order: number;
  requiredRole?: string;
  approvalRequired: boolean;
  conditions?: WorkflowCondition[];
}

/**
 * Workflow condition
 */
export interface WorkflowCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin';
  value: any;
}

/**
 * Approval record
 */
export interface ApprovalRecord {
  id: string;
  stageId: string;
  approvedBy: string;
  approvedAt: Date;
  status: ApprovalStatus;
  comments?: string;
  attachments?: string[];
}

// ====== FILE AND ATTACHMENTS ======

/**
 * File attachment
 */
export interface FileAttachment {
  id: string;
  name: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

// ====== TAGS AND CATEGORIES ======

/**
 * Generic tag interface
 */
export interface Tag {
  id: string;
  name: string;
  color?: string;
  category?: string;
}

/**
 * Category interface
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  level: number;
  isActive: boolean;
}

// ====== NOTIFICATIONS ======

/**
 * Notification types
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * Notification interface
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
  actionUrl?: string;
}

// ====== API RESPONSE ======

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  timestamp: string;
}

// ====== SEARCH AND AUTOCOMPLETE ======

/**
 * Search result item
 */
export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: string;
  url?: string;
  metadata?: Record<string, any>;
}

/**
 * Autocomplete option
 */
export interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

// ====== COMMENTS AND ACTIVITY ======

/**
 * Comment interface for activity tracking
 */
export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  content: string;
  timestamp: Date;
}

// ====== PERFORMANCE AND METRICS ======

/**
 * Performance metric
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  unit?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Error information
 */
export interface ErrorInfo {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  userId?: string;
}