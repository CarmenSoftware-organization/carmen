import { RecipeForm } from "../components/recipe-form"
import { mockRecipes } from "../data/mock-recipes"

interface RecipeEditPageProps {
  params: {
    id: string
  }
}

export default function EditRecipePage({ params }: RecipeEditPageProps) {
  const recipe = mockRecipes.find(r => r.id === params.id)

  return (
    <div className="container mx-auto py-6">
      <RecipeForm recipe={recipe} />
    </div>
  )
} 