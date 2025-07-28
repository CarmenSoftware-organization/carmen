import { NextRequest, NextResponse } from 'next/server';
import { campaignManagementService } from '@/lib/services/campaign-management-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendorStatuses = await campaignManagementService.getCampaignVendorStatuses(params.id);
    
    return NextResponse.json({
      success: true,
      data: vendorStatuses
    });
  } catch (error) {
    console.error('Error fetching campaign vendor statuses:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch campaign vendor statuses',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: error instanceof Error && error.message.includes('not found') ? 404 : 500 }
    );
  }
}