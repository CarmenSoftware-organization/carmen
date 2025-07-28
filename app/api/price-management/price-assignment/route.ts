import { NextRequest, NextResponse } from 'next/server';
import { priceAssignmentEngine } from '@/lib/services/price-assignment-engine';
import { PriceAssignmentContext } from '@/lib/types/price-management';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'assign_price':
        return await handlePriceAssignment(data);
      
      case 'get_recommendations':
        return await handleGetRecommendations(data);
      
      case 'validate_assignment':
        return await handleValidateAssignment(data);
      
      case 'get_metrics':
        return await handleGetMetrics(data);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Price assignment API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handlePriceAssignment(data: any) {
  try {
    // Validate required fields
    const requiredFields = ['prItemId', 'productId', 'categoryId', 'quantity', 'availableVendors'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Construct assignment context
    const context: PriceAssignmentContext = {
      prItemId: data.prItemId,
      productId: data.productId,
      categoryId: data.categoryId,
      quantity: data.quantity,
      requestedDate: data.requestedDate ? new Date(data.requestedDate) : new Date(),
      location: data.location || 'default',
      department: data.department || 'procurement',
      budgetLimit: data.budgetLimit,
      urgencyLevel: data.urgencyLevel || 'normal',
      availableVendors: data.availableVendors
    };

    // Execute assignment
    const result = await priceAssignmentEngine.executeAssignment(context);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Price assignment failed:', error);
    return NextResponse.json(
      { error: 'Price assignment failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleGetRecommendations(data: any) {
  try {
    // Validate required fields
    if (!data.prItemId || !data.availableVendors) {
      return NextResponse.json(
        { error: 'Missing required fields: prItemId, availableVendors' },
        { status: 400 }
      );
    }

    // Construct context
    const context: PriceAssignmentContext = {
      prItemId: data.prItemId,
      productId: data.productId || 'unknown',
      categoryId: data.categoryId || 'general',
      quantity: data.quantity || 1,
      requestedDate: data.requestedDate ? new Date(data.requestedDate) : new Date(),
      location: data.location || 'default',
      department: data.department || 'procurement',
      budgetLimit: data.budgetLimit,
      urgencyLevel: data.urgencyLevel || 'normal',
      availableVendors: data.availableVendors
    };

    // Get recommendations
    const recommendations = await priceAssignmentEngine.getAssignmentRecommendations(context);

    return NextResponse.json({
      success: true,
      data: recommendations
    });

  } catch (error) {
    console.error('Failed to get recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleValidateAssignment(data: any) {
  try {
    if (!data.prItemId) {
      return NextResponse.json(
        { error: 'Missing required field: prItemId' },
        { status: 400 }
      );
    }

    const validation = await priceAssignmentEngine.validateAssignment(data.prItemId);

    return NextResponse.json({
      success: true,
      data: validation
    });

  } catch (error) {
    console.error('Assignment validation failed:', error);
    return NextResponse.json(
      { error: 'Assignment validation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleGetMetrics(data: any) {
  try {
    const startDate = data.startDate ? new Date(data.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = data.endDate ? new Date(data.endDate) : new Date();

    const metrics = await priceAssignmentEngine.getAssignmentMetrics(startDate, endDate);

    return NextResponse.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Failed to get metrics:', error);
    return NextResponse.json(
      { error: 'Failed to get metrics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const prItemId = searchParams.get('prItemId');

    switch (action) {
      case 'validate_assignment':
        if (!prItemId) {
          return NextResponse.json(
            { error: 'Missing prItemId parameter' },
            { status: 400 }
          );
        }
        
        const validation = await priceAssignmentEngine.validateAssignment(prItemId);
        return NextResponse.json({
          success: true,
          data: validation
        });

      case 'get_metrics':
        const startDate = searchParams.get('startDate') 
          ? new Date(searchParams.get('startDate')!) 
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = searchParams.get('endDate') 
          ? new Date(searchParams.get('endDate')!) 
          : new Date();

        const metrics = await priceAssignmentEngine.getAssignmentMetrics(startDate, endDate);
        return NextResponse.json({
          success: true,
          data: metrics
        });

      default:
        return NextResponse.json(
          { error: 'Invalid or missing action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Price assignment GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}