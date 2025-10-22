/**
 * Inventory Valuation API Routes
 * 
 * API endpoints for inventory valuation, ABC analysis, aging reports,
 * and comprehensive financial reporting.
 */

import { NextRequest, NextResponse } from 'next/server'
import { inventoryValuationService } from '@/lib/services/db/inventory-valuation-service'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Validation schemas
const valuationFiltersSchema = z.object({
  locationIds: z.string().optional(),
  categoryIds: z.string().optional(),
  itemIds: z.string().optional(),
  costingMethod: z.enum(['FIFO', 'LIFO', 'MOVING_AVERAGE', 'WEIGHTED_AVERAGE', 'STANDARD_COST']).optional(),
  valuationDate: z.string().optional(),
  includeInactive: z.string().optional(),
  includeZeroStock: z.string().optional(),
  minimumValue: z.string().optional(),
  maximumValue: z.string().optional()
})

/**
 * GET /api/inventory/valuation
 * Get comprehensive inventory valuation
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
    
    const validation = valuationFiltersSchema.safeParse(params)
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
      locationIds,
      categoryIds,
      itemIds,
      costingMethod,
      valuationDate,
      includeInactive,
      includeZeroStock,
      minimumValue,
      maximumValue
    } = validation.data

    // Parse filters
    const filters = {
      locationIds: locationIds?.split(',').filter(Boolean),
      categoryIds: categoryIds?.split(',').filter(Boolean),
      itemIds: itemIds?.split(',').filter(Boolean),
      costingMethod,
      valuationDate: valuationDate ? new Date(valuationDate) : undefined,
      includeInactive: includeInactive === 'true',
      includeZeroStock: includeZeroStock === 'true',
      minimumValue: minimumValue ? parseFloat(minimumValue) : undefined,
      maximumValue: maximumValue ? parseFloat(maximumValue) : undefined
    }

    const result = await inventoryValuationService.calculateInventoryValuation(filters)
    
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
    console.error('Error in GET /api/inventory/valuation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/inventory/valuation/abc-analysis
 * Get ABC analysis results
 * NOTE: This should be moved to app/api/inventory/valuation/abc-analysis/route.ts
 */
async function getABCAnalysis(request: NextRequest) {
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
    
    const validation = valuationFiltersSchema.safeParse(params)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: validation.error.issues 
        },
        { status: 400 }
      )
    }

    const filters = {
      locationIds: params.locationIds?.split(',').filter(Boolean),
      categoryIds: params.categoryIds?.split(',').filter(Boolean),
      itemIds: params.itemIds?.split(',').filter(Boolean),
      costingMethod: params.costingMethod as any,
      valuationDate: params.valuationDate ? new Date(params.valuationDate) : undefined,
      includeInactive: params.includeInactive === 'true',
      includeZeroStock: params.includeZeroStock === 'true'
    }

    const result = await inventoryValuationService.performABCAnalysis(filters)
    
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
  } catch (error) {
    console.error('Error in GET /api/inventory/valuation/abc-analysis:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/inventory/valuation/aging
 * Get inventory aging analysis
 * NOTE: This should be moved to app/api/inventory/valuation/aging/route.ts
 */
async function getAgingAnalysis(request: NextRequest) {
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
    
    const validation = valuationFiltersSchema.safeParse(params)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: validation.error.issues 
        },
        { status: 400 }
      )
    }

    const filters = {
      locationIds: params.locationIds?.split(',').filter(Boolean),
      categoryIds: params.categoryIds?.split(',').filter(Boolean),
      itemIds: params.itemIds?.split(',').filter(Boolean),
      includeInactive: params.includeInactive === 'true',
      includeZeroStock: params.includeZeroStock === 'true'
    }

    const result = await inventoryValuationService.generateAgingAnalysis(filters)
    
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
  } catch (error) {
    console.error('Error in GET /api/inventory/valuation/aging:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/inventory/valuation/cost-variances
 * Get cost variance analysis
 * NOTE: This should be moved to app/api/inventory/valuation/cost-variances/route.ts
 */
async function getCostVariances(request: NextRequest) {
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
    
    const validation = valuationFiltersSchema.safeParse(params)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: validation.error.issues 
        },
        { status: 400 }
      )
    }

    const filters = {
      locationIds: params.locationIds?.split(',').filter(Boolean),
      categoryIds: params.categoryIds?.split(',').filter(Boolean),
      itemIds: params.itemIds?.split(',').filter(Boolean),
      costingMethod: params.costingMethod as any,
      includeInactive: params.includeInactive === 'true',
      includeZeroStock: params.includeZeroStock === 'true'
    }

    const result = await inventoryValuationService.analyzeCostVariances(filters)
    
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
  } catch (error) {
    console.error('Error in GET /api/inventory/valuation/cost-variances:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}