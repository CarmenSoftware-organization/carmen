import { NextRequest, NextResponse } from 'next/server';
import businessRulesData from '@/lib/mock/price-management/business-rules.json';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'conditions' or 'actions'
    
    let templates;
    if (type === 'conditions') {
      templates = businessRulesData.conditionTemplates;
    } else if (type === 'actions') {
      templates = businessRulesData.actionTemplates;
    } else {
      // Return both if no type specified
      templates = {
        conditionTemplates: businessRulesData.conditionTemplates,
        actionTemplates: businessRulesData.actionTemplates
      };
    }
    
    return NextResponse.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error fetching rule templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rule templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, template } = body; // type: 'condition' or 'action'
    
    // In a real implementation, this would:
    // 1. Validate template structure
    // 2. Save custom template to database
    // 3. Make it available for rule building
    
    const newTemplate = {
      id: `${type}-template-${Date.now()}`,
      ...template,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user-id', // Would come from auth
      isCustom: true
    };

    return NextResponse.json({
      success: true,
      template: newTemplate,
      message: 'Custom template created successfully'
    });
  } catch (error) {
    console.error('Error creating custom template:', error);
    return NextResponse.json(
      { error: 'Failed to create custom template' },
      { status: 500 }
    );
  }
}