import { NextRequest, NextResponse } from 'next/server';
import { comparativeAnalysisService } from '@/lib/services/comparative-analysis-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const analysisType = searchParams.get('type');
    const vendorIds = searchParams.get('vendorIds')?.split(',');
    const categoryIds = searchParams.get('categoryIds')?.split(',');
    const itemIds = searchParams.get('itemIds')?.split(',');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Validate analysis type
    if (!analysisType || !['vendors', 'categories', 'items', 'market', 'competitive'].includes(analysisType)) {
      return NextResponse.json(
        { error: 'Invalid analysis type. Must be: vendors, categories, items, market, or competitive' },
        { status: 400 }
      );
    }

    let result;

    switch (analysisType) {
      case 'vendors':
        if (!vendorIds || vendorIds.length === 0) {
          return NextResponse.json(
            { error: 'Vendor IDs are required for vendor comparison' },
            { status: 400 }
          );
        }
        result = await comparativeAnalysisService.compareVendors(vendorIds);
        break;

      case 'categories':
        if (!categoryIds || categoryIds.length === 0) {
          return NextResponse.json(
            { error: 'Category IDs are required for category comparison' },
            { status: 400 }
          );
        }
        result = await comparativeAnalysisService.compareCategoriesByVendor(categoryIds);
        break;

      case 'items':
        if (!itemIds || itemIds.length === 0) {
          return NextResponse.json(
            { error: 'Item IDs are required for item price comparison' },
            { status: 400 }
          );
        }
        result = await comparativeAnalysisService.compareItemPrices(itemIds);
        break;

      case 'market':
        const timeframe = {
          start: startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          end: endDate ? new Date(endDate) : new Date()
        };
        result = await comparativeAnalysisService.analyzeMarket(timeframe);
        break;

      case 'competitive':
        const vendorId = searchParams.get('vendorId');
        if (!vendorId) {
          return NextResponse.json(
            { error: 'Vendor ID is required for competitive analysis' },
            { status: 400 }
          );
        }
        result = await comparativeAnalysisService.analyzeCompetitivePosition(vendorId);
        break;

      default:
        return NextResponse.json(
          { error: 'Unsupported analysis type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      analysisType,
      data: result,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error performing comparative analysis:', error);
    return NextResponse.json(
      { error: 'Failed to perform comparative analysis' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      vendorIds,
      categoryIds,
      timeframe,
      includeMarketAnalysis = false,
      includeCompetitivePositioning = false
    } = body;

    // Validate timeframe
    if (!timeframe || !timeframe.start || !timeframe.end) {
      return NextResponse.json(
        { error: 'Timeframe with start and end dates is required' },
        { status: 400 }
      );
    }

    const options = {
      vendorIds,
      categoryIds,
      timeframe: {
        start: new Date(timeframe.start),
        end: new Date(timeframe.end)
      },
      includeMarketAnalysis,
      includeCompetitivePositioning
    };

    const report = await comparativeAnalysisService.generateComparativeReport(options);

    return NextResponse.json({
      success: true,
      report,
      generatedAt: new Date().toISOString(),
      message: 'Comparative analysis report generated successfully'
    });

  } catch (error) {
    console.error('Error generating comparative analysis report:', error);
    return NextResponse.json(
      { error: 'Failed to generate comparative analysis report' },
      { status: 500 }
    );
  }
}