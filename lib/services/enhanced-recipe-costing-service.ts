/**
 * Enhanced Recipe Costing Service
 * 
 * Provides real-time recipe cost calculations, dynamic pricing updates,
 * cost variance tracking, and proactive cost monitoring with alerts.
 */

import { BaseCalculator, CalculationResult, CalculationContext } from './calculations/base-calculator';
import { EnhancedCacheLayer, CacheDependency } from './cache/enhanced-cache-layer';
import { Recipe, Ingredient } from '@/lib/types/recipe';
import { Money } from '@/lib/types/common';
import { z } from 'zod';

// ====== TYPE DEFINITIONS ======

/**
 * Real-time cost calculation input
 */
export interface RealTimeCostCalculation {
  recipeId: string;
  ingredientCosts: IngredientCostSnapshot[];
  laborCosts: LaborCostSnapshot;
  overheadCosts: OverheadCostSnapshot;
  timestamp: Date;
  locationId?: string;
  supplierPreferences?: Record<string, string>;
}

/**
 * Current ingredient cost snapshot
 */
export interface IngredientCostSnapshot {
  ingredientId: string;
  ingredientName: string;
  currentUnitCost: Money;
  supplierId?: string;
  supplierName?: string;
  priceValidUntil?: Date;
  lastUpdated: Date;
  priceSource: 'supplier_catalog' | 'purchase_order' | 'invoice' | 'market_rate' | 'manual';
  confidence: number; // 0-1 confidence in price accuracy
}

/**
 * Labor cost snapshot
 */
export interface LaborCostSnapshot {
  standardLaborMinutes: number;
  hourlyLaborRate: Money;
  skillLevelMultiplier?: number;
  locationMultiplier?: number;
  totalLaborCost: Money;
}

/**
 * Overhead cost snapshot
 */
export interface OverheadCostSnapshot {
  utilityCostPerHour: Money;
  equipmentDepreciationCostPerHour: Money;
  facilityOverheadRate: number; // As percentage of direct costs
  totalOverheadCost: Money;
}

/**
 * Cost variance tracking data
 */
export interface CostVariance {
  recipeId: string;
  recipeName: string;
  varianceId: string;
  calculationDate: Date;
  previousCost: Money;
  currentCost: Money;
  absoluteVariance: Money;
  percentageVariance: number;
  varianceType: 'ingredient' | 'labor' | 'overhead' | 'total';
  affectedComponent?: string; // Specific ingredient or cost component
  reason?: string;
  significance: 'minor' | 'moderate' | 'major' | 'critical';
  alertGenerated: boolean;
}

/**
 * Cost threshold configuration
 */
export interface CostThreshold {
  id: string;
  recipeId?: string; // If null, applies to all recipes
  recipeCategory?: string; // If specified, applies to category
  thresholdType: 'absolute_increase' | 'percentage_increase' | 'absolute_cost' | 'margin_below';
  thresholdValue: number;
  currency?: string; // For absolute thresholds
  alertSeverity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  notificationChannels: ('email' | 'sms' | 'dashboard' | 'slack')[];
  createdBy: string;
  createdAt: Date;
}

/**
 * Cost alert
 */
export interface CostAlert {
  alertId: string;
  recipeId: string;
  recipeName: string;
  thresholdId: string;
  alertType: CostThreshold['thresholdType'];
  severity: CostThreshold['alertSeverity'];
  triggeredAt: Date;
  currentCost: Money;
  previousCost?: Money;
  thresholdValue: number;
  variance: number;
  message: string;
  recommendedActions: string[];
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * Recipe cost breakdown
 */
export interface RecipeCostBreakdown {
  recipeId: string;
  recipeName: string;
  calculatedAt: Date;
  locationId?: string;
  // Cost components
  ingredientCosts: Array<{
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unit: string;
    unitCost: Money;
    totalCost: Money;
    costPerPortion: Money;
  }>;
  laborCost: LaborCostSnapshot;
  overheadCost: OverheadCostSnapshot;
  // Totals
  totalDirectCost: Money;
  totalIndirectCost: Money;
  totalRecipeCost: Money;
  costPerPortion: Money;
  yield: number;
  // Margins and pricing
  suggestedSellingPrice?: Money;
  targetProfitMargin?: number;
  currentProfitMargin?: number;
  // Quality indicators
  dataFreshness: number; // 0-1, how fresh the cost data is
  confidence: number; // 0-1, confidence in calculation accuracy
}

/**
 * Inventory change event
 */
export interface InventoryChangeEvent {
  eventId: string;
  eventType: 'purchase' | 'adjustment' | 'supplier_update' | 'market_change';
  timestamp: Date;
  affectedIngredients: Array<{
    ingredientId: string;
    oldCost?: Money;
    newCost: Money;
    reason: string;
  }>;
  source: string;
  metadata?: Record<string, any>;
}

// ====== ZOD VALIDATION SCHEMAS ======

export const RealTimeCostCalculationSchema = z.object({
  recipeId: z.string().min(1, 'Recipe ID is required'),
  ingredientCosts: z.array(z.object({
    ingredientId: z.string().min(1),
    ingredientName: z.string().min(1),
    currentUnitCost: z.object({
      amount: z.number().min(0),
      currency: z.string().min(3).max(3)
    }),
    supplierId: z.string().optional(),
    supplierName: z.string().optional(),
    priceValidUntil: z.date().optional(),
    lastUpdated: z.date(),
    priceSource: z.enum(['supplier_catalog', 'purchase_order', 'invoice', 'market_rate', 'manual']),
    confidence: z.number().min(0).max(1)
  })),
  laborCosts: z.object({
    standardLaborMinutes: z.number().min(0),
    hourlyLaborRate: z.object({
      amount: z.number().min(0),
      currency: z.string()
    }),
    skillLevelMultiplier: z.number().optional(),
    locationMultiplier: z.number().optional(),
    totalLaborCost: z.object({
      amount: z.number().min(0),
      currency: z.string()
    })
  }),
  overheadCosts: z.object({
    utilityCostPerHour: z.object({
      amount: z.number().min(0),
      currency: z.string()
    }),
    equipmentDepreciationCostPerHour: z.object({
      amount: z.number().min(0),
      currency: z.string()
    }),
    facilityOverheadRate: z.number().min(0).max(100),
    totalOverheadCost: z.object({
      amount: z.number().min(0),
      currency: z.string()
    })
  }),
  timestamp: z.date(),
  locationId: z.string().optional(),
  supplierPreferences: z.record(z.string()).optional()
});

export const CostThresholdSchema = z.object({
  recipeId: z.string().optional(),
  recipeCategory: z.string().optional(),
  thresholdType: z.enum(['absolute_increase', 'percentage_increase', 'absolute_cost', 'margin_below']),
  thresholdValue: z.number().positive(),
  currency: z.string().optional(),
  alertSeverity: z.enum(['low', 'medium', 'high', 'critical']),
  isActive: z.boolean(),
  notificationChannels: z.array(z.enum(['email', 'sms', 'dashboard', 'slack'])),
  createdBy: z.string().min(1)
});

export const InventoryChangeEventSchema = z.object({
  eventType: z.enum(['purchase', 'adjustment', 'supplier_update', 'market_change']),
  timestamp: z.date(),
  affectedIngredients: z.array(z.object({
    ingredientId: z.string().min(1),
    oldCost: z.object({
      amount: z.number(),
      currency: z.string()
    }).optional(),
    newCost: z.object({
      amount: z.number().min(0),
      currency: z.string()
    }),
    reason: z.string().min(1)
  })),
  source: z.string().min(1),
  metadata: z.record(z.any()).optional()
});

// ====== INPUT/OUTPUT INTERFACES ======

export interface CalculateRealTimeCostInput {
  recipeId: string;
  locationId?: string;
  usePreferredSuppliers?: boolean;
  includeLaborCosts?: boolean;
  includeOverheadCosts?: boolean;
  targetDate?: Date; // For future cost projections
  customIngredientPrices?: Record<string, Money>;
}

export interface UpdateCostsFromInventoryInput {
  inventoryChanges: InventoryChangeEvent[];
  affectedRecipeIds?: string[];
  recalculateAll?: boolean;
  notifyStakeholders?: boolean;
}

export interface TrackCostVariationsInput {
  recipeIds: string[];
  comparisonPeriods: Array<{
    start: Date;
    end: Date;
    label: string;
  }>;
  includeSeasonality?: boolean;
  varianceThreshold?: number; // Minimum percentage change to track
}

export interface CostAlertInput {
  thresholds: CostThreshold[];
  monitoringEnabled?: boolean;
  alertFrequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

export interface CalculateRealTimeCostResult {
  recipeId: string;
  recipeName: string;
  breakdown: RecipeCostBreakdown;
  calculatedAt: Date;
  dataFreshness: number;
  confidence: number;
  warnings: string[];
  costHistory?: Array<{
    date: Date;
    totalCost: Money;
    costPerPortion: Money;
  }>;
}

export interface UpdateCostsResult {
  totalRecipesUpdated: number;
  significantChanges: CostVariance[];
  alertsGenerated: CostAlert[];
  processingTimeMs: number;
  errors: string[];
}

export interface CostVariationResult {
  recipeVariances: CostVariance[];
  trendAnalysis: {
    recipeId: string;
    recipeName: string;
    trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    averageMonthlyChange: number;
    seasonalityDetected: boolean;
    projectedNextMonthCost?: Money;
  }[];
  insights: {
    mostVolatileRecipes: string[];
    costDrivers: string[];
    recommendations: string[];
  };
}

// ====== ENHANCED RECIPE COSTING SERVICE ======

/**
 * Enhanced Recipe Costing Service for real-time cost management
 */
export class EnhancedRecipeCostingService extends BaseCalculator {
  protected serviceName = 'EnhancedRecipeCostingService';
  
  private alertThresholds: Map<string, CostThreshold[]> = new Map();
  private costHistory: Map<string, RecipeCostBreakdown[]> = new Map();

  constructor(
    private cache: EnhancedCacheLayer,
    private defaultCostThresholds: CostThreshold[] = [],
    private alertingEnabled: boolean = true
  ) {
    super();
    this.initializeThresholds();
  }

  /**
   * Calculate real-time recipe costs using current inventory prices
   */
  async calculateRealTimeCost(input: CalculateRealTimeCostInput): Promise<CalculationResult<CalculateRealTimeCostResult>> {
    return this.executeCalculation('calculateRealTimeCost', input, async (context) => {
      // Get recipe details
      const recipe = await this.getRecipeDetails(input.recipeId, context);
      if (!recipe) {
        throw this.createError(
          `Recipe not found: ${input.recipeId}`,
          'RECIPE_NOT_FOUND',
          context
        );
      }

      // Get current ingredient costs
      const ingredientCosts = await this.getCurrentIngredientCosts(
        recipe.ingredients,
        input.locationId,
        input.usePreferredSuppliers,
        input.customIngredientPrices,
        input.targetDate,
        context
      );

      // Calculate ingredient cost breakdown
      const ingredientCostBreakdown = await this.calculateIngredientCosts(
        recipe.ingredients,
        ingredientCosts,
        recipe.yield,
        context
      );

      let laborCost: LaborCostSnapshot | undefined;
      let overheadCost: OverheadCostSnapshot | undefined;

      // Calculate labor costs if requested
      if (input.includeLaborCosts !== false) {
        laborCost = await this.calculateLaborCost(recipe, input.locationId, context);
      }

      // Calculate overhead costs if requested
      if (input.includeOverheadCosts !== false) {
        overheadCost = await this.calculateOverheadCost(recipe, input.locationId, context);
      }

      // Build cost breakdown
      const breakdown = await this.buildCostBreakdown(
        recipe,
        ingredientCostBreakdown,
        laborCost,
        overheadCost,
        input.locationId,
        context
      );

      // Calculate data freshness and confidence
      const dataFreshness = this.calculateDataFreshness(ingredientCosts);
      const confidence = this.calculateCostConfidence(ingredientCosts, breakdown);

      // Generate warnings for stale or low-confidence data
      const warnings = this.generateCostWarnings(breakdown, dataFreshness, confidence);

      // Get cost history for trends
      const costHistory = await this.getCostHistory(input.recipeId, 30, context); // Last 30 days

      const result: CalculateRealTimeCostResult = {
        recipeId: input.recipeId,
        recipeName: recipe.name,
        breakdown,
        calculatedAt: new Date(),
        dataFreshness,
        confidence,
        warnings,
        costHistory
      };

      // Cache the result
      const dependencies: CacheDependency[] = [
        { type: 'entity', identifier: `recipe_${input.recipeId}` },
        { type: 'entity', identifier: 'ingredient_costs' },
        { type: 'entity', identifier: 'recipe_costing' }
      ];

      if (input.locationId) {
        dependencies.push({ type: 'entity', identifier: `location_${input.locationId}` });
      }

      await this.cache.getOrCompute(
        this.serviceName,
        'calculateRealTimeCost',
        { recipeId: input.recipeId, timestamp: new Date().toISOString() },
        async () => this.createResult(result, context),
        dependencies,
        context.userId
      );

      // Store in cost history for trend analysis
      await this.storeCostHistory(breakdown, context);

      return result;
    });
  }

  /**
   * Update recipe costs when inventory changes occur
   */
  async updateCostsFromInventoryChanges(input: UpdateCostsFromInventoryInput): Promise<CalculationResult<UpdateCostsResult>> {
    return this.executeCalculation('updateCostsFromInventoryChanges', input, async (context) => {
      const startTime = Date.now();
      let totalRecipesUpdated = 0;
      const significantChanges: CostVariance[] = [];
      const alertsGenerated: CostAlert[] = [];
      const errors: string[] = [];

      // Validate input
      for (const change of input.inventoryChanges) {
        try {
          InventoryChangeEventSchema.parse(change);
        } catch (error) {
          errors.push(`Invalid inventory change event: ${error instanceof Error ? error.message : 'Unknown error'}`);
          continue;
        }
      }

      // Get affected recipes
      const affectedRecipeIds = input.affectedRecipeIds || 
        await this.findRecipesAffectedByIngredients(
          input.inventoryChanges.flatMap(change => 
            change.affectedIngredients.map(ing => ing.ingredientId)
          ),
          context
        );

      // Update costs for each affected recipe
      for (const recipeId of affectedRecipeIds) {
        try {
          // Calculate previous cost
          const previousCostResult = await this.getPreviousCost(recipeId, context);
          
          // Calculate new cost
          const newCostResult = await this.calculateRealTimeCost({
            recipeId,
            includeLaborCosts: true,
            includeOverheadCosts: true
          });

          if (previousCostResult && newCostResult.value.breakdown.totalRecipeCost) {
            const variance = this.calculateCostVariance(
              recipeId,
              newCostResult.value.recipeName,
              previousCostResult.totalRecipeCost,
              newCostResult.value.breakdown.totalRecipeCost,
              'total',
              context
            );

            // Check if variance is significant
            if (Math.abs(variance.percentageVariance) >= 5) { // 5% threshold
              significantChanges.push(variance);

              // Check for threshold breaches and generate alerts
              const alerts = await this.checkThresholdBreaches(
                recipeId,
                newCostResult.value.breakdown.totalRecipeCost,
                previousCostResult.totalRecipeCost,
                variance.percentageVariance,
                context
              );
              alertsGenerated.push(...alerts);
            }
          }

          totalRecipesUpdated++;
        } catch (error) {
          errors.push(`Failed to update costs for recipe ${recipeId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Send notifications if enabled
      if (input.notifyStakeholders && alertsGenerated.length > 0) {
        await this.sendCostAlertNotifications(alertsGenerated, context);
      }

      const processingTimeMs = Date.now() - startTime;

      const result: UpdateCostsResult = {
        totalRecipesUpdated,
        significantChanges,
        alertsGenerated,
        processingTimeMs,
        errors
      };

      // Cache invalidation for affected recipes
      const dependencies: CacheDependency[] = affectedRecipeIds.map(id => ({
        type: 'entity',
        identifier: `recipe_${id}`
      }));

      await this.cache.invalidateByDependencies({
        dependencies,
        reason: 'Inventory cost changes',
        timestamp: new Date()
      });

      return result;
    });
  }

  /**
   * Track cost variations over time with trend analysis
   */
  async trackCostVariations(input: TrackCostVariationsInput): Promise<CalculationResult<CostVariationResult>> {
    return this.executeCalculation('trackCostVariations', input, async (context) => {
      const recipeVariances: CostVariance[] = [];
      const trendAnalysis: CostVariationResult['trendAnalysis'] = [];

      for (const recipeId of input.recipeIds) {
        const recipe = await this.getRecipeDetails(recipeId, context);
        if (!recipe) continue;

        // Get cost history for each comparison period
        const costHistory: Array<{ period: string; cost: Money; date: Date }> = [];
        
        for (const period of input.comparisonPeriods) {
          const historicalCost = await this.getHistoricalCost(recipeId, period.end, context);
          if (historicalCost) {
            costHistory.push({
              period: period.label,
              cost: historicalCost.totalRecipeCost,
              date: period.end
            });
          }
        }

        if (costHistory.length >= 2) {
          // Calculate variances between periods
          for (let i = 1; i < costHistory.length; i++) {
            const previous = costHistory[i - 1];
            const current = costHistory[i];
            
            const variance = this.calculateCostVariance(
              recipeId,
              recipe.name,
              previous.cost,
              current.cost,
              'total',
              context,
              `${previous.period} to ${current.period}`
            );

            if (Math.abs(variance.percentageVariance) >= (input.varianceThreshold || 2)) {
              recipeVariances.push(variance);
            }
          }

          // Perform trend analysis
          const trend = this.analyzeCostTrend(costHistory, input.includeSeasonality);
          trendAnalysis.push({
            recipeId,
            recipeName: recipe.name,
            ...trend
          });
        }
      }

      // Generate insights
      const insights = this.generateCostVariationInsights(recipeVariances, trendAnalysis);

      const result: CostVariationResult = {
        recipeVariances,
        trendAnalysis,
        insights
      };

      return result;
    });
  }

  /**
   * Monitor cost thresholds and generate alerts
   */
  async alertOnCostThresholdBreaches(input: CostAlertInput): Promise<CalculationResult<{ alertsGenerated: number; thresholdsActive: number }>> {
    return this.executeCalculation('alertOnCostThresholdBreaches', input, async (context) => {
      // Validate and store thresholds
      const validThresholds: CostThreshold[] = [];
      
      for (const threshold of input.thresholds) {
        try {
          CostThresholdSchema.parse(threshold);
          validThresholds.push({
            ...threshold,
            id: this.generateThresholdId(),
            createdAt: new Date()
          });
        } catch (error) {
          console.warn(`[${this.serviceName}] Invalid threshold configuration:`, error);
        }
      }

      // Store thresholds for monitoring
      this.storeThresholds(validThresholds);

      // Enable monitoring if requested
      if (input.monitoringEnabled !== false) {
        await this.enableCostMonitoring(validThresholds, input.alertFrequency, context);
      }

      let alertsGenerated = 0;

      // Check current costs against thresholds
      for (const threshold of validThresholds) {
        if (!threshold.isActive) continue;

        const recipes = await this.getRecipesForThreshold(threshold, context);
        
        for (const recipe of recipes) {
          const currentCostResult = await this.calculateRealTimeCost({
            recipeId: recipe.id,
            includeLaborCosts: true,
            includeOverheadCosts: true
          });

          const alerts = await this.checkThresholdBreaches(
            recipe.id,
            currentCostResult.value.breakdown.totalRecipeCost,
            undefined,
            0,
            context,
            [threshold]
          );

          alertsGenerated += alerts.length;
        }
      }

      return {
        alertsGenerated,
        thresholdsActive: validThresholds.filter(t => t.isActive).length
      };
    });
  }

  // ====== PRIVATE HELPER METHODS ======

  private initializeThresholds(): void {
    // Initialize with default thresholds if provided
    this.defaultCostThresholds.forEach(threshold => {
      const recipeKey = threshold.recipeId || 'global';
      if (!this.alertThresholds.has(recipeKey)) {
        this.alertThresholds.set(recipeKey, []);
      }
      this.alertThresholds.get(recipeKey)!.push(threshold);
    });
  }

  private async getRecipeDetails(recipeId: string, context: CalculationContext): Promise<Recipe | null> {
    // This would query the database for recipe details
    // For now, return mock data
    return {
      id: recipeId,
      recipeCode: `RCP-${recipeId}`,
      name: `Recipe ${recipeId}`,
      displayName: `Recipe ${recipeId}`,
      description: `Mock recipe ${recipeId}`,
      categoryId: 'cat-1',
      cuisineTypeId: 'cuisine-1',
      status: 'published',
      complexity: 'moderate',
      yield: 4,
      yieldUnit: 'portions',
      basePortionSize: 1,
      yieldVariants: [],
      ingredients: [
        {
          id: 'ing-1',
          recipeId,
          productId: 'prod-1',
          name: 'Ingredient 1',
          quantity: 2,
          unit: 'kg',
          notes: 'Main ingredient',
          type: 'product',
          costPerUnit: { amount: 5, currency: 'USD' },
          totalCost: { amount: 10, currency: 'USD' },
          wastage: 0,
          yield: 100,
          netQuantity: 2,
          inventoryQty: 2,
          inventoryUnit: 'kg',
          isOptional: false,
          substitutes: [],
          preparation: 'chopped',
          conversionFactor: 1,
          displayOrder: 1
        }
      ],
      preparationSteps: [],
      prepTime: 30,
      cookTime: 45,
      totalTime: 75,
      totalCost: { amount: 15, currency: 'USD' },
      costPerPortion: { amount: 3.75, currency: 'USD' },
      foodCostPercentage: 25,
      requiredEquipment: [],
      skillLevel: 'intermediate',
      allergens: [],
      dietaryRestrictions: [],
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isHalal: false,
      isKosher: false,
      image: '',
      isActive: true,
      isMenuActive: true,
      version: '1.0.0',
      tags: [],
      keywords: [],
      developedBy: 'system'
    };
  }

  private async getCurrentIngredientCosts(
    ingredients: Ingredient[],
    locationId?: string,
    usePreferredSuppliers?: boolean,
    customPrices?: Record<string, Money>,
    targetDate?: Date,
    context?: CalculationContext
  ): Promise<IngredientCostSnapshot[]> {
    // This would query current ingredient costs from inventory/supplier systems
    // For now, return mock data
    return ingredients.map(ingredient => ({
      ingredientId: ingredient.productId || ingredient.id,
      ingredientName: ingredient.name,
      currentUnitCost: customPrices?.[ingredient.id] || ingredient.costPerUnit || { amount: 5, currency: 'USD' },
      supplierId: 'supplier-1',
      supplierName: 'Mock Supplier',
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      lastUpdated: new Date(),
      priceSource: 'supplier_catalog' as const,
      confidence: 0.9
    }));
  }

  private async calculateIngredientCosts(
    ingredients: Ingredient[],
    costSnapshots: IngredientCostSnapshot[],
    recipeYield: number,
    context: CalculationContext
  ) {
    const costMap = new Map(costSnapshots.map(snap => [snap.ingredientId, snap]));
    
    return ingredients.map(ingredient => {
      const costSnapshot = costMap.get(ingredient.productId || ingredient.id);
      const unitCost = costSnapshot?.currentUnitCost || ingredient.costPerUnit || { amount: 0, currency: 'USD' };
      const totalCost = this.createMoney(unitCost.amount * ingredient.quantity, unitCost.currency);
      const costPerPortion = this.createMoney(totalCost.amount / recipeYield, totalCost.currency);

      return {
        ingredientId: ingredient.productId || ingredient.id,
        ingredientName: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        unitCost,
        totalCost,
        costPerPortion
      };
    });
  }

  private async calculateLaborCost(
    recipe: Recipe,
    locationId?: string,
    context?: CalculationContext
  ): Promise<LaborCostSnapshot> {
    // This would calculate actual labor costs based on location rates and recipe complexity
    const hourlyRate = this.createMoney(25, 'USD'); // Mock rate
    const totalMinutes = recipe.prepTime + recipe.cookTime;
    const laborHours = totalMinutes / 60;
    const totalLaborCost = this.createMoney(hourlyRate.amount * laborHours, hourlyRate.currency);

    return {
      standardLaborMinutes: totalMinutes,
      hourlyLaborRate: hourlyRate,
      skillLevelMultiplier: 1.0,
      locationMultiplier: 1.0,
      totalLaborCost
    };
  }

  private async calculateOverheadCost(
    recipe: Recipe,
    locationId?: string,
    context?: CalculationContext
  ): Promise<OverheadCostSnapshot> {
    // This would calculate overhead costs based on facility and equipment usage
    const utilityCost = this.createMoney(5, 'USD');
    const equipmentCost = this.createMoney(3, 'USD');
    const facilityRate = 15; // 15% of direct costs
    
    const cookingHours = recipe.cookTime / 60;
    const totalOverhead = this.createMoney(
      (utilityCost.amount + equipmentCost.amount) * cookingHours,
      'USD'
    );

    return {
      utilityCostPerHour: utilityCost,
      equipmentDepreciationCostPerHour: equipmentCost,
      facilityOverheadRate: facilityRate,
      totalOverheadCost: totalOverhead
    };
  }

  private async buildCostBreakdown(
    recipe: Recipe,
    ingredientCosts: Awaited<ReturnType<typeof this.calculateIngredientCosts>>,
    laborCost?: LaborCostSnapshot,
    overheadCost?: OverheadCostSnapshot,
    locationId?: string,
    context?: CalculationContext
  ): Promise<RecipeCostBreakdown> {
    const totalDirectCost = this.createMoney(
      ingredientCosts.reduce((sum, cost) => sum + cost.totalCost.amount, 0),
      'USD'
    );

    const totalIndirectCost = this.createMoney(
      (laborCost?.totalLaborCost.amount || 0) + (overheadCost?.totalOverheadCost.amount || 0),
      'USD'
    );

    const totalRecipeCost = this.createMoney(
      totalDirectCost.amount + totalIndirectCost.amount,
      'USD'
    );

    const costPerPortion = this.createMoney(
      totalRecipeCost.amount / recipe.yield,
      'USD'
    );

    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      calculatedAt: new Date(),
      locationId,
      ingredientCosts,
      laborCost: laborCost!,
      overheadCost: overheadCost!,
      totalDirectCost,
      totalIndirectCost,
      totalRecipeCost,
      costPerPortion,
      yield: recipe.yield,
      dataFreshness: 1.0,
      confidence: 0.95
    };
  }

  private calculateDataFreshness(ingredientCosts: IngredientCostSnapshot[]): number {
    const now = new Date().getTime();
    const freshnessScores = ingredientCosts.map(cost => {
      const ageHours = (now - cost.lastUpdated.getTime()) / (1000 * 60 * 60);
      if (ageHours <= 1) return 1.0;
      if (ageHours <= 24) return 0.9;
      if (ageHours <= 168) return 0.7; // 1 week
      return 0.3;
    });

    return freshnessScores.reduce((sum, score) => sum + score, 0) / freshnessScores.length;
  }

  private calculateCostConfidence(
    ingredientCosts: IngredientCostSnapshot[],
    breakdown: RecipeCostBreakdown
  ): number {
    const avgIngredientConfidence = ingredientCosts.reduce((sum, cost) => sum + cost.confidence, 0) / ingredientCosts.length;
    const dataFreshnessScore = breakdown.dataFreshness;
    
    return (avgIngredientConfidence + dataFreshnessScore) / 2;
  }

  private generateCostWarnings(
    breakdown: RecipeCostBreakdown,
    dataFreshness: number,
    confidence: number
  ): string[] {
    const warnings: string[] = [];

    if (dataFreshness < 0.7) {
      warnings.push('Some ingredient cost data is outdated (older than 1 week)');
    }

    if (confidence < 0.8) {
      warnings.push('Low confidence in cost calculation due to data quality issues');
    }

    const ingredientMissingCosts = breakdown.ingredientCosts.filter(
      cost => cost.totalCost.amount === 0
    );
    
    if (ingredientMissingCosts.length > 0) {
      warnings.push(`${ingredientMissingCosts.length} ingredients have zero or missing costs`);
    }

    return warnings;
  }

  private async getCostHistory(
    recipeId: string,
    days: number,
    context?: CalculationContext
  ): Promise<Array<{ date: Date; totalCost: Money; costPerPortion: Money }> | undefined> {
    // This would query historical cost data
    // For now, return mock data
    const history = this.costHistory.get(recipeId) || [];
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return history
      .filter(breakdown => breakdown.calculatedAt >= cutoffDate)
      .map(breakdown => ({
        date: breakdown.calculatedAt,
        totalCost: breakdown.totalRecipeCost,
        costPerPortion: breakdown.costPerPortion
      }));
  }

  private async storeCostHistory(breakdown: RecipeCostBreakdown, context?: CalculationContext): Promise<void> {
    if (!this.costHistory.has(breakdown.recipeId)) {
      this.costHistory.set(breakdown.recipeId, []);
    }
    
    const history = this.costHistory.get(breakdown.recipeId)!;
    history.push(breakdown);
    
    // Keep only last 100 entries
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
  }

  private async findRecipesAffectedByIngredients(
    ingredientIds: string[],
    context: CalculationContext
  ): Promise<string[]> {
    // This would query recipes that use the affected ingredients
    // For now, return mock data
    return ['recipe-1', 'recipe-2', 'recipe-3'];
  }

  private async getPreviousCost(recipeId: string, context: CalculationContext): Promise<RecipeCostBreakdown | null> {
    const history = this.costHistory.get(recipeId);
    return history && history.length > 0 ? history[history.length - 1] : null;
  }

  private calculateCostVariance(
    recipeId: string,
    recipeName: string,
    previousCost: Money,
    currentCost: Money,
    varianceType: CostVariance['varianceType'],
    context: CalculationContext,
    reason?: string
  ): CostVariance {
    const absoluteVariance = this.createMoney(
      currentCost.amount - previousCost.amount,
      currentCost.currency
    );
    
    const percentageVariance = previousCost.amount > 0 
      ? ((currentCost.amount - previousCost.amount) / previousCost.amount) * 100
      : 0;

    let significance: CostVariance['significance'];
    const absPercentage = Math.abs(percentageVariance);
    
    if (absPercentage >= 20) significance = 'critical';
    else if (absPercentage >= 10) significance = 'major';
    else if (absPercentage >= 5) significance = 'moderate';
    else significance = 'minor';

    return {
      recipeId,
      recipeName,
      varianceId: this.generateVarianceId(),
      calculationDate: new Date(),
      previousCost,
      currentCost,
      absoluteVariance,
      percentageVariance,
      varianceType,
      reason,
      significance,
      alertGenerated: false // Will be set when alerts are generated
    };
  }

  private async checkThresholdBreaches(
    recipeId: string,
    currentCost: Money,
    previousCost?: Money,
    percentageChange?: number,
    context?: CalculationContext,
    specificThresholds?: CostThreshold[]
  ): Promise<CostAlert[]> {
    const alerts: CostAlert[] = [];
    const thresholds = specificThresholds || this.getThresholdsForRecipe(recipeId);

    for (const threshold of thresholds) {
      if (!threshold.isActive) continue;

      let breached = false;
      let variance = 0;

      switch (threshold.thresholdType) {
        case 'absolute_cost':
          breached = currentCost.amount >= threshold.thresholdValue;
          variance = currentCost.amount;
          break;
          
        case 'percentage_increase':
          if (previousCost && percentageChange !== undefined) {
            breached = percentageChange >= threshold.thresholdValue;
            variance = percentageChange;
          }
          break;
          
        case 'absolute_increase':
          if (previousCost) {
            const increase = currentCost.amount - previousCost.amount;
            breached = increase >= threshold.thresholdValue;
            variance = increase;
          }
          break;
          
        case 'margin_below':
          // This would require selling price data
          breached = false; // Mock implementation
          break;
      }

      if (breached) {
        alerts.push(this.createCostAlert(
          recipeId,
          threshold,
          currentCost,
          previousCost,
          variance,
          context
        ));
      }
    }

    return alerts;
  }

  private createCostAlert(
    recipeId: string,
    threshold: CostThreshold,
    currentCost: Money,
    previousCost: Money | undefined,
    variance: number,
    context?: CalculationContext
  ): CostAlert {
    return {
      alertId: this.generateAlertId(),
      recipeId,
      recipeName: `Recipe ${recipeId}`, // Would get actual name
      thresholdId: threshold.id,
      alertType: threshold.thresholdType,
      severity: threshold.alertSeverity,
      triggeredAt: new Date(),
      currentCost,
      previousCost,
      thresholdValue: threshold.thresholdValue,
      variance,
      message: this.generateAlertMessage(threshold, currentCost, variance),
      recommendedActions: this.generateRecommendedActions(threshold, variance),
      resolved: false
    };
  }

  private generateAlertMessage(threshold: CostThreshold, currentCost: Money, variance: number): string {
    switch (threshold.thresholdType) {
      case 'absolute_cost':
        return `Recipe cost (${currentCost.amount} ${currentCost.currency}) exceeds threshold of ${threshold.thresholdValue}`;
      case 'percentage_increase':
        return `Recipe cost increased by ${variance.toFixed(2)}%, exceeding threshold of ${threshold.thresholdValue}%`;
      case 'absolute_increase':
        return `Recipe cost increased by ${variance.toFixed(2)} ${threshold.currency || 'USD'}, exceeding threshold of ${threshold.thresholdValue}`;
      default:
        return `Cost threshold breached: ${threshold.thresholdType}`;
    }
  }

  private generateRecommendedActions(threshold: CostThreshold, variance: number): string[] {
    const actions: string[] = [];

    switch (threshold.alertSeverity) {
      case 'critical':
        actions.push('Immediate review required');
        actions.push('Consider temporary menu item removal');
        actions.push('Emergency supplier contact');
        break;
      case 'high':
        actions.push('Review supplier contracts');
        actions.push('Analyze ingredient substitutions');
        actions.push('Update menu pricing');
        break;
      case 'medium':
        actions.push('Monitor cost trends');
        actions.push('Review portion sizes');
        break;
      case 'low':
        actions.push('Document for next review cycle');
        break;
    }
    
    return actions;
  }

  private getThresholdsForRecipe(recipeId: string): CostThreshold[] {
    const recipeThresholds = this.alertThresholds.get(recipeId) || [];
    const globalThresholds = this.alertThresholds.get('global') || [];
    return [...recipeThresholds, ...globalThresholds];
  }

  private async sendCostAlertNotifications(alerts: CostAlert[], context?: CalculationContext): Promise<void> {
    // This would integrate with notification service
    console.log(`[${this.serviceName}] Generated ${alerts.length} cost alerts`);
    alerts.forEach(alert => {
      console.log(`  - ${alert.severity.toUpperCase()}: ${alert.message}`);
    });
  }

  private storeThresholds(thresholds: CostThreshold[]): void {
    thresholds.forEach(threshold => {
      const key = threshold.recipeId || 'global';
      if (!this.alertThresholds.has(key)) {
        this.alertThresholds.set(key, []);
      }
      this.alertThresholds.get(key)!.push(threshold);
    });
  }

  private async enableCostMonitoring(
    thresholds: CostThreshold[],
    frequency?: CostAlertInput['alertFrequency'],
    context?: CalculationContext
  ): Promise<void> {
    // This would set up recurring monitoring jobs
    console.log(`[${this.serviceName}] Enabled cost monitoring for ${thresholds.length} thresholds`);
  }

  private async getRecipesForThreshold(threshold: CostThreshold, context: CalculationContext): Promise<Recipe[]> {
    // This would query recipes based on threshold criteria
    // For now, return mock data
    if (threshold.recipeId) {
      const recipe = await this.getRecipeDetails(threshold.recipeId, context);
      return recipe ? [recipe] : [];
    }
    
    // Return all recipes for global thresholds (mock)
    return [];
  }

  private async getHistoricalCost(
    recipeId: string,
    targetDate: Date,
    context: CalculationContext
  ): Promise<RecipeCostBreakdown | null> {
    // This would query historical cost data
    const history = this.costHistory.get(recipeId) || [];
    
    // Find closest historical record to target date
    let closest: RecipeCostBreakdown | null = null;
    let minDiff = Infinity;
    
    for (const record of history) {
      const diff = Math.abs(record.calculatedAt.getTime() - targetDate.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closest = record;
      }
    }
    
    return closest;
  }

  private analyzeCostTrend(
    costHistory: Array<{ period: string; cost: Money; date: Date }>,
    includeSeasonality?: boolean
  ) {
    if (costHistory.length < 2) {
      return {
        trend: 'stable' as const,
        averageMonthlyChange: 0,
        seasonalityDetected: false
      };
    }

    // Simple trend analysis using linear regression
    const sortedHistory = costHistory.sort((a, b) => a.date.getTime() - b.date.getTime());
    const n = sortedHistory.length;
    
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    sortedHistory.forEach((point, index) => {
      const x = index;
      const y = point.cost.amount;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const avgChange = slope;
    
    // Determine trend
    let trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    const absSlope = Math.abs(slope);
    
    if (absSlope < 0.1) {
      trend = 'stable';
    } else if (absSlope > 2) {
      trend = 'volatile';
    } else {
      trend = slope > 0 ? 'increasing' : 'decreasing';
    }

    return {
      trend,
      averageMonthlyChange: avgChange * 30, // Convert to monthly
      seasonalityDetected: false // Simplified implementation
    };
  }

  private generateCostVariationInsights(
    variances: CostVariance[],
    trends: CostVariationResult['trendAnalysis']
  ): CostVariationResult['insights'] {
    // Find most volatile recipes
    const volatileRecipes = trends
      .filter(trend => trend.trend === 'volatile')
      .map(trend => trend.recipeId)
      .slice(0, 5);

    // Identify main cost drivers
    const costDrivers = Array.from(
      new Set(variances.map(v => v.varianceType))
    );

    // Generate recommendations
    const recommendations = [
      'Monitor volatile recipes more closely',
      'Review supplier contracts for high-variance ingredients',
      'Consider menu pricing updates for significantly changed items',
      'Implement cost hedging strategies for volatile ingredients'
    ];

    return {
      mostVolatileRecipes: volatileRecipes,
      costDrivers,
      recommendations
    };
  }

  // ID generation helpers
  private generateVarianceId(): string {
    return `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateThresholdId(): string {
    return `thresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Create Enhanced Recipe Costing Service instance with default configuration
 */
export function createEnhancedRecipeCostingService(
  cache: EnhancedCacheLayer,
  defaultThresholds?: CostThreshold[]
): EnhancedRecipeCostingService {
  return new EnhancedRecipeCostingService(cache, defaultThresholds, true);
}