import { NextRequest, NextResponse } from 'next/server';
import { campaignManagementService } from '@/lib/services/campaign-management-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action } = body;
    
    if (!action) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Action is required',
          message: 'Please specify an action: start, pause, resume, or stop'
        },
        { status: 400 }
      );
    }

    switch (action) {
      case 'start':
        await campaignManagementService.startCampaign(params.id);
        break;
      case 'pause':
        await campaignManagementService.pauseCampaign(params.id);
        break;
      case 'resume':
        await campaignManagementService.resumeCampaign(params.id);
        break;
      case 'stop':
        await campaignManagementService.stopCampaign(params.id);
        break;
      default:
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid action',
            message: 'Valid actions are: start, pause, resume, stop'
          },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      message: `Campaign ${action}ed successfully`
    });
  } catch (error) {
    console.error(`Error performing campaign action:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to perform campaign action',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: error instanceof Error && error.message.includes('not found') ? 404 : 500 }
    );
  }
}