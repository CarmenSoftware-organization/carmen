/**
 * POS Recipe Mapping Types
 * Types for mapping POS items to recipe variants for fractional sales tracking
 */

export interface RecipeMapping {
  id: string
  posItemCode: string
  posItemName: string
  recipeId: string
  recipeName: string
  variantId: string
  variantName: string
  conversionRate: number // How much of base recipe this POS item represents
  fractionalSalesType: 'pizza-slice' | 'cake-slice' | 'bottle-glass' | 'portion-control' | 'custom'
  isActive: boolean
  createdAt: Date
  updatedAt?: Date
}
