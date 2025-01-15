export interface RecipeCuisine {
  id: string
  name: string
  code: string
  description: string
  region: string
  status: 'active' | 'inactive'
  sortOrder: number
  recipeCount: number
  activeRecipeCount: number
  popularDishes: string[]
  keyIngredients: string[]
  lastUpdated: string
}

export const mockCuisines: RecipeCuisine[] = [
  {
    id: "1",
    name: "Italian",
    code: "ITA",
    description: "Traditional Italian cuisine with regional specialties",
    region: "Europe",
    status: "active",
    sortOrder: 1,
    recipeCount: 45,
    activeRecipeCount: 38,
    popularDishes: ["Pizza", "Pasta", "Risotto"],
    keyIngredients: ["Olive Oil", "Tomatoes", "Basil"],
    lastUpdated: "2024-01-15"
  },
  {
    id: "2",
    name: "Chinese",
    code: "CHN",
    description: "Diverse Chinese culinary traditions",
    region: "Asia",
    status: "active",
    sortOrder: 2,
    recipeCount: 60,
    activeRecipeCount: 52,
    popularDishes: ["Dim Sum", "Noodles", "Stir Fry"],
    keyIngredients: ["Soy Sauce", "Ginger", "Garlic"],
    lastUpdated: "2024-01-14"
  },
  {
    id: "3",
    name: "Mexican",
    code: "MEX",
    description: "Vibrant Mexican food culture",
    region: "Americas",
    status: "active",
    sortOrder: 3,
    recipeCount: 35,
    activeRecipeCount: 30,
    popularDishes: ["Tacos", "Enchiladas", "Guacamole"],
    keyIngredients: ["Corn", "Chili", "Cilantro"],
    lastUpdated: "2024-01-15"
  },
  {
    id: "4",
    name: "Indian",
    code: "IND",
    description: "Rich and diverse Indian cuisine",
    region: "Asia",
    status: "active",
    sortOrder: 4,
    recipeCount: 50,
    activeRecipeCount: 45,
    popularDishes: ["Curry", "Biryani", "Tandoori"],
    keyIngredients: ["Spices", "Rice", "Yogurt"],
    lastUpdated: "2024-01-13"
  },
  {
    id: "5",
    name: "French",
    code: "FRA",
    description: "Classic French culinary arts",
    region: "Europe",
    status: "active",
    sortOrder: 5,
    recipeCount: 40,
    activeRecipeCount: 35,
    popularDishes: ["Coq au Vin", "Ratatouille", "Croissant"],
    keyIngredients: ["Butter", "Wine", "Herbs"],
    lastUpdated: "2024-01-15"
  },
  {
    id: "6",
    name: "Japanese",
    code: "JPN",
    description: "Traditional Japanese cooking methods",
    region: "Asia",
    status: "active",
    sortOrder: 6,
    recipeCount: 55,
    activeRecipeCount: 48,
    popularDishes: ["Sushi", "Ramen", "Tempura"],
    keyIngredients: ["Rice", "Seaweed", "Dashi"],
    lastUpdated: "2024-01-14"
  },
  {
    id: "7",
    name: "Mediterranean",
    code: "MED",
    description: "Healthy Mediterranean diet",
    region: "Europe",
    status: "active",
    sortOrder: 7,
    recipeCount: 30,
    activeRecipeCount: 25,
    popularDishes: ["Greek Salad", "Hummus", "Falafel"],
    keyIngredients: ["Olive Oil", "Lemon", "Chickpeas"],
    lastUpdated: "2024-01-15"
  },
  {
    id: "8",
    name: "Thai",
    code: "THA",
    description: "Flavorful Thai cooking traditions",
    region: "Asia",
    status: "active",
    sortOrder: 8,
    recipeCount: 45,
    activeRecipeCount: 40,
    popularDishes: ["Pad Thai", "Green Curry", "Tom Yum"],
    keyIngredients: ["Lemongrass", "Coconut Milk", "Fish Sauce"],
    lastUpdated: "2024-01-15"
  }
] 