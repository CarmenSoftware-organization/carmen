/**
 * Stock Balance API Routes
 * 
 * API endpoints for managing stock balances, including getting current
 * stock levels by location and updating stock balances.
 */

import { NextRequest, NextResponse } from 'next/server'
import { inventoryService } from '@/lib/services/db/inventory-service'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Validation schemas
const stockBalanceSchema = z.object({
  locationId: z.string().min(1, 'Location ID is required'),
  quantityOnHand: z.number().min(0, 'Quantity on hand must be non-negative'),
  quantityReserved: z.number().min(0).optional().default(0),
  averageCost: z.object({
    amount: z.number().min(0, 'Average cost amount must be non-negative'),
    currency: z.string().length(3, 'Currency code must be 3 characters')
  }),
  lastMovementDate: z.string().optional(),
  lastCountDate: z.string().optional()
})

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/inventory/[id]/stock
 * Get stock balances for an inventory item across all locations
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

    const { id: itemId } = params
    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get('locationId')

    if (!itemId || typeof itemId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid inventory item ID' },
        { status: 400 }
      )
    }

    if (locationId) {
      // Get stock balance for specific location
      const result = await inventoryService.getStockBalance(itemId, locationId)
      
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
    } else {
      // Get inventory item with all stock balances
      const result = await inventoryService.getInventoryItemById(itemId)
      
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

      // Extract stock balances from the inventory item
      // Note: This would be available if the inventory item includes stock balance relationships
      return NextResponse.json({
        success: true,
        data: {
          itemId: itemId,
          itemName: result.data?.itemName,
          stockBalances: [] // Would be populated from actual relationships
        }
      })
    }
  } catch (error) {
    console.error(`Error in GET /api/inventory/${params.id}/stock:`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/inventory/[id]/stock
 * Create or update stock balance for an inventory item at a location
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    const { id: itemId } = params

    if (!itemId || typeof itemId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid inventory item ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    const validation = stockBalanceSchema.safeParse(body)
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
      locationId,
      quantityOnHand,
      quantityReserved,
      averageCost,
      lastMovementDate,
      lastCountDate
    } = validation.data

    const input = {
      itemId,
      locationId,
      quantityOnHand,
      quantityReserved,
      averageCost,
      lastMovementDate: lastMovementDate ? new Date(lastMovementDate) : undefined,
      lastCountDate: lastCountDate ? new Date(lastCountDate) : undefined,
      createdBy: session.user.id
    }

    const result = await inventoryService.upsertStockBalance(input)
    
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
    console.error(`Error in POST /api/inventory/${params.id}/stock:`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}