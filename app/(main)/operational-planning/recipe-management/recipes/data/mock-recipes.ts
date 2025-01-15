export interface Recipe {
  id: string
  name: string
  description: string
  category: string
  cuisine: string
  status: 'draft' | 'active' | 'archived'
  image: string
  yield: number
  yieldUnit: string
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
  hasMedia: boolean
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
  // Cost calculation fields
  targetFoodCost: number
  laborCostPercentage: number
  overheadPercentage: number
  recommendedPrice: number
  foodCostPercentage: number
  grossProfit: number
}

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
  inStock?: boolean
}

export interface PreparationStep {
  id: string
  order: number
  description: string
  duration?: number
  temperature?: number
  equipments?: string[]
  image?: string
}

export const mockRecipes: Recipe[] = [
  {
    id: "REC001",
    name: "Classic Caesar Salad",
    description: "Traditional Caesar salad with homemade dressing and croutons",
    category: "Salads",
    cuisine: "Italian",
    status: "active",
    image: "/images/recipes/caesar-salad.jpg",
    yield: 4,
    yieldUnit: "portions",
    prepTime: 20,
    cookTime: 10,
    totalTime: 30,
    difficulty: "easy",
    costPerPortion: 3.50,
    sellingPrice: 12.99,
    grossMargin: 73.1,
    netPrice: 10.99,
    grossPrice: 12.99,
    totalCost: 14.00,
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-15T08:00:00Z",
    createdBy: "John Doe",
    updatedBy: "John Doe",
    carbonFootprint: 0.8,
    hasMedia: true,
    ingredients: [
      {
        id: "ING001",
        name: "Romaine Lettuce",
        type: "product",
        quantity: 2,
        unit: "heads",
        wastage: 5,
        inventoryQty: 2,
        inventoryUnit: "heads",
        costPerUnit: 2.50,
        totalCost: 5.00
      },
      {
        id: "ING002",
        name: "Parmesan Cheese",
        type: "product",
        quantity: 100,
        unit: "g",
        wastage: 2,
        inventoryQty: 0.1,
        inventoryUnit: "kg",
        costPerUnit: 30.00,
        totalCost: 3.00
      }
    ],
    steps: [
      {
        id: "STP001",
        order: 1,
        description: "Wash and chop the romaine lettuce",
        duration: 5,
        equipments: ["Knife", "Cutting Board"]
      },
      {
        id: "STP002",
        order: 2,
        description: "Prepare the dressing by mixing ingredients",
        image: "/images/steps/caesar-dressing.jpg",
        duration: 10,
        equipments: ["Bowl", "Whisk"]
      }
    ],
    prepNotes: "Ensure all ingredients are fresh and chilled",
    specialInstructions: "Dressing can be made ahead and stored",
    additionalInfo: "Can be made vegetarian by omitting anchovies",
    allergens: ["Dairy", "Eggs", "Fish"],
    tags: ["Fresh", "Healthy", "Quick"],
    targetFoodCost: 33,
    laborCostPercentage: 30,
    overheadPercentage: 20,
    recommendedPrice: 15.99,
    foodCostPercentage: 26.9,
    grossProfit: 9.49
  },
  {
    id: "REC002",
    name: "Thai Green Curry",
    description: "Authentic Thai green curry with coconut milk",
    category: "Main Course",
    cuisine: "Thai",
    status: "active",
    image: "/images/recipes/thai-green-curry.jpg",
    yield: 6,
    yieldUnit: "portions",
    prepTime: 30,
    cookTime: 25,
    totalTime: 55,
    difficulty: "medium",
    costPerPortion: 4.20,
    sellingPrice: 16.99,
    grossMargin: 75.3,
    netPrice: 14.99,
    grossPrice: 16.99,
    totalCost: 25.20,
    createdAt: "2024-01-14T10:00:00Z",
    updatedAt: "2024-01-14T15:30:00Z",
    createdBy: "Jane Smith",
    updatedBy: "Jane Smith",
    carbonFootprint: 1.2,
    hasMedia: true,
    ingredients: [
      {
        id: "ING003",
        name: "Coconut Milk",
        type: "product",
        quantity: 800,
        unit: "ml",
        wastage: 0,
        inventoryQty: 0.8,
        inventoryUnit: "L",
        costPerUnit: 4.50,
        totalCost: 3.60
      },
      {
        id: "ING004",
        name: "Green Curry Paste",
        type: "product",
        quantity: 100,
        unit: "g",
        wastage: 0,
        inventoryQty: 0.1,
        inventoryUnit: "kg",
        costPerUnit: 15.00,
        totalCost: 1.50
      }
    ],
    steps: [
      {
        id: "STP003",
        order: 1,
        description: "Heat oil in a large pan over medium heat",
        duration: 2,
        temperature: 180,
        equipments: ["Wok", "Wooden Spoon"]
      },
      {
        id: "STP004",
        order: 2,
        description: "Add curry paste and fry until fragrant",
        image: "/images/steps/curry-paste-frying.jpg",
        duration: 5,
        equipments: ["Wok"]
      }
    ],
    prepNotes: "Prepare all vegetables before starting",
    specialInstructions: "Adjust spiciness to taste",
    additionalInfo: "Can be made vegetarian by using tofu",
    allergens: ["Shellfish", "Fish", "Nuts"],
    tags: ["Spicy", "Asian", "Gluten-Free"],
    targetFoodCost: 33,
    laborCostPercentage: 30,
    overheadPercentage: 20,
    recommendedPrice: 15.99,
    foodCostPercentage: 26.9,
    grossProfit: 9.49
  },
  {
    id: "REC003",
    name: "Chocolate Lava Cake",
    description: "Decadent chocolate dessert with a molten center",
    category: "Desserts",
    cuisine: "French",
    status: "draft",
    image: "/images/recipes/chocolate-lava-cake.jpg",
    yield: 4,
    yieldUnit: "portions",
    prepTime: 15,
    cookTime: 12,
    totalTime: 27,
    difficulty: "medium",
    costPerPortion: 2.80,
    sellingPrice: 9.99,
    grossMargin: 71.9,
    netPrice: 8.99,
    grossPrice: 9.99,
    totalCost: 11.20,
    createdAt: "2024-01-13T14:00:00Z",
    updatedAt: "2024-01-13T16:45:00Z",
    createdBy: "Mike Johnson",
    updatedBy: "Mike Johnson",
    carbonFootprint: 0.9,
    hasMedia: true,
    ingredients: [
      {
        id: "ING005",
        name: "Dark Chocolate",
        type: "product",
        quantity: 200,
        unit: "g",
        wastage: 2,
        inventoryQty: 0.2,
        inventoryUnit: "kg",
        costPerUnit: 20.00,
        totalCost: 4.00
      },
      {
        id: "ING006",
        name: "Butter",
        type: "product",
        quantity: 100,
        unit: "g",
        wastage: 0,
        inventoryQty: 0.1,
        inventoryUnit: "kg",
        costPerUnit: 12.00,
        totalCost: 1.20
      }
    ],
    steps: [
      {
        id: "STP005",
        order: 1,
        description: "Melt chocolate and butter together",
        duration: 5,
        temperature: 45,
        equipments: ["Double Boiler", "Bowl"]
      },
      {
        id: "STP006",
        order: 2,
        description: "Mix in other ingredients until smooth",
        image: "/images/steps/cake-batter.jpg",
        duration: 8,
        equipments: ["Mixer", "Bowl"]
      }
    ],
    prepNotes: "Ingredients should be at room temperature",
    specialInstructions: "Do not overbake to maintain molten center",
    additionalInfo: "Can be prepared in advance and baked to order",
    allergens: ["Dairy", "Eggs", "Gluten"],
    tags: ["Dessert", "Hot", "Chocolate"],
    targetFoodCost: 33,
    laborCostPercentage: 30,
    overheadPercentage: 20,
    recommendedPrice: 11.99,
    foodCostPercentage: 28.1,
    grossProfit: 7.19
  },
  {
    id: "REC004",
    name: "Beef Bourguignon",
    description: "Classic French beef stew braised in red wine",
    category: "Main Course",
    cuisine: "French",
    status: "active",
    image: "/images/recipes/beef-bourguignon.jpg",
    yield: 6,
    yieldUnit: "portions",
    prepTime: 45,
    cookTime: 180,
    totalTime: 225,
    difficulty: "medium",
    costPerPortion: 8.50,
    sellingPrice: 28.99,
    grossMargin: 70.7,
    netPrice: 26.99,
    grossPrice: 28.99,
    totalCost: 51.00,
    createdAt: "2024-02-10T09:00:00Z",
    updatedAt: "2024-02-10T11:30:00Z",
    createdBy: "Sophie Martin",
    updatedBy: "Sophie Martin",
    carbonFootprint: 4.2,
    hasMedia: true,
    ingredients: [
      {
        id: "ING007",
        name: "Beef Chuck",
        type: "product",
        quantity: 1200,
        unit: "g",
        wastage: 5,
        inventoryQty: 5,
        inventoryUnit: "kg",
        costPerUnit: 0.02,
        totalCost: 25.20
      },
      {
        id: "ING008",
        name: "Red Wine",
        type: "product",
        quantity: 500,
        unit: "ml",
        wastage: 0,
        inventoryQty: 12,
        inventoryUnit: "bottles",
        costPerUnit: 0.015,
        totalCost: 7.50
      },
      {
        id: "ING009",
        name: "Pearl Onions",
        type: "product",
        quantity: 200,
        unit: "g",
        wastage: 2,
        inventoryQty: 1,
        inventoryUnit: "kg",
        costPerUnit: 0.008,
        totalCost: 1.63
      },
      {
        id: "ING010",
        name: "Mushrooms",
        type: "product",
        quantity: 300,
        unit: "g",
        wastage: 3,
        inventoryQty: 2,
        inventoryUnit: "kg",
        costPerUnit: 0.012,
        totalCost: 3.71
      },
      {
        id: "BASE001",
        name: "Beef Stock",
        type: "recipe",
        quantity: 750,
        unit: "ml",
        wastage: 0,
        inventoryQty: 4,
        inventoryUnit: "L",
        costPerUnit: 0.008,
        totalCost: 6.00
      }
    ],
    steps: [
      {
        id: "STP007",
        order: 1,
        description: "Cut beef into large cubes and season with salt and pepper",
        duration: 15,
        equipments: ["Cutting Board", "Knife"]
      },
      {
        id: "STP008",
        order: 2,
        description: "Sear beef in batches until browned on all sides",
        duration: 20,
        temperature: 200,
        equipments: ["Dutch Oven"]
      }
    ],
    prepNotes: "Use good quality red wine that you would drink",
    specialInstructions: "Can be made a day ahead for better flavor",
    additionalInfo: "Traditional Sunday dinner dish",
    allergens: [],
    tags: ["Braised", "Winter", "Classic French"],
    targetFoodCost: 33,
    laborCostPercentage: 30,
    overheadPercentage: 20,
    recommendedPrice: 32.99,
    foodCostPercentage: 29.3,
    grossProfit: 20.49
  },
  {
    id: "REC005",
    name: "Pad Thai",
    description: "Classic Thai stir-fried rice noodles with shrimp",
    category: "Main Course",
    cuisine: "Thai",
    status: "active",
    image: "/images/recipes/pad-thai.jpg",
    yield: 4,
    yieldUnit: "portions",
    prepTime: 25,
    cookTime: 15,
    totalTime: 40,
    difficulty: "medium",
    costPerPortion: 4.75,
    sellingPrice: 16.99,
    grossMargin: 72.0,
    netPrice: 15.99,
    grossPrice: 16.99,
    totalCost: 19.00,
    createdAt: "2024-02-12T14:00:00Z",
    updatedAt: "2024-02-12T16:30:00Z",
    createdBy: "Tom Wilson",
    updatedBy: "Tom Wilson",
    carbonFootprint: 1.8,
    hasMedia: true,
    ingredients: [
      {
        id: "ING011",
        name: "Rice Noodles",
        type: "product",
        quantity: 400,
        unit: "g",
        wastage: 1,
        inventoryQty: 5,
        inventoryUnit: "kg",
        costPerUnit: 0.008,
        totalCost: 3.23
      },
      {
        id: "ING012",
        name: "Shrimp",
        type: "product",
        quantity: 400,
        unit: "g",
        wastage: 2,
        inventoryQty: 3,
        inventoryUnit: "kg",
        costPerUnit: 0.025,
        totalCost: 10.20
      },
      {
        id: "ING013",
        name: "Bean Sprouts",
        type: "product",
        quantity: 200,
        unit: "g",
        wastage: 5,
        inventoryQty: 1,
        inventoryUnit: "kg",
        costPerUnit: 0.006,
        totalCost: 1.26
      },
      {
        id: "ING014",
        name: "Tofu",
        type: "product",
        quantity: 200,
        unit: "g",
        wastage: 0,
        inventoryQty: 2,
        inventoryUnit: "kg",
        costPerUnit: 0.007,
        totalCost: 1.40
      },
      {
        id: "BASE002",
        name: "Pad Thai Sauce",
        type: "recipe",
        quantity: 200,
        unit: "ml",
        wastage: 0,
        inventoryQty: 1,
        inventoryUnit: "L",
        costPerUnit: 0.015,
        totalCost: 3.00
      }
    ],
    steps: [
      {
        id: "STP009",
        order: 1,
        description: "Soak rice noodles in warm water until soft",
        duration: 20,
        equipments: ["Bowl"]
      },
      {
        id: "STP010",
        order: 2,
        description: "Stir-fry shrimp and tofu until cooked",
        duration: 5,
        temperature: 220,
        equipments: ["Wok", "Spatula"]
      }
    ],
    prepNotes: "Have all ingredients ready before starting to cook",
    specialInstructions: "Serve immediately while hot",
    additionalInfo: "Can be made vegetarian by omitting shrimp",
    allergens: ["Shellfish", "Soy", "Peanuts"],
    tags: ["Stir-Fry", "Spicy", "Gluten-Free"],
    targetFoodCost: 33,
    laborCostPercentage: 30,
    overheadPercentage: 20,
    recommendedPrice: 19.99,
    foodCostPercentage: 28.0,
    grossProfit: 12.24
  },
  {
    id: "REC006",
    name: "Tiramisu",
    description: "Classic Italian coffee-flavored dessert",
    category: "Desserts",
    cuisine: "Italian",
    status: "active",
    image: "/images/recipes/tiramisu.jpg",
    yield: 8,
    yieldUnit: "portions",
    prepTime: 30,
    cookTime: 0,
    totalTime: 30,
    difficulty: "medium",
    costPerPortion: 2.25,
    sellingPrice: 8.99,
    grossMargin: 74.9,
    netPrice: 7.99,
    grossPrice: 8.99,
    totalCost: 18.00,
    createdAt: "2024-02-14T10:00:00Z",
    updatedAt: "2024-02-14T12:30:00Z",
    createdBy: "Maria Garcia",
    updatedBy: "Maria Garcia",
    carbonFootprint: 0.8,
    hasMedia: true,
    ingredients: [
      {
        id: "ING015",
        name: "Mascarpone",
        type: "product",
        quantity: 500,
        unit: "g",
        wastage: 1,
        inventoryQty: 2,
        inventoryUnit: "kg",
        costPerUnit: 0.02,
        totalCost: 10.10
      },
      {
        id: "ING016",
        name: "Ladyfingers",
        type: "product",
        quantity: 200,
        unit: "g",
        wastage: 2,
        inventoryQty: 3,
        inventoryUnit: "kg",
        costPerUnit: 0.015,
        totalCost: 3.06
      },
      {
        id: "ING017",
        name: "Espresso",
        type: "product",
        quantity: 300,
        unit: "ml",
        wastage: 0,
        inventoryQty: 1,
        inventoryUnit: "L",
        costPerUnit: 0.008,
        totalCost: 2.40
      },
      {
        id: "ING018",
        name: "Cocoa Powder",
        type: "product",
        quantity: 50,
        unit: "g",
        wastage: 1,
        inventoryQty: 0.5,
        inventoryUnit: "kg",
        costPerUnit: 0.03,
        totalCost: 1.52
      }
    ],
    steps: [
      {
        id: "STP011",
        order: 1,
        description: "Whip mascarpone with egg yolks and sugar",
        duration: 10,
        equipments: ["Stand Mixer", "Bowl"]
      },
      {
        id: "STP012",
        order: 2,
        description: "Dip ladyfingers in coffee and layer with cream",
        duration: 15,
        equipments: ["Baking Dish"]
      }
    ],
    prepNotes: "Chill for at least 4 hours before serving",
    specialInstructions: "Can be made up to 2 days ahead",
    additionalInfo: "Use fresh espresso for best results",
    allergens: ["Dairy", "Eggs", "Gluten"],
    tags: ["No-Bake", "Italian Classic", "Coffee"],
    targetFoodCost: 33,
    laborCostPercentage: 30,
    overheadPercentage: 20,
    recommendedPrice: 10.99,
    foodCostPercentage: 25.1,
    grossProfit: 6.74
  }
]

// Export the first recipe as mockRecipe for the form
export const mockRecipe = mockRecipes[0]

export const mockIngredients = [
  // Proteins
  { id: 'ing-1', name: 'Chicken Breast', type: 'product', unit: 'g', costPerUnit: 0.02 },
  { id: 'ing-2', name: 'Salmon Fillet', type: 'product', unit: 'g', costPerUnit: 0.03 },
  { id: 'ing-3', name: 'Beef Tenderloin', type: 'product', unit: 'g', costPerUnit: 0.04 },
  { id: 'ing-4', name: 'Shrimp', type: 'product', unit: 'g', costPerUnit: 0.03 },
  { id: 'ing-5', name: 'Tofu', type: 'product', unit: 'g', costPerUnit: 0.01 },
  
  // Vegetables
  { id: 'ing-6', name: 'Bamboo Shoots', type: 'product', unit: 'g', costPerUnit: 0.01 },
  { id: 'ing-7', name: 'Bell Peppers', type: 'product', unit: 'g', costPerUnit: 0.01 },
  { id: 'ing-8', name: 'Carrots', type: 'product', unit: 'g', costPerUnit: 0.005 },
  { id: 'ing-9', name: 'Mushrooms', type: 'product', unit: 'g', costPerUnit: 0.015 },
  { id: 'ing-10', name: 'Onions', type: 'product', unit: 'g', costPerUnit: 0.004 },
  
  // Herbs & Spices
  { id: 'ing-11', name: 'Thai Basil', type: 'product', unit: 'g', costPerUnit: 0.02 },
  { id: 'ing-12', name: 'Cilantro', type: 'product', unit: 'g', costPerUnit: 0.015 },
  { id: 'ing-13', name: 'Garlic', type: 'product', unit: 'g', costPerUnit: 0.008 },
  { id: 'ing-14', name: 'Ginger', type: 'product', unit: 'g', costPerUnit: 0.01 },
  { id: 'ing-15', name: 'Lemongrass', type: 'product', unit: 'g', costPerUnit: 0.02 },
  
  // Sauces & Pastes
  { id: 'ing-16', name: 'Green Curry Paste', type: 'product', unit: 'g', costPerUnit: 0.03 },
  { id: 'ing-17', name: 'Red Curry Paste', type: 'product', unit: 'g', costPerUnit: 0.03 },
  { id: 'ing-18', name: 'Soy Sauce', type: 'product', unit: 'ml', costPerUnit: 0.01 },
  { id: 'ing-19', name: 'Fish Sauce', type: 'product', unit: 'ml', costPerUnit: 0.015 },
  { id: 'ing-20', name: 'Oyster Sauce', type: 'product', unit: 'ml', costPerUnit: 0.02 },
  
  // Dairy & Alternatives
  { id: 'ing-21', name: 'Coconut Milk', type: 'product', unit: 'ml', costPerUnit: 0.008 },
  { id: 'ing-22', name: 'Heavy Cream', type: 'product', unit: 'ml', costPerUnit: 0.01 },
  { id: 'ing-23', name: 'Butter', type: 'product', unit: 'g', costPerUnit: 0.015 },
  { id: 'ing-24', name: 'Parmesan Cheese', type: 'product', unit: 'g', costPerUnit: 0.03 },
  { id: 'ing-25', name: 'Mozzarella', type: 'product', unit: 'g', costPerUnit: 0.02 },
  
  // Grains & Starches
  { id: 'ing-26', name: 'Jasmine Rice', type: 'product', unit: 'g', costPerUnit: 0.005 },
  { id: 'ing-27', name: 'Rice Noodles', type: 'product', unit: 'g', costPerUnit: 0.008 },
  { id: 'ing-28', name: 'Egg Noodles', type: 'product', unit: 'g', costPerUnit: 0.01 },
  { id: 'ing-29', name: 'Basmati Rice', type: 'product', unit: 'g', costPerUnit: 0.006 },
  { id: 'ing-30', name: 'Arborio Rice', type: 'product', unit: 'g', costPerUnit: 0.012 }
]

// Base recipes that can be used as components
export const mockBaseRecipes = [
  { id: 'base-1', name: 'Thai Green Curry Sauce', type: 'recipe', unit: 'ml', costPerPortion: 2.50 },
  { id: 'base-2', name: 'Marinara Sauce', type: 'recipe', unit: 'ml', costPerPortion: 1.80 },
  { id: 'base-3', name: 'Vegetable Stock', type: 'recipe', unit: 'ml', costPerPortion: 1.20 },
  { id: 'base-4', name: 'Chicken Stock', type: 'recipe', unit: 'ml', costPerPortion: 1.50 },
  { id: 'base-5', name: 'Beef Stock', type: 'recipe', unit: 'ml', costPerPortion: 1.80 },
  { id: 'base-6', name: 'Pesto', type: 'recipe', unit: 'g', costPerPortion: 2.00 },
  { id: 'base-7', name: 'Teriyaki Sauce', type: 'recipe', unit: 'ml', costPerPortion: 1.60 },
  { id: 'base-8', name: 'Hollandaise Sauce', type: 'recipe', unit: 'ml', costPerPortion: 2.20 },
  { id: 'base-9', name: 'Béchamel Sauce', type: 'recipe', unit: 'ml', costPerPortion: 1.40 },
  { id: 'base-10', name: 'Demi-Glace', type: 'recipe', unit: 'ml', costPerPortion: 2.80 }
]