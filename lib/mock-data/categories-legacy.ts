export interface RecipeCategory {
  id: string
  name: string
  code: string
  description: string
  parentId: string | null
  level: number
  status: 'active' | 'inactive'
  sortOrder: number
  defaultCostSettings: {
    laborCostPercentage: number
    overheadPercentage: number
    targetFoodCostPercentage: number
  }
  defaultMargins: {
    minimumMargin: number
    targetMargin: number
  }
  recipeCount: number
  activeRecipeCount: number
  averageCost: number
  averageMargin: number
  lastUpdated: string
}

export const mockCategories: RecipeCategory[] = [
  {
    id: "1",
    name: "Appetizers",
    code: "APP",
    description: "Small dishes served before main courses",
    parentId: null,
    level: 1,
    status: "active",
    sortOrder: 1,
    defaultCostSettings: {
      laborCostPercentage: 30,
      overheadPercentage: 20,
      targetFoodCostPercentage: 30
    },
    defaultMargins: {
      minimumMargin: 65,
      targetMargin: 70
    },
    recipeCount: 45,
    activeRecipeCount: 38,
    averageCost: 4.50,
    averageMargin: 68.5,
    lastUpdated: "2024-01-15"
  },
  {
    id: "1-1",
    name: "Cold Appetizers",
    code: "APP-COLD",
    description: "Appetizers served cold or at room temperature",
    parentId: "1",
    level: 2,
    status: "active",
    sortOrder: 1,
    defaultCostSettings: {
      laborCostPercentage: 25,
      overheadPercentage: 18,
      targetFoodCostPercentage: 28
    },
    defaultMargins: {
      minimumMargin: 68,
      targetMargin: 72
    },
    recipeCount: 20,
    activeRecipeCount: 18,
    averageCost: 3.75,
    averageMargin: 70.2,
    lastUpdated: "2024-01-14"
  },
  {
    id: "1-2",
    name: "Hot Appetizers",
    code: "APP-HOT",
    description: "Appetizers served hot",
    parentId: "1",
    level: 2,
    status: "active",
    sortOrder: 2,
    defaultCostSettings: {
      laborCostPercentage: 35,
      overheadPercentage: 22,
      targetFoodCostPercentage: 32
    },
    defaultMargins: {
      minimumMargin: 62,
      targetMargin: 68
    },
    recipeCount: 25,
    activeRecipeCount: 20,
    averageCost: 5.25,
    averageMargin: 66.8,
    lastUpdated: "2024-01-15"
  },
  {
    id: "2",
    name: "Main Courses",
    code: "MAIN",
    description: "Primary dishes for a meal",
    parentId: null,
    level: 1,
    status: "active",
    sortOrder: 2,
    defaultCostSettings: {
      laborCostPercentage: 35,
      overheadPercentage: 25,
      targetFoodCostPercentage: 32
    },
    defaultMargins: {
      minimumMargin: 60,
      targetMargin: 65
    },
    recipeCount: 80,
    activeRecipeCount: 65,
    averageCost: 12.50,
    averageMargin: 63.5,
    lastUpdated: "2024-01-15"
  },
  {
    id: "2-1",
    name: "Meat Dishes",
    code: "MAIN-MEAT",
    description: "Main courses featuring meat as primary ingredient",
    parentId: "2",
    level: 2,
    status: "active",
    sortOrder: 1,
    defaultCostSettings: {
      laborCostPercentage: 32,
      overheadPercentage: 23,
      targetFoodCostPercentage: 35
    },
    defaultMargins: {
      minimumMargin: 58,
      targetMargin: 63
    },
    recipeCount: 30,
    activeRecipeCount: 25,
    averageCost: 15.75,
    averageMargin: 61.2,
    lastUpdated: "2024-01-14"
  },
  {
    id: "2-2",
    name: "Seafood",
    code: "MAIN-FISH",
    description: "Main courses featuring seafood",
    parentId: "2",
    level: 2,
    status: "active",
    sortOrder: 2,
    defaultCostSettings: {
      laborCostPercentage: 30,
      overheadPercentage: 20,
      targetFoodCostPercentage: 38
    },
    defaultMargins: {
      minimumMargin: 55,
      targetMargin: 60
    },
    recipeCount: 25,
    activeRecipeCount: 20,
    averageCost: 18.50,
    averageMargin: 58.5,
    lastUpdated: "2024-01-15"
  },
  {
    id: "2-3",
    name: "Vegetarian",
    code: "MAIN-VEG",
    description: "Vegetarian main courses",
    parentId: "2",
    level: 2,
    status: "active",
    sortOrder: 3,
    defaultCostSettings: {
      laborCostPercentage: 35,
      overheadPercentage: 25,
      targetFoodCostPercentage: 28
    },
    defaultMargins: {
      minimumMargin: 65,
      targetMargin: 70
    },
    recipeCount: 25,
    activeRecipeCount: 20,
    averageCost: 8.25,
    averageMargin: 68.5,
    lastUpdated: "2024-01-13"
  },
  {
    id: "3",
    name: "Desserts",
    code: "DES",
    description: "Sweet dishes served after main courses",
    parentId: null,
    level: 1,
    status: "active",
    sortOrder: 3,
    defaultCostSettings: {
      laborCostPercentage: 40,
      overheadPercentage: 25,
      targetFoodCostPercentage: 25
    },
    defaultMargins: {
      minimumMargin: 70,
      targetMargin: 75
    },
    recipeCount: 35,
    activeRecipeCount: 30,
    averageCost: 3.75,
    averageMargin: 72.5,
    lastUpdated: "2024-01-15"
  }
]

