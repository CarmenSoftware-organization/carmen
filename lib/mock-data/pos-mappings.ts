/**
 * POS Integration Mock Data - Mappings
 *
 * Centralized mock data for POS item to recipe mappings including
 * mapped items, unmapped items, mapping configurations, and recipe search results.
 */

import {
  POSMapping,
  POSItem,
  RecipeSearchResult,
  MappingPreview
} from '@/lib/types'

// ====== MOCK POS MAPPINGS ======

export const mockPOSMappings: POSMapping[] = [
  {
    id: 'mapping-001',
    posItemId: 'pos-item-101',
    posItemName: 'Margherita Pizza',
    posItemCategory: 'Main Course',
    recipeId: 'recipe-001',
    recipeName: 'Margherita Pizza',
    recipeCategory: 'Pizza',
    portionSize: 1,
    unit: 'whole',
    isActive: true,
    mappedBy: {
      id: 'user-001',
      name: 'John Smith'
    },
    mappedAt: '2025-10-01T09:00:00Z',
    lastVerifiedAt: '2025-10-15T14:30:00Z',
    createdAt: new Date('2025-10-01T09:00:00Z'),
    createdBy: 'user-001',
    updatedAt: new Date('2025-10-15T14:30:00Z'),
    updatedBy: 'user-001'
  },
  {
    id: 'mapping-002',
    posItemId: 'pos-item-102',
    posItemName: 'House Salad',
    posItemCategory: 'Appetizer',
    recipeId: 'recipe-002',
    recipeName: 'House Salad',
    recipeCategory: 'Salad',
    portionSize: 1,
    unit: 'serving',
    isActive: true,
    mappedBy: {
      id: 'user-001',
      name: 'John Smith'
    },
    mappedAt: '2025-10-01T09:15:00Z',
    lastVerifiedAt: '2025-10-15T14:30:00Z',
    createdAt: new Date('2025-10-01T09:15:00Z'),
    createdBy: 'user-001',
    updatedAt: new Date('2025-10-15T14:30:00Z'),
    updatedBy: 'user-001'
  },
  {
    id: 'mapping-003',
    posItemId: 'pos-item-103',
    posItemName: 'Caesar Salad',
    posItemCategory: 'Appetizer',
    recipeId: 'recipe-003',
    recipeName: 'Caesar Salad',
    recipeCategory: 'Salad',
    portionSize: 1,
    unit: 'serving',
    isActive: true,
    mappedBy: {
      id: 'user-002',
      name: 'Sarah Johnson'
    },
    mappedAt: '2025-10-01T10:00:00Z',
    lastVerifiedAt: '2025-10-10T11:20:00Z',
    createdAt: new Date('2025-10-01T10:00:00Z'),
    createdBy: 'user-002',
    updatedAt: new Date('2025-10-10T11:20:00Z'),
    updatedBy: 'user-002'
  },
  {
    id: 'mapping-004',
    posItemId: 'pos-item-104',
    posItemName: 'Pepperoni Pizza',
    posItemCategory: 'Main Course',
    recipeId: 'recipe-004',
    recipeName: 'Pepperoni Pizza',
    recipeCategory: 'Pizza',
    portionSize: 1,
    unit: 'whole',
    isActive: true,
    mappedBy: {
      id: 'user-001',
      name: 'John Smith'
    },
    mappedAt: '2025-10-02T08:30:00Z',
    createdAt: new Date('2025-10-02T08:30:00Z'),
    createdBy: 'user-001',
    updatedAt: new Date('2025-10-02T08:30:00Z'),
    updatedBy: 'user-001'
  },
  {
    id: 'mapping-005',
    posItemId: 'pos-item-105',
    posItemName: 'Grilled Chicken Breast',
    posItemCategory: 'Main Course',
    recipeId: 'recipe-005',
    recipeName: 'Grilled Chicken Breast',
    recipeCategory: 'Poultry',
    portionSize: 200,
    unit: 'g',
    isActive: true,
    mappedBy: {
      id: 'user-002',
      name: 'Sarah Johnson'
    },
    mappedAt: '2025-10-02T09:00:00Z',
    createdAt: new Date('2025-10-02T09:00:00Z'),
    createdBy: 'user-002',
    updatedAt: new Date('2025-10-02T09:00:00Z'),
    updatedBy: 'user-002'
  },
  {
    id: 'mapping-006',
    posItemId: 'pos-item-106',
    posItemName: 'French Fries',
    posItemCategory: 'Side Dish',
    recipeId: 'recipe-006',
    recipeName: 'French Fries',
    recipeCategory: 'Sides',
    portionSize: 150,
    unit: 'g',
    isActive: true,
    mappedBy: {
      id: 'user-001',
      name: 'John Smith'
    },
    mappedAt: '2025-10-03T10:15:00Z',
    createdAt: new Date('2025-10-03T10:15:00Z'),
    createdBy: 'user-001',
    updatedAt: new Date('2025-10-03T10:15:00Z'),
    updatedBy: 'user-001'
  },
  {
    id: 'mapping-007',
    posItemId: 'pos-item-107',
    posItemName: 'Iced Tea',
    posItemCategory: 'Beverage',
    recipeId: 'recipe-007',
    recipeName: 'Iced Tea',
    recipeCategory: 'Beverages',
    portionSize: 500,
    unit: 'ml',
    isActive: true,
    mappedBy: {
      id: 'user-003',
      name: 'Mike Chen'
    },
    mappedAt: '2025-10-03T11:00:00Z',
    createdAt: new Date('2025-10-03T11:00:00Z'),
    createdBy: 'user-003',
    updatedAt: new Date('2025-10-03T11:00:00Z'),
    updatedBy: 'user-003'
  }
]

// ====== MOCK UNMAPPED POS ITEMS ======

export const mockUnmappedPOSItems: POSItem[] = [
  {
    id: 'pos-unmapped-001',
    posItemId: 'pos-item-999',
    name: 'Seasonal Special',
    category: 'Specials',
    price: {
      amount: 18.99,
      currency: 'USD'
    },
    isActive: true,
    mappingStatus: 'unmapped',
    lastSyncedAt: '2025-10-18T08:00:00Z'
  },
  {
    id: 'pos-unmapped-002',
    posItemId: 'pos-item-1000',
    name: 'Chef\'s Special Pasta',
    category: 'Main Course',
    price: {
      amount: 22.50,
      currency: 'USD'
    },
    isActive: true,
    mappingStatus: 'unmapped',
    lastSyncedAt: '2025-10-18T08:00:00Z'
  },
  {
    id: 'pos-unmapped-003',
    posItemId: 'pos-item-1001',
    name: 'Exotic Smoothie',
    category: 'Beverage',
    price: {
      amount: 7.99,
      currency: 'USD'
    },
    isActive: true,
    mappingStatus: 'unmapped',
    lastSyncedAt: '2025-10-18T08:00:00Z'
  },
  {
    id: 'pos-unmapped-004',
    posItemId: 'pos-item-1002',
    name: 'Mystery Dessert',
    category: 'Dessert',
    price: {
      amount: 9.99,
      currency: 'USD'
    },
    isActive: true,
    mappingStatus: 'unmapped',
    lastSyncedAt: '2025-10-17T20:00:00Z'
  }
]

// ====== MOCK MAPPED POS ITEMS ======

export const mockMappedPOSItems: POSItem[] = [
  {
    id: 'pos-mapped-001',
    posItemId: 'pos-item-101',
    name: 'Margherita Pizza',
    category: 'Main Course',
    price: {
      amount: 15.00,
      currency: 'USD'
    },
    isActive: true,
    mappingStatus: 'mapped',
    mappedRecipe: {
      id: 'recipe-001',
      name: 'Margherita Pizza'
    },
    lastSyncedAt: '2025-10-18T08:00:00Z'
  },
  {
    id: 'pos-mapped-002',
    posItemId: 'pos-item-102',
    name: 'House Salad',
    category: 'Appetizer',
    price: {
      amount: 8.50,
      currency: 'USD'
    },
    isActive: true,
    mappingStatus: 'mapped',
    mappedRecipe: {
      id: 'recipe-002',
      name: 'House Salad'
    },
    lastSyncedAt: '2025-10-18T08:00:00Z'
  },
  {
    id: 'pos-mapped-003',
    posItemId: 'pos-item-103',
    name: 'Caesar Salad',
    category: 'Appetizer',
    price: {
      amount: 9.50,
      currency: 'USD'
    },
    isActive: true,
    mappingStatus: 'mapped',
    mappedRecipe: {
      id: 'recipe-003',
      name: 'Caesar Salad'
    },
    lastSyncedAt: '2025-10-18T08:00:00Z'
  },
  {
    id: 'pos-mapped-004',
    posItemId: 'pos-item-104',
    name: 'Pepperoni Pizza',
    category: 'Main Course',
    price: {
      amount: 17.00,
      currency: 'USD'
    },
    isActive: true,
    mappingStatus: 'mapped',
    mappedRecipe: {
      id: 'recipe-004',
      name: 'Pepperoni Pizza'
    },
    lastSyncedAt: '2025-10-18T08:00:00Z'
  }
]

// ====== MOCK RECIPE SEARCH RESULTS ======

export const mockRecipeSearchResults: RecipeSearchResult[] = [
  {
    id: 'recipe-001',
    name: 'Margherita Pizza',
    category: 'Pizza',
    baseUnit: 'whole',
    compatibleUnits: [
      {
        id: 'unit-001',
        name: 'whole',
        abbreviation: 'whole',
        conversionFactor: 1
      },
      {
        id: 'unit-002',
        name: 'slice',
        abbreviation: 'slice',
        conversionFactor: 0.125
      }
    ],
    averageCost: {
      amount: 8.50,
      currency: 'USD'
    },
    ingredients: [
      {
        id: 'ing-001',
        name: 'Pizza Dough',
        quantity: 400,
        unit: 'g'
      },
      {
        id: 'ing-002',
        name: 'Tomato Sauce',
        quantity: 200,
        unit: 'ml'
      },
      {
        id: 'ing-003',
        name: 'Mozzarella Cheese',
        quantity: 300,
        unit: 'g'
      },
      {
        id: 'ing-004',
        name: 'Fresh Basil',
        quantity: 20,
        unit: 'g'
      }
    ]
  },
  {
    id: 'recipe-002',
    name: 'House Salad',
    category: 'Salad',
    baseUnit: 'serving',
    compatibleUnits: [
      {
        id: 'unit-003',
        name: 'serving',
        abbreviation: 'srv',
        conversionFactor: 1
      },
      {
        id: 'unit-004',
        name: 'bowl',
        abbreviation: 'bowl',
        conversionFactor: 1.5
      }
    ],
    averageCost: {
      amount: 4.25,
      currency: 'USD'
    },
    ingredients: [
      {
        id: 'ing-005',
        name: 'Mixed Greens',
        quantity: 150,
        unit: 'g'
      },
      {
        id: 'ing-006',
        name: 'Cherry Tomatoes',
        quantity: 50,
        unit: 'g'
      },
      {
        id: 'ing-007',
        name: 'Cucumber',
        quantity: 30,
        unit: 'g'
      },
      {
        id: 'ing-008',
        name: 'Red Onion',
        quantity: 20,
        unit: 'g'
      },
      {
        id: 'ing-009',
        name: 'House Dressing',
        quantity: 30,
        unit: 'ml'
      }
    ]
  },
  {
    id: 'recipe-003',
    name: 'Caesar Salad',
    category: 'Salad',
    baseUnit: 'serving',
    compatibleUnits: [
      {
        id: 'unit-003',
        name: 'serving',
        abbreviation: 'srv',
        conversionFactor: 1
      },
      {
        id: 'unit-004',
        name: 'bowl',
        abbreviation: 'bowl',
        conversionFactor: 1.5
      }
    ],
    averageCost: {
      amount: 5.50,
      currency: 'USD'
    },
    ingredients: [
      {
        id: 'ing-010',
        name: 'Romaine Lettuce',
        quantity: 150,
        unit: 'g'
      },
      {
        id: 'ing-011',
        name: 'Caesar Dressing',
        quantity: 40,
        unit: 'ml'
      },
      {
        id: 'ing-012',
        name: 'Parmesan Cheese',
        quantity: 30,
        unit: 'g'
      },
      {
        id: 'ing-013',
        name: 'Croutons',
        quantity: 25,
        unit: 'g'
      }
    ]
  },
  {
    id: 'recipe-005',
    name: 'Grilled Chicken Breast',
    category: 'Poultry',
    baseUnit: 'g',
    compatibleUnits: [
      {
        id: 'unit-005',
        name: 'gram',
        abbreviation: 'g',
        conversionFactor: 1
      },
      {
        id: 'unit-006',
        name: 'piece',
        abbreviation: 'pc',
        conversionFactor: 200
      }
    ],
    averageCost: {
      amount: 6.00,
      currency: 'USD'
    },
    ingredients: [
      {
        id: 'ing-014',
        name: 'Chicken Breast',
        quantity: 200,
        unit: 'g'
      },
      {
        id: 'ing-015',
        name: 'Olive Oil',
        quantity: 10,
        unit: 'ml'
      },
      {
        id: 'ing-016',
        name: 'Herbs & Spices',
        quantity: 5,
        unit: 'g'
      }
    ]
  }
]

// ====== MOCK MAPPING PREVIEWS ======

export const mockMappingPreviews: Record<string, MappingPreview> = {
  'pos-item-101': {
    recipe: {
      id: 'recipe-001',
      name: 'Margherita Pizza',
      category: 'Pizza'
    },
    portionSize: 1,
    unit: 'whole',
    ingredients: [
      {
        name: 'Pizza Dough',
        quantityPerPortion: 400,
        unit: 'g',
        estimatedCost: { amount: 2.40, currency: 'USD' }
      },
      {
        name: 'Tomato Sauce',
        quantityPerPortion: 200,
        unit: 'ml',
        estimatedCost: { amount: 1.20, currency: 'USD' }
      },
      {
        name: 'Mozzarella Cheese',
        quantityPerPortion: 300,
        unit: 'g',
        estimatedCost: { amount: 4.50, currency: 'USD' }
      },
      {
        name: 'Fresh Basil',
        quantityPerPortion: 20,
        unit: 'g',
        estimatedCost: { amount: 0.40, currency: 'USD' }
      }
    ],
    totalEstimatedCost: {
      amount: 8.50,
      currency: 'USD'
    },
    costComparison: {
      posPrice: { amount: 15.00, currency: 'USD' },
      estimatedCost: { amount: 8.50, currency: 'USD' },
      margin: 43.3,
      marginStatus: 'good'
    }
  },
  'pos-item-102': {
    recipe: {
      id: 'recipe-002',
      name: 'House Salad',
      category: 'Salad'
    },
    portionSize: 1,
    unit: 'serving',
    ingredients: [
      {
        name: 'Mixed Greens',
        quantityPerPortion: 150,
        unit: 'g',
        estimatedCost: { amount: 1.50, currency: 'USD' }
      },
      {
        name: 'Cherry Tomatoes',
        quantityPerPortion: 50,
        unit: 'g',
        estimatedCost: { amount: 0.75, currency: 'USD' }
      },
      {
        name: 'Cucumber',
        quantityPerPortion: 30,
        unit: 'g',
        estimatedCost: { amount: 0.30, currency: 'USD' }
      },
      {
        name: 'Red Onion',
        quantityPerPortion: 20,
        unit: 'g',
        estimatedCost: { amount: 0.20, currency: 'USD' }
      },
      {
        name: 'House Dressing',
        quantityPerPortion: 30,
        unit: 'ml',
        estimatedCost: { amount: 0.50, currency: 'USD' }
      }
    ],
    totalEstimatedCost: {
      amount: 3.25,
      currency: 'USD'
    },
    costComparison: {
      posPrice: { amount: 8.50, currency: 'USD' },
      estimatedCost: { amount: 3.25, currency: 'USD' },
      margin: 61.8,
      marginStatus: 'good'
    }
  }
}

// ====== UTILITY FUNCTIONS ======

export const getMappingByPOSItemId = (posItemId: string): POSMapping | undefined => {
  return mockPOSMappings.find(mapping => mapping.posItemId === posItemId && mapping.isActive)
}

export const getMappingsByRecipeId = (recipeId: string): POSMapping[] => {
  return mockPOSMappings.filter(mapping => mapping.recipeId === recipeId && mapping.isActive)
}

export const getUnmappedPOSItems = (): POSItem[] => {
  return mockUnmappedPOSItems
}

export const getMappedPOSItems = (): POSItem[] => {
  return mockMappedPOSItems
}

export const searchRecipes = (query: string): RecipeSearchResult[] => {
  const lowercaseQuery = query.toLowerCase()
  return mockRecipeSearchResults.filter(recipe =>
    recipe.name.toLowerCase().includes(lowercaseQuery) ||
    recipe.category.toLowerCase().includes(lowercaseQuery)
  )
}

export const getMappingPreview = (posItemId: string): MappingPreview | undefined => {
  return mockMappingPreviews[posItemId]
}

export const getAllPOSMappings = (): POSMapping[] => {
  return mockPOSMappings
}

export const getActiveMappings = (): POSMapping[] => {
  return mockPOSMappings.filter(mapping => mapping.isActive)
}

export const getInactiveMappings = (): POSMapping[] => {
  return mockPOSMappings.filter(mapping => !mapping.isActive)
}
