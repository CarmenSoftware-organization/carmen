import { NextRequest, NextResponse } from 'next/server';
import { campaignManagementService } from '@/lib/services/campaign-management-service';
import { CampaignDuplicationRequest } from '@/lib/types/campaign-management';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.sourceCampaignId || !body.newName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'sourceCampaignId and newName are required'
        },
        { status: 400 }
      );
    }

    const duplicateRequest: CampaignDuplicationRequest = {
      sourceCampaignId: body.sourceCampaignId,
      newName: body.newName,
      newDescription: body.newDescription,
      preserveVendors: body.preserveVendors ?? true,
      preserveCategories: body.preserveCategories ?? true,
      preserveSettings: body.preserveSettings ?? true,
      newScheduledStart: body.newScheduledStart ? new Date(body.newScheduledStart) : undefined
    };

    const newCampaignId = await campaignManagementService.duplicateCampaign(duplicateRequest);
    
    return NextResponse.json({
      success: true,
      data: { campaignId: newCampaignId },
      message: 'Campaign duplicated successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error duplicating campaign:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to duplicate campaign',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}