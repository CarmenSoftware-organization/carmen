/**
 * Mock Data Factories
 * Factory functions for creating mock entities with consistent data structure
 */

import {
  User,
  Vendor,
  Product,
  Recipe,
  PurchaseRequest,
  POSTransaction,
  PendingTransaction,
  POSMapping,
  TransactionError,
  UserPreferences,
  CompanySettings,
  SecuritySettings,
  ApplicationSettings
} from '@/lib/types'
import { ErrorCategory } from '@/lib/types/pos-integration'
import {
  mockUserPreferences,
  mockCompanySettings,
  mockSecuritySettings,
  mockApplicationSettings
} from './settings'

/**
 * Create a mock vendor with optional overrides
 */
export function createMockVendor(overrides: Partial<Vendor> = {}): Vendor {
  return {
    id: `vendor-${Date.now()}`,
    companyName: 'Test Vendor Company',
    contactName: 'Test Contact',
    email: 'test@vendor.com',
    phone: '+1-555-0000',
    address: '123 Test Street, Test City, TC 12345',
    isActive: true,
    category: 'General',
    taxId: 'TAX000000',
    paymentTerms: 'Net 30',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }
}

/**
 * Create a mock user with optional overrides
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: `user-${Date.now()}`,
    name: 'Test User',
    email: 'test@example.com',
    role: 'staff',
    department: 'general',
    location: 'main',
    isActive: true,
    permissions: ['read'],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }
}

/**
 * Create a mock product with optional overrides
 */
export function createMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: `product-${Date.now()}`,
    name: 'Test Product',
    sku: `SKU-${Date.now()}`,
    description: 'Test product description',
    category: 'General',
    unit: 'piece',
    unitSize: '1pc',
    isActive: true,
    costPrice: 10.00,
    sellingPrice: 15.00,
    reorderLevel: 10,
    maxStockLevel: 100,
    supplier: 'Test Supplier',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }
}

/**
 * Create a mock recipe with optional overrides
 */
export function createMockRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: `recipe-${Date.now()}`,
    name: 'Test Recipe',
    description: 'Test recipe description',
    category: 'Main Course',
    cuisineType: 'International',
    servingSize: 1,
    preparationTime: 15,
    cookingTime: 15,
    difficulty: 'Easy',
    ingredients: [],
    instructions: ['Test instruction'],
    costPerServing: 5.00,
    sellingPrice: 10.00,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }
}

/**
 * Create a mock purchase request with optional overrides
 */
export function createMockPurchaseRequest(overrides: Partial<PurchaseRequest> = {}): PurchaseRequest {
  return {
    id: `PR-${Date.now()}`,
    description: 'Test Purchase Request',
    requestedBy: 'test-user',
    department: 'general',
    priority: 'normal',
    status: 'draft',
    totalAmount: 100.00,
    currency: 'USD',
    items: [],
    approvals: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }
}

/**
 * Create a mock POS transaction with optional overrides
 */
export function createMockPOSTransaction(overrides: Partial<POSTransaction> = {}): POSTransaction {
  const timestamp = new Date()
  return {
    id: `txn-${Date.now()}`,
    transactionId: `TXN-${Date.now()}`,
    externalId: `POS-${Date.now()}`,
    date: timestamp.toISOString(),
    status: 'success',
    locationId: 'loc-001',
    location: {
      id: 'loc-001',
      name: 'Test Location'
    },
    posSystem: {
      name: 'Comanche POS',
      version: '2.5.1'
    },
    totalAmount: {
      amount: 100.00,
      currency: 'USD'
    },
    itemCount: 1,
    createdAt: timestamp,
    createdBy: 'pos-system',
    updatedAt: timestamp,
    updatedBy: 'pos-system',
    ...overrides
  }
}

/**
 * Create a mock pending transaction with optional overrides
 */
export function createMockPendingTransaction(overrides: Partial<PendingTransaction> = {}): PendingTransaction {
  const timestamp = new Date()
  return {
    id: `txn-pending-${Date.now()}`,
    transactionId: `TXN-${Date.now()}`,
    externalId: `POS-${Date.now()}`,
    date: timestamp.toISOString(),
    status: 'pending_approval' as const,
    locationId: 'loc-001',
    location: {
      id: 'loc-001',
      name: 'Test Location'
    },
    posSystem: {
      name: 'Comanche POS',
      version: '2.5.1'
    },
    totalAmount: {
      amount: 100.00,
      currency: 'USD'
    },
    itemCount: 1,
    requester: {
      id: 'user-001',
      name: 'Test User',
      email: 'test@example.com'
    },
    inventoryImpact: 'medium',
    lineItems: [],
    createdAt: timestamp,
    createdBy: 'pos-system',
    updatedAt: timestamp,
    updatedBy: 'pos-system',
    ...overrides
  }
}

/**
 * Create a mock POS mapping with optional overrides
 */
export function createMockPOSMapping(overrides: Partial<POSMapping> = {}): POSMapping {
  const timestamp = new Date()
  return {
    id: `mapping-${Date.now()}`,
    posItemId: `pos-item-${Date.now()}`,
    posItemName: 'Test POS Item',
    posItemCategory: 'General',
    recipeId: `recipe-${Date.now()}`,
    recipeName: 'Test Recipe',
    recipeCategory: 'General',
    portionSize: 1,
    unit: 'serving',
    isActive: true,
    mappedBy: {
      id: 'user-001',
      name: 'Test User'
    },
    mappedAt: timestamp.toISOString(),
    createdAt: timestamp,
    createdBy: 'user-001',
    updatedAt: timestamp,
    updatedBy: 'user-001',
    ...overrides
  }
}

/**
 * Create a mock transaction error with optional overrides
 */
export function createMockTransactionError(overrides: Partial<TransactionError> = {}): TransactionError {
  return {
    category: ErrorCategory.VALIDATION_ERROR,
    code: 'ERR_VALIDATION',
    message: 'Test validation error',
    severity: 'medium',
    occurredAt: new Date().toISOString(),
    ...overrides
  }
}

/**
 * Create multiple mock entities of a given type
 */
export function createMockEntities<T>(factory: () => T, count: number): T[] {
  return Array.from({ length: count }, () => factory())
}

/**
 * Create a mock UserPreferences with optional overrides
 */
export function createMockUserPreferences(overrides: Partial<UserPreferences> = {}): UserPreferences {
  return {
    ...mockUserPreferences,
    id: `pref-${Date.now()}`,
    userId: overrides.userId || `user-${Date.now()}`,
    updatedAt: new Date(),
    createdAt: new Date(),
    ...overrides
  }
}

/**
 * Create a mock CompanySettings with optional overrides
 */
export function createMockCompanySettings(overrides: Partial<CompanySettings> = {}): CompanySettings {
  return {
    ...mockCompanySettings,
    id: `company-${Date.now()}`,
    updatedAt: new Date(),
    updatedBy: 'system',
    createdAt: new Date(),
    ...overrides
  }
}

/**
 * Create a mock SecuritySettings with optional overrides
 */
export function createMockSecuritySettings(overrides: Partial<SecuritySettings> = {}): SecuritySettings {
  return {
    ...mockSecuritySettings,
    id: `security-${Date.now()}`,
    updatedAt: new Date(),
    updatedBy: 'system',
    createdAt: new Date(),
    ...overrides
  }
}

/**
 * Create a mock ApplicationSettings with optional overrides
 */
export function createMockApplicationSettings(overrides: Partial<ApplicationSettings> = {}): ApplicationSettings {
  return {
    ...mockApplicationSettings,
    id: `app-${Date.now()}`,
    updatedAt: new Date(),
    updatedBy: 'system',
    createdAt: new Date(),
    ...overrides
  }
}

/**
 * Create mock entities with sequential IDs
 */
export function createMockEntitiesWithSequentialIds<T extends { id: string }>(
  factory: (id: string) => T,
  prefix: string,
  count: number
): T[] {
  return Array.from({ length: count }, (_, index) =>
    factory(`${prefix}-${String(index + 1).padStart(3, '0')}`)
  )
}