import { NextRequest, NextResponse } from 'next/server';
import overridesData from '@/lib/mock/price-management/assignment-overrides.json';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let filteredOverrides = overridesData.assignmentOverrides;

    // Apply status filter
    if (status) {
      filteredOverrides = filteredOverrides.filter(override => override.status === status);
    }

    // Apply date range filter
    if (dateFrom || dateTo) {
      filteredOverrides = filteredOverrides.filter(override => {
        const overrideDate = new Date(override.createdAt);
        if (dateFrom && overrideDate < new Date(dateFrom)) return false;
        if (dateTo && overrideDate > new Date(dateTo)) return false;
        return true;
      });
    }

    // Apply pagination
    const paginatedOverrides = filteredOverrides.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        overrides: paginatedOverrides,
        overrideReasons: overridesData.overrideReasons,
        summary: overridesData.overrideSummary,
        pagination: {
          total: filteredOverrides.length,
          limit,
          offset,
          hasMore: offset + limit < filteredOverrides.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching assignment overrides:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_OVERRIDES_ERROR',
          message: 'Failed to fetch assignment overrides',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prItemId,
      vendorId,
      price,
      currency,
      reason,
      customReason,
      justification,
      urgency
    } = body;

    // Validate required fields
    const requiredFields = ['prItemId', 'vendorId', 'price', 'currency', 'reason', 'justification'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields',
            details: { missingFields }
          }
        },
        { status: 400 }
      );
    }

    // Validate price
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PRICE',
            message: 'Price must be a positive number',
            details: { price }
          }
        },
        { status: 400 }
      );
    }

    // Find the reason configuration
    const reasonConfig = overridesData.overrideReasons.find(r => r.code === reason);
    if (!reasonConfig) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REASON',
            message: 'Invalid override reason',
            details: { reason, validReasons: overridesData.overrideReasons.map(r => r.code) }
          }
        },
        { status: 400 }
      );
    }

    // In a real implementation, this would:
    // 1. Validate the PR item exists and can be overridden
    // 2. Validate the vendor exists and is available
    // 3. Check user permissions for override
    // 4. Create override record in database
    // 5. Trigger approval workflow if required
    // 6. Send notifications

    const newOverride = {
      id: `override-${Date.now()}`,
      prItemId,
      prId: `PR-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      productName: 'Sample Product', // In real implementation, fetch from PR item
      originalAssignment: {
        vendorId: 'vendor-original',
        vendorName: 'Original Vendor',
        price: parseFloat(price) * 0.9, // Simulate original price
        currency,
        assignmentReason: 'Automatic assignment',
        confidence: 0.85,
        assignedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
      },
      override: {
        vendorId,
        vendorName: `Vendor ${vendorId}`, // In real implementation, fetch vendor name
        price: parseFloat(price),
        currency,
        reason: reasonConfig.label,
        customReason: reason === 'other' ? customReason : undefined,
        justification,
        urgency: urgency || 'normal',
        overriddenBy: 'user@company.com', // In real implementation, get from auth
        overriddenAt: new Date().toISOString(),
        approvalRequired: reasonConfig.requiresApproval,
        approvalStatus: reasonConfig.requiresApproval ? 'pending' : 'auto_approved'
      },
      status: reasonConfig.requiresApproval ? 'pending_approval' : 'approved',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Simulate approval workflow initiation
    let workflowInfo = null;
    if (reasonConfig.requiresApproval) {
      workflowInfo = {
        workflowId: 'workflow-001',
        currentStep: 'step-002',
        assignedTo: 'manager@company.com',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        estimatedApprovalTime: '24 hours'
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        override: newOverride,
        workflow: workflowInfo,
        message: reasonConfig.requiresApproval 
          ? 'Override submitted for approval' 
          : 'Override approved and applied successfully'
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment override:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_OVERRIDE_ERROR',
          message: 'Failed to create assignment override',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}