import { NextRequest, NextResponse } from 'next/server';
import { campaignManagementService } from '@/lib/services/campaign-management-service';
import { UpdateCampaignRequest } from '@/lib/types/campaign-management';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = await campaignManagementService.getCampaign(params.id);
    
    return NextResponse.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch campaign',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: error instanceof Error && error.message.includes('not found') ? 404 : 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const updateRequest: UpdateCampaignRequest = {
      name: body.name,
      description: body.description,
      selectedVendors: body.selectedVendors,
      selectedCategories: body.selectedCategories,
      scheduledStart: body.scheduledStart ? new Date(body.scheduledStart) : undefined,
      scheduledEnd: body.scheduledEnd ? new Date(body.scheduledEnd) : undefined,
      recurringPattern: body.recurringPattern,
      settings: body.settings
    };

    await campaignManagementService.updateCampaign(params.id, updateRequest);
    
    return NextResponse.json({
      success: true,
      message: 'Campaign updated successfully'
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update campaign',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: error instanceof Error && error.message.includes('not found') ? 404 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const retainData = searchParams.get('retainData') === 'true';
    
    await campaignManagementService.deleteCampaign(params.id, { retainData });
    
    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete campaign',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: error instanceof Error && error.message.includes('not found') ? 404 : 500 }
    );
  }
}