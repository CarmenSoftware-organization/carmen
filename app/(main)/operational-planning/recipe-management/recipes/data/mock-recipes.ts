export interface Ingredient {
  id: string
  name: string
  type: 'product' | 'recipe'
  quantity: number
  unit: string
  wastage: number
  inventoryQty: number
  inventoryUnit: string
  costPerUnit: number
  totalCost: number
  notes?: string
}

export interface PreparationStep {
  id: string
  order: number
  description: string
  duration?: number
  temperature?: number
  equipments: string[]
  image: string
}

export interface RecipeYieldVariant {
  id: string
  name: string
  unit: string
  quantity: number
  conversionRate: number  // Portion of base recipe (1.0 = whole recipe, 0.125 = 1/8)
  sellingPrice: number
  costPerUnit: number
  isDefault: boolean
  shelfLife?: number  // Hours after preparation/opening
  wastageRate?: number  // Expected waste percentage for this variant
  minOrderQuantity?: number
  maxOrderQuantity?: number
}

export interface Recipe {
  id: string
  name: string
  description: string
  category: string
  cuisine: string
  status: 'draft' | 'published'
  image: string
  yield: number
  yieldUnit: string
  // Enhanced yield management for fractional sales
  yieldVariants: RecipeYieldVariant[]
  defaultVariantId: string
  allowsFractionalSales: boolean
  fractionalSalesType?: 'pizza-slice' | 'cake-slice' | 'bottle-glass' | 'portion-control' | 'custom'
  prepTime: number
  cookTime: number
  totalTime: number
  difficulty: 'easy' | 'medium' | 'hard'
  costPerPortion: number
  sellingPrice: number
  grossMargin: number
  netPrice: number
  grossPrice: number
  totalCost: number
  carbonFootprint: number
  carbonFootprintSource?: string
  hasMedia: boolean
  deductFromStock: boolean
  ingredients: Ingredient[]
  steps: PreparationStep[]
  prepNotes: string
  specialInstructions: string
  additionalInfo: string
  allergens: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  targetFoodCost: number
  laborCostPercentage: number
  overheadPercentage: number
  recommendedPrice: number
  foodCostPercentage: number
  grossProfit: number
  unitOfSale: string
}

export const mockRecipes: Recipe[] = [
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
        sellingPrice: 16.99,
        costPerUnit: 4.75,
        isDefault: true,
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
    costPerPortion: 4.75,
    sellingPrice: 16.99,
    grossMargin: 72.0,
    netPrice: 14.99,
    grossPrice: 16.99,
    totalCost: 19.00,
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
  { id: "flour", name: "All-Purpose Flour", type: "product", unit: "g", costPerUnit: 0.002 }
]

export const mockBaseRecipes = [
  {
    id: "basic-tomato-sauce",
    name: "Basic Tomato Sauce",
    type: "recipe",
    unit: "ml",
    costPerPortion: 0.75
  },
  {
    id: "chicken-stock",
    name: "Chicken Stock",
    type: "recipe",
    unit: "L",
    costPerPortion: 1.20
  },
  {
    id: "beef-stock",
    name: "Beef Stock",
    type: "recipe",
    unit: "L",
    costPerPortion: 1.50
  },
  {
    id: "vegetable-stock",
    name: "Vegetable Stock",
    type: "recipe",
    unit: "L",
    costPerPortion: 0.80
  },
  {
    id: "pesto",
    name: "Basil Pesto",
    type: "recipe",
    unit: "g",
    costPerPortion: 2.00
  }
]