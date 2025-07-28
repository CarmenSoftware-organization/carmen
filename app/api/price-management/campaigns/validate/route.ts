import { NextRequest, NextResponse } from 'next/server';
import { campaignManagementService } from '@/lib/services/campaign-management-service';
import { CreateCampaignRequest } from '@/lib/types/campaign-management';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const campaignRequest: CreateCampaignRequest = {
      name: body.name,
      description: body.description || '',
      campaignType: body.campaignType || 'one-time',
      selectedVendors: body.selectedVendors || [],
      selectedCategories: body.selectedCategories || [],
      scheduledStart: body.scheduledStart ? new Date(body.scheduledStart) : new Date(),
      scheduledEnd: body.scheduledEnd ? new Date(body.scheduledEnd) : undefined,
      recurringPattern: body.recurringPattern,
      settings: {
        portalAccessDuration: body.settings?.portalAccessDuration || 14,
        allowedSubmissionMethods: body.settings?.allowedSubmissionMethods || ['manual', 'upload'],
        requireApproval: body.settings?.requireApproval ?? true,
        autoReminders: body.settings?.autoReminders ?? true,
        reminderSchedule: body.settings?.reminderSchedule,
        emailTemplate: body.settings?.emailTemplate || 'default-template',
        customInstructions: body.settings?.customInstructions,
        priority: body.settings?.priority || 'medium'
      }
    };

    const validation = await campaignManagementService.validateCampaign(campaignRequest);
    const preview = await campaignManagementService.previewCampaign(campaignRequest);
    
    return NextResponse.json({
      success: true,
      data: {
        validation,
        preview
      }
    });
  } catch (error) {
    console.error('Error validating campaign:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to validate campaign',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}