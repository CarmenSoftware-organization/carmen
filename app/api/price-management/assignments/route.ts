import { NextRequest, NextResponse } from 'next/server';
import priceAssignmentsData from '@/lib/mock/price-management/price-assignments.json';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const vendorId = searchParams.get('vendorId');
    const prItemId = searchParams.get('prItemId');
    const isManualOverride = searchParams.get('manualOverride');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let filteredAssignments = [...priceAssignmentsData.priceAssignments];

    // Apply filters
    if (status) {
      filteredAssignments = filteredAssignments.filter(assignment => {
        // Create a computed status based on assignment properties
        const computedStatus = assignment.isManualOverride ? 'manual' : 'automatic';
        return computedStatus.toLowerCase() === status.toLowerCase();
      });
    }

    if (vendorId) {
      filteredAssignments = filteredAssignments.filter(assignment => 
        assignment.vendorId === vendorId
      );
    }

    if (prItemId) {
      filteredAssignments = filteredAssignments.filter(assignment => 
        assignment.prItemId === prItemId
      );
    }

    if (isManualOverride !== null) {
      const overrideFilter = isManualOverride === 'true';
      filteredAssignments = filteredAssignments.filter(assignment => 
        assignment.isManualOverride === overrideFilter
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredAssignments = filteredAssignments.filter(assignment => 
        assignment.productName.toLowerCase().includes(searchLower) ||
        assignment.prItemId.toLowerCase().includes(searchLower) ||
        assignment.vendorName.toLowerCase().includes(searchLower)
      );
    }

    // Sort by assignment date (newest first)
    filteredAssignments.sort((a, b) => {
      if (!a.assignedAt) return 1;
      if (!b.assignedAt) return -1;
      return new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime();
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAssignments = filteredAssignments.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedAssignments,
      pagination: {
        page,
        limit,
        total: filteredAssignments.length,
        totalPages: Math.ceil(filteredAssignments.length / limit),
        hasNext: endIndex < filteredAssignments.length,
        hasPrev: page > 1
      },
      summary: {
        total: filteredAssignments.length,
        assigned: filteredAssignments.filter(a => !a.isManualOverride).length,
        pending: 0, // No pending status in current data structure
        overridden: filteredAssignments.filter(a => a.isManualOverride).length,
        manualOverrides: filteredAssignments.filter(a => a.isManualOverride).length,
        averageConfidence: filteredAssignments
          .filter(a => a.confidenceScore > 0)
          .reduce((sum, a) => sum + a.confidenceScore, 0) / 
          filteredAssignments.filter(a => a.confidenceScore > 0).length || 0
      }
    });
  } catch (error) {
    console.error('Price Assignments API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'assign_price':
        return handlePriceAssignment(body);
      case 'override_assignment':
        return handleAssignmentOverride(body);
      case 'bulk_assign':
        return handleBulkAssignment(body);
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action specified'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Price Assignments POST API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

async function handlePriceAssignment(body: any) {
  const requiredFields = ['prItemId', 'productId', 'productName', 'vendorId', 'price', 'currency'];
  for (const field of requiredFields) {
    if (!body[field]) {
      return NextResponse.json({
        success: false,
        error: `Missing required field: ${field}`
      }, { status: 400 });
    }
  }

  const newAssignment = {
    id: `assignment-${Date.now()}`,
    prItemId: body.prItemId,
    productId: body.productId,
    productName: body.productName,
    assignedVendor: {
      id: body.vendorId,
      name: body.vendorName || 'Unknown Vendor',
      email: body.vendorEmail || ''
    },
    assignedPrice: body.price,
    currency: body.currency,
    normalizedPriceUsd: body.normalizedPriceUsd || body.price,
    assignmentReason: body.reason || 'Manual assignment',
    confidenceScore: body.confidenceScore || 100,
    status: 'Assigned',
    ruleApplied: body.ruleApplied || null,
    isManualOverride: body.isManualOverride || false,
    overrideReason: body.overrideReason || null,
    assignedBy: body.assignedBy || 'system',
    assignedAt: new Date().toISOString(),
    alternatives: body.alternatives || [],
    priceHistory: body.priceHistory || []
  };

  return NextResponse.json({
    success: true,
    message: 'Price assigned successfully',
    data: newAssignment
  }, { status: 201 });
}

async function handleAssignmentOverride(body: any) {
  const requiredFields = ['assignmentId', 'newVendorId', 'newPrice', 'overrideReason'];
  for (const field of requiredFields) {
    if (!body[field]) {
      return NextResponse.json({
        success: false,
        error: `Missing required field: ${field}`
      }, { status: 400 });
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Assignment overridden successfully',
    data: {
      assignmentId: body.assignmentId,
      newVendorId: body.newVendorId,
      newPrice: body.newPrice,
      overrideReason: body.overrideReason,
      overriddenAt: new Date().toISOString(),
      overriddenBy: body.overriddenBy || 'system'
    }
  });
}

async function handleBulkAssignment(body: any) {
  const { prItemIds, assignmentCriteria } = body;

  if (!Array.isArray(prItemIds) || prItemIds.length === 0) {
    return NextResponse.json({
      success: false,
      error: 'prItemIds must be a non-empty array'
    }, { status: 400 });
  }

  const results = prItemIds.map(prItemId => ({
    prItemId,
    status: 'assigned',
    assignmentId: `assignment-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    assignedAt: new Date().toISOString()
  }));

  return NextResponse.json({
    success: true,
    message: `Bulk assignment completed for ${prItemIds.length} items`,
    data: {
      totalItems: prItemIds.length,
      successfulAssignments: results.length,
      failedAssignments: 0,
      results
    }
  });
}