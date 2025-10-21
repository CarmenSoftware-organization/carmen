/**
 * POS Integration Mock Data - Transactions
 *
 * Centralized mock data for POS transactions including pending approvals,
 * successful transactions, and failed transactions with various error types.
 */

import {
  POSTransaction,
  PendingTransaction,
  TransactionError,
  POSTransactionLineItem,
  TransactionAuditLog,
  InventoryImpactPreview
} from '@/lib/types'
import { ErrorCategory } from '@/lib/types/pos-integration'

// ====== MOCK PENDING TRANSACTIONS ======

export const mockPendingTransactions: PendingTransaction[] = [
  {
    id: 'txn-pending-001',
    transactionId: 'TXN-2025-001',
    externalId: 'POS-20251018-001',
    date: '2025-10-18T10:30:00Z',
    status: 'pending_approval',
    locationId: 'loc-001',
    location: {
      id: 'loc-001',
      name: 'Downtown Store'
    },
    posSystem: {
      name: 'Comanche POS',
      version: '2.5.1'
    },
    totalAmount: {
      amount: 125.50,
      currency: 'USD'
    },
    itemCount: 5,
    requester: {
      id: 'user-001',
      name: 'John Smith',
      email: 'john.smith@example.com'
    },
    inventoryImpact: 'medium',
    lineItems: [
      {
        id: 'line-001',
        transactionId: 'txn-pending-001',
        posItemId: 'pos-item-101',
        posItemName: 'Margherita Pizza',
        category: 'Main Course',
        quantity: 2,
        unitPrice: { amount: 15.00, currency: 'USD' },
        totalPrice: { amount: 30.00, currency: 'USD' },
        mappedRecipe: {
          id: 'recipe-001',
          name: 'Margherita Pizza',
          category: 'Pizza'
        },
        inventoryDeduction: {
          ingredients: [
            {
              id: 'ing-001',
              name: 'Pizza Dough',
              quantity: 400,
              unit: 'g',
              location: 'Main Kitchen',
              cost: { amount: 2.40, currency: 'USD' }
            },
            {
              id: 'ing-002',
              name: 'Tomato Sauce',
              quantity: 200,
              unit: 'ml',
              location: 'Main Kitchen',
              cost: { amount: 1.20, currency: 'USD' }
            }
          ]
        }
      },
      {
        id: 'line-002',
        transactionId: 'txn-pending-001',
        posItemId: 'pos-item-102',
        posItemName: 'House Salad',
        category: 'Appetizer',
        quantity: 3,
        unitPrice: { amount: 8.50, currency: 'USD' },
        totalPrice: { amount: 25.50, currency: 'USD' },
        mappedRecipe: {
          id: 'recipe-002',
          name: 'House Salad',
          category: 'Salad'
        }
      }
    ],
    createdAt: new Date('2025-10-18T10:30:00Z'),
    createdBy: 'pos-system',
    updatedAt: new Date('2025-10-18T10:30:00Z'),
    updatedBy: 'pos-system'
  },
  {
    id: 'txn-pending-002',
    transactionId: 'TXN-2025-002',
    externalId: 'POS-20251018-002',
    date: '2025-10-18T11:15:00Z',
    status: 'pending_approval',
    locationId: 'loc-002',
    location: {
      id: 'loc-002',
      name: 'Airport Branch'
    },
    posSystem: {
      name: 'Comanche POS',
      version: '2.5.1'
    },
    totalAmount: {
      amount: 450.75,
      currency: 'USD'
    },
    itemCount: 12,
    requester: {
      id: 'user-002',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com'
    },
    inventoryImpact: 'high',
    lineItems: [],
    notes: 'Large catering order - requires urgent approval',
    createdAt: new Date('2025-10-18T11:15:00Z'),
    createdBy: 'pos-system',
    updatedAt: new Date('2025-10-18T11:15:00Z'),
    updatedBy: 'pos-system'
  }
]

// ====== MOCK SUCCESSFUL TRANSACTIONS ======

export const mockSuccessfulTransactions: POSTransaction[] = [
  {
    id: 'txn-success-001',
    transactionId: 'TXN-2025-100',
    externalId: 'POS-20251017-045',
    date: '2025-10-17T14:20:00Z',
    status: 'success',
    locationId: 'loc-001',
    location: {
      id: 'loc-001',
      name: 'Downtown Store'
    },
    posSystem: {
      name: 'Comanche POS',
      version: '2.5.1'
    },
    totalAmount: {
      amount: 85.00,
      currency: 'USD'
    },
    itemCount: 3,
    processedAt: '2025-10-17T14:21:00Z',
    processedBy: {
      id: 'user-admin',
      name: 'Admin User'
    },
    createdAt: new Date('2025-10-17T14:20:00Z'),
    createdBy: 'pos-system',
    updatedAt: new Date('2025-10-17T14:21:00Z'),
    updatedBy: 'pos-system'
  }
]

// ====== MOCK FAILED TRANSACTIONS ======

export const mockFailedTransactions: POSTransaction[] = [
  {
    id: 'txn-failed-001',
    transactionId: 'TXN-2025-150',
    externalId: 'POS-20251018-010',
    date: '2025-10-18T09:00:00Z',
    status: 'failed',
    locationId: 'loc-001',
    location: {
      id: 'loc-001',
      name: 'Downtown Store'
    },
    posSystem: {
      name: 'Comanche POS',
      version: '2.5.1'
    },
    totalAmount: {
      amount: 65.00,
      currency: 'USD'
    },
    itemCount: 2,
    notes: 'Failed due to missing recipe mapping',
    createdAt: new Date('2025-10-18T09:00:00Z'),
    createdBy: 'pos-system',
    updatedAt: new Date('2025-10-18T09:01:00Z'),
    updatedBy: 'pos-system'
  },
  {
    id: 'txn-failed-002',
    transactionId: 'TXN-2025-151',
    externalId: 'POS-20251018-011',
    date: '2025-10-18T09:30:00Z',
    status: 'failed',
    locationId: 'loc-002',
    location: {
      id: 'loc-002',
      name: 'Airport Branch'
    },
    posSystem: {
      name: 'Comanche POS',
      version: '2.5.1'
    },
    totalAmount: {
      amount: 120.00,
      currency: 'USD'
    },
    itemCount: 4,
    notes: 'Insufficient stock for inventory deduction',
    createdAt: new Date('2025-10-18T09:30:00Z'),
    createdBy: 'pos-system',
    updatedAt: new Date('2025-10-18T09:31:00Z'),
    updatedBy: 'pos-system'
  }
]

// ====== MOCK TRANSACTION ERRORS ======

export const mockTransactionErrors: Record<string, TransactionError> = {
  'txn-failed-001': {
    category: ErrorCategory.MAPPING_ERROR,
    code: 'ERR_MAPPING_NOT_FOUND',
    message: 'POS items not mapped to recipes',
    severity: 'high',
    occurredAt: '2025-10-18T09:01:00Z',
    technicalDetails: {
      requestId: 'req-abc123',
      endpoint: '/api/pos/transactions/process',
      raw: {
        unmappedItems: ['pos-item-999', 'pos-item-1000']
      }
    }
  },
  'txn-failed-002': {
    category: ErrorCategory.STOCK_INSUFFICIENT,
    code: 'ERR_INSUFFICIENT_STOCK',
    message: 'Insufficient inventory for transaction processing',
    severity: 'critical',
    occurredAt: '2025-10-18T09:31:00Z',
    technicalDetails: {
      requestId: 'req-xyz789',
      endpoint: '/api/pos/transactions/process',
      raw: {
        stockShortages: [
          {
            ingredient: 'Chicken Breast',
            required: 2000,
            available: 500,
            unit: 'g'
          }
        ]
      }
    }
  }
}

// ====== MOCK AUDIT LOGS ======

export const mockTransactionAuditLogs: Record<string, TransactionAuditLog[]> = {
  'txn-pending-001': [
    {
      id: 'audit-001',
      transactionId: 'txn-pending-001',
      timestamp: '2025-10-18T10:30:00Z',
      action: 'created',
      details: 'Transaction created from POS system',
      metadata: {
        source: 'comanche-pos',
        terminal: 'TERM-01'
      }
    }
  ],
  'txn-success-001': [
    {
      id: 'audit-002',
      transactionId: 'txn-success-001',
      timestamp: '2025-10-17T14:20:00Z',
      action: 'created',
      details: 'Transaction created from POS system',
      metadata: {
        source: 'comanche-pos',
        terminal: 'TERM-02'
      }
    },
    {
      id: 'audit-003',
      transactionId: 'txn-success-001',
      timestamp: '2025-10-17T14:21:00Z',
      user: {
        id: 'user-admin',
        name: 'Admin User'
      },
      action: 'processed',
      details: 'Transaction processed successfully, inventory deducted',
      metadata: {
        inventoryUpdates: 3,
        totalDeducted: { amount: 45.00, currency: 'USD' }
      }
    }
  ],
  'txn-failed-001': [
    {
      id: 'audit-004',
      transactionId: 'txn-failed-001',
      timestamp: '2025-10-18T09:00:00Z',
      action: 'created',
      details: 'Transaction created from POS system',
      metadata: {
        source: 'comanche-pos',
        terminal: 'TERM-01'
      }
    },
    {
      id: 'audit-005',
      transactionId: 'txn-failed-001',
      timestamp: '2025-10-18T09:01:00Z',
      action: 'failed',
      details: 'Transaction processing failed: Recipe mapping not found',
      metadata: {
        errorCode: 'ERR_MAPPING_NOT_FOUND',
        unmappedItems: 2
      }
    }
  ]
}

// ====== MOCK INVENTORY IMPACT PREVIEW ======

export const mockInventoryImpactPreviews: Record<string, InventoryImpactPreview> = {
  'txn-pending-001': {
    affectedItems: [
      {
        ingredient: 'Pizza Dough',
        ingredientId: 'ing-001',
        currentStock: 5000,
        deductionAmount: 400,
        resultingStock: 4600,
        unit: 'g',
        stockStatus: 'sufficient',
        reorderPoint: 2000,
        location: 'Main Kitchen'
      },
      {
        ingredient: 'Tomato Sauce',
        ingredientId: 'ing-002',
        currentStock: 3000,
        deductionAmount: 200,
        resultingStock: 2800,
        unit: 'ml',
        stockStatus: 'sufficient',
        reorderPoint: 1000,
        location: 'Main Kitchen'
      },
      {
        ingredient: 'Mixed Greens',
        ingredientId: 'ing-003',
        currentStock: 800,
        deductionAmount: 450,
        resultingStock: 350,
        unit: 'g',
        stockStatus: 'low',
        reorderPoint: 500,
        location: 'Main Kitchen'
      }
    ],
    warnings: [
      {
        type: 'low_stock',
        severity: 'warning',
        message: 'Mixed Greens will fall below reorder point after this transaction',
        affectedIngredients: ['Mixed Greens']
      }
    ],
    summary: {
      totalIngredients: 3,
      totalDeductedValue: {
        amount: 12.50,
        currency: 'USD'
      },
      affectedLocations: ['Main Kitchen']
    }
  }
}

// ====== ALL TRANSACTIONS (COMBINED) ======

export const mockAllPOSTransactions: POSTransaction[] = [
  ...mockPendingTransactions,
  ...mockSuccessfulTransactions,
  ...mockFailedTransactions
]

// ====== UTILITY FUNCTIONS ======

export const getTransactionById = (id: string): POSTransaction | undefined => {
  return mockAllPOSTransactions.find(txn => txn.id === id)
}

export const getTransactionsByStatus = (status: string): POSTransaction[] => {
  return mockAllPOSTransactions.filter(txn => txn.status === status)
}

export const getTransactionsByLocation = (locationId: string): POSTransaction[] => {
  return mockAllPOSTransactions.filter(txn => txn.locationId === locationId)
}

export const getTransactionError = (transactionId: string): TransactionError | undefined => {
  return mockTransactionErrors[transactionId]
}

export const getTransactionAuditLog = (transactionId: string): TransactionAuditLog[] => {
  return mockTransactionAuditLogs[transactionId] || []
}

export const getInventoryImpactPreview = (transactionId: string): InventoryImpactPreview | undefined => {
  return mockInventoryImpactPreviews[transactionId]
}
