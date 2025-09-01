/**
 * Menu Engineering Analytics Service
 * 
 * Provides comprehensive menu performance analysis using the Boston Matrix methodology.
 * Handles classification, recommendations, and statistical analysis for menu optimization.
 */

import { BaseCalculator, CalculationResult, CalculationContext } from './calculations/base-calculator';
import { EnhancedCacheLayer, CacheDependency } from './cache/enhanced-cache-layer';
import { Recipe } from '@/lib/types/recipe';
import { Money } from '@/lib/types/common';
import { SalesTransaction } from './pos-integration-service';
import { z } from 'zod';

// ====== TYPE DEFINITIONS ======

/**
 * Menu Engineering Classification (Boston Matrix)
 */
export type MenuClassification = 'STAR' | 'PLOWHORSES' | 'PUZZLE' | 'DOG';

/**
 * Analysis period types
 */
export type AnalysisPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

/**
 * Menu item performance data
 */
export interface MenuItemPerformance {
  recipeId: string;
  recipeName: string;
  recipeCode: string;
  category?: string;
  // Sales metrics
  totalSales: number;
  totalRevenue: Money;
  totalQuantitySold: number;
  averagePrice: Money;
  // Cost metrics
  totalFoodCost: Money;
  averageFoodCost: Money;
  totalGrossProfit: Money;
  averageProfitMargin: number;
  // Performance scores (0-100)
  popularityScore: number;
  profitabilityScore: number;
  // Rankings
  popularityRank: number;
  profitabilityRank: number;
  // Classification
  classification: MenuClassification;
  // Confidence and reliability
  dataQuality: number; // 0-1 confidence in data accuracy
  sampleSize: number;
  // Trends
  salesTrend: 'increasing' | 'decreasing' | 'stable';
  profitabilityTrend: 'increasing' | 'decreasing' | 'stable';
}

/**
 * Menu analysis result
 */
export interface MenuAnalysisResult {
  analysisId: string;
  analysisDate: Date;
  periodType: AnalysisPeriod;
  periodStart: Date;
  periodEnd: Date;
  locationId?: string;
  locationName?: string;
  // Overall metrics
  totalItems: number;
  totalSales: number;
  totalRevenue: Money;
  totalGrossProfit: Money;
  overallProfitMargin: number;
  // Performance breakdown by classification
  stars: MenuItemPerformance[];
  plowhorses: MenuItemPerformance[];
  puzzles: MenuItemPerformance[];
  dogs: MenuItemPerformance[];
  // Summary statistics
  averagePopularityScore: number;
  averageProfitabilityScore: number;
  // Analysis metadata
  dataQuality: number;
  confidence: number;
  recommendations: RecommendationSet;
  insights: AnalysisInsight[];
}

/**
 * Recommendation types
 */
export type RecommendationType = 
  | 'promote' 
  | 'reposition' 
  | 'reprice' 
  | 'reformulate' 
  | 'remove' 
  | 'feature' 
  | 'bundle' 
  | 'investigate';

/**
 * Menu recommendation
 */
export interface MenuRecommendation {
  recipeId: string;
  recipeName: string;
  currentClassification: MenuClassification;
  recommendationType: RecommendationType;
  priority: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  rationale: string;
  expectedOutcome: string;
  actionSteps: string[];
  estimatedImpactRevenue?: Money;
  estimatedImpactProfit?: Money;
  timeframe: string;
  metrics: string[];
  tags: string[];
}

/**
 * Recommendation set
 */
export interface RecommendationSet {
  totalRecommendations: number;
  highPriority: MenuRecommendation[];
  mediumPriority: MenuRecommendation[];
  lowPriority: MenuRecommendation[];
  quickWins: MenuRecommendation[];
  strategicInitiatives: MenuRecommendation[];
}

/**
 * Analysis insights
 */
export interface AnalysisInsight {
  type: 'trend' | 'anomaly' | 'opportunity' | 'risk' | 'correlation';
  severity: 'critical' | 'important' | 'informational';
  title: string;
  description: string;
  affectedItems: string[];
  metrics: Record<string, number>;
  suggestions: string[];
}

/**
 * Menu engineering configuration
 */
export interface MenuEngineeeringConfig {
  popularityThreshold: number; // Percentile threshold for high popularity (default: 70)
  profitabilityThreshold: number; // Percentile threshold for high profitability (default: 70)
  minimumSampleSize: number; // Minimum sales required for reliable analysis (default: 10)
  dataQualityThreshold: number; // Minimum data quality score (default: 0.7)
  analysisLookbackDays: number; // Default lookback period for analysis (default: 30)
  seasonalAdjustment: boolean; // Apply seasonal adjustments (default: true)
  outlierDetection: boolean; // Remove statistical outliers (default: true)
}

// ====== ZOD VALIDATION SCHEMAS ======

export const MenuAnalysisInputSchema = z.object({
  periodStart: z.date(),
  periodEnd: z.date(),
  locationIds: z.array(z.string()).optional(),
  recipeIds: z.array(z.string()).optional(),
  includeInactive: z.boolean().optional(),
  config: z.object({
    popularityThreshold: z.number().min(50).max(95).optional(),
    profitabilityThreshold: z.number().min(50).max(95).optional(),
    minimumSampleSize: z.number().positive().optional(),
    dataQualityThreshold: z.number().min(0.1).max(1).optional(),
    analysisLookbackDays: z.number().positive().optional(),
    seasonalAdjustment: z.boolean().optional(),
    outlierDetection: z.boolean().optional()
  }).optional()
});

export const PopularityCalculationInputSchema = z.object({
  salesData: z.array(z.object({
    recipeId: z.string(),
    quantitySold: z.number().min(0),
    saleDate: z.date()
  })),
  periodStart: z.date(),
  periodEnd: z.date(),
  config: z.object({
    seasonalAdjustment: z.boolean().optional(),
    outlierDetection: z.boolean().optional()
  }).optional()
});

export const ProfitabilityCalculationInputSchema = z.object({
  salesData: z.array(z.object({
    recipeId: z.string(),
    grossProfit: z.number(),
    netRevenue: z.number().positive(),
    saleDate: z.date()
  })),
  periodStart: z.date(),
  periodEnd: z.date(),
  config: z.object({
    outlierDetection: z.boolean().optional()
  }).optional()
});

// ====== INPUT/OUTPUT INTERFACES ======

export interface AnalyzeMenuPerformanceInput {
  periodStart: Date;
  periodEnd: Date;
  locationIds?: string[];
  recipeIds?: string[];
  includeInactive?: boolean;
  config?: Partial<MenuEngineeeringConfig>;
}

export interface ClassifyMenuItemsInput {
  itemPerformances: MenuItemPerformance[];
  config?: Partial<MenuEngineeeringConfig>;
}

export interface GenerateRecommendationsInput {
  analysis: MenuAnalysisResult;
  businessRules?: {
    maxRecommendations?: number;
    focusAreas?: RecommendationType[];
    excludeTypes?: RecommendationType[];
  };
  contextData?: {
    seasonality?: Record<string, number>;
    competitorData?: Record<string, any>;
    marketTrends?: Record<string, any>;
  };
}

export interface CalculatePopularityScoreInput {
  salesData: Array<{
    recipeId: string;
    quantitySold: number;
    saleDate: Date;
  }>;
  periodStart: Date;
  periodEnd: Date;
  config?: {
    seasonalAdjustment?: boolean;
    outlierDetection?: boolean;
  };
}

export interface CalculateProfitabilityScoreInput {
  salesData: Array<{
    recipeId: string;
    grossProfit: number;
    netRevenue: number;
    saleDate: Date;
  }>;
  periodStart: Date;
  periodEnd: Date;
  config?: {
    outlierDetection?: boolean;
  };
}

// ====== MENU ENGINEERING ANALYTICS SERVICE ======

/**
 * Menu Engineering Analytics Service for performance analysis and optimization
 */
export class MenuEngineeringService extends BaseCalculator {
  protected serviceName = 'MenuEngineeringService';
  
  private defaultConfig: MenuEngineeeringConfig = {
    popularityThreshold: 70,
    profitabilityThreshold: 70,
    minimumSampleSize: 10,
    dataQualityThreshold: 0.7,
    analysisLookbackDays: 30,
    seasonalAdjustment: true,
    outlierDetection: true
  };

  constructor(
    private cache: EnhancedCacheLayer,
    private config?: Partial<MenuEngineeeringConfig>
  ) {
    super();
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }

  /**
   * Analyze comprehensive menu performance with Boston Matrix classification
   */
  async analyzeMenuPerformance(input: AnalyzeMenuPerformanceInput): Promise<CalculationResult<MenuAnalysisResult>> {
    return this.executeCalculation('analyzeMenuPerformance', input, async (context) => {
      // Validate input
      const validatedInput = MenuAnalysisInputSchema.parse(input);
      const config = { ...this.defaultConfig, ...input.config };

      // Get sales data for the analysis period
      const salesData = await this.getSalesDataForPeriod(
        validatedInput.periodStart,
        validatedInput.periodEnd,
        validatedInput.locationIds,
        validatedInput.recipeIds,
        context
      );

      if (salesData.length === 0) {
        throw this.createError(
          'No sales data found for the specified period',
          'NO_SALES_DATA',
          context
        );
      }

      // Calculate individual item performances
      const itemPerformances = await this.calculateItemPerformances(
        salesData,
        validatedInput.periodStart,
        validatedInput.periodEnd,
        config,
        context
      );

      // Filter items with sufficient data quality
      const qualityItems = itemPerformances.filter(
        item => item.dataQuality >= config.dataQualityThreshold &&
                item.sampleSize >= config.minimumSampleSize
      );

      if (qualityItems.length === 0) {
        throw this.createError(
          'Insufficient data quality for analysis',
          'INSUFFICIENT_DATA_QUALITY',
          context
        );
      }

      // Classify items using Boston Matrix
      const classifiedItems = await this.classifyMenuItems({
        itemPerformances: qualityItems,
        config
      });

      // Calculate overall metrics
      const overallMetrics = this.calculateOverallMetrics(qualityItems);

      // Generate recommendations
      const analysisResult: MenuAnalysisResult = {
        analysisId: this.generateAnalysisId(),
        analysisDate: new Date(),
        periodType: this.determinePeriodType(validatedInput.periodStart, validatedInput.periodEnd),
        periodStart: validatedInput.periodStart,
        periodEnd: validatedInput.periodEnd,
        locationId: validatedInput.locationIds?.[0],
        locationName: await this.getLocationName(validatedInput.locationIds?.[0], context),
        totalItems: qualityItems.length,
        totalSales: overallMetrics.totalSales,
        totalRevenue: overallMetrics.totalRevenue,
        totalGrossProfit: overallMetrics.totalGrossProfit,
        overallProfitMargin: overallMetrics.overallProfitMargin,
        stars: classifiedItems.value.filter(item => item.classification === 'STAR'),
        plowhorses: classifiedItems.value.filter(item => item.classification === 'PLOWHORSES'),
        puzzles: classifiedItems.value.filter(item => item.classification === 'PUZZLE'),
        dogs: classifiedItems.value.filter(item => item.classification === 'DOG'),
        averagePopularityScore: this.calculateAverage(qualityItems.map(item => item.popularityScore)),
        averageProfitabilityScore: this.calculateAverage(qualityItems.map(item => item.profitabilityScore)),
        dataQuality: this.calculateAverage(qualityItems.map(item => item.dataQuality)),
        confidence: this.calculateAnalysisConfidence(qualityItems),
        recommendations: { totalRecommendations: 0, highPriority: [], mediumPriority: [], lowPriority: [], quickWins: [], strategicInitiatives: [] },
        insights: []
      };

      // Generate recommendations
      const recommendationsResult = await this.generateRecommendations({
        analysis: analysisResult
      });
      analysisResult.recommendations = recommendationsResult.value;

      // Generate insights
      analysisResult.insights = await this.generateAnalysisInsights(analysisResult, salesData, context);

      // Cache the result
      const dependencies: CacheDependency[] = [
        { type: 'entity', identifier: 'menu_analysis' },
        { type: 'entity', identifier: `analysis_${analysisResult.analysisId}` },
        { type: 'table', identifier: 'sales_transactions' }
      ];

      await this.cache.getOrCompute(
        this.serviceName,
        'analyzeMenuPerformance',
        { analysisId: analysisResult.analysisId },
        async () => this.createResult(analysisResult, context),
        dependencies,
        context.userId
      );

      return analysisResult;
    });
  }

  /**
   * Classify menu items using Boston Matrix methodology
   */
  async classifyMenuItems(input: ClassifyMenuItemsInput): Promise<CalculationResult<MenuItemPerformance[]>> {
    return this.executeCalculation('classifyMenuItems', input, async (context) => {
      const config = { ...this.defaultConfig, ...input.config };
      
      if (input.itemPerformances.length === 0) {
        return [];
      }

      // Calculate threshold values based on percentiles
      const popularityScores = input.itemPerformances.map(item => item.popularityScore).sort((a, b) => b - a);
      const profitabilityScores = input.itemPerformances.map(item => item.profitabilityScore).sort((a, b) => b - a);

      const popularityThreshold = this.calculatePercentile(popularityScores, config.popularityThreshold);
      const profitabilityThreshold = this.calculatePercentile(profitabilityScores, config.profitabilityThreshold);

      // Classify each item
      const classifiedItems = input.itemPerformances.map(item => {
        const isHighPopularity = item.popularityScore >= popularityThreshold;
        const isHighProfitability = item.profitabilityScore >= profitabilityThreshold;

        let classification: MenuClassification;
        if (isHighPopularity && isHighProfitability) {
          classification = 'STAR';
        } else if (isHighPopularity && !isHighProfitability) {
          classification = 'PLOWHORSES';
        } else if (!isHighPopularity && isHighProfitability) {
          classification = 'PUZZLE';
        } else {
          classification = 'DOG';
        }

        return {
          ...item,
          classification
        };
      });

      return classifiedItems;
    });
  }

  /**
   * Generate AI-powered optimization recommendations
   */
  async generateRecommendations(input: GenerateRecommendationsInput): Promise<CalculationResult<RecommendationSet>> {
    return this.executeCalculation('generateRecommendations', input, async (context) => {
      const recommendations: MenuRecommendation[] = [];
      const businessRules = input.businessRules || {};
      const maxRecommendations = businessRules.maxRecommendations || 20;

      // Process each classification with specific strategies
      
      // STARS: Promote and maintain
      for (const star of input.analysis.stars.slice(0, 5)) {
        recommendations.push(await this.createStarRecommendation(star, input.analysis, context));
      }

      // PLOWHORSES: Improve profitability
      for (const plowhorse of input.analysis.plowhorses.slice(0, 5)) {
        recommendations.push(await this.createPlowhorseRecommendation(plowhorse, input.analysis, context));
      }

      // PUZZLES: Increase popularity
      for (const puzzle of input.analysis.puzzles.slice(0, 5)) {
        recommendations.push(await this.createPuzzleRecommendation(puzzle, input.analysis, context));
      }

      // DOGS: Consider removal or major changes
      for (const dog of input.analysis.dogs.slice(0, 3)) {
        recommendations.push(await this.createDogRecommendation(dog, input.analysis, context));
      }

      // Sort by priority and impact
      recommendations.sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        const impactWeight = { high: 3, medium: 2, low: 1 };
        
        const scoreA = priorityWeight[a.priority] * impactWeight[a.impact];
        const scoreB = priorityWeight[b.priority] * impactWeight[b.impact];
        
        return scoreB - scoreA;
      });

      // Categorize recommendations
      const limitedRecommendations = recommendations.slice(0, maxRecommendations);
      const highPriority = limitedRecommendations.filter(r => r.priority === 'high');
      const mediumPriority = limitedRecommendations.filter(r => r.priority === 'medium');
      const lowPriority = limitedRecommendations.filter(r => r.priority === 'low');
      const quickWins = limitedRecommendations.filter(r => r.effort === 'low' && r.impact !== 'low');
      const strategicInitiatives = limitedRecommendations.filter(r => r.effort === 'high' && r.impact === 'high');

      const recommendationSet: RecommendationSet = {
        totalRecommendations: limitedRecommendations.length,
        highPriority,
        mediumPriority,
        lowPriority,
        quickWins,
        strategicInitiatives
      };

      return recommendationSet;
    });
  }

  /**
   * Calculate popularity score (0-100) based on sales volume
   */
  async calculatePopularityScore(input: CalculatePopularityScoreInput): Promise<CalculationResult<Record<string, number>>> {
    return this.executeCalculation('calculatePopularityScore', input, async (context) => {
      const validatedInput = PopularityCalculationInputSchema.parse(input);
      const config = input.config || {};

      // Group sales by recipe
      const recipeGroups = new Map<string, number[]>();
      validatedInput.salesData.forEach(sale => {
        if (!recipeGroups.has(sale.recipeId)) {
          recipeGroups.set(sale.recipeId, []);
        }
        recipeGroups.get(sale.recipeId)!.push(sale.quantitySold);
      });

      // Calculate raw scores
      const rawScores: Record<string, number> = {};
      const totalQuantities: number[] = [];

      recipeGroups.forEach((quantities, recipeId) => {
        let totalQuantity = quantities.reduce((sum, qty) => sum + qty, 0);
        
        // Apply seasonal adjustment if configured
        if (config.seasonalAdjustment) {
          totalQuantity = this.applySeasonalAdjustment(totalQuantity, validatedInput.periodStart);
        }
        
        // Apply outlier detection if configured
        if (config.outlierDetection) {
          const cleanQuantities = this.removeOutliers(quantities);
          totalQuantity = cleanQuantities.reduce((sum, qty) => sum + qty, 0);
        }
        
        rawScores[recipeId] = totalQuantity;
        totalQuantities.push(totalQuantity);
      });

      // Normalize scores to 0-100 range
      const maxQuantity = Math.max(...totalQuantities);
      const minQuantity = Math.min(...totalQuantities);
      const range = maxQuantity - minQuantity;

      const normalizedScores: Record<string, number> = {};
      Object.entries(rawScores).forEach(([recipeId, score]) => {
        if (range === 0) {
          normalizedScores[recipeId] = 50; // All items have same popularity
        } else {
          normalizedScores[recipeId] = ((score - minQuantity) / range) * 100;
        }
      });

      return normalizedScores;
    });
  }

  /**
   * Calculate profitability score (0-100) based on profit margins
   */
  async calculateProfitabilityScore(input: CalculateProfitabilityScoreInput): Promise<CalculationResult<Record<string, number>>> {
    return this.executeCalculation('calculateProfitabilityScore', input, async (context) => {
      const validatedInput = ProfitabilityCalculationInputSchema.parse(input);
      const config = input.config || {};

      // Group sales by recipe and calculate profit margins
      const recipeProfitMargins = new Map<string, number[]>();
      validatedInput.salesData.forEach(sale => {
        if (sale.netRevenue > 0) {
          const profitMargin = (sale.grossProfit / sale.netRevenue) * 100;
          
          if (!recipeProfitMargins.has(sale.recipeId)) {
            recipeProfitMargins.set(sale.recipeId, []);
          }
          recipeProfitMargins.get(sale.recipeId)!.push(profitMargin);
        }
      });

      // Calculate average profit margins
      const avgProfitMargins: Record<string, number> = {};
      const allMargins: number[] = [];

      recipeProfitMargins.forEach((margins, recipeId) => {
        let cleanMargins = margins;
        
        // Apply outlier detection if configured
        if (config.outlierDetection) {
          cleanMargins = this.removeOutliers(margins);
        }
        
        if (cleanMargins.length > 0) {
          const avgMargin = cleanMargins.reduce((sum, margin) => sum + margin, 0) / cleanMargins.length;
          avgProfitMargins[recipeId] = avgMargin;
          allMargins.push(avgMargin);
        }
      });

      // Normalize scores to 0-100 range
      const maxMargin = Math.max(...allMargins);
      const minMargin = Math.min(...allMargins);
      const range = maxMargin - minMargin;

      const normalizedScores: Record<string, number> = {};
      Object.entries(avgProfitMargins).forEach(([recipeId, margin]) => {
        if (range === 0) {
          normalizedScores[recipeId] = 50; // All items have same profitability
        } else {
          // Ensure minimum score of 0 and handle negative margins
          const normalizedScore = Math.max(0, ((margin - minMargin) / range) * 100);
          normalizedScores[recipeId] = normalizedScore;
        }
      });

      return normalizedScores;
    });
  }

  // ====== PRIVATE HELPER METHODS ======

  private generateAnalysisId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getSalesDataForPeriod(
    periodStart: Date,
    periodEnd: Date,
    locationIds?: string[],
    recipeIds?: string[],
    context?: CalculationContext
  ): Promise<SalesTransaction[]> {
    // This would query the database for sales transactions
    // For now, return mock data
    return [];
  }

  private async calculateItemPerformances(
    salesData: SalesTransaction[],
    periodStart: Date,
    periodEnd: Date,
    config: MenuEngineeeringConfig,
    context: CalculationContext
  ): Promise<MenuItemPerformance[]> {
    // Group sales by recipe
    const recipeGroups = new Map<string, SalesTransaction[]>();
    salesData.forEach(sale => {
      if (!recipeGroups.has(sale.recipeId!)) {
        recipeGroups.set(sale.recipeId!, []);
      }
      recipeGroups.get(sale.recipeId!)!.push(sale);
    });

    const performances: MenuItemPerformance[] = [];

    // Calculate popularity scores
    const popularityInput = {
      salesData: salesData.map(s => ({
        recipeId: s.recipeId || '',
        quantitySold: s.quantitySold,
        saleDate: s.saleDate
      })),
      periodStart,
      periodEnd,
      config: {
        seasonalAdjustment: config.seasonalAdjustment,
        outlierDetection: config.outlierDetection
      }
    };

    const popularityScores = await this.calculatePopularityScore(popularityInput);

    // Calculate profitability scores
    const profitabilityInput = {
      salesData: salesData
        .filter(s => s.grossProfit !== undefined && s.netRevenue > 0)
        .map(s => ({
          recipeId: s.recipeId || '',
          grossProfit: s.grossProfit!,
          netRevenue: s.netRevenue,
          saleDate: s.saleDate
        })),
      periodStart,
      periodEnd,
      config: {
        outlierDetection: config.outlierDetection
      }
    };

    const profitabilityScores = await this.calculateProfitabilityScore(profitabilityInput);

    // Build performance objects
    let rank = 1;
    recipeGroups.forEach((sales, recipeId) => {
      const totalSales = sales.length;
      const totalRevenue = this.createMoney(
        sales.reduce((sum, sale) => sum + sale.revenue, 0),
        'USD' // Default currency
      );
      const totalQuantitySold = sales.reduce((sum, sale) => sum + sale.quantitySold, 0);
      const averagePrice = this.createMoney(
        totalRevenue.amount / totalQuantitySold || 0,
        totalRevenue.currency
      );
      
      const totalFoodCost = this.createMoney(
        sales.reduce((sum, sale) => sum + (sale.calculatedFoodCost || 0), 0),
        'USD'
      );
      const averageFoodCost = this.createMoney(
        totalFoodCost.amount / totalSales || 0,
        totalFoodCost.currency
      );
      
      const totalGrossProfit = this.createMoney(
        sales.reduce((sum, sale) => sum + (sale.grossProfit || 0), 0),
        'USD'
      );
      
      const averageProfitMargin = totalRevenue.amount > 0 
        ? (totalGrossProfit.amount / totalRevenue.amount) * 100 
        : 0;

      const popularityScore = popularityScores.value[recipeId] || 0;
      const profitabilityScore = profitabilityScores.value[recipeId] || 0;

      const performance: MenuItemPerformance = {
        recipeId,
        recipeName: sales[0].recipeName || `Recipe ${recipeId}`,
        recipeCode: sales[0].recipeCode || '',
        totalSales,
        totalRevenue,
        totalQuantitySold,
        averagePrice,
        totalFoodCost,
        averageFoodCost,
        totalGrossProfit,
        averageProfitMargin,
        popularityScore,
        profitabilityScore,
        popularityRank: rank,
        profitabilityRank: rank,
        classification: 'DOG', // Will be set later
        dataQuality: this.calculateDataQuality(sales, totalSales),
        sampleSize: totalSales,
        salesTrend: this.calculateTrend(sales.map(s => ({ date: s.saleDate, value: s.quantitySold }))),
        profitabilityTrend: this.calculateTrend(sales.map(s => ({ date: s.saleDate, value: s.grossProfit || 0 })))
      };

      performances.push(performance);
      rank++;
    });

    // Update rankings
    this.updateRankings(performances);

    return performances;
  }

  private calculateOverallMetrics(items: MenuItemPerformance[]) {
    const totalSales = items.reduce((sum, item) => sum + item.totalSales, 0);
    const totalRevenue = items.reduce((sum, item) => sum + item.totalRevenue.amount, 0);
    const totalGrossProfit = items.reduce((sum, item) => sum + item.totalGrossProfit.amount, 0);
    const overallProfitMargin = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;

    return {
      totalSales,
      totalRevenue: this.createMoney(totalRevenue, 'USD'),
      totalGrossProfit: this.createMoney(totalGrossProfit, 'USD'),
      overallProfitMargin
    };
  }

  private calculateAverage(values: number[]): number {
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }

  private calculateAnalysisConfidence(items: MenuItemPerformance[]): number {
    const avgDataQuality = this.calculateAverage(items.map(item => item.dataQuality));
    const avgSampleSize = this.calculateAverage(items.map(item => item.sampleSize));
    
    // Confidence based on data quality and sample size
    const sampleSizeScore = Math.min(avgSampleSize / 50, 1); // Normalize to 0-1, 50 samples = full confidence
    return (avgDataQuality + sampleSizeScore) / 2;
  }

  private calculatePercentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))];
  }

  private calculateDataQuality(sales: SalesTransaction[], sampleSize: number): number {
    let qualityScore = 1.0;
    
    // Reduce score for small sample size
    if (sampleSize < 10) {
      qualityScore *= 0.5;
    } else if (sampleSize < 25) {
      qualityScore *= 0.8;
    }
    
    // Reduce score for missing data
    const missingDataPoints = sales.filter(sale => 
      !sale.grossProfit || !sale.calculatedFoodCost
    ).length;
    
    const missingDataRatio = missingDataPoints / sales.length;
    qualityScore *= (1 - missingDataRatio);
    
    return Math.max(0.1, qualityScore);
  }

  private calculateTrend(dataPoints: Array<{ date: Date; value: number }>): 'increasing' | 'decreasing' | 'stable' {
    if (dataPoints.length < 3) return 'stable';
    
    // Simple trend calculation using linear regression slope
    const n = dataPoints.length;
    const sortedData = dataPoints.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    sortedData.forEach((point, index) => {
      const x = index;
      const y = point.value;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    if (Math.abs(slope) < 0.1) return 'stable';
    return slope > 0 ? 'increasing' : 'decreasing';
  }

  private updateRankings(performances: MenuItemPerformance[]): void {
    // Sort by popularity and assign popularity ranks
    const popularitySorted = [...performances].sort((a, b) => b.popularityScore - a.popularityScore);
    popularitySorted.forEach((item, index) => {
      item.popularityRank = index + 1;
    });
    
    // Sort by profitability and assign profitability ranks
    const profitabilitySorted = [...performances].sort((a, b) => b.profitabilityScore - a.profitabilityScore);
    profitabilitySorted.forEach((item, index) => {
      item.profitabilityRank = index + 1;
    });
  }

  private applySeasonalAdjustment(value: number, periodStart: Date): number {
    // Simple seasonal adjustment - would be more sophisticated in real implementation
    const month = periodStart.getMonth();
    const seasonalFactors = [0.9, 0.9, 1.0, 1.0, 1.1, 1.2, 1.3, 1.2, 1.1, 1.0, 0.9, 1.0];
    return value / seasonalFactors[month];
  }

  private removeOutliers(values: number[]): number[] {
    if (values.length < 4) return values;
    
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return values.filter(value => value >= lowerBound && value <= upperBound);
  }

  private determinePeriodType(start: Date, end: Date): AnalysisPeriod {
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'daily';
    if (diffDays <= 7) return 'weekly';
    if (diffDays <= 31) return 'monthly';
    if (diffDays <= 92) return 'quarterly';
    if (diffDays <= 366) return 'yearly';
    return 'custom';
  }

  private async getLocationName(locationId?: string, context?: CalculationContext): Promise<string | undefined> {
    // This would query the database for location name
    return locationId ? `Location ${locationId}` : undefined;
  }

  private async generateAnalysisInsights(
    analysis: MenuAnalysisResult,
    salesData: SalesTransaction[],
    context: CalculationContext
  ): Promise<AnalysisInsight[]> {
    const insights: AnalysisInsight[] = [];
    
    // Insight 1: Classification distribution
    const classificationCounts = {
      STAR: analysis.stars.length,
      PLOWHORSES: analysis.plowhorses.length,
      PUZZLE: analysis.puzzles.length,
      DOG: analysis.dogs.length
    };
    
    if (classificationCounts.DOG > analysis.totalItems * 0.4) {
      insights.push({
        type: 'risk',
        severity: 'critical',
        title: 'High proportion of underperforming items',
        description: `${classificationCounts.DOG} items (${((classificationCounts.DOG / analysis.totalItems) * 100).toFixed(1)}%) are classified as Dogs, indicating poor performance in both popularity and profitability.`,
        affectedItems: analysis.dogs.map(item => item.recipeId),
        metrics: { dogCount: classificationCounts.DOG, percentage: (classificationCounts.DOG / analysis.totalItems) * 100 },
        suggestions: [
          'Review pricing strategy for underperforming items',
          'Consider removing or reformulating low-performing menu items',
          'Analyze why these items are not popular with customers'
        ]
      });
    }
    
    // Insight 2: Profitability opportunities
    if (analysis.puzzles.length > 0) {
      insights.push({
        type: 'opportunity',
        severity: 'important',
        title: 'High-margin items with low popularity',
        description: `${analysis.puzzles.length} items have high profitability but low popularity, representing untapped potential.`,
        affectedItems: analysis.puzzles.map(item => item.recipeId),
        metrics: { puzzleCount: analysis.puzzles.length },
        suggestions: [
          'Increase marketing and promotion for high-margin items',
          'Consider menu positioning and presentation improvements',
          'Train staff to recommend these profitable items'
        ]
      });
    }
    
    return insights;
  }

  private async createStarRecommendation(
    star: MenuItemPerformance,
    analysis: MenuAnalysisResult,
    context: CalculationContext
  ): Promise<MenuRecommendation> {
    return {
      recipeId: star.recipeId,
      recipeName: star.recipeName,
      currentClassification: 'STAR',
      recommendationType: 'promote',
      priority: 'high',
      impact: 'high',
      effort: 'low',
      title: `Promote ${star.recipeName}`,
      description: 'Feature this high-performing item to maximize revenue potential',
      rationale: `${star.recipeName} shows excellent performance in both popularity (${star.popularityScore.toFixed(1)}/100) and profitability (${star.profitabilityScore.toFixed(1)}/100).`,
      expectedOutcome: 'Increased revenue and profit margins through enhanced promotion of proven performer',
      actionSteps: [
        'Feature prominently on menu',
        'Train staff to recommend',
        'Consider premium positioning',
        'Monitor performance metrics'
      ],
      estimatedImpactRevenue: this.createMoney(star.totalRevenue.amount * 0.2, star.totalRevenue.currency),
      timeframe: '2-4 weeks',
      metrics: ['Total Revenue', 'Profit Margin', 'Sales Volume'],
      tags: ['star', 'promote', 'feature']
    };
  }

  private async createPlowhorseRecommendation(
    plowhorse: MenuItemPerformance,
    analysis: MenuAnalysisResult,
    context: CalculationContext
  ): Promise<MenuRecommendation> {
    return {
      recipeId: plowhorse.recipeId,
      recipeName: plowhorse.recipeName,
      currentClassification: 'PLOWHORSES',
      recommendationType: 'reprice',
      priority: 'medium',
      impact: 'medium',
      effort: 'low',
      title: `Improve profitability of ${plowhorse.recipeName}`,
      description: 'Increase profit margins through strategic pricing or cost reduction',
      rationale: `${plowhorse.recipeName} is popular (${plowhorse.popularityScore.toFixed(1)}/100) but has low profitability (${plowhorse.profitabilityScore.toFixed(1)}/100).`,
      expectedOutcome: 'Higher profit margins while maintaining popularity',
      actionSteps: [
        'Review ingredient costs',
        'Consider price increase of 5-10%',
        'Optimize portion sizes',
        'Source more cost-effective ingredients'
      ],
      estimatedImpactProfit: this.createMoney(plowhorse.totalGrossProfit.amount * 0.3, plowhorse.totalGrossProfit.currency),
      timeframe: '1-2 weeks',
      metrics: ['Profit Margin', 'Food Cost Percentage', 'Sales Volume'],
      tags: ['plowhorses', 'reprice', 'cost-reduction']
    };
  }

  private async createPuzzleRecommendation(
    puzzle: MenuItemPerformance,
    analysis: MenuAnalysisResult,
    context: CalculationContext
  ): Promise<MenuRecommendation> {
    return {
      recipeId: puzzle.recipeId,
      recipeName: puzzle.recipeName,
      currentClassification: 'PUZZLE',
      recommendationType: 'promote',
      priority: 'medium',
      impact: 'high',
      effort: 'medium',
      title: `Increase popularity of ${puzzle.recipeName}`,
      description: 'Boost sales of this profitable but underutilized item',
      rationale: `${puzzle.recipeName} has high profitability (${puzzle.profitabilityScore.toFixed(1)}/100) but low popularity (${puzzle.popularityScore.toFixed(1)}/100).`,
      expectedOutcome: 'Increased sales volume while maintaining high margins',
      actionSteps: [
        'Improve menu description and presentation',
        'Offer as daily special',
        'Staff training for recommendations',
        'Consider bundling with popular items'
      ],
      estimatedImpactRevenue: this.createMoney(puzzle.totalRevenue.amount * 0.5, puzzle.totalRevenue.currency),
      timeframe: '3-6 weeks',
      metrics: ['Sales Volume', 'Menu Mix Percentage', 'Customer Feedback'],
      tags: ['puzzle', 'promote', 'marketing']
    };
  }

  private async createDogRecommendation(
    dog: MenuItemPerformance,
    analysis: MenuAnalysisResult,
    context: CalculationContext
  ): Promise<MenuRecommendation> {
    return {
      recipeId: dog.recipeId,
      recipeName: dog.recipeName,
      currentClassification: 'DOG',
      recommendationType: 'investigate',
      priority: 'low',
      impact: 'medium',
      effort: 'high',
      title: `Evaluate ${dog.recipeName}`,
      description: 'Analyze reasons for poor performance and determine action',
      rationale: `${dog.recipeName} shows poor performance in both popularity (${dog.popularityScore.toFixed(1)}/100) and profitability (${dog.profitabilityScore.toFixed(1)}/100).`,
      expectedOutcome: 'Clear direction on whether to improve, reposition, or remove item',
      actionSteps: [
        'Conduct customer feedback analysis',
        'Review recipe formulation',
        'Assess competitive positioning',
        'Consider removal from menu'
      ],
      timeframe: '4-8 weeks',
      metrics: ['Customer Satisfaction', 'Food Cost Analysis', 'Menu Performance'],
      tags: ['dog', 'investigate', 'potential-removal']
    };
  }
}

/**
 * Create Menu Engineering Service instance with default configuration
 */
export function createMenuEngineeringService(
  cache: EnhancedCacheLayer, 
  config?: Partial<MenuEngineeeringConfig>
): MenuEngineeringService {
  return new MenuEngineeringService(cache, config);
}