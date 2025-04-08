'use client'

import { useRouter } from 'next/navigation'
import { RecipeForm } from '../../components/recipe-form'
import { Recipe, mockRecipes } from '../../data/mock-recipes'

interface EditRecipePageProps {
  params: {
    id: string
  }
}

export default function EditRecipePage({ params }: EditRecipePageProps) {
  const router = useRouter()
  const recipe = mockRecipes.find(r => r.id === params.id)

  if (!recipe) {
    return <div className="p-4">Recipe not found</div>
  }

  const handleSubmit = async (updatedRecipe: Recipe) => {
    try {
      // TODO: Replace with actual API call
      console.log('Updating recipe:', updatedRecipe)
      
      // For now, just navigate back to recipe view
      router.push(`/operational-planning/recipe-management/recipes/${params.id}`)
    } catch (error) {
      console.error('Error updating recipe:', error)
      // TODO: Show error toast
    }
  }

  return (
    <RecipeForm 
      initialData={recipe}
      onSubmit={handleSubmit}
    />
  )
} 