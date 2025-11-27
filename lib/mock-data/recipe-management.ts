import { Recipe, RecipeYieldVariant, Money } from '@/lib/types'

// Helper function to create Money objects
const money = (amount: number, currency: string = 'USD'): Money => ({ amount, currency })

// Simplified ingredient for base recipes (internal use)
interface BaseRecipeIngredient {
  id: string
  ingredientId?: string
  name: string
  type: 'product' | 'recipe'
  quantity: number
  unit: string
  wastage?: number
  costPerUnit: Money
  totalCost: Money
  preparation?: string
}

// Simplified preparation step for base recipes (internal use)
interface BaseRecipeStep {
  id: string
  order: number
  description: string
  duration?: number
  equipments?: string[]
  image?: string
  temperature?: number | string
  tips?: string
}

// Base recipes are foundational recipes used as ingredients in other recipes
export interface BaseRecipe {
  id: string
  name: string
  description: string
  category: string
  yield: number
  yieldUnit: string
  ingredients: BaseRecipeIngredient[]
  steps: BaseRecipeStep[]
  prepTime: number
  cookTime: number
  totalCost: Money
  costPerUnit: Money
  shelfLife: number // days
  storageInstructions: string
}

// Internal mock recipes (not exported - see ./recipes.ts for exported recipes)
const internalMockRecipes = [
  {
    id: "thai-green-curry",
    name: "Thai Green Curry",
    description: "A fragrant and creamy Thai curry with fresh vegetables and tender chicken",
    category: "main-course",
    cuisine: "Thai",
    status: "published",
    image: "/images/recipes/thai-green-curry.jpg",
    yield: 4,
    yieldUnit: "portions",
    // Standard recipe - single portion sales
    yieldVariants: [
      {
        id: "thai-curry-portion",
        name: "Single Portion",
        unit: "portion",
        quantity: 1,
        conversionRate: 0.25, // 1 portion = 1/4 of recipe
        sellingPrice: money(16.99),
        costPerUnit: money(4.75),
        marginPercentage: 72.0,
        isDefault: true,
        isMenuAvailable: true,
        isActive: true,
        displayOrder: 1,
        shelfLife: 4, // 4 hours hot holding
        wastageRate: 2
      }
    ],
    defaultVariantId: "thai-curry-portion",
    allowsFractionalSales: false,
    prepTime: 30,
    cookTime: 20,
    totalTime: 50,
    difficulty: "medium",
    costPerPortion: money(4.75),
    totalCost: money(19.00),
    carbonFootprint: 1.2,
    carbonFootprintSource: "Supplier data",
    hasMedia: true,
    deductFromStock: true,
    ingredients: [
      {
        id: "coconut-milk",
        name: "Coconut Milk",
        type: "product",
        quantity: 400,
        unit: "ml",
        wastage: 2,
        inventoryQty: 1200,
        inventoryUnit: "ml",
        costPerUnit: 0.004,
        totalCost: 1.60
      },
      {
        id: "chicken-breast",
        name: "Chicken Breast",
        type: "product",
        quantity: 500,
        unit: "g",
        wastage: 5,
        inventoryQty: 2000,
        inventoryUnit: "g",
        costPerUnit: 0.02,
        totalCost: 10.50
      },
      {
        id: "green-curry-paste",
        name: "Green Curry Paste",
        type: "recipe",
        quantity: 60,
        unit: "g",
        wastage: 3,
        inventoryQty: 250,
        inventoryUnit: "g",
        costPerUnit: 0.05,
        totalCost: 3.15
      },
      {
        id: "bamboo-shoots",
        name: "Bamboo Shoots",
        type: "product",
        quantity: 200,
        unit: "g",
        wastage: 8,
        inventoryQty: 500,
        inventoryUnit: "g",
        costPerUnit: 0.015,
        totalCost: 3.24
      },
      {
        id: "thai-basil",
        name: "Thai Basil",
        type: "product",
        quantity: 30,
        unit: "g",
        wastage: 12,
        inventoryQty: 100,
        inventoryUnit: "g",
        costPerUnit: 0.08,
        totalCost: 2.69
      },
      {
        id: "fish-sauce",
        name: "Fish Sauce",
        type: "product",
        quantity: 30,
        unit: "ml",
        wastage: 0,
        inventoryQty: 500,
        inventoryUnit: "ml",
        costPerUnit: 0.02,
        totalCost: 0.60
      },
      {
        id: "palm-sugar",
        name: "Palm Sugar",
        type: "product",
        quantity: 20,
        unit: "g",
        wastage: 1,
        inventoryQty: 250,
        inventoryUnit: "g",
        costPerUnit: 0.03,
        totalCost: 0.61
      }
    ],
    steps: [
      {
        id: "step1",
        order: 1,
        description: "Heat oil in a large pan over medium heat. Add the curry paste and fry for 1-2 minutes until fragrant.",
        duration: 2,
        temperature: 180,
        equipments: ["pan", "stove"],
        image: "/images/recipes/steps/thai-green-curry-1.jpg"
      },
      {
        id: "step2",
        order: 2,
        description: "Add coconut milk and bring to a simmer. Cook for 5 minutes, stirring occasionally.",
        duration: 5,
        temperature: 160,
        equipments: ["wooden spoon"],
        image: "/images/recipes/steps/thai-green-curry-2.jpg"
      }
    ],
    prepNotes: "Ensure all ingredients are at room temperature before starting.",
    specialInstructions: "For a vegetarian version, replace chicken with tofu and ensure the curry paste is vegetarian.",
    additionalInfo: "Can be stored in an airtight container for up to 3 days in the refrigerator.",
    allergens: ["shellfish"],
    tags: ["spicy", "asian"],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    createdBy: "Chef John",
    updatedBy: "Chef John",
    targetFoodCost: 33,
    laborCostPercentage: 30,
    overheadPercentage: 20,
    recommendedPrice: 15.99,
    foodCostPercentage: 28,
    grossProfit: 12.24,
    unitOfSale: "portion"
  },
  {
    id: "beef-bourguignon",
    name: "Beef Bourguignon",
    description: "Classic French beef stew braised in red wine with mushrooms and pearl onions.",
    category: "main-course",
    cuisine: "French",
    status: "published",
    image: "/images/placeholder-recipe.jpg",
    yield: 6,
    yieldUnit: "portions",
    yieldVariants: [
      {
        id: "beef-bourguignon-portion",
        name: "Single Portion",
        unit: "portion",
        quantity: 1,
        conversionRate: 0.167, // 1 portion = 1/6 of recipe
        sellingPrice: 28.99,
        costPerUnit: 8.50,
        isDefault: true
      }
    ],
    defaultVariantId: "beef-bourguignon-portion",
    allowsFractionalSales: false,
    prepTime: 45,
    cookTime: 180,
    totalTime: 225,
    difficulty: "medium",
    costPerPortion: 8.50,
    sellingPrice: 28.99,
    grossMargin: 70.7,
    netPrice: 25.99,
    grossPrice: 28.99,
    totalCost: 51.00,
    carbonFootprint: 2.8,
    carbonFootprintSource: "Industry standard",
    hasMedia: true,
    deductFromStock: true,
    ingredients: [
      {
        id: "beef-chuck",
        name: "Beef Chuck",
        type: "product",
        quantity: 1500,
        unit: "g",
        wastage: 8,
        inventoryQty: 5000,
        inventoryUnit: "g",
        costPerUnit: 0.022,
        totalCost: 35.64
      },
      {
        id: "red-wine",
        name: "Red Wine",
        type: "product",
        quantity: 750,
        unit: "ml",
        wastage: 0,
        inventoryQty: 3000,
        inventoryUnit: "ml",
        costPerUnit: 0.008,
        totalCost: 6.00
      }
    ],
    steps: [
      {
        id: "step1",
        order: 1,
        description: "Cut beef into 2-inch cubes. Season with salt and pepper.",
        duration: 15,
        equipments: ["cutting board", "knife"],
        image: "/images/recipes/steps/beef-bourguignon-1.jpg"
      }
    ],
    prepNotes: "For best results, marinate the beef overnight in red wine.",
    specialInstructions: "Use a good quality red wine that you would drink.",
    additionalInfo: "Can be made up to 2 days ahead and reheated.",
    allergens: [],
    tags: ["french", "winter"],
    createdAt: "2024-01-16T10:00:00Z",
    updatedAt: "2024-01-16T10:00:00Z",
    createdBy: "Chef Maria",
    updatedBy: "Chef Maria",
    targetFoodCost: 33,
    laborCostPercentage: 30,
    overheadPercentage: 20,
    recommendedPrice: 27.99,
    foodCostPercentage: 29,
    grossProfit: 20.49,
    unitOfSale: "portion"
  },
  {
    id: "tiramisu",
    name: "Tiramisu",
    description: "Classic Italian coffee-flavored dessert with layers of mascarpone cream and ladyfingers.",
    category: "dessert",
    cuisine: "Italian",
    status: "published",
    image: "/images/placeholder-recipe.jpg",
    yield: 8,
    yieldUnit: "portions",
    yieldVariants: [
      {
        id: "tiramisu-portion",
        name: "Single Portion",
        unit: "portion",
        quantity: 1,
        conversionRate: 0.125, // 1 portion = 1/8 of recipe
        sellingPrice: 8.99,
        costPerUnit: 2.25,
        isDefault: true
      }
    ],
    defaultVariantId: "tiramisu-portion",
    allowsFractionalSales: false,
    prepTime: 30,
    cookTime: 0,
    totalTime: 30,
    difficulty: "easy",
    costPerPortion: 2.25,
    sellingPrice: 8.99,
    grossMargin: 74.9,
    netPrice: 7.99,
    grossPrice: 8.99,
    totalCost: 18.00,
    carbonFootprint: 0.8,
    carbonFootprintSource: "Internal calculation",
    hasMedia: true,
    deductFromStock: true,
    ingredients: [
      {
        id: "mascarpone",
        name: "Mascarpone",
        type: "product",
        quantity: 500,
        unit: "g",
        wastage: 2,
        inventoryQty: 1500,
        inventoryUnit: "g",
        costPerUnit: 0.016,
        totalCost: 8.16
      },
      {
        id: "ladyfingers",
        name: "Ladyfingers",
        type: "product",
        quantity: 200,
        unit: "g",
        wastage: 5,
        inventoryQty: 1000,
        inventoryUnit: "g",
        costPerUnit: 0.012,
        totalCost: 2.52
      }
    ],
    steps: [
      {
        id: "step1",
        order: 1,
        description: "Whip mascarpone with sugar until light and fluffy.",
        duration: 5,
        equipments: ["mixer", "bowl"],
        image: "/recipes/steps/tiramisu-1.jpg"
      }
    ],
    prepNotes: "Ensure all ingredients are at room temperature before starting.",
    specialInstructions: "Must be refrigerated for at least 4 hours before serving.",
    additionalInfo: "Can be made up to 2 days ahead.",
    allergens: ["dairy", "eggs"],
    tags: ["dessert", "italian"],
    createdAt: "2024-01-17T10:00:00Z",
    updatedAt: "2024-01-17T10:00:00Z",
    createdBy: "Chef Paolo",
    updatedBy: "Chef Paolo",
    targetFoodCost: 33,
    laborCostPercentage: 30,
    overheadPercentage: 20,
    recommendedPrice: 8.99,
    foodCostPercentage: 25,
    grossProfit: 6.74,
    unitOfSale: "portion"
  },
  // Pizza example with fractional sales
  {
    id: "margherita-pizza",
    name: "Margherita Pizza",
    description: "Classic Italian pizza with fresh mozzarella, tomatoes, and basil",
    category: "main-course",
    cuisine: "Italian",
    status: "published",
    image: "/images/recipes/margherita-pizza.jpg",
    yield: 1,
    yieldUnit: "large pizza",
    // Multiple selling options for pizza
    yieldVariants: [
      {
        id: "pizza-slice",
        name: "Pizza Slice",
        unit: "slice",
        quantity: 1,
        conversionRate: 0.125, // 1 slice = 1/8 of pizza
        sellingPrice: 4.99,
        costPerUnit: 1.85,
        isDefault: false,
        shelfLife: 4, // 4 hours under heat lamps
        wastageRate: 5,
        minOrderQuantity: 1,
        maxOrderQuantity: 8
      },
      {
        id: "pizza-half",
        name: "Half Pizza",
        unit: "half",
        quantity: 1,
        conversionRate: 0.5, // Half pizza
        sellingPrice: 18.99,
        costPerUnit: 7.40,
        isDefault: false,
        shelfLife: 2, // 2 hours optimal quality
        wastageRate: 3
      },
      {
        id: "pizza-whole",
        name: "Whole Pizza",
        unit: "whole",
        quantity: 1,
        conversionRate: 1.0, // Full recipe
        sellingPrice: 34.99,
        costPerUnit: 14.80,
        isDefault: true,
        shelfLife: 1, // Best served immediately
        wastageRate: 1
      }
    ],
    defaultVariantId: "pizza-whole",
    allowsFractionalSales: true,
    fractionalSalesType: "pizza-slice",
    prepTime: 20,
    cookTime: 12,
    totalTime: 32,
    difficulty: "medium",
    costPerPortion: 14.80,
    sellingPrice: 34.99,
    grossMargin: 57.7,
    netPrice: 32.99,
    grossPrice: 34.99,
    totalCost: 14.80,
    carbonFootprint: 2.1,
    carbonFootprintSource: "Ingredient analysis",
    hasMedia: true,
    deductFromStock: true,
    ingredients: [
      {
        id: "pizza-dough",
        name: "Pizza Dough",
        type: "product",
        quantity: 350,
        unit: "g",
        wastage: 2,
        inventoryQty: 5000,
        inventoryUnit: "g",
        costPerUnit: 0.008,
        totalCost: 2.80
      },
      {
        id: "mozzarella",
        name: "Fresh Mozzarella",
        type: "product",
        quantity: 200,
        unit: "g",
        wastage: 3,
        inventoryQty: 2000,
        inventoryUnit: "g",
        costPerUnit: 0.025,
        totalCost: 5.00
      },
      {
        id: "tomato-sauce",
        name: "Pizza Tomato Sauce",
        type: "recipe",
        quantity: 150,
        unit: "ml",
        wastage: 2,
        inventoryQty: 2000,
        inventoryUnit: "ml",
        costPerUnit: 0.012,
        totalCost: 1.80
      },
      {
        id: "basil-fresh",
        name: "Fresh Basil Leaves",
        type: "product",
        quantity: 15,
        unit: "g",
        wastage: 10,
        inventoryQty: 200,
        inventoryUnit: "g",
        costPerUnit: 0.04,
        totalCost: 0.60
      }
    ],
    steps: [
      {
        id: "step-1",
        order: 1,
        description: "Prepare pizza dough and let rest for 15 minutes",
        duration: 15,
        temperature: 20,
        equipments: ["mixing-bowl", "dough-scraper"],
        image: ""
      },
      {
        id: "step-2",
        order: 2,
        description: "Roll out dough to 14-inch circle",
        duration: 5,
        equipments: ["rolling-pin", "floured-surface"],
        image: ""
      },
      {
        id: "step-3",
        order: 3,
        description: "Spread tomato sauce evenly, add mozzarella and basil",
        duration: 3,
        equipments: ["ladle", "cheese-grater"],
        image: ""
      },
      {
        id: "step-4",
        order: 4,
        description: "Bake in pizza oven until crust is golden and cheese bubbles",
        duration: 12,
        temperature: 450,
        equipments: ["pizza-oven", "pizza-peel"],
        image: ""
      }
    ],
    prepNotes: "Ensure dough is at room temperature before rolling",
    specialInstructions: "Cut into 8 equal slices when selling by slice",
    additionalInfo: "Can be prepared ahead and par-baked for faster service",
    allergens: ["gluten", "dairy"],
    tags: ["pizza", "vegetarian", "italian", "fractional-sales"],
    createdAt: "2023-10-15T10:00:00Z",
    updatedAt: "2023-12-01T15:30:00Z",
    createdBy: "Chef Mario",
    updatedBy: "Kitchen Manager",
    targetFoodCost: 42,
    laborCostPercentage: 25,
    overheadPercentage: 18,
    recommendedPrice: 34.99,
    foodCostPercentage: 42.3,
    grossProfit: 20.19,
    unitOfSale: "whole"
  },
  // Cake example with fractional sales
  {
    id: "chocolate-pound-cake",
    name: "Chocolate Pound Cake",
    description: "Rich, dense chocolate cake perfect for slicing",
    category: "dessert",
    cuisine: "American",
    status: "published",
    image: "/images/recipes/chocolate-pound-cake.jpg",
    yield: 1,
    yieldUnit: "whole cake",
    // Multiple selling options for cake
    yieldVariants: [
      {
        id: "cake-slice",
        name: "Cake Slice",
        unit: "slice",
        quantity: 1,
        conversionRate: 0.0625, // 1 slice = 1/16 of cake
        sellingPrice: 6.99,
        costPerUnit: 1.25,
        isDefault: true,
        shelfLife: 72, // 3 days refrigerated
        wastageRate: 8,
        minOrderQuantity: 1,
        maxOrderQuantity: 16
      },
      {
        id: "cake-quarter",
        name: "Quarter Cake",
        unit: "quarter",
        quantity: 1,
        conversionRate: 0.25, // 1/4 of cake
        sellingPrice: 24.99,
        costPerUnit: 5.00,
        isDefault: false,
        shelfLife: 120, // 5 days when uncut
        wastageRate: 3
      },
      {
        id: "cake-half",
        name: "Half Cake",
        unit: "half",
        quantity: 1,
        conversionRate: 0.5, // Half cake
        sellingPrice: 47.99,
        costPerUnit: 10.00,
        isDefault: false,
        shelfLife: 120,
        wastageRate: 2
      },
      {
        id: "cake-whole",
        name: "Whole Cake",
        unit: "whole",
        quantity: 1,
        conversionRate: 1.0, // Full recipe
        sellingPrice: 89.99,
        costPerUnit: 20.00,
        isDefault: false,
        shelfLife: 168, // 7 days unopened
        wastageRate: 1
      }
    ],
    defaultVariantId: "cake-slice",
    allowsFractionalSales: true,
    fractionalSalesType: "cake-slice",
    prepTime: 25,
    cookTime: 60,
    totalTime: 85,
    difficulty: "easy",
    costPerPortion: 20.00,
    sellingPrice: 89.99,
    grossMargin: 77.8,
    netPrice: 84.99,
    grossPrice: 89.99,
    totalCost: 20.00,
    carbonFootprint: 1.8,
    carbonFootprintSource: "Recipe analysis",
    hasMedia: true,
    deductFromStock: true,
    ingredients: [
      {
        id: "flour",
        name: "All-Purpose Flour",
        type: "product",
        quantity: 300,
        unit: "g",
        wastage: 1,
        inventoryQty: 10000,
        inventoryUnit: "g",
        costPerUnit: 0.002,
        totalCost: 0.60
      },
      {
        id: "cocoa-powder",
        name: "Cocoa Powder",
        type: "product",
        quantity: 80,
        unit: "g",
        wastage: 2,
        inventoryQty: 1000,
        inventoryUnit: "g",
        costPerUnit: 0.015,
        totalCost: 1.20
      },
      {
        id: "butter",
        name: "Unsalted Butter",
        type: "product",
        quantity: 250,
        unit: "g",
        wastage: 1,
        inventoryQty: 2500,
        inventoryUnit: "g",
        costPerUnit: 0.012,
        totalCost: 3.00
      },
      {
        id: "sugar",
        name: "Granulated Sugar",
        type: "product",
        quantity: 350,
        unit: "g",
        wastage: 1,
        inventoryQty: 5000,
        inventoryUnit: "g",
        costPerUnit: 0.003,
        totalCost: 1.05
      },
      {
        id: "eggs",
        name: "Large Eggs",
        type: "product",
        quantity: 4,
        unit: "pieces",
        wastage: 2,
        inventoryQty: 60,
        inventoryUnit: "pieces",
        costPerUnit: 0.35,
        totalCost: 1.40
      }
    ],
    steps: [
      {
        id: "step-1",
        order: 1,
        description: "Cream butter and sugar until light and fluffy",
        duration: 8,
        equipments: ["stand-mixer", "paddle-attachment"],
        image: ""
      },
      {
        id: "step-2",
        order: 2,
        description: "Add eggs one at a time, mixing well after each",
        duration: 5,
        equipments: ["stand-mixer"],
        image: ""
      },
      {
        id: "step-3",
        order: 3,
        description: "Sift together flour and cocoa powder, fold into batter",
        duration: 7,
        equipments: ["sifter", "mixing-spoon"],
        image: ""
      },
      {
        id: "step-4",
        order: 4,
        description: "Pour into greased loaf pan and bake until done",
        duration: 60,
        temperature: 350,
        equipments: ["loaf-pan", "oven"],
        image: ""
      }
    ],
    prepNotes: "All ingredients should be at room temperature",
    specialInstructions: "Cut into 16 equal slices for portion control when selling by slice",
    additionalInfo: "Freezes well for up to 3 months",
    allergens: ["gluten", "dairy", "eggs"],
    tags: ["cake", "chocolate", "dessert", "fractional-sales", "make-ahead"],
    createdAt: "2023-09-20T14:00:00Z",
    updatedAt: "2023-11-15T11:45:00Z",
    createdBy: "Pastry Chef Sarah",
    updatedBy: "Head Chef",
    targetFoodCost: 22,
    laborCostPercentage: 20,
    overheadPercentage: 15,
    recommendedPrice: 89.99,
    foodCostPercentage: 22.2,
    grossProfit: 69.99,
    unitOfSale: "slice"
  }
]

export const mockIngredients = [
  // Proteins
  { id: "chicken-breast", name: "Chicken Breast", type: "product", unit: "g", costPerUnit: 0.015 },
  { id: "beef-chuck", name: "Beef Chuck", type: "product", unit: "g", costPerUnit: 0.022 },
  { id: "salmon-fillet", name: "Salmon Fillet", type: "product", unit: "g", costPerUnit: 0.028 },
  { id: "shrimp", name: "Shrimp", type: "product", unit: "g", costPerUnit: 0.025 },
  { id: "tofu", name: "Tofu", type: "product", unit: "g", costPerUnit: 0.008 },

  // Vegetables
  { id: "bell-peppers", name: "Bell Peppers", type: "product", unit: "g", costPerUnit: 0.006 },
  { id: "carrots", name: "Carrots", type: "product", unit: "g", costPerUnit: 0.003 },
  { id: "mushrooms", name: "Mushrooms", type: "product", unit: "g", costPerUnit: 0.012 },
  { id: "onions", name: "Onions", type: "product", unit: "g", costPerUnit: 0.002 },
  { id: "garlic", name: "Garlic", type: "product", unit: "g", costPerUnit: 0.008 },

  // Herbs & Spices
  { id: "basil", name: "Fresh Basil", type: "product", unit: "g", costPerUnit: 0.04 },
  { id: "thyme", name: "Fresh Thyme", type: "product", unit: "g", costPerUnit: 0.035 },
  { id: "rosemary", name: "Fresh Rosemary", type: "product", unit: "g", costPerUnit: 0.035 },
  { id: "black-pepper", name: "Black Pepper", type: "product", unit: "g", costPerUnit: 0.02 },
  { id: "sea-salt", name: "Sea Salt", type: "product", unit: "g", costPerUnit: 0.005 },

  // Sauces & Pastes
  { id: "soy-sauce", name: "Soy Sauce", type: "product", unit: "ml", costPerUnit: 0.006 },
  { id: "oyster-sauce", name: "Oyster Sauce", type: "product", unit: "ml", costPerUnit: 0.008 },
  { id: "tomato-paste", name: "Tomato Paste", type: "product", unit: "g", costPerUnit: 0.005 },
  { id: "green-curry-paste", name: "Green Curry Paste", type: "product", unit: "g", costPerUnit: 0.02 },
  { id: "red-curry-paste", name: "Red Curry Paste", type: "product", unit: "g", costPerUnit: 0.02 },

  // Dairy & Alternatives
  { id: "heavy-cream", name: "Heavy Cream", type: "product", unit: "ml", costPerUnit: 0.008 },
  { id: "mascarpone", name: "Mascarpone", type: "product", unit: "g", costPerUnit: 0.016 },
  { id: "parmesan", name: "Parmesan", type: "product", unit: "g", costPerUnit: 0.025 },
  { id: "coconut-milk", name: "Coconut Milk", type: "product", unit: "ml", costPerUnit: 0.004 },
  { id: "butter", name: "Butter", type: "product", unit: "g", costPerUnit: 0.012 },

  // Grains & Starches
  { id: "jasmine-rice", name: "Jasmine Rice", type: "product", unit: "g", costPerUnit: 0.003 },
  { id: "basmati-rice", name: "Basmati Rice", type: "product", unit: "g", costPerUnit: 0.004 },
  { id: "pasta", name: "Pasta", type: "product", unit: "g", costPerUnit: 0.004 },
  { id: "bread-crumbs", name: "Bread Crumbs", type: "product", unit: "g", costPerUnit: 0.005 },
  { id: "flour", name: "All-Purpose Flour", type: "product", unit: "g", costPerUnit: 0.002 },
  { id: "quinoa", name: "Quinoa", type: "product", unit: "g", costPerUnit: 0.008 },
  { id: "couscous", name: "Couscous", type: "product", unit: "g", costPerUnit: 0.005 },

  // Oils & Vinegars
  { id: "olive-oil", name: "Extra Virgin Olive Oil", type: "product", unit: "ml", costPerUnit: 0.012 },
  { id: "vegetable-oil", name: "Vegetable Oil", type: "product", unit: "ml", costPerUnit: 0.004 },
  { id: "sesame-oil", name: "Sesame Oil", type: "product", unit: "ml", costPerUnit: 0.015 },
  { id: "balsamic-vinegar", name: "Balsamic Vinegar", type: "product", unit: "ml", costPerUnit: 0.018 },
  { id: "rice-vinegar", name: "Rice Vinegar", type: "product", unit: "ml", costPerUnit: 0.008 },

  // Condiments & Flavor Enhancers
  { id: "fish-sauce", name: "Fish Sauce", type: "product", unit: "ml", costPerUnit: 0.007 },
  { id: "worcestershire", name: "Worcestershire Sauce", type: "product", unit: "ml", costPerUnit: 0.009 },
  { id: "honey", name: "Honey", type: "product", unit: "g", costPerUnit: 0.016 },
  { id: "maple-syrup", name: "Maple Syrup", type: "product", unit: "ml", costPerUnit: 0.025 },
  { id: "sriracha", name: "Sriracha", type: "product", unit: "ml", costPerUnit: 0.008 },

  // Baking Ingredients
  { id: "sugar", name: "Granulated Sugar", type: "product", unit: "g", costPerUnit: 0.002 },
  { id: "brown-sugar", name: "Brown Sugar", type: "product", unit: "g", costPerUnit: 0.003 },
  { id: "baking-powder", name: "Baking Powder", type: "product", unit: "g", costPerUnit: 0.008 },
  { id: "vanilla-extract", name: "Vanilla Extract", type: "product", unit: "ml", costPerUnit: 0.12 },
  { id: "cocoa-powder", name: "Cocoa Powder", type: "product", unit: "g", costPerUnit: 0.015 },

  // Additional Vegetables
  { id: "spinach", name: "Fresh Spinach", type: "product", unit: "g", costPerUnit: 0.007 },
  { id: "kale", name: "Kale", type: "product", unit: "g", costPerUnit: 0.008 },
  { id: "tomatoes", name: "Tomatoes", type: "product", unit: "g", costPerUnit: 0.005 },
  { id: "zucchini", name: "Zucchini", type: "product", unit: "g", costPerUnit: 0.004 },
  { id: "eggplant", name: "Eggplant", type: "product", unit: "g", costPerUnit: 0.005 },

  // Nuts & Seeds
  { id: "almonds", name: "Almonds", type: "product", unit: "g", costPerUnit: 0.022 },
  { id: "walnuts", name: "Walnuts", type: "product", unit: "g", costPerUnit: 0.024 },
  { id: "pine-nuts", name: "Pine Nuts", type: "product", unit: "g", costPerUnit: 0.045 },
  { id: "sesame-seeds", name: "Sesame Seeds", type: "product", unit: "g", costPerUnit: 0.012 },

  // Citrus & Fruits
  { id: "lemon", name: "Lemon", type: "product", unit: "piece", costPerUnit: 0.40 },
  { id: "lime", name: "Lime", type: "product", unit: "piece", costPerUnit: 0.35 },
  { id: "orange", name: "Orange", type: "product", unit: "piece", costPerUnit: 0.50 },

  // Stocks as Ingredients (from base recipes)
  { id: "chicken-stock", name: "Chicken Stock", type: "recipe", unit: "ml", costPerUnit: 0.0012 },
  { id: "beef-stock", name: "Beef Stock", type: "recipe", unit: "ml", costPerUnit: 0.0015 },
  { id: "vegetable-stock", name: "Vegetable Stock", type: "recipe", unit: "ml", costPerUnit: 0.0008 },
  { id: "basic-tomato-sauce", name: "Basic Tomato Sauce", type: "recipe", unit: "ml", costPerUnit: 0.0075 },
  { id: "pesto", name: "Basil Pesto", type: "recipe", unit: "g", costPerUnit: 0.02 }
]

export const mockBaseRecipes: BaseRecipe[] = [
  {
    id: "basic-tomato-sauce",
    name: "Basic Tomato Sauce",
    description: "Classic Italian tomato sauce base for pasta and pizza",
    category: "Sauces",
    yield: 1000,
    yieldUnit: "ml",
    ingredients: [
      {
        id: "tomatoes-001",
        ingredientId: "tomatoes",
        name: "Crushed Tomatoes",
        type: "product",
        quantity: 800,
        unit: "g",
        wastage: 5,
        costPerUnit: money(0.005),
        totalCost: money(4.00),
        preparation: "Use canned crushed tomatoes"
      },
      {
        id: "onions-001",
        ingredientId: "onions",
        name: "Onions",
        type: "product",
        quantity: 100,
        unit: "g",
        wastage: 10,
        costPerUnit: money(0.002),
        totalCost: money(0.20),
        preparation: "Finely diced"
      },
      {
        id: "garlic-001",
        ingredientId: "garlic",
        name: "Garlic",
        type: "product",
        quantity: 20,
        unit: "g",
        wastage: 5,
        costPerUnit: money(0.008),
        totalCost: money(0.16),
        preparation: "Minced"
      },
      {
        id: "basil-001",
        ingredientId: "basil",
        name: "Fresh Basil",
        type: "product",
        quantity: 10,
        unit: "g",
        wastage: 5,
        costPerUnit: money(0.04),
        totalCost: money(0.40),
        preparation: "Fresh leaves"
      },
      {
        id: "olive-oil-001",
        ingredientId: "olive-oil",
        name: "Olive Oil",
        type: "product",
        quantity: 30,
        unit: "ml",
        wastage: 0,
        costPerUnit: money(0.012),
        totalCost: money(0.36),
        preparation: ""
      }
    ],
    steps: [
      {
        id: "step-1",
        order: 1,
        description: "Heat olive oil in a large saucepan over medium heat",
        duration: 2,
        equipments: ["Saucepan", "Stove"],
        image: ""
      },
      {
        id: "step-2",
        order: 2,
        description: "Sauté onions until translucent, about 5 minutes",
        duration: 5,
        equipments: ["Wooden spoon"],
        image: ""
      },
      {
        id: "step-3",
        order: 3,
        description: "Add garlic and cook for 1 minute until fragrant",
        duration: 1,
        equipments: ["Wooden spoon"],
        image: ""
      },
      {
        id: "step-4",
        order: 4,
        description: "Add crushed tomatoes and basil, simmer for 20 minutes",
        duration: 20,
        temperature: 85,
        equipments: ["Lid"],
        image: ""
      }
    ],
    prepTime: 10,
    cookTime: 30,
    totalCost: money(5.12),
    costPerUnit: money(0.00512),
    shelfLife: 5,
    storageInstructions: "Refrigerate in airtight container, freeze for longer storage"
  },
  {
    id: "chicken-stock",
    name: "Chicken Stock",
    description: "Rich homemade chicken stock for soups and sauces",
    category: "Stocks",
    yield: 2000,
    yieldUnit: "ml",
    ingredients: [
      {
        id: "chicken-bones-001",
        ingredientId: "chicken-breast",
        name: "Chicken Bones/Carcass",
        type: "product",
        quantity: 500,
        unit: "g",
        wastage: 0,
        costPerUnit: money(0.008),
        totalCost: money(4.00),
        preparation: "Raw bones and trimmings"
      },
      {
        id: "carrots-002",
        ingredientId: "carrots",
        name: "Carrots",
        type: "product",
        quantity: 100,
        unit: "g",
        wastage: 15,
        costPerUnit: money(0.003),
        totalCost: money(0.30),
        preparation: "Roughly chopped"
      },
      {
        id: "onions-002",
        ingredientId: "onions",
        name: "Onions",
        type: "product",
        quantity: 100,
        unit: "g",
        wastage: 10,
        costPerUnit: money(0.002),
        totalCost: money(0.20),
        preparation: "Quartered"
      },
      {
        id: "thyme-001",
        ingredientId: "thyme",
        name: "Fresh Thyme",
        type: "product",
        quantity: 5,
        unit: "g",
        wastage: 0,
        costPerUnit: money(0.035),
        totalCost: money(0.18),
        preparation: "Whole sprigs"
      }
    ],
    steps: [
      {
        id: "step-1",
        order: 1,
        description: "Place chicken bones in large stockpot with cold water",
        duration: 5,
        equipments: ["Stockpot"],
        image: ""
      },
      {
        id: "step-2",
        order: 2,
        description: "Bring to boil, then reduce to gentle simmer",
        duration: 10,
        temperature: 95,
        equipments: ["Stove"],
        image: ""
      },
      {
        id: "step-3",
        order: 3,
        description: "Add vegetables and herbs, simmer for 3-4 hours",
        duration: 210,
        temperature: 85,
        equipments: ["Skimmer"],
        image: ""
      },
      {
        id: "step-4",
        order: 4,
        description: "Strain through fine-mesh sieve, discard solids",
        duration: 10,
        equipments: ["Fine-mesh sieve", "Container"],
        image: ""
      }
    ],
    prepTime: 15,
    cookTime: 240,
    totalCost: money(4.68),
    costPerUnit: money(0.00234),
    shelfLife: 4,
    storageInstructions: "Refrigerate for up to 4 days or freeze for 3 months"
  },
  {
    id: "beef-stock",
    name: "Beef Stock",
    description: "Deep, rich beef stock for French sauces and stews",
    category: "Stocks",
    yield: 2000,
    yieldUnit: "ml",
    ingredients: [
      {
        id: "beef-bones-001",
        ingredientId: "beef-chuck",
        name: "Beef Bones",
        type: "product",
        quantity: 800,
        unit: "g",
        wastage: 0,
        costPerUnit: money(0.012),
        totalCost: money(9.60),
        preparation: "Roasted bones"
      },
      {
        id: "carrots-003",
        ingredientId: "carrots",
        name: "Carrots",
        type: "product",
        quantity: 100,
        unit: "g",
        wastage: 15,
        costPerUnit: money(0.003),
        totalCost: money(0.30),
        preparation: "Roughly chopped"
      },
      {
        id: "onions-003",
        ingredientId: "onions",
        name: "Onions",
        type: "product",
        quantity: 100,
        unit: "g",
        wastage: 10,
        costPerUnit: money(0.002),
        totalCost: money(0.20),
        preparation: "Halved"
      },
      {
        id: "tomato-paste-001",
        ingredientId: "tomato-paste",
        name: "Tomato Paste",
        type: "product",
        quantity: 30,
        unit: "g",
        wastage: 0,
        costPerUnit: money(0.005),
        totalCost: money(0.15),
        preparation: ""
      }
    ],
    steps: [
      {
        id: "step-1",
        order: 1,
        description: "Roast bones at 200°C for 30 minutes until browned",
        duration: 30,
        temperature: 200,
        equipments: ["Oven", "Roasting pan"],
        image: ""
      },
      {
        id: "step-2",
        order: 2,
        description: "Transfer bones to stockpot, cover with cold water",
        duration: 10,
        equipments: ["Stockpot"],
        image: ""
      },
      {
        id: "step-3",
        order: 3,
        description: "Bring to boil, add vegetables and tomato paste, simmer 6 hours",
        duration: 360,
        temperature: 85,
        equipments: ["Stove", "Skimmer"],
        image: ""
      },
      {
        id: "step-4",
        order: 4,
        description: "Strain and cool rapidly",
        duration: 15,
        equipments: ["Fine-mesh sieve"],
        image: ""
      }
    ],
    prepTime: 20,
    cookTime: 400,
    totalCost: money(10.25),
    costPerUnit: money(0.00513),
    shelfLife: 4,
    storageInstructions: "Refrigerate for up to 4 days or freeze for 6 months"
  },
  {
    id: "vegetable-stock",
    name: "Vegetable Stock",
    description: "Light, aromatic vegetable stock for vegetarian dishes",
    category: "Stocks",
    yield: 2000,
    yieldUnit: "ml",
    ingredients: [
      {
        id: "carrots-004",
        ingredientId: "carrots",
        name: "Carrots",
        type: "product",
        quantity: 150,
        unit: "g",
        wastage: 15,
        costPerUnit: money(0.003),
        totalCost: money(0.45),
        preparation: "Roughly chopped"
      },
      {
        id: "onions-004",
        ingredientId: "onions",
        name: "Onions",
        type: "product",
        quantity: 150,
        unit: "g",
        wastage: 10,
        costPerUnit: money(0.002),
        totalCost: money(0.30),
        preparation: "Quartered"
      },
      {
        id: "mushrooms-001",
        ingredientId: "mushrooms",
        name: "Mushrooms",
        type: "product",
        quantity: 100,
        unit: "g",
        wastage: 5,
        costPerUnit: money(0.012),
        totalCost: money(1.20),
        preparation: "Sliced"
      },
      {
        id: "thyme-002",
        ingredientId: "thyme",
        name: "Fresh Thyme",
        type: "product",
        quantity: 5,
        unit: "g",
        wastage: 0,
        costPerUnit: money(0.035),
        totalCost: money(0.18),
        preparation: "Whole sprigs"
      }
    ],
    steps: [
      {
        id: "step-1",
        order: 1,
        description: "Combine all vegetables in stockpot with cold water",
        duration: 5,
        equipments: ["Stockpot"],
        image: ""
      },
      {
        id: "step-2",
        order: 2,
        description: "Bring to boil, reduce to simmer for 45 minutes",
        duration: 45,
        temperature: 85,
        equipments: ["Stove"],
        image: ""
      },
      {
        id: "step-3",
        order: 3,
        description: "Strain through fine-mesh sieve",
        duration: 5,
        equipments: ["Fine-mesh sieve"],
        image: ""
      }
    ],
    prepTime: 10,
    cookTime: 50,
    totalCost: money(2.13),
    costPerUnit: money(0.00107),
    shelfLife: 3,
    storageInstructions: "Refrigerate for up to 3 days or freeze for 3 months"
  },
  {
    id: "pesto",
    name: "Basil Pesto",
    description: "Classic Italian basil pesto sauce",
    category: "Sauces",
    yield: 250,
    yieldUnit: "g",
    ingredients: [
      {
        id: "basil-002",
        ingredientId: "basil",
        name: "Fresh Basil",
        type: "product",
        quantity: 100,
        unit: "g",
        wastage: 10,
        costPerUnit: money(0.04),
        totalCost: money(4.00),
        preparation: "Leaves only, washed and dried"
      },
      {
        id: "pine-nuts-001",
        ingredientId: "pine-nuts",
        name: "Pine Nuts",
        type: "product",
        quantity: 50,
        unit: "g",
        wastage: 0,
        costPerUnit: money(0.045),
        totalCost: money(2.25),
        preparation: "Toasted"
      },
      {
        id: "parmesan-001",
        ingredientId: "parmesan",
        name: "Parmesan",
        type: "product",
        quantity: 60,
        unit: "g",
        wastage: 0,
        costPerUnit: money(0.025),
        totalCost: money(1.50),
        preparation: "Grated"
      },
      {
        id: "garlic-002",
        ingredientId: "garlic",
        name: "Garlic",
        type: "product",
        quantity: 15,
        unit: "g",
        wastage: 5,
        costPerUnit: money(0.008),
        totalCost: money(0.12),
        preparation: "Peeled"
      },
      {
        id: "olive-oil-002",
        ingredientId: "olive-oil",
        name: "Extra Virgin Olive Oil",
        type: "product",
        quantity: 120,
        unit: "ml",
        wastage: 0,
        costPerUnit: money(0.012),
        totalCost: money(1.44),
        preparation: ""
      }
    ],
    steps: [
      {
        id: "step-1",
        order: 1,
        description: "Toast pine nuts in dry pan until golden",
        duration: 3,
        temperature: 180,
        equipments: ["Skillet"],
        image: ""
      },
      {
        id: "step-2",
        order: 2,
        description: "Combine basil, pine nuts, garlic, and parmesan in food processor",
        duration: 2,
        equipments: ["Food processor"],
        image: ""
      },
      {
        id: "step-3",
        order: 3,
        description: "Pulse while slowly adding olive oil until smooth",
        duration: 3,
        equipments: ["Food processor"],
        image: ""
      }
    ],
    prepTime: 10,
    cookTime: 3,
    totalCost: money(9.31),
    costPerUnit: money(0.03724),
    shelfLife: 7,
    storageInstructions: "Cover surface with thin layer of olive oil, refrigerate in airtight container"
  },
  {
    id: "pizza-dough",
    name: "Pizza Dough",
    description: "Classic Italian pizza dough with 24-hour fermentation",
    category: "Doughs",
    yield: 1000,
    yieldUnit: "g",
    ingredients: [
      {
        id: "flour-001",
        ingredientId: "flour",
        name: "All-Purpose Flour",
        type: "product",
        quantity: 600,
        unit: "g",
        wastage: 5,
        costPerUnit: money(0.002),
        totalCost: money(1.20),
        preparation: "Sifted"
      },
      {
        id: "water-001",
        ingredientId: "flour",
        name: "Water",
        type: "product",
        quantity: 360,
        unit: "ml",
        wastage: 0,
        costPerUnit: money(0.0001),
        totalCost: money(0.04),
        preparation: "Room temperature"
      },
      {
        id: "salt-001",
        ingredientId: "sea-salt",
        name: "Sea Salt",
        type: "product",
        quantity: 12,
        unit: "g",
        wastage: 0,
        costPerUnit: money(0.005),
        totalCost: money(0.06),
        preparation: ""
      },
      {
        id: "olive-oil-003",
        ingredientId: "olive-oil",
        name: "Olive Oil",
        type: "product",
        quantity: 20,
        unit: "ml",
        wastage: 0,
        costPerUnit: money(0.012),
        totalCost: money(0.24),
        preparation: ""
      }
    ],
    steps: [
      {
        id: "step-1",
        order: 1,
        description: "Mix flour, water, salt, and olive oil until combined",
        duration: 5,
        equipments: ["Mixing bowl", "Wooden spoon"],
        image: ""
      },
      {
        id: "step-2",
        order: 2,
        description: "Knead for 10 minutes until smooth and elastic",
        duration: 10,
        equipments: ["Work surface"],
        image: ""
      },
      {
        id: "step-3",
        order: 3,
        description: "Place in oiled bowl, cover, and refrigerate for 24 hours",
        duration: 1440,
        temperature: 4,
        equipments: ["Bowl", "Plastic wrap"],
        image: ""
      }
    ],
    prepTime: 20,
    cookTime: 1440,
    totalCost: money(1.54),
    costPerUnit: money(0.00154),
    shelfLife: 3,
    storageInstructions: "Refrigerate covered for up to 3 days, or freeze for 3 months"
  },
  {
    id: "pasta-dough",
    name: "Fresh Pasta Dough",
    description: "Traditional Italian egg pasta dough",
    category: "Doughs",
    yield: 500,
    yieldUnit: "g",
    ingredients: [
      {
        id: "flour-002",
        ingredientId: "flour",
        name: "All-Purpose Flour",
        type: "product",
        quantity: 400,
        unit: "g",
        wastage: 5,
        costPerUnit: money(0.002),
        totalCost: money(0.80),
        preparation: "Sifted"
      },
      {
        id: "eggs-001",
        ingredientId: "flour",
        name: "Eggs",
        type: "product",
        quantity: 200,
        unit: "g",
        wastage: 0,
        costPerUnit: money(0.006),
        totalCost: money(1.20),
        preparation: "4 large eggs, room temperature"
      },
      {
        id: "olive-oil-004",
        ingredientId: "olive-oil",
        name: "Olive Oil",
        type: "product",
        quantity: 10,
        unit: "ml",
        wastage: 0,
        costPerUnit: money(0.012),
        totalCost: money(0.12),
        preparation: ""
      }
    ],
    steps: [
      {
        id: "step-1",
        order: 1,
        description: "Make well in flour, add eggs and oil to center",
        duration: 2,
        equipments: ["Work surface"],
        image: ""
      },
      {
        id: "step-2",
        order: 2,
        description: "Mix with fork, gradually incorporating flour",
        duration: 5,
        equipments: ["Fork"],
        image: ""
      },
      {
        id: "step-3",
        order: 3,
        description: "Knead for 8-10 minutes until smooth and elastic",
        duration: 10,
        equipments: ["Work surface"],
        image: ""
      },
      {
        id: "step-4",
        order: 4,
        description: "Wrap and rest at room temperature for 30 minutes",
        duration: 30,
        equipments: ["Plastic wrap"],
        image: ""
      }
    ],
    prepTime: 20,
    cookTime: 30,
    totalCost: money(2.12),
    costPerUnit: money(0.00424),
    shelfLife: 2,
    storageInstructions: "Wrap tightly and refrigerate for up to 2 days, or freeze for 1 month"
  },
  {
    id: "bechamel-sauce",
    name: "Béchamel Sauce",
    description: "Classic French white sauce, one of the mother sauces",
    category: "Sauces",
    yield: 500,
    yieldUnit: "ml",
    ingredients: [
      {
        id: "butter-001",
        ingredientId: "butter",
        name: "Butter",
        type: "product",
        quantity: 50,
        unit: "g",
        wastage: 0,
        costPerUnit: money(0.012),
        totalCost: money(0.60),
        preparation: ""
      },
      {
        id: "flour-003",
        ingredientId: "flour",
        name: "All-Purpose Flour",
        type: "product",
        quantity: 50,
        unit: "g",
        wastage: 0,
        costPerUnit: money(0.002),
        totalCost: money(0.10),
        preparation: "Sifted"
      },
      {
        id: "milk-001",
        ingredientId: "heavy-cream",
        name: "Whole Milk",
        type: "product",
        quantity: 500,
        unit: "ml",
        wastage: 0,
        costPerUnit: money(0.003),
        totalCost: money(1.50),
        preparation: "Warm"
      }
    ],
    steps: [
      {
        id: "step-1",
        order: 1,
        description: "Melt butter in saucepan over medium heat",
        duration: 2,
        temperature: 100,
        equipments: ["Saucepan", "Whisk"],
        image: ""
      },
      {
        id: "step-2",
        order: 2,
        description: "Add flour, whisk to form roux, cook 2 minutes",
        duration: 2,
        equipments: ["Whisk"],
        image: ""
      },
      {
        id: "step-3",
        order: 3,
        description: "Gradually add warm milk, whisking constantly",
        duration: 5,
        equipments: ["Whisk"],
        image: ""
      },
      {
        id: "step-4",
        order: 4,
        description: "Simmer until thickened, about 10 minutes",
        duration: 10,
        temperature: 85,
        equipments: ["Whisk"],
        image: ""
      }
    ],
    prepTime: 5,
    cookTime: 20,
    totalCost: money(2.20),
    costPerUnit: money(0.0044),
    shelfLife: 3,
    storageInstructions: "Refrigerate in airtight container, cover surface with plastic wrap to prevent skin"
  },
  {
    id: "teriyaki-sauce",
    name: "Teriyaki Sauce",
    description: "Sweet and savory Japanese glaze",
    category: "Sauces",
    yield: 400,
    yieldUnit: "ml",
    ingredients: [
      {
        id: "soy-sauce-001",
        ingredientId: "soy-sauce",
        name: "Soy Sauce",
        type: "product",
        quantity: 200,
        unit: "ml",
        wastage: 0,
        costPerUnit: money(0.006),
        totalCost: money(1.20),
        preparation: ""
      },
      {
        id: "sugar-001",
        ingredientId: "sugar",
        name: "Sugar",
        type: "product",
        quantity: 100,
        unit: "g",
        wastage: 0,
        costPerUnit: money(0.002),
        totalCost: money(0.20),
        preparation: ""
      },
      {
        id: "rice-vinegar-001",
        ingredientId: "rice-vinegar",
        name: "Rice Vinegar",
        type: "product",
        quantity: 50,
        unit: "ml",
        wastage: 0,
        costPerUnit: money(0.008),
        totalCost: money(0.40),
        preparation: ""
      },
      {
        id: "garlic-003",
        ingredientId: "garlic",
        name: "Garlic",
        type: "product",
        quantity: 10,
        unit: "g",
        wastage: 5,
        costPerUnit: money(0.008),
        totalCost: money(0.08),
        preparation: "Minced"
      }
    ],
    steps: [
      {
        id: "step-1",
        order: 1,
        description: "Combine all ingredients in saucepan",
        duration: 2,
        equipments: ["Saucepan"],
        image: ""
      },
      {
        id: "step-2",
        order: 2,
        description: "Bring to boil, reduce heat and simmer 10 minutes",
        duration: 10,
        temperature: 85,
        equipments: ["Stove", "Whisk"],
        image: ""
      },
      {
        id: "step-3",
        order: 3,
        description: "Cool and strain if desired",
        duration: 5,
        equipments: ["Fine-mesh sieve"],
        image: ""
      }
    ],
    prepTime: 5,
    cookTime: 15,
    totalCost: money(1.88),
    costPerUnit: money(0.0047),
    shelfLife: 14,
    storageInstructions: "Refrigerate in airtight container for up to 2 weeks"
  },
  {
    id: "hollandaise-sauce",
    name: "Hollandaise Sauce",
    description: "Rich French butter sauce, one of the mother sauces",
    category: "Sauces",
    yield: 300,
    yieldUnit: "ml",
    ingredients: [
      {
        id: "butter-002",
        ingredientId: "butter",
        name: "Butter",
        type: "product",
        quantity: 200,
        unit: "g",
        wastage: 0,
        costPerUnit: money(0.012),
        totalCost: money(2.40),
        preparation: "Melted and clarified"
      },
      {
        id: "eggs-002",
        ingredientId: "flour",
        name: "Egg Yolks",
        type: "product",
        quantity: 60,
        unit: "g",
        wastage: 0,
        costPerUnit: money(0.008),
        totalCost: money(0.48),
        preparation: "3 large egg yolks"
      },
      {
        id: "lemon-001",
        ingredientId: "lemon",
        name: "Lemon Juice",
        type: "product",
        quantity: 15,
        unit: "ml",
        wastage: 0,
        costPerUnit: money(0.08),
        totalCost: money(1.20),
        preparation: "Fresh squeezed"
      }
    ],
    steps: [
      {
        id: "step-1",
        order: 1,
        description: "Whisk egg yolks and lemon juice in bowl over simmering water",
        duration: 3,
        temperature: 65,
        equipments: ["Bowl", "Whisk", "Pot"],
        image: ""
      },
      {
        id: "step-2",
        order: 2,
        description: "Slowly drizzle in melted butter while whisking constantly",
        duration: 5,
        equipments: ["Whisk"],
        image: ""
      },
      {
        id: "step-3",
        order: 3,
        description: "Continue whisking until thick and creamy",
        duration: 3,
        equipments: ["Whisk"],
        image: ""
      }
    ],
    prepTime: 5,
    cookTime: 12,
    totalCost: money(4.08),
    costPerUnit: money(0.0136),
    shelfLife: 0.125,
    storageInstructions: "Serve immediately, or keep warm for up to 3 hours at 50-60°C"
  },
  {
    id: "caramel-sauce",
    name: "Caramel Sauce",
    description: "Rich, buttery caramel sauce for desserts",
    category: "Sauces",
    yield: 400,
    yieldUnit: "ml",
    ingredients: [
      {
        id: "sugar-002",
        ingredientId: "sugar",
        name: "Granulated Sugar",
        type: "product",
        quantity: 200,
        unit: "g",
        wastage: 0,
        costPerUnit: money(0.002),
        totalCost: money(0.40),
        preparation: ""
      },
      {
        id: "butter-003",
        ingredientId: "butter",
        name: "Butter",
        type: "product",
        quantity: 80,
        unit: "g",
        wastage: 0,
        costPerUnit: money(0.012),
        totalCost: money(0.96),
        preparation: "Cut into pieces"
      },
      {
        id: "cream-001",
        ingredientId: "heavy-cream",
        name: "Heavy Cream",
        type: "product",
        quantity: 200,
        unit: "ml",
        wastage: 0,
        costPerUnit: money(0.008),
        totalCost: money(1.60),
        preparation: "Room temperature"
      }
    ],
    steps: [
      {
        id: "step-1",
        order: 1,
        description: "Heat sugar in heavy-bottomed pan until melted and amber",
        duration: 8,
        temperature: 180,
        equipments: ["Heavy-bottomed pan"],
        image: ""
      },
      {
        id: "step-2",
        order: 2,
        description: "Remove from heat, carefully add butter and stir",
        duration: 2,
        equipments: ["Whisk"],
        image: ""
      },
      {
        id: "step-3",
        order: 3,
        description: "Slowly add cream, whisking constantly (will bubble vigorously)",
        duration: 3,
        equipments: ["Whisk"],
        image: ""
      },
      {
        id: "step-4",
        order: 4,
        description: "Return to heat, simmer 2 minutes until smooth",
        duration: 2,
        temperature: 85,
        equipments: ["Whisk"],
        image: ""
      }
    ],
    prepTime: 5,
    cookTime: 15,
    totalCost: money(2.96),
    costPerUnit: money(0.0074),
    shelfLife: 7,
    storageInstructions: "Refrigerate in airtight container, rewarm gently before use"
  }
]
