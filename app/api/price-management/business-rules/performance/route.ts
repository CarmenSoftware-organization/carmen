import { NextRequest, NextResponse } from 'next/server';

/**
 * Business Rules Performance Metrics API
 * 
 * Handles performance metrics retrieval and updates
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get('ruleId');
    const timeRange = searchParams.get('timeRange');
    const includeHistory = searchParams.get('includeHistory') === 'true';
    const includeTrends = searchParams.get('includeTrends') === 'true';

    if (!ruleId) {
      return NextResponse.json(
        { error: 'Rule ID is required' },
        { status: 400 }
      );
    }

    // Mock performance metrics
    const performanceMetrics = [
      {
        ruleId,
        ruleName: `${ruleId} Rule`,
        version: 3,
        testCoverage: {
          totalConditions: 4,
          coveredConditions: 4,
          coveragePercentage: 100
        },
        executionMetrics: {
          totalExecutions: 45,
          successfulExecutions: 42,
          averageExecutionTime: 1.2,
          successRate: 93.3
        },
        effectivenessMetrics: {
          impactScore: 8.5,
          costSavings: 2450.75,
          automationRate: 93.3
        },
        qualityMetrics: {
          codeComplexity: 'medium' as const,
          maintainabilityScore: 7.8,
          securityScore: 9.5
        }
      }
    ];

    return NextResponse.json({ performanceMetrics });
  } catch (error) {
    console.error('Performance metrics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ruleId, testResults, executionMetrics } = body;

    if (!ruleId) {
      return NextResponse.json(
        { error: 'Rule ID is required' },
        { status: 400 }
      );
    }

    // Mock performance metrics update
    // In a real implementation, this would update the metrics in the database
    console.log('Updating performance metrics for rule:', ruleId, {
      testResults,
      executionMetrics
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Performance metrics update error:', error);
    return NextResponse.json(
      { error: 'Failed to update performance metrics' },
      { status: 500 }
    );
  }
}