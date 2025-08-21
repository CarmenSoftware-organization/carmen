import { RecipeMapping } from "./types"
import { Recipe, RecipeYieldVariant } from "@/app/(main)/operational-planning/recipe-management/recipes/data/mock-recipes"

/**
 * Fractional Recipe Mapping Helper
 * 
 * This module provides utilities to manage the relationship between:
 * 1. Base recipes with multiple yield variants
 * 2. Multiple POS items that map to different variants of the same recipe
 * 
 * Example: Margherita Pizza recipe has 3 variants (slice, half, whole)
 *          Each variant maps to different POS items with different conversion rates
 */

export interface FractionalMappingGroup {
  baseRecipeId: string
  recipeName: string
  fractionalSalesType: string
  variants: {
    recipeVariant: RecipeYieldVariant
    posMapping: RecipeMapping
  }[]
  totalMappings: number
  unmappedVariants: RecipeYieldVariant[]
}

/**
 * Groups POS mappings by base recipe for fractional sales items
 */
export function groupMappingsByBaseRecipe(
  mappings: RecipeMapping[],
  recipes: Recipe[]
): FractionalMappingGroup[] {
  const groups = new Map<string, FractionalMappingGroup>()
  
  // Find recipes that support fractional sales
  const fractionalRecipes = recipes.filter(recipe => recipe.allowsFractionalSales)
  
  // Create groups for each fractional recipe
  fractionalRecipes.forEach(recipe => {
    if (!groups.has(recipe.id)) {
      groups.set(recipe.id, {
        baseRecipeId: recipe.id,
        recipeName: recipe.name,
        fractionalSalesType: recipe.fractionalSalesType || 'custom',
        variants: [],
        totalMappings: 0,
        unmappedVariants: [...recipe.yieldVariants]
      })
    }
  })
  
  // Add mappings to their respective groups
  mappings
    .filter(mapping => mapping.baseRecipeId && groups.has(mapping.baseRecipeId))
    .forEach(mapping => {
      const group = groups.get(mapping.baseRecipeId!)
      if (group) {
        const recipe = fractionalRecipes.find(r => r.id === mapping.baseRecipeId)
        const variant = recipe?.yieldVariants.find(v => v.id === mapping.recipeVariantId)
        
        if (variant) {
          group.variants.push({
            recipeVariant: variant,
            posMapping: mapping
          })
          
          // Remove from unmapped variants
          group.unmappedVariants = group.unmappedVariants.filter(v => v.id !== variant.id)
        }
        
        group.totalMappings++
      }
    })
  
  return Array.from(groups.values()).filter(group => group.variants.length > 0)
}

/**
 * Finds unmapped recipe variants that need POS mappings
 */
export function findUnmappedVariants(
  recipes: Recipe[],
  mappings: RecipeMapping[]
): { recipe: Recipe, unmappedVariants: RecipeYieldVariant[] }[] {
  const results: { recipe: Recipe, unmappedVariants: RecipeYieldVariant[] }[] = []
  
  const fractionalRecipes = recipes.filter(recipe => recipe.allowsFractionalSales)
  
  fractionalRecipes.forEach(recipe => {
    const recipeMappings = mappings.filter(m => m.baseRecipeId === recipe.id)
    const mappedVariantIds = new Set(recipeMappings.map(m => m.recipeVariantId).filter(Boolean))
    
    const unmappedVariants = recipe.yieldVariants.filter(variant => 
      !mappedVariantIds.has(variant.id)
    )
    
    if (unmappedVariants.length > 0) {
      results.push({
        recipe,
        unmappedVariants
      })
    }
  })
  
  return results
}

/**
 * Creates suggested POS mapping for a recipe variant
 */
export function createSuggestedMapping(
  recipe: Recipe,
  variant: RecipeYieldVariant,
  posItemCode: string
): Partial<RecipeMapping> {
  return {
    posItemCode,
    posDescription: `${variant.name} - ${recipe.name}`,
    recipeCode: recipe.id,
    recipeName: recipe.name,
    posUnit: variant.unit,
    recipeUnit: recipe.yieldUnit,
    conversionRate: variant.conversionRate,
    recipeVariantId: variant.id,
    variantName: variant.name,
    baseRecipeId: recipe.id,
    fractionalSalesType: recipe.fractionalSalesType,
    category: recipe.category === 'main-course' ? 'Main Course' : 
              recipe.category === 'dessert' ? 'Desserts' : 
              recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1),
    status: "unmapped" as const
  }
}

/**
 * Validates that conversion rates match between recipe variants and POS mappings
 */
export function validateMappingConsistency(
  recipe: Recipe,
  mappings: RecipeMapping[]
): { valid: boolean, errors: string[] } {
  const errors: string[] = []
  const recipeMappings = mappings.filter(m => m.baseRecipeId === recipe.id)
  
  recipeMappings.forEach(mapping => {
    const variant = recipe.yieldVariants.find(v => v.id === mapping.recipeVariantId)
    
    if (!variant) {
      errors.push(`Mapping ${mapping.posItemCode} references non-existent variant ${mapping.recipeVariantId}`)
      return
    }
    
    if (Math.abs(variant.conversionRate - mapping.conversionRate) > 0.0001) {
      errors.push(
        `Conversion rate mismatch for ${mapping.posItemCode}: ` +
        `Recipe variant has ${variant.conversionRate}, mapping has ${mapping.conversionRate}`
      )
    }
    
    if (variant.sellingPrice && mapping.conversionRate > 0) {
      // Could add price validation here if needed
    }
  })
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Calculates inventory impact when POS transaction occurs
 */
export function calculateInventoryImpact(
  mapping: RecipeMapping,
  quantitySold: number,
  recipe: Recipe
): {
  recipeId: string
  recipeName: string
  variantName: string
  quantityConsumed: number
  ingredients: {
    id: string
    name: string
    quantityUsed: number
    unit: string
    cost: number
  }[]
} {
  const variant = recipe.yieldVariants.find(v => v.id === mapping.recipeVariantId)
  const baseQuantityConsumed = quantitySold * mapping.conversionRate
  
  return {
    recipeId: recipe.id,
    recipeName: recipe.name,
    variantName: variant?.name || 'Unknown Variant',
    quantityConsumed: baseQuantityConsumed,
    ingredients: recipe.ingredients.map(ingredient => ({
      id: ingredient.id,
      name: ingredient.name,
      quantityUsed: ingredient.quantity * baseQuantityConsumed,
      unit: ingredient.unit,
      cost: ingredient.totalCost * baseQuantityConsumed
    }))
  }
}

/**
 * Gets mapping statistics for dashboard display
 */
export function getMappingStatistics(
  recipes: Recipe[],
  mappings: RecipeMapping[]
): {
  totalFractionalRecipes: number
  totalMappedVariants: number
  totalUnmappedVariants: number
  mappingCompleteness: number
  fractionalSalesTypes: { type: string, count: number }[]
} {
  const fractionalRecipes = recipes.filter(r => r.allowsFractionalSales)
  const totalVariants = fractionalRecipes.reduce((sum, recipe) => sum + recipe.yieldVariants.length, 0)
  const mappedVariants = mappings.filter(m => m.recipeVariantId).length
  
  const typeGroups = fractionalRecipes.reduce((acc, recipe) => {
    const type = recipe.fractionalSalesType || 'custom'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return {
    totalFractionalRecipes: fractionalRecipes.length,
    totalMappedVariants: mappedVariants,
    totalUnmappedVariants: totalVariants - mappedVariants,
    mappingCompleteness: totalVariants > 0 ? (mappedVariants / totalVariants) * 100 : 100,
    fractionalSalesTypes: Object.entries(typeGroups).map(([type, count]) => ({ type, count }))
  }
}