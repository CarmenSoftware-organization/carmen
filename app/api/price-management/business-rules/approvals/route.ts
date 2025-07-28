import { NextRequest, NextResponse } from 'next/server';

/**
 * Business Rules Approvals API
 * 
 * Handles approval workflow management
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const ruleId = searchParams.get('ruleId');
    const requestedBy = searchParams.get('requestedBy');

    // Mock approval requests
    const approvalRequests = [
      {
        id: `approval-${Date.now()}-001`,
        ruleId: ruleId || 'rule-001',
        ruleName: 'Preferred Vendor Priority',
        requestType: 'update' as const,
        requestedBy: requestedBy || 'john.doe',
        requestedByName: 'John Doe',
        requestedAt: new Date(Date.now() - 86400000).toISOString(),
        reason: 'Performance optimization',
        changes: { priority: { from: 1, to: 2 } },
        status: (status as 'pending' | 'approved' | 'rejected') || 'pending',
        approvers: [
          {
            userId: 'manager-001',
            userName: 'Sarah Johnson',
            role: 'Finance Manager',
            status: 'pending' as const
          }
        ],
        priority: (priority as 'low' | 'medium' | 'high' | 'critical') || 'medium',
        impactAssessment: {
          affectedRules: 1,
          riskLevel: 'medium' as const,
          estimatedImpact: 'Improved performance'
        },
        businessJustification: 'Optimization will improve system performance'
      },
      {
        id: `approval-${Date.now()}-002`,
        ruleId: 'rule-002',
        ruleName: 'Bulk Discount Application',
        requestType: 'create' as const,
        requestedBy: 'jane.smith',
        requestedByName: 'Jane Smith',
        requestedAt: new Date(Date.now() - 172800000).toISOString(),
        reason: 'New bulk discount rule',
        changes: { new_rule: { from: null, to: {} } },
        status: 'approved' as const,
        approvers: [
          {
            userId: 'manager-002',
            userName: 'Mike Wilson',
            role: 'Operations Manager',
            status: 'approved' as const
          }
        ],
        priority: 'low' as const,
        impactAssessment: {
          affectedRules: 0,
          riskLevel: 'low' as const,
          estimatedImpact: 'New functionality'
        },
        businessJustification: 'Improve cost savings through bulk discounts'
      }
    ];

    // Filter based on query parameters
    let filteredRequests = approvalRequests;
    if (status) {
      filteredRequests = filteredRequests.filter(req => req.status === status);
    }
    if (priority) {
      filteredRequests = filteredRequests.filter(req => req.priority === priority);
    }
    if (ruleId) {
      filteredRequests = filteredRequests.filter(req => req.ruleId === ruleId);
    }
    if (requestedBy) {
      filteredRequests = filteredRequests.filter(req => req.requestedBy === requestedBy);
    }

    return NextResponse.json({ approvalRequests: filteredRequests });
  } catch (error) {
    console.error('Approval requests fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch approval requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ruleId, ruleName, requestType, reason, changes, approvers, businessJustification } = body;

    if (!ruleId || !ruleName || !requestType || !reason) {
      return NextResponse.json(
        { error: 'Rule ID, rule name, request type, and reason are required' },
        { status: 400 }
      );
    }

    // Mock approval request creation
    const approvalRequest = {
      id: `approval-${Date.now()}`,
      ruleId,
      ruleName,
      requestType: requestType as 'create' | 'update' | 'delete',
      requestedBy: 'current-user',
      requestedByName: 'Current User',
      requestedAt: new Date().toISOString(),
      reason,
      changes: changes || {},
      status: 'pending' as const,
      approvers: (approvers || []).map((approverId: string) => ({
        userId: approverId,
        userName: `User ${approverId}`,
        role: 'Manager',
        status: 'pending' as const
      })),
      priority: 'medium' as const,
      impactAssessment: {
        affectedRules: requestType === 'create' ? 0 : 1,
        riskLevel: 'medium' as const,
        estimatedImpact: requestType === 'create' ? 'New functionality' : 'Rule modification'
      },
      businessJustification: businessJustification || 'Business requirement'
    };

    return NextResponse.json({ approvalRequest });
  } catch (error) {
    console.error('Approval request creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create approval request' },
      { status: 500 }
    );
  }
}