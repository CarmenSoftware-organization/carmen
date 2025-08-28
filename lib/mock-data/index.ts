/**
 * Centralized Mock Data - Main Barrel Export File
 * 
 * This file serves as the single source of truth for all mock data
 * used throughout the Carmen ERP application.
 * 
 * Import usage:
 * import { mockUsers, mockVendors, mockProducts } from '@/lib/mock-data'
 */

// Core entity mock data
export * from './users'
export * from './inventory'
export * from './procurement'
export * from './vendors'
export * from './products'
export * from './recipes'
export * from './finance'
export * from './campaigns'
export * from './pricelists'

// Mock data factories
export * from './factories'

// Test scenarios
export * from './test-scenarios'

// Policy builder and ABAC system mock data
export * from './policy-builder-attributes'
export * from './policy-builder-sample-actions'
export * from './policy-builder-templates'
export * from './policy-builder-sample-policies'

// Permission system mock data
export * from './permission-index'
export * from './permission-policies'
export * from './permission-roles'
export * from './permission-subscriptions'