import { NextRequest, NextResponse } from 'next/server';
import { prPriceAssignmentService } from '@/lib/services/pr-price-assignment-service';

// GET /api/purchase-requests/items/[itemId]/price-assignment
export async function GET(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const itemId = params.itemId;
    
    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Get price assignment for specific item
    const assignmentResult = await prPriceAssignmentService.assignPriceForItem(itemId);

    return NextResponse.json({
      success: true,
      data: assignmentResult
    });
  } catch (error) {
    console.error('Error getting item price assignment:', error);
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

// POST /api/purchase-requests/items/[itemId]/price-assignment
export async function POST(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const itemId = params.itemId;
    
    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Trigger price assignment for specific item
    const assignmentResult = await prPriceAssignmentService.assignPriceForItem(itemId);

    return NextResponse.json({
      success: true,
      message: 'Price assignment completed',
      data: assignmentResult
    });
  } catch (error) {
    console.error('Error assigning price for item:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to assign price',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/purchase-requests/items/[itemId]/price-assignment/override
export async function PUT(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const itemId = params.itemId;
    const overrideData = await request.json();
    
    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    if (!overrideData.reason || !overrideData.newVendorId || !overrideData.newPrice) {
      return NextResponse.json(
        { error: 'Override reason, vendor ID, and price are required' },
        { status: 400 }
      );
    }

    // Apply price override
    await prPriceAssignmentService.overrideItemPrice(itemId, overrideData);

    return NextResponse.json({
      success: true,
      message: 'Price override applied successfully'
    });
  } catch (error) {
    console.error('Error overriding item price:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to override price',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}