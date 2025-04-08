export interface Recipe {
  id: string
  name: string
  sku: string
  unit: string
  description: string
  category: string
  cuisine: string
  prepTime: number
  cookTime: number
  servings: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  ingredients: {
    name: string
    amount: number
    unit: string
  }[]
  instructions: string[]
  image?: string
  costPerPortion: number
  createdAt: string
  updatedAt: string
}

export const mockRecipes: Recipe[] = [
  {
    id: "1",
    name: "Thai Green Curry",
    sku: "RECIPE-001",
    unit: "portion",
    description: "A fragrant Thai curry with coconut milk and vegetables",
    category: "Main Course",
    cuisine: "Thai",
    prepTime: 20,
    cookTime: 30,
    servings: 4,
    difficulty: "Medium",
    ingredients: [
      { name: "Coconut Milk", amount: 400, unit: "ml" },
      { name: "Green Curry Paste", amount: 2, unit: "tbsp" },
      { name: "Chicken Breast", amount: 500, unit: "g" },
      { name: "Bamboo Shoots", amount: 200, unit: "g" },
      { name: "Thai Basil", amount: 20, unit: "g" }
    ],
    instructions: [
      "Heat oil in a large pan over medium heat",
      "Add curry paste and fry until fragrant",
      "Add coconut milk and bring to a simmer",
      "Add chicken and cook for 15 minutes",
      "Add bamboo shoots and cook for 5 more minutes",
      "Garnish with Thai basil"
    ],
    image: "/images/thai-green-curry.jpg",
    costPerPortion: 3.50,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    name: "Caesar Salad",
    sku: "RECIPE-002",
    unit: "portion",
    description: "Classic Caesar salad with homemade dressing",
    category: "Salad",
    cuisine: "Italian-American",
    prepTime: 15,
    cookTime: 10,
    servings: 2,
    difficulty: "Easy",
    ingredients: [
      { name: "Romaine Lettuce", amount: 1, unit: "head" },
      { name: "Parmesan Cheese", amount: 50, unit: "g" },
      { name: "Croutons", amount: 100, unit: "g" },
      { name: "Caesar Dressing", amount: 60, unit: "ml" }
    ],
    instructions: [
      "Wash and chop the lettuce",
      "Make the dressing",
      "Toss lettuce with dressing",
      "Add croutons and cheese",
      "Season to taste"
    ],
    image: "/images/caesar-salad.jpg",
    costPerPortion: 2.75,
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z"
  },
  {
    id: "3",
    name: "Spaghetti Carbonara",
    sku: "RECIPE-003",
    unit: "portion",
    description: "Traditional Roman pasta dish with eggs and pecorino",
    category: "Pasta",
    cuisine: "Italian",
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    difficulty: "Medium",
    ingredients: [
      { name: "Spaghetti", amount: 400, unit: "g" },
      { name: "Eggs", amount: 4, unit: "whole" },
      { name: "Pecorino Romano", amount: 100, unit: "g" },
      { name: "Guanciale", amount: 150, unit: "g" },
      { name: "Black Pepper", amount: 2, unit: "tsp" }
    ],
    instructions: [
      "Cook pasta in salted water",
      "Crisp up the guanciale",
      "Mix eggs with cheese",
      "Combine pasta with egg mixture",
      "Add guanciale and pepper"
    ],
    costPerPortion: 4.00,
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z"
  },
  {
    id: "4",
    name: "Beef Stir Fry",
    sku: "RECIPE-004",
    unit: "portion",
    description: "Quick and easy beef stir fry with vegetables",
    category: "Main Course",
    cuisine: "Asian Fusion",
    prepTime: 15,
    cookTime: 10,
    servings: 4,
    difficulty: "Easy",
    ingredients: [
      { name: "Beef Strips", amount: 500, unit: "g" },
      { name: "Mixed Vegetables", amount: 400, unit: "g" },
      { name: "Soy Sauce", amount: 60, unit: "ml" },
      { name: "Garlic", amount: 3, unit: "cloves" }
    ],
    instructions: [
      "Marinate beef in soy sauce",
      "Heat wok until very hot",
      "Stir fry beef until browned",
      "Add vegetables and stir fry",
      "Season to taste"
    ],
    costPerPortion: 3.75,
    createdAt: "2024-01-04T00:00:00Z",
    updatedAt: "2024-01-04T00:00:00Z"
  },
  {
    id: "5",
    name: "Margherita Pizza",
    sku: "RECIPE-005",
    unit: "whole",
    description: "Classic Neapolitan pizza with tomato and mozzarella",
    category: "Pizza",
    cuisine: "Italian",
    prepTime: 20,
    cookTime: 10,
    servings: 2,
    difficulty: "Medium",
    ingredients: [
      { name: "Pizza Dough", amount: 250, unit: "g" },
      { name: "Tomato Sauce", amount: 100, unit: "g" },
      { name: "Fresh Mozzarella", amount: 125, unit: "g" },
      { name: "Fresh Basil", amount: 10, unit: "g" },
      { name: "Olive Oil", amount: 15, unit: "ml" }
    ],
    instructions: [
      "Stretch the dough",
      "Spread tomato sauce",
      "Add torn mozzarella",
      "Bake in very hot oven",
      "Garnish with basil"
    ],
    costPerPortion: 3.25,
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-05T00:00:00Z"
  },
  {
    id: "6",
    name: "Chocolate Brownies",
    sku: "RECIPE-006",
    unit: "piece",
    description: "Rich and fudgy chocolate brownies",
    category: "Dessert",
    cuisine: "American",
    prepTime: 15,
    cookTime: 25,
    servings: 12,
    difficulty: "Easy",
    ingredients: [
      { name: "Dark Chocolate", amount: 200, unit: "g" },
      { name: "Butter", amount: 175, unit: "g" },
      { name: "Eggs", amount: 3, unit: "whole" },
      { name: "Sugar", amount: 200, unit: "g" },
      { name: "Flour", amount: 100, unit: "g" }
    ],
    instructions: [
      "Melt chocolate and butter",
      "Whisk eggs and sugar",
      "Combine all ingredients",
      "Pour into lined tin",
      "Bake until just set"
    ],
    costPerPortion: 1.50,
    createdAt: "2024-01-06T00:00:00Z",
    updatedAt: "2024-01-06T00:00:00Z"
  }
] 