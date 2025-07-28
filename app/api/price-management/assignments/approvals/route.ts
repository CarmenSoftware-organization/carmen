import { NextRequest, NextResponse } from 'next/server';
import approvalWorkflowsData from '@/lib/mock/price-management/approval-workflows.json';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');
    const workflowType = searchParams.get('workflowType');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let filteredApprovals = approvalWorkflowsData.pendingApprovals;

    // Apply filters
    if (status) {
      filteredApprovals = filteredApprovals.filter(approval => approval.status === status);
    }

    if (assignedTo) {
      filteredApprovals = filteredApprovals.filter(approval => 
        approval.assignedTo.toLowerCase().includes(assignedTo.toLowerCase())
      );
    }

    if (workflowType) {
      filteredApprovals = filteredApprovals.filter(approval => approval.requestType === workflowType);
    }

    // Apply pagination
    const paginatedApprovals = filteredApprovals.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        pendingApprovals: paginatedApprovals,
        approvalHistory: approvalWorkflowsData.approvalHistory,
        workflows: approvalWorkflowsData.approvalWorkflows,
        metrics: approvalWorkflowsData.approvalMetrics,
        pagination: {
          total: filteredApprovals.length,
          limit,
          offset,
          hasMore: offset + limit < filteredApprovals.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching approval workflows:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_APPROVALS_ERROR',
          message: 'Failed to fetch approval workflows',
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
    const { approvalId, action, comments, reason } = body;

    // Validate required fields
    if (!approvalId || !action) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Approval ID and action are required',
            details: { missingFields: ['approvalId', 'action'].filter(field => !body[field]) }
          }
        },
        { status: 400 }
      );
    }

    const validActions = ['approve', 'reject', 'escalate', 'request_info'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ACTION',
            message: 'Invalid approval action',
            details: { action, validActions }
          }
        },
        { status: 400 }
      );
    }

    // Find the pending approval
    const pendingApproval = approvalWorkflowsData.pendingApprovals.find(
      approval => approval.id === approvalId
    );

    if (!pendingApproval) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'APPROVAL_NOT_FOUND',
            message: 'Approval request not found',
            details: { approvalId }
          }
        },
        { status: 404 }
      );
    }

    // In a real implementation, this would:
    // 1. Validate user permissions to approve this request
    // 2. Update the approval status in database
    // 3. Execute the approved action (e.g., apply override)
    // 4. Send notifications to relevant parties
    // 5. Log the approval decision
    // 6. Move to next workflow step if applicable

    const approvalResult = {
      approvalId,
      action,
      comments: comments || '',
      reason: reason || '',
      processedBy: 'user@company.com', // In real implementation, get from auth
      processedAt: new Date().toISOString(),
      previousStatus: pendingApproval.status,
      newStatus: action === 'approve' ? 'approved' : 
                action === 'reject' ? 'rejected' : 
                action === 'escalate' ? 'escalated' : 'pending_info',
      workflow: {
        workflowId: pendingApproval.workflowId,
        currentStep: pendingApproval.currentStep,
        nextStep: action === 'approve' ? 'completed' : 
                 action === 'escalate' ? 'step-003' : null
      }
    };

    // Simulate different outcomes based on action
    let responseMessage = '';
    let nextActions: string[] = [];

    switch (action) {
      case 'approve':
        responseMessage = 'Request approved successfully';
        nextActions = ['apply_changes', 'notify_requestor'];
        break;
      case 'reject':
        responseMessage = 'Request rejected';
        nextActions = ['notify_requestor', 'log_rejection'];
        break;
      case 'escalate':
        responseMessage = 'Request escalated to next approval level';
        nextActions = ['notify_next_approver', 'update_workflow'];
        break;
      case 'request_info':
        responseMessage = 'Additional information requested';
        nextActions = ['notify_requestor', 'pause_workflow'];
        break;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...approvalResult,
        message: responseMessage,
        nextActions,
        estimatedCompletion: action === 'approve' ? 
          new Date(Date.now() + 15 * 60 * 1000).toISOString() : // 15 minutes for approval
          action === 'escalate' ? 
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : // 24 hours for escalation
          null
      }
    });
  } catch (error) {
    console.error('Error processing approval action:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'APPROVAL_ACTION_ERROR',
          message: 'Failed to process approval action',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}