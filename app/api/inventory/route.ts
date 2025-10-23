/**
 * Inventory Management API Routes
 * 
 * Main API endpoints for inventory operations including CRUD operations,
 * stock management, and inventory reporting.
 */

import { NextRequest, NextResponse } from 'next/server'
import { inventoryService } from '@/lib/services/db/inventory-service'
import { inventoryValuationService } from '@/lib/services/db/inventory-valuation-service'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Validation schemas
const createInventoryItemSchema = z.object({
  itemCode: z.string().optional(),
  itemName: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category ID is required'),
  baseUnitId: z.string().min(1, 'Base unit ID is required'),
  costingMethod: z.enum(['FIFO', 'LIFO', 'MOVING_AVERAGE', 'WEIGHTED_AVERAGE', 'STANDARD_COST']).optional(),
  isActive: z.boolean().optional(),
  isSerialized: z.boolean().optional(),
  minimumQuantity: z.number().min(0).optional(),
  maximumQuantity: z.number().min(0).optional(),
  reorderPoint: z.number().min(0).optional(),
  reorderQuantity: z.number().min(0).optional(),
  leadTimeDays: z.number().min(0).optional()
})

const inventoryFiltersSchema = z.object({
  categoryIds: z.string().optional(),
  locationIds: z.string().optional(),
  itemCodes: z.string().optional(),
  search: z.string().optional(),
  isActive: z.string().optional(),
  hasStock: z.string().optional(),
  isLowStock: z.string().optional(),
  isOutOfStock: z.string().optional(),
  costingMethod: z.string().optional(),
  lastMovementAfter: z.string().optional(),
  lastMovementBefore: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
})

/**
 * GET /api/inventory
 * Get inventory items with filtering and pagination
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
    
    const validation = inventoryFiltersSchema.safeParse(params)
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
      categoryIds,
      locationIds,
      itemCodes,
      search,
      isActive,
      hasStock,
      isLowStock,
      isOutOfStock,
      costingMethod,
      lastMovementAfter,
      lastMovementBefore,
      page,
      limit,
      sortBy,
      sortOrder
    } = validation.data

    // Parse filters
    const filters = {
      categoryIds: categoryIds?.split(',').filter(Boolean),
      locationIds: locationIds?.split(',').filter(Boolean),
      itemCodes: itemCodes?.split(',').filter(Boolean),
      search,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      hasStock: hasStock === 'true' ? true : hasStock === 'false' ? false : undefined,
      isLowStock: isLowStock === 'true',
      isOutOfStock: isOutOfStock === 'true',
      costingMethod: costingMethod ? [costingMethod as any] : undefined,
      lastMovementAfter: lastMovementAfter ? new Date(lastMovementAfter) : undefined,
      lastMovementBefore: lastMovementBefore ? new Date(lastMovementBefore) : undefined
    }

    // Parse pagination
    const pagination = {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      sortBy: sortBy as any,
      sortOrder
    }

    const result = await inventoryService.getInventoryItems(filters, pagination)
    
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
    console.error('Error in GET /api/inventory:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/inventory
 * Create new inventory item
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
    
    const validation = createInventoryItemSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validation.error.issues 
        },
        { status: 400 }
      )
    }

    const input: typeof validation.data & { createdBy: string } = {
      ...validation.data,
      createdBy: session.user.id
    }

    const result = await inventoryService.createInventoryItem(input as any)
    
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
    console.error('Error in POST /api/inventory:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/inventory/statistics
 * Get inventory statistics and overview
 * NOTE: This should be moved to app/api/inventory/statistics/route.ts
 */
async function getStatistics(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    const result = await inventoryService.getInventoryStatistics()
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('Error in GET /api/inventory/statistics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/inventory/valuation
 * Get inventory valuation summary
 * NOTE: This should be moved to app/api/inventory/valuation/route.ts
 */
async function getValuation(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const locationIds = searchParams.get('locationIds')?.split(',').filter(Boolean)
    const categoryIds = searchParams.get('categoryIds')?.split(',').filter(Boolean)
    const valuationDate = searchParams.get('valuationDate')
    const costingMethod = searchParams.get('costingMethod') as any
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const includeZeroStock = searchParams.get('includeZeroStock') === 'true'

    const filters = {
      locationIds,
      categoryIds,
      valuationDate: valuationDate ? new Date(valuationDate) : undefined,
      costingMethod,
      includeInactive,
      includeZeroStock
    }

    const result = await inventoryValuationService.calculateInventoryValuation(filters)
    
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
    console.error('Error in GET /api/inventory/valuation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}