import { NextRequest, NextResponse } from 'next/server';
import { resubmissionWorkflowService } from '@/lib/services/resubmission-workflow-service';

// GET /api/price-management/validation/workflows - Get resubmission workflows
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const status = searchParams.get('status');
    const workflowId = searchParams.get('workflowId');

    let workflows;
    
    if (workflowId) {
      const workflow = await resubmissionWorkflowService.getWorkflowStatus(workflowId);
      workflows = workflow ? [workflow] : [];
    } else if (vendorId) {
      workflows = await resubmissionWorkflowService.getVendorWorkflows(vendorId);
    } else {
      workflows = await resubmissionWorkflowService.getActiveWorkflows();
    }

    // Filter by status if provided
    if (status) {
      workflows = workflows.filter(w => w.status === status);
    }

    // Get statistics for each workflow
    const workflowsWithStats = await Promise.all(
      workflows.map(async (workflow) => {
        const stats = await resubmissionWorkflowService.getChangeStatistics(workflow.id);
        return {
          ...workflow,
          statistics: stats
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        workflows: workflowsWithStats,
        summary: {
          total: workflows.length,
          byStatus: workflows.reduce((acc, w) => {
            acc[w.status] = (acc[w.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          averageAttempts: workflows.length > 0 ? 
            workflows.reduce((sum, w) => sum + w.currentAttempt, 0) / workflows.length : 0
        }
      }
    });

  } catch (error) {
    console.error('Workflows fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch workflows',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/price-management/validation/workflows/[workflowId]/complete
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const workflowId = pathParts[pathParts.length - 2]; // Get workflowId from path
    
    if (!workflowId) {
      return NextResponse.json({
        success: false,
        error: 'Workflow ID is required'
      }, { status: 400 });
    }

    const { reviewNotes } = await request.json();

    await resubmissionWorkflowService.completeWorkflow(workflowId, reviewNotes);

    return NextResponse.json({
      success: true,
      message: 'Workflow completed successfully'
    });

  } catch (error) {
    console.error('Workflow completion error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to complete workflow',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/price-management/validation/workflows/[workflowId]
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const workflowId = url.pathname.split('/').pop();
    
    if (!workflowId) {
      return NextResponse.json({
        success: false,
        error: 'Workflow ID is required'
      }, { status: 400 });
    }

    const { reason } = await request.json();

    await resubmissionWorkflowService.cancelWorkflow(
      workflowId, 
      reason || 'Cancelled by user'
    );

    return NextResponse.json({
      success: true,
      message: 'Workflow cancelled successfully'
    });

  } catch (error) {
    console.error('Workflow cancellation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to cancel workflow',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}