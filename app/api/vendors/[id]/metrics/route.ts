/**
 * Vendor Metrics API Routes
 * 
 * GET /api/vendors/[id]/metrics - Get detailed vendor performance metrics
 * PUT /api/vendors/[id]/metrics - Update vendor metrics from external sources
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { vendorService } from '@/lib/services/db/vendor-service'

// Validation schema for metrics update
const updateMetricsSchema = z.object({
  response_rate: z.number().min(0).max(100).optional(),
  average_response_time: z.number().min(0).optional(),
  quality_score: z.number().min(0).max(100).optional(),
  on_time_delivery_rate: z.number().min(0).max(100).optional(),
  total_campaigns: z.number().int().min(0).optional(),
  completed_submissions: z.number().int().min(0).optional(),
  average_completion_time: z.number().min(0).optional(),
  last_submission_date: z.coerce.date().optional()
})

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/vendors/[id]/metrics - Get detailed vendor performance metrics
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params

    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid vendor ID format'
        },
        { status: 400 }
      )
    }

    // Calculate comprehensive performance metrics
    const result = await vendorService.calculateVendorPerformanceMetrics(id)

    if (!result.success) {
      const statusCode = result.error === 'Vendor metrics not found' ? 404 : 500
      return NextResponse.json(
        {
          success: false,
          error: result.error
        },
        { status: statusCode }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })

  } catch (error) {
    console.error('Error in GET /api/vendors/[id]/metrics:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/vendors/[id]/metrics - Update vendor metrics from external sources
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params

    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid vendor ID format'
        },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate input
    const validationResult = updateMetricsSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid metrics data',
          details: validationResult.error.format()
        },
        { status: 400 }
      )
    }

    const metricsData = validationResult.data

    // Update metrics
    const result = await vendorService.updateVendorMetrics(id, metricsData)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error
        },
        { status: 500 }
      )
    }

    // Return updated metrics
    const updatedMetrics = await vendorService.calculateVendorPerformanceMetrics(id)

    return NextResponse.json({
      success: true,
      message: 'Vendor metrics updated successfully',
      data: updatedMetrics.data
    })

  } catch (error) {
    console.error('Error in PUT /api/vendors/[id]/metrics:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}

/**
 * Helper function to validate UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}