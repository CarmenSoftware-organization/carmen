import { NextRequest, NextResponse } from 'next/server';
import { costSavingsReportingService } from '@/lib/services/cost-savings-reporting-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'summary';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Default to last 90 days if no dates provided
    const timeframe = {
      start: startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      end: endDate ? new Date(endDate) : new Date()
    };

    // Validate timeframe
    if (timeframe.start >= timeframe.end) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      );
    }

    let result;

    switch (reportType) {
      case 'summary':
      case 'detailed':
        result = await costSavingsReportingService.generateCostSavingsReport(timeframe);
        break;

      case 'efficiency':
        result = await costSavingsReportingService.generateEfficiencyReport(timeframe);
        break;

      case 'roi':
        result = await costSavingsReportingService.generateROIAnalysis(timeframe);
        break;

      case 'executive':
        result = await costSavingsReportingService.generateExecutiveSummary(timeframe);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid report type. Must be: summary, detailed, efficiency, roi, or executive' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      reportType,
      timeframe,
      data: result,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating cost savings report:', error);
    return NextResponse.json(
      { error: 'Failed to generate cost savings report' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      timeframe,
      includeEfficiency = true,
      includeROI = true,
      includeProjections = true,
      categories,
      vendors,
      format = 'json'
    } = body;

    // Validate timeframe
    if (!timeframe || !timeframe.start || !timeframe.end) {
      return NextResponse.json(
        { error: 'Timeframe with start and end dates is required' },
        { status: 400 }
      );
    }

    const parsedTimeframe = {
      start: new Date(timeframe.start),
      end: new Date(timeframe.end)
    };

    if (parsedTimeframe.start >= parsedTimeframe.end) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      );
    }

    // Generate comprehensive cost savings report
    const costSavingsReport = await costSavingsReportingService.generateCostSavingsReport(parsedTimeframe);
    
    const report: any = {
      costSavings: costSavingsReport,
      executiveSummary: await costSavingsReportingService.generateExecutiveSummary(parsedTimeframe)
    };

    if (includeEfficiency) {
      report.efficiency = await costSavingsReportingService.generateEfficiencyReport(parsedTimeframe);
    }

    if (includeROI) {
      report.roi = await costSavingsReportingService.generateROIAnalysis(parsedTimeframe);
    }

    // Apply filters if provided
    if (categories && categories.length > 0) {
      report.costSavings.breakdown.byCategory = report.costSavings.breakdown.byCategory.filter(
        (cat: any) => categories.includes(cat.categoryId)
      );
    }

    if (vendors && vendors.length > 0) {
      report.costSavings.breakdown.byVendor = report.costSavings.breakdown.byVendor.filter(
        (vendor: any) => vendors.includes(vendor.vendorId)
      );
    }

    return NextResponse.json({
      success: true,
      report,
      timeframe: parsedTimeframe,
      filters: {
        categories: categories || [],
        vendors: vendors || []
      },
      generatedAt: new Date().toISOString(),
      message: 'Comprehensive cost savings report generated successfully'
    });

  } catch (error) {
    console.error('Error generating comprehensive cost savings report:', error);
    return NextResponse.json(
      { error: 'Failed to generate comprehensive cost savings report' },
      { status: 500 }
    );
  }
}