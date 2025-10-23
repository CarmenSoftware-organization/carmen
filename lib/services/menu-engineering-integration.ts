/**
 * Menu Engineering Integration Service
 * 
 * Orchestrates all menu engineering services and provides a unified interface
 * following Carmen ERP patterns for error handling, caching, and logging.
 */

import { BaseCalculator, CalculationResult } from './calculations/base-calculator';
import { EnhancedCacheLayer, createEnhancedCacheLayer } from './cache/enhanced-cache-layer';
import { POSIntegrationService, createPOSIntegrationService } from './pos-integration-service';
import { MenuEngineeringService, createMenuEngineeringService } from './menu-engineering-service';
import { EnhancedRecipeCostingService, createEnhancedRecipeCostingService } from './enhanced-recipe-costing-service';
import {
  IntegratedMenuAnalysis,
  MenuEngineeringMetrics,
  MenuOptimizationPlan,
  MenuEngineeringModuleConfig,
  MenuEngineeringServiceStatus
} from './menu-engineering-types';
import { Money } from '@/lib/types/common';
import { z } from 'zod';

// ====== CONFIGURATION SCHEMA ======

export const MenuEngineeringModuleConfigSchema = z.object({
  analysis: z.object({
    defaultPeriodDays: z.number().positive().default(30),
    minimumSampleSize: z.number().positive().default(10),
    confidenceThreshold: z.number().min(0).max(1).default(0.8),
    updateFrequency: z.enum(['daily', 'weekly', 'monthly']).default('daily')
  }),
  classification: z.object({
    popularityThreshold: z.number().min(50).max(95).default(70),
    profitabilityThreshold: z.number().min(50).max(95).default(70),
    volatilityThreshold: z.number().positive().default(0.2),
    dataQualityThreshold: z.number().min(0.1).max(1).default(0.7)
  }),
  alerting: z.object({
    enabled: z.boolean().default(true),
    costVarianceThreshold: z.number().positive().default(10),
    profitMarginThreshold: z.number().positive().default(20),
    notificationChannels: z.array(z.string()).default(['email', 'dashboard']),
    escalationLevels: z.array(z.object({
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      responseTime: z.number().positive(),
      recipients: z.array(z.string())
    })).optional()
  }),
  integration: z.object({
    posSystemId: z.string().default('default_pos'),
    inventorySystemId: z.string().default('default_inventory'),
    syncFrequency: z.number().positive().default(24),
    dataRetentionDays: z.number().positive().default(365),
    cacheSettings: z.object({
      ttl: z.number().positive().default(300),
      maxSize: z.number().positive().default(100)
    })
  }),
  reporting: z.object({
    defaultCurrency: z.string().default('USD'),
    decimalPlaces: z.number().int().min(0).max(4).default(2),
    chartColors: z.record(z.string()).default({}),
    exportFormats: z.array(z.string()).default(['pdf', 'excel', 'csv']),
    scheduledReports: z.array(z.object({
      name: z.string(),
      frequency: z.enum(['daily', 'weekly', 'monthly']),
      recipients: z.array(z.string()),
      format: z.string()
    })).optional()
  })
});

// ====== INPUT/OUTPUT INTERFACES ======

export interface GenerateIntegratedAnalysisInput {
  periodStart: Date;
  periodEnd: Date;
  locationIds?: string[];
  recipeIds?: string[];
  includeCompetitive?: boolean;
  includeSeasonal?: boolean;
  includeForecasting?: boolean;
  customConfig?: Partial<MenuEngineeringModuleConfig>;
}

export interface GenerateMetricsInput {
  currentPeriod: { start: Date; end: Date };
  comparisonPeriod?: { start: Date; end: Date };
  locationIds?: string[];
  includeAlerts?: boolean;
  includeTrends?: boolean;
}

export interface CreateOptimizationPlanInput {
  analysisId: string;
  objectives: {
    revenueIncrease?: Money;
    costReduction?: Money;
    profitMarginImprovement?: number;
    menuMixOptimization?: number;
  };
  timeframe: number; // days
  riskTolerance: 'low' | 'medium' | 'high';
  implementationCapacity: 'limited' | 'moderate' | 'high';
  createdBy: string;
}

// ====== MENU ENGINEERING INTEGRATION SERVICE ======

/**
 * Integrated Menu Engineering Service orchestrating all menu engineering capabilities
 */
export class MenuEngineeringIntegrationService extends BaseCalculator {
  protected serviceName = 'MenuEngineeringIntegrationService';
  
  private config: MenuEngineeringModuleConfig;
  private cache: EnhancedCacheLayer;
  private posService: POSIntegrationService;
  private analyticsService: MenuEngineeringService;
  private costingService: EnhancedRecipeCostingService;
  private healthStatus: MenuEngineeringServiceStatus;

  constructor(config?: Partial<MenuEngineeringModuleConfig>) {
    super();
    
    // Validate and set configuration
    const validatedConfig = MenuEngineeringModuleConfigSchema.parse(config || {});
    this.config = validatedConfig as MenuEngineeringModuleConfig;
    
    // Initialize cache layer
    this.cache = createEnhancedCacheLayer({
      redis: {
        enabled: process.env.REDIS_ENABLED === 'true',
        fallbackToMemory: true,
        connectionTimeout: 5000
      },
      memory: {
        maxMemoryMB: this.config.integration.cacheSettings.maxSize,
        maxEntries: 10000
      },
      ttl: {
        financial: this.config.integration.cacheSettings.ttl,
        inventory: this.config.integration.cacheSettings.ttl,
        vendor: this.config.integration.cacheSettings.ttl,
        default: this.config.integration.cacheSettings.ttl
      },
      invalidation: {
        enabled: true,
        batchSize: 100,
        maxDependencies: 50
      },
      monitoring: {
        enabled: true,
        metricsInterval: 60000
      }
    });
    
    // Initialize services
    this.posService = createPOSIntegrationService(this.cache);
    this.analyticsService = createMenuEngineeringService(this.cache, {
      popularityThreshold: this.config.classification.popularityThreshold,
      profitabilityThreshold: this.config.classification.profitabilityThreshold,
      minimumSampleSize: this.config.analysis.minimumSampleSize,
      dataQualityThreshold: this.config.classification.dataQualityThreshold,
      analysisLookbackDays: this.config.analysis.defaultPeriodDays
    });
    this.costingService = createEnhancedRecipeCostingService(this.cache);
    
    // Initialize health status
    this.healthStatus = this.initializeHealthStatus();
    
    // Start monitoring if in production
    if (process.env.NODE_ENV === 'production') {
      this.startHealthMonitoring();
    }
  }

  /**
   * Generate comprehensive integrated menu analysis
   */
  async generateIntegratedAnalysis(input: GenerateIntegratedAnalysisInput): Promise<CalculationResult<IntegratedMenuAnalysis>> {
    return this.executeCalculation('generateIntegratedAnalysis', input, async (context) => {
      const startTime = Date.now();
      
      try {
        // Update health status
        await this.updateServiceHealth();
        
        // Step 1: Analyze menu performance
        const menuAnalysis = await this.analyticsService.analyzeMenuPerformance({
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          locationIds: input.locationIds,
          recipeIds: input.recipeIds,
          config: input.customConfig?.classification
        });

        // Step 2: Calculate real-time costs for all recipes
        const recipeIds = input.recipeIds || await this.getAllRecipeIds(context);
        const costAnalysisPromises = recipeIds.slice(0, 50).map(async (recipeId) => {
          try {
            return await this.costingService.calculateRealTimeCost({
              recipeId,
              locationId: input.locationIds?.[0],
              includeLaborCosts: true,
              includeOverheadCosts: true
            });
          } catch (error) {
            console.warn(`[${this.serviceName}] Failed to calculate cost for recipe ${recipeId}:`, error);
            return null;
          }
        });

        const costAnalysisResults = (await Promise.all(costAnalysisPromises))
          .filter((result): result is NonNullable<typeof result> => result !== null);

        // Step 3: Track cost variations
        const costVariations = await this.costingService.trackCostVariations({
          recipeIds: recipeIds.slice(0, 20),
          comparisonPeriods: [
            {
              start: new Date(input.periodStart.getTime() - 30 * 24 * 60 * 60 * 1000),
              end: input.periodStart,
              label: 'Previous Period'
            },
            {
              start: input.periodStart,
              end: input.periodEnd,
              label: 'Current Period'
            }
          ]
        });

        // Step 4: Get sales performance data (mock implementation)
        const salesPerformance = await this.calculateSalesPerformance(
          input.periodStart,
          input.periodEnd,
          input.locationIds,
          context
        );

        // Step 5: Generate integrated insights
        const integratedInsights = this.generateIntegratedInsights(
          menuAnalysis.value,
          costAnalysisResults,
          costVariations.value
        );

        // Step 6: Create comprehensive recommendations
        const integratedRecommendations = await this.generateIntegratedRecommendations(
          menuAnalysis.value,
          costAnalysisResults,
          costVariations.value,
          context
        );

        // Step 7: Assess data quality
        const dataQuality = this.assessIntegratedDataQuality(
          menuAnalysis.value,
          costAnalysisResults,
          salesPerformance
        );

        // Build integrated analysis result
        const integratedAnalysis: IntegratedMenuAnalysis = {
          analysisId: this.generateAnalysisId(),
          generatedAt: new Date(),
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          locationIds: input.locationIds,
          salesPerformance,
          menuClassification: {
            stars: menuAnalysis.value.stars,
            plowhorses: menuAnalysis.value.plowhorses,
            puzzles: menuAnalysis.value.puzzles,
            dogs: menuAnalysis.value.dogs,
            totalItems: menuAnalysis.value.totalItems,
            classificationAccuracy: menuAnalysis.value.confidence
          },
          costAnalysis: {
            totalRecipesAnalyzed: costAnalysisResults.length,
            averageFoodCostPercentage: this.calculateAverageFoodCostPercentage(costAnalysisResults),
            costVariances: costVariations.value.recipeVariances,
            highRiskItems: this.identifyHighRiskItems(costVariations.value),
            costOptimizationOpportunities: this.calculateCostOptimizationOpportunities(costAnalysisResults)
          },
          insights: integratedInsights,
          recommendations: integratedRecommendations,
          dataQuality
        };

        // Cache the result
        const dependencies = [
          { type: 'entity' as const, identifier: 'menu_analysis' },
          { type: 'entity' as const, identifier: 'cost_analysis' },
          { type: 'entity' as const, identifier: 'sales_data' },
          { type: 'table' as const, identifier: 'sales_transactions' }
        ];

        await this.cache.getOrCompute(
          this.serviceName,
          'generateIntegratedAnalysis',
          { analysisId: integratedAnalysis.analysisId },
          async () => this.createResult(integratedAnalysis, context),
          dependencies,
          context.userId
        );

        const processingTimeMs = Date.now() - startTime;
        console.log(`[${this.serviceName}] Generated integrated analysis in ${processingTimeMs}ms`);

        return integratedAnalysis;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[${this.serviceName}] Failed to generate integrated analysis:`, error);
        
        throw this.createError(
          `Failed to generate integrated menu analysis: ${errorMessage}`,
          'INTEGRATED_ANALYSIS_FAILED',
          context,
          error instanceof Error ? error : undefined
        );
      }
    });
  }

  /**
   * Generate menu engineering metrics for dashboard
   */
  async generateMetrics(input: GenerateMetricsInput): Promise<CalculationResult<MenuEngineeringMetrics>> {
    return this.executeCalculation('generateMetrics', input, async (context) => {
      // Set comparison period if not provided
      const comparisonPeriod = input.comparisonPeriod || {
        start: new Date(input.currentPeriod.start.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: input.currentPeriod.start
      };

      // Get current and previous analysis
      const [currentAnalysis, previousAnalysis] = await Promise.all([
        this.analyticsService.analyzeMenuPerformance({
          periodStart: input.currentPeriod.start,
          periodEnd: input.currentPeriod.end,
          locationIds: input.locationIds
        }),
        this.analyticsService.analyzeMenuPerformance({
          periodStart: comparisonPeriod.start,
          periodEnd: comparisonPeriod.end,
          locationIds: input.locationIds
        })
      ]);

      // Calculate KPIs
      const kpis = this.calculateKPIs(currentAnalysis.value, previousAnalysis.value);

      // Get classification breakdown
      const classificationBreakdown = this.calculateClassificationBreakdown(currentAnalysis.value);

      // Get active alerts if requested
      let activeAlerts = { critical: 0, high: 0, medium: 0, low: 0 };
      if (input.includeAlerts) {
        activeAlerts = await this.getActiveAlertsCount(context);
      }

      // Get trend data if requested
      let trends: MenuEngineeringMetrics['trends'] = {
        revenueByDay: [],
        profitabilityByDay: [],
        costVarianceByDay: [],
        topPerformers: []
      };
      
      if (input.includeTrends) {
        trends = await this.generateTrendData(
          input.currentPeriod,
          input.locationIds,
          context
        );
      }

      const metrics: MenuEngineeringMetrics = {
        currentPeriod: {
          start: input.currentPeriod.start,
          end: input.currentPeriod.end,
          label: 'Current Period',
          days: Math.ceil((input.currentPeriod.end.getTime() - input.currentPeriod.start.getTime()) / (1000 * 60 * 60 * 24))
        },
        comparisonPeriod: {
          start: comparisonPeriod.start,
          end: comparisonPeriod.end,
          label: 'Previous Period',
          days: Math.ceil((comparisonPeriod.end.getTime() - comparisonPeriod.start.getTime()) / (1000 * 60 * 60 * 24))
        },
        kpis,
        classificationBreakdown,
        activeAlerts,
        trends
      };

      return metrics;
    });
  }

  /**
   * Create menu optimization plan
   */
  async createOptimizationPlan(input: CreateOptimizationPlanInput): Promise<CalculationResult<MenuOptimizationPlan>> {
    return this.executeCalculation('createOptimizationPlan', input, async (context) => {
      // Get the analysis data
      const analysisData = await this.getAnalysisById(input.analysisId, context);
      if (!analysisData) {
        throw this.createError(
          `Analysis not found: ${input.analysisId}`,
          'ANALYSIS_NOT_FOUND',
          context
        );
      }

      // Generate recommendations for optimization
      const recommendations = await this.analyticsService.generateRecommendations({
        analysis: analysisData
      });

      // Create implementation phases based on recommendations
      const phases = this.createImplementationPhases(
        recommendations.value,
        input.timeframe,
        input.riskTolerance,
        input.implementationCapacity
      );

      // Define success criteria
      const successCriteria = this.defineSuccessCriteria(input.objectives);

      // Assess risks
      const risks = this.assessOptimizationRisks(phases, input.riskTolerance);

      // Create timeline
      const timeline = this.createImplementationTimeline(phases, input.timeframe);

      const optimizationPlan: MenuOptimizationPlan = {
        planId: this.generatePlanId(),
        createdAt: new Date(),
        createdBy: input.createdBy,
        title: 'Menu Engineering Optimization Plan',
        description: 'Comprehensive plan to optimize menu performance based on data-driven analysis',
        objectives: input.objectives,
        phases,
        successCriteria,
        risks,
        timeline,
        progress: {
          completedPhases: 0,
          totalPhases: phases.length,
          overallProgress: 0,
          currentPhase: phases[0]?.phaseId,
          nextMilestone: timeline.milestones[0]?.date
        }
      };

      // Cache the plan
      await this.cache.getOrCompute(
        this.serviceName,
        'createOptimizationPlan',
        { planId: optimizationPlan.planId },
        async () => this.createResult(optimizationPlan, context),
        [{ type: 'entity', identifier: `optimization_plan_${optimizationPlan.planId}` }],
        context.userId
      );

      return optimizationPlan;
    });
  }

  /**
   * Get service health status
   */
  async getServiceStatus(): Promise<CalculationResult<MenuEngineeringServiceStatus>> {
    return this.executeCalculation('getServiceStatus', {}, async (context) => {
      await this.updateServiceHealth();
      return this.healthStatus;
    });
  }

  /**
   * Shutdown all services gracefully
   */
  async shutdown(): Promise<void> {
    console.log(`[${this.serviceName}] Shutting down menu engineering services...`);
    
    try {
      await this.cache.shutdown();
      console.log(`[${this.serviceName}] Cache layer shutdown completed`);
    } catch (error) {
      console.error(`[${this.serviceName}] Error shutting down cache:`, error);
    }
  }

  // ====== PRIVATE HELPER METHODS ======

  private generateAnalysisId(): string {
    return `integrated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePlanId(): string {
    return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getAllRecipeIds(context: any): Promise<string[]> {
    // This would query the database for all active recipe IDs
    // For now, return mock data
    return ['recipe-1', 'recipe-2', 'recipe-3', 'recipe-4', 'recipe-5'];
  }

  private async calculateSalesPerformance(
    periodStart: Date,
    periodEnd: Date,
    locationIds?: string[],
    context?: any
  ) {
    // Mock implementation - would calculate actual sales performance
    return {
      totalTransactions: 1500,
      totalRevenue: { amount: 75000, currency: 'USD' } as Money,
      averageTransactionValue: { amount: 50, currency: 'USD' } as Money,
      topPerformingItems: ['recipe-1', 'recipe-2', 'recipe-3'],
      underPerformingItems: ['recipe-4', 'recipe-5']
    };
  }

  private generateIntegratedInsights(
    menuAnalysis: any,
    costAnalysis: any[],
    costVariations: any
  ) {
    return {
      profitabilityInsights: [
        {
          type: 'opportunity' as const,
          severity: 'important' as const,
          title: 'High-margin items underutilized',
          description: `${menuAnalysis.puzzles.length} items have high profitability but low popularity`,
          affectedItems: menuAnalysis.puzzles.map((item: any) => item.recipeId),
          metrics: { count: menuAnalysis.puzzles.length },
          suggestions: ['Increase marketing', 'Improve menu positioning', 'Staff training']
        }
      ],
      costOptimizationInsights: [
        {
          type: 'trend' as const,
          severity: 'informational' as const,
          title: 'Ingredient cost volatility detected',
          description: `${costVariations.recipeVariances.length} recipes show significant cost variations`,
          affectedItems: costVariations.recipeVariances.map((v: any) => v.recipeId),
          metrics: { volatileRecipes: costVariations.recipeVariances.length },
          suggestions: ['Review supplier contracts', 'Consider ingredient substitutions']
        }
      ],
      marketingInsights: [
        {
          type: 'opportunity' as const,
          severity: 'important' as const,
          title: 'Star items drive revenue',
          description: `${menuAnalysis.stars.length} star items contribute significantly to revenue`,
          affectedItems: menuAnalysis.stars.map((item: any) => item.recipeId),
          metrics: { starCount: menuAnalysis.stars.length },
          suggestions: ['Feature prominently', 'Cross-sell opportunities', 'Premium positioning']
        }
      ],
      operationalInsights: [
        {
          type: 'risk' as const,
          severity: 'important' as const,
          title: 'Menu complexity concerns',
          description: `${menuAnalysis.dogs.length} underperforming items may impact operations`,
          affectedItems: menuAnalysis.dogs.map((item: any) => item.recipeId),
          metrics: { dogCount: menuAnalysis.dogs.length },
          suggestions: ['Simplify menu', 'Remove underperformers', 'Focus on winners']
        }
      ]
    };
  }

  private async generateIntegratedRecommendations(
    menuAnalysis: any,
    costAnalysis: any[],
    costVariations: any,
    context: any
  ) {
    // Generate recommendations based on integrated data
    const immediate: any[] = [];
    const shortTerm: any[] = [];
    const longTerm: any[] = [];

    // Add cost-based recommendations
    for (const variance of costVariations.recipeVariances.slice(0, 3)) {
      if (variance.significance === 'critical' || variance.significance === 'major') {
        immediate.push({
          recipeId: variance.recipeId,
          recipeName: variance.recipeName,
          currentClassification: 'DOG' as const,
          recommendationType: 'investigate' as const,
          priority: 'high' as const,
          impact: 'high' as const,
          effort: 'medium' as const,
          title: `Address cost increase for ${variance.recipeName}`,
          description: `Cost has increased by ${variance.percentageVariance.toFixed(1)}%`,
          rationale: 'Significant cost variance detected requiring immediate attention',
          expectedOutcome: 'Cost stabilization and margin protection',
          actionSteps: ['Review supplier pricing', 'Analyze cost drivers', 'Implement corrective measures'],
          estimatedImpactRevenue: { amount: variance.absoluteVariance.amount * 10, currency: 'USD' },
          timeframe: '1-2 weeks',
          metrics: ['Cost Variance', 'Profit Margin'],
          tags: ['cost-management', 'urgent']
        });
      }
    }

    // Add menu performance recommendations
    for (const star of menuAnalysis.stars.slice(0, 2)) {
      shortTerm.push({
        recipeId: star.recipeId,
        recipeName: star.recipeName,
        currentClassification: 'STAR' as const,
        recommendationType: 'promote' as const,
        priority: 'medium' as const,
        impact: 'high' as const,
        effort: 'low' as const,
        title: `Maximize ${star.recipeName} potential`,
        description: 'Leverage this high-performing item for increased revenue',
        rationale: 'High popularity and profitability indicate strong customer acceptance',
        expectedOutcome: 'Increased revenue and customer satisfaction',
        actionSteps: ['Feature in marketing', 'Cross-sell opportunities', 'Monitor performance'],
        estimatedImpactRevenue: { amount: star.totalRevenue.amount * 0.15, currency: 'USD' },
        timeframe: '2-4 weeks',
        metrics: ['Revenue Growth', 'Sales Volume'],
        tags: ['star', 'revenue-growth']
      });
    }

    return {
      immediate,
      shortTerm,
      longTerm,
      estimatedImpact: {
        revenueIncrease: { amount: 15000, currency: 'USD' } as Money,
        costSavings: { amount: 5000, currency: 'USD' } as Money,
        profitImprovement: { amount: 20000, currency: 'USD' } as Money
      }
    };
  }

  private assessIntegratedDataQuality(menuAnalysis: any, costAnalysis: any[], salesData: any) {
    return {
      salesDataCompleteness: 0.95,
      costDataAccuracy: costAnalysis.length > 0 ? 
        costAnalysis.reduce((sum, analysis) => sum + analysis.value.confidence, 0) / costAnalysis.length : 0,
      overallConfidence: menuAnalysis.confidence || 0.8,
      dataGaps: costAnalysis.length < 10 ? ['Limited cost analysis data'] : []
    };
  }

  private calculateAverageFoodCostPercentage(costResults: any[]): number {
    if (costResults.length === 0) return 0;
    
    const foodCostPercentages = costResults.map(result => {
      const breakdown = result.value.breakdown;
      if (breakdown.totalRevenue?.amount > 0) {
        return (breakdown.totalDirectCost.amount / breakdown.totalRevenue.amount) * 100;
      }
      return 0;
    });
    
    return foodCostPercentages.reduce((sum, pct) => sum + pct, 0) / foodCostPercentages.length;
  }

  private identifyHighRiskItems(costVariations: any): string[] {
    return costVariations.recipeVariances
      .filter((variance: any) => variance.significance === 'critical' || variance.significance === 'major')
      .map((variance: any) => variance.recipeId);
  }

  private calculateCostOptimizationOpportunities(costResults: any[]): Money {
    // Estimate potential savings from cost optimization
    const totalCosts = costResults.reduce((sum, result) => 
      sum + result.value.breakdown.totalRecipeCost.amount, 0);
    
    // Assume 5% optimization potential
    return { amount: totalCosts * 0.05, currency: 'USD' };
  }

  private calculateKPIs(current: any, previous: any) {
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return 0;
      return ((current - previous) / previous) * 100;
    };

    const getTrend = (changePercent: number): 'up' | 'down' | 'stable' => {
      if (Math.abs(changePercent) < 2) return 'stable';
      return changePercent > 0 ? 'up' : 'down';
    };

    return {
      totalRevenue: {
        current: current.totalRevenue,
        previous: previous.totalRevenue,
        changePercent: calculateChange(current.totalRevenue.amount, previous.totalRevenue.amount),
        trend: getTrend(calculateChange(current.totalRevenue.amount, previous.totalRevenue.amount))
      },
      averageItemProfitability: {
        current: current.overallProfitMargin,
        previous: previous.overallProfitMargin,
        changePercent: calculateChange(current.overallProfitMargin, previous.overallProfitMargin),
        trend: getTrend(calculateChange(current.overallProfitMargin, previous.overallProfitMargin))
      },
      menuMixOptimization: {
        current: (current.stars.length / current.totalItems) * 100,
        target: 25, // 25% stars target
        improvement: 0 // Would calculate based on recommendations
      },
      costVariability: {
        current: 5.2, // Mock average cost variance percentage
        previous: 6.1,
        stability: 'improving' as const
      }
    };
  }

  private calculateClassificationBreakdown(analysis: any) {
    const totalRevenue = analysis.totalRevenue.amount;
    
    return {
      stars: {
        count: analysis.stars.length,
        revenueContribution: analysis.stars.reduce((sum: number, item: any) => 
          sum + item.totalRevenue.amount, 0) / totalRevenue * 100
      },
      plowhorses: {
        count: analysis.plowhorses.length,
        revenueContribution: analysis.plowhorses.reduce((sum: number, item: any) => 
          sum + item.totalRevenue.amount, 0) / totalRevenue * 100
      },
      puzzles: {
        count: analysis.puzzles.length,
        revenueContribution: analysis.puzzles.reduce((sum: number, item: any) => 
          sum + item.totalRevenue.amount, 0) / totalRevenue * 100
      },
      dogs: {
        count: analysis.dogs.length,
        revenueContribution: analysis.dogs.reduce((sum: number, item: any) => 
          sum + item.totalRevenue.amount, 0) / totalRevenue * 100
      }
    };
  }

  private async getActiveAlertsCount(context: any) {
    // This would query the database for active alerts
    // For now, return mock data
    return {
      critical: 2,
      high: 5,
      medium: 12,
      low: 8
    };
  }

  private async generateTrendData(
    period: { start: Date; end: Date },
    locationIds?: string[],
    context?: any
  ): Promise<MenuEngineeringMetrics['trends']> {
    // This would generate actual trend data from the database
    // For now, return mock data
    const days = Math.ceil((period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60 * 24));
    const revenueByDay = [];
    const profitabilityByDay = [];
    const costVarianceByDay = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(period.start.getTime() + i * 24 * 60 * 60 * 1000);
      revenueByDay.push({
        date,
        revenue: { amount: 2000 + Math.random() * 1000, currency: 'USD' } as Money
      });
      profitabilityByDay.push({
        date,
        profitMargin: 25 + Math.random() * 10
      });
      costVarianceByDay.push({
        date,
        variance: Math.random() * 10 - 5
      });
    }
    
    return {
      revenueByDay,
      profitabilityByDay,
      costVarianceByDay,
      topPerformers: [
        { recipeId: 'recipe-1', name: 'Top Recipe 1', score: 95 },
        { recipeId: 'recipe-2', name: 'Top Recipe 2', score: 89 },
        { recipeId: 'recipe-3', name: 'Top Recipe 3', score: 85 }
      ]
    };
  }

  private createImplementationPhases(
    recommendations: any,
    timeframe: number,
    riskTolerance: string,
    capacity: string
  ) {
    // Create phases based on recommendations and constraints
    return [
      {
        phaseId: 'phase-1',
        name: 'Quick Wins',
        description: 'Low-effort, high-impact improvements',
        duration: Math.floor(timeframe * 0.2),
        recommendations: recommendations.quickWins,
        estimatedImpact: { amount: 5000, currency: 'USD' } as Money,
        dependencies: [],
        status: 'planned' as const
      },
      {
        phaseId: 'phase-2',
        name: 'Menu Optimization',
        description: 'Core menu engineering improvements',
        duration: Math.floor(timeframe * 0.5),
        recommendations: recommendations.highPriority,
        estimatedImpact: { amount: 15000, currency: 'USD' } as Money,
        dependencies: ['phase-1'],
        status: 'planned' as const
      },
      {
        phaseId: 'phase-3',
        name: 'Strategic Initiatives',
        description: 'Long-term strategic improvements',
        duration: Math.floor(timeframe * 0.3),
        recommendations: recommendations.strategicInitiatives,
        estimatedImpact: { amount: 10000, currency: 'USD' } as Money,
        dependencies: ['phase-2'],
        status: 'planned' as const
      }
    ];
  }

  private defineSuccessCriteria(objectives: any) {
    return [
      {
        metric: 'Revenue Growth',
        target: objectives.revenueIncrease?.amount || 10000,
        unit: 'USD',
        measurementFrequency: 'weekly' as const
      },
      {
        metric: 'Profit Margin Improvement',
        target: objectives.profitMarginImprovement || 5,
        unit: '%',
        measurementFrequency: 'weekly' as const
      }
    ];
  }

  private assessOptimizationRisks(phases: any[], riskTolerance: string) {
    return [
      {
        risk: 'Customer resistance to menu changes',
        probability: 'medium' as const,
        impact: 'medium' as const,
        mitigation: 'Gradual implementation and customer feedback collection'
      },
      {
        risk: 'Supplier cost increases',
        probability: 'low' as const,
        impact: 'high' as const,
        mitigation: 'Contract negotiations and alternative supplier identification'
      }
    ];
  }

  private createImplementationTimeline(phases: any[], totalTimeframe: number) {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + totalTimeframe * 24 * 60 * 60 * 1000);
    
    return {
      startDate,
      endDate,
      milestones: [
        {
          date: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000),
          description: 'Phase 1 Quick Wins Completed',
          deliverables: ['Menu positioning updates', 'Staff training completion']
        },
        {
          date: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
          description: 'Phase 2 Menu Optimization Completed',
          deliverables: ['Menu repricing', 'Item reformulation', 'Cost optimization']
        }
      ]
    };
  }

  private async getAnalysisById(analysisId: string, context: any): Promise<any> {
    // This would retrieve analysis from cache or database
    // For now, return mock data
    return null;
  }

  private initializeHealthStatus(): MenuEngineeringServiceStatus {
    return {
      timestamp: new Date(),
      services: {
        posIntegration: {
          status: 'healthy',
          lastUpdate: new Date(),
          errorRate: 0,
          responseTime: 150
        },
        menuAnalytics: {
          status: 'healthy',
          lastAnalysis: new Date(),
          cacheHitRate: 85,
          processingTime: 2500
        },
        costingEngine: {
          status: 'healthy',
          lastCostUpdate: new Date(),
          dataFreshness: 0.95,
          alertsActive: 3
        }
      },
      dataStatus: {
        salesDataHealth: 0.95,
        costDataHealth: 0.90,
        lastSyncTime: new Date(),
        pendingUpdates: 0,
        dataGaps: []
      },
      performance: {
        totalRecipesTracked: 150,
        activeAlerts: 3,
        dailyTransactionsProcessed: 1250,
        avgAnalysisTime: 2.5,
        systemLoad: 0.3
      },
      issues: []
    };
  }

  private async updateServiceHealth(): Promise<void> {
    this.healthStatus.timestamp = new Date();
    
    // Update cache metrics
    const cacheMetrics = await this.cache.getMetrics();
    this.healthStatus.services.menuAnalytics.cacheHitRate = cacheMetrics.combined.overallHitRate;
    
    // Update other service health metrics
    // This would involve actual health checks in a real implementation
  }

  private startHealthMonitoring(): void {
    // Start periodic health monitoring
    setInterval(async () => {
      try {
        await this.updateServiceHealth();
      } catch (error) {
        console.error(`[${this.serviceName}] Health monitoring error:`, error);
      }
    }, 60000); // Every minute
  }
}

/**
 * Create Menu Engineering Integration Service with default configuration
 */
export function createMenuEngineeringIntegrationService(
  config?: Partial<MenuEngineeringModuleConfig>
): MenuEngineeringIntegrationService {
  return new MenuEngineeringIntegrationService(config);
}

/**
 * Export service creator functions for dependency injection
 */
export {
  createPOSIntegrationService,
  createMenuEngineeringService,
  createEnhancedRecipeCostingService,
  createEnhancedCacheLayer
};