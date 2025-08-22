/**
 * Mock Recipe Data
 * Centralized recipe mock data for the Carmen ERP application
 */

import { Recipe } from '@/lib/types'

export const mockRecipes: Recipe[] = [
  {
    id: 'recipe-001',
    name: 'Classic Margherita Pizza',
    description: 'Traditional Italian pizza with tomatoes, mozzarella, and basil',
    category: 'Main Course',
    cuisineType: 'Italian',
    servingSize: 4,
    preparationTime: 30,
    cookingTime: 15,
    difficulty: 'Medium',
    ingredients: [
      {
        productId: 'product-003',
        productName: 'All-Purpose Flour',
        quantity: 0.5,
        unit: 'kg'
      },
      {
        productId: 'product-002',
        productName: 'Organic Tomatoes',
        quantity: 0.3,
        unit: 'kg'
      },
      {
        productId: 'product-004',
        productName: 'Fresh Basil',
        quantity: 1,
        unit: 'bunch'
      }
    ],
    instructions: [
      'Prepare pizza dough with flour and water',
      'Roll out dough into circle',
      'Add tomato sauce',
      'Add mozzarella cheese',
      'Bake at 220°C for 15 minutes',
      'Garnish with fresh basil'
    ],
    costPerServing: 3.50,
    sellingPrice: 12.00,
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-08-15')
  },
  {
    id: 'recipe-002',
    name: 'Mediterranean Salad',
    description: 'Fresh salad with tomatoes, olives, and olive oil dressing',
    category: 'Salad',
    cuisineType: 'Mediterranean',
    servingSize: 2,
    preparationTime: 15,
    cookingTime: 0,
    difficulty: 'Easy',
    ingredients: [
      {
        productId: 'product-002',
        productName: 'Organic Tomatoes',
        quantity: 0.2,
        unit: 'kg'
      },
      {
        productId: 'product-001',
        productName: 'Premium Olive Oil',
        quantity: 0.05,
        unit: 'bottle'
      },
      {
        productId: 'product-004',
        productName: 'Fresh Basil',
        quantity: 0.5,
        unit: 'bunch'
      }
    ],
    instructions: [
      'Dice tomatoes',
      'Add olive oil dressing',
      'Garnish with fresh basil',
      'Serve immediately'
    ],
    costPerServing: 2.25,
    sellingPrice: 8.50,
    isActive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-08-10')
  }
]