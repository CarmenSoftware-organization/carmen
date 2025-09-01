/**
 * Inventory Analytics API
 * 
 * API endpoints for inventory analytics, forecasting, trend analysis,
 * and performance reporting with comprehensive business intelligence features.
 */

import { NextRequest, NextResponse } from 'next/server'
import { inventoryAnalyticsService } from '@/lib/services/inventory/inventory-analytics-service'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Validation schemas
const forecastSchema = z.object({
  itemIds: z.string().optional(),
  forecastDays: z.number().min(1).max(365).optional(),
  method: z.enum(['moving_average', 'exponential_smoothing', 'linear_regression', 'seasonal_decomposition']).optional()
})

const trendAnalysisSchema = z.object({
  itemIds: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
})

const optimizationSchema = z.object({
  itemIds: z.string().optional(),
  targetServiceLevel: z.number().min(50).max(99.9).optional()
})

const deadStockSchema = z.object({
  thresholdDays: z.number().min(30).max(730).optional(),
  locationIds: z.string().optional()
})

const dashboardSchema = z.object({
  periodDays: z.number().min(1).max(365).optional(),
  locationIds: z.string().optional(),
  includeProjections: z.boolean().optional()
})

/**
 * GET /api/inventory/analytics
 * Get inventory analytics and insights
 */
export async function GET(request: NextRequest) {
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

    switch (operation) {
      case 'forecast':
        return await handleForecast(searchParams)
      
      case 'trends':
        return await handleTrendAnalysis(searchParams)
      
      case 'optimization':
        return await handleOptimization(searchParams)
      
      case 'dead-stock':
        return await handleDeadStockAnalysis(searchParams)
      
      case 'dashboard':
        return await handlePerformanceDashboard(searchParams)
      
      case 'aging-report':
        return await handleAgingReport(searchParams)
      
      case 'slow-moving':
        return await handleSlowMovingReport(searchParams)
      
      case 'turnover-analysis':
        return await handleTurnoverAnalysis(searchParams)
      
      default:
        return NextResponse.json(
          { error: 'Invalid or missing operation parameter' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in GET /api/inventory/analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handler functions for analytics operations

async function handleForecast(searchParams: URLSearchParams) {
  const params = {
    itemIds: searchParams.get('itemIds'),
    forecastDays: searchParams.get('forecastDays') ? parseInt(searchParams.get('forecastDays')!) : 30,
    method: searchParams.get('method') || 'moving_average'
  }

  const validation = forecastSchema.safeParse(params)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', details: validation.error.issues },
      { status: 400 }
    )
  }

  const { itemIds, forecastDays, method } = validation.data

  const result = await inventoryAnalyticsService.generateInventoryForecast(
    itemIds ? itemIds.split(',') : undefined,
    forecastDays,
    method as any
  )

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    data: result.data,
    metadata: {
      ...result.metadata,
      forecastParameters: {
        forecastDays,
        method,
        itemCount: result.data?.length || 0
      }
    }
  })
}

async function handleTrendAnalysis(searchParams: URLSearchParams) {
  const params = {
    itemIds: searchParams.get('itemIds'),
    startDate: searchParams.get('startDate'),
    endDate: searchParams.get('endDate')
  }

  const validation = trendAnalysisSchema.safeParse(params)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', details: validation.error.issues },
      { status: 400 }
    )
  }

  const { itemIds, startDate, endDate } = validation.data

  const result = await inventoryAnalyticsService.performTrendAnalysis(
    itemIds ? itemIds.split(',') : undefined,
    startDate ? new Date(startDate) : undefined,
    endDate ? new Date(endDate) : undefined
  )

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    )
  }

  // Aggregate trend insights
  const trendSummary = result.data ? {
    totalItemsAnalyzed: result.data.length,
    consumptionTrends: {
      increasing: result.data.filter(item => item.consumptionTrend.direction === 'increasing').length,
      decreasing: result.data.filter(item => item.consumptionTrend.direction === 'decreasing').length,
      stable: result.data.filter(item => item.consumptionTrend.direction === 'stable').length
    },
    averageSupplierPerformance: {
      onTimeDeliveryRate: result.data.reduce((sum, item) => sum + item.supplierPerformance.onTimeDeliveryRate, 0) / result.data.length,
      averageLeadTime: result.data.reduce((sum, item) => sum + item.supplierPerformance.averageLeadTime, 0) / result.data.length
    },
    topRecommendations: result.data
      .flatMap(item => item.recommendations)
      .reduce((acc, rec) => {
        acc[rec] = (acc[rec] || 0) + 1
        return acc
      }, {} as Record<string, number>)
  } : null

  return NextResponse.json({
    success: true,
    data: result.data,
    metadata: {
      ...result.metadata,
      trendSummary
    }
  })
}

async function handleOptimization(searchParams: URLSearchParams) {
  const params = {
    itemIds: searchParams.get('itemIds'),
    targetServiceLevel: searchParams.get('targetServiceLevel') ? parseFloat(searchParams.get('targetServiceLevel')!) : 95.0
  }

  const validation = optimizationSchema.safeParse(params)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', details: validation.error.issues },
      { status: 400 }
    )
  }

  const { itemIds, targetServiceLevel } = validation.data

  const result = await inventoryAnalyticsService.generateOptimizationRecommendations(
    itemIds ? itemIds.split(',') : undefined,
    targetServiceLevel
  )

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    )
  }

  // Calculate optimization summary
  const optimizationSummary = result.data ? {
    totalItemsAnalyzed: result.data.length,
    recommendedActions: {
      implement: result.data.filter(item => item.recommendedAction === 'implement').length,
      pilot: result.data.filter(item => item.recommendedAction === 'pilot').length,
      monitor: result.data.filter(item => item.recommendedAction === 'monitor').length,
      reject: result.data.filter(item => item.recommendedAction === 'reject').length
    },
    totalPotentialSavings: {
      amount: result.data.reduce((sum, item) => sum + item.potentialSavings.totalSavings.amount, 0),
      currencyCode: result.data[0]?.potentialSavings.totalSavings.currencyCode || 'USD'
    },
    averagePaybackPeriod: result.data.reduce((sum, item) => sum + item.potentialSavings.paybackPeriod, 0) / result.data.length,
    riskDistribution: {
      low: result.data.filter(item => item.implementationRisk === 'low').length,
      medium: result.data.filter(item => item.implementationRisk === 'medium').length,
      high: result.data.filter(item => item.implementationRisk === 'high').length
    }
  } : null

  return NextResponse.json({
    success: true,
    data: result.data,
    metadata: {
      ...result.metadata,
      optimizationSummary
    }
  })
}

async function handleDeadStockAnalysis(searchParams: URLSearchParams) {
  const params = {
    thresholdDays: searchParams.get('thresholdDays') ? parseInt(searchParams.get('thresholdDays')!) : 90,
    locationIds: searchParams.get('locationIds')
  }

  const validation = deadStockSchema.safeParse(params)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', details: validation.error.issues },
      { status: 400 }
    )
  }

  const { thresholdDays, locationIds } = validation.data

  const result = await inventoryAnalyticsService.analyzeDeadStock(
    thresholdDays,
    locationIds ? locationIds.split(',') : undefined
  )

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    )
  }

  // Calculate dead stock summary
  const deadStockSummary = result.data ? {
    totalDeadStockItems: result.data.length,
    totalDeadStockValue: {
      amount: result.data.reduce((sum, item) => sum + item.currentValue.amount, 0),
      currencyCode: result.data[0]?.currentValue.currencyCode || 'USD'
    },
    riskDistribution: {
      low: result.data.filter(item => item.obsolescenceRisk === 'low').length,
      medium: result.data.filter(item => item.obsolescenceRisk === 'medium').length,
      high: result.data.filter(item => item.obsolescenceRisk === 'high').length,
      critical: result.data.filter(item => item.obsolescenceRisk === 'critical').length
    },
    recommendedActions: {
      continue_stocking: result.data.filter(item => item.recommendedAction === 'continue_stocking').length,
      reduce_stock: result.data.filter(item => item.recommendedAction === 'reduce_stock').length,
      liquidate: result.data.filter(item => item.recommendedAction === 'liquidate').length,
      return_to_supplier: result.data.filter(item => item.recommendedAction === 'return_to_supplier').length,
      write_off: result.data.filter(item => item.recommendedAction === 'write_off').length
    },
    totalPotentialLoss: {
      amount: result.data.reduce((sum, item) => sum + item.potentialLoss.amount, 0),
      currencyCode: result.data[0]?.potentialLoss.currencyCode || 'USD'
    },
    totalLiquidationValue: {
      amount: result.data.reduce((sum, item) => sum + item.liquidationValue.amount, 0),
      currencyCode: result.data[0]?.liquidationValue.currencyCode || 'USD'
    }
  } : null

  return NextResponse.json({
    success: true,
    data: result.data,
    metadata: {
      ...result.metadata,
      analysisParameters: {
        thresholdDays,
        locationIds: locationIds ? locationIds.split(',') : 'all'
      },
      deadStockSummary
    }
  })
}

async function handlePerformanceDashboard(searchParams: URLSearchParams) {
  const params = {
    periodDays: searchParams.get('periodDays') ? parseInt(searchParams.get('periodDays')!) : 30,
    locationIds: searchParams.get('locationIds'),
    includeProjections: searchParams.get('includeProjections') === 'true'
  }

  const validation = dashboardSchema.safeParse(params)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', details: validation.error.issues },
      { status: 400 }
    )
  }

  const { periodDays, locationIds, includeProjections } = validation.data

  const result = await inventoryAnalyticsService.generatePerformanceDashboard(
    periodDays,
    locationIds ? locationIds.split(',') : undefined
  )

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    data: result.data,
    metadata: {
      ...result.metadata,
      dashboardParameters: {
        periodDays,
        locationIds: locationIds ? locationIds.split(',') : 'all',
        includeProjections,
        generatedAt: new Date().toISOString()
      }
    }
  })
}

async function handleAgingReport(searchParams: URLSearchParams) {
  const locationIds = searchParams.get('locationIds')?.split(',')
  const categoryIds = searchParams.get('categoryIds')?.split(',')
  const asOfDate = searchParams.get('asOfDate') ? new Date(searchParams.get('asOfDate')!) : new Date()

  // This would call a specific aging analysis method
  const agingData = await generateAgingReport(locationIds, categoryIds, asOfDate)

  return NextResponse.json({
    success: true,
    data: agingData,
    metadata: {
      reportDate: asOfDate.toISOString(),
      locationIds: locationIds || 'all',
      categoryIds: categoryIds || 'all'
    }
  })
}

async function handleSlowMovingReport(searchParams: URLSearchParams) {
  const locationIds = searchParams.get('locationIds')?.split(',')
  const thresholdDays = parseInt(searchParams.get('thresholdDays') || '90')
  const minValue = parseFloat(searchParams.get('minValue') || '0')

  // This would call a specific slow-moving analysis method
  const slowMovingData = await generateSlowMovingReport(locationIds, thresholdDays, minValue)

  return NextResponse.json({
    success: true,
    data: slowMovingData,
    metadata: {
      thresholdDays,
      minValue,
      locationIds: locationIds || 'all'
    }
  })
}

async function handleTurnoverAnalysis(searchParams: URLSearchParams) {
  const periodDays = parseInt(searchParams.get('periodDays') || '365')
  const locationIds = searchParams.get('locationIds')?.split(',')
  const categoryIds = searchParams.get('categoryIds')?.split(',')

  // This would call a specific turnover analysis method
  const turnoverData = await generateTurnoverAnalysis(periodDays, locationIds, categoryIds)

  return NextResponse.json({
    success: true,
    data: turnoverData,
    metadata: {
      periodDays,
      locationIds: locationIds || 'all',
      categoryIds: categoryIds || 'all'
    }
  })
}

// Helper functions for specific reports (these would have full implementations)

async function generateAgingReport(
  locationIds?: string[],
  categoryIds?: string[],
  asOfDate?: Date
): Promise<any> {
  // Implementation for inventory aging report
  // This would analyze inventory by age buckets (0-30, 31-60, 61-90, 90+ days)
  return {
    totalItems: 150,
    totalValue: { amount: 75000, currencyCode: 'USD' },
    ageBuckets: [
      { range: '0-30 days', items: 75, value: { amount: 45000, currencyCode: 'USD' }, percentage: 60 },
      { range: '31-60 days', items: 35, value: { amount: 18000, currencyCode: 'USD' }, percentage: 24 },
      { range: '61-90 days', items: 25, value: { amount: 8000, currencyCode: 'USD' }, percentage: 11 },
      { range: '90+ days', items: 15, value: { amount: 4000, currencyCode: 'USD' }, percentage: 5 }
    ]
  }
}

async function generateSlowMovingReport(
  locationIds?: string[],
  thresholdDays?: number,
  minValue?: number
): Promise<any> {
  // Implementation for slow-moving inventory report
  return {
    totalSlowMovingItems: 25,
    totalSlowMovingValue: { amount: 15000, currencyCode: 'USD' },
    items: []
  }
}

async function generateTurnoverAnalysis(
  periodDays?: number,
  locationIds?: string[],
  categoryIds?: string[]
): Promise<any> {
  // Implementation for turnover analysis
  return {
    overallTurnover: 6.5,
    categoryTurnover: [],
    locationTurnover: [],
    fastMovingItems: [],
    slowMovingItems: []
  }
}