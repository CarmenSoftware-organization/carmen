import { NextRequest, NextResponse } from 'next/server';

/**
 * Individual Approval Request API
 * 
 * Handles processing of individual approval requests
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const { requestId } = params;
    const body = await request.json();
    const { action, options } = body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Valid action (approve/reject) is required' },
        { status: 400 }
      );
    }

    // Mock approval request processing
    const processedRequest = {
      id: requestId,
      status: action === 'approve' ? 'approved' : 'rejected',
      [action === 'approve' ? 'approvedAt' : 'rejectedAt']: new Date().toISOString(),
      approverComments: options?.comments || `Request ${action}d`,
      processedBy: options?.approverId || 'current-user'
    };

    return NextResponse.json({ approvalRequest: processedRequest });
  } catch (error) {
    console.error('Approval request processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process approval request' },
      { status: 500 }
    );
  }
}