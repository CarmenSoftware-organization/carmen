import { NextRequest, NextResponse } from 'next/server';
import businessRulesData from '@/lib/mock/price-management/business-rules.json';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rule = businessRulesData.businessRules.find(r => r.id === params.id);
    
    if (!rule) {
      return NextResponse.json(
        { error: 'Business rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(rule);
  } catch (error) {
    console.error('Error fetching business rule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business rule' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    
    // In a real implementation, this would update the database
    const updatedRule = {
      id: params.id,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(updatedRule);
  } catch (error) {
    console.error('Error updating business rule:', error);
    return NextResponse.json(
      { error: 'Failed to update business rule' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    
    // In a real implementation, this would update the database
    const rule = businessRulesData.businessRules.find(r => r.id === params.id);
    
    if (!rule) {
      return NextResponse.json(
        { error: 'Business rule not found' },
        { status: 404 }
      );
    }

    const updatedRule = {
      ...rule,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(updatedRule);
  } catch (error) {
    console.error('Error updating business rule:', error);
    return NextResponse.json(
      { error: 'Failed to update business rule' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In a real implementation, this would delete from database
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting business rule:', error);
    return NextResponse.json(
      { error: 'Failed to delete business rule' },
      { status: 500 }
    );
  }
}