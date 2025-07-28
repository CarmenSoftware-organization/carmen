/**
 * Vendor Pricelist Settings API Routes
 * 
 * API endpoints for managing vendor pricelist settings
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
 * GET /api/price-management/vendors/[id]/pricelist-settings
 * Get vendor pricelist settings
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    // Check if vendor exists
    const vendorExists = await vendorService.vendorExists(id);
    if (!vendorExists) {
      return NextResponse.json(
        { success: false, message: `Vendor with ID ${id} not found` },
        { status: 404 }
      );
    }
    
    // Get vendor
    const vendorResponse = await vendorService.getVendorById(id);
    
    if (!vendorResponse.success) {
      return NextResponse.json(
        vendorResponse,
        { status: 404 }
      );
    }
    
    // Extract pricelist settings
    const settings = {
      priceCollectionPreferences: vendorResponse.data.priceCollectionPreferences,
      assignedCategories: vendorResponse.data.assignedCategories
    };
    
    return NextResponse.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error(`Error in GET /api/price-management/vendors/${params.id}/pricelist-settings:`, error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/price-management/vendors/[id]/pricelist-settings
 * Update vendor pricelist settings
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const settingsData = await request.json();
    
    // Check if vendor exists
    const vendorExists = await vendorService.vendorExists(id);
    if (!vendorExists) {
      return NextResponse.json(
        { success: false, message: `Vendor with ID ${id} not found` },
        { status: 404 }
      );
    }
    
    // Update vendor with new settings
    const updateData: any = {};
    
    if (settingsData.priceCollectionPreferences) {
      updateData.priceCollectionPreferences = settingsData.priceCollectionPreferences;
    }
    
    if (settingsData.assignedCategories) {
      updateData.assignedCategories = settingsData.assignedCategories;
    }
    
    const response = await vendorService.updateVendor(id, updateData);
    
    if (!response.success) {
      return NextResponse.json(
        response,
        { status: 400 }
      );
    }
    
    // Extract updated settings
    const updatedSettings = {
      priceCollectionPreferences: response.data.priceCollectionPreferences,
      assignedCategories: response.data.assignedCategories
    };
    
    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: 'Vendor pricelist settings updated successfully'
    });
  } catch (error) {
    console.error(`Error in PUT /api/price-management/vendors/${params.id}/pricelist-settings:`, error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}