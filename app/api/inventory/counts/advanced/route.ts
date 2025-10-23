/**
 * Advanced Physical Count Management API
 * 
 * Comprehensive API endpoints for physical count operations including
 * count creation, item updates, variance analysis, and spot checks.
 */

import { NextRequest, NextResponse } from 'next/server'
import { physicalCountService } from '@/lib/services/inventory/physical-count-service'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Validation schemas
const createCountSchema = z.object({
  locationId: z.string().min(1),
  countType: z.enum(['full', 'cycle', 'spot']),
  countedBy: z.array(z.string().min(1)).min(1),
  scheduledDate: z.string().datetime().optional(),
  departmentId: z.string().optional(),
  supervisedBy: z.string().optional(),
  itemIds: z.array(z.string().min(1)).optional(),
  categoryIds: z.array(z.string().min(1)).optional(),
  countCriteria: z.object({
    abcClassification: z.array(z.enum(['A', 'B', 'C'])).optional(),
    valueThreshold: z.object({
      amount: z.number().min(0),
      currency: z.string().length(3)
    }).optional(),
    velocityThreshold: z.number().optional(),
    lastCountDaysThreshold: z.number().optional()
  }).optional(),
  notes: z.string().optional()
})

const updateCountItemSchema = z.object({
  countedQuantity: z.number().min(0),
  reasonCode: z.string().optional(),
  comments: z.string().optional(),
  requireRecount: z.boolean().optional()
})

const finalizeCountSchema = z.object({
  autoApproveVariances: z.boolean().optional(),
  varianceThreshold: z.number().min(0).max(100).optional(),
  createAdjustments: z.boolean().optional(),
  notes: z.string().optional()
})

const createSpotCheckSchema = z.object({
  locationId: z.string().min(1),
  reason: z.string().min(1),
  assignedTo: z.string().min(1),
  checkType: z.enum(['random', 'targeted', 'investigative']).optional(),
  itemIds: z.array(z.string().min(1)).optional(),
  sampleSize: z.number().min(1).max(100).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  notes: z.string().optional()
})

const generateScheduleSchema = z.object({
  planId: z.string().min(1),
  schedulePeriodDays: z.number().min(1).max(365).optional()
})

/**
 * GET /api/inventory/counts/advanced
 * Get advanced count operations and analytics
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
    const operation = searchParams.get('operation')

    switch (operation) {
      case 'count-accuracy':
        return await handleCountAccuracy(searchParams)
      
      case 'variance-analysis':
        return await handleVarianceAnalysis(searchParams)
      
      case 'count-schedule':
        return await handleCountScheduleView(searchParams)
      
      case 'count-performance':
        return await handleCountPerformance(searchParams)
      
      default:
        return NextResponse.json(
          { error: 'Invalid or missing operation parameter' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in GET /api/inventory/counts/advanced:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/inventory/counts/advanced
 * Execute advanced count operations
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
      case 'create-count':
        return await handleCreateCount(body, (session.user as any).id)

      case 'update-count-item':
        return await handleUpdateCountItem(body, (session.user as any).id)

      case 'finalize-count':
        return await handleFinalizeCount(body, (session.user as any).id)

      case 'create-spot-check':
        return await handleCreateSpotCheck(body, (session.user as any).id)

      case 'generate-schedule':
        return await handleGenerateSchedule(body, (session.user as any).id)

      case 'recount-items':
        return await handleRecountItems(body, (session.user as any).id)
      
      default:
        return NextResponse.json(
          { error: 'Invalid or missing operation parameter' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in POST /api/inventory/counts/advanced:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handler functions for GET operations

async function handleCountAccuracy(searchParams: URLSearchParams) {
  const locationId = searchParams.get('locationId')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  if (!locationId) {
    return NextResponse.json(
      { error: 'locationId is required' },
      { status: 400 }
    )
  }

  // This would call a method to calculate count accuracy metrics
  const accuracyMetrics = await calculateCountAccuracyMetrics(
    locationId,
    startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate ? new Date(endDate) : new Date()
  )

  return NextResponse.json({
    success: true,
    data: accuracyMetrics,
    metadata: {
      locationId,
      periodStart: startDate,
      periodEnd: endDate,
      calculatedAt: new Date().toISOString()
    }
  })
}

async function handleVarianceAnalysis(searchParams: URLSearchParams) {
  const countId = searchParams.get('countId')

  if (!countId) {
    return NextResponse.json(
      { error: 'countId is required' },
      { status: 400 }
    )
  }

  // This would retrieve detailed variance analysis for a specific count
  const varianceAnalysis = await getVarianceAnalysisForCount(countId)

  if (!varianceAnalysis) {
    return NextResponse.json(
      { error: 'Count not found or variance analysis not available' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    data: varianceAnalysis,
    metadata: {
      countId,
      analysisDate: new Date().toISOString()
    }
  })
}

async function handleCountScheduleView(searchParams: URLSearchParams) {
  const locationIds = searchParams.get('locationIds')?.split(',')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const status = searchParams.get('status')

  const schedules = await getCountSchedules({
    locationIds,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    status: status as any
  })

  return NextResponse.json({
    success: true,
    data: schedules,
    metadata: {
      totalSchedules: schedules.length,
      filters: {
        locationIds: locationIds || 'all',
        startDate,
        endDate,
        status
      }
    }
  })
}

async function handleCountPerformance(searchParams: URLSearchParams) {
  const locationId = searchParams.get('locationId')
  const periodDays = parseInt(searchParams.get('periodDays') || '30')

  const performance = await calculateCountPerformanceMetrics(locationId ?? undefined, periodDays)

  return NextResponse.json({
    success: true,
    data: performance,
    metadata: {
      locationId: locationId || 'all',
      periodDays,
      calculatedAt: new Date().toISOString()
    }
  })
}

// Handler functions for POST operations

async function handleCreateCount(body: any, userId: string) {
  const validation = createCountSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: validation.error.issues },
      { status: 400 }
    )
  }

  const {
    locationId,
    countType,
    countedBy,
    scheduledDate,
    departmentId,
    supervisedBy,
    itemIds,
    categoryIds,
    countCriteria,
    notes
  } = validation.data

  const result = await physicalCountService.createPhysicalCount(
    locationId,
    countType,
    countedBy,
    userId,
    {
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      departmentId,
      supervisedBy,
      itemIds,
      categoryIds,
      countCriteria,
      notes
    }
  )

  if (!result.success) {
    return NextResponse.json(
      { 
        error: result.error,
        validationIssues: result.validationIssues 
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

async function handleUpdateCountItem(body: any, userId: string) {
  const countItemId = body.countItemId
  
  if (!countItemId) {
    return NextResponse.json(
      { error: 'countItemId is required' },
      { status: 400 }
    )
  }

  const validation = updateCountItemSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: validation.error.issues },
      { status: 400 }
    )
  }

  const { countedQuantity, reasonCode, comments, requireRecount } = validation.data

  const result = await physicalCountService.updateCountItem(
    countItemId,
    countedQuantity,
    userId,
    {
      reasonCode,
      comments,
      requireRecount
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
    warnings: result.warnings
  })
}

async function handleFinalizeCount(body: any, userId: string) {
  const countId = body.countId

  if (!countId) {
    return NextResponse.json(
      { error: 'countId is required' },
      { status: 400 }
    )
  }

  const validation = finalizeCountSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: validation.error.issues },
      { status: 400 }
    )
  }

  const { autoApproveVariances, varianceThreshold, createAdjustments, notes } = validation.data

  const result = await physicalCountService.finalizePhysicalCount(
    countId,
    userId,
    {
      autoApproveVariances,
      varianceThreshold,
      createAdjustments,
      notes
    }
  )

  if (!result.success) {
    return NextResponse.json(
      { 
        error: result.error,
        validationIssues: result.validationIssues
      },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
    data: result.data,
    warnings: result.warnings,
    metadata: {
      adjustmentsCreated: result.data?.adjustmentsCreated.length || 0,
      totalVarianceValue: result.data?.varianceAnalysis.totalVarianceValue
    }
  })
}

async function handleCreateSpotCheck(body: any, userId: string) {
  const validation = createSpotCheckSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: validation.error.issues },
      { status: 400 }
    )
  }

  const {
    locationId,
    reason,
    assignedTo,
    checkType,
    itemIds,
    sampleSize,
    priority,
    notes
  } = validation.data

  const result = await physicalCountService.createSpotCheck(
    locationId,
    reason,
    assignedTo,
    userId,
    {
      checkType,
      itemIds,
      sampleSize,
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
    data: result.data
  }, { status: 201 })
}

async function handleGenerateSchedule(body: any, userId: string) {
  const validation = generateScheduleSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: validation.error.issues },
      { status: 400 }
    )
  }

  const { planId, schedulePeriodDays } = validation.data

  const result = await physicalCountService.generateCountSchedule(
    planId,
    schedulePeriodDays
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
      schedulesGenerated: result.data?.length || 0,
      periodDays: schedulePeriodDays || 30
    }
  }, { status: 201 })
}

async function handleRecountItems(body: any, userId: string) {
  const { countId, itemIds, reason } = body

  if (!countId || !itemIds?.length) {
    return NextResponse.json(
      { error: 'countId and itemIds are required' },
      { status: 400 }
    )
  }

  // This would trigger a recount process for specific items
  const result = await triggerRecount(countId, itemIds, userId, reason)

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
      itemsForRecount: itemIds.length,
      reason
    }
  })
}

// Helper functions (these would have full implementations)

async function calculateCountAccuracyMetrics(
  locationId: string,
  startDate: Date,
  endDate: Date
): Promise<any> {
  // Implementation would calculate accuracy metrics for the location and period
  return {
    locationId,
    periodStart: startDate,
    periodEnd: endDate,
    totalCountsCompleted: 15,
    totalItemsCounted: 1250,
    overallAccuracy: 94.5,
    accuracyByCategory: [
      { categoryId: 'cat-1', categoryName: 'Dry Goods', accuracy: 96.2, itemsCounted: 450 },
      { categoryId: 'cat-2', categoryName: 'Spices', accuracy: 91.8, itemsCounted: 200 },
      { categoryId: 'cat-3', categoryName: 'Oils', accuracy: 97.1, itemsCounted: 150 }
    ],
    accuracyTrend: [
      { date: new Date('2024-08-01'), accuracy: 92.5 },
      { date: new Date('2024-08-15'), accuracy: 94.8 },
      { date: new Date('2024-08-30'), accuracy: 96.1 }
    ],
    topVarianceItems: [
      { itemId: 'item-001', itemName: 'Basmati Rice', totalVariances: 3, averageVariance: 2.5, lastVarianceDate: new Date('2024-08-25') }
    ],
    countEfficiency: {
      averageTimePerItem: 1.2, // minutes
      completionRate: 98.5,
      reworkRate: 8.2
    }
  }
}

async function getVarianceAnalysisForCount(countId: string): Promise<any> {
  // Implementation would retrieve variance analysis for a specific count
  return {
    countId,
    totalItemsCounted: 85,
    itemsWithVariance: 8,
    varianceRate: 9.4,
    totalVarianceValue: { amount: 245.50, currency: 'USD' },
    varianceBreakdown: {
      positive: { items: 3, value: { amount: 125.00, currency: 'USD' } },
      negative: { items: 5, value: { amount: 120.50, currency: 'USD' } }
    },
    significantVariances: [
      {
        itemId: 'item-001',
        itemName: 'Basmati Rice',
        expectedQuantity: 45,
        countedQuantity: 40,
        variance: -5,
        variancePercentage: -11.1,
        varianceValue: { amount: 225.00, currency: 'USD' },
        investigationRequired: true
      }
    ],
    rootCauseAnalysis: {
      systemErrors: 1,
      processingErrors: 2,
      damagedGoods: 3,
      theft: 0,
      countingErrors: 2,
      other: 0
    },
    recommendations: [
      'Review storage procedures for high-variance items',
      'Provide additional training for counting staff',
      'Implement spot checks for category A items'
    ]
  }
}

async function getCountSchedules(filters: any): Promise<any[]> {
  // Implementation would retrieve count schedules based on filters
  return []
}

async function calculateCountPerformanceMetrics(locationId?: string, periodDays = 30): Promise<any> {
  // Implementation would calculate performance metrics
  return {
    completionRate: 96.5,
    averageCountTime: 245, // minutes
    accuracyRate: 94.2,
    varianceRate: 8.5,
    recountRate: 12.3,
    productivity: 2.1 // items per minute
  }
}

async function triggerRecount(countId: string, itemIds: string[], userId: string, reason?: string): Promise<any> {
  // Implementation would initiate recount process
  return {
    success: true,
    data: {
      recountId: `recount-${Date.now()}`,
      countId,
      itemIds,
      status: 'scheduled',
      reason
    }
  }
}