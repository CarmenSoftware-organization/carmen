/**
 * Inventory Adjustments API Routes
 * 
 * API endpoints for managing inventory adjustments including positive
 * and negative adjustments with approval workflows.
 */

import { NextRequest, NextResponse } from 'next/server'
import { stockMovementService } from '@/lib/services/db/stock-movement-service'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Validation schemas
const createAdjustmentItemSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  currentQuantity: z.number().min(0, 'Current quantity must be non-negative'),
  adjustmentQuantity: z.number().refine(
    (val) => val !== 0, 
    'Adjustment quantity cannot be zero'
  ),
  unitCost: z.object({
    amount: z.number().min(0, 'Unit cost amount must be non-negative'),
    currencyCode: z.string().length(3, 'Currency code must be 3 characters')
  }),
  reason: z.string().optional(),
  batchNo: z.string().optional(),
  lotNo: z.string().optional(),
  expiryDate: z.string().optional(),
  notes: z.string().optional()
})

const createInventoryAdjustmentSchema = z.object({
  adjustmentNumber: z.string().optional(),
  adjustmentDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid adjustment date'),
  adjustmentType: z.enum(['increase', 'decrease']),
  reason: z.enum([
    'DAMAGED', 'EXPIRED', 'LOST', 'STOLEN', 'COUNT_VARIANCE', 
    'SYSTEM_ERROR', 'CONVERSION', 'RECLASSIFICATION', 'OTHER'
  ]),
  locationId: z.string().min(1, 'Location ID is required'),
  description: z.string().optional(),
  items: z.array(createAdjustmentItemSchema).min(1, 'At least one item is required'),
  attachments: z.array(z.string()).optional()
})

const adjustmentFiltersSchema = z.object({
  adjustmentType: z.string().optional(),
  reason: z.string().optional(),
  status: z.string().optional(),
  locationIds: z.string().optional(),
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
 * GET /api/inventory/adjustments
 * Get inventory adjustments with filtering and pagination
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
    
    const validation = adjustmentFiltersSchema.safeParse(params)
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
      adjustmentType,
      reason,
      status,
      locationIds,
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
      adjustmentType: adjustmentType?.split(',').filter(Boolean) as any[],
      reason: reason?.split(',').filter(Boolean) as any[],
      status: status?.split(',').filter(Boolean) as any[],
      locationIds: locationIds?.split(',').filter(Boolean),
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      requestedBy: requestedBy?.split(',').filter(Boolean),
      search
    }

    // Parse pagination
    const pagination = {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      sortBy: sortBy || 'adjustment_date',
      sortOrder: sortOrder || 'desc'
    }

    const result = await stockMovementService.getInventoryAdjustments(filters, pagination)
    
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
    console.error('Error in GET /api/inventory/adjustments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/inventory/adjustments
 * Create new inventory adjustment
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
    
    const validation = createInventoryAdjustmentSchema.safeParse(body)
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
      adjustmentNumber,
      adjustmentDate,
      adjustmentType,
      reason,
      locationId,
      description,
      items,
      attachments
    } = validation.data

    // Transform items to match service interface
    const adjustmentItems = items.map(item => {
      // Calculate new quantity based on adjustment type
      const newQuantity = adjustmentType === 'increase' 
        ? item.currentQuantity + Math.abs(item.adjustmentQuantity)
        : Math.max(0, item.currentQuantity - Math.abs(item.adjustmentQuantity))

      return {
        itemId: item.itemId,
        currentQuantity: item.currentQuantity,
        adjustmentQuantity: Math.abs(item.adjustmentQuantity),
        unitCost: item.unitCost,
        reason: item.reason,
        batchNo: item.batchNo,
        lotNo: item.lotNo,
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
        notes: item.notes
      }
    })

    const input = {
      adjustmentNumber,
      adjustmentDate: new Date(adjustmentDate),
      adjustmentType,
      reason: reason as any,
      locationId,
      description,
      requestedBy: session.user.id,
      items: adjustmentItems,
      attachments
    }

    const result = await stockMovementService.createInventoryAdjustment(input)
    
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
    console.error('Error in POST /api/inventory/adjustments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}