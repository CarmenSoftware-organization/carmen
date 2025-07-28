import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendorIds, productIds, type, criteria } = body;

    // Validate required fields
    if (!vendorIds || !productIds || !type) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: vendorIds, productIds, and type'
      }, { status: 400 });
    }

    if (!Array.isArray(vendorIds) || !Array.isArray(productIds)) {
      return NextResponse.json({
        success: false,
        error: 'vendorIds and productIds must be arrays'
      }, { status: 400 });
    }

    // Simulate bulk assignment creation
    const assignmentsCount = vendorIds.length * productIds.length;
    
    // Mock assignment processing
    const assignments = [];
    for (const vendorId of vendorIds) {
      for (const productId of productIds) {
        assignments.push({
          id: `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          vendorId,
          productId,
          type,
          status: 'active',
          createdDate: new Date().toISOString(),
          createdBy: 'current-user',
          criteria: criteria || [],
          priority: 1
        });
      }
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: `Successfully created ${assignmentsCount} bulk assignments`,
      data: {
        assignmentsCount,
        assignments: assignments.slice(0, 10), // Return first 10 for preview
        totalAssignments: assignments.length,
        type,
        vendorCount: vendorIds.length,
        productCount: productIds.length
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Bulk Assignments API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Mock bulk assignments data
    const mockAssignments = [
      {
        id: 'bulk-1',
        name: 'Dairy Products Assignment - January 2024',
        type: 'vendor-to-product',
        status: 'completed',
        createdDate: '2024-01-15',
        createdBy: 'John Smith',
        vendorCount: 5,
        productCount: 12,
        assignmentsCount: 60,
        successRate: 95,
        errors: 3
      },
      {
        id: 'bulk-2',
        name: 'Premium Vendors Assignment',
        type: 'product-to-vendor',
        status: 'in-progress',
        createdDate: '2024-01-16',
        createdBy: 'Jane Doe',
        vendorCount: 8,
        productCount: 25,
        assignmentsCount: 200,
        successRate: 88,
        errors: 24
      },
      {
        id: 'bulk-3',
        name: 'Seasonal Products Assignment',
        type: 'vendor-to-product',
        status: 'pending',
        createdDate: '2024-01-17',
        createdBy: 'Mike Johnson',
        vendorCount: 3,
        productCount: 8,
        assignmentsCount: 24,
        successRate: 0,
        errors: 0
      }
    ];

    let filteredAssignments = [...mockAssignments];

    // Apply filters
    if (type) {
      filteredAssignments = filteredAssignments.filter(assignment => 
        assignment.type === type
      );
    }

    if (status) {
      filteredAssignments = filteredAssignments.filter(assignment => 
        assignment.status === status
      );
    }

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
      }
    });
  } catch (error) {
    console.error('Bulk Assignments GET API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('id');

    if (!assignmentId) {
      return NextResponse.json({
        success: false,
        error: 'Assignment ID is required'
      }, { status: 400 });
    }

    // Simulate assignment deletion
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      message: 'Bulk assignment deleted successfully',
      data: { id: assignmentId }
    });
  } catch (error) {
    console.error('Bulk Assignments DELETE API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}