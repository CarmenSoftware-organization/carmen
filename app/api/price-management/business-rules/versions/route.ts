import { NextRequest, NextResponse } from 'next/server';

/**
 * Business Rules Versions API
 * 
 * Handles rule version management
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get('ruleId');

    if (!ruleId) {
      return NextResponse.json(
        { error: 'Rule ID is required' },
        { status: 400 }
      );
    }

    // Mock rule versions data
    const versions = [
      {
        id: `version-${ruleId}-001`,
        ruleId,
        version: 3,
        name: `${ruleId} Rule v3`,
        description: 'Updated with location-based priority',
        conditions: [],
        actions: [],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        createdBy: 'john.doe',
        changeReason: 'Added location-based selection',
        isActive: true,
        approvalStatus: 'approved' as const,
        rollbackAvailable: true,
        changeImpact: {
          riskLevel: 'medium' as const,
          affectedSystems: ['price-assignment'],
          estimatedImpact: 'Improved delivery times',
          rollbackComplexity: 'simple' as const
        }
      },
      {
        id: `version-${ruleId}-002`,
        ruleId,
        version: 2,
        name: `${ruleId} Rule v2`,
        description: 'Enhanced vendor selection logic',
        conditions: [],
        actions: [],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        createdBy: 'jane.smith',
        changeReason: 'Performance improvements',
        isActive: false,
        approvalStatus: 'approved' as const,
        rollbackAvailable: true,
        changeImpact: {
          riskLevel: 'low' as const,
          affectedSystems: ['vendor-selection'],
          estimatedImpact: 'Better performance',
          rollbackComplexity: 'simple' as const
        }
      }
    ];

    return NextResponse.json({ versions });
  } catch (error) {
    console.error('Rule versions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rule versions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ruleId, name, description, conditions, actions, changeReason, requiresApproval } = body;

    if (!ruleId || !name) {
      return NextResponse.json(
        { error: 'Rule ID and name are required' },
        { status: 400 }
      );
    }

    // Mock version creation
    const version = {
      id: `version-${ruleId}-${Date.now()}`,
      ruleId,
      version: Math.floor(Math.random() * 10) + 1,
      name,
      description: description || '',
      conditions: conditions || [],
      actions: actions || [],
      createdAt: new Date().toISOString(),
      createdBy: 'current-user',
      changeReason: changeReason || 'Version update',
      isActive: false,
      approvalStatus: requiresApproval ? 'pending' as const : 'approved' as const,
      rollbackAvailable: false
    };

    return NextResponse.json({ version });
  } catch (error) {
    console.error('Rule version creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create rule version' },
      { status: 500 }
    );
  }
}