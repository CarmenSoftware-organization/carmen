/**
 * Individual Vendor API Routes
 * 
 * API endpoints for operations on a specific vendor
 */

import { NextRequest, NextResponse } from 'next/server';
import { VendorPriceManagementService } from '@/lib/services/vendor-price-management-service';

const vendorService = new VendorPriceManagementService();

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/price-management/vendors/[id]
 * Get a vendor by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const response = await vendorService.getVendorById(id);
    
    if (!response.success) {
      return NextResponse.json(
        response,
        { status: 404 }
      );
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error in GET /api/price-management/vendors/${params.id}:`, error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/price-management/vendors/[id]
 * Update a vendor
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const vendorData = await request.json();
    
    const response = await vendorService.updateVendor(id, vendorData);
    
    if (!response.success) {
      return NextResponse.json(
        response,
        { status: response.message?.includes('not found') ? 404 : 400 }
      );
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error in PUT /api/price-management/vendors/${params.id}:`, error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/price-management/vendors/[id]
 * Delete a vendor
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const response = await vendorService.deleteVendor(id);
    
    if (!response.success) {
      return NextResponse.json(
        response,
        { status: response.message?.includes('not found') ? 404 : 400 }
      );
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error in DELETE /api/price-management/vendors/${params.id}:`, error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}