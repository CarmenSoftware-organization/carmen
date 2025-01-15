"use client"

import { useRouter } from 'next/navigation'
import { RecipeForm } from '../components/recipe-form'
import { Recipe } from '../data/mock-recipes'

export default function CreateRecipePage() {
  const router = useRouter()

  const handleSubmit = async (recipe: Recipe) => {
    try {
      // TODO: Replace with actual API call
      console.log('Creating recipe:', recipe)
      
      // For now, just navigate back to recipes list
      router.push('/operational-planning/recipe-management/recipes')
    } catch (error) {
      console.error('Error creating recipe:', error)
      // TODO: Show error toast
    }
  }

  return (
    <RecipeForm onSubmit={handleSubmit} />
  )
} 