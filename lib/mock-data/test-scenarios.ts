/**
 * Mock Test Scenarios
 * Complex mock scenarios for testing and development
 */

import {
  mockUsers,
  mockVendors,
  mockProducts,
  mockRecipes,
  createMockPurchaseRequest,
  createMockUser,
  createMockVendor
} from './index'
import { PRStatus } from '../types'

/**
 * Test scenario: Complete procurement workflow
 */
export const procurementWorkflowScenario = {
  name: 'Complete Procurement Workflow',
  description: 'Full workflow from PR creation to GRN completion',
  data: {
    requester: createMockUser({
      id: 'user-requester',
      name: 'John Requester',
      role: 'staff',
      department: 'kitchen'
    }),
    approver: createMockUser({
      id: 'user-approver',
      name: 'Sarah Approver',
      role: 'department-manager',
      department: 'kitchen'
    }),
    vendor: createMockVendor({
      id: 'vendor-workflow',
      companyName: 'Workflow Test Vendor'
    }),
    purchaseRequest: createMockPurchaseRequest({
      id: 'PR-WORKFLOW-001',
      justification: 'Kitchen supplies for workflow test',
      requestedBy: 'user-requester',
      departmentId: 'kitchen',
      status: PRStatus.InProgress
    })
  }
}

/**
 * Test scenario: Multi-currency operations
 */
export const multiCurrencyScenario = {
  name: 'Multi-Currency Operations',
  description: 'Testing operations across multiple currencies',
  data: {
    usdVendor: createMockVendor({
      id: 'vendor-usd',
      companyName: 'US Vendor',
      preferredCurrency: 'USD'
    }),
    eurVendor: createMockVendor({
      id: 'vendor-eur',
      companyName: 'European Vendor',
      preferredCurrency: 'EUR'
    }),
    gbpVendor: createMockVendor({
      id: 'vendor-gbp',
      companyName: 'UK Vendor',
      preferredCurrency: 'GBP'
    })
  }
}

/**
 * Test scenario: Large dataset performance testing
 */
export const largeDatasetScenario = {
  name: 'Large Dataset Performance',
  description: 'Large datasets for performance testing',
  data: {
    users: Array.from({ length: 100 }, (_, i) => createMockUser({
      id: `perf-user-${i + 1}`,
      name: `Performance User ${i + 1}`,
      email: `perfuser${i + 1}@test.com`
    })),
    vendors: Array.from({ length: 50 }, (_, i) => createMockVendor({
      id: `perf-vendor-${i + 1}`,
      companyName: `Performance Vendor ${i + 1}`
    })),
    purchaseRequests: Array.from({ length: 200 }, (_, i) => createMockPurchaseRequest({
      id: `PR-PERF-${String(i + 1).padStart(3, '0')}`,
      justification: `Performance test PR ${i + 1}`
    }))
  }
}

/**
 * Test scenario: Edge cases and error conditions
 */
export const edgeCasesScenario = {
  name: 'Edge Cases and Error Conditions',
  description: 'Testing edge cases and error handling',
  data: {
    // User with no permissions
    restrictedUser: createMockUser({
      id: 'user-restricted',
      name: 'Restricted User'
    }),
    // Inactive vendor
    inactiveVendor: createMockVendor({
      id: 'vendor-inactive',
      companyName: 'Inactive Vendor',
      isActive: false
    }),
    // PR with special characters
    specialCharPR: createMockPurchaseRequest({
      id: 'PR-SPECIAL-001',
      justification: 'Special characters: åçčéñtëd & símböls!'
    })
  }
}

/**
 * Get all test scenarios
 */
export const allTestScenarios = [
  procurementWorkflowScenario,
  multiCurrencyScenario,
  largeDatasetScenario,
  edgeCasesScenario
]