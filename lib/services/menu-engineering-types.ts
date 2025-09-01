/**
 * Menu Engineering Module Type Definitions
 * 
 * Comprehensive type definitions for the Menu Engineering module,
 * consolidating all types from the three core services.
 */

import { Money } from '@/lib/types/common';
import { Recipe, Ingredient } from '@/lib/types/recipe';

// Re-export service types for centralized access
export type {
  // POS Integration Service Types
  SalesTransaction,
  POSItemMapping,
  SalesDataImportBatch,
  ValidationError,
  DailySyncStatus,
  ImportSalesDataInput,
  ImportSalesDataResult,
  ValidateSalesDataInput,
  ValidateSalesDataResult,
  MapPOSItemsInput,
  MapPOSItemsResult,
  SyncDailySalesInput,
  SyncDailySalesResult
} from './pos-integration-service';

export type {
  // Menu Engineering Analytics Service Types
  MenuClassification,
  AnalysisPeriod,
  MenuItemPerformance,
  MenuAnalysisResult,
  RecommendationType,
  MenuRecommendation,
  RecommendationSet,
  AnalysisInsight,
  MenuEngineeeringConfig,
  AnalyzeMenuPerformanceInput,
  ClassifyMenuItemsInput,
  GenerateRecommendationsInput,
  CalculatePopularityScoreInput,
  CalculateProfitabilityScoreInput
} from './menu-engineering-service';

export type {
  // Enhanced Recipe Costing Service Types
  RealTimeCostCalculation,
  IngredientCostSnapshot,
  LaborCostSnapshot,
  OverheadCostSnapshot,
  CostVariance,
  CostThreshold,
  CostAlert,
  RecipeCostBreakdown,
  InventoryChangeEvent,
  CalculateRealTimeCostInput,
  CalculateRealTimeCostResult,
  UpdateCostsFromInventoryInput,
  UpdateCostsResult,
  TrackCostVariationsInput,
  CostVariationResult,
  CostAlertInput
} from './enhanced-recipe-costing-service';

// ====== INTEGRATED MODULE TYPES ======

/**
 * Comprehensive menu engineering analysis combining all service data
 */
export interface IntegratedMenuAnalysis {
  analysisId: string;
  generatedAt: Date;
  periodStart: Date;
  periodEnd: Date;
  locationIds?: string[];
  
  // Sales performance data
  salesPerformance: {
    totalTransactions: number;
    totalRevenue: Money;
    averageTransactionValue: Money;
    topPerformingItems: string[];
    underPerformingItems: string[];
  };
  
  // Menu engineering classification
  menuClassification: {
    stars: MenuItemPerformance[];
    plowhorses: MenuItemPerformance[];
    puzzles: MenuItemPerformance[];
    dogs: MenuItemPerformance[];
    totalItems: number;
    classificationAccuracy: number;
  };
  
  // Cost analysis
  costAnalysis: {
    totalRecipesAnalyzed: number;
    averageFoodCostPercentage: number;
    costVariances: CostVariance[];
    highRiskItems: string[];
    costOptimizationOpportunities: Money;
  };
  
  // Integrated insights
  insights: {
    profitabilityInsights: AnalysisInsight[];
    costOptimizationInsights: AnalysisInsight[];
    marketingInsights: AnalysisInsight[];
    operationalInsights: AnalysisInsight[];
  };
  
  // Recommendations across all areas
  recommendations: {
    immediate: MenuRecommendation[];
    shortTerm: MenuRecommendation[];
    longTerm: MenuRecommendation[];
    estimatedImpact: {
      revenueIncrease: Money;
      costSavings: Money;
      profitImprovement: Money;
    };
  };
  
  // Data quality and confidence
  dataQuality: {
    salesDataCompleteness: number;
    costDataAccuracy: number;
    overallConfidence: number;
    dataGaps: string[];
  };
}

/**
 * Menu engineering dashboard metrics
 */
export interface MenuEngineeringMetrics {
  // Period comparison
  currentPeriod: DatePeriod;
  comparisonPeriod: DatePeriod;
  
  // Key performance indicators
  kpis: {
    totalRevenue: {
      current: Money;
      previous: Money;
      changePercent: number;
      trend: 'up' | 'down' | 'stable';
    };
    averageItemProfitability: {
      current: number;
      previous: number;
      changePercent: number;
      trend: 'up' | 'down' | 'stable';
    };
    menuMixOptimization: {
      current: number; // Percentage of optimal menu mix
      target: number;
      improvement: number;
    };
    costVariability: {
      current: number; // Average cost variance percentage
      previous: number;
      stability: 'stable' | 'volatile' | 'improving';
    };
  };
  
  // Classification distribution
  classificationBreakdown: {
    stars: { count: number; revenueContribution: number };
    plowhorses: { count: number; revenueContribution: number };
    puzzles: { count: number; revenueContribution: number };
    dogs: { count: number; revenueContribution: number };
  };
  
  // Alerts and notifications
  activeAlerts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  
  // Trend data for charts
  trends: {
    revenueByDay: Array<{ date: Date; revenue: Money }>;
    profitabilityByDay: Array<{ date: Date; profitMargin: number }>;
    costVarianceByDay: Array<{ date: Date; variance: number }>;
    topPerformers: Array<{ recipeId: string; name: string; score: number }>;
  };
}

/**
 * Date period for analysis
 */
export interface DatePeriod {
  start: Date;
  end: Date;
  label: string;
  days: number;
}

/**
 * Menu optimization recommendation with implementation plan
 */
export interface MenuOptimizationPlan {
  planId: string;
  createdAt: Date;
  createdBy: string;
  title: string;
  description: string;
  
  // Target metrics
  objectives: {
    revenueIncrease?: Money;
    costReduction?: Money;
    profitMarginImprovement?: number;
    menuMixOptimization?: number;
  };
  
  // Implementation phases
  phases: Array<{
    phaseId: string;
    name: string;
    description: string;
    duration: number; // days
    recommendations: MenuRecommendation[];
    estimatedImpact: Money;
    dependencies: string[]; // other phase IDs
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  }>;
  
  // Success metrics
  successCriteria: Array<{
    metric: string;
    target: number;
    unit: string;
    measurementFrequency: 'daily' | 'weekly' | 'monthly';
  }>;
  
  // Risk assessment
  risks: Array<{
    risk: string;
    probability: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    mitigation: string;
  }>;
  
  // Implementation timeline
  timeline: {
    startDate: Date;
    endDate: Date;
    milestones: Array<{
      date: Date;
      description: string;
      deliverables: string[];
    }>;
  };
  
  // Progress tracking
  progress: {
    completedPhases: number;
    totalPhases: number;
    overallProgress: number; // 0-100
    currentPhase?: string;
    nextMilestone?: Date;
  };
}

/**
 * Menu item lifecycle tracking
 */
export interface MenuItemLifecycle {
  recipeId: string;
  recipeName: string;
  
  // Lifecycle stages
  stages: Array<{
    stage: 'development' | 'testing' | 'launch' | 'growth' | 'maturity' | 'decline' | 'removal';
    startDate: Date;
    endDate?: Date;
    duration?: number; // days
    classification?: MenuClassification;
    performance?: {
      avgDailySales: number;
      avgProfitMargin: number;
      customerFeedback?: number; // 1-5 rating
    };
  }>;
  
  // Current status
  currentStage: string;
  stageAge: number; // days in current stage
  expectedStageTransition?: Date;
  
  // Performance evolution
  performanceHistory: Array<{
    date: Date;
    classification: MenuClassification;
    popularityScore: number;
    profitabilityScore: number;
    salesVolume: number;
    revenue: Money;
  }>;
  
  // Forecasts
  forecasts: {
    nextClassification?: MenuClassification;
    projectedLifespan?: number; // days
    recommendedActions: string[];
  };
}

/**
 * Competitive analysis data
 */
export interface CompetitiveAnalysis {
  analysisId: string;
  analysisDate: Date;
  competitorCount: number;
  
  // Price positioning
  pricePositioning: Array<{
    recipeId: string;
    recipeName: string;
    ourPrice: Money;
    competitorPrices: Array<{
      competitor: string;
      price: Money;
      quality: 'lower' | 'similar' | 'higher';
    }>;
    positioning: 'premium' | 'competitive' | 'value';
    recommendation: string;
  }>;
  
  // Market opportunities
  opportunities: Array<{
    category: string;
    description: string;
    marketSize: Money;
    competitorGaps: string[];
    recommendedActions: string[];
    estimatedRevenue: Money;
    difficulty: 'low' | 'medium' | 'high';
  }>;
  
  // Threat analysis
  threats: Array<{
    source: string;
    threat: string;
    impact: 'low' | 'medium' | 'high';
    probability: 'low' | 'medium' | 'high';
    affectedItems: string[];
    mitigation: string[];
  }>;
}

/**
 * Seasonal analysis and forecasting
 */
export interface SeasonalAnalysis {
  analysisId: string;
  analysisDate: Date;
  
  // Seasonal patterns
  patterns: Array<{
    recipeId: string;
    recipeName: string;
    seasonality: {
      spring: number; // demand multiplier
      summer: number;
      fall: number;
      winter: number;
    };
    peakSeason: 'spring' | 'summer' | 'fall' | 'winter';
    lowSeason: 'spring' | 'summer' | 'fall' | 'winter';
    volatility: number; // coefficient of variation
  }>;
  
  // Forecasts
  forecasts: Array<{
    recipeId: string;
    recipeName: string;
    period: 'next_month' | 'next_quarter' | 'next_season';
    projectedDemand: number;
    projectedRevenue: Money;
    confidence: number; // 0-1
    factors: string[]; // factors influencing forecast
  }>;
  
  // Recommendations
  seasonalRecommendations: Array<{
    recipeId: string;
    season: 'spring' | 'summer' | 'fall' | 'winter';
    recommendation: 'promote' | 'feature' | 'discount' | 'remove' | 'stock_up';
    rationale: string;
    estimatedImpact: Money;
  }>;
}

/**
 * Menu engineering configuration for the entire module
 */
export interface MenuEngineeringModuleConfig {
  // Analysis settings
  analysis: {
    defaultPeriodDays: number;
    minimumSampleSize: number;
    confidenceThreshold: number;
    updateFrequency: 'daily' | 'weekly' | 'monthly';
  };
  
  // Classification thresholds
  classification: {
    popularityThreshold: number; // percentile
    profitabilityThreshold: number; // percentile
    volatilityThreshold: number; // coefficient of variation
    dataQualityThreshold: number; // 0-1
  };
  
  // Alert settings
  alerting: {
    enabled: boolean;
    costVarianceThreshold: number; // percentage
    profitMarginThreshold: number; // percentage
    notificationChannels: string[];
    escalationLevels: Array<{
      severity: 'low' | 'medium' | 'high' | 'critical';
      responseTime: number; // hours
      recipients: string[];
    }>;
  };
  
  // Integration settings
  integration: {
    posSystemId: string;
    inventorySystemId: string;
    syncFrequency: number; // hours
    dataRetentionDays: number;
    cacheSettings: {
      ttl: number; // seconds
      maxSize: number; // MB
    };
  };
  
  // Reporting settings
  reporting: {
    defaultCurrency: string;
    decimalPlaces: number;
    chartColors: Record<string, string>;
    exportFormats: string[];
    scheduledReports: Array<{
      name: string;
      frequency: 'daily' | 'weekly' | 'monthly';
      recipients: string[];
      format: string;
    }>;
  };
}

/**
 * Menu engineering service status and health
 */
export interface MenuEngineeringServiceStatus {
  timestamp: Date;
  
  // Service health
  services: {
    posIntegration: {
      status: 'healthy' | 'degraded' | 'down';
      lastUpdate: Date;
      errorRate: number;
      responseTime: number; // ms
    };
    menuAnalytics: {
      status: 'healthy' | 'degraded' | 'down';
      lastAnalysis: Date;
      cacheHitRate: number;
      processingTime: number; // ms
    };
    costingEngine: {
      status: 'healthy' | 'degraded' | 'down';
      lastCostUpdate: Date;
      dataFreshness: number;
      alertsActive: number;
    };
  };
  
  // Data status
  dataStatus: {
    salesDataHealth: number; // 0-1
    costDataHealth: number; // 0-1
    lastSyncTime: Date;
    pendingUpdates: number;
    dataGaps: Array<{
      type: 'sales' | 'costs' | 'recipes';
      period: DatePeriod;
      impact: 'low' | 'medium' | 'high';
    }>;
  };
  
  // Performance metrics
  performance: {
    totalRecipesTracked: number;
    activeAlerts: number;
    dailyTransactionsProcessed: number;
    avgAnalysisTime: number; // seconds
    systemLoad: number; // 0-1
  };
  
  // Issues and warnings
  issues: Array<{
    severity: 'info' | 'warning' | 'error' | 'critical';
    component: string;
    message: string;
    timestamp: Date;
    resolved: boolean;
  }>;
}