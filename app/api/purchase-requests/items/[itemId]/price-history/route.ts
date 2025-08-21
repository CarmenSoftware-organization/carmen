import { NextRequest, NextResponse } from 'next/server';
import { prPriceAssignmentService } from '@/lib/services/pr-price-assignment-service';

// GET /api/purchase-requests/items/[itemId]/price-history
export async function GET(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const itemId = params.itemId;
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '6months';
    
    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Get price history for the item
    const priceHistory = await prPriceAssignmentService.getPriceHistory(itemId);

    // Filter by time range if specified
    let filteredHistory = priceHistory;
    if (timeRange !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();

      switch (timeRange) {
        case '1month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case '6months':
          cutoffDate.setMonth(now.getMonth() - 6);
          break;
        case '1year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filteredHistory = priceHistory.filter(entry => entry.date >= cutoffDate);
    }

    // Calculate statistics
    const prices = filteredHistory.map(entry => entry.price);
    const currentPrice = prices.length > 0 ? prices[0] : 0;
    const oldestPrice = prices.length > 0 ? prices[prices.length - 1] : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const avgPrice = prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0;
    const totalChange = oldestPrice > 0 ? ((currentPrice - oldestPrice) / oldestPrice) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        itemId,
        timeRange,
        history: filteredHistory,
        statistics: {
          currentPrice,
          minPrice,
          maxPrice,
          avgPrice,
          totalChange,
          dataPoints: filteredHistory.length,
          priceRange: maxPrice - minPrice,
          volatility: prices.length > 1 ? 
            Math.sqrt(prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length) : 0
        },
        insights: generatePriceInsights(filteredHistory, {
          currentPrice,
          minPrice,
          maxPrice,
          avgPrice,
          totalChange
        })
      }
    });
  } catch (error) {
    console.error('Error getting price history:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get price history data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generatePriceInsights(history: any[], stats: any) {
  const insights = [];

  if (stats.totalChange > 10) {
    insights.push({
      type: 'warning',
      title: 'Significant Price Increase',
      message: `Price has increased by ${stats.totalChange.toFixed(1)}% over the selected period. Consider reviewing vendor contracts or exploring alternatives.`
    });
  } else if (stats.totalChange < -10) {
    insights.push({
      type: 'positive',
      title: 'Favorable Price Decrease',
      message: `Price has decreased by ${Math.abs(stats.totalChange).toFixed(1)}% over the selected period. This represents good cost savings.`
    });
  }

  if (stats.currentPrice === stats.minPrice) {
    insights.push({
      type: 'info',
      title: 'Optimal Pricing',
      message: 'Current price matches the lowest price in the selected period. This is an optimal time for procurement.'
    });
  }

  if (history.length > 3) {
    const recentChanges = history.slice(0, 3).map(entry => entry.changePercentage);
    const avgRecentChange = recentChanges.reduce((sum, change) => sum + Math.abs(change), 0) / recentChanges.length;
    
    if (avgRecentChange > 5) {
      insights.push({
        type: 'warning',
        title: 'High Price Volatility',
        message: 'This item shows high price volatility recently. Consider negotiating fixed-price contracts or implementing price hedging strategies.'
      });
    }
  }

  return insights;
}