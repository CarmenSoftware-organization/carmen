// Subscription Package System for Permission Management
// Tiered access control based on subscription levels

import { ResourceType, ResourceCategory } from './permission-resources';
import { Money } from './common';

// ============================================================================
// Core Subscription Enums
// ============================================================================

export enum PackageType {
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  CUSTOM = 'custom'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
  EXPIRED = 'expired',
  PENDING = 'pending'
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  ONE_TIME = 'one_time'
}

// ============================================================================
// Feature Definitions
// ============================================================================

export interface PackageFeatures {
  // User & Location Limits
  maxUsers: number;
  maxLocations: number;
  maxDepartments: number;
  maxConcurrentSessions: number;
  
  // Module Access
  availableModules: string[];
  availableResources: ResourceType[];
  restrictedResources?: ResourceType[];
  
  // Storage & Performance
  storageLimit: number; // GB
  apiCallsPerMonth: number;
  reportRetentionDays: number;
  auditLogRetentionDays: number;
  
  // Advanced Features
  apiAccess: boolean;
  webhookSupport: boolean;
  customWorkflows: boolean;
  advancedReporting: boolean;
  realTimeAnalytics: boolean;
  multiCurrency: boolean;
  multiLanguage: boolean;
  whiteLabel: boolean;
  
  // Integration Features
  posIntegration: boolean;
  accountingIntegration: boolean;
  thirdPartyIntegrations: number; // Max number
  customIntegrations: boolean;
  
  // Security Features
  ssoIntegration: boolean;
  mfaRequired: boolean;
  ipRestrictions: boolean;
  auditLog: boolean;
  dataEncryption: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly' | 'none';
  
  // Support Features
  supportLevel: 'basic' | 'standard' | 'premium' | 'dedicated';
  responseTime: string; // e.g., '24-48 hours', '4-8 hours', '1-2 hours'
  phoneSupport: boolean;
  dedicatedManager: boolean;
  training: boolean;
  
  // Compliance & Governance
  complianceReporting: boolean;
  dataResidency: boolean;
  gdprCompliance: boolean;
  hipaaCompliance: boolean;
  customCompliance: boolean;
}

// ============================================================================
// Module Definitions
// ============================================================================

export enum ModuleType {
  // Core Modules (typically included in all packages)
  DASHBOARD = 'dashboard',
  USER_MANAGEMENT = 'user_management',
  BASIC_REPORTING = 'basic_reporting',
  
  // Standard Modules
  PROCUREMENT = 'procurement',
  INVENTORY_MANAGEMENT = 'inventory_management',
  VENDOR_MANAGEMENT = 'vendor_management',
  PRODUCT_MANAGEMENT = 'product_management',
  
  // Advanced Modules
  RECIPE_MANAGEMENT = 'recipe_management',
  PRODUCTION_PLANNING = 'production_planning',
  FINANCIAL_MANAGEMENT = 'financial_management',
  STORE_OPERATIONS = 'store_operations',
  
  // Premium Modules
  ADVANCED_ANALYTICS = 'advanced_analytics',
  BUSINESS_INTELLIGENCE = 'business_intelligence',
  WORKFLOW_AUTOMATION = 'workflow_automation',
  QUALITY_MANAGEMENT = 'quality_management',
  
  // Enterprise Modules
  MULTI_PROPERTY = 'multi_property',
  FRANCHISE_MANAGEMENT = 'franchise_management',
  CUSTOM_DEVELOPMENT = 'custom_development',
  SYSTEM_INTEGRATION = 'system_integration'
}

export interface ModuleMetadata {
  name: string;
  description: string;
  category: ResourceCategory;
  icon: string;
  requiredPackageLevel: PackageType;
  dependencies?: ModuleType[];
  resources: ResourceType[];
  isCore: boolean;
  isAddon: boolean;
  addonPrice?: Money;
}

// ============================================================================
// Resource Activation System
// ============================================================================

export interface ResourceActivation {
  resourceType: ResourceType;
  isActive: boolean;
  activatedAt?: Date;
  activatedBy?: string;
  restrictions?: ResourceRestrictions;
  usageLimit?: UsageLimit;
}

export interface ResourceRestrictions {
  // Quantity Restrictions
  maxRecords?: number;
  maxTransactionsPerMonth?: number;
  maxReportsPerMonth?: number;
  
  // Feature Restrictions
  readOnly?: boolean;
  noExport?: boolean;
  noImport?: boolean;
  basicFeaturesOnly?: boolean;
  
  // Workflow Restrictions
  maxApprovalLevels?: number;
  noCustomWorkflows?: boolean;
  standardTemplatesOnly?: boolean;
  
  // Integration Restrictions
  noApiAccess?: boolean;
  noWebhooks?: boolean;
  noThirdPartySync?: boolean;
}

export interface UsageLimit {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  limit: number;
  currentUsage: number;
  resetDate: Date;
  warningThreshold?: number; // Percentage at which to warn
}

// ============================================================================
// Subscription Package Interfaces
// ============================================================================

export interface SubscriptionPackage {
  id: string;
  type: PackageType;
  name: string;
  description: string;
  tagline?: string;
  
  // Pricing
  pricing: PackagePricing[];
  trialPeriodDays: number;
  setupFee?: Money;
  
  // Features
  features: PackageFeatures;
  modules: ModuleType[];
  resourceActivations: ResourceActivation[];
  
  // Metadata
  isPopular?: boolean;
  isCustom?: boolean;
  isActive: boolean;
  availableFrom?: Date;
  availableUntil?: Date;
  
  // Marketing
  highlights: string[];
  targetAudience: string;
  useCases: string[];
}

export interface PackagePricing {
  billingCycle: BillingCycle;
  price: Money;
  discountPercentage?: number;
  originalPrice?: Money;
  
  // Promotions
  promotionCode?: string;
  promotionValidUntil?: Date;
  firstPeriodDiscount?: number;
}

// ============================================================================
// User Subscription Interface
// ============================================================================

export interface UserSubscription {
  id: string;
  userId: string;
  organizationId?: string;
  
  // Package Information
  packageId: string;
  packageType: PackageType;
  packageName: string;
  
  // Billing Information
  billingCycle: BillingCycle;
  currentPrice: Money;
  nextBillingDate: Date;
  lastPaymentDate?: Date;
  
  // Status
  status: SubscriptionStatus;
  activatedAt: Date;
  expiresAt?: Date;
  suspendedAt?: Date;
  suspensionReason?: string;
  
  // Usage Tracking
  currentUsage: SubscriptionUsage;
  usageHistory: SubscriptionUsage[];
  
  // Customizations
  customFeatures?: Partial<PackageFeatures>;
  additionalModules?: ModuleType[];
  resourceOverrides?: ResourceActivation[];
  
  // Billing History
  paymentHistory: PaymentRecord[];
  
  // Auto-renewal
  autoRenewal: boolean;
  renewalNotifications: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface SubscriptionUsage {
  period: {
    start: Date;
    end: Date;
  };
  
  // Basic Metrics
  activeUsers: number;
  storageUsedGB: number;
  apiCallsMade: number;
  reportsGenerated: number;
  
  // Resource Usage
  resourceUsage: Record<ResourceType, number>;
  
  // Feature Usage
  featuresUsed: string[];
  integrationsActive: number;
  workflowsExecuted: number;
  
  // Peak Usage
  peakConcurrentUsers: number;
  peakStorageGB: number;
  peakApiCallsPerDay: number;
}

export interface PaymentRecord {
  id: string;
  date: Date;
  amount: Money;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  invoiceId?: string;
  description: string;
}

// ============================================================================
// Package Comparison & Upgrade System
// ============================================================================

export interface PackageComparison {
  currentPackage: SubscriptionPackage;
  targetPackage: SubscriptionPackage;
  
  // Feature Differences
  addedFeatures: string[];
  removedFeatures: string[];
  upgradedLimits: Record<string, { current: number; new: number }>;
  
  // Module Differences
  addedModules: ModuleType[];
  removedModules: ModuleType[];
  
  // Cost Implications
  costDifference: Money;
  prorationAmount?: Money;
  effectiveDate: Date;
  
  // Migration Requirements
  migrationRequired: boolean;
  estimatedMigrationTime?: string;
  dataBackupRequired: boolean;
  downgradeWarnings?: string[];
}

export interface UpgradeRequest {
  id: string;
  userId: string;
  currentPackageId: string;
  targetPackageId: string;
  requestedDate: Date;
  effectiveDate: Date;
  
  // Justification
  reason: string;
  businessNeed: string;
  expectedBenefits: string[];
  
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  
  // Implementation
  implementationPlan?: string[];
  migrationScheduled?: Date;
  backupCompleted?: boolean;
  rollbackPlan?: string;
}

// ============================================================================
// Subscription Analytics
// ============================================================================

export interface SubscriptionAnalytics {
  // Usage Analytics
  featureUtilization: Record<string, number>; // percentage
  moduleUsage: Record<ModuleType, number>;
  resourceUsage: Record<ResourceType, number>;
  
  // Performance Analytics
  averageResponseTime: number;
  systemAvailability: number;
  errorRate: number;
  
  // Business Analytics
  costPerUser: Money;
  roi: number; // Return on investment percentage
  userSatisfactionScore?: number;
  supportTicketsPerMonth: number;
  
  // Compliance Analytics
  auditPassRate: number;
  dataBreaches: number;
  complianceViolations: number;
  
  // Recommendations
  upgradeRecommendations: string[];
  optimizationSuggestions: string[];
  costSavingOpportunities: string[];
}

// ============================================================================
// Utility Functions
// ============================================================================

export function getPackageFeatures(packageType: PackageType): Partial<PackageFeatures> {
  const baseFeatures: Record<PackageType, Partial<PackageFeatures>> = {
    [PackageType.BASIC]: {
      maxUsers: 10,
      maxLocations: 2,
      maxDepartments: 5,
      storageLimit: 5, // GB
      apiAccess: false,
      customWorkflows: false,
      advancedReporting: false,
      supportLevel: 'basic'
    },
    [PackageType.PROFESSIONAL]: {
      maxUsers: 50,
      maxLocations: 5,
      maxDepartments: 20,
      storageLimit: 25,
      apiAccess: true,
      customWorkflows: true,
      advancedReporting: true,
      supportLevel: 'standard'
    },
    [PackageType.ENTERPRISE]: {
      maxUsers: -1, // Unlimited
      maxLocations: -1,
      maxDepartments: -1,
      storageLimit: 100,
      apiAccess: true,
      customWorkflows: true,
      advancedReporting: true,
      supportLevel: 'premium'
    },
    [PackageType.CUSTOM]: {
      // Custom features configured per client
    }
  };
  
  return baseFeatures[packageType] || {};
}

export function isResourceAvailable(
  subscription: UserSubscription, 
  resourceType: ResourceType
): boolean {
  // Check if resource is available in current package
  const packageActivation = subscription.resourceOverrides?.find(
    r => r.resourceType === resourceType
  );
  
  return packageActivation?.isActive ?? false;
}

export function calculateUsagePercentage(
  current: number,
  limit: number
): number {
  if (limit === -1) return 0; // Unlimited
  if (limit === 0) return 100; // No allowance
  return Math.min((current / limit) * 100, 100);
}

export function isUpgradeRequired(
  currentUsage: SubscriptionUsage,
  packageFeatures: PackageFeatures
): boolean {
  return (
    currentUsage.activeUsers > packageFeatures.maxUsers ||
    currentUsage.storageUsedGB > packageFeatures.storageLimit ||
    currentUsage.apiCallsMade > packageFeatures.apiCallsPerMonth
  );
}

// ============================================================================
// Type Guards
// ============================================================================

export function isValidPackageType(value: string): value is PackageType {
  return Object.values(PackageType).includes(value as PackageType);
}

export function isValidSubscriptionStatus(value: string): value is SubscriptionStatus {
  return Object.values(SubscriptionStatus).includes(value as SubscriptionStatus);
}

export function isValidModuleType(value: string): value is ModuleType {
  return Object.values(ModuleType).includes(value as ModuleType);
}

// ============================================================================
// Default Package Configurations
// ============================================================================

export const DEFAULT_PACKAGES: Record<PackageType, Partial<SubscriptionPackage>> = {
  [PackageType.BASIC]: {
    name: 'Basic',
    description: 'Perfect for small restaurants and cafes',
    tagline: 'Get started with essential features',
    trialPeriodDays: 14,
    features: {
      maxUsers: 10,
      maxLocations: 2,
      maxDepartments: 5,
      storageLimit: 5,
      apiAccess: false,
      customWorkflows: false,
      advancedReporting: false,
      multiCurrency: false,
      supportLevel: 'basic'
    },
    highlights: [
      'Up to 10 users',
      '2 locations',
      'Basic reporting',
      'Email support',
      'Essential modules'
    ]
  },
  
  [PackageType.PROFESSIONAL]: {
    name: 'Professional',
    description: 'Ideal for growing restaurant groups',
    tagline: 'Scale your operations with advanced features',
    trialPeriodDays: 30,
    features: {
      maxUsers: 50,
      maxLocations: 5,
      maxDepartments: 20,
      storageLimit: 25,
      apiAccess: true,
      customWorkflows: true,
      advancedReporting: true,
      multiCurrency: true,
      supportLevel: 'standard'
    },
    highlights: [
      'Up to 50 users',
      '5 locations',
      'Advanced reporting',
      'API access',
      'Custom workflows',
      'Multi-currency',
      'Phone & email support'
    ],
    isPopular: true
  },
  
  [PackageType.ENTERPRISE]: {
    name: 'Enterprise',
    description: 'For large hospitality enterprises',
    tagline: 'Complete solution with unlimited scalability',
    trialPeriodDays: 30,
    features: {
      maxUsers: -1,
      maxLocations: -1,
      maxDepartments: -1,
      storageLimit: 100,
      apiAccess: true,
      customWorkflows: true,
      advancedReporting: true,
      multiCurrency: true,
      whiteLabel: true,
      supportLevel: 'premium'
    },
    highlights: [
      'Unlimited users',
      'Unlimited locations',
      'White-label options',
      'Dedicated support',
      'Custom integrations',
      'Advanced compliance',
      'Priority support'
    ]
  },
  
  [PackageType.CUSTOM]: {
    name: 'Custom',
    description: 'Tailored solution for unique requirements',
    tagline: 'Built specifically for your needs',
    trialPeriodDays: 30
  }
};