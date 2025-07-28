import { NextRequest, NextResponse } from 'next/server';
import { reportExportService, ReportData, ExportOptions } from '@/lib/services/report-export-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportType, format, options = {}, data } = body;

    // Validate required fields
    if (!reportType || !format || !data) {
      return NextResponse.json(
        { error: 'Report type, format, and data are required' },
        { status: 400 }
      );
    }

    // Validate format
    if (!['excel', 'pdf', 'csv'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Supported formats: excel, pdf, csv' },
        { status: 400 }
      );
    }

    // Prepare report data
    const reportData: ReportData = {
      title: data.title || `${reportType} Report`,
      subtitle: data.subtitle,
      data: data.records || [],
      charts: data.charts || [],
      summary: data.summary,
      metadata: {
        reportType,
        generatedAt: new Date().toISOString(),
        recordCount: data.records?.length || 0,
        ...data.metadata
      }
    };

    // Prepare export options
    const exportOptions: ExportOptions = {
      format: format as 'excel' | 'pdf' | 'csv',
      filename: options.filename,
      includeCharts: options.includeCharts !== false,
      dateRange: options.dateRange ? {
        start: new Date(options.dateRange.start),
        end: new Date(options.dateRange.end)
      } : undefined,
      filters: options.filters
    };

    // Generate export
    const exportBlob = await reportExportService.exportReport(reportData, exportOptions);
    const filename = reportExportService.generateFilename(reportData, exportOptions);
    const mimeType = reportExportService.getMimeType(format);

    // Convert blob to buffer for response
    const buffer = Buffer.from(await exportBlob.arrayBuffer());

    // Return file as response
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString()
      }
    });

  } catch (error) {
    console.error('Error exporting report:', error);
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('reportId');
    const format = searchParams.get('format') || 'excel';

    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, you would fetch the report data from database
    // For now, return mock data based on report ID
    const mockReportData = await getMockReportData(reportId);

    const reportData: ReportData = {
      title: mockReportData.title,
      subtitle: mockReportData.subtitle,
      data: mockReportData.data,
      charts: mockReportData.charts,
      summary: mockReportData.summary,
      metadata: {
        reportId,
        generatedAt: new Date().toISOString(),
        recordCount: mockReportData.data.length
      }
    };

    const exportOptions: ExportOptions = {
      format: format as 'excel' | 'pdf' | 'csv',
      includeCharts: true
    };

    const exportBlob = await reportExportService.exportReport(reportData, exportOptions);
    const filename = reportExportService.generateFilename(reportData, exportOptions);
    const mimeType = reportExportService.getMimeType(format);

    const buffer = Buffer.from(await exportBlob.arrayBuffer());

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString()
      }
    });

  } catch (error) {
    console.error('Error exporting report:', error);
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    );
  }
}

async function getMockReportData(reportId: string): Promise<any> {
  // Mock report data based on report ID
  switch (reportId) {
    case 'vendor-performance':
      return {
        title: 'Vendor Performance Report',
        subtitle: 'Comprehensive vendor metrics and analysis',
        data: [
          {
            vendorName: 'Global Office Solutions',
            responseRate: 95.2,
            onTimeRate: 89.3,
            qualityScore: 4.5,
            totalSavings: 15678.90
          },
          {
            vendorName: 'TechPro Distributors',
            responseRate: 87.5,
            onTimeRate: 82.1,
            qualityScore: 4.2,
            totalSavings: 12456.78
          },
          {
            vendorName: 'CleanCorp Supplies',
            responseRate: 92.1,
            onTimeRate: 91.7,
            qualityScore: 4.3,
            totalSavings: 8934.56
          }
        ],
        charts: [
          {
            type: 'bar',
            title: 'Vendor Response Rates',
            data: [
              { vendor: 'Global Office Solutions', rate: 95.2 },
              { vendor: 'TechPro Distributors', rate: 87.5 },
              { vendor: 'CleanCorp Supplies', rate: 92.1 }
            ],
            xAxis: 'vendor',
            yAxis: 'rate'
          }
        ],
        summary: {
          totalVendors: 3,
          averageResponseRate: 91.6,
          totalSavings: 37070.24
        }
      };

    case 'cost-savings':
      return {
        title: 'Cost Savings Analysis',
        subtitle: 'Detailed breakdown of cost savings achieved',
        data: [
          {
            category: 'Office Supplies',
            totalSavings: 45678.90,
            percentage: 35.2,
            itemCount: 247
          },
          {
            category: 'IT Equipment',
            totalSavings: 67890.12,
            percentage: 52.3,
            itemCount: 89
          },
          {
            category: 'Cleaning Supplies',
            totalSavings: 16234.56,
            percentage: 12.5,
            itemCount: 156
          }
        ],
        charts: [
          {
            type: 'pie',
            title: 'Savings by Category',
            data: [
              { category: 'Office Supplies', savings: 45678.90 },
              { category: 'IT Equipment', savings: 67890.12 },
              { category: 'Cleaning Supplies', savings: 16234.56 }
            ]
          }
        ],
        summary: {
          totalSavings: 129803.58,
          totalItems: 492,
          averageSavingsPerItem: 263.82
        }
      };

    case 'pricing-trends':
      return {
        title: 'Pricing Trends Analysis',
        subtitle: 'Market pricing trends and insights',
        data: [
          {
            month: '2024-01',
            averagePrice: 125.45,
            priceChange: 2.3,
            itemCount: 1247
          },
          {
            month: '2024-02',
            averagePrice: 128.34,
            priceChange: 2.3,
            itemCount: 1289
          },
          {
            month: '2024-03',
            averagePrice: 126.78,
            priceChange: -1.2,
            itemCount: 1356
          }
        ],
        charts: [
          {
            type: 'line',
            title: 'Price Trends Over Time',
            data: [
              { month: '2024-01', price: 125.45 },
              { month: '2024-02', price: 128.34 },
              { month: '2024-03', price: 126.78 }
            ],
            xAxis: 'month',
            yAxis: 'price'
          }
        ],
        summary: {
          averagePrice: 126.86,
          overallTrend: 'stable',
          volatility: 'low'
        }
      };

    default:
      return {
        title: 'Generic Report',
        subtitle: 'Report data',
        data: [
          { metric: 'Sample Metric 1', value: 123.45 },
          { metric: 'Sample Metric 2', value: 678.90 }
        ],
        charts: [],
        summary: {
          totalMetrics: 2
        }
      };
  }
}