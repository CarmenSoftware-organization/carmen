import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit2, Copy, Archive, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Recipe } from "../data/mock-recipes"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface RecipeCardProps {
  recipe: Recipe
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleClone = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log("Cloning recipe:", recipe.id)
      // In real implementation, this would create a new recipe with copied data
    } finally {
      setIsLoading(false)
    }
  }

  const handleArchive = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log("Archiving recipe:", recipe.id)
      // In real implementation, this would update the recipe status
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative">
        <img
          src={recipe.thumbnail || "../images/placeholder-recipe.jpg"}
          alt={recipe.name}
          className="object-cover w-full h-full"
        />
        <Badge
          className="absolute top-2 right-2"
          variant={recipe.status === "active" ? "default" : "secondary"}
        >
          {recipe.status}
        </Badge>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{recipe.name}</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Category:</span>
            <span className="font-medium text-foreground">{recipe.category}</span>
          </div>
          <div className="flex justify-between">
            <span>Cost/Portion:</span>
            <span className="font-medium text-foreground">
              ${recipe.costPerPortion.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Selling Price:</span>
            <span className="font-medium text-foreground">
              ${recipe.sellingPrice.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Margin:</span>
            <span className="font-medium text-foreground">
              {recipe.grossMargin.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Link 
            href={`/operational-planning/recipe-management/recipes/${recipe.id}`}
            className="flex-1"
          >
            <Button variant="outline" className="w-full">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleClone}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            Clone
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleArchive}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Archive className="h-4 w-4 mr-2" />
            )}
            Archive
          </Button>
        </div>
      </div>
    </Card>
  )
} 