/**
 * Fractional Stock Deduction Service
 * 
 * Handles complex inventory calculations when fractional items are sold through POS.
 * Supports scenarios like:
 * - Selling pizza slices from whole pizzas
 * - Selling cake slices from whole cakes
 * - Inventory deduction with wastage tracking
 * - Multi-level recipe ingredient calculations
 */

import { Recipe, RecipeYieldVariant, Ingredient } from "@/app/(main)/operational-planning/recipe-management/recipes/data/mock-recipes"
import { RecipeMapping } from "@/app/(main)/system-administration/system-integrations/pos/mapping/recipes/types"

export interface POSTransaction {
  id: string
  posItemCode: string
  quantitySold: number
  salePrice: number
  timestamp: Date
  location: string
  cashier: string
}

export interface StockDeductionResult {
  transactionId: string
  success: boolean
  errors: string[]
  deductions: RecipeDeduction[]
  totalCost: number
  totalWastage: number
  inventoryImpacts: InventoryImpact[]
}

export interface RecipeDeduction {
  recipeId: string
  recipeName: string
  variantId: string
  variantName: string
  quantityProduced: number  // How many base recipes were "used"
  quantityConsumed: number  // Actual quantity deducted considering wastage
  conversionRate: number
  unitCost: number
  totalCost: number
  ingredientDeductions: IngredientDeduction[]
}

export interface IngredientDeduction {
  ingredientId: string
  ingredientName: string
  type: 'product' | 'recipe'
  quantityRequired: number   // Theoretical quantity needed
  quantityDeducted: number   // Actual quantity deducted (including wastage)
  unit: string
  costPerUnit: number
  totalCost: number
  wastageRate: number
  wastageQuantity: number
  availableStock: number
  stockAfterDeduction: number
  stockShortfall?: number
}

export interface InventoryImpact {
  itemId: string
  itemName: string
  type: 'product' | 'recipe'
  previousStock: number
  quantityDeducted: number
  newStock: number
  unit: string
  location: string
  timestamp: Date
  reason: string
  reference: string
}

/**
 * Main service class for fractional stock deduction
 */
export class FractionalStockDeductionService {
  
  /**
   * Process a POS transaction and calculate all stock deductions
   */
  async processTransaction(
    transaction: POSTransaction,
    mapping: RecipeMapping,
    recipe: Recipe,
    currentInventory: Map<string, number>
  ): Promise<StockDeductionResult> {
    const result: StockDeductionResult = {
      transactionId: transaction.id,
      success: true,
      errors: [],
      deductions: [],
      totalCost: 0,
      totalWastage: 0,
      inventoryImpacts: []
    }
    
    try {
      // Find the recipe variant
      const variant = recipe.yieldVariants.find(v => v.id === mapping.recipeVariantId)
      if (!variant) {
        result.success = false
        result.errors.push(`Recipe variant ${mapping.recipeVariantId} not found`)
        return result
      }
      
      // Calculate base recipe quantity needed
      const baseRecipeQuantity = transaction.quantitySold * mapping.conversionRate
      
      // Add variant-specific wastage
      const variantWastageRate = variant.wastageRate || 0
      const totalQuantityWithWastage = baseRecipeQuantity * (1 + variantWastageRate / 100)
      
      // Process recipe deduction
      const recipeDeduction = await this.processRecipeDeduction(
        recipe,
        variant,
        baseRecipeQuantity,
        totalQuantityWithWastage,
        currentInventory,
        transaction.location
      )
      
      result.deductions.push(recipeDeduction)
      result.totalCost += recipeDeduction.totalCost
      result.totalWastage += recipeDeduction.quantityConsumed - recipeDeduction.quantityProduced
      
      // Collect inventory impacts
      recipeDeduction.ingredientDeductions.forEach(ingredient => {
        result.inventoryImpacts.push({
          itemId: ingredient.ingredientId,
          itemName: ingredient.ingredientName,
          type: ingredient.type,
          previousStock: ingredient.availableStock,
          quantityDeducted: ingredient.quantityDeducted,
          newStock: ingredient.stockAfterDeduction,
          unit: ingredient.unit,
          location: transaction.location,
          timestamp: transaction.timestamp,
          reason: `POS Sale: ${mapping.posDescription}`,
          reference: transaction.id
        })
        
        // Check for stock shortfalls
        if (ingredient.stockShortfall && ingredient.stockShortfall > 0) {
          result.errors.push(
            `Insufficient stock for ${ingredient.ingredientName}. ` +
            `Required: ${ingredient.quantityDeducted} ${ingredient.unit}, ` +
            `Available: ${ingredient.availableStock} ${ingredient.unit}`
          )
        }
      })
      
      // Set success based on errors
      result.success = result.errors.length === 0
      
    } catch (error) {
      result.success = false
      result.errors.push(`Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    
    return result
  }
  
  /**
   * Process deduction for a single recipe
   */
  private async processRecipeDeduction(
    recipe: Recipe,
    variant: RecipeYieldVariant,
    baseQuantity: number,
    quantityWithWastage: number,
    currentInventory: Map<string, number>,
    location: string
  ): Promise<RecipeDeduction> {
    
    const ingredientDeductions: IngredientDeduction[] = []
    let totalCost = 0
    
    // Process each ingredient in the recipe
    for (const ingredient of recipe.ingredients) {
      const deduction = await this.processIngredientDeduction(
        ingredient,
        baseQuantity,
        quantityWithWastage,
        currentInventory,
        location
      )
      
      ingredientDeductions.push(deduction)
      totalCost += deduction.totalCost
      
      // Update current inventory for subsequent calculations
      currentInventory.set(
        ingredient.id,
        Math.max(0, deduction.stockAfterDeduction)
      )
    }
    
    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      variantId: variant.id,
      variantName: variant.name,
      quantityProduced: baseQuantity,
      quantityConsumed: quantityWithWastage,
      conversionRate: variant.conversionRate,
      unitCost: variant.costPerUnit,
      totalCost,
      ingredientDeductions
    }
  }
  
  /**
   * Process deduction for a single ingredient
   */
  private async processIngredientDeduction(
    ingredient: Ingredient,
    baseRecipeQuantity: number,
    quantityWithWastage: number,
    currentInventory: Map<string, number>,
    location: string
  ): Promise<IngredientDeduction> {
    
    // Calculate theoretical quantity needed (based on recipe)
    const theoreticalQuantity = ingredient.quantity * baseRecipeQuantity
    
    // Add ingredient-specific wastage
    const ingredientWastage = ingredient.wastage || 0
    const actualQuantityNeeded = theoreticalQuantity * (1 + ingredientWastage / 100)
    
    // Get current stock
    const availableStock = currentInventory.get(ingredient.id) || 0
    
    // Calculate actual deduction (limited by available stock)
    const quantityDeducted = Math.min(actualQuantityNeeded, availableStock)
    const stockAfterDeduction = Math.max(0, availableStock - quantityDeducted)
    const stockShortfall = actualQuantityNeeded > availableStock ? 
      actualQuantityNeeded - availableStock : 0
    
    // Calculate costs
    const totalCost = quantityDeducted * ingredient.costPerUnit
    const wastageQuantity = quantityDeducted - theoreticalQuantity
    
    return {
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
      type: ingredient.type,
      quantityRequired: theoreticalQuantity,
      quantityDeducted,
      unit: ingredient.unit,
      costPerUnit: ingredient.costPerUnit,
      totalCost,
      wastageRate: ingredientWastage,
      wastageQuantity: Math.max(0, wastageQuantity),
      availableStock,
      stockAfterDeduction,
      stockShortfall: stockShortfall > 0 ? stockShortfall : undefined
    }
  }
  
  /**
   * Batch process multiple transactions
   */
  async processBatchTransactions(
    transactions: POSTransaction[],
    mappings: Map<string, RecipeMapping>,
    recipes: Map<string, Recipe>,
    initialInventory: Map<string, number>
  ): Promise<{
    results: StockDeductionResult[]
    finalInventory: Map<string, number>
    batchSummary: {
      totalTransactions: number
      successfulTransactions: number
      failedTransactions: number
      totalCost: number
      totalWastage: number
      inventoryItems: number
    }
  }> {
    
    const results: StockDeductionResult[] = []
    const workingInventory = new Map(initialInventory)
    let totalCost = 0
    let totalWastage = 0
    
    // Sort transactions by timestamp
    const sortedTransactions = [...transactions].sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    )
    
    for (const transaction of sortedTransactions) {
      const mapping = mappings.get(transaction.posItemCode)
      if (!mapping) {
        results.push({
          transactionId: transaction.id,
          success: false,
          errors: [`No mapping found for POS item ${transaction.posItemCode}`],
          deductions: [],
          totalCost: 0,
          totalWastage: 0,
          inventoryImpacts: []
        })
        continue
      }
      
      const recipe = recipes.get(mapping.recipeCode)
      if (!recipe) {
        results.push({
          transactionId: transaction.id,
          success: false,
          errors: [`Recipe ${mapping.recipeCode} not found`],
          deductions: [],
          totalCost: 0,
          totalWastage: 0,
          inventoryImpacts: []
        })
        continue
      }
      
      const result = await this.processTransaction(
        transaction,
        mapping,
        recipe,
        workingInventory
      )
      
      results.push(result)
      totalCost += result.totalCost
      totalWastage += result.totalWastage
    }
    
    const successfulCount = results.filter(r => r.success).length
    const failedCount = results.length - successfulCount
    
    return {
      results,
      finalInventory: workingInventory,
      batchSummary: {
        totalTransactions: transactions.length,
        successfulTransactions: successfulCount,
        failedTransactions: failedCount,
        totalCost,
        totalWastage,
        inventoryItems: workingInventory.size
      }
    }
  }
  
  /**
   * Simulate stock deduction to check feasibility without committing
   */
  async simulateDeduction(
    transaction: POSTransaction,
    mapping: RecipeMapping,
    recipe: Recipe,
    currentInventory: Map<string, number>
  ): Promise<{
    feasible: boolean
    issues: string[]
    estimatedCost: number
    requiredIngredients: {
      id: string
      name: string
      required: number
      available: number
      shortfall: number
      unit: string
    }[]
  }> {
    
    // Clone inventory to avoid mutations
    const simulationInventory = new Map(currentInventory)
    
    const result = await this.processTransaction(
      transaction,
      mapping,
      recipe,
      simulationInventory
    )
    
    const requiredIngredients = result.deductions.flatMap(deduction =>
      deduction.ingredientDeductions.map(ingredient => ({
        id: ingredient.ingredientId,
        name: ingredient.ingredientName,
        required: ingredient.quantityDeducted,
        available: ingredient.availableStock,
        shortfall: ingredient.stockShortfall || 0,
        unit: ingredient.unit
      }))
    )
    
    return {
      feasible: result.success,
      issues: result.errors,
      estimatedCost: result.totalCost,
      requiredIngredients
    }
  }
  
  /**
   * Calculate theoretical vs actual consumption variance
   */
  calculateVarianceReport(
    results: StockDeductionResult[],
    periodStart: Date,
    periodEnd: Date
  ): {
    period: { start: Date, end: Date }
    totalTheoretical: number
    totalActual: number
    totalWastage: number
    variancePercentage: number
    ingredientVariances: {
      ingredientId: string
      ingredientName: string
      theoretical: number
      actual: number
      wastage: number
      variance: number
      unit: string
    }[]
  } {
    
    const ingredientTotals = new Map<string, {
      name: string
      theoretical: number
      actual: number
      unit: string
    }>()
    
    let totalTheoretical = 0
    let totalActual = 0
    
    // Aggregate data from all results
    results.forEach(result => {
      result.deductions.forEach(deduction => {
        deduction.ingredientDeductions.forEach(ingredient => {
          const key = ingredient.ingredientId
          const existing = ingredientTotals.get(key) || {
            name: ingredient.ingredientName,
            theoretical: 0,
            actual: 0,
            unit: ingredient.unit
          }
          
          existing.theoretical += ingredient.quantityRequired
          existing.actual += ingredient.quantityDeducted
          
          ingredientTotals.set(key, existing)
          
          totalTheoretical += ingredient.quantityRequired * ingredient.costPerUnit
          totalActual += ingredient.totalCost
        })
      })
    })
    
    // Calculate variances
    const ingredientVariances = Array.from(ingredientTotals.entries()).map(([id, data]) => ({
      ingredientId: id,
      ingredientName: data.name,
      theoretical: data.theoretical,
      actual: data.actual,
      wastage: data.actual - data.theoretical,
      variance: data.theoretical > 0 ? 
        ((data.actual - data.theoretical) / data.theoretical) * 100 : 0,
      unit: data.unit
    }))
    
    const totalWastage = totalActual - totalTheoretical
    const variancePercentage = totalTheoretical > 0 ? 
      (totalWastage / totalTheoretical) * 100 : 0
    
    return {
      period: { start: periodStart, end: periodEnd },
      totalTheoretical,
      totalActual,
      totalWastage,
      variancePercentage,
      ingredientVariances
    }
  }
}