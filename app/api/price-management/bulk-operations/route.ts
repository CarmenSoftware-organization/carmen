import { NextRequest, NextResponse } from 'next/server';
import bulkOperationsData from '@/lib/mock/price-management/bulk-operations.json';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    let filteredOperations = [...bulkOperationsData.bulkOperations];

    // Filter by status
    if (status && status !== 'all') {
      filteredOperations = filteredOperations.filter(operation => 
        operation.status === status
      );
    }

    // Filter by type
    if (type && type !== 'all') {
      filteredOperations = filteredOperations.filter(operation => 
        operation.type === type
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        bulkOperations: filteredOperations,
        operationMetrics: bulkOperationsData.operationMetrics,
        operationTemplates: bulkOperationsData.operationTemplates,
        scheduledOperations: bulkOperationsData.scheduledOperations
      },
      message: 'Bulk operations data retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching bulk operations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch bulk operations',
        message: 'An error occurred while retrieving bulk operations data'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, type, parameters } = body;

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Name and type are required'
        },
        { status: 400 }
      );
    }

    // Create new bulk operation
    const newOperation = {
      id: `bulk-${Date.now()}`,
      name,
      description: description || '',
      type,
      status: 'queued',
      itemCount: 0,
      progress: {
        total: 0,
        processed: 0,
        successful: 0,
        failed: 0,
        percentage: 0
      },
      parameters: parameters || {},
      queuedAt: new Date().toISOString(),
      startedBy: 'current-user@company.com',
      startedByName: 'Current User'
    };

    return NextResponse.json({
      success: true,
      data: newOperation,
      message: 'Bulk operation created successfully'
    });
  } catch (error) {
    console.error('Error creating bulk operation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create bulk operation',
        message: 'An error occurred while creating the bulk operation'
      },
      { status: 500 }
    );
  }
}