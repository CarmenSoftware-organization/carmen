/**
 * Physical Counts API Routes
 * 
 * API endpoints for managing physical inventory counts including
 * full counts, cycle counts, and spot checks.
 */

import { NextRequest, NextResponse } from 'next/server'
import { physicalCountService } from '@/lib/services/db/physical-count-service'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Validation schemas
const createPhysicalCountSchema = z.object({
  countNumber: z.string().optional(),
  countDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid count date'),
  countType: z.enum(['full', 'cycle', 'spot']),
  locationId: z.string().min(1, 'Location ID is required'),
  departmentId: z.string().optional(),
  countedBy: z.array(z.string()).min(1, 'At least one counter is required'),
  supervisedBy: z.string().optional(),
  notes: z.string().optional(),
  itemIds: z.array(z.string()).optional() // For cycle counts
})

const updateCountItemSchema = z.object({
  countedQuantity: z.number().min(0, 'Counted quantity must be non-negative'),
  comments: z.string().optional()
})

const countFiltersSchema = z.object({
  countType: z.string().optional(),
  status: z.string().optional(),
  locationIds: z.string().optional(),
  departmentIds: z.string().optional(),
  countedBy: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  hasDiscrepancies: z.string().optional(),
  isFinalized: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
})

/**
 * GET /api/inventory/counts
 * Get physical counts with filtering and pagination
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
    
    const validation = countFiltersSchema.safeParse(params)
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
      countType,
      status,
      locationIds,
      departmentIds,
      countedBy,
      dateFrom,
      dateTo,
      hasDiscrepancies,
      isFinalized,
      search,
      page,
      limit,
      sortBy,
      sortOrder
    } = validation.data

    // Mock response for now - would be replaced with actual service call
    const mockCounts = [
      {
        id: 'count-001',
        countNumber: 'FC-240115-001',
        countDate: new Date('2024-01-15'),
        countType: 'full',
        status: 'completed',
        locationId: 'loc-001',
        countedBy: ['user-001', 'user-002'],
        supervisedBy: 'user-003',
        totalItems: 150,
        itemsCounted: 150,
        discrepanciesFound: 5,
        totalVarianceValue: { amount: 125.50, currencyCode: 'USD' },
        isFinalized: false,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      }
    ]

    const totalCount = 1
    const pageNum = page ? parseInt(page) : 1
    const limitNum = limit ? parseInt(limit) : 50

    return NextResponse.json({
      success: true,
      data: mockCounts,
      metadata: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    })
  } catch (error) {
    console.error('Error in GET /api/inventory/counts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/inventory/counts
 * Create new physical count
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
    
    const validation = createPhysicalCountSchema.safeParse(body)
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
      countNumber,
      countDate,
      countType,
      locationId,
      departmentId,
      countedBy,
      supervisedBy,
      notes,
      itemIds
    } = validation.data

    const input = {
      countNumber,
      countDate: new Date(countDate),
      countType,
      locationId,
      departmentId,
      countedBy,
      supervisedBy,
      notes,
      itemIds,
      createdBy: session.user.id
    }

    const result = await physicalCountService.createPhysicalCount(input)
    
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
    console.error('Error in POST /api/inventory/counts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}