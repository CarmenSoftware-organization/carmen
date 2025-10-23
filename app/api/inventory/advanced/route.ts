/**
 * Advanced Inventory Management API
 * 
 * Comprehensive API endpoints for advanced inventory operations including
 * ABC analysis, stock movements, reservations, batch operations, and analytics.
 */

import { NextRequest, NextResponse } from 'next/server'
import { comprehensiveInventoryService } from '@/lib/services/inventory/comprehensive-inventory-service'
import { stockMovementService } from '@/lib/services/inventory/stock-movement-management-service'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import type { Money } from '@/lib/types/common'

// Extend NextAuth session type to include user ID
declare module 'next-auth' {
  interface Session {
    user?: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

// Validation schemas
const abcAnalysisSchema = z.object({
  analysisDate: z.string().datetime().optional(),
  locationIds: z.string().optional(),
  includeInactive: z.boolean().optional()
})

const stockStatusSchema = z.object({
  itemIds: z.string().optional(),
  includeAnalytics: z.boolean().optional(),
  locationIds: z.string().optional()
})

const reorderSuggestionsSchema = z.object({
  includeAll: z.boolean().optional(),
  locationIds: z.string().optional(),
  urgencyLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  businessImpact: z.enum(['minimal', 'moderate', 'significant', 'critical']).optional()
})

const inventoryKPIsSchema = z.object({
  periodDays: z.number().min(1).max(365).optional(),
  locationIds: z.string().optional(),
  includeProjections: z.boolean().optional()
})

const stockTransferSchema = z.object({
  fromLocationId: z.string().min(1),
  toLocationId: z.string().min(1),
  items: z.array(z.object({
    itemId: z.string().min(1),
    quantity: z.number().min(0.01),
    unitCost: z.object({
      amount: z.number().min(0),
      currency: z.string().length(3)
    }).optional()
  })).min(1),
  priority: z.enum(['normal', 'urgent', 'emergency']).optional(),
  notes: z.string().optional(),
  referenceNo: z.string().optional(),
  referenceType: z.string().optional(),
  autoApprove: z.boolean().optional()
})

const stockReservationSchema = z.object({
  itemId: z.string().min(1),
  locationId: z.string().min(1),
  quantity: z.number().min(0.01),
  reservedFor: z.string().min(1),
  reservationType: z.enum(['order', 'production', 'transfer', 'allocation']).optional(),
  expiryDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  notes: z.string().optional()
})

const batchTransferSchema = z.object({
  operationType: z.enum(['bulk_transfer', 'store_replenishment', 'production_issue', 'return_to_supplier']),
  fromLocationId: z.string().min(1),
  toLocationId: z.string().optional(),
  scheduledDate: z.string().datetime().optional(),
  priority: z.enum(['normal', 'urgent', 'emergency']).optional(),
  items: z.array(z.object({
    itemId: z.string().min(1),
    plannedQuantity: z.number().min(0.01),
    unitCost: z.object({
      amount: z.number().min(0),
      currency: z.string().length(3)
    }),
    notes: z.string().optional()
  })).min(1),
  reason: z.string().min(1),
  notes: z.string().optional()
})

/**
 * GET /api/inventory/advanced
 * Get advanced inventory operations and analytics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const operation = searchParams.get('operation')

    switch (operation) {
      case 'abc-analysis':
        return await handleABCAnalysis(searchParams)
      
      case 'stock-status':
        return await handleStockStatus(searchParams)
      
      case 'reorder-suggestions':
        return await handleReorderSuggestions(searchParams)
      
      case 'inventory-kpis':
        return await handleInventoryKPIs(searchParams)
      
      case 'valuation':
        return await handleInventoryValuation(searchParams)
      
      default:
        return NextResponse.json(
          { error: 'Invalid or missing operation parameter' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in GET /api/inventory/advanced:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/inventory/advanced
 * Execute advanced inventory operations
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const operation = searchParams.get('operation')
    const body = await request.json()

    switch (operation) {
      case 'stock-transfer':
        return await handleStockTransfer(body, session.user.id)
      
      case 'stock-reservation':
        return await handleStockReservation(body, session.user.id)
      
      case 'batch-transfer':
        return await handleBatchTransfer(body, session.user.id)
      
      case 'release-reservation':
        return await handleReleaseReservation(body, session.user.id)
      
      default:
        return NextResponse.json(
          { error: 'Invalid or missing operation parameter' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in POST /api/inventory/advanced:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handler functions for GET operations

async function handleABCAnalysis(searchParams: URLSearchParams) {
  const params = {
    analysisDate: searchParams.get('analysisDate'),
    locationIds: searchParams.get('locationIds'),
    includeInactive: searchParams.get('includeInactive') === 'true'
  }

  const validation = abcAnalysisSchema.safeParse(params)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', details: validation.error.issues },
      { status: 400 }
    )
  }

  const { analysisDate, locationIds, includeInactive } = validation.data

  const result = await comprehensiveInventoryService.performABCAnalysis(
    analysisDate ? new Date(analysisDate) : undefined,
    locationIds ? locationIds.split(',') : undefined
  )

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    data: result.data,
    metadata: result.metadata
  })
}

async function handleStockStatus(searchParams: URLSearchParams) {
  const params = {
    itemIds: searchParams.get('itemIds'),
    includeAnalytics: searchParams.get('includeAnalytics') !== 'false',
    locationIds: searchParams.get('locationIds')
  }

  const validation = stockStatusSchema.safeParse(params)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', details: validation.error.issues },
      { status: 400 }
    )
  }

  const { itemIds, includeAnalytics } = validation.data

  const result = await comprehensiveInventoryService.getEnhancedStockStatus(
    itemIds ? itemIds.split(',') : undefined,
    includeAnalytics
  )

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    data: result.data,
    metadata: result.metadata
  })
}

async function handleReorderSuggestions(searchParams: URLSearchParams) {
  const params = {
    includeAll: searchParams.get('includeAll') === 'true',
    locationIds: searchParams.get('locationIds'),
    urgencyLevel: searchParams.get('urgencyLevel'),
    businessImpact: searchParams.get('businessImpact')
  }

  const validation = reorderSuggestionsSchema.safeParse(params)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', details: validation.error.issues },
      { status: 400 }
    )
  }

  const { includeAll, locationIds } = validation.data

  const result = await comprehensiveInventoryService.generateReorderSuggestions(
    includeAll,
    locationIds ? locationIds.split(',') : undefined
  )

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    )
  }

  // Filter by urgency and business impact if specified
  let filteredData = result.data || []
  
  if (params.urgencyLevel) {
    filteredData = filteredData.filter(item => item.urgencyLevel === params.urgencyLevel)
  }
  
  if (params.businessImpact) {
    filteredData = filteredData.filter(item => item.businessImpact === params.businessImpact)
  }

  return NextResponse.json({
    success: true,
    data: filteredData,
    metadata: {
      ...result.metadata,
      totalBeforeFilter: result.data?.length || 0,
      filteredCount: filteredData.length
    }
  })
}

async function handleInventoryKPIs(searchParams: URLSearchParams) {
  const params = {
    periodDays: searchParams.get('periodDays') ? parseInt(searchParams.get('periodDays')!) : 365,
    locationIds: searchParams.get('locationIds'),
    includeProjections: searchParams.get('includeProjections') === 'true'
  }

  const validation = inventoryKPIsSchema.safeParse(params)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', details: validation.error.issues },
      { status: 400 }
    )
  }

  const { periodDays, locationIds } = validation.data

  const result = await comprehensiveInventoryService.generateInventoryKPIs(
    periodDays,
    locationIds ? locationIds.split(',') : undefined
  )

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    data: result.data,
    metadata: {
      ...result.metadata,
      periodDays,
      calculationDate: new Date().toISOString()
    }
  })
}

async function handleInventoryValuation(searchParams: URLSearchParams) {
  const method = searchParams.get('method') || 'WEIGHTED_AVERAGE'
  const currency = searchParams.get('currency') || 'USD'
  const asOfDate = searchParams.get('asOfDate')
  const locationIds = searchParams.get('locationIds')
  const categoryIds = searchParams.get('categoryIds')
  const includeInactive = searchParams.get('includeInactive') === 'true'
  const includeZeroStock = searchParams.get('includeZeroStock') === 'true'

  const result = await comprehensiveInventoryService.calculateInventoryValuation({
    method: method as any,
    currency,
    asOfDate: asOfDate ? new Date(asOfDate) : undefined,
    locationIds: locationIds ? locationIds.split(',') : undefined,
    categoryIds: categoryIds ? categoryIds.split(',') : undefined,
    includeInactive,
    includeZeroStock
  })

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    data: result.data,
    metadata: result.metadata
  })
}

// Handler functions for POST operations

async function handleStockTransfer(body: any, userId: string) {
  const validation = stockTransferSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: validation.error.issues },
      { status: 400 }
    )
  }

  const { fromLocationId, toLocationId, items, priority, notes, referenceNo, referenceType, autoApprove } = validation.data

  const result = await stockMovementService.executeStockTransfer(
    fromLocationId,
    toLocationId,
    items,
    userId,
    {
      priority,
      notes,
      referenceNo,
      referenceType,
      autoApprove
    }
  )

  if (!result.success) {
    return NextResponse.json(
      { 
        error: result.error,
        warnings: result.warnings 
      },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
    data: result.data,
    warnings: result.warnings,
    metadata: {
      affectedItems: result.affectedItems,
      transactionIds: result.transactionIds
    }
  }, { status: 201 })
}

async function handleStockReservation(body: any, userId: string) {
  const validation = stockReservationSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: validation.error.issues },
      { status: 400 }
    )
  }

  const { itemId, locationId, quantity, reservedFor, reservationType, expiryDate, priority, notes } = validation.data

  const result = await stockMovementService.createStockReservation(
    itemId,
    locationId,
    quantity,
    userId,
    reservedFor,
    {
      reservationType,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      priority,
      notes
    }
  )

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
    data: result.data,
    metadata: {
      reservationIds: result.reservationIds
    }
  }, { status: 201 })
}

async function handleBatchTransfer(body: any, userId: string) {
  const validation = batchTransferSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: validation.error.issues },
      { status: 400 }
    )
  }

  const validatedData = validation.data
  const now = new Date()
  const operationNumber = `BO-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Date.now()}`

  const batchOperation = {
    id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    operationNumber,
    operationType: validatedData.operationType,
    fromLocationId: validatedData.fromLocationId,
    toLocationId: validatedData.toLocationId,
    requestedBy: userId,
    requestDate: now,
    scheduledDate: validatedData.scheduledDate ? new Date(validatedData.scheduledDate) : undefined,
    status: 'planned' as const,
    totalItems: validatedData.items.length,
    totalValue: {
      amount: validatedData.items.reduce((sum, item) => sum + (item.plannedQuantity * item.unitCost.amount), 0),
      currency: validatedData.items[0]?.unitCost.currency || 'USD'
    },
    completionPercentage: 0,
    items: validatedData.items.map((item, index) => ({
      id: `item-${index}-${Date.now()}`,
      batchTransferId: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      itemId: item.itemId,
      plannedQuantity: item.plannedQuantity,
      unitCost: item.unitCost,
      totalCost: {
        amount: item.plannedQuantity * item.unitCost.amount,
        currency: item.unitCost.currency
      },
      status: 'pending' as const,
      notes: item.notes
    })),
    notes: validatedData.notes,
    createdAt: now,
    updatedAt: now,
    createdBy: userId
  }

  const result = await stockMovementService.executeBatchTransfer(batchOperation, userId)

  if (!result.success) {
    return NextResponse.json(
      { 
        error: result.error,
        warnings: result.warnings 
      },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
    data: result.data,
    warnings: result.warnings
  }, { status: 201 })
}

async function handleReleaseReservation(body: any, userId: string) {
  const schema = z.object({
    reservationId: z.string().min(1),
    reason: z.string().optional(),
    partialQuantity: z.number().min(0.01).optional()
  })

  const validation = schema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: validation.error.issues },
      { status: 400 }
    )
  }

  const { reservationId, reason, partialQuantity } = validation.data

  const result = await stockMovementService.releaseStockReservation(
    reservationId,
    userId,
    { reason, partialQuantity }
  )

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
    data: result.data,
    metadata: {
      reservationIds: result.reservationIds
    }
  })
}