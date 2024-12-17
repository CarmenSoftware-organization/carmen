import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit2, Copy, Archive, Loader2 } from "lucide-react"
import { Recipe } from "../data/mock-recipes"
import Link from "next/link"
import { useState } from "react"

interface RecipeListViewProps {
  recipes: Recipe[]
}

export function RecipeListView({ recipes }: RecipeListViewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeRecipe, setActiveRecipe] = useState<string | null>(null)

  const handleClone = async (recipeId: string) => {
    setIsLoading(true)
    setActiveRecipe(recipeId)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log("Cloning recipe:", recipeId)
    } finally {
      setIsLoading(false)
      setActiveRecipe(null)
    }
  }

  const handleArchive = async (recipeId: string) => {
    setIsLoading(true)
    setActiveRecipe(recipeId)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log("Archiving recipe:", recipeId)
    } finally {
      setIsLoading(false)
      setActiveRecipe(null)
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Cuisine</TableHead>
          <TableHead>Cost/Portion</TableHead>
          <TableHead>Selling Price</TableHead>
          <TableHead>Margin</TableHead>
          <TableHead>Prep Time</TableHead>
          <TableHead>Difficulty</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recipes.map((recipe) => (
          <TableRow key={recipe.id}>
            <TableCell className="font-medium">{recipe.name}</TableCell>
            <TableCell>{recipe.category}</TableCell>
            <TableCell>{recipe.cuisine}</TableCell>
            <TableCell>${recipe.costPerPortion.toFixed(2)}</TableCell>
            <TableCell>${recipe.sellingPrice.toFixed(2)}</TableCell>
            <TableCell>{recipe.grossMargin.toFixed(1)}%</TableCell>
            <TableCell>{recipe.preparationTime}</TableCell>
            <TableCell>
              <Badge variant="secondary">
                {recipe.difficulty}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge
                variant={recipe.status === "active" ? "default" : "secondary"}
              >
                {recipe.status}
              </Badge>
            </TableCell>
            <TableCell>{recipe.lastUpdated}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Link href={`/operational-planning/recipe-management/recipes/${recipe.id}`}>
                  <Button size="sm" variant="outline">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </Link>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleClone(recipe.id)}
                  disabled={isLoading && activeRecipe === recipe.id}
                >
                  {isLoading && activeRecipe === recipe.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleArchive(recipe.id)}
                  disabled={isLoading && activeRecipe === recipe.id}
                >
                  {isLoading && activeRecipe === recipe.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Archive className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 