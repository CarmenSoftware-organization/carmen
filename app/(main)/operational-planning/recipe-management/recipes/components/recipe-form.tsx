"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Recipe, mockIngredients, mockBaseRecipes } from '@/app/(main)/operational-planning/recipe-management/recipes/data/mock-recipes'
import { Plus, Trash2, UploadCloud, Clock, ArrowLeft, History, Share2, Printer, Download, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"

interface RecipeFormProps {
  initialData?: Recipe
  onSubmit: (data: Recipe) => void
}

export function RecipeForm({ initialData, onSubmit }: RecipeFormProps) {
  const [formData, setFormData] = useState<Recipe>(initialData || {
    id: '',
    name: '',
    description: '',
    category: '',
    cuisine: '',
    status: 'draft',
    image: '',
    yield: 1,
    yieldUnit: 'portions',
    prepTime: 0,
    cookTime: 0,
    totalTime: 0,
    difficulty: 'medium',
    costPerPortion: 0,
    sellingPrice: 0,
    grossMargin: 0,
    netPrice: 0,
    grossPrice: 0,
    totalCost: 0,
    carbonFootprint: 0,
    hasMedia: false,
    ingredients: [],
    steps: [],
    prepNotes: '',
    specialInstructions: '',
    additionalInfo: '',
    allergens: [],
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'current-user',
    updatedBy: 'current-user',
    // Cost calculation fields
    targetFoodCost: 33,
    laborCostPercentage: 30,
    overheadPercentage: 20,
    recommendedPrice: 0,
    foodCostPercentage: 0,
    grossProfit: 0
  })

  const [isDirty, setIsDirty] = useState(false)

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      // Handle nested updates for ingredients
      if (field.startsWith('ingredients.')) {
        const [_, index, prop] = field.split('.')
        const newIngredients = [...prev.ingredients]
        newIngredients[parseInt(index)] = {
          ...newIngredients[parseInt(index)],
          [prop]: value
        }
        return { ...prev, ingredients: newIngredients }
      }
      
      // Handle nested updates for steps
      if (field.startsWith('steps.')) {
        const [_, index, prop] = field.split('.')
        const newSteps = [...prev.steps]
        newSteps[parseInt(index)] = {
          ...newSteps[parseInt(index)],
          [prop]: value
        }
        return { ...prev, steps: newSteps }
      }
      
      // Handle top-level updates
      return { ...prev, [field]: value }
    })
    setIsDirty(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Calculate ingredient costs
    const ingredients = formData.ingredients.map(ingredient => ({
      ...ingredient,
      netCost: ingredient.quantity * ingredient.costPerUnit,
      wastageCost: (ingredient.quantity * ingredient.costPerUnit * ingredient.wastage) / 100,
      totalCost: ingredient.quantity * ingredient.costPerUnit * (1 + ingredient.wastage / 100)
    }))

    // Calculate total costs
    const totalIngredientCost = ingredients.reduce((sum, ing) => sum + ing.totalCost, 0)
    const laborCost = totalIngredientCost * 0.3 // 30% of ingredient cost
    const overheadCost = totalIngredientCost * 0.2 // 20% of ingredient cost
    const totalCost = totalIngredientCost + laborCost + overheadCost
    const costPerPortion = totalCost / formData.yield

    // Calculate pricing
    const grossMargin = formData.sellingPrice > 0 
      ? ((formData.sellingPrice - costPerPortion) / formData.sellingPrice) * 100 
      : 0
    
    // Update the recipe with calculated values
    const updatedRecipe = {
      ...formData,
      ingredients,
      totalCost,
      costPerPortion,
      grossMargin,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user'
    }

    // Call the onSubmit prop with the updated recipe
    onSubmit(updatedRecipe)
  }

  return (
    <form onSubmit={handleSubmit} className="px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/operational-planning/recipe-management/recipes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Recipes
            </Link>
          </Button>
          <Badge variant={formData.status === 'active' ? 'default' : 'secondary'}>
            {formData.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button type="submit" disabled={!isDirty}>
            Save Recipe
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-[400px,1fr] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Recipe Image */}
          <Card className="relative aspect-[4/3] overflow-hidden">
            {formData.image ? (
              <Image
                src={formData.image}
                alt={formData.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <UploadCloud className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </Card>

          {/* Basic Information */}
          <Card className="p-4">
            <h3 className="font-medium mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <Label>Category</Label>
                <Select 
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main Course">Main Course</SelectItem>
                    <SelectItem value="Appetizers">Appetizers</SelectItem>
                    <SelectItem value="Salads">Salads</SelectItem>
                    <SelectItem value="Desserts">Desserts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Cuisine</Label>
                <Select 
                  value={formData.cuisine}
                  onValueChange={(value) => handleInputChange('cuisine', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cuisine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Italian">Italian</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="Thai">Thai</SelectItem>
                    <SelectItem value="Asian">Asian</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select 
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Difficulty</Label>
                <Select 
                  value={formData.difficulty}
                  onValueChange={(value) => handleInputChange('difficulty', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-[2fr,1fr] gap-2">
                <div>
                  <Label>Yield</Label>
                  <Input
                    type="number"
                    value={formData.yield}
                    onChange={(e) => handleInputChange('yield', parseInt(e.target.value))}
                    min={1}
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Select 
                    value={formData.yieldUnit}
                    onValueChange={(value) => handleInputChange('yieldUnit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portions">Portions</SelectItem>
                      <SelectItem value="servings">Servings</SelectItem>
                      <SelectItem value="pieces">Pieces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Prep Time (mins)</Label>
                  <Input 
                    type="number"
                    value={formData.prepTime}
                    onChange={(e) => handleInputChange('prepTime', parseInt(e.target.value))}
                    min={0}
                  />
                </div>
                <div>
                  <Label>Cook Time (mins)</Label>
                  <Input 
                    type="number"
                    value={formData.cookTime}
                    onChange={(e) => handleInputChange('cookTime', parseInt(e.target.value))}
                    min={0}
                  />
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <div className="grid grid-cols-2">
                  <div>Created</div>
                  <div>{new Date(formData.createdAt).toLocaleString()}</div>
                </div>
                <div className="grid grid-cols-2 mt-1">
                  <div>Last Modified</div>
                  <div>{new Date(formData.updatedAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Carbon Footprint */}
          <Card className="p-4">
            <h3 className="font-medium mb-4">Carbon Footprint</h3>
            <div>
              <Label>CO₂eq per Portion</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={formData.carbonFootprint}
                  onChange={(e) => handleInputChange('carbonFootprint', parseFloat(e.target.value))}
                  min={0}
                  step={0.1}
                />
                <span className="text-muted-foreground">kg</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Carbon dioxide equivalent emissions per portion
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div>
            <Input 
              className="text-2xl font-semibold border-0 px-0 h-auto focus-visible:ring-0"
              placeholder="Recipe Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
            <div className="text-sm text-muted-foreground">
              Recipe Code: {formData.id || 'Auto-generated'}
            </div>
          </div>

          <Tabs defaultValue="ingredients" className="w-full">
            <TabsList>
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="preparation">Preparation</TabsTrigger>
              <TabsTrigger value="cost">Cost Summary</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            {/* Ingredients Tab */}
            <TabsContent value="ingredients" className="mt-6">
              <div className="grid grid-cols-[2fr,1fr] gap-6">
                {/* Left Side - Recipe Components */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Recipe Components</h3>
                      <p className="text-sm text-muted-foreground">All measurements are in recipe units</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formData.yield} {formData.yieldUnit}
                    </div>
                  </div>

                  {/* Components */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-4">Main Ingredients</h4>
                      {formData.ingredients.map((ingredient, index) => (
                        <Card key={ingredient.id} className="mb-3 p-4">
                          <div className="grid grid-cols-[1fr,2fr,1fr,auto] gap-4">
                            <div>
                              <Label>Type</Label>
                              <Select 
                                value={ingredient.type}
                                onValueChange={(value) => handleInputChange(`ingredients.${index}.type`, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="product">Product</SelectItem>
                                  <SelectItem value="recipe">Recipe</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Name</Label>
                              <Select 
                                value={ingredient.name}
                                onValueChange={(value) => handleInputChange(`ingredients.${index}.name`, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Search products..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <div className="flex items-center px-2 pb-1">
                                    <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <Input 
                                      placeholder="Search..."
                                      className="h-8"
                                    />
                                  </div>
                                  {ingredient.type === 'product' ? (
                                    mockIngredients.map(ing => (
                                      <SelectItem key={ing.id} value={ing.name}>
                                        {ing.name}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    mockBaseRecipes.map(recipe => (
                                      <SelectItem key={recipe.id} value={recipe.name}>
                                        {recipe.name}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Recipe ({formData.yieldUnit})</Label>
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  value={ingredient.quantity}
                                  onChange={(e) => handleInputChange(`ingredients.${index}.quantity`, parseFloat(e.target.value))}
                                />
                                <Input
                                  value={ingredient.unit}
                                  onChange={(e) => handleInputChange(`ingredients.${index}.unit`, e.target.value)}
                                  className="w-24"
                                />
                              </div>
                            </div>
                            <div className="flex items-end">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const newIngredients = formData.ingredients.filter((_, i) => i !== index)
                                  handleInputChange('ingredients', newIngredients)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-4 mt-4">
                            <div>
                              <Label>Inventory Qty</Label>
                              <Input
                                type="number"
                                value={ingredient.inventoryQty}
                                onChange={(e) => handleInputChange(`ingredients.${index}.inventoryQty`, parseFloat(e.target.value))}
                              />
                            </div>
                            <div>
                              <Label>Inventory Unit</Label>
                              <Input
                                value={ingredient.inventoryUnit}
                                onChange={(e) => handleInputChange(`ingredients.${index}.inventoryUnit`, e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Wastage %</Label>
                              <Input
                                type="number"
                                value={ingredient.wastage}
                                onChange={(e) => handleInputChange(`ingredients.${index}.wastage`, parseFloat(e.target.value))}
                              />
                            </div>
                            <div>
                              <Label>Cost/Unit</Label>
                              <Input
                                type="number"
                                value={ingredient.costPerUnit}
                                onChange={(e) => handleInputChange(`ingredients.${index}.costPerUnit`, parseFloat(e.target.value))}
                              />
                            </div>
                          </div>
                          <div className="flex justify-between mt-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Net Cost:</span>
                              <span className="ml-2">${(ingredient.quantity * ingredient.costPerUnit).toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Wastage Cost:</span>
                              <span className="ml-2">${(ingredient.quantity * ingredient.costPerUnit * ingredient.wastage / 100).toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total Cost:</span>
                              <span className="ml-2">${ingredient.totalCost.toFixed(2)}</span>
                            </div>
                          </div>
                        </Card>
                      ))}
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          const newIngredient = {
                            id: `ing-${Date.now()}`,
                            name: '',
                            type: 'product' as const,
                            quantity: 0,
                            unit: '',
                            wastage: 0,
                            inventoryQty: 0,
                            inventoryUnit: '',
                            costPerUnit: 0,
                            totalCost: 0
                          }
                          handleInputChange('ingredients', [...formData.ingredients, newIngredient])
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Ingredient
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right Side - Inventory Status */}
                <div className="space-y-6">
                  <Card className="p-4">
                    <h3 className="font-medium mb-4">Inventory Status</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>Missing Items</div>
                        <Badge variant="destructive">
                          {formData.ingredients.filter(i => i.inventoryQty === 0).length} Items
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {formData.ingredients
                          .filter(i => i.inventoryQty === 0)
                          .map(ingredient => (
                            <div key={ingredient.id} className="flex items-center justify-between">
                              <div>
                                <div>{ingredient.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {ingredient.quantity} {ingredient.unit} needed
                                </div>
                              </div>
                              <Badge variant="outline">Out of Stock</Badge>
                            </div>
                          ))}
                      </div>
                      <Button variant="outline" className="w-full">
                        View All Missing Items
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-medium mb-4">Ingredient Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-2">
                        <div className="text-muted-foreground">Total Ingredients</div>
                        <div>{formData.ingredients.length}</div>
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="text-muted-foreground">Components</div>
                        <div>1</div>
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="text-muted-foreground">In Stock</div>
                        <div>{formData.ingredients.filter(i => i.inventoryQty > 0).length} of {formData.ingredients.length}</div>
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="text-muted-foreground">Allergens</div>
                        <div>{formData.allergens.length}</div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-medium mb-4">Ordering Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-2">
                        <div className="text-muted-foreground">Last Order</div>
                        <div>2024-02-15</div>
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="text-muted-foreground">Next Order Due</div>
                        <div>2024-02-28</div>
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="text-muted-foreground">Preferred Supplier</div>
                        <div>Metro Foods</div>
                      </div>
                      <Button variant="outline" className="w-full mt-4">
                        Create Purchase Order
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Preparation Tab */}
            <TabsContent value="preparation" className="mt-6">
              <div className="space-y-6">
                {formData.steps.map((step, index) => (
                  <Card key={step.id} className="p-4">
                    <div className="grid grid-cols-[auto,1fr] gap-6">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {step.order}
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-grow">
                            <Label>Instructions</Label>
                            <Textarea
                              value={step.description}
                              onChange={(e) => handleInputChange(`steps.${index}.description`, e.target.value)}
                              className="h-[100px]"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newSteps = formData.steps.filter((_, i) => i !== index)
                              newSteps.forEach((s, i) => s.order = i + 1)
                              handleInputChange('steps', newSteps)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Duration</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={step.duration || 0}
                                onChange={(e) => handleInputChange(`steps.${index}.duration`, parseInt(e.target.value))}
                                min={0}
                              />
                              <span className="text-muted-foreground">mins</span>
                            </div>
                          </div>
                          <div>
                            <Label>Temperature</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={step.temperature || ''}
                                onChange={(e) => handleInputChange(`steps.${index}.temperature`, parseInt(e.target.value))}
                                min={0}
                              />
                              <span className="text-muted-foreground">°C</span>
                            </div>
                          </div>
                          <div>
                            <Label>Equipment</Label>
                            <Input
                              value={step.equipments?.join(', ') || ''}
                              onChange={(e) => handleInputChange(`steps.${index}.equipments`, e.target.value.split(',').map(eq => eq.trim()))}
                              placeholder="Separate with commas"
                            />
                          </div>
                        </div>
                        <div className="w-[300px] relative aspect-[4/3] rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center bg-muted/50">
                          {step.image ? (
                            <Image
                              src={step.image}
                              alt={`Step ${step.order}`}
                              fill
                              className="object-cover rounded-lg"
                            />
                          ) : (
                            <div className="text-center text-muted-foreground">
                              <UploadCloud className="h-6 w-6 mx-auto mb-1" />
                              <p className="text-xs">No image available</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    const newStep = {
                      id: `step-${Date.now()}`,
                      order: formData.steps.length + 1,
                      description: '',
                      duration: 0,
                      temperature: undefined,
                      equipments: [],
                      image: ''
                    }
                    handleInputChange('steps', [...formData.steps, newStep])
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>
            </TabsContent>

            {/* Cost Tab */}
            <TabsContent value="cost" className="mt-6">
              <div className="space-y-6">
                {/* Cost Analysis Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Cost Analysis</h2>
                  <Button variant="outline" size="sm">
                    <Clock className="h-4 w-4 mr-2" />
                    Recalculate
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Ingredient Costs */}
                  <Card className="p-4">
                    <h3 className="font-medium mb-4">Ingredient Costs</h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-[1fr,auto,auto] gap-4 text-sm font-medium text-muted-foreground">
                        <div>Item</div>
                        <div className="text-right">Cost</div>
                        <div className="text-right">%</div>
                      </div>
                      {formData.ingredients.map((ingredient) => (
                        <div key={ingredient.id} className="grid grid-cols-[1fr,auto,auto] gap-4 text-sm">
                          <div>{ingredient.name}</div>
                          <div className="text-right">${ingredient.totalCost.toFixed(2)}</div>
                          <div className="text-right">
                            {((ingredient.totalCost / formData.totalCost) * 100).toFixed(1)}%
                          </div>
                        </div>
                      ))}
                      <div className="border-t pt-2 grid grid-cols-[1fr,auto] gap-4 text-sm font-medium">
                        <div>Total Ingredient Cost</div>
                        <div className="text-right">${formData.totalCost.toFixed(2)}</div>
                      </div>
                    </div>
                  </Card>

                  {/* Cost Summary */}
                  <Card className="p-4">
                    <h3 className="font-medium mb-4">Cost Summary</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Labor Cost %</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={30}
                              onChange={(e) => handleInputChange('laborCostPercentage', parseInt(e.target.value))}
                              min={0}
                              max={100}
                            />
                            <span className="text-muted-foreground">%</span>
                          </div>
                        </div>
                        <div>
                          <Label>Overhead %</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={20}
                              onChange={(e) => handleInputChange('overheadPercentage', parseInt(e.target.value))}
                              min={0}
                              max={100}
                            />
                            <span className="text-muted-foreground">%</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Ingredient Cost:</span>
                          <span>${formData.totalCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Labor Cost (30%):</span>
                          <span>${(formData.totalCost * 0.3).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Overhead (20%):</span>
                          <span>${(formData.totalCost * 0.2).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium pt-2 border-t">
                          <span>Total Cost Per Portion:</span>
                          <span>${formData.costPerPortion.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Pricing Analysis */}
                <Card className="p-4">
                  <h3 className="font-medium mb-4">Pricing Analysis</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Target Food Cost %</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={33}
                            onChange={(e) => handleInputChange('targetFoodCost', parseInt(e.target.value))}
                            min={0}
                            max={100}
                          />
                          <span className="text-muted-foreground">%</span>
                        </div>
                      </div>
                      <div>
                        <Label>Selling Price</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">$</span>
                          <Input
                            type="number"
                            value={formData.sellingPrice}
                            onChange={(e) => handleInputChange('sellingPrice', parseFloat(e.target.value))}
                            min={0}
                            step={0.01}
                          />
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Recommended Price:</span>
                          <span>${(formData.costPerPortion / 0.33).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Current Price:</span>
                          <span>${formData.sellingPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Food Cost %:</span>
                          <span className="text-green-600">
                            {((formData.costPerPortion / formData.sellingPrice) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gross Profit:</span>
                          <span>${(formData.sellingPrice - formData.costPerPortion).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gross Margin:</span>
                          <span className="text-green-600">
                            {((1 - formData.costPerPortion / formData.sellingPrice) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center text-sm mt-8">
                      <div className="w-full flex items-end justify-center gap-32 mb-8">
                        {/* Cost Bar */}
                        <div className="flex flex-col items-center">
                          <div className="w-32 bg-muted/30 relative">
                            <div className="absolute -top-6 text-center w-full text-muted-foreground">
                              Cost Breakdown
                            </div>
                            <div className="h-[120px] flex flex-col">
                              <div className="flex-1 bg-red-100 border-b border-border relative">
                                <span className="absolute -right-36 top-1/2 -translate-y-1/2 text-xs text-muted-foreground whitespace-nowrap">
                                  Overhead (20%) - ${(formData.totalCost * 0.2).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex-1 bg-red-200 border-b border-border relative">
                                <span className="absolute -right-36 top-1/2 -translate-y-1/2 text-xs text-muted-foreground whitespace-nowrap">
                                  Labor (30%) - ${(formData.totalCost * 0.3).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex-1 bg-red-300 relative">
                                <span className="absolute -right-36 top-1/2 -translate-y-1/2 text-xs text-muted-foreground whitespace-nowrap">
                                  Ingredients - ${formData.totalCost.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-center">
                            <div className="text-xs text-muted-foreground">Total Cost</div>
                            <div className="font-medium">${formData.costPerPortion.toFixed(2)}</div>
                          </div>
                        </div>

                        {/* Price Bar */}
                        <div className="flex flex-col items-center">
                          <div className="w-32 bg-muted/30 relative">
                            <div className="absolute -top-6 text-center w-full text-muted-foreground">
                              Price Breakdown
                            </div>
                            <div className="h-[200px] flex flex-col">
                              <div 
                                className="bg-green-100 relative"
                                style={{ 
                                  height: `${((formData.sellingPrice - formData.costPerPortion) / formData.sellingPrice * 100)}%`
                                }}
                              >
                                <span className="absolute -right-36 top-1/2 -translate-y-1/2 text-xs text-muted-foreground whitespace-nowrap">
                                  Profit - ${(formData.sellingPrice - formData.costPerPortion).toFixed(2)}
                                </span>
                              </div>
                              <div 
                                className="bg-red-100 relative"
                                style={{ 
                                  height: `${(formData.costPerPortion / formData.sellingPrice * 100)}%`
                                }}
                              >
                                <span className="absolute -right-36 top-1/2 -translate-y-1/2 text-xs text-muted-foreground whitespace-nowrap">
                                  Cost - ${formData.costPerPortion.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-center">
                            <div className="text-xs text-muted-foreground">Selling Price</div>
                            <div className="font-medium">${formData.sellingPrice.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-16 w-full text-center border-t pt-4">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Food Cost %</div>
                          <div className={`font-medium ${((formData.costPerPortion / formData.sellingPrice) * 100) <= 33 ? 'text-green-600' : 'text-red-600'}`}>
                            {((formData.costPerPortion / formData.sellingPrice) * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Gross Margin</div>
                          <div className={`font-medium ${((1 - formData.costPerPortion / formData.sellingPrice) * 100) >= 67 ? 'text-green-600' : 'text-red-600'}`}>
                            {((1 - formData.costPerPortion / formData.sellingPrice) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Competitor Analysis */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Competitor Analysis</h3>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Competitor
                    </Button>
                  </div>
                  <div className="grid grid-cols-[1fr,auto,auto,auto] gap-4 text-sm font-medium text-muted-foreground">
                    <div>Competitor</div>
                    <div className="text-right">Price</div>
                    <div className="text-right">Portion</div>
                    <div className="text-right">Price/100g</div>
                  </div>
                  <div className="text-sm text-muted-foreground text-center py-8">
                    No competitor data available
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="mt-6">
              <div className="space-y-6">
                <div>
                  <Label>Preparation Notes</Label>
                  <Textarea
                    value={formData.prepNotes}
                    onChange={(e) => handleInputChange('prepNotes', e.target.value)}
                    className="h-[100px]"
                  />
                </div>
                <div>
                  <Label>Special Instructions</Label>
                  <Textarea
                    value={formData.specialInstructions}
                    onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                    className="h-[100px]"
                  />
                </div>
                <div>
                  <Label>Additional Information</Label>
                  <Textarea
                    value={formData.additionalInfo}
                    onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                    className="h-[100px]"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </form>
  )
} 