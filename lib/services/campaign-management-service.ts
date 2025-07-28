import { 
  PriceCollectionCampaign, 
  CreateCampaignRequest, 
  UpdateCampaignRequest,
  CampaignProgress,
  CampaignAnalytics,
  CampaignValidationResult,
  CampaignPreview,
  CampaignVendorStatus,
  CampaignDuplicationRequest,
  CampaignFilters,
  CampaignTemplate,
  CampaignManagementService
} from '@/lib/types/campaign-management';

// Mock data imports
import campaignsData from '@/lib/mock/price-management/campaigns.json';
import templatesData from '@/lib/mock/price-management/campaign-templates.json';
import vendorsDataImport from '@/lib/mock/price-management/vendors.json';
const vendorsData = vendorsDataImport.vendors;

class CampaignManagementServiceImpl implements CampaignManagementService {
  private campaigns: PriceCollectionCampaign[] = campaignsData.map(campaign => ({
    ...campaign,
    scheduledStart: new Date(campaign.scheduledStart),
    scheduledEnd: campaign.scheduledEnd ? new Date(campaign.scheduledEnd) : undefined,
    recurringPattern: campaign.recurringPattern ? {
      ...campaign.recurringPattern,
      endDate: campaign.recurringPattern.endDate ? new Date(campaign.recurringPattern.endDate) : undefined
    } : undefined,
    progress: {
      ...campaign.progress,
      lastUpdated: new Date(campaign.progress.lastUpdated)
    },
    createdAt: new Date(campaign.createdAt),
    updatedAt: new Date(campaign.updatedAt)
  } as PriceCollectionCampaign));

  private templates: CampaignTemplate[] = templatesData.map(template => ({
    ...template,
    createdAt: new Date(template.createdAt)
  } as CampaignTemplate));

  async createCampaign(request: CreateCampaignRequest): Promise<string> {
    const newId = `camp-${String(this.campaigns.length + 1).padStart(3, '0')}`;
    
    const newCampaign: PriceCollectionCampaign = {
      id: newId,
      ...request,
      status: 'draft',
      progress: {
        totalVendors: request.selectedVendors.length,
        invitedVendors: 0,
        respondedVendors: 0,
        completedSubmissions: 0,
        pendingSubmissions: 0,
        failedSubmissions: 0,
        completionRate: 0,
        responseRate: 0,
        averageResponseTime: 0,
        lastUpdated: new Date()
      },
      createdBy: 'current.user@company.com', // In real app, get from auth context
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.campaigns.push(newCampaign);
    return newId;
  }

  async updateCampaign(campaignId: string, updates: UpdateCampaignRequest): Promise<void> {
    const campaignIndex = this.campaigns.findIndex(c => c.id === campaignId);
    if (campaignIndex === -1) {
      throw new Error(`Campaign with id ${campaignId} not found`);
    }

    const campaign = this.campaigns[campaignIndex];
    
    // Preserve submissions when updating vendor list
    if (updates.selectedVendors && campaign.status !== 'draft') {
      // In a real implementation, you'd check for existing submissions
      console.log('Preserving existing submissions while updating vendor list');
    }

    this.campaigns[campaignIndex] = {
      ...campaign,
      ...updates,
      updatedAt: new Date(),
      // Recalculate progress if vendors changed
      progress: updates.selectedVendors ? {
        ...campaign.progress,
        totalVendors: updates.selectedVendors.length,
        lastUpdated: new Date()
      } : campaign.progress
    } as PriceCollectionCampaign;
  }

  async deleteCampaign(campaignId: string, options: { retainData: boolean }): Promise<void> {
    const campaignIndex = this.campaigns.findIndex(c => c.id === campaignId);
    if (campaignIndex === -1) {
      throw new Error(`Campaign with id ${campaignId} not found`);
    }

    const campaign = this.campaigns[campaignIndex];
    
    // Check dependencies
    if (campaign.status === 'active') {
      throw new Error('Cannot delete active campaign. Please pause or stop the campaign first.');
    }

    if (campaign.progress.completedSubmissions > 0 && !options.retainData) {
      throw new Error('Campaign has completed submissions. Use retainData option to preserve submission data.');
    }

    if (options.retainData) {
      // In real implementation, mark as deleted but keep data
      this.campaigns[campaignIndex] = {
        ...campaign,
        status: 'cancelled',
        updatedAt: new Date()
      };
    } else {
      this.campaigns.splice(campaignIndex, 1);
    }
  }

  async duplicateCampaign(request: CampaignDuplicationRequest): Promise<string> {
    const sourceCampaign = this.campaigns.find(c => c.id === request.sourceCampaignId);
    if (!sourceCampaign) {
      throw new Error(`Source campaign with id ${request.sourceCampaignId} not found`);
    }

    const duplicateRequest: CreateCampaignRequest = {
      name: request.newName,
      description: request.newDescription || sourceCampaign.description,
      campaignType: sourceCampaign.campaignType,
      selectedVendors: request.preserveVendors ? sourceCampaign.selectedVendors : [],
      selectedCategories: request.preserveCategories ? sourceCampaign.selectedCategories : [],
      scheduledStart: request.newScheduledStart || new Date(),
      scheduledEnd: sourceCampaign.scheduledEnd,
      recurringPattern: sourceCampaign.recurringPattern,
      settings: request.preserveSettings ? sourceCampaign.settings : {
        portalAccessDuration: 14,
        allowedSubmissionMethods: ['manual', 'upload'],
        requireApproval: true,
        autoReminders: true,
        emailTemplate: 'default-template',
        priority: 'medium'
      }
    };

    return this.createCampaign(duplicateRequest);
  }

  async startCampaign(campaignId: string): Promise<void> {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) {
      throw new Error(`Campaign with id ${campaignId} not found`);
    }

    if (campaign.status !== 'draft' && campaign.status !== 'paused') {
      throw new Error(`Cannot start campaign with status ${campaign.status}`);
    }

    campaign.status = 'active';
    campaign.updatedAt = new Date();

    // In real implementation, trigger invitation sending
    console.log(`Starting campaign ${campaignId} - sending invitations to ${campaign.selectedVendors.length} vendors`);
  }

  async pauseCampaign(campaignId: string): Promise<void> {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) {
      throw new Error(`Campaign with id ${campaignId} not found`);
    }

    if (campaign.status !== 'active') {
      throw new Error(`Cannot pause campaign with status ${campaign.status}`);
    }

    campaign.status = 'paused';
    campaign.updatedAt = new Date();
  }

  async resumeCampaign(campaignId: string): Promise<void> {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) {
      throw new Error(`Campaign with id ${campaignId} not found`);
    }

    if (campaign.status !== 'paused') {
      throw new Error(`Cannot resume campaign with status ${campaign.status}`);
    }

    campaign.status = 'active';
    campaign.updatedAt = new Date();
  }

  async stopCampaign(campaignId: string): Promise<void> {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) {
      throw new Error(`Campaign with id ${campaignId} not found`);
    }

    if (campaign.status !== 'active' && campaign.status !== 'paused') {
      throw new Error(`Cannot stop campaign with status ${campaign.status}`);
    }

    campaign.status = 'completed';
    campaign.updatedAt = new Date();
  }

  async getCampaign(campaignId: string): Promise<PriceCollectionCampaign> {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) {
      throw new Error(`Campaign with id ${campaignId} not found`);
    }
    return campaign;
  }

  async getCampaigns(filters?: CampaignFilters): Promise<PriceCollectionCampaign[]> {
    let filteredCampaigns = [...this.campaigns];

    if (filters) {
      if (filters.status && filters.status.length > 0) {
        filteredCampaigns = filteredCampaigns.filter(c => filters.status!.includes(c.status));
      }

      if (filters.campaignType && filters.campaignType.length > 0) {
        filteredCampaigns = filteredCampaigns.filter(c => filters.campaignType!.includes(c.campaignType));
      }

      if (filters.createdBy) {
        filteredCampaigns = filteredCampaigns.filter(c => c.createdBy === filters.createdBy);
      }

      if (filters.dateRange) {
        filteredCampaigns = filteredCampaigns.filter(c => 
          c.createdAt >= filters.dateRange!.start && c.createdAt <= filters.dateRange!.end
        );
      }

      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filteredCampaigns = filteredCampaigns.filter(c => 
          c.name.toLowerCase().includes(searchLower) || 
          c.description.toLowerCase().includes(searchLower)
        );
      }
    }

    return filteredCampaigns.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getCampaignProgress(campaignId: string): Promise<CampaignProgress> {
    const campaign = await this.getCampaign(campaignId);
    return campaign.progress;
  }

  async getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics> {
    const campaign = await this.getCampaign(campaignId);
    
    // Mock analytics data - in real implementation, this would be calculated from actual data
    return {
      campaignId,
      overview: {
        totalVendors: campaign.progress.totalVendors,
        responseRate: campaign.progress.responseRate,
        completionRate: campaign.progress.completionRate,
        averageResponseTime: campaign.progress.averageResponseTime,
        totalSubmissions: campaign.progress.completedSubmissions,
        qualityScore: 85
      },
      vendorPerformance: campaign.selectedVendors.map((vendorId, index) => ({
        vendorId,
        vendorName: `Vendor ${vendorId}`,
        responseTime: 24 + (index * 12),
        completionRate: 80 + (index * 5),
        qualityScore: 75 + (index * 3),
        submissionCount: Math.floor(Math.random() * 10) + 1
      })),
      timelineMetrics: this.generateTimelineMetrics(campaign),
      categoryBreakdown: campaign.selectedCategories.map(categoryId => ({
        categoryId,
        categoryName: categoryId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        vendorCount: Math.floor(campaign.selectedVendors.length / campaign.selectedCategories.length),
        submissionCount: Math.floor(Math.random() * 20) + 5,
        completionRate: 70 + Math.floor(Math.random() * 30)
      })),
      issuesAndAlerts: this.generateIssuesAndAlerts(campaign)
    };
  }

  async validateCampaign(campaign: CreateCampaignRequest): Promise<CampaignValidationResult> {
    const errors: Array<{ field: string; message: string; severity: 'error' | 'warning' }> = [];
    const warnings: Array<{ field: string; message: string; suggestion?: string }> = [];

    // Validation logic
    if (!campaign.name.trim()) {
      errors.push({ field: 'name', message: 'Campaign name is required', severity: 'error' });
    }

    if (campaign.selectedVendors.length === 0) {
      errors.push({ field: 'selectedVendors', message: 'At least one vendor must be selected', severity: 'error' });
    }

    if (campaign.selectedCategories.length === 0) {
      errors.push({ field: 'selectedCategories', message: 'At least one category must be selected', severity: 'error' });
    }

    if (campaign.scheduledStart < new Date()) {
      warnings.push({ 
        field: 'scheduledStart', 
        message: 'Campaign start date is in the past',
        suggestion: 'Consider setting a future start date'
      });
    }

    if (campaign.scheduledEnd && campaign.scheduledEnd <= campaign.scheduledStart) {
      errors.push({ field: 'scheduledEnd', message: 'End date must be after start date', severity: 'error' });
    }

    if (campaign.selectedVendors.length > 50) {
      warnings.push({
        field: 'selectedVendors',
        message: 'Large number of vendors selected',
        suggestion: 'Consider breaking into smaller campaigns for better management'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  async previewCampaign(campaign: CreateCampaignRequest): Promise<CampaignPreview> {
    const estimatedDuration = campaign.scheduledEnd && campaign.scheduledStart 
      ? Math.ceil((campaign.scheduledEnd.getTime() - campaign.scheduledStart.getTime()) / (1000 * 60 * 60 * 24))
      : campaign.settings.portalAccessDuration;

    return {
      estimatedVendorCount: campaign.selectedVendors.length,
      estimatedCategoryCount: campaign.selectedCategories.length,
      estimatedDuration,
      estimatedWorkload: this.calculateWorkload(campaign.selectedVendors.length, campaign.selectedCategories.length),
      potentialIssues: this.identifyPotentialIssues(campaign),
      recommendations: this.generateRecommendations(campaign),
      resourceRequirements: {
        emailsToSend: campaign.selectedVendors.length * (1 + (campaign.settings.reminderSchedule?.intervals.length || 0)),
        portalSessionsNeeded: campaign.selectedVendors.length,
        expectedSubmissions: Math.floor(campaign.selectedVendors.length * 0.8) // 80% expected response rate
      }
    };
  }

  async getCampaignVendorStatuses(campaignId: string): Promise<CampaignVendorStatus[]> {
    const campaign = await this.getCampaign(campaignId);
    
    return campaign.selectedVendors.map((vendorId, index) => {
      const vendor = vendorsData.find(v => v.id === vendorId);
      const statuses: CampaignVendorStatus['status'][] = ['pending', 'invited', 'accessed', 'in_progress', 'completed', 'overdue'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        vendorId,
        vendorName: vendor?.baseVendorId || `Vendor ${vendorId}`,
        email: `${vendor?.baseVendorId || vendorId}@vendor.com`,
        status: randomStatus,
        invitationSent: campaign.status !== 'draft' ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
        portalAccessed: randomStatus !== 'pending' ? new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000) : undefined,
        lastActivity: randomStatus === 'in_progress' || randomStatus === 'completed' ? new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000) : undefined,
        submissionCompleted: randomStatus === 'completed' ? new Date(Date.now() - Math.random() * 1 * 24 * 60 * 60 * 1000) : undefined,
        itemsSubmitted: randomStatus === 'completed' ? campaign.selectedCategories.length * 5 : Math.floor(Math.random() * campaign.selectedCategories.length * 3),
        totalItemsExpected: campaign.selectedCategories.length * 5,
        completionRate: randomStatus === 'completed' ? 100 : Math.floor(Math.random() * 80),
        portalToken: campaign.status !== 'draft' ? `token-${vendorId}-${campaignId}` : undefined,
        portalUrl: campaign.status !== 'draft' ? `/price-management/vendor-portal/token-${vendorId}-${campaignId}` : undefined,
        remindersSent: Math.floor(Math.random() * 3),
        lastReminderSent: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000) : undefined
      };
    });
  }

  async getCampaignTemplates(): Promise<CampaignTemplate[]> {
    return this.templates.filter(t => t.isPublic);
  }

  async getCampaignTemplate(templateId: string): Promise<CampaignTemplate> {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template with id ${templateId} not found`);
    }
    return template;
  }

  private generateTimelineMetrics(campaign: PriceCollectionCampaign) {
    const metrics = [];
    const startDate = new Date(campaign.scheduledStart);
    const endDate = campaign.scheduledEnd ? new Date(campaign.scheduledEnd) : new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      metrics.push({
        date: new Date(d),
        invitationsSent: Math.floor(Math.random() * 5),
        portalAccesses: Math.floor(Math.random() * 8),
        submissionsReceived: Math.floor(Math.random() * 3),
        completions: Math.floor(Math.random() * 2)
      });
    }
    
    return metrics;
  }

  private generateIssuesAndAlerts(campaign: PriceCollectionCampaign) {
    const issues = [];
    
    if (campaign.progress.responseRate < 50) {
      issues.push({
        type: 'non_responsive' as const,
        description: 'Low response rate detected',
        severity: 'medium' as const,
        createdAt: new Date()
      });
    }

    if (campaign.progress.completionRate < 30) {
      issues.push({
        type: 'overdue' as const,
        description: 'Multiple vendors are overdue',
        severity: 'high' as const,
        createdAt: new Date()
      });
    }

    return issues;
  }

  private calculateWorkload(vendorCount: number, categoryCount: number): string {
    const totalItems = vendorCount * categoryCount;
    if (totalItems < 50) return 'Light';
    if (totalItems < 200) return 'Moderate';
    if (totalItems < 500) return 'Heavy';
    return 'Very Heavy';
  }

  private identifyPotentialIssues(campaign: CreateCampaignRequest): string[] {
    const issues = [];
    
    if (campaign.selectedVendors.length > 20) {
      issues.push('Large vendor count may require additional coordination');
    }
    
    if (campaign.settings.portalAccessDuration < 7) {
      issues.push('Short access duration may result in lower response rates');
    }
    
    if (campaign.settings.priority === 'urgent' && !campaign.settings.autoReminders) {
      issues.push('Urgent campaigns should have auto-reminders enabled');
    }
    
    return issues;
  }

  private generateRecommendations(campaign: CreateCampaignRequest): string[] {
    const recommendations = [];
    
    if (campaign.selectedVendors.length > 30) {
      recommendations.push('Consider splitting into multiple smaller campaigns');
    }
    
    if (!campaign.settings.autoReminders) {
      recommendations.push('Enable auto-reminders to improve response rates');
    }
    
    if (campaign.settings.portalAccessDuration > 21) {
      recommendations.push('Consider shorter access duration to create urgency');
    }
    
    return recommendations;
  }
}

export const campaignManagementService = new CampaignManagementServiceImpl();