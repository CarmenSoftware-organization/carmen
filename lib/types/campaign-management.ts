// Campaign Management Types

export interface PriceCollectionCampaign {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  campaignType: 'one-time' | 'recurring' | 'event-based';
  selectedVendors: string[];
  selectedCategories: string[];
  scheduledStart: Date;
  scheduledEnd?: Date;
  recurringPattern?: RecurringPattern;
  progress: CampaignProgress;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  settings: CampaignSettings;
  template?: CampaignTemplate;
}

export interface RecurringPattern {
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  interval: number;
  endDate?: Date;
  maxOccurrences?: number;
  daysOfWeek?: number[]; // For weekly patterns
  dayOfMonth?: number; // For monthly patterns
  monthOfYear?: number; // For annual patterns
}

export interface CampaignProgress {
  totalVendors: number;
  invitedVendors: number;
  respondedVendors: number;
  completedSubmissions: number;
  pendingSubmissions: number;
  failedSubmissions: number;
  completionRate: number;
  responseRate: number;
  averageResponseTime: number; // in hours
  lastUpdated: Date;
}

export interface CampaignSettings {
  portalAccessDuration: number; // in days
  allowedSubmissionMethods: ('manual' | 'upload')[];
  requireApproval: boolean;
  autoReminders: boolean;
  reminderSchedule?: ReminderSchedule;
  emailTemplate: string;
  customInstructions?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ReminderSchedule {
  enabled: boolean;
  intervals: number[]; // Days before deadline
  escalationRules: Array<{
    daysOverdue: number;
    escalateTo: string[];
    messageTemplate: string;
  }>;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  settings: Partial<CampaignSettings>;
  defaultVendorFilters?: VendorFilters;
  defaultCategories?: string[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  usageCount: number;
}

export interface VendorFilters {
  status?: ('active' | 'inactive')[];
  categories?: string[];
  rating?: {
    min: number;
    max: number;
  };
  location?: string[];
  tags?: string[];
  lastActivity?: {
    days: number;
  };
}

export interface CreateCampaignRequest {
  name: string;
  description: string;
  campaignType: 'one-time' | 'recurring' | 'event-based';
  selectedVendors: string[];
  selectedCategories: string[];
  scheduledStart: Date;
  scheduledEnd?: Date;
  recurringPattern?: RecurringPattern;
  settings: CampaignSettings;
  templateId?: string;
}

export interface UpdateCampaignRequest {
  name?: string;
  description?: string;
  selectedVendors?: string[];
  selectedCategories?: string[];
  scheduledStart?: Date;
  scheduledEnd?: Date;
  recurringPattern?: RecurringPattern;
  settings?: Partial<CampaignSettings>;
}

export interface CampaignVendorStatus {
  vendorId: string;
  vendorName: string;
  email: string;
  status: 'pending' | 'invited' | 'accessed' | 'in_progress' | 'completed' | 'overdue' | 'failed';
  invitationSent?: Date;
  portalAccessed?: Date;
  lastActivity?: Date;
  submissionCompleted?: Date;
  itemsSubmitted: number;
  totalItemsExpected: number;
  completionRate: number;
  portalToken?: string;
  portalUrl?: string;
  remindersSent: number;
  lastReminderSent?: Date;
}

export interface CampaignAnalytics {
  campaignId: string;
  overview: {
    totalVendors: number;
    responseRate: number;
    completionRate: number;
    averageResponseTime: number;
    totalSubmissions: number;
    qualityScore: number;
  };
  vendorPerformance: Array<{
    vendorId: string;
    vendorName: string;
    responseTime: number;
    completionRate: number;
    qualityScore: number;
    submissionCount: number;
  }>;
  timelineMetrics: Array<{
    date: Date;
    invitationsSent: number;
    portalAccesses: number;
    submissionsReceived: number;
    completions: number;
  }>;
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    vendorCount: number;
    submissionCount: number;
    completionRate: number;
  }>;
  issuesAndAlerts: Array<{
    type: 'overdue' | 'non_responsive' | 'quality_issue' | 'technical_error';
    description: string;
    vendorId?: string;
    severity: 'low' | 'medium' | 'high';
    createdAt: Date;
  }>;
}

export interface CampaignDuplicationRequest {
  sourceCampaignId: string;
  newName: string;
  newDescription?: string;
  preserveVendors: boolean;
  preserveCategories: boolean;
  preserveSettings: boolean;
  newScheduledStart?: Date;
}

export interface CampaignValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
  warnings: Array<{
    field: string;
    message: string;
    suggestion?: string;
  }>;
}

export interface CampaignPreview {
  estimatedVendorCount: number;
  estimatedCategoryCount: number;
  estimatedDuration: number; // in days
  estimatedWorkload: string;
  potentialIssues: string[];
  recommendations: string[];
  resourceRequirements: {
    emailsToSend: number;
    portalSessionsNeeded: number;
    expectedSubmissions: number;
  };
}

// Campaign Management Service Interface
export interface CampaignManagementService {
  createCampaign(request: CreateCampaignRequest): Promise<string>;
  updateCampaign(campaignId: string, updates: UpdateCampaignRequest): Promise<void>;
  deleteCampaign(campaignId: string, options: { retainData: boolean }): Promise<void>;
  duplicateCampaign(request: CampaignDuplicationRequest): Promise<string>;
  startCampaign(campaignId: string): Promise<void>;
  pauseCampaign(campaignId: string): Promise<void>;
  resumeCampaign(campaignId: string): Promise<void>;
  stopCampaign(campaignId: string): Promise<void>;
  getCampaign(campaignId: string): Promise<PriceCollectionCampaign>;
  getCampaigns(filters?: CampaignFilters): Promise<PriceCollectionCampaign[]>;
  getCampaignProgress(campaignId: string): Promise<CampaignProgress>;
  getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics>;
  validateCampaign(campaign: CreateCampaignRequest): Promise<CampaignValidationResult>;
  previewCampaign(campaign: CreateCampaignRequest): Promise<CampaignPreview>;
  getCampaignVendorStatuses(campaignId: string): Promise<CampaignVendorStatus[]>;
}

export interface CampaignFilters {
  status?: PriceCollectionCampaign['status'][];
  campaignType?: PriceCollectionCampaign['campaignType'][];
  createdBy?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
}