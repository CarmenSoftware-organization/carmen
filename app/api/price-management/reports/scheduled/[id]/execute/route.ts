import { NextRequest, NextResponse } from 'next/server';
import { scheduledReportService } from '@/lib/services/scheduled-report-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;

    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    // Check if report exists
    const report = await scheduledReportService.getScheduledReport(reportId);
    if (!report) {
      return NextResponse.json(
        { error: 'Scheduled report not found' },
        { status: 404 }
      );
    }

    // Execute the report
    const execution = await scheduledReportService.executeReport(reportId);

    return NextResponse.json({
      success: true,
      execution,
      message: 'Report execution started successfully'
    });

  } catch (error) {
    console.error('Error executing scheduled report:', error);
    return NextResponse.json(
      { error: 'Failed to execute scheduled report' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    // Get execution history for this report
    const executions = await scheduledReportService.getReportExecutions(reportId, limit);

    return NextResponse.json({
      success: true,
      executions,
      total: executions.length
    });

  } catch (error) {
    console.error('Error fetching report executions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report executions' },
      { status: 500 }
    );
  }
}