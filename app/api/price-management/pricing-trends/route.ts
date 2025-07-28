import { NextRequest, NextResponse } from 'next/server';
import pricingTrends from '@/lib/mock/price-management/pricing-trends.json';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const period = searchParams.get('period') || 'last_quarter';
    const includeInsights = searchParams.get('includeInsights') !== 'false';

    let filteredData = { ...pricingTrends };

    // Filter by category if specified
    if (category) {
      filteredData.pricingTrends.byCategory = filteredData.pricingTrends.byCategory.filter(
        (cat: any) => cat.categoryId === category || cat.categoryName.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Filter by period
    if (period !== 'last_quarter') {
      // Simulate different time periods by adjusting the data
      const periodMultiplier = period === 'last_month' ? 0.3 : period === 'last_year' ? 4 : 1;
      
      filteredData.pricingTrends.overall.changePercentage = Math.round(
        filteredData.pricingTrends.overall.changePercentage * periodMultiplier * 100
      ) / 100;

      filteredData.pricingTrends.byCategory = filteredData.pricingTrends.byCategory.map((cat: any) => ({
        ...cat,
        changePercentage: Math.round(cat.changePercentage * periodMultiplier * 100) / 100
      }));
    }

    // Optionally exclude market insights to reduce payload size
    if (!includeInsights) {
      const { marketInsights, ...dataWithoutInsights } = filteredData;
      filteredData = dataWithoutInsights as typeof filteredData;
    }

    // Add timestamp for cache management
    (filteredData as any).generatedAt = new Date().toISOString();

    return NextResponse.json(filteredData);
  } catch (error) {
    console.error('Error fetching pricing trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing trends' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analysisType, categories, dateRange, compareWith } = body;

    // Simulate trend analysis generation
    const analysis = {
      id: `analysis-${Date.now()}`,
      type: analysisType,
      categories,
      dateRange,
      compareWith,
      results: {
        overallTrend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
        changePercentage: Math.round((Math.random() * 10 - 5) * 100) / 100,
        confidence: Math.round(Math.random() * 40 + 60), // 60-100%
        keyDrivers: [
          'Supply chain optimization',
          'Market competition',
          'Seasonal demand patterns'
        ],
        recommendations: [
          'Monitor price volatility in high-risk categories',
          'Consider alternative suppliers for cost optimization',
          'Implement dynamic pricing alerts'
        ]
      },
      generatedAt: new Date().toISOString(),
      status: 'completed'
    };

    return NextResponse.json({
      success: true,
      analysis,
      message: 'Trend analysis completed successfully'
    });
  } catch (error) {
    console.error('Error generating trend analysis:', error);
    return NextResponse.json(
      { error: 'Failed to generate trend analysis' },
      { status: 500 }
    );
  }
}