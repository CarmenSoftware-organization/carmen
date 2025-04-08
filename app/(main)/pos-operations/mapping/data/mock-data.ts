import { mockRecipes } from "@/app/data/mock-recipes"

export interface MappingItem {
  id: string
  name: string
  sku: string
  lastSale: string
  saleFrequency: "High" | "Medium" | "Low"
  status: "mapped" | "unmapped"
  lastUpdated?: string
  components?: number
}

// Convert recipe data to unmapped items
export const mockUnmappedItems: MappingItem[] = mockRecipes
  .slice(0, 3)
  .map((recipe) => ({
    id: recipe.id,
    name: recipe.name,
    sku: `SKU-${recipe.id}`,
    lastSale: "2024-03-15",
    saleFrequency: "High",
    status: "unmapped",
  }))

// Convert recipe data to mapped items
export const mockMappedItems: MappingItem[] = mockRecipes
  .slice(3, 6)
  .map((recipe) => ({
    id: recipe.id,
    name: recipe.name,
    sku: `SKU-${recipe.id}`,
    lastSale: "2024-03-14",
    saleFrequency: "Medium",
    status: "mapped",
    components: Math.floor(Math.random() * 5) + 3, // Random number of components between 3-7
    lastUpdated: "2024-03-10",
  })) 