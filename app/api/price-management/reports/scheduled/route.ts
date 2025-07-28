import { NextRequest, NextResponse } from 'next/server';
import { scheduledReportService } from '@/lib/services/scheduled-report-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');
    const createdBy = searchParams.get('createdBy');

    const filters: any = {};
    if (category) filters.category = category;
    if (isActive !== null) filters.isActive = isActive === 'true';
    if (createdBy) filters.createdBy = createdBy;

    const reports = await scheduledReportService.getScheduledReports(filters);

    return NextResponse.json({
      success: true,
      reports,
      total: reports.length
    });

  } catch (error) {
    console.error('Error fetching scheduled reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled reports' },
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
      format,
      isActive = true,
      createdBy
    } = body;

    // Validate required fields
    if (!name || !category || !frequency || !createdBy) {
      return NextResponse.json(
        { error: 'Name, category, frequency, and createdBy are required' },
        { status: 400 }
      );
    }

    // Validate frequency
    if (!['daily', 'weekly', 'monthly', 'quarterly'].includes(frequency)) {
      return NextResponse.json(
        { error: 'Invalid frequency. Must be: daily, weekly, monthly, or quarterly' },
        { status: 400 }
      );
    }

    // Validate format
    if (format && !['excel', 'pdf', 'csv'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be: excel, pdf, or csv' },
        { status: 400 }
      );
    }

    const newReport = await scheduledReportService.createScheduledReport({
      name,
      description: description || '',
      category,
      frequency,
      isActive,
      recipients: recipients || [],
      filters: filters || {},
      format: format || 'excel',
      createdBy
    });

    return NextResponse.json({
      success: true,
      report: newReport,
      message: 'Scheduled report created successfully'
    });

  } catch (error) {
    console.error('Error creating scheduled report:', error);
    return NextResponse.json(
      { error: 'Failed to create scheduled report' },
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

    // Validate frequency if provided
    if (updates.frequency && !['daily', 'weekly', 'monthly', 'quarterly'].includes(updates.frequency)) {
      return NextResponse.json(
        { error: 'Invalid frequency. Must be: daily, weekly, monthly, or quarterly' },
        { status: 400 }
      );
    }

    // Validate format if provided
    if (updates.format && !['excel', 'pdf', 'csv'].includes(updates.format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be: excel, pdf, or csv' },
        { status: 400 }
      );
    }

    const updatedReport = await scheduledReportService.updateScheduledReport(id, updates);

    return NextResponse.json({
      success: true,
      report: updatedReport,
      message: 'Scheduled report updated successfully'
    });

  } catch (error) {
    console.error('Error updating scheduled report:', error);
    return NextResponse.json(
      { error: 'Failed to update scheduled report' },
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

    await scheduledReportService.deleteScheduledReport(id);

    return NextResponse.json({
      success: true,
      message: 'Scheduled report deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting scheduled report:', error);
    return NextResponse.json(
      { error: 'Failed to delete scheduled report' },
      { status: 500 }
    );
  }
}