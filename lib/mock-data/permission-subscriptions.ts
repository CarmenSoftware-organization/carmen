// Mock Subscription Packages for Carmen ERP Permission Management
// Tiered subscription system with realistic pricing and feature sets

import { 
  SubscriptionPackage, 
  UserSubscription, 
  PackageType, 
  BillingCycle, 
  SubscriptionStatus, 
  ModuleType,
  ResourceActivation,
  SubscriptionUsage,
  PaymentRecord,
  PackageComparison,
  UpgradeRequest 
} from '@/lib/types/permission-subscriptions';
import { ResourceType } from '@/lib/types/permission-resources';
import { Money } from '@/lib/types/common';

// ============================================================================
// Base Resource Definitions
// ============================================================================

const basicResources = [
  ResourceType.USER, ResourceType.ROLE, ResourceType.DEPARTMENT, ResourceType.LOCATION,
  ResourceType.PRODUCT, ResourceType.PRODUCT_CATEGORY,
  ResourceType.INVENTORY_ITEM, ResourceType.STOCK_COUNT,
  ResourceType.PURCHASE_REQUEST, ResourceType.VENDOR,
  ResourceType.RECIPE, ResourceType.MENU_ITEM,
  ResourceType.REPORT, ResourceType.NOTIFICATION
];

const professionalResources = [
  ...basicResources,
  ResourceType.PURCHASE_ORDER, ResourceType.GOODS_RECEIPT_NOTE, ResourceType.CREDIT_NOTE,
  ResourceType.STOCK_ADJUSTMENT, ResourceType.STOCK_TRANSFER, ResourceType.PHYSICAL_COUNT,
  ResourceType.VENDOR_PRICE_LIST, ResourceType.VENDOR_CONTRACT,
  ResourceType.PRODUCTION_ORDER, ResourceType.STORE_REQUISITION,
  ResourceType.INVOICE, ResourceType.PAYMENT, ResourceType.BUDGET
];

// ============================================================================
// Subscription Package Definitions
// ============================================================================

export const mockSubscriptionPackages: SubscriptionPackage[] = [
  {
    id: 'pkg-basic-001',
    type: PackageType.BASIC,
    name: 'Carmen Basic',
    description: 'Perfect for small restaurants and cafes getting started with digital operations',
    tagline: 'Essential tools for small hospitality businesses',
    
    pricing: [
      {
        billingCycle: BillingCycle.MONTHLY,
        price: { amount: 99, currency: 'USD' },
        discountPercentage: 0
      },
      {
        billingCycle: BillingCycle.YEARLY,
        price: { amount: 990, currency: 'USD' },
        discountPercentage: 17,
        originalPrice: { amount: 1188, currency: 'USD' }
      }
    ],
    trialPeriodDays: 14,
    setupFee: { amount: 50, currency: 'USD' },
    
    features: {
      maxUsers: 10,
      maxLocations: 2,
      maxDepartments: 5,
      maxConcurrentSessions: 20,
      
      availableModules: ['dashboard', 'user_management', 'basic_reporting'],
      availableResources: basicResources,
      
      storageLimit: 5, // GB
      apiCallsPerMonth: 10000,
      reportRetentionDays: 30,
      auditLogRetentionDays: 90,
      
      apiAccess: false,
      webhookSupport: false,
      customWorkflows: false,
      advancedReporting: false,
      realTimeAnalytics: false,
      multiCurrency: false,
      multiLanguage: false,
      whiteLabel: false,
      
      posIntegration: false,
      accountingIntegration: false,
      thirdPartyIntegrations: 1,
      customIntegrations: false,
      
      ssoIntegration: false,
      mfaRequired: false,
      ipRestrictions: false,
      auditLog: true,
      dataEncryption: true,
      backupFrequency: 'weekly',
      
      supportLevel: 'basic',
      responseTime: '24-48 hours',
      phoneSupport: false,
      dedicatedManager: false,
      training: false,
      
      complianceReporting: false,
      dataResidency: false,
      gdprCompliance: true,
      hipaaCompliance: false,
      customCompliance: false
    },
    
    modules: [ModuleType.DASHBOARD, ModuleType.USER_MANAGEMENT, ModuleType.BASIC_REPORTING],
    
    resourceActivations: [
      { resourceType: ResourceType.PURCHASE_REQUEST, isActive: true, activatedAt: new Date(), usageLimit: { type: 'monthly', limit: 100, currentUsage: 0, resetDate: new Date() } },
      { resourceType: ResourceType.INVENTORY_ITEM, isActive: true, activatedAt: new Date(), usageLimit: { type: 'monthly', limit: 500, currentUsage: 0, resetDate: new Date() } },
      { resourceType: ResourceType.RECIPE, isActive: true, activatedAt: new Date(), usageLimit: { type: 'monthly', limit: 50, currentUsage: 0, resetDate: new Date() } }
    ],
    
    isPopular: false,
    isCustom: false,
    isActive: true,
    availableFrom: new Date('2024-01-01'),
    
    highlights: [
      'Up to 10 users and 2 locations',
      'Essential modules included',
      'Basic reporting and analytics',
      'Email support',
      '5GB storage',
      'Weekly backups',
      'Mobile-friendly interface'
    ],
    targetAudience: 'Small restaurants, cafes, food trucks, independent operators',
    useCases: [
      'Basic inventory tracking',
      'Simple purchase requests',
      'Menu and recipe management',
      'User role management',
      'Basic financial reporting'
    ]
  },

  {
    id: 'pkg-professional-001',
    type: PackageType.PROFESSIONAL,
    name: 'Carmen Professional',
    description: 'Comprehensive solution for growing restaurant groups and mid-size hospitality operations',
    tagline: 'Scale your operations with advanced features',
    
    pricing: [
      {
        billingCycle: BillingCycle.MONTHLY,
        price: { amount: 299, currency: 'USD' },
        discountPercentage: 0
      },
      {
        billingCycle: BillingCycle.QUARTERLY,
        price: { amount: 849, currency: 'USD' },
        discountPercentage: 5,
        originalPrice: { amount: 897, currency: 'USD' }
      },
      {
        billingCycle: BillingCycle.YEARLY,
        price: { amount: 3228, currency: 'USD' },
        discountPercentage: 10,
        originalPrice: { amount: 3588, currency: 'USD' }
      }
    ],
    trialPeriodDays: 30,
    
    features: {
      maxUsers: 50,
      maxLocations: 5,
      maxDepartments: 20,
      maxConcurrentSessions: 100,
      
      availableModules: [
        'dashboard', 'user_management', 'basic_reporting',
        'procurement', 'inventory_management', 'vendor_management', 'product_management',
        'recipe_management', 'store_operations'
      ],
      availableResources: professionalResources,
      
      storageLimit: 25,
      apiCallsPerMonth: 50000,
      reportRetentionDays: 90,
      auditLogRetentionDays: 180,
      
      apiAccess: true,
      webhookSupport: true,
      customWorkflows: true,
      advancedReporting: true,
      realTimeAnalytics: true,
      multiCurrency: true,
      multiLanguage: false,
      whiteLabel: false,
      
      posIntegration: true,
      accountingIntegration: true,
      thirdPartyIntegrations: 5,
      customIntegrations: true,
      
      ssoIntegration: true,
      mfaRequired: false,
      ipRestrictions: true,
      auditLog: true,
      dataEncryption: true,
      backupFrequency: 'daily',
      
      supportLevel: 'standard',
      responseTime: '4-8 hours',
      phoneSupport: true,
      dedicatedManager: false,
      training: true,
      
      complianceReporting: true,
      dataResidency: false,
      gdprCompliance: true,
      hipaaCompliance: false,
      customCompliance: false
    },
    
    modules: [
      ModuleType.DASHBOARD, ModuleType.USER_MANAGEMENT, ModuleType.BASIC_REPORTING,
      ModuleType.PROCUREMENT, ModuleType.INVENTORY_MANAGEMENT, ModuleType.VENDOR_MANAGEMENT,
      ModuleType.PRODUCT_MANAGEMENT, ModuleType.RECIPE_MANAGEMENT, ModuleType.STORE_OPERATIONS
    ],
    
    resourceActivations: [
      { resourceType: ResourceType.PURCHASE_REQUEST, isActive: true, activatedAt: new Date() },
      { resourceType: ResourceType.PURCHASE_ORDER, isActive: true, activatedAt: new Date() },
      { resourceType: ResourceType.INVENTORY_ITEM, isActive: true, activatedAt: new Date() },
      { resourceType: ResourceType.VENDOR, isActive: true, activatedAt: new Date() },
      { resourceType: ResourceType.RECIPE, isActive: true, activatedAt: new Date() }
    ],
    
    isPopular: true,
    isCustom: false,
    isActive: true,
    
    highlights: [
      'Up to 50 users and 5 locations',
      'All standard modules included',
      'Advanced reporting and real-time analytics',
      'API access and webhooks',
      'Custom workflows',
      'Multi-currency support',
      'Phone and email support',
      'POS and accounting integrations',
      '25GB storage',
      'Daily backups'
    ],
    targetAudience: 'Restaurant groups, hotel chains, catering companies',
    useCases: [
      'Multi-location operations',
      'Advanced procurement workflows',
      'Comprehensive inventory management',
      'Vendor relationship management',
      'Recipe costing and menu engineering',
      'Financial reporting and analysis'
    ]
  },

  {
    id: 'pkg-enterprise-001',
    type: PackageType.ENTERPRISE,
    name: 'Carmen Enterprise',
    description: 'Complete enterprise solution for large hospitality organizations with unlimited scalability',
    tagline: 'Enterprise-grade hospitality management',
    
    pricing: [
      {
        billingCycle: BillingCycle.MONTHLY,
        price: { amount: 799, currency: 'USD' },
        discountPercentage: 0
      },
      {
        billingCycle: BillingCycle.YEARLY,
        price: { amount: 8388, currency: 'USD' },
        discountPercentage: 12,
        originalPrice: { amount: 9588, currency: 'USD' }
      }
    ],
    trialPeriodDays: 30,
    
    features: {
      maxUsers: -1, // Unlimited
      maxLocations: -1, // Unlimited
      maxDepartments: -1, // Unlimited
      maxConcurrentSessions: -1, // Unlimited
      
      availableModules: [
        'dashboard', 'user_management', 'basic_reporting',
        'procurement', 'inventory_management', 'vendor_management', 'product_management',
        'recipe_management', 'production_planning', 'financial_management', 'store_operations',
        'advanced_analytics', 'business_intelligence', 'workflow_automation', 'quality_management',
        'multi_property', 'franchise_management', 'custom_development', 'system_integration'
      ],
      availableResources: Object.values(ResourceType), // All resources
      
      storageLimit: 100,
      apiCallsPerMonth: -1, // Unlimited
      reportRetentionDays: 365,
      auditLogRetentionDays: 2555, // 7 years
      
      apiAccess: true,
      webhookSupport: true,
      customWorkflows: true,
      advancedReporting: true,
      realTimeAnalytics: true,
      multiCurrency: true,
      multiLanguage: true,
      whiteLabel: true,
      
      posIntegration: true,
      accountingIntegration: true,
      thirdPartyIntegrations: -1, // Unlimited
      customIntegrations: true,
      
      ssoIntegration: true,
      mfaRequired: true,
      ipRestrictions: true,
      auditLog: true,
      dataEncryption: true,
      backupFrequency: 'daily',
      
      supportLevel: 'premium',
      responseTime: '1-2 hours',
      phoneSupport: true,
      dedicatedManager: true,
      training: true,
      
      complianceReporting: true,
      dataResidency: true,
      gdprCompliance: true,
      hipaaCompliance: true,
      customCompliance: true
    },
    
    modules: Object.values(ModuleType), // All modules
    
    resourceActivations: Object.values(ResourceType).map(resourceType => ({
      resourceType,
      isActive: true,
      activatedAt: new Date()
    })),
    
    isPopular: false,
    isCustom: false,
    isActive: true,
    
    highlights: [
      'Unlimited users, locations, and departments',
      'All modules and features included',
      'White-label customization',
      'Dedicated customer success manager',
      'Priority support (1-2 hour response)',
      '24/7 phone support',
      'Custom integrations and development',
      'Advanced compliance and security',
      '100GB storage',
      'Multi-language support',
      'Franchise management tools'
    ],
    targetAudience: 'Large hotel chains, enterprise restaurant groups, hospitality conglomerates',
    useCases: [
      'Multi-brand operations',
      'Franchise management',
      'Enterprise procurement',
      'Advanced analytics and BI',
      'Custom workflow automation',
      'Compliance and audit management',
      'Integration with enterprise systems'
    ]
  },

  {
    id: 'pkg-custom-001',
    type: PackageType.CUSTOM,
    name: 'Carmen Custom',
    description: 'Tailored solution designed specifically for unique hospitality requirements',
    tagline: 'Built specifically for your business needs',
    
    pricing: [
      {
        billingCycle: BillingCycle.MONTHLY,
        price: { amount: 0, currency: 'USD' }, // Custom pricing
        promotionCode: 'CUSTOM_QUOTE'
      }
    ],
    trialPeriodDays: 30,
    
    features: {
      maxUsers: 0, // Custom
      maxLocations: 0, // Custom
      maxDepartments: 0, // Custom
      maxConcurrentSessions: 0, // Custom
      
      availableModules: [], // Custom selection
      availableResources: [], // Custom selection
      
      storageLimit: 0, // Custom
      apiCallsPerMonth: 0, // Custom
      reportRetentionDays: 0, // Custom
      auditLogRetentionDays: 0, // Custom
      
      apiAccess: true,
      webhookSupport: true,
      customWorkflows: true,
      advancedReporting: true,
      realTimeAnalytics: true,
      multiCurrency: true,
      multiLanguage: true,
      whiteLabel: true,
      
      posIntegration: true,
      accountingIntegration: true,
      thirdPartyIntegrations: -1,
      customIntegrations: true,
      
      ssoIntegration: true,
      mfaRequired: true,
      ipRestrictions: true,
      auditLog: true,
      dataEncryption: true,
      backupFrequency: 'daily',
      
      supportLevel: 'dedicated',
      responseTime: '< 1 hour',
      phoneSupport: true,
      dedicatedManager: true,
      training: true,
      
      complianceReporting: true,
      dataResidency: true,
      gdprCompliance: true,
      hipaaCompliance: true,
      customCompliance: true
    },
    
    modules: [],
    resourceActivations: [],
    
    isPopular: false,
    isCustom: true,
    isActive: true,
    
    highlights: [
      'Fully customized to your requirements',
      'Flexible pricing based on usage',
      'Custom feature development',
      'Dedicated implementation team',
      'Priority support and training',
      'Tailored integrations',
      'Custom compliance requirements',
      'Scalable architecture'
    ],
    targetAudience: 'Unique hospitality businesses, government contracts, specialized operations',
    useCases: [
      'Unique workflow requirements',
      'Specialized compliance needs',
      'Custom integration requirements',
      'Government or institutional contracts',
      'Highly regulated environments'
    ]
  }
];

// ============================================================================
// User Subscription Examples
// ============================================================================

export const mockUserSubscriptions: UserSubscription[] = [
  {
    id: 'sub-001',
    userId: 'user-001',
    organizationId: 'org-001',
    
    packageId: 'pkg-professional-001',
    packageType: PackageType.PROFESSIONAL,
    packageName: 'Carmen Professional',
    
    billingCycle: BillingCycle.YEARLY,
    currentPrice: { amount: 3228, currency: 'USD' },
    nextBillingDate: new Date('2024-12-01'),
    lastPaymentDate: new Date('2024-01-01'),
    
    status: SubscriptionStatus.ACTIVE,
    activatedAt: new Date('2024-01-01'),
    
    currentUsage: {
      period: {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      },
      activeUsers: 25,
      storageUsedGB: 12.5,
      apiCallsMade: 15000,
      reportsGenerated: 45,
      resourceUsage: {
        [ResourceType.PURCHASE_REQUEST]: 120,
        [ResourceType.INVENTORY_ITEM]: 850,
        [ResourceType.RECIPE]: 75
      },
      featuresUsed: ['dashboard', 'procurement', 'inventory', 'reporting'],
      integrationsActive: 3,
      workflowsExecuted: 200,
      peakConcurrentUsers: 18,
      peakStorageGB: 13.2,
      peakApiCallsPerDay: 800
    },
    
    usageHistory: [],
    paymentHistory: [
      {
        id: 'pay-001',
        date: new Date('2024-01-01'),
        amount: { amount: 3228, currency: 'USD' },
        status: 'paid',
        paymentMethod: 'credit_card',
        invoiceId: 'inv-001',
        description: 'Annual subscription payment'
      }
    ],
    
    autoRenewal: true,
    renewalNotifications: true,
    
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    notes: 'Multi-location restaurant group subscription'
  }
];

// ============================================================================
// Package Comparison Examples
// ============================================================================

export function createPackageComparison(currentPackageId: string, targetPackageId: string): PackageComparison {
  const currentPackage = mockSubscriptionPackages.find(p => p.id === currentPackageId);
  const targetPackage = mockSubscriptionPackages.find(p => p.id === targetPackageId);
  
  if (!currentPackage || !targetPackage) {
    throw new Error('Package not found');
  }
  
  const monthlyPriceCurrent = currentPackage.pricing.find(p => p.billingCycle === BillingCycle.MONTHLY)?.price || { amount: 0, currency: 'USD' };
  const monthlyPriceTarget = targetPackage.pricing.find(p => p.billingCycle === BillingCycle.MONTHLY)?.price || { amount: 0, currency: 'USD' };
  
  return {
    currentPackage,
    targetPackage,
    
    addedFeatures: [
      'Advanced analytics dashboard',
      'Custom workflow builder',
      'Multi-location support',
      'API access and webhooks',
      'Priority customer support'
    ],
    removedFeatures: [],
    upgradedLimits: {
      'Users': { current: currentPackage.features.maxUsers, new: targetPackage.features.maxUsers },
      'Locations': { current: currentPackage.features.maxLocations, new: targetPackage.features.maxLocations },
      'Storage': { current: currentPackage.features.storageLimit, new: targetPackage.features.storageLimit }
    },
    
    addedModules: [ModuleType.ADVANCED_ANALYTICS, ModuleType.WORKFLOW_AUTOMATION],
    removedModules: [],
    
    costDifference: { 
      amount: monthlyPriceTarget.amount - monthlyPriceCurrent.amount, 
      currency: 'USD' 
    },
    prorationAmount: { amount: 150, currency: 'USD' },
    effectiveDate: new Date(),
    
    migrationRequired: true,
    estimatedMigrationTime: '2-4 hours',
    dataBackupRequired: true,
    downgradeWarnings: []
  };
}

// ============================================================================
// Upgrade Request Examples
// ============================================================================

export const mockUpgradeRequests: UpgradeRequest[] = [
  {
    id: 'upg-001',
    userId: 'user-002',
    currentPackageId: 'pkg-basic-001',
    targetPackageId: 'pkg-professional-001',
    requestedDate: new Date('2024-01-15'),
    effectiveDate: new Date('2024-02-01'),
    
    reason: 'Business expansion to multiple locations',
    businessNeed: 'Need multi-location support and advanced inventory management',
    expectedBenefits: [
      'Support for 3 additional locations',
      'Advanced procurement workflows',
      'Real-time inventory tracking',
      'API integrations with POS systems'
    ],
    
    status: 'approved',
    approvedBy: 'user-001',
    approvedAt: new Date('2024-01-16'),
    
    implementationPlan: [
      'Backup current data and configuration',
      'Enable new modules and features',
      'Configure additional locations',
      'Test API integrations',
      'Train users on new features'
    ],
    migrationScheduled: new Date('2024-01-31'),
    backupCompleted: false,
    rollbackPlan: 'Full system restore from backup if issues occur'
  }
];

// ============================================================================
// Utility Functions
// ============================================================================

export function getPackageByType(packageType: PackageType): SubscriptionPackage | undefined {
  return mockSubscriptionPackages.find(pkg => pkg.type === packageType);
}

export function calculateMonthlyPrice(pkg: SubscriptionPackage): Money {
  const monthlyPricing = pkg.pricing.find(p => p.billingCycle === BillingCycle.MONTHLY);
  return monthlyPricing?.price || { amount: 0, currency: 'USD' };
}

export function calculateYearlyPrice(pkg: SubscriptionPackage): Money {
  const yearlyPricing = pkg.pricing.find(p => p.billingCycle === BillingCycle.YEARLY);
  return yearlyPricing?.price || { amount: 0, currency: 'USD' };
}

export function getYearlySavings(pkg: SubscriptionPackage): number {
  const monthly = calculateMonthlyPrice(pkg);
  const yearly = calculateYearlyPrice(pkg);
  
  if (yearly.amount === 0) return 0;
  
  const yearlyEquivalent = monthly.amount * 12;
  return Math.round(((yearlyEquivalent - yearly.amount) / yearlyEquivalent) * 100);
}

export function getActiveSubscriptions(): UserSubscription[] {
  return mockUserSubscriptions.filter(sub => sub.status === SubscriptionStatus.ACTIVE);
}

export function getUserSubscription(userId: string): UserSubscription | undefined {
  return mockUserSubscriptions.find(sub => sub.userId === userId);
}

export function isFeatureAvailable(subscription: UserSubscription, feature: keyof SubscriptionPackage['features']): boolean {
  const pkg = mockSubscriptionPackages.find(p => p.id === subscription.packageId);
  return pkg ? Boolean(pkg.features[feature]) : false;
}

export function isResourceActivated(subscription: UserSubscription, resourceType: ResourceType): boolean {
  return subscription.resourceOverrides?.some(
    activation => activation.resourceType === resourceType && activation.isActive
  ) ?? false;
}