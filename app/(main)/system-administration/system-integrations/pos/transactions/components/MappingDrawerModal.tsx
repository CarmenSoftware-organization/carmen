"use client"

import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Search,
  Check,
  AlertTriangle,
  Package,
  ChefHat,
} from "lucide-react"

import {
  mockRecipeSearchResults,
  mockMappingPreviews,
  getMappingPreview,
} from "@/lib/mock-data/pos-mappings"
import type {
  POSItem,
  RecipeSearchResult,
  MappingPreview,
} from "@/lib/types/pos-integration"

interface MappingDrawerModalProps {
  posItem: POSItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (mapping: {
    posItemId: string
    recipeId: string
    portionSize: number
    unit: string
  }) => void
}

export function MappingDrawerModal({
  posItem,
  open,
  onOpenChange,
  onSave,
}: MappingDrawerModalProps) {
  // State
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeSearchResult | null>(null)
  const [portionSize, setPortionSize] = useState<number>(1)
  const [unit, setUnit] = useState<string>("serving")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  // Filtered recipes based on search
  const filteredRecipes = useMemo(() => {
    if (!searchQuery) return mockRecipeSearchResults

    const query = searchQuery.toLowerCase()
    return mockRecipeSearchResults.filter(recipe =>
      recipe.name.toLowerCase().includes(query) ||
      recipe.category.toLowerCase().includes(query)
    )
  }, [searchQuery])

  // Get mapping preview
  const mappingPreview = useMemo(() => {
    if (!selectedRecipe || !posItem) return null

    // Try to get from mock data
    const preview = getMappingPreview(
      posItem.posItemId,
      selectedRecipe.id,
      portionSize,
      unit
    )

    return preview
  }, [selectedRecipe, posItem, portionSize, unit])

  // Handle recipe selection
  const handleRecipeSelect = (recipe: RecipeSearchResult) => {
    setSelectedRecipe(recipe)
  }

  // Handle save
  const handleSave = () => {
    if (!posItem || !selectedRecipe) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      if (onSave) {
        onSave({
          posItemId: posItem.posItemId,
          recipeId: selectedRecipe.id,
          portionSize,
          unit,
        })
      }

      setIsLoading(false)
      handleClose()
    }, 1000)
  }

  // Handle close
  const handleClose = () => {
    setSearchQuery("")
    setSelectedRecipe(null)
    setPortionSize(1)
    setUnit("serving")
    onOpenChange(false)
  }

  if (!posItem) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Map POS Item to Recipe</DialogTitle>
          <DialogDescription>
            Create a mapping between "{posItem.name}" and a recipe for inventory deduction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* POS Item Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">POS Item Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{posItem.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium">{posItem.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Price</p>
                  <p className="font-medium">
                    {formatCurrency(posItem.price.amount, posItem.price.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={posItem.isActive ? "default" : "secondary"}>
                    {posItem.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recipe Search */}
          <div className="space-y-3">
            <Label htmlFor="recipe-search">Search Recipe</Label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="recipe-search"
                type="search"
                placeholder="Search by recipe name or category..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Recipe Results */}
            <div className="border rounded-lg max-h-[200px] overflow-y-auto">
              {filteredRecipes.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No recipes found
                </div>
              ) : (
                <div className="divide-y">
                  {filteredRecipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      type="button"
                      onClick={() => handleRecipeSelect(recipe)}
                      className={`w-full p-3 text-left hover:bg-muted/50 transition-colors ${
                        selectedRecipe?.id === recipe.id ? "bg-muted" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <ChefHat className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">{recipe.name}</p>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {recipe.category}
                          </p>
                        </div>
                        {selectedRecipe?.id === recipe.id && (
                          <Check className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Portion Configuration */}
          {selectedRecipe && (
            <div className="space-y-4">
              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="portion-size">Portion Size</Label>
                  <Input
                    id="portion-size"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={portionSize}
                    onChange={(e) => setPortionSize(parseFloat(e.target.value) || 1)}
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
                      <SelectItem value="whole">Whole</SelectItem>
                      <SelectItem value="portion">Portion</SelectItem>
                      <SelectItem value="piece">Piece</SelectItem>
                      <SelectItem value="slice">Slice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Mapping Preview */}
          {mappingPreview && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Inventory Impact Preview
                </CardTitle>
                <CardDescription>
                  Ingredients that will be deducted per sale
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Total Cost */}
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Total Cost per Sale</span>
                    <span className="text-lg font-bold">
                      {formatCurrency(
                        mappingPreview.totalCost.amount,
                        mappingPreview.totalCost.currency
                      )}
                    </span>
                  </div>

                  {/* Ingredients List */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Ingredients ({mappingPreview.ingredients.length})
                    </p>
                    <div className="border rounded-lg divide-y max-h-[150px] overflow-y-auto">
                      {mappingPreview.ingredients.map((ing, idx) => (
                        <div key={idx} className="p-2 flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">{ing.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {ing.location}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {ing.quantity} {ing.unit}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(ing.cost.amount, ing.cost.currency)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Warnings */}
                  {mappingPreview.warnings && mappingPreview.warnings.length > 0 && (
                    <div className="space-y-2">
                      {mappingPreview.warnings.map((warning, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                          <p className="text-sm text-yellow-900">{warning}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedRecipe || isLoading}
          >
            {isLoading ? "Saving..." : "Save Mapping"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
