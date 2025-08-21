/**
 * Enhanced Costing Engine Tests
 * 
 * Comprehensive test suite for the enhanced costing engine functionality
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { EnhancedCostingEngine } from '../enhanced-costing-engine'
import { 
  PortionCostingContext,
  OverheadCostFactors,
  IngredientCostDetail,
  DemandAnalytics,
  WasteAnalytics,
  PricingOptimizationRequest
} from '../../types/enhanced-costing-engine'
import { Recipe, RecipeYieldVariant, Ingredient } from '@/app/(main)/operational-planning/recipe-management/recipes/data/mock-recipes'

describe('EnhancedCostingEngine', () => {
  let costingEngine: EnhancedCostingEngine
  let mockRecipe: Recipe
  let mockVariant: RecipeYieldVariant
  let mockCostingContext: PortionCostingContext

  beforeEach(() => {
    costingEngine = new EnhancedCostingEngine()

    // Mock recipe data
    mockRecipe = {
      id: 'pizza-1',
      name: 'Margherita Pizza',
      description: 'Classic Margherita pizza',
      category: 'Pizza',
      preparationTime: 30,
      cookingTime: 12,
      servingSize: 8,
      unit: 'slices',
      baseYield: 1,
      ingredients: [
        {
          id: 'flour-1',
          name: 'Pizza Flour',
          quantity: 250,
          unit: 'g',
          type: 'product',
          costPerUnit: 0.008,
          wastage: 5
        },
        {
          id: 'tomato-1',
          name: 'Tomato Sauce',
          quantity: 80,
          unit: 'ml',
          type: 'product',
          costPerUnit: 0.015,
          wastage: 3
        },
        {
          id: 'mozzarella-1',
          name: 'Mozzarella Cheese',
          quantity: 120,
          unit: 'g',
          type: 'product',
          costPerUnit: 0.025,
          wastage: 8
        }
      ],
      instructions: [],
      yieldVariants: []
    }

    mockVariant = {
      id: 'slice',
      name: 'Single Slice',
      yield: 1,
      unit: 'slice',
      conversionRate: 0.125,
      costPerUnit: 1.85,
      sellingPrice: 13.50,
      portionSize: '1/8 pizza',
      complexityMultiplier: 1.0,
      wastageRate: 2
    }

    // Mock costing context
    const mockOverheadFactors: OverheadCostFactors = {
      preparationLaborRate: 0.25,
      cookingLaborRate: 0.30,
      serviceLaborRate: 0.20,
      skillLevelMultiplier: 1.2,
      energyCostPerMinute: 0.05,
      waterCostPerUnit: 0.02,
      gasCostPerUnit: 0.03,
      equipmentDepreciation: 0.15,
      facilityOverhead: 0.08,
      cleaningAndSanitization: 0.05,
      packagingCost: 0.25,
      presentationCost: 0.10,
      disposableCost: 0.15,
      managementOverhead: 0.10,
      marketingAllocation: 0.05,
      insuranceAllocation: 0.02
    }

    const mockIngredientCosts: IngredientCostDetail[] = [
      {
        ingredientId: 'flour-1',
        ingredientName: 'Pizza Flour',
        type: 'product',
        baseQuantity: 250,
        unit: 'g',
        unitCost: 0.008,
        totalCost: 2.00,
        qualityGrade: 'standard',
        sourceType: 'local',
        seasonalityFactor: 1.0,
        priceVolatility: 0.15,
        supplyRisk: 'low',
        substitutionOptions: 3,
        preparationWaste: 3,
        cookingWaste: 2,
        servingWaste: 0,
        totalWastePercentage: 5,
        shelfLife: 365,
        spoilageRisk: 2
      }
    ]

    const mockDemandAnalytics: DemandAnalytics = {
      recipeId: 'pizza-1',
      period: '2024-08',
      totalSalesVolume: 485,
      averageDailySales: 16.2,
      peakDayVolume: 45,
      lowDayVolume: 8,
      salesVariability: 0.25,
      variantDemand: [{
        variantId: 'slice',
        variantName: 'Single Slice',
        salesVolume: 485,
        demandShare: 45.8,
        priceElasticity: -1.2,
        crossElasticity: 0.3,
        seasonalPattern: [
          { season: 'summer', demandMultiplier: 1.2 }
        ],
        timeOfDayPattern: [
          { hour: 12, demandMultiplier: 1.5 },
          { hour: 19, demandMultiplier: 1.8 }
        ],
        dayOfWeekPattern: [
          { day: 'friday', demandMultiplier: 1.3 }
        ]
      }],
      competitorPricing: [{
        competitorName: 'Tony\'s Pizza',
        productName: 'Pizza Slice',
        price: 12.00,
        portionSize: '1/8',
        qualityRating: 3.8
      }],
      forecastAccuracy: 0.85,
      demandTrend: 'stable',
      trendStrength: 0.05,
      cyclicalPatterns: false,
      externalFactors: []
    }

    const mockWasteAnalytics: WasteAnalytics = {
      recipeId: 'pizza-1',
      period: '2024-08',
      totalWastePercentage: 6.5,
      wasteValueAmount: 125.50,
      wasteReductionOpportunity: 62.75,
      wasteBreakdown: [{
        category: 'preparation',
        wastePercentage: 3.2,
        wasteValue: 65.25,
        primaryCauses: ['Over-portioning', 'Ingredient spillage'],
        reductionPotential: 40,
        implementationDifficulty: 'medium'
      }],
      variantWaste: [{
        variantId: 'slice',
        variantName: 'Single Slice',
        wastePercentage: 2.1,
        wasteValue: 45.30,
        wasteDrivers: [{
          driver: 'Topping spillage',
          impact: 60,
          frequency: 25
        }]
      }],
      timeBasedWaste: [],
      volumeBasedWaste: [],
      wasteReductionOptions: []
    }

    mockCostingContext = {
      recipeId: 'pizza-1',
      recipeName: 'Margherita Pizza',
      baseRecipeCost: 4.50,
      variants: [mockVariant],
      ingredientCosts: mockIngredientCosts,
      overheadFactors: mockOverheadFactors,
      demandMetrics: mockDemandAnalytics,
      wastePatterns: mockWasteAnalytics,
      location: 'Main Kitchen',
      period: '2024-08',
      calculatedAt: new Date()
    }
  })

  describe('calculatePortionCost', () => {
    it('should calculate accurate portion cost breakdown', async () => {
      const result = await costingEngine.calculatePortionCost(
        mockRecipe,
        mockVariant,
        mockCostingContext
      )

      expect(result).toBeDefined()
      expect(result.recipeId).toBe('pizza-1')
      expect(result.variantId).toBe('slice')
      expect(result.totalCost).toBeGreaterThan(0)
      expect(result.ingredientCost).toBeGreaterThan(0)
      expect(result.totalLaborCost).toBeGreaterThan(0)
      expect(result.totalOverheadCost).toBeGreaterThan(0)
      expect(result.totalLossCost).toBeGreaterThan(0)
    })

    it('should calculate cost per base unit correctly', async () => {
      const result = await costingEngine.calculatePortionCost(
        mockRecipe,
        mockVariant,
        mockCostingContext
      )

      const expectedCostPerBaseUnit = result.totalCost / result.baseRecipeUnitsUsed
      expect(result.costPerBaseUnit).toBeCloseTo(expectedCostPerBaseUnit, 2)
    })

    it('should apply waste factors correctly', async () => {
      const result = await costingEngine.calculatePortionCost(
        mockRecipe,
        mockVariant,
        mockCostingContext
      )

      expect(result.totalLossCost).toBeGreaterThan(0)
      expect(result.wasteCost).toBeGreaterThan(0)
    })

    it('should calculate labor costs based on preparation time', async () => {
      const result = await costingEngine.calculatePortionCost(
        mockRecipe,
        mockVariant,
        mockCostingContext
      )

      expect(result.preparationLaborCost).toBeGreaterThan(0)
      expect(result.cookingLaborCost).toBeGreaterThan(0)
      expect(result.serviceLaborCost).toBeGreaterThan(0)
      expect(result.totalLaborCost).toBe(
        result.preparationLaborCost + result.cookingLaborCost + result.serviceLaborCost
      )
    })
  })

  describe('generateDynamicPricing', () => {
    it('should generate pricing recommendations', async () => {
      const costBreakdown = await costingEngine.calculatePortionCost(
        mockRecipe,
        mockVariant,
        mockCostingContext
      )

      const pricingRequest: PricingOptimizationRequest = {
        recipeId: 'pizza-1',
        variantId: 'slice',
        objectives: [{
          type: 'maximize_profit',
          weight: 1.0,
          priority: 'high'
        }],
        constraints: [{
          type: 'min_margin_percentage',
          value: 30,
          description: 'Minimum 30% margin',
          flexibility: 'strict'
        }],
        timeHorizon: 'short_term',
        marketConditions: [],
        competitiveContext: {
          directCompetitors: [{
            name: 'Tony\'s Pizza',
            productName: 'Pizza Slice',
            price: 12.00,
            portionSize: '1/8',
            qualityScore: 3.8,
            marketPosition: 'value',
            uniqueSellingPoints: ['Fast service']
          }],
          indirectCompetitors: [],
          marketGap: []
        }
      }

      const result = await costingEngine.generateDynamicPricing(
        mockRecipe,
        mockVariant,
        costBreakdown,
        pricingRequest
      )

      expect(result).toBeDefined()
      expect(result.recommendedPrice).toBeGreaterThan(costBreakdown.totalCost)
      expect(result.projectedMarginPercentage).toBeGreaterThanOrEqual(30)
      expect(result.riskFactors).toBeDefined()
      expect(Array.isArray(result.alternativeScenarios)).toBe(true)
    })

    it('should respect pricing constraints', async () => {
      const costBreakdown = await costingEngine.calculatePortionCost(
        mockRecipe,
        mockVariant,
        mockCostingContext
      )

      const pricingRequest: PricingOptimizationRequest = {
        recipeId: 'pizza-1',
        variantId: 'slice',
        objectives: [{
          type: 'maximize_profit',
          weight: 1.0,
          priority: 'high'
        }],
        constraints: [
          {
            type: 'min_margin_percentage',
            value: 35,
            description: 'Minimum 35% margin',
            flexibility: 'strict'
          },
          {
            type: 'max_price_point',
            value: 15.00,
            description: 'Maximum $15 price',
            flexibility: 'strict'
          }
        ],
        timeHorizon: 'short_term',
        marketConditions: [],
        competitiveContext: {
          directCompetitors: [],
          indirectCompetitors: [],
          marketGap: []
        }
      }

      const result = await costingEngine.generateDynamicPricing(
        mockRecipe,
        mockVariant,
        costBreakdown,
        pricingRequest
      )

      expect(result.recommendedPrice).toBeLessThanOrEqual(15.00)
      expect(result.projectedMarginPercentage).toBeGreaterThanOrEqual(35)
    })
  })

  describe('analyzeVariantProfitability', () => {
    it('should analyze variant profitability correctly', async () => {
      const mockSalesTransactions = [
        {
          id: 'txn-1',
          transactionId: 'pos-1',
          posItemCode: 'PIZZA_SLICE',
          itemName: 'Pizza Slice',
          variantId: 'slice',
          variantName: 'Single Slice',
          baseRecipeId: 'pizza-1',
          baseRecipeName: 'Margherita Pizza',
          fractionalSalesType: 'pizza-slice' as const,
          quantitySold: 1,
          conversionRate: 0.125,
          salePrice: 13.50,
          costPrice: 7.65,
          grossProfit: 5.85,
          location: 'Main Kitchen',
          cashier: 'John Doe',
          timestamp: new Date(),
          shiftId: 'shift-1'
        }
      ]

      const result = await costingEngine.analyzeVariantProfitability(
        mockRecipe,
        mockSalesTransactions,
        '2024-08'
      )

      expect(result).toBeDefined()
      expect(result.recipeId).toBe('pizza-1')
      expect(result.totalRevenue).toBeGreaterThan(0)
      expect(result.totalProfit).toBeGreaterThan(0)
      expect(result.averageMarginPercentage).toBeGreaterThan(0)
      expect(Array.isArray(result.variantPerformance)).toBe(true)
    })

    it('should categorize variant performance correctly', async () => {
      const mockSalesTransactions = [
        {
          id: 'txn-1',
          transactionId: 'pos-1',
          posItemCode: 'PIZZA_SLICE',
          itemName: 'Pizza Slice',
          variantId: 'slice',
          variantName: 'Single Slice',
          baseRecipeId: 'pizza-1',
          baseRecipeName: 'Margherita Pizza',
          fractionalSalesType: 'pizza-slice' as const,
          quantitySold: 1,
          conversionRate: 0.125,
          salePrice: 13.50,
          costPrice: 7.65,
          grossProfit: 5.85,
          location: 'Main Kitchen',
          cashier: 'John Doe',
          timestamp: new Date(),
          shiftId: 'shift-1'
        }
      ]

      const result = await costingEngine.analyzeVariantProfitability(
        mockRecipe,
        mockSalesTransactions,
        '2024-08'
      )

      const variantPerformance = result.variantPerformance[0]
      expect(variantPerformance.performanceRating).toMatch(/^(star|solid|question|dog)$/)
      expect(variantPerformance.recommendedAction).toMatch(/^(promote|optimize|maintain|consider_removal)$/)
    })
  })

  describe('generateCostVarianceAlerts', () => {
    it('should generate alerts for cost variances', async () => {
      const costBreakdown = await costingEngine.calculatePortionCost(
        mockRecipe,
        mockVariant,
        mockCostingContext
      )

      const historicalData = [
        {
          recipeId: 'pizza-1',
          variantId: 'slice',
          averageCost: 6.50, // Lower than current cost to trigger alert
          period: '2024-07'
        }
      ]

      const thresholds = {
        costIncreaseThreshold: 0.10 // 10% threshold
      }

      const alerts = await costingEngine.generateCostVarianceAlerts(
        [costBreakdown],
        historicalData,
        thresholds
      )

      if (costBreakdown.totalCost > 6.50 * 1.1) {
        expect(alerts.length).toBeGreaterThan(0)
        expect(alerts[0].alertType).toBe('cost_increase')
        expect(alerts[0].recipeId).toBe('pizza-1')
      }
    })

    it('should calculate variance percentages correctly', async () => {
      const costBreakdown = await costingEngine.calculatePortionCost(
        mockRecipe,
        mockVariant,
        mockCostingContext
      )

      const historicalData = [
        {
          recipeId: 'pizza-1',
          variantId: 'slice',
          averageCost: 7.00,
          period: '2024-07'
        }
      ]

      const thresholds = {
        costIncreaseThreshold: 0.05 // 5% threshold
      }

      const alerts = await costingEngine.generateCostVarianceAlerts(
        [costBreakdown],
        historicalData,
        thresholds
      )

      if (alerts.length > 0) {
        const alert = alerts[0]
        const expectedVariancePercentage = ((alert.currentValue - alert.expectedValue) / alert.expectedValue) * 100
        expect(alert.variancePercentage).toBeCloseTo(expectedVariancePercentage, 1)
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing ingredient cost data gracefully', async () => {
      const contextWithMissingIngredients = {
        ...mockCostingContext,
        ingredientCosts: [] // Empty ingredient costs
      }

      const result = await costingEngine.calculatePortionCost(
        mockRecipe,
        mockVariant,
        contextWithMissingIngredients
      )

      expect(result).toBeDefined()
      expect(result.ingredientCost).toBe(0)
      expect(result.totalCost).toBeGreaterThan(0) // Should still have labor and overhead costs
    })

    it('should handle zero waste scenarios', async () => {
      const contextWithNoWaste = {
        ...mockCostingContext,
        wastePatterns: {
          ...mockCostingContext.wastePatterns,
          totalWastePercentage: 0,
          variantWaste: [{
            variantId: 'slice',
            variantName: 'Single Slice',
            wastePercentage: 0,
            wasteValue: 0,
            wasteDrivers: []
          }]
        }
      }

      const result = await costingEngine.calculatePortionCost(
        mockRecipe,
        mockVariant,
        contextWithNoWaste
      )

      expect(result).toBeDefined()
      expect(result.wasteCost).toBe(0)
    })

    it('should handle extreme pricing constraints', async () => {
      const costBreakdown = await costingEngine.calculatePortionCost(
        mockRecipe,
        mockVariant,
        mockCostingContext
      )

      const extremePricingRequest: PricingOptimizationRequest = {
        recipeId: 'pizza-1',
        variantId: 'slice',
        objectives: [{
          type: 'maximize_profit',
          weight: 1.0,
          priority: 'high'
        }],
        constraints: [
          {
            type: 'max_price_point',
            value: costBreakdown.totalCost * 1.01, // Only 1% margin allowed
            description: 'Extremely low price constraint',
            flexibility: 'strict'
          }
        ],
        timeHorizon: 'short_term',
        marketConditions: [],
        competitiveContext: {
          directCompetitors: [],
          indirectCompetitors: [],
          marketGap: []
        }
      }

      const result = await costingEngine.generateDynamicPricing(
        mockRecipe,
        mockVariant,
        costBreakdown,
        extremePricingRequest
      )

      expect(result).toBeDefined()
      expect(result.recommendedPrice).toBeLessThanOrEqual(costBreakdown.totalCost * 1.01)
      expect(result.projectedMarginPercentage).toBeLessThan(2) // Very low margin
    })
  })

  describe('Performance Tests', () => {
    it('should calculate costs within reasonable time', async () => {
      const startTime = Date.now()

      await costingEngine.calculatePortionCost(
        mockRecipe,
        mockVariant,
        mockCostingContext
      )

      const endTime = Date.now()
      const executionTime = endTime - startTime

      expect(executionTime).toBeLessThan(1000) // Should complete within 1 second
    })

    it('should handle multiple variants efficiently', async () => {
      const multipleVariants = [
        { ...mockVariant, id: 'slice-1', name: 'Small Slice' },
        { ...mockVariant, id: 'slice-2', name: 'Medium Slice' },
        { ...mockVariant, id: 'slice-3', name: 'Large Slice' }
      ]

      const contextWithMultipleVariants = {
        ...mockCostingContext,
        variants: multipleVariants
      }

      const startTime = Date.now()

      const results = await Promise.all(
        multipleVariants.map(variant =>
          costingEngine.calculatePortionCost(
            mockRecipe,
            variant,
            contextWithMultipleVariants
          )
        )
      )

      const endTime = Date.now()
      const executionTime = endTime - startTime

      expect(results).toHaveLength(3)
      expect(executionTime).toBeLessThan(3000) // Should complete within 3 seconds
    })
  })
})