/**
 * Mock Campaign Data
 * Centralized campaign mock data for the Carmen ERP application
 */

import { PriceCollectionCampaign, CampaignTemplate } from '@/lib/types'

export const mockCampaigns: PriceCollectionCampaign[] = [
  {
    id: 'campaign-001',
    name: 'Q1 2024 Kitchen Equipment Pricing',
    description: 'Quarterly price collection for all kitchen equipment categories including prep equipment, cooking appliances, and storage solutions.',
    status: 'active',
    campaignType: 'recurring',
    selectedVendors: ['vendor-001', 'vendor-002', 'vendor-003'],
    selectedCategories: ['Kitchen Equipment', 'Appliances', 'Storage'],
    scheduledStart: new Date('2024-01-15'),
    scheduledEnd: new Date('2024-04-15'),
    recurringPattern: {
      frequency: 'quarterly',
      interval: 1,
      endDate: new Date('2024-12-31')
    },
    progress: {
      totalVendors: 3,
      invitedVendors: 3,
      respondedVendors: 2,
      completedSubmissions: 1,
      pendingSubmissions: 1,
      failedSubmissions: 0,
      completionRate: 67,
      responseRate: 80,
      averageResponseTime: 24,
      lastUpdated: new Date('2024-08-22')
    },
    createdBy: 'john.doe@carmen.com',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-08-22'),
    settings: {
      portalAccessDuration: 30,
      allowedSubmissionMethods: ['manual', 'upload'],
      requireApproval: true,
      autoReminders: true,
      reminderSchedule: {
        enabled: true,
        intervals: [7, 3, 1],
        escalationRules: [
          {
            daysOverdue: 2,
            escalateTo: ['manager@carmen.com'],
            messageTemplate: 'urgent-reminder'
          }
        ]
      },
      emailTemplate: 'quarterly-pricing-request',
      customInstructions: 'Please ensure all pricing includes shipping costs and applicable taxes.',
      priority: 'high'
    },
    template: {
      id: 'template-001',
      name: 'Kitchen Equipment Template',
      description: 'Standard template for kitchen equipment pricing campaigns',
      settings: {
        portalAccessDuration: 30,
        requireApproval: true,
        priority: 'medium'
      },
      isPublic: true,
      createdBy: 'admin@carmen.com',
      createdAt: new Date('2024-01-01'),
      usageCount: 5
    }
  },
  {
    id: 'campaign-002', 
    name: 'Fresh Produce Weekly Collection',
    description: 'Weekly price collection for fresh produce items including vegetables, fruits, and herbs for all restaurant locations.',
    status: 'active',
    campaignType: 'recurring',
    selectedVendors: ['vendor-002'],
    selectedCategories: ['Produce', 'Fresh Items'],
    scheduledStart: new Date('2024-08-01'),
    scheduledEnd: new Date('2024-12-31'),
    recurringPattern: {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: [1], // Monday
      endDate: new Date('2024-12-31')
    },
    progress: {
      totalVendors: 1,
      invitedVendors: 1,
      respondedVendors: 1,
      completedSubmissions: 1,
      pendingSubmissions: 0,
      failedSubmissions: 0,
      completionRate: 100,
      responseRate: 100,
      averageResponseTime: 6,
      lastUpdated: new Date('2024-08-22')
    },
    createdBy: 'maria.garcia@carmen.com',
    createdAt: new Date('2024-07-25'),
    updatedAt: new Date('2024-08-22'),
    settings: {
      portalAccessDuration: 7,
      allowedSubmissionMethods: ['manual', 'upload'],
      requireApproval: false,
      autoReminders: true,
      reminderSchedule: {
        enabled: true,
        intervals: [2, 1],
        escalationRules: []
      },
      emailTemplate: 'weekly-produce-request',
      customInstructions: 'Please provide current market prices. Indicate any seasonal variations expected in the coming weeks.',
      priority: 'medium'
    }
  },
  {
    id: 'campaign-003',
    name: 'Annual Beverage Supplier RFP',
    description: 'Annual request for pricing from beverage suppliers covering alcoholic and non-alcoholic beverages for all venues.',
    status: 'draft',
    campaignType: 'one-time',
    selectedVendors: ['vendor-001', 'vendor-003'],
    selectedCategories: ['Beverages', 'Wine & Spirits', 'Soft Drinks'],
    scheduledStart: new Date('2024-09-01'),
    scheduledEnd: new Date('2024-09-30'),
    progress: {
      totalVendors: 2,
      invitedVendors: 0,
      respondedVendors: 0,
      completedSubmissions: 0,
      pendingSubmissions: 0,
      failedSubmissions: 0,
      completionRate: 0,
      responseRate: 0,
      averageResponseTime: 0,
      lastUpdated: new Date('2024-08-22')
    },
    createdBy: 'david.chen@carmen.com',
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-08-22'),
    settings: {
      portalAccessDuration: 21,
      allowedSubmissionMethods: ['manual', 'upload'],
      requireApproval: true,
      autoReminders: true,
      reminderSchedule: {
        enabled: true,
        intervals: [14, 7, 3, 1],
        escalationRules: [
          {
            daysOverdue: 1,
            escalateTo: ['procurement@carmen.com'],
            messageTemplate: 'overdue-rfp-reminder'
          },
          {
            daysOverdue: 3,
            escalateTo: ['manager@carmen.com', 'director@carmen.com'],
            messageTemplate: 'critical-rfp-reminder'
          }
        ]
      },
      emailTemplate: 'annual-beverage-rfp',
      customInstructions: 'This is our annual beverage sourcing. Please provide volume-based pricing tiers and exclusive partnership terms.',
      priority: 'urgent'
    }
  },
  {
    id: 'campaign-004',
    name: 'Holiday Catering Special Items',
    description: 'One-time price collection for special holiday catering items and seasonal products for the upcoming holiday season.',
    status: 'completed',
    campaignType: 'one-time',
    selectedVendors: ['vendor-001', 'vendor-002'],
    selectedCategories: ['Special Items', 'Holiday Products', 'Catering'],
    scheduledStart: new Date('2024-07-01'),
    scheduledEnd: new Date('2024-07-31'),
    progress: {
      totalVendors: 2,
      invitedVendors: 2,
      respondedVendors: 2,
      completedSubmissions: 2,
      pendingSubmissions: 0,
      failedSubmissions: 0,
      completionRate: 100,
      responseRate: 100,
      averageResponseTime: 12,
      lastUpdated: new Date('2024-07-31')
    },
    createdBy: 'sarah.wilson@carmen.com',
    createdAt: new Date('2024-06-20'),
    updatedAt: new Date('2024-07-31'),
    settings: {
      portalAccessDuration: 14,
      allowedSubmissionMethods: ['manual', 'upload'],
      requireApproval: true,
      autoReminders: true,
      reminderSchedule: {
        enabled: true,
        intervals: [7, 3, 1],
        escalationRules: []
      },
      emailTemplate: 'holiday-catering-request',
      customInstructions: 'Focus on premium holiday items. Include presentation options and minimum order quantities.',
      priority: 'high'
    }
  }
]

export const mockCampaignTemplates: CampaignTemplate[] = [
  {
    id: 'template-001',
    name: 'Kitchen Equipment Template',
    description: 'Standard template for kitchen equipment pricing campaigns with extended approval workflow',
    settings: {
      portalAccessDuration: 30,
      requireApproval: true,
      autoReminders: true,
      priority: 'medium'
    },
    defaultVendorFilters: {
      status: ['active'],
      categories: ['Equipment', 'Kitchen Supplies'],
      rating: { min: 3, max: 5 }
    },
    defaultCategories: ['Kitchen Equipment', 'Appliances', 'Tools'],
    isPublic: true,
    createdBy: 'admin@carmen.com',
    createdAt: new Date('2024-01-01'),
    usageCount: 5
  },
  {
    id: 'template-002',
    name: 'Weekly Produce Template',
    description: 'Fast-turnaround template for weekly produce pricing with minimal approval requirements',
    settings: {
      portalAccessDuration: 7,
      requireApproval: false,
      autoReminders: true,
      priority: 'medium'
    },
    defaultVendorFilters: {
      status: ['active'],
      categories: ['Produce', 'Fresh Items'],
      lastActivity: { days: 30 }
    },
    defaultCategories: ['Produce', 'Fresh Items', 'Organic'],
    isPublic: true,
    createdBy: 'admin@carmen.com',
    createdAt: new Date('2024-01-15'),
    usageCount: 12
  },
  {
    id: 'template-003',
    name: 'Annual RFP Template',
    description: 'Comprehensive template for annual supplier requests with detailed approval and escalation workflows',
    settings: {
      portalAccessDuration: 45,
      requireApproval: true,
      autoReminders: true,
      priority: 'high'
    },
    defaultVendorFilters: {
      status: ['active'],
      rating: { min: 4, max: 5 }
    },
    isPublic: false,
    createdBy: 'procurement@carmen.com',
    createdAt: new Date('2024-02-01'),
    usageCount: 3
  }
]