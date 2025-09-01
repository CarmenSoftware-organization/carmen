/**
 * Menu Engineering Types
 * 
 * Types and interfaces for menu engineering analytics, performance metrics,
 * and classification systems for recipe optimization.
 */

import { Money, AuditTimestamp } from './common'

// ====== MENU ENGINEERING CORE TYPES ======

/**
 * Menu engineering classification categories (Boston Consulting Group Matrix)
 */
export type MenuItemClassification = 'star' | 'plow_horse' | 'puzzle' | 'dog';

/**
 * Performance metrics period
 */
export type MetricsPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

/**
 * Menu performance data point for a recipe
 */
export interface MenuPerformanceData {
  recipeId: string;
  recipeName: string;
  category: string;
  // Performance metrics
  totalSales: number;
  totalRevenue: Money;
  totalCost: Money;
  grossProfit: Money;
  grossMarginPercentage: number;
  // Popularity metrics
  orderFrequency: number;
  popularityScore: number; // 0-100 percentile
  popularityRank: number;
  // Profitability metrics
  profitabilityScore: number; // 0-100 percentile  
  profitabilityRank: number;
  unitContribution: Money;
  contributionPercentage: number;
  // Classification
  classification: MenuItemClassification;
  classificationConfidence: number; // 0-1
  // Trends
  salesTrend: number; // percentage change
  profitTrend: number; // percentage change
  // Analysis period
  analysisStartDate: Date;
  analysisEndDate: Date;
  lastUpdated: Date;
}

/**
 * Menu engineering performance matrix data
 */
export interface MenuEngineeringMatrix {
  id: string;
  locationId?: string;
  departmentId?: string;
  analysisDate: Date;
  period: {
    startDate: Date;
    endDate: Date;
  };
  // Matrix quadrants
  stars: MenuPerformanceData[];
  plowHorses: MenuPerformanceData[];
  puzzles: MenuPerformanceData[];
  dogs: MenuPerformanceData[];
  // Matrix thresholds
  popularityThreshold: number; // percentile threshold (e.g., 50)
  profitabilityThreshold: number; // percentile threshold (e.g., 50)
  // Summary metrics
  totalItems: number;
  totalRevenue: Money;
  totalProfit: Money;
  averageContribution: Money;
  // Recommendations
  recommendations: MenuEngineeringRecommendation[];
  ...AuditTimestamp;
}

/**
 * Menu engineering recommendations
 */
export interface MenuEngineeringRecommendation {
  id: string;
  recipeId: string;
  recipeName: string;
  classification: MenuItemClassification;
  recommendationType: 'promote' | 'reposition' | 'reprice' | 'reformulate' | 'remove' | 'feature';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImpact: string;
  implementationEffort: 'low' | 'medium' | 'high';
  estimatedROI?: number;
  // Action details
  suggestedActions: string[];
  requiredResources: string[];
  timeline: string;
  // Tracking
  status: 'pending' | 'in_progress' | 'implemented' | 'rejected';
  assignedTo?: string;
  implementedAt?: Date;
  actualImpact?: string;
  notes?: string;
  createdAt: Date;
}

// ====== SALES DATA INTEGRATION ======

/**
 * Sales data import session
 */
export interface SalesDataImport {
  id: string;
  sessionId: string;
  fileName: string;
  fileSize: number;
  importType: 'csv' | 'excel' | 'json' | 'pos_system';
  posSystemType?: 'square' | 'toast' | 'clover' | 'resy' | 'opentable' | 'custom';
  // Import progress
  status: 'uploading' | 'processing' | 'validating' | 'completed' | 'failed';
  progress: number; // 0-100
  totalRecords: number;
  processedRecords: number;
  validRecords: number;
  errorRecords: number;
  // Data mapping
  fieldMapping: SalesDataFieldMapping[];
  // Import results
  importErrors: SalesImportError[];
  duplicateRecords: number;
  newRecords: number;
  updatedRecords: number;
  // Timing
  startedAt: Date;
  completedAt?: Date;
  processingTime?: number; // seconds
  ...AuditTimestamp;
}

/**
 * Sales data field mapping configuration
 */
export interface SalesDataFieldMapping {
  sourceField: string;
  targetField: 'recipeId' | 'recipeName' | 'quantity' | 'unitPrice' | 'totalPrice' | 'orderDate' | 'orderId' | 'customerId';
  dataType: 'string' | 'number' | 'date' | 'money';
  isRequired: boolean;
  transformation?: string; // JavaScript expression for data transformation
  defaultValue?: string;
  validation?: string; // Regular expression for validation
}

/**
 * Sales import error
 */
export interface SalesImportError {
  rowNumber: number;
  field: string;
  value: string;
  errorType: 'validation' | 'mapping' | 'transformation' | 'duplicate' | 'missing_required';
  errorMessage: string;
  suggestion?: string;
}

/**
 * Sales data record
 */
export interface SalesDataRecord {
  id: string;
  importId: string;
  // Order information
  orderId: string;
  orderDate: Date;
  customerId?: string;
  // Item information
  recipeId?: string;
  recipeName: string;
  categoryId?: string;
  // Sales metrics
  quantity: number;
  unitPrice: Money;
  totalPrice: Money;
  discount?: Money;
  tax?: Money;
  // Additional data
  serverId?: string;
  tableNumber?: string;
  orderType?: 'dine_in' | 'takeout' | 'delivery' | 'catering';
  // Processing
  isProcessed: boolean;
  matchedRecipeId?: string;
  matchConfidence?: number; // 0-1
  needsReview: boolean;
  ...AuditTimestamp;
}

// ====== COST TRACKING AND ALERTS ======

/**
 * Recipe cost tracking
 */
export interface RecipeCostTracking {
  recipeId: string;
  trackingDate: Date;
  // Current costs
  ingredientCost: Money;
  laborCost: Money;
  overheadCost: Money;
  totalCost: Money;
  // Historical comparison
  previousCost?: Money;
  costChange?: Money;
  costChangePercentage?: number;
  // Alerts
  isAboveThreshold: boolean;
  thresholdExceededBy?: Money;
  alertLevel?: 'info' | 'warning' | 'critical';
  // Contributing factors
  ingredientPriceChanges: IngredientCostChange[];
  ...AuditTimestamp;
}

/**
 * Ingredient cost change tracking
 */
export interface IngredientCostChange {
  ingredientId: string;
  ingredientName: string;
  previousCost: Money;
  currentCost: Money;
  costChange: Money;
  costChangePercentage: number;
  changeReason?: string;
  supplierId?: string;
  supplierName?: string;
}

/**
 * Cost alert configuration
 */
export interface CostAlertConfig {
  id: string;
  name: string;
  description?: string;
  // Scope
  recipeIds: string[];
  categoryIds: string[];
  locationIds: string[];
  // Thresholds
  thresholdType: 'percentage' | 'absolute' | 'variance';
  warningThreshold: number;
  criticalThreshold: number;
  // Notification settings
  isActive: boolean;
  notificationChannels: ('email' | 'sms' | 'dashboard' | 'webhook')[];
  recipients: string[];
  // Frequency
  checkFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  maxAlertsPerDay?: number;
  // Conditions
  minimumOrderVolume?: number;
  onlyBusinessHours?: boolean;
  excludeWeekends?: boolean;
  ...AuditTimestamp;
}

/**
 * Cost alert instance
 */
export interface CostAlert {
  id: string;
  configId: string;
  recipeId: string;
  recipeName: string;
  // Alert details
  alertType: 'cost_increase' | 'margin_decrease' | 'threshold_exceeded' | 'variance_detected';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  // Cost data
  currentCost: Money;
  previousCost?: Money;
  thresholdValue: Money;
  exceedsThresholdBy: Money;
  // Status
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolutionNotes?: string;
  // Notifications
  notificationsSent: AlertNotification[];
  createdAt: Date;
}

/**
 * Alert notification log
 */
export interface AlertNotification {
  id: string;
  alertId: string;
  channel: 'email' | 'sms' | 'dashboard' | 'webhook';
  recipient: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: Date;
  deliveredAt?: Date;
  errorMessage?: string;
  retryCount: number;
}

// ====== ANALYTICS AND REPORTING ======

/**
 * Menu engineering analytics summary
 */
export interface MenuEngineeringAnalytics {
  locationId?: string;
  analysisDate: Date;
  period: {
    startDate: Date;
    endDate: Date;
  };
  // Portfolio composition
  portfolioComposition: {
    stars: { count: number; revenuePercentage: number; profitPercentage: number; };
    plowHorses: { count: number; revenuePercentage: number; profitPercentage: number; };
    puzzles: { count: number; revenuePercentage: number; profitPercentage: number; };
    dogs: { count: number; revenuePercentage: number; profitPercentage: number; };
  };
  // Performance trends
  trends: {
    popularityTrend: number; // percentage change in average popularity
    profitabilityTrend: number; // percentage change in average profitability
    portfolioOptimization: number; // 0-100 score
  };
  // Key metrics
  topPerformers: MenuPerformanceData[];
  underperformers: MenuPerformanceData[];
  riskItems: MenuPerformanceData[];
  opportunityItems: MenuPerformanceData[];
  // Recommendations summary
  totalRecommendations: number;
  highPriorityRecommendations: number;
  estimatedImpact: Money;
}

/**
 * Menu engineering report configuration
 */
export interface MenuEngineeringReportConfig {
  id: string;
  name: string;
  description?: string;
  // Report scope
  locationIds: string[];
  categoryIds: string[];
  reportType: 'matrix' | 'performance' | 'trends' | 'recommendations' | 'cost_analysis';
  // Scheduling
  isScheduled: boolean;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number; // 0-6
    dayOfMonth?: number; // 1-31
    hour: number; // 0-23
  };
  // Delivery
  deliveryChannels: ('email' | 'dashboard' | 'export')[];
  recipients: string[];
  exportFormat?: 'pdf' | 'excel' | 'csv';
  // Customization
  includeCharts: boolean;
  includeRecommendations: boolean;
  includeHistoricalData: boolean;
  customDateRange?: {
    startDate: Date;
    endDate: Date;
  };
  ...AuditTimestamp;
}