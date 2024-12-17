export interface Ingredient {
  id: string
  name: string
  quantity: number
  unit: string
  category: string
  cost: number
}

export interface Instruction {
  id: string
  stepNumber: number
  description: string
  time?: number
  temperature?: number
  notes?: string
  image?: string
  equipments?: string[]
  criticalControl?: boolean
}

export interface Recipe {
  id: string
  name: string
  category: string
  cuisine: string
  portionSize: string
  preparationTime: string
  difficulty: string
  status: 'active' | 'draft' | 'archived'
  costPerPortion: number
  sellingPrice: number
  grossMargin: number
  lastUpdated: string
  thumbnail?: string
  hasMedia: boolean
  additionalImages?: {
    id: string
    url: string
    caption?: string
  }[]
  video?: {
    url: string
    thumbnail?: string
    duration?: number
  }
  documents?: {
    id: string
    name: string
    url: string
    type: string
    size: number
    uploadedAt: string
  }[]
  ingredients: Ingredient[]
  instructions: Instruction[]
}

export const mockRecipes: Recipe[] = [
  {
    id: "1",
    name: "Classic Beef Burger",
    category: "main-courses",
    cuisine: "international",
    portionSize: "250g",
    preparationTime: "30-60-mins",
    difficulty: "medium",
    status: "active",
    costPerPortion: 8.50,
    sellingPrice: 24.99,
    grossMargin: 65.99,
    lastUpdated: "2024-01-15",
    thumbnail: "/images/recipes/placeholder-recipe.jpg",
    hasMedia: true,
    additionalImages: [
      {
        id: "img-1",
        url: "/images/recipes/classic-beef-burger-1.jpg",
        caption: "Classic Beef Burger"
      },
      {
        id: "img-2",
        url: "/images/recipes/classic-beef-burger-2.jpg",
        caption: "Classic Beef Burger"
      }
    ],
    video: {
      url: "/videos/classic-beef-burger.mp4",
      thumbnail: "/images/recipes/classic-beef-burger-thumbnail.jpg",
      duration: 120
    },
    documents: [
      {
        id: "doc-1",
        name: "Classic Beef Burger Recipe",
        url: "/documents/classic-beef-burger-recipe.pdf",
        type: "PDF",
        size: 1024,
        uploadedAt: "2024-01-15"
      }
    ],
    ingredients: [
      {
        id: "ing-1",
        name: "Ground Beef (80/20)",
        quantity: 180,
        unit: "g",
        category: "meat",
        cost: 4.50
      },
      {
        id: "ing-2",
        name: "Brioche Bun",
        quantity: 1,
        unit: "pcs",
        category: "pantry",
        cost: 1.20
      },
      {
        id: "ing-3",
        name: "Cheddar Cheese",
        quantity: 30,
        unit: "g",
        category: "dairy",
        cost: 0.80
      },
      {
        id: "ing-4",
        name: "Lettuce",
        quantity: 30,
        unit: "g",
        category: "produce",
        cost: 0.30
      },
      {
        id: "ing-5",
        name: "Tomato",
        quantity: 50,
        unit: "g",
        category: "produce",
        cost: 0.40
      },
      {
        id: "ing-6",
        name: "Red Onion",
        quantity: 30,
        unit: "g",
        category: "produce",
        cost: 0.20
      },
      {
        id: "ing-7",
        name: "House Sauce",
        quantity: 30,
        unit: "ml",
        category: "pantry",
        cost: 0.60
      },
      {
        id: "ing-8",
        name: "Salt and Pepper Mix",
        quantity: 5,
        unit: "g",
        category: "spices",
        cost: 0.10
      }
    ],
    instructions: [
      {
        id: "step-1",
        stepNumber: 1,
        description: "Remove the ground beef from refrigeration and let it come to room temperature for 15-20 minutes.",
        time: 20,
        temperature: 20,
        notes: "This ensures even cooking and better flavor development.",
        equipments: [],
        criticalControl: true
      },
      {
        id: "step-2",
        stepNumber: 2,
        description: "Season the ground beef with salt and pepper mix. Gently form into 180g patties, making a slight dimple in the center.",
        equipments: [],
        notes: "Don't overwork the meat to keep the burger tender."
      },
      {
        id: "step-3",
        stepNumber: 3,
        description: "Preheat the grill to high heat.",
        time: 5,
        temperature: 230,
        equipments: ["Grill"],
        criticalControl: true
      },
      {
        id: "step-4",
        stepNumber: 4,
        description: "Grill the burger for 4-5 minutes on each side for medium doneness.",
        time: 10,
        temperature: 230,
        notes: "Internal temperature should reach 160°F (71°C) for food safety.",
        equipments: ["Grill"],
        criticalControl: true
      },
      {
        id: "step-5",
        stepNumber: 5,
        description: "Add cheddar cheese on top of the patty during the last minute of cooking. Cover to melt.",
        time: 1,
        equipments: ["Grill"]
      },
      {
        id: "step-6",
        stepNumber: 6,
        description: "Toast the brioche bun on the grill, cut side down.",
        time: 1,
        equipments: ["Grill"]
      },
      {
        id: "step-7",
        stepNumber: 7,
        description: "Assemble the burger: bottom bun, sauce, lettuce, tomato, patty with melted cheese, onions, top bun.",
        time: 2,
        notes: "Serve immediately while hot.",
        equipments: []
      }
    ]
  },
  {
    id: "2",
    name: "Caesar Salad",
    category: "appetizers",
    cuisine: "international",
    portionSize: "200g",
    preparationTime: "15-30-mins",
    difficulty: "easy",
    status: "active",
    costPerPortion: 4.50,
    sellingPrice: 14.99,
    grossMargin: 69.98,
    lastUpdated: "2024-01-14",
    thumbnail: "/images/recipes/placeholder-recipe.jpg",
    hasMedia: false,
    ingredients: [
      {
        id: "ing-1",
        name: "Romaine Lettuce",
        quantity: 150,
        unit: "g",
        category: "produce",
        cost: 1.50
      },
      {
        id: "ing-2",
        name: "Parmesan Cheese",
        quantity: 30,
        unit: "g",
        category: "dairy",
        cost: 1.20
      },
      {
        id: "ing-3",
        name: "Croutons",
        quantity: 50,
        unit: "g",
        category: "pantry",
        cost: 0.80
      }
    ],
    instructions: [
      {
        id: "step-1",
        stepNumber: 1,
        description: "Wash and chop the romaine lettuce",
        time: 5,
        notes: "Ensure thorough washing to remove any dirt",
        equipments: ["Knife"]
      }
    ]
  },
  {
    id: "3",
    name: "Chocolate Lava Cake",
    category: "desserts",
    cuisine: "french",
    portionSize: "120g",
    preparationTime: "30-60-mins",
    difficulty: "medium",
    status: "draft",
    costPerPortion: 3.50,
    sellingPrice: 12.99,
    grossMargin: 73.06,
    lastUpdated: "2024-01-13",
    thumbnail: "/images/recipes/placeholder-recipe.jpg",
    hasMedia: true,
    additionalImages: [
      {
        id: "img-3",
        url: "/images/recipes/chocolate-lava-cake-1.jpg",
        caption: "Chocolate Lava Cake"
      },
      {
        id: "img-4",
        url: "/images/recipes/chocolate-lava-cake-2.jpg",
        caption: "Chocolate Lava Cake"
      }
    ],
    video: {
      url: "/videos/chocolate-lava-cake.mp4",
      thumbnail: "/images/recipes/chocolate-lava-cake-thumbnail.jpg",
      duration: 120
    },
    documents: [
      {
        id: "doc-2",
        name: "Chocolate Lava Cake Recipe",
        url: "/documents/chocolate-lava-cake-recipe.pdf",
        type: "PDF",
        size: 1024,
        uploadedAt: "2024-01-13"
      }
    ],
    ingredients: [
      {
        id: "ing-1",
        name: "Dark Chocolate",
        quantity: 100,
        unit: "g",
        category: "pantry",
        cost: 2.50
      },
      {
        id: "ing-2",
        name: "Butter",
        quantity: 50,
        unit: "g",
        category: "dairy",
        cost: 1.00
      }
    ],
    instructions: [
      {
        id: "step-1",
        stepNumber: 1,
        description: "Melt chocolate and butter in a double boiler",
        time: 10,
        temperature: 45,
        equipments: ["Double Boiler"],
        criticalControl: true
      }
    ]
  }
]

// Export the first recipe as mockRecipe for the form
export const mockRecipe = mockRecipes[0]