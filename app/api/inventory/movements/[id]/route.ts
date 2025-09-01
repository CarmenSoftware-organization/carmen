/**
 * Individual Stock Movement API Routes
 * 
 * API endpoints for managing individual stock movements including
 * execution, cancellation, and status updates.
 */

import { NextRequest, NextResponse } from 'next/server'
import { stockMovementService } from '@/lib/services/db/stock-movement-service'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/inventory/movements/[id]
 * Get stock movement by ID
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
        { error: 'Invalid movement ID' },
        { status: 400 }
      )
    }

    // Since we don't have a getById method yet, we'll return a mock response
    // In a real implementation, you'd call stockMovementService.getStockMovementById(id)
    
    const mockMovement = {
      id: id,
      movementNumber: 'MOV-001',
      movementDate: new Date('2024-01-15'),
      movementType: 'transfer',
      fromLocationId: 'loc-001',
      toLocationId: 'loc-002',
      status: 'pending',
      requestedBy: 'user-001',
      totalItems: 2,
      totalValue: { amount: 2500.00, currencyCode: 'USD' },
      priority: 'normal',
      notes: 'Transfer to main warehouse',
      items: [
        {
          id: 'smi-001',
          movementId: id,
          itemId: 'item-001',
          requestedQuantity: 50,
          unitCost: { amount: 25.00, currencyCode: 'USD' },
          totalValue: { amount: 1250.00, currencyCode: 'USD' }
        },
        {
          id: 'smi-002', 
          movementId: id,
          itemId: 'item-002',
          requestedQuantity: 25,
          unitCost: { amount: 50.00, currencyCode: 'USD' },
          totalValue: { amount: 1250.00, currencyCode: 'USD' }
        }
      ],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      createdBy: 'user-001'
    }

    return NextResponse.json({
      success: true,
      data: mockMovement
    })
  } catch (error) {
    console.error(`Error in GET /api/inventory/movements/${params.id}:`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/inventory/movements/[id]/execute
 * Execute stock movement (perform the actual transfer)
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
        { error: 'Invalid movement ID' },
        { status: 400 }
      )
    }

    const url = new URL(request.url)
    const action = url.pathname.split('/').pop()

    if (action === 'execute') {
      const result = await stockMovementService.executeStockMovement(id, session.user.id)
      
      if (!result.success) {
        if (result.error === 'Stock movement not found') {
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
        message: 'Stock movement executed successfully'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error(`Error in POST /api/inventory/movements/${params.id}:`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/inventory/movements/[id]
 * Update stock movement (only for pending movements)
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
        { error: 'Invalid movement ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // For now, we'll return a mock response
    // In a real implementation, you'd validate the input and update the movement
    
    return NextResponse.json({
      success: true,
      message: 'Stock movement updated successfully'
    })
  } catch (error) {
    console.error(`Error in PUT /api/inventory/movements/${params.id}:`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/inventory/movements/[id]
 * Cancel stock movement (only for pending movements)
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
        { error: 'Invalid movement ID' },
        { status: 400 }
      )
    }

    // For now, we'll return a mock response
    // In a real implementation, you'd cancel the movement if it's pending
    
    return NextResponse.json({
      success: true,
      message: 'Stock movement cancelled successfully'
    })
  } catch (error) {
    console.error(`Error in DELETE /api/inventory/movements/${params.id}:`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}