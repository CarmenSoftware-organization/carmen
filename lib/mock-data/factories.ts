/**
 * Mock Data Factories
 * Factory functions for creating mock entities with consistent data structure
 */

import { User, Vendor, Product, Recipe, PurchaseRequest } from '@/lib/types'

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
 * Create multiple mock entities of a given type
 */
export function createMockEntities<T>(factory: () => T, count: number): T[] {
  return Array.from({ length: count }, () => factory())
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