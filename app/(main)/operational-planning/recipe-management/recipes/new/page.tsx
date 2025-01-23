"use client"

import { RecipeForm } from "../components/recipe-form"
import { useRouter } from "next/navigation"
import { Recipe } from "@/app/(main)/operational-planning/recipe-management/recipes/data/mock-recipes"

export default function CreateRecipePage() {
  const router = useRouter()

  const handleSubmit = async (recipe: Recipe) => {
    try {
      // TODO: Implement API call to create recipe
      console.log('Creating recipe:', recipe)
      router.push('/operational-planning/recipe-management/recipes')
    } catch (error) {
      console.error('Error creating recipe:', error)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <RecipeForm 
        onSubmit={handleSubmit}
        initialData={{
          id: '',
          name: '',
          description: '',
          category: '',
          cuisine: '',
          status: 'draft',
          image: '',
          yield: 0,
          yieldUnit: 'portions',
          prepTime: 0,
          cookTime: 0,
          totalTime: 0,
          difficulty: 'easy',
          costPerPortion: 0,
          sellingPrice: 0,
          grossMargin: 0,
          netPrice: 0,
          grossPrice: 0,
          totalCost: 0,
          carbonFootprint: 0,
          hasMedia: false,
          deductFromStock: false,
          ingredients: [],
          steps: [],
          prepNotes: '',
          specialInstructions: '',
          additionalInfo: '',
          allergens: [],
          tags: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'Current User',
          updatedBy: 'Current User',
          targetFoodCost: 33,
          laborCostPercentage: 30,
          overheadPercentage: 20,
          recommendedPrice: 0,
          foodCostPercentage: 0,
          grossProfit: 0,
          unitOfSale: 'portion'
        }} 
      />
    </div>
  )
} 