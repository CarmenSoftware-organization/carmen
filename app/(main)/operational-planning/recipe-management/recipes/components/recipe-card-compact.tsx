"use client"

import Link from "next/link"
import { Recipe } from "@/app/(main)/operational-planning/recipe-management/recipes/data/mock-recipes"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, MoreVertical, Trash2, Check, CheckCircle2, XCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { RecipeImage } from "./recipe-image"

interface RecipeCardCompactProps {
  recipe: Recipe
}

export function RecipeCardCompact({ recipe }: RecipeCardCompactProps) {
  return (
    <Card className="overflow-hidden transition-all hover:ring-2 hover:ring-primary/50 group-hover:shadow-lg">
      <div className="relative">
        <RecipeImage
          src={recipe.image}
          alt={recipe.name}
          aspectRatio="video"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Badge 
          variant={recipe.status === "published" ? "default" : "secondary"}
          className="absolute top-2 right-2"
        >
          {recipe.status === "published" ? (
            <CheckCircle2 className="h-3 w-3 mr-1" />
          ) : (
            <XCircle className="h-3 w-3 mr-1" />
          )}
          {recipe.status}
        </Badge>
      </div>
      <div className="p-4">
        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
          {recipe.name}
        </h3>
        <div className="mt-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Cost/Portion</span>
            <span className="font-medium">${recipe.costPerPortion.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Selling Price</span>
            <span className="font-medium">${recipe.sellingPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Margin</span>
            <span className="font-medium">{recipe.grossMargin.toFixed(1)}%</span>
          </div>
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>CO₂eq per Portion:</span>
              <span className="font-medium">{recipe.carbonFootprint} kg</span>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="font-normal">
            {recipe.category}
          </Badge>
          {recipe.cuisine && (
            <Badge variant="secondary" className="font-normal">
              {recipe.cuisine}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  )
} 