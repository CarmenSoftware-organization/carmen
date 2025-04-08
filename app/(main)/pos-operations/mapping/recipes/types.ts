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
  category: string
  status: StatusType
} 