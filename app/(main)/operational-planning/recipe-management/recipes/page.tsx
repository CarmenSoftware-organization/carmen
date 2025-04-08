import { Suspense } from "react"
import RecipeList from "./components/recipe-list-new"
import { RecipeListSkeleton } from "./components/recipe-list-skeleton"


export default function RecipesPage() {
  return (
    <div className="h-full flex flex-col gap-4 p-4 md:p-6">
      <Suspense fallback={<RecipeListSkeleton />}>
        <RecipeList />
      </Suspense>
    </div>
  )
} 