"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  LayoutGrid,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  FileDown,
  FileUp,
  ChevronDown,
  Loader2,
  Archive,
} from "lucide-react"
import { RecipeCard } from "./recipe-card"
import { RecipeListView } from "./recipe-list-view"
import { Recipe, mockRecipes } from "../data/mock-recipes"
import Link from "next/link"

// Add new interfaces for filters
interface FilterOptions {
  category: string
  cuisine: string
  costRange: [number, number]
  status: string
  preparationTime: string
  difficulty: string
  hasMedia: boolean
}

const initialFilters: FilterOptions = {
  category: "all",
  cuisine: "all",
  costRange: [0, 100],
  status: "all",
  preparationTime: "all",
  difficulty: "all",
  hasMedia: false,
}

export function RecipeList() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FilterOptions>(initialFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Add filter options
  const filterOptions = {
    categories: [
      { value: "all", label: "All Categories" },
      { value: "appetizers", label: "Appetizers" },
      { value: "main-courses", label: "Main Courses" },
      { value: "soups", label: "Soups" },
      { value: "salads", label: "Salads" },
      { value: "desserts", label: "Desserts" },
    ],
    cuisineTypes: [
      { value: "all", label: "All Cuisines" },
      { value: "international", label: "International" },
      { value: "italian", label: "Italian" },
      { value: "chinese", label: "Chinese" },
      { value: "japanese", label: "Japanese" },
      { value: "thai", label: "Thai" },
      { value: "indian", label: "Indian" },
      { value: "mediterranean", label: "Mediterranean" },
      { value: "french", label: "French" },
    ],
    preparationTimes: [
      { value: "all", label: "All Times" },
      { value: "under-15-mins", label: "Under 15 mins" },
      { value: "15-30-mins", label: "15-30 mins" },
      { value: "30-60-mins", label: "30-60 mins" },
      { value: "over-60-mins", label: "Over 60 mins" },
    ],
    difficultyLevels: [
      { value: "all", label: "All Levels" },
      { value: "easy", label: "Easy" },
      { value: "medium", label: "Medium" },
      { value: "hard", label: "Hard" },
      { value: "expert", label: "Expert" },
    ],
    status: [
      { value: "all", label: "All Status" },
      { value: "active", label: "Active" },
      { value: "draft", label: "Draft" },
      { value: "archived", label: "Archived" },
    ],
    sortOptions: [
      { value: "name", label: "Name" },
      { value: "lastUpdated", label: "Last Updated" },
      { value: "costPerPortion", label: "Cost (Low to High)" },
      { value: "costPerPortionDesc", label: "Cost (High to Low)" },
      { value: "grossMargin", label: "Margin" },
    ],
  }

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const getActiveFilterCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (Array.isArray(value) && key === 'costRange') {
        return value[0] > 0 || value[1] < 100
      }
      return value !== 'all' && value !== false
    }).length
  }

  // Add filtered recipes logic
  const getFilteredRecipes = () => {
    return mockRecipes.filter(recipe => {
      // Search query filter
      if (searchQuery && !recipe.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Category filter (normalize the comparison)
      if (filters.category !== 'all' && recipe.category.toLowerCase().replace(/\s+/g, '-') !== filters.category) {
        return false
      }

      // Cuisine filter
      if (filters.cuisine !== 'all' && recipe.cuisine.toLowerCase() !== filters.cuisine) {
        return false
      }

      // Cost range filter
      if (recipe.costPerPortion < filters.costRange[0] || recipe.costPerPortion > filters.costRange[1]) {
        return false
      }

      // Status filter
      if (filters.status !== 'all' && recipe.status !== filters.status) {
        return false
      }

      // Preparation time filter
      if (filters.preparationTime !== 'all' && recipe.preparationTime.toLowerCase() !== filters.preparationTime) {
        return false
      }

      // Difficulty filter
      if (filters.difficulty !== 'all' && recipe.difficulty.toLowerCase() !== filters.difficulty) {
        return false
      }

      // Has media filter
      if (filters.hasMedia && !recipe.hasMedia) {
        return false
      }

      return true
    })
  }

  // Get filtered recipes
  const filteredRecipes = getFilteredRecipes()

  // Add a helper function to get display label for filter values
  const getFilterLabel = (key: string, value: any) => {
    if (key === 'costRange') return `Cost: $${value[0]}-$${value[1]}`
    
    const option = filterOptions[key as keyof typeof filterOptions]?.find(
      opt => opt.value === value
    )
    
    if (option) return `${key}: ${option.label}`
    if (key === 'hasMedia') return 'Has Media'
    
    return `${key}: ${value}`
  }

  // Add loading state to actions
  const handleArchive = async (recipeId: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Update the recipe status
      console.log("Archiving recipe:", recipeId)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClone = async (recipeId: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Clone the recipe
      console.log("Cloning recipe:", recipeId)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Recipe Library</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileUp className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link href="/operational-planning/recipe-management/recipes/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Recipe
            </Button>
          </Link>
        </div>
      </div>

      {/* Enhanced Filters section */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recipes..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select 
            value={filters.category}
            onValueChange={(value) => handleFilterChange('category', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Advanced Filters Popover */}
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="space-y-4">
                {/* Cuisine Type */}
                <div className="space-y-2">
                  <Label>Cuisine Type</Label>
                  <Select
                    value={filters.cuisine}
                    onValueChange={(value) => handleFilterChange('cuisine', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cuisine" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.cuisineTypes.map((cuisine) => (
                        <SelectItem key={cuisine.value} value={cuisine.value}>
                          {cuisine.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cost Range */}
                <div className="space-y-2">
                  <Label>Cost Range ($)</Label>
                  <Slider
                    value={filters.costRange}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => handleFilterChange('costRange', value)}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${filters.costRange[0]}</span>
                    <span>${filters.costRange[1]}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.status.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Preparation Time */}
                <div className="space-y-2">
                  <Label>Preparation Time</Label>
                  <Select
                    value={filters.preparationTime}
                    onValueChange={(value) => handleFilterChange('preparationTime', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.preparationTimes.map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty Level */}
                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <Select
                    value={filters.difficulty}
                    onValueChange={(value) => handleFilterChange('difficulty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.difficultyLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Has Media Toggle */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.hasMedia}
                    onCheckedChange={(checked) => handleFilterChange('hasMedia', checked)}
                  />
                  <Label>Has Media</Label>
                </div>

                {/* Filter Actions */}
                <div className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setFilters(initialFilters)}
                  >
                    Reset
                  </Button>
                  <Button onClick={() => setShowFilters(false)}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? (
              <List className="h-4 w-4" />
            ) : (
              <LayoutGrid className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (value === 'all' || value === false) return null
            if (key === 'costRange' && value[0] === 0 && value[1] === 100) return null

            return (
              <Badge
                key={key}
                variant="secondary"
                className="px-2 py-1"
                onClick={() => handleFilterChange(key as keyof FilterOptions, initialFilters[key as keyof FilterOptions])}
              >
                {getFilterLabel(key, value)}
              </Badge>
            )
          })}
        </div>
      )}

      {/* Recipe Grid/List */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
        {filteredRecipes.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No recipes found matching your filters
          </div>
        ) : viewMode === "grid" ? (
          filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))
        ) : (
          <RecipeListView recipes={filteredRecipes} />
        )}
      </div>

      {/* Add results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredRecipes.length} of {mockRecipes.length} recipes
      </div>
    </div>
  )
} 