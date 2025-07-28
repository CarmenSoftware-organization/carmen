import { NextRequest, NextResponse } from 'next/server';
import { campaignManagementService } from '@/lib/services/campaign-management-service';
import { CreateCampaignRequest, CampaignFilters } from '@/lib/types/campaign-management';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters: CampaignFilters = {};
    
    // Parse status filter
    const statusParam = searchParams.get('status');
    if (statusParam) {
      filters.status = statusParam.split(',') as any[];
    }
    
    // Parse campaign type filter
    const typeParam = searchParams.get('campaignType');
    if (typeParam) {
      filters.campaignType = typeParam.split(',') as any[];
    }
    
    // Parse created by filter
    const createdByParam = searchParams.get('createdBy');
    if (createdByParam) {
      filters.createdBy = createdByParam;
    }
    
    // Parse search term
    const searchTerm = searchParams.get('search');
    if (searchTerm) {
      filters.searchTerm = searchTerm;
    }
    
    // Parse date range
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate && endDate) {
      filters.dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    }

    const campaigns = await campaignManagementService.getCampaigns(filters);
    
    return NextResponse.json({
      success: true,
      data: campaigns,
      count: campaigns.length
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch campaigns',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.selectedVendors || !body.selectedCategories) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'Name, selectedVendors, and selectedCategories are required'
        },
        { status: 400 }
      );
    }

    const createRequest: CreateCampaignRequest = {
      name: body.name,
      description: body.description || '',
      campaignType: body.campaignType || 'one-time',
      selectedVendors: body.selectedVendors,
      selectedCategories: body.selectedCategories,
      scheduledStart: new Date(body.scheduledStart),
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
      },
      templateId: body.templateId
    };

    // Validate the campaign
    const validation = await campaignManagementService.validateCampaign(createRequest);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campaign validation failed',
          validation
        },
        { status: 400 }
      );
    }

    const campaignId = await campaignManagementService.createCampaign(createRequest);
    
    return NextResponse.json({
      success: true,
      data: { campaignId },
      message: 'Campaign created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create campaign',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}