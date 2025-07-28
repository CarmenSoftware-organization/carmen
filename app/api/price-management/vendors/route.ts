/**
 * Vendor Management API Routes
 * 
 * API endpoints for vendor management operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { VendorPriceManagementService } from '@/lib/services/vendor-price-management-service';
import { VendorFilters, SortConfig, PaginationConfig } from '@/lib/types/vendor-price-management';

const vendorService = new VendorPriceManagementService();

/**
 * GET /api/price-management/vendors
 * Get all vendors with optional filtering, sorting, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse filters
    const filters: VendorFilters = {};
    
    // Status filter
    const status = searchParams.get('status');
    if (status) {
      filters.status = status.split(',') as any[];
    }
    
    // Categories filter
    const categories = searchParams.get('categories');
    if (categories) {
      filters.categories = categories.split(',');
    }
    
    // Performance range filter
    const performanceField = searchParams.get('performanceField');
    const performanceMin = searchParams.get('performanceMin');
    const performanceMax = searchParams.get('performanceMax');
    if (performanceField && performanceMin && performanceMax) {
      filters.performanceRange = {
        field: performanceField as 'responseRate' | 'dataQualityScore',
        min: Number(performanceMin),
        max: Number(performanceMax)
      };
    }
    
    // Last submission range filter
    const submissionStart = searchParams.get('submissionStart');
    const submissionEnd = searchParams.get('submissionEnd');
    if (submissionStart && submissionEnd) {
      filters.lastSubmissionRange = {
        startDate: submissionStart,
        endDate: submissionEnd
      };
    }
    
    // Parse sorting
    let sort: SortConfig | undefined;
    const sortField = searchParams.get('sortField');
    const sortDirection = searchParams.get('sortDirection');
    if (sortField && sortDirection) {
      sort = {
        field: sortField,
        direction: sortDirection as 'asc' | 'desc'
      };
    }
    
    // Parse pagination
    let pagination: PaginationConfig | undefined;
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    if (page && limit) {
      pagination = {
        page: Number(page),
        limit: Number(limit)
      };
    }
    
    // Search query
    const query = searchParams.get('query');
    
    // Get vendors
    const response = query 
      ? await vendorService.searchVendors(query)
      : await vendorService.getVendors(
          Object.keys(filters).length > 0 ? filters : undefined,
          sort,
          pagination
        );
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/price-management/vendors:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/price-management/vendors
 * Create a new vendor
 */
export async function POST(request: NextRequest) {
  try {
    const vendorData = await request.json();
    
    // Add current user as creator
    vendorData.createdBy = 'current-user'; // In a real app, get from auth context
    
    const response = await vendorService.createVendor(vendorData);
    
    return NextResponse.json(
      response,
      { status: response.success ? 201 : 400 }
    );
  } catch (error) {
    console.error('Error in POST /api/price-management/vendors:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}