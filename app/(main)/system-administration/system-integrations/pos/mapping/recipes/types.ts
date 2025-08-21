import { StatusType } from "../components"

export interface RecipeMapping {
  id: string
  posItemCode: string
  posDescription: string
  recipeCode: string
  recipeName: string
  posUnit: string
  recipeUnit: string
  conversionRate: number
  // Enhanced fractional sales support
  recipeVariantId?: string  // Maps to RecipeYieldVariant.id from recipe system
  variantName?: string      // Display name for the variant (e.g., "Pizza Slice", "Half Cake")
  baseRecipeId?: string     // ID of the base recipe when multiple POS items map to same recipe
  fractionalSalesType?: 'pizza-slice' | 'cake-slice' | 'bottle-glass' | 'portion-control' | 'custom'
  category: string
  status: StatusType
  lastSyncDate?: Date
  lastSyncStatus?: StatusType
  createdAt: Date
  updatedAt: Date
}

export interface RecipeMappingFormData {
  posItemCode: string
  posDescription: string
  recipeCode: string
  recipeName: string
  posUnit: string
  recipeUnit: string
  conversionRate: number
  // Enhanced fractional sales support
  recipeVariantId?: string
  variantName?: string
  baseRecipeId?: string
  fractionalSalesType?: 'pizza-slice' | 'cake-slice' | 'bottle-glass' | 'portion-control' | 'custom'
  category: string
  status: StatusType
} 