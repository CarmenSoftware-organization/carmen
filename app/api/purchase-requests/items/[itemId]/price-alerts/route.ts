import { NextRequest, NextResponse } from 'next/server';
import { prPriceAssignmentService } from '@/lib/services/pr-price-assignment-service';

// GET /api/purchase-requests/items/[itemId]/price-alerts
export async function GET(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const itemId = params.itemId;
    const { searchParams } = new URL(request.url);
    const includeAcknowledged = searchParams.get('includeAcknowledged') === 'true';
    
    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Get price alerts for the item
    const allAlerts = await prPriceAssignmentService.getPriceAlerts(itemId);
    
    // Filter alerts based on acknowledgment status
    const alerts = includeAcknowledged ? 
      allAlerts : 
      allAlerts.filter(alert => !alert.isAcknowledged);

    // Categorize alerts by severity
    const alertSummary = {
      total: alerts.length,
      high: alerts.filter(alert => alert.severity === 'high').length,
      medium: alerts.filter(alert => alert.severity === 'medium').length,
      low: alerts.filter(alert => alert.severity === 'low').length,
      unacknowledged: alerts.filter(alert => !alert.isAcknowledged).length
    };

    // Generate alert insights
    const insights = generateAlertInsights(alerts);

    return NextResponse.json({
      success: true,
      data: {
        itemId,
        alerts,
        summary: alertSummary,
        insights,
        hasActiveAlerts: alerts.some(alert => !alert.isAcknowledged),
        requiresAttention: alerts.some(alert => 
          alert.severity === 'high' && !alert.isAcknowledged
        )
      }
    });
  } catch (error) {
    console.error('Error getting price alerts:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get price alerts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/purchase-requests/items/[itemId]/price-alerts/acknowledge
export async function POST(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const itemId = params.itemId;
    const body = await request.json();
    const { alertId, userId } = body;
    
    if (!itemId || !alertId || !userId) {
      return NextResponse.json(
        { error: 'Item ID, Alert ID, and User ID are required' },
        { status: 400 }
      );
    }

    // Acknowledge the alert
    await prPriceAssignmentService.acknowledgePriceAlert(alertId, userId);

    return NextResponse.json({
      success: true,
      message: 'Alert acknowledged successfully'
    });
  } catch (error) {
    console.error('Error acknowledging price alert:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to acknowledge alert',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateAlertInsights(alerts: any[]) {
  const insights = [];

  if (alerts.length === 0) {
    return [{
      type: 'positive',
      title: 'No Active Alerts',
      message: 'All price alerts have been addressed. Pricing is stable for this item.'
    }];
  }

  const highSeverityAlerts = alerts.filter(alert => alert.severity === 'high');
  const unacknowledgedAlerts = alerts.filter(alert => !alert.isAcknowledged);

  if (highSeverityAlerts.length > 0) {
    insights.push({
      type: 'error',
      title: 'Critical Price Issues',
      message: `${highSeverityAlerts.length} high-severity alert(s) require immediate attention.`
    });
  }

  if (unacknowledgedAlerts.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Unacknowledged Alerts',
      message: `${unacknowledgedAlerts.length} alert(s) need to be reviewed and acknowledged.`
    });
  }

  const priceIncreaseAlerts = alerts.filter(alert => alert.type === 'price_increase');
  if (priceIncreaseAlerts.length > 0) {
    const totalIncrease = priceIncreaseAlerts.reduce((sum, alert) => 
      sum + (alert.changePercentage || 0), 0
    );
    insights.push({
      type: 'warning',
      title: 'Price Increases Detected',
      message: `${priceIncreaseAlerts.length} price increase(s) detected with average increase of ${(totalIncrease / priceIncreaseAlerts.length).toFixed(1)}%.`
    });
  }

  const priceDecreaseAlerts = alerts.filter(alert => alert.type === 'price_decrease');
  if (priceDecreaseAlerts.length > 0) {
    insights.push({
      type: 'positive',
      title: 'Cost Savings Opportunities',
      message: `${priceDecreaseAlerts.length} price decrease(s) detected. Consider increasing order quantities.`
    });
  }

  const vendorUnavailableAlerts = alerts.filter(alert => alert.type === 'vendor_unavailable');
  if (vendorUnavailableAlerts.length > 0) {
    insights.push({
      type: 'error',
      title: 'Vendor Availability Issues',
      message: `${vendorUnavailableAlerts.length} vendor(s) currently unavailable. Alternative sourcing required.`
    });
  }

  const volatilityAlerts = alerts.filter(alert => alert.type === 'price_volatility');
  if (volatilityAlerts.length > 0) {
    insights.push({
      type: 'info',
      title: 'Price Volatility Detected',
      message: `${volatilityAlerts.length} volatility alert(s). Consider fixed-price contracts or hedging strategies.`
    });
  }

  return insights;
}