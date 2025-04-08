'use client'

import { RecipeForm } from "../components/recipe-form"
import { useRouter } from "next/navigation"
import { Recipe } from "@/app/(main)/operational-planning/recipe-management/recipes/data/mock-recipes"

export default function CreateRecipePage() {
  const router = useRouter()

  const handleSubmit = async (recipe: Recipe) => {
    console.log('Creating recipe:', recipe)
    router.push(`/operational-planning/recipe-management/recipes/${recipe.id}`)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create New Recipe</h1>
      <RecipeForm onSubmit={handleSubmit} />
    </div>
  )
} 