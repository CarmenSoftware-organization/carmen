import { NextRequest, NextResponse } from 'next/server';
import { priceValidityReportingService } from '@/lib/services/price-validity-reporting-service';
import { priceStatusManagementService } from '@/lib/services/price-status-management-service';
import { priceLifecycleService } from '@/lib/services/price-lifecycle-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'metrics':
        return await handleGetMetrics();
      
      case 'status-data':
        return await handleGetStatusData(searchParams);
      
      case 'alerts':
        return await handleGetAlerts(searchParams);
      
      case 'report':
        return await handleGenerateReport(searchParams);
      
      case 'forecast':
        return await handleGetForecast(searchParams);
      
      case 'lifecycle-states':
        return await handleGetLifecycleStates();
      
      default:
        return await handleGetDashboard();
    }
  } catch (error) {
    console.error('Error in price validity API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'update-status':
        return await handleUpdateStatus(body);
      
      case 'bulk-update':
        return await handleBulkUpdate(body);
      
      case 'renew-price':
        return await handleRenewPrice(body);
      
      case 'transition-state':
        return await handleTransitionState(body);
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in price validity POST API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function handleGetDashboard() {
  try {
    const dashboard = await priceStatusManagementService.getStatusDashboard();
    
    return NextResponse.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    throw new Error(`Failed to get dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleGetMetrics() {
  try {
    const metrics = await priceStatusManagementService.getStatusMetrics();
    const validityMetrics = await priceValidityReportingService.getValidityMetrics();
    
    return NextResponse.json({
      success: true,
      data: {
        statusMetrics: metrics,
        validityMetrics: validityMetrics.summary,
        trends: validityMetrics.trends,
        statusDistribution: validityMetrics.statusDistribution,
        riskAnalysis: validityMetrics.riskAnalysis
      }
    });
  } catch (error) {
    throw new Error(`Failed to get metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleGetStatusData(searchParams: URLSearchParams) {
  try {
    const priceItemIds = searchParams.get('priceItemIds')?.split(',').filter(Boolean);
    const statusFilter = searchParams.get('status')?.split(',').filter(Boolean);
    const urgencyLevel = searchParams.get('urgency');
    
    let statusData = await priceStatusManagementService.getPriceStatusData(priceItemIds);
    
    // Apply status filter if provided
    if (statusFilter && statusFilter.length > 0) {
      statusData = statusData.filter(item => statusFilter.includes(item.currentStatus));
    }
    
    // Apply urgency filter if provided
    if (urgencyLevel) {
      const actionItems = await priceStatusManagementService.getItemsRequiringAction(urgencyLevel);
      const actionItemIds = actionItems.map(item => item.priceItemId);
      statusData = statusData.filter(item => actionItemIds.includes(item.priceItemId));
    }
    
    return NextResponse.json({
      success: true,
      data: statusData
    });
  } catch (error) {
    throw new Error(`Failed to get status data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleGetAlerts(searchParams: URLSearchParams) {
  try {
    const severity = searchParams.get('severity')?.split(',').filter(Boolean);
    
    const alerts = await priceValidityReportingService.getValidityAlerts(severity);
    
    return NextResponse.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    throw new Error(`Failed to get alerts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleGenerateReport(searchParams: URLSearchParams) {
  try {
    const reportType = searchParams.get('type') as 'summary' | 'detailed' | 'executive' || 'summary';
    const vendorIds = searchParams.get('vendorIds')?.split(',').filter(Boolean);
    const statusFilter = searchParams.get('status')?.split(',').filter(Boolean);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const filters: any = {};
    
    if (vendorIds && vendorIds.length > 0) {
      filters.vendorIds = vendorIds;
    }
    
    if (statusFilter && statusFilter.length > 0) {
      filters.statusFilter = statusFilter;
    }
    
    if (startDate && endDate) {
      filters.expirationDateRange = {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      };
    }
    
    const report = await priceValidityReportingService.generateValidityReport(reportType, filters);
    
    return NextResponse.json({
      success: true,
      data: report
    });
  } catch (error) {
    throw new Error(`Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleGetForecast(searchParams: URLSearchParams) {
  try {
    const days = parseInt(searchParams.get('days') || '90');
    
    const forecast = await priceValidityReportingService.getExpirationForecast(days);
    const lifecycleForecast = await priceLifecycleService.getExpirationForecast(days);
    
    return NextResponse.json({
      success: true,
      data: {
        validityForecast: forecast,
        lifecycleForecast: lifecycleForecast
      }
    });
  } catch (error) {
    throw new Error(`Failed to get forecast: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleGetLifecycleStates() {
  try {
    const states = await priceLifecycleService.getLifecycleStates();
    const validityPeriods = await priceLifecycleService.getValidityPeriods();
    const transitionRules = await priceLifecycleService.getStateTransitionRules();
    
    return NextResponse.json({
      success: true,
      data: {
        states,
        validityPeriods,
        transitionRules
      }
    });
  } catch (error) {
    throw new Error(`Failed to get lifecycle states: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleUpdateStatus(body: any) {
  try {
    const { priceItemId, fromStatus, toStatus, reason, changedBy, additionalData } = body;
    
    if (!priceItemId || !fromStatus || !toStatus || !reason || !changedBy) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'priceItemId, fromStatus, toStatus, reason, and changedBy are required'
        },
        { status: 400 }
      );
    }
    
    const result = await priceStatusManagementService.updatePriceStatus({
      priceItemId,
      fromStatus,
      toStatus,
      reason,
      changedBy,
      additionalData
    });
    
    return NextResponse.json({
      success: result.success,
      data: result,
      message: result.message
    });
  } catch (error) {
    throw new Error(`Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleBulkUpdate(body: any) {
  try {
    const { priceItemIds, targetStatus, reason, changedBy, filters } = body;
    
    if (!targetStatus || !reason || !changedBy) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'targetStatus, reason, and changedBy are required'
        },
        { status: 400 }
      );
    }
    
    if (!priceItemIds || priceItemIds.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No price items specified',
          message: 'priceItemIds array cannot be empty'
        },
        { status: 400 }
      );
    }
    
    const result = await priceStatusManagementService.bulkUpdateStatus({
      priceItemIds,
      targetStatus,
      reason,
      changedBy,
      filters
    });
    
    return NextResponse.json({
      success: result.success,
      data: result,
      message: result.message
    });
  } catch (error) {
    throw new Error(`Failed to bulk update: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleRenewPrice(body: any) {
  try {
    const { priceItemId, newExpirationDate, newPrice, currency, reason, requestedBy, autoApprove } = body;
    
    if (!priceItemId || !newExpirationDate || !reason || !requestedBy) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'priceItemId, newExpirationDate, reason, and requestedBy are required'
        },
        { status: 400 }
      );
    }
    
    const result = await priceLifecycleService.renewPrice({
      priceItemId,
      newExpirationDate: new Date(newExpirationDate),
      newPrice,
      currency,
      reason,
      requestedBy,
      autoApprove
    });
    
    return NextResponse.json({
      success: result.success,
      data: result,
      message: result.message
    });
  } catch (error) {
    throw new Error(`Failed to renew price: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleTransitionState(body: any) {
  try {
    const { priceItemId, toState, reason, triggeredBy, metadata } = body;
    
    if (!priceItemId || !toState || !reason || !triggeredBy) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'priceItemId, toState, reason, and triggeredBy are required'
        },
        { status: 400 }
      );
    }
    
    const result = await priceLifecycleService.transitionPriceState(
      priceItemId,
      toState,
      reason,
      triggeredBy,
      metadata
    );
    
    return NextResponse.json({
      success: result.success,
      data: result,
      message: result.message
    });
  } catch (error) {
    throw new Error(`Failed to transition state: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    switch (action) {
      case 'process-automatic-transitions':
        return await handleProcessAutomaticTransitions();
      
      case 'check-status-updates':
        return await handleCheckStatusUpdates();
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in price validity PUT API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function handleProcessAutomaticTransitions() {
  try {
    const lifecycleResult = await priceLifecycleService.processAutomaticTransitions();
    const statusResult = await priceStatusManagementService.checkAndUpdateAutomaticStatuses();
    
    return NextResponse.json({
      success: true,
      data: {
        lifecycle: lifecycleResult,
        status: statusResult
      },
      message: `Processed ${lifecycleResult.transitionCount + statusResult.updatedCount} automatic transitions`
    });
  } catch (error) {
    throw new Error(`Failed to process automatic transitions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleCheckStatusUpdates() {
  try {
    const result = await priceStatusManagementService.checkAndUpdateAutomaticStatuses();
    
    return NextResponse.json({
      success: true,
      data: result,
      message: `Checked ${result.checkedCount} items, updated ${result.updatedCount}`
    });
  } catch (error) {
    throw new Error(`Failed to check status updates: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}