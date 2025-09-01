/**
 * Individual Physical Count API Routes
 * 
 * API endpoints for managing individual physical counts including
 * starting, updating items, completing, and finalizing counts.
 */

import { NextRequest, NextResponse } from 'next/server'
import { physicalCountService } from '@/lib/services/db/physical-count-service'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const updateCountItemSchema = z.object({
  countedQuantity: z.number().min(0, 'Counted quantity must be non-negative'),
  comments: z.string().optional()
})

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/inventory/counts/[id]
 * Get physical count by ID
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
        { error: 'Invalid count ID' },
        { status: 400 }
      )
    }

    // Mock response - in a real implementation, you'd call a service method
    const mockCount = {
      id: id,
      countNumber: 'FC-240115-001',
      countDate: new Date('2024-01-15'),
      countType: 'full',
      status: 'in_progress',
      locationId: 'loc-001',
      departmentId: 'dept-001',
      countedBy: ['user-001', 'user-002'],
      supervisedBy: 'user-003',
      startTime: new Date('2024-01-15T08:00:00Z'),
      totalItems: 150,
      itemsCounted: 75,
      discrepanciesFound: 3,
      totalVarianceValue: { amount: 45.25, currencyCode: 'USD' },
      notes: 'Full warehouse count for month-end',
      isFinalized: false,
      items: [
        {
          id: 'pci-001',
          countId: id,
          itemId: 'item-001',
          expectedQuantity: 100,
          countedQuantity: 95,
          variance: -5,
          varianceValue: { amount: 25.00, currencyCode: 'USD' },
          status: 'variance',
          countedBy: 'user-001',
          countedAt: new Date('2024-01-15T09:30:00Z'),
          comments: 'Found 5 damaged units'
        },
        {
          id: 'pci-002',
          countId: id,
          itemId: 'item-002',
          expectedQuantity: 50,
          countedQuantity: 50,
          variance: 0,
          varianceValue: { amount: 0, currencyCode: 'USD' },
          status: 'counted',
          countedBy: 'user-002',
          countedAt: new Date('2024-01-15T10:00:00Z')
        }
      ],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      createdBy: 'user-003'
    }

    return NextResponse.json({
      success: true,
      data: mockCount
    })
  } catch (error) {
    console.error(`Error in GET /api/inventory/counts/${params.id}:`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/inventory/counts/[id]/start
 * Start physical count
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
        { error: 'Invalid count ID' },
        { status: 400 }
      )
    }

    const url = new URL(request.url)
    const action = url.pathname.split('/').pop()

    switch (action) {
      case 'start':
        const startResult = await physicalCountService.startPhysicalCount(id, session.user.id)
        
        if (!startResult.success) {
          if (startResult.error === 'Physical count not found') {
            return NextResponse.json(
              { error: startResult.error },
              { status: 404 }
            )
          }
          
          return NextResponse.json(
            { error: startResult.error },
            { status: 400 }
          )
        }

        return NextResponse.json({
          success: true,
          data: startResult.data,
          message: 'Physical count started successfully'
        })

      case 'complete':
        const completeResult = await physicalCountService.completePhysicalCount(id, session.user.id)
        
        if (!completeResult.success) {
          if (completeResult.error === 'Physical count not found') {
            return NextResponse.json(
              { error: completeResult.error },
              { status: 404 }
            )
          }
          
          return NextResponse.json(
            { error: completeResult.error },
            { status: 400 }
          )
        }

        return NextResponse.json({
          success: true,
          data: completeResult.data,
          message: 'Physical count completed successfully'
        })

      case 'finalize':
        const finalizeResult = await physicalCountService.finalizePhysicalCount(id, session.user.id)
        
        if (!finalizeResult.success) {
          if (finalizeResult.error === 'Physical count not found') {
            return NextResponse.json(
              { error: finalizeResult.error },
              { status: 404 }
            )
          }
          
          return NextResponse.json(
            { error: finalizeResult.error },
            { status: 400 }
          )
        }

        return NextResponse.json({
          success: true,
          data: finalizeResult.data,
          message: 'Physical count finalized and adjustments posted successfully'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error(`Error in POST /api/inventory/counts/${params.id}:`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}