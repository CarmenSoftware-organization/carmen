import { NextRequest, NextResponse } from 'next/server';

// Mock data imports
import vendorsData from '@/lib/mock/price-management/vendors.json';
import pricelistsData from '@/lib/mock/price-management/pricelists.json';
import priceAssignmentsData from '@/lib/mock/price-management/price-assignments.json';
import businessRulesData from '@/lib/mock/price-management/business-rules.json';
import portalSessionsData from '@/lib/mock/price-management/portal-sessions.json';
import analyticsData from '@/lib/mock/price-management/analytics.json';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Return overview data by default
    if (!type || type === 'overview') {
      return NextResponse.json({
        success: true,
        data: {
          overview: analyticsData.overview,
          recentActivity: [
            {
              type: 'vendor_submission',
              message: 'ABC Food Supplies submitted new pricing',
              timestamp: '2024-01-16T14:35:00Z',
              status: 'success'
            },
            {
              type: 'price_assignment',
              message: 'Auto-assigned 23 PR items',
              timestamp: '2024-01-16T11:20:00Z',
              status: 'success'
            },
            {
              type: 'price_expiry',
              message: '5 price lists expiring this week',
              timestamp: '2024-01-16T09:00:00Z',
              status: 'warning'
            }
          ],
          quickStats: {
            totalVendors: vendorsData.vendors.length,
            activeVendors: vendorsData.vendors.filter(v => v.status === 'active').length,
            totalPriceLists: pricelistsData.length,
            activePriceLists: pricelistsData.filter(p => p.status === 'Active').length,
            totalAssignments: priceAssignmentsData.priceAssignments.length,
            successfulAssignments: priceAssignmentsData.priceAssignments.filter(a => !a.isManualOverride).length,
            pendingAssignments: 0, // No pending assignments in current data structure
            activeRules: businessRulesData.businessRules.filter(r => r.isActive).length
          }
        }
      });
    }

    // Return specific data type
    switch (type) {
      case 'vendors':
        return NextResponse.json({
          success: true,
          data: vendorsData
        });

      case 'pricelists':
        return NextResponse.json({
          success: true,
          data: pricelistsData
        });

      case 'assignments':
        return NextResponse.json({
          success: true,
          data: priceAssignmentsData.priceAssignments
        });

      case 'rules':
        return NextResponse.json({
          success: true,
          data: businessRulesData.businessRules
        });

      case 'sessions':
        return NextResponse.json({
          success: true,
          data: portalSessionsData
        });

      case 'analytics':
        return NextResponse.json({
          success: true,
          data: analyticsData
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid data type requested'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Price Management API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    // Simulate different actions
    switch (action) {
      case 'create_vendor':
        return NextResponse.json({
          success: true,
          message: 'Vendor created successfully',
          data: {
            id: `vendor-${Date.now()}`,
            ...data,
            createdAt: new Date().toISOString()
          }
        });

      case 'update_vendor_settings':
        return NextResponse.json({
          success: true,
          message: 'Vendor settings updated successfully',
          data: {
            ...data,
            updatedAt: new Date().toISOString()
          }
        });

      case 'create_portal_session':
        return NextResponse.json({
          success: true,
          message: 'Portal session created successfully',
          data: {
            id: `session-${Date.now()}`,
            sessionToken: `token-${Math.random().toString(36).substring(2, 15)}`,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
            portalUrl: `/price-management/vendor-portal/token-${Math.random().toString(36).substring(2, 15)}`,
            ...data,
            createdAt: new Date().toISOString()
          }
        });

      case 'create_business_rule':
        return NextResponse.json({
          success: true,
          message: 'Business rule created successfully',
          data: {
            id: `rule-${Date.now()}`,
            ...data,
            createdAt: new Date().toISOString(),
            performance: {
              executionsCount: 0,
              successfulExecutions: 0,
              failedExecutions: 0,
              successRate: 0,
              averageConfidenceScore: 0,
              totalAssignments: 0,
              manualOverrides: 0,
              lastTriggered: null
            }
          }
        });

      case 'assign_price':
        return NextResponse.json({
          success: true,
          message: 'Price assigned successfully',
          data: {
            id: `assignment-${Date.now()}`,
            ...data,
            assignedAt: new Date().toISOString(),
            status: 'Assigned'
          }
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action specified'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Price Management API POST Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}