import { NextRequest, NextResponse } from 'next/server';

/**
 * Business Rules Emergency Deactivation API
 * 
 * Handles emergency rule deactivation
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ruleId, options } = body;

    if (!ruleId || !options?.reason || !options?.severity) {
      return NextResponse.json(
        { error: 'Rule ID, reason, and severity are required' },
        { status: 400 }
      );
    }

    const { reason, severity, immediateEffect, createIncident } = options;

    // Generate impact assessment based on severity
    const impactLevels = {
      low: { executions: 0, systems: ['logging'], impact: 'low' },
      medium: { executions: 1, systems: ['vendor-selection-service'], impact: 'low' },
      high: { executions: 2, systems: ['price-assignment-engine'], impact: 'medium' },
      critical: { executions: 3, systems: ['price-assignment-engine', 'vendor-selection'], impact: 'high' }
    };

    const impact = impactLevels[severity as keyof typeof impactLevels] || impactLevels.medium;

    const deactivationResult = {
      success: true,
      deactivationId: `emergency-deactivation-${Date.now()}`,
      executedAt: new Date().toISOString(),
      impactAssessment: {
        activeExecutionsTerminated: impact.executions,
        affectedSystems: impact.systems,
        estimatedBusinessImpact: impact.impact as 'low' | 'medium' | 'high' | 'critical'
      },
      ...(createIncident && severity === 'critical' && {
        incidentId: `incident-${Date.now()}`
      })
    };

    return NextResponse.json({ deactivationResult });
  } catch (error) {
    console.error('Emergency deactivation error:', error);
    return NextResponse.json(
      { error: 'Failed to emergency deactivate rule' },
      { status: 500 }
    );
  }
}