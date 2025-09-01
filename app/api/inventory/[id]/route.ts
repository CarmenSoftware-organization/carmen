/**
 * Individual Inventory Item API Routes
 * 
 * API endpoints for managing individual inventory items including
 * updates, stock balance information, and item-specific operations.
 */

import { NextRequest, NextResponse } from 'next/server'
import { inventoryService } from '@/lib/services/db/inventory-service'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Validation schemas
const updateInventoryItemSchema = z.object({
  itemName: z.string().min(1).optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1).optional(),
  baseUnitId: z.string().min(1).optional(),
  costingMethod: z.enum(['FIFO', 'LIFO', 'MOVING_AVERAGE', 'WEIGHTED_AVERAGE', 'STANDARD_COST']).optional(),
  isActive: z.boolean().optional(),
  isSerialized: z.boolean().optional(),
  minimumQuantity: z.number().min(0).optional(),
  maximumQuantity: z.number().min(0).optional(),
  reorderPoint: z.number().min(0).optional(),
  reorderQuantity: z.number().min(0).optional(),
  leadTimeDays: z.number().min(0).optional()
})

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/inventory/[id]
 * Get inventory item by ID with stock information
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    const { id } = params

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid inventory item ID' },
        { status: 400 }
      )
    }

    const result = await inventoryService.getInventoryItemById(id)
    
    if (!result.success) {
      if (result.error === 'Inventory item not found') {
        return NextResponse.json(
          { error: result.error },
          { status: 404 }
        )
      }
      
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
    console.error(`Error in GET /api/inventory/${params.id}:`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/inventory/[id]
 * Update inventory item
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    const { id } = params

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid inventory item ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    const validation = updateInventoryItemSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validation.error.issues 
        },
        { status: 400 }
      )
    }

    const input = {
      ...validation.data,
      updatedBy: session.user.id
    }

    const result = await inventoryService.updateInventoryItem(id, input)
    
    if (!result.success) {
      if (result.error === 'Inventory item not found') {
        return NextResponse.json(
          { error: result.error },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error(`Error in PUT /api/inventory/${params.id}:`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/inventory/[id]
 * Soft delete inventory item (mark as inactive)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    const { id } = params

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid inventory item ID' },
        { status: 400 }
      )
    }

    // For now, we'll mark as inactive instead of actual deletion
    const result = await inventoryService.updateInventoryItem(id, {
      isActive: false,
      updatedBy: session.user.id
    })
    
    if (!result.success) {
      if (result.error === 'Inventory item not found') {
        return NextResponse.json(
          { error: result.error },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Inventory item deactivated successfully'
    })
  } catch (error) {
    console.error(`Error in DELETE /api/inventory/${params.id}:`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}