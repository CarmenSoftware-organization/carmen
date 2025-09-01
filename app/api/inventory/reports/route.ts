/**
 * Inventory Reports API Routes
 * 
 * API endpoints for various inventory reports including statistics,
 * alerts, trends, and comprehensive reporting.
 */

import { NextRequest, NextResponse } from 'next/server'
import { inventoryService } from '@/lib/services/db/inventory-service'
import { inventoryValuationService } from '@/lib/services/db/inventory-valuation-service'
import { physicalCountService } from '@/lib/services/db/physical-count-service'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Validation schemas
const reportsFiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  locationIds: z.string().optional(),
  categoryIds: z.string().optional(),
  reportType: z.enum(['statistics', 'alerts', 'trends', 'activity', 'variance']).optional()
})

/**
 * GET /api/inventory/reports
 * Get various inventory reports based on report type
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
    
    const validation = reportsFiltersSchema.safeParse(params)
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
      dateFrom,
      dateTo,
      locationIds,
      categoryIds,
      reportType
    } = validation.data

    const dateFromFilter = dateFrom ? new Date(dateFrom) : undefined
    const dateToFilter = dateTo ? new Date(dateTo) : undefined
    const locationIdsFilter = locationIds?.split(',').filter(Boolean)
    const categoryIdsFilter = categoryIds?.split(',').filter(Boolean)

    switch (reportType) {
      case 'statistics':
        const statsResult = await inventoryService.getInventoryStatistics()
        
        if (!statsResult.success) {
          return NextResponse.json(
            { error: statsResult.error },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          data: {
            type: 'statistics',
            ...statsResult.data,
            generatedAt: new Date()
          }
        })

      case 'alerts':
        // Get current valuation to extract alerts
        const valuationResult = await inventoryValuationService.calculateInventoryValuation({
          locationIds: locationIdsFilter,
          categoryIds: categoryIdsFilter
        })
        
        if (!valuationResult.success) {
          return NextResponse.json(
            { error: valuationResult.error },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          data: {
            type: 'alerts',
            alerts: valuationResult.data?.alerts || [],
            summary: {
              totalAlerts: valuationResult.data?.alerts?.length || 0,
              criticalAlerts: valuationResult.data?.alerts?.filter(a => a.severity === 'critical').length || 0,
              highAlerts: valuationResult.data?.alerts?.filter(a => a.severity === 'high').length || 0,
              mediumAlerts: valuationResult.data?.alerts?.filter(a => a.severity === 'medium').length || 0,
              lowAlerts: valuationResult.data?.alerts?.filter(a => a.severity === 'low').length || 0
            },
            generatedAt: new Date()
          }
        })

      case 'trends':
        const trendsResult = await inventoryValuationService.calculateInventoryValuation({
          locationIds: locationIdsFilter,
          categoryIds: categoryIdsFilter
        })
        
        if (!trendsResult.success) {
          return NextResponse.json(
            { error: trendsResult.error },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          data: {
            type: 'trends',
            trends: trendsResult.data?.trends || [],
            summary: {
              currentValue: trendsResult.data?.totalValue,
              currentQuantity: trendsResult.data?.totalQuantity,
              averageCostPerUnit: trendsResult.data?.averageCostPerUnit,
              dataPoints: trendsResult.data?.trends?.length || 0
            },
            generatedAt: new Date()
          }
        })

      case 'variance':
        const countStatsResult = await physicalCountService.getCountStatistics(
          dateFromFilter,
          dateToFilter
        )
        
        if (!countStatsResult.success) {
          return NextResponse.json(
            { error: countStatsResult.error },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          data: {
            type: 'variance',
            ...countStatsResult.data,
            period: {
              from: dateFromFilter,
              to: dateToFilter
            },
            generatedAt: new Date()
          }
        })

      case 'activity':
      default:
        // Default comprehensive report
        const [stats, valuation, countStats] = await Promise.all([
          inventoryService.getInventoryStatistics(),
          inventoryValuationService.calculateInventoryValuation({
            locationIds: locationIdsFilter,
            categoryIds: categoryIdsFilter
          }),
          physicalCountService.getCountStatistics(dateFromFilter, dateToFilter)
        ])

        const report = {
          type: 'comprehensive',
          statistics: stats.success ? stats.data : null,
          valuation: valuation.success ? valuation.data : null,
          countActivity: countStats.success ? countStats.data : null,
          period: {
            from: dateFromFilter,
            to: dateToFilter
          },
          filters: {
            locationIds: locationIdsFilter,
            categoryIds: categoryIdsFilter
          },
          generatedAt: new Date(),
          generatedBy: session.user.id
        }

        return NextResponse.json({
          success: true,
          data: report
        })
    }
  } catch (error) {
    console.error('Error in GET /api/inventory/reports:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/inventory/reports/export
 * Generate and export inventory reports in various formats
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
    
    const exportSchema = z.object({
      reportType: z.enum(['statistics', 'alerts', 'trends', 'activity', 'variance', 'valuation', 'abc-analysis', 'aging']),
      format: z.enum(['json', 'csv', 'xlsx', 'pdf']).default('json'),
      filters: z.object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        locationIds: z.array(z.string()).optional(),
        categoryIds: z.array(z.string()).optional()
      }).optional(),
      options: z.object({
        includeDetails: z.boolean().default(true),
        includeCharts: z.boolean().default(false),
        groupBy: z.enum(['location', 'category', 'item']).optional()
      }).optional()
    })

    const validation = exportSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validation.error.issues 
        },
        { status: 400 }
      )
    }

    const { reportType, format, filters, options } = validation.data

    // For now, return a mock export response
    // In a real implementation, you'd generate the actual file
    const exportId = `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Mock export process
    const exportResult = {
      exportId,
      reportType,
      format,
      status: 'completed',
      downloadUrl: `/api/inventory/reports/download/${exportId}`,
      fileName: `inventory_${reportType}_${new Date().toISOString().split('T')[0]}.${format}`,
      fileSize: Math.floor(Math.random() * 1000000) + 50000, // Mock file size
      generatedAt: new Date(),
      generatedBy: session.user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    }

    return NextResponse.json({
      success: true,
      data: exportResult
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/inventory/reports/export:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}