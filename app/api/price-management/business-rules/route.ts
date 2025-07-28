import { NextRequest, NextResponse } from 'next/server';
import businessRulesData from '@/lib/mock/price-management/business-rules.json';

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, this would fetch from database
    // For now, return mock data
    return NextResponse.json(businessRulesData);
  } catch (error) {
    console.error('Error fetching business rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business rules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In a real implementation, this would save to database
    // For now, simulate saving and return success
    const newRule = {
      id: `rule-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user-id', // Would come from auth
      lastTriggered: null,
      triggerCount: 0,
      successRate: 0
    };

    return NextResponse.json({
      success: true,
      rule: newRule
    });
  } catch (error) {
    console.error('Error creating business rule:', error);
    return NextResponse.json(
      { error: 'Failed to create business rule' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    // In a real implementation, this would update in database
    // For now, simulate update and return success
    const updatedRule = {
      id,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      rule: updatedRule
    });
  } catch (error) {
    console.error('Error updating business rule:', error);
    return NextResponse.json(
      { error: 'Failed to update business rule' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get('id');
    
    if (!ruleId) {
      return NextResponse.json(
        { error: 'Rule ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would delete from database
    // For now, simulate deletion and return success
    return NextResponse.json({
      success: true,
      message: 'Rule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting business rule:', error);
    return NextResponse.json(
      { error: 'Failed to delete business rule' },
      { status: 500 }
    );
  }
}