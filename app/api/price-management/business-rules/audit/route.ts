import { NextRequest, NextResponse } from 'next/server';

/**
 * Business Rules Audit Trail API
 * 
 * Handles audit trail management
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get('ruleId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');

    // Mock audit entries
    const auditEntries = [
      {
        id: `audit-${Date.now()}-001`,
        ruleId: ruleId || 'rule-001',
        action: action || 'updated',
        userId: userId || 'user-001',
        userName: 'John Doe',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        details: {
          changes: { priority: { from: 1, to: 2 } },
          reason: 'Increased priority for better performance'
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (compatible)',
        sessionId: `session-${Date.now()}`,
        complianceFlags: ['sensitive_change']
      },
      {
        id: `audit-${Date.now()}-002`,
        ruleId: ruleId || 'rule-001',
        action: 'activated',
        userId: 'user-002',
        userName: 'Jane Smith',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        details: {
          reason: 'Approved for production use'
        },
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (compatible)',
        sessionId: `session-${Date.now() - 1000}`,
        complianceFlags: ['production_deployment']
      }
    ];

    // Filter by date range if provided
    let filteredEntries = auditEntries;
    if (startDate || endDate) {
      filteredEntries = auditEntries.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        if (startDate && entryDate < new Date(startDate)) return false;
        if (endDate && entryDate > new Date(endDate)) return false;
        return true;
      });
    }

    return NextResponse.json({ auditEntries: filteredEntries });
  } catch (error) {
    console.error('Audit trail fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit trail' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ruleId, action, userId, userName, details, complianceFlags } = body;

    if (!ruleId || !action || !userId) {
      return NextResponse.json(
        { error: 'Rule ID, action, and user ID are required' },
        { status: 400 }
      );
    }

    // Mock audit entry creation
    const auditEntry = {
      id: `audit-${Date.now()}`,
      ruleId,
      action,
      userId,
      userName: userName || 'Unknown User',
      timestamp: new Date().toISOString(),
      details: details || {},
      ipAddress: '192.168.1.100', // Would be extracted from request in real implementation
      userAgent: 'Mozilla/5.0 (compatible)',
      sessionId: `session-${Date.now()}`,
      complianceFlags: complianceFlags || []
    };

    return NextResponse.json({ auditEntry });
  } catch (error) {
    console.error('Audit entry creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create audit entry' },
      { status: 500 }
    );
  }
}