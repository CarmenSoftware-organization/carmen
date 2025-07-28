import { NextRequest, NextResponse } from 'next/server';
import reportData from '@/lib/mock/price-management/report-data.json';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');

    let filteredData = { ...reportData };

    // Filter report templates by type
    if (type) {
      filteredData.reportTemplates = filteredData.reportTemplates.filter(
        (template: any) => template.category === type
      );
    }

    // Filter by status
    if (status) {
      filteredData.reportTemplates = filteredData.reportTemplates.filter(
        (template: any) => template.isActive === (status === 'active')
      );
    }

    // Limit results
    if (limit > 0) {
      filteredData.reportTemplates = filteredData.reportTemplates.slice(0, limit);
      filteredData.customReports = filteredData.customReports.slice(0, limit);
    }

    // Add real-time status updates
    filteredData.reportTemplates = filteredData.reportTemplates.map((template: any) => ({
      ...template,
      status: Math.random() > 0.1 ? 'active' : 'pending',
      lastRunDuration: Math.round(Math.random() * 300 + 30) // 30-330 seconds
    }));

    return NextResponse.json(filteredData);
  } catch (error) {
    console.error('Error fetching reports data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      category, 
      frequency, 
      recipients, 
      filters,
      format = 'excel'
    } = body;

    // Validate required fields
    if (!name || !category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      );
    }

    // Create new report template
    const newReport = {
      id: `rpt-${Date.now()}`,
      name,
      description,
      category,
      frequency: frequency || 'monthly',
      isActive: true,
      recipients: recipients || [],
      filters: filters || {},
      format,
      createdAt: new Date().toISOString(),
      lastGenerated: null,
      nextScheduled: getNextScheduledDate(frequency || 'monthly'),
      status: 'active'
    };

    // In a real implementation, this would save to database
    // and potentially schedule the report generation

    return NextResponse.json({
      success: true,
      report: newReport,
      message: 'Report template created successfully'
    });
  } catch (error) {
    console.error('Error creating report template:', error);
    return NextResponse.json(
      { error: 'Failed to create report template' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    // Simulate updating report template
    const updatedReport = {
      id,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      report: updatedReport,
      message: 'Report template updated successfully'
    });
  } catch (error) {
    console.error('Error updating report template:', error);
    return NextResponse.json(
      { error: 'Failed to update report template' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would delete from database
    // and cancel any scheduled jobs

    return NextResponse.json({
      success: true,
      message: 'Report template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting report template:', error);
    return NextResponse.json(
      { error: 'Failed to delete report template' },
      { status: 500 }
    );
  }
}

function getNextScheduledDate(frequency: string): string {
  const now = new Date();
  const next = new Date(now);

  switch (frequency) {
    case 'daily':
      next.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(now.getMonth() + 1);
      break;
    case 'quarterly':
      next.setMonth(now.getMonth() + 3);
      break;
    default:
      next.setMonth(now.getMonth() + 1);
  }

  return next.toISOString();
}