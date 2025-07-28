import { NextRequest, NextResponse } from 'next/server';
import { campaignManagementService } from '@/lib/services/campaign-management-service';

export async function GET(request: NextRequest) {
  try {
    const templates = await campaignManagementService.getCampaignTemplates();
    
    return NextResponse.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching campaign templates:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch campaign templates',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}