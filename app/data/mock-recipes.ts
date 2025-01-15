export interface Recipe {
  id: string
  name: string
  category: string
  cuisine: string
  status: "active" | "draft"
  costPerPortion: number
  sellingPrice: number
  grossMargin: number
  preparationTime: string
  difficulty: string
  imageUrl?: string
  hasMedia: boolean
}

export const mockRecipes: Recipe[] = [
  {
    id: "1",
    name: "Classic Margherita Pizza",
    category: "Pizza",
    cuisine: "Italian",
    status: "active",
    costPerPortion: 3.50,
    sellingPrice: 12.99,
    grossMargin: 73.1,
    preparationTime: "25 mins",
    difficulty: "Easy",
    hasMedia: false
  },
  {
    id: "2",
    name: "Chicken Caesar Salad",
    category: "Salad",
    cuisine: "American",
    status: "active",
    costPerPortion: 4.25,
    sellingPrice: 14.99,
    grossMargin: 71.6,
    preparationTime: "15 mins",
    difficulty: "Easy",
    imageUrl: "/images/recipes/caesar-salad.jpg",
    hasMedia: true
  },
  {
    id: "3",
    name: "Thai Green Curry",
    category: "Main Course",
    cuisine: "Thai",
    status: "active",
    costPerPortion: 5.75,
    sellingPrice: 18.99,
    grossMargin: 69.7,
    preparationTime: "45 mins",
    difficulty: "Medium",
    imageUrl: "/images/recipes/thai-green-curry.jpg",
    hasMedia: true
  },
  {
    id: "4",
    name: "Vegetable Stir Fry",
    category: "Main Course",
    cuisine: "Asian",
    status: "active",
    costPerPortion: 3.25,
    sellingPrice: 13.99,
    grossMargin: 76.8,
    preparationTime: "20 mins",
    difficulty: "Easy",
    hasMedia: false,
    imageUrl: "/images/placeholder.jpg",
  },
  {
    id: "5",
    name: "Chocolate Lava Cake",
    category: "Dessert",
    cuisine: "French",
    status: "active",
    costPerPortion: 2.75,
    sellingPrice: 9.99,
    grossMargin: 72.5,
    preparationTime: "30 mins",
    difficulty: "Medium",
    imageUrl: "/images/placeholder.jpg",
    hasMedia: false
  },
  {
    id: "6",
    name: "Grilled Salmon",
    category: "Main Course",
    cuisine: "American",
    status: "draft",
    costPerPortion: 8.50,
    sellingPrice: 24.99,
    grossMargin: 66.0,
    preparationTime: "25 mins",
    difficulty: "Medium",
    imageUrl: "/images/placeholder.jpg",
    hasMedia: false
  },
  {
    id: "7",
    name: "Mushroom Risotto",
    category: "Main Course",
    cuisine: "Italian",
    status: "active",
    costPerPortion: 4.75,
    sellingPrice: 16.99,
    grossMargin: 72.0,
    preparationTime: "35 mins",
    difficulty: "Medium",
    hasMedia: false,
    imageUrl: "/images/placeholder.jpg",
  },
  {
    id: "8",
    name: "Greek Salad",
    category: "Salad",
    cuisine: "Greek",
    status: "active",
    costPerPortion: 3.25,
    sellingPrice: 11.99,
    grossMargin: 72.9,
    preparationTime: "10 mins",
    difficulty: "Easy",
    hasMedia: false,
    imageUrl: "/images/placeholder.jpg",
  }
] 