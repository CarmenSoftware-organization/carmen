import { NextRequest, NextResponse } from 'next/server';
import { prPriceAssignmentService } from '@/lib/services/pr-price-assignment-service';

// GET /api/purchase-requests/[id]/price-assignment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prId = params.id;
    
    if (!prId) {
      return NextResponse.json(
        { error: 'Purchase Request ID is required' },
        { status: 400 }
      );
    }

    // Get price assignment results for the PR
    const assignmentResult = await prPriceAssignmentService.assignPricesForPR(prId);

    return NextResponse.json({
      success: true,
      data: assignmentResult
    });
  } catch (error) {
    console.error('Error getting PR price assignment:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get price assignment data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/purchase-requests/[id]/price-assignment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prId = params.id;
    const body = await request.json();
    
    if (!prId) {
      return NextResponse.json(
        { error: 'Purchase Request ID is required' },
        { status: 400 }
      );
    }

    // Trigger price assignment for all items in the PR
    const assignmentResult = await prPriceAssignmentService.assignPricesForPR(prId);

    return NextResponse.json({
      success: true,
      message: 'Price assignment completed',
      data: assignmentResult
    });
  } catch (error) {
    console.error('Error assigning prices for PR:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to assign prices',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/purchase-requests/[id]/price-assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prId = params.id;
    const body = await request.json();
    const { action, itemId, overrideData } = body;
    
    if (!prId) {
      return NextResponse.json(
        { error: 'Purchase Request ID is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'override_price':
        if (!itemId || !overrideData) {
          return NextResponse.json(
            { error: 'Item ID and override data are required' },
            { status: 400 }
          );
        }
        
        await prPriceAssignmentService.overrideItemPrice(itemId, overrideData);
        
        return NextResponse.json({
          success: true,
          message: 'Price override applied successfully'
        });

      case 'reassign_item':
        if (!itemId) {
          return NextResponse.json(
            { error: 'Item ID is required' },
            { status: 400 }
          );
        }
        
        const assignmentResult = await prPriceAssignmentService.assignPriceForItem(itemId);
        
        return NextResponse.json({
          success: true,
          message: 'Price reassigned successfully',
          data: assignmentResult
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating PR price assignment:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update price assignment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}