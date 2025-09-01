/**
 * Stock Movements API Routes
 * 
 * API endpoints for managing stock movements including transfers,
 * returns, and allocations between locations.
 */

import { NextRequest, NextResponse } from 'next/server'
import { stockMovementService } from '@/lib/services/db/stock-movement-service'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Validation schemas
const createMovementItemSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  requestedQuantity: z.number().positive('Requested quantity must be positive'),
  unitCost: z.object({
    amount: z.number().min(0, 'Unit cost amount must be non-negative'),
    currencyCode: z.string().length(3, 'Currency code must be 3 characters')
  }),
  batchNo: z.string().optional(),
  lotNo: z.string().optional(),
  expiryDate: z.string().optional(),
  notes: z.string().optional()
})

const createStockMovementSchema = z.object({
  movementNumber: z.string().optional(),
  movementDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid movement date'),
  movementType: z.enum(['transfer', 'return', 'allocation']),
  fromLocationId: z.string().min(1, 'From location ID is required'),
  toLocationId: z.string().min(1, 'To location ID is required'),
  priority: z.enum(['normal', 'urgent', 'emergency']).optional().default('normal'),
  notes: z.string().optional(),
  items: z.array(createMovementItemSchema).min(1, 'At least one item is required')
})

const movementFiltersSchema = z.object({
  movementType: z.string().optional(),
  status: z.string().optional(),
  fromLocationIds: z.string().optional(),
  toLocationIds: z.string().optional(),
  priority: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  requestedBy: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
})

/**
 * GET /api/inventory/movements
 * Get stock movements with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    
    const validation = movementFiltersSchema.safeParse(params)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: validation.error.issues 
        },
        { status: 400 }
      )
    }

    const {
      movementType,
      status,
      fromLocationIds,
      toLocationIds,
      priority,
      dateFrom,
      dateTo,
      requestedBy,
      search,
      page,
      limit,
      sortBy,
      sortOrder
    } = validation.data

    // Parse filters
    const filters = {
      movementType: movementType?.split(',').filter(Boolean) as any[],
      status: status?.split(',').filter(Boolean) as any[],
      fromLocationIds: fromLocationIds?.split(',').filter(Boolean),
      toLocationIds: toLocationIds?.split(',').filter(Boolean),
      priority: priority?.split(',').filter(Boolean) as any[],
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      requestedBy: requestedBy?.split(',').filter(Boolean),
      search
    }

    // Parse pagination
    const pagination = {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      sortBy: sortBy || 'movement_date',
      sortOrder: sortOrder || 'desc'
    }

    const result = await stockMovementService.getStockMovements(filters, pagination)
    
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
  } catch (error) {
    console.error('Error in GET /api/inventory/movements:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/inventory/movements
 * Create new stock movement
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

    const body = await request.json()
    
    const validation = createStockMovementSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validation.error.issues 
        },
        { status: 400 }
      )
    }

    const {
      movementNumber,
      movementDate,
      movementType,
      fromLocationId,
      toLocationId,
      priority,
      notes,
      items
    } = validation.data

    // Transform items to match service interface
    const movementItems = items.map(item => ({
      itemId: item.itemId,
      requestedQuantity: item.requestedQuantity,
      unitCost: item.unitCost,
      batchNo: item.batchNo,
      lotNo: item.lotNo,
      expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
      notes: item.notes
    }))

    const input = {
      movementNumber,
      movementDate: new Date(movementDate),
      movementType,
      fromLocationId,
      toLocationId,
      priority,
      notes,
      requestedBy: session.user.id,
      items: movementItems
    }

    const result = await stockMovementService.createStockMovement(input)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/inventory/movements:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}