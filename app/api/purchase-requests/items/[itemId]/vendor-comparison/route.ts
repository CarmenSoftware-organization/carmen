import { NextRequest, NextResponse } from 'next/server';
import { prPriceAssignmentService } from '@/lib/services/pr-price-assignment-service';

// GET /api/purchase-requests/items/[itemId]/vendor-comparison
export async function GET(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const itemId = params.itemId;
    
    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Get vendor comparison data for the item
    const vendorComparisons = await prPriceAssignmentService.getVendorComparison(itemId);

    // Calculate additional insights
    const insights = generateVendorInsights(vendorComparisons);

    return NextResponse.json({
      success: true,
      data: {
        itemId,
        vendors: vendorComparisons,
        insights,
        summary: {
          totalVendors: vendorComparisons.length,
          availableVendors: vendorComparisons.filter(v => v.availability === 'available').length,
          preferredVendors: vendorComparisons.filter(v => v.isPreferred).length,
          bestPrice: vendorComparisons.length > 0 ? Math.min(...vendorComparisons.map(v => v.price)) : 0,
          worstPrice: vendorComparisons.length > 0 ? Math.max(...vendorComparisons.map(v => v.price)) : 0,
          averagePrice: vendorComparisons.length > 0 ? 
            vendorComparisons.reduce((sum, v) => sum + v.price, 0) / vendorComparisons.length : 0,
          maxSavings: vendorComparisons.length > 0 ? Math.max(...vendorComparisons.map(v => v.savings)) : 0
        }
      }
    });
  } catch (error) {
    console.error('Error getting vendor comparison:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get vendor comparison data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateVendorInsights(vendors: any[]) {
  const insights = [];

  if (vendors.length === 0) {
    return [{
      type: 'warning',
      title: 'No Vendors Available',
      message: 'No vendors found for this item. Consider expanding vendor network or checking item specifications.'
    }];
  }

  const availableVendors = vendors.filter(v => v.availability === 'available');
  const preferredVendors = vendors.filter(v => v.isPreferred);
  
  if (availableVendors.length === 0) {
    insights.push({
      type: 'error',
      title: 'No Available Vendors',
      message: 'All vendors are currently unavailable. Consider contacting vendors directly or finding alternatives.'
    });
  }

  if (preferredVendors.length === 0) {
    insights.push({
      type: 'warning',
      title: 'No Preferred Vendors',
      message: 'No preferred vendors available for this item. Review vendor preferences or consider establishing preferred vendor relationships.'
    });
  }

  const prices = vendors.map(v => v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = ((maxPrice - minPrice) / minPrice) * 100;

  if (priceRange > 20) {
    insights.push({
      type: 'info',
      title: 'Significant Price Variation',
      message: `Price varies by ${priceRange.toFixed(1)}% across vendors. Consider negotiating with higher-priced vendors or reviewing specifications.`
    });
  }

  const maxSavings = Math.max(...vendors.map(v => v.savings));
  if (maxSavings > 0) {
    const bestVendor = vendors.find(v => v.savings === maxSavings);
    insights.push({
      type: 'positive',
      title: 'Savings Opportunity',
      message: `Switching to ${bestVendor?.vendorName} could save $${maxSavings.toFixed(2)} (${bestVendor?.savingsPercentage.toFixed(1)}%).`
    });
  }

  const highRatedVendors = vendors.filter(v => v.rating >= 4.5);
  if (highRatedVendors.length > 0) {
    insights.push({
      type: 'positive',
      title: 'High-Quality Options',
      message: `${highRatedVendors.length} vendor(s) have ratings of 4.5+ stars, ensuring quality procurement.`
    });
  }

  const fastDeliveryVendors = vendors.filter(v => v.leadTime <= 3);
  if (fastDeliveryVendors.length > 0) {
    insights.push({
      type: 'info',
      title: 'Fast Delivery Available',
      message: `${fastDeliveryVendors.length} vendor(s) offer delivery within 3 days for urgent requirements.`
    });
  }

  return insights;
}