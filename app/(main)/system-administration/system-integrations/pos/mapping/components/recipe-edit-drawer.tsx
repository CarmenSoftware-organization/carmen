"use client"

import { useState, useEffect } from "react"
import { X, Search, Loader2 } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface RecipeMapping {
  id: string
  posItemId: string
  posItemName: string
  posItemCategory: string
  recipeId: string
  recipeName: string
  recipeCategory: string
  portionSize: number
  unit: string
  isActive: boolean
  mappedBy: {
    id: string
    name: string
  }
  mappedAt: string
}

interface Recipe {
  id: string
  name: string
  category: string
  servingSize: number
  costPerServing: number
}

interface RecipeEditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mapping: RecipeMapping | null
  onSave: (updatedMapping: Partial<RecipeMapping>) => void
}

export function RecipeEditDrawer({
  open,
  onOpenChange,
  mapping,
  onSave,
}: RecipeEditDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [portionSize, setPortionSize] = useState("1")
  const [unit, setUnit] = useState("serving")
  const [isActive, setIsActive] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Mock recipes for search
  const mockRecipes: Recipe[] = [
    {
      id: "recipe-001",
      name: "Margherita Pizza",
      category: "Pizza",
      servingSize: 1,
      costPerServing: 5.5,
    },
    {
      id: "recipe-002",
      name: "House Salad",
      category: "Salad",
      servingSize: 1,
      costPerServing: 3.2,
    },
    {
      id: "recipe-003",
      name: "Chicken Alfredo",
      category: "Pasta",
      servingSize: 1,
      costPerServing: 7.8,
    },
  ]

  // Initialize form with mapping data
  useEffect(() => {
    if (mapping) {
      const recipe = mockRecipes.find(r => r.id === mapping.recipeId)
      setSelectedRecipe(recipe || null)
      setPortionSize(mapping.portionSize.toString())
      setUnit(mapping.unit)
      setIsActive(mapping.isActive)
    }
  }, [mapping])

  // Filter recipes based on search
  const filteredRecipes = mockRecipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculate inventory impact preview
  const calculateImpact = () => {
    if (!selectedRecipe) return null

    const portion = parseFloat(portionSize) || 1
    const cost = selectedRecipe.costPerServing * portion

    return {
      estimatedCost: cost.toFixed(2),
      portions: portion,
      ingredients: [
        { name: "Primary Ingredient", quantity: portion * 200, unit: "g" },
        { name: "Secondary Ingredient", quantity: portion * 100, unit: "ml" },
      ],
    }
  }

  const impact = calculateImpact()

  const handleSave = async () => {
    if (!selectedRecipe || !mapping) return

    setIsSaving(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    const updatedMapping: Partial<RecipeMapping> = {
      recipeId: selectedRecipe.id,
      recipeName: selectedRecipe.name,
      recipeCategory: selectedRecipe.category,
      portionSize: parseFloat(portionSize),
      unit,
      isActive,
    }

    onSave(updatedMapping)
    setIsSaving(false)
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Recipe Mapping</SheetTitle>
          <SheetDescription>
            Update the recipe mapping for {mapping?.posItemName}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* POS Item Info */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">POS Item</Label>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{mapping?.posItemName}</p>
                  <p className="text-sm text-muted-foreground">
                    {mapping?.posItemCategory}
                  </p>
                </div>
                <Badge variant={mapping?.isActive ? "default" : "secondary"}>
                  {mapping?.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Recipe Search */}
          <div className="space-y-2">
            <Label htmlFor="recipe-search">Search Recipe</Label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="recipe-search"
                placeholder="Search by recipe name or category..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Recipe Results */}
            {searchQuery && (
              <div className="border rounded-lg divide-y max-h-[200px] overflow-y-auto">
                {filteredRecipes.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No recipes found
                  </div>
                ) : (
                  filteredRecipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      className="w-full p-3 hover:bg-muted text-left transition-colors"
                      onClick={() => {
                        setSelectedRecipe(recipe)
                        setSearchQuery("")
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{recipe.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {recipe.category}
                          </p>
                        </div>
                        <Badge variant="outline">
                          ${recipe.costPerServing.toFixed(2)}/serving
                        </Badge>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Selected Recipe */}
          {selectedRecipe && (
            <div className="space-y-4">
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedRecipe.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedRecipe.category}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRecipe(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Portion Configuration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="portion-size">Portion Size</Label>
                  <Input
                    id="portion-size"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={portionSize}
                    onChange={(e) => setPortionSize(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger id="unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serving">Serving</SelectItem>
                      <SelectItem value="piece">Piece</SelectItem>
                      <SelectItem value="portion">Portion</SelectItem>
                      <SelectItem value="slice">Slice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="space-y-2">
                <Label htmlFor="status">Mapping Status</Label>
                <Select
                  value={isActive ? "active" : "inactive"}
                  onValueChange={(value) => setIsActive(value === "active")}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Inventory Impact Preview */}
              {impact && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Inventory Impact Preview
                  </Label>
                  <div className="p-3 bg-muted rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Estimated Cost per Transaction:
                      </span>
                      <span className="font-medium">${impact.estimatedCost}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Portions:</span>
                      <span className="font-medium">{impact.portions}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Expected Deductions:
                      </p>
                      {impact.ingredients.map((ing, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span>{ing.name}:</span>
                          <span>
                            {ing.quantity} {ing.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-2 justify-end">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedRecipe || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Mapping"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
