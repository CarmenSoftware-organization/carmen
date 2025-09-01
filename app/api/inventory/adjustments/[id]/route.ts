/**
 * Individual Inventory Adjustment API Routes
 * 
 * API endpoints for managing individual inventory adjustments including
 * approval, rejection, and status updates.
 */

import { NextRequest, NextResponse } from 'next/server'
import { stockMovementService } from '@/lib/services/db/stock-movement-service'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/inventory/adjustments/[id]
 * Get inventory adjustment by ID
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
        { error: 'Invalid adjustment ID' },
        { status: 400 }
      )
    }

    // Mock response - in a real implementation, you'd call a service method
    const mockAdjustment = {
      id: id,
      adjustmentNumber: 'ADJ-001',
      adjustmentDate: new Date('2024-01-15'),
      adjustmentType: 'decrease',
      reason: 'COUNT_VARIANCE',
      locationId: 'loc-001',
      status: 'draft',
      requestedBy: 'user-001',
      totalItems: 2,
      totalValue: { amount: 500.00, currencyCode: 'USD' },
      description: 'Physical count variance adjustment',
      items: [
        {
          id: 'iai-001',
          adjustmentId: id,
          itemId: 'item-001',
          currentQuantity: 100,
          adjustmentQuantity: -10,
          newQuantity: 90,
          unitCost: { amount: 25.00, currencyCode: 'USD' },
          totalValue: { amount: 250.00, currencyCode: 'USD' },
          reason: 'Found damaged items during count'
        },
        {
          id: 'iai-002',
          adjustmentId: id,
          itemId: 'item-002',
          currentQuantity: 50,
          adjustmentQuantity: -5,
          newQuantity: 45,
          unitCost: { amount: 50.00, currencyCode: 'USD' },
          totalValue: { amount: 250.00, currencyCode: 'USD' },
          reason: 'Missing items'
        }
      ],
      attachments: [],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      createdBy: 'user-001'
    }

    return NextResponse.json({
      success: true,
      data: mockAdjustment
    })
  } catch (error) {
    console.error(`Error in GET /api/inventory/adjustments/${params.id}:`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/inventory/adjustments/[id]/approve
 * Approve inventory adjustment
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

    const { id } = params

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid adjustment ID' },
        { status: 400 }
      )
    }

    const url = new URL(request.url)
    const action = url.pathname.split('/').pop()

    if (action === 'approve') {
      const result = await stockMovementService.approveInventoryAdjustment(id, session.user.id)
      
      if (!result.success) {
        if (result.error === 'Inventory adjustment not found') {
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
        data: result.data,
        message: 'Inventory adjustment approved and executed successfully'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error(`Error in POST /api/inventory/adjustments/${params.id}:`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/inventory/adjustments/[id]
 * Update inventory adjustment (only for draft adjustments)
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
        { error: 'Invalid adjustment ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // For now, we'll return a mock response
    // In a real implementation, you'd validate the input and update the adjustment
    
    return NextResponse.json({
      success: true,
      message: 'Inventory adjustment updated successfully'
    })
  } catch (error) {
    console.error(`Error in PUT /api/inventory/adjustments/${params.id}:`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/inventory/adjustments/[id]
 * Cancel inventory adjustment (only for draft adjustments)
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
        { error: 'Invalid adjustment ID' },
        { status: 400 }
      )
    }

    // For now, we'll return a mock response
    // In a real implementation, you'd cancel the adjustment if it's in draft status
    
    return NextResponse.json({
      success: true,
      message: 'Inventory adjustment cancelled successfully'
    })
  } catch (error) {
    console.error(`Error in DELETE /api/inventory/adjustments/${params.id}:`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}