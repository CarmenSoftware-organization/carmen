import { NextRequest, NextResponse } from 'next/server';
import { customDashboardService } from '@/lib/services/custom-dashboard-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetRole = searchParams.get('targetRole');

    const templates = await customDashboardService.getTemplates(targetRole || undefined);

    return NextResponse.json({
      success: true,
      templates,
      total: templates.length
    });

  } catch (error) {
    console.error('Error fetching dashboard templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      templateId,
      name,
      description,
      userRole,
      userId,
      createdBy
    } = body;

    // Validate required fields
    if (!templateId || !name || !userRole || !createdBy) {
      return NextResponse.json(
        { error: 'Template ID, name, userRole, and createdBy are required' },
        { status: 400 }
      );
    }

    const dashboard = await customDashboardService.createFromTemplate(templateId, {
      name,
      description,
      userRole,
      userId,
      createdBy
    });

    return NextResponse.json({
      success: true,
      dashboard,
      message: 'Dashboard created from template successfully'
    });

  } catch (error) {
    console.error('Error creating dashboard from template:', error);
    return NextResponse.json(
      { error: 'Failed to create dashboard from template' },
      { status: 500 }
    );
  }
}