/**
 * Centralized Type Definitions - Main Barrel Export File
 * 
 * This file serves as the single source of truth for all TypeScript interfaces
 * and types used throughout the Carmen ERP application.
 * 
 * Import usage:
 * import { User, Vendor, PurchaseRequest, DocumentStatus } from '@/lib/types'
 */

// Common shared types
export * from './common'
// Explicit re-exports for commonly used enums and types to ensure proper resolution
export { DocumentStatus, WorkflowStatus } from './common'

// User and authentication types
export * from './user'

// Inventory management types
export * from './inventory'

// Procurement types
export * from './procurement'
// Explicit re-exports for procurement enums and interfaces
export { PRType, WorkflowStage } from './procurement'
export type { Requestor } from './procurement'

// Vendor management types
export * from './vendor'

// Product management types
export * from './product'

// Recipe and operational planning types
export * from './recipe'

// Menu engineering types
export * from './menu-engineering'

// Finance types
export * from './finance'

// Settings and preferences types
export * from './settings'

// POS Integration types
export * from './pos-integration'
export { ErrorCategory } from './pos-integration'

// Existing specialized types (keep as is)
export * from './fractional-inventory'
export * from './enhanced-pr-types'
export * from './enhanced-consumption-tracking'
export * from './enhanced-costing-engine'
export * from './count-allocation'
export * from './credit-note'
export * from './hotel'
export * from './price-management'
export * from './campaign-management'
export * from './vendor-price-management'
export * from './business-rules'

// Type utilities and guards
export * from './guards'
export * from './converters'
export * from './validators'