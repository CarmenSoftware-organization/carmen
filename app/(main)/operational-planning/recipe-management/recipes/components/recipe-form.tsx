"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Save, Plus, Edit2, Trash2, X, Clock, Thermometer, Loader2, UploadCloud, Play, Video, FileText, Download, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { Recipe, Ingredient } from "../data/mock-recipes"
import Image from "next/image"

// Utility functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

interface RecipeFormProps {
  recipe?: Recipe
}

interface IngredientFormValues {
  name: string
  quantity: number
  unit: string
  category: string
  cost: number
}

interface Instruction {
  id: string
  stepNumber: number
  description: string
  time?: number
  temperature?: number
  notes?: string
  image?: string
  equipments?: string[]
  criticalControl?: boolean
}

const recipeSchema = z.object({
  name: z.string().min(1, "Recipe name is required"),
  category: z.string().min(1, "Category is required"),
  cuisine: z.string().min(1, "Cuisine type is required"),
  portionSize: z.string().min(1, "Portion size is required"),
  preparationTime: z.string().min(1, "Preparation time is required"),
  difficulty: z.string().min(1, "Difficulty level is required"),
  status: z.enum(["active", "draft", "archived"] as const),
  costPerPortion: z.number().min(0, "Cost per portion must be positive").default(0),
  sellingPrice: z.number().min(0, "Selling price must be positive").default(0),
  grossMargin: z.number().min(0, "Gross margin must be positive").default(0),
  ingredients: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "Ingredient name is required"),
    quantity: z.number().min(0, "Quantity must be positive"),
    unit: z.string().min(1, "Unit is required"),
    cost: z.number().min(0, "Cost must be positive"),
    category: z.string().min(1, "Category is required"),
  })),
  instructions: z.array(z.object({
    id: z.string(),
    stepNumber: z.number().min(1, "Step number is required"),
    description: z.string().min(1, "Description is required"),
    time: z.number().optional(),
    temperature: z.number().optional(),
    notes: z.string().optional(),
    image: z.string().optional(),
    equipments: z.array(z.string()).optional(),
    criticalControl: z.boolean().optional(),
  })),
  thumbnail: z.string().optional(),
  hasMedia: z.boolean().default(false),
  additionalImages: z.array(z.object({
    id: z.string(),
    url: z.string(),
    caption: z.string().optional(),
  })).default([]),
  video: z.object({
    url: z.string(),
    thumbnail: z.string().optional(),
    duration: z.number().optional(),
  }).nullable().optional(),
  documents: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number(),
    uploadedAt: z.string(),
  })).default([]),
})

type RecipeFormValues = z.infer<typeof recipeSchema>

export function RecipeForm({ recipe }: RecipeFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [isSaving, setIsSaving] = useState(false)
  const [editingIngredientIndex, setEditingIngredientIndex] = useState<number | null>(null)
  const [ingredientForm, setIngredientForm] = useState<IngredientFormValues>({
    name: '',
    quantity: 0,
    unit: '',
    category: '',
    cost: 0,
  })
  const [editingInstructionIndex, setEditingInstructionIndex] = useState<number | null>(null)
  const [instructionForm, setInstructionForm] = useState<Omit<Instruction, 'id'>>({
    stepNumber: 1,
    description: '',
    time: undefined,
    temperature: undefined,
    notes: '',
    equipments: [],
    criticalControl: false,
  })
  const [laborCostPercentage, setLaborCostPercentage] = useState(30)
  const [overheadPercentage, setOverheadPercentage] = useState(20)
  const [targetFoodCostPercentage, setTargetFoodCostPercentage] = useState(33)
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: recipe?.name || "",
      category: recipe?.category?.toLowerCase() || "",
      cuisine: recipe?.cuisine?.toLowerCase() || "",
      portionSize: recipe?.portionSize || "",
      preparationTime: recipe?.preparationTime?.toLowerCase() || "",
      difficulty: recipe?.difficulty || "",
      status: (recipe?.status as RecipeFormValues['status']) || "draft",
      costPerPortion: recipe?.costPerPortion || 0,
      sellingPrice: recipe?.sellingPrice || 0,
      grossMargin: recipe?.grossMargin || 0,
      ingredients: recipe?.ingredients || [],
      instructions: recipe?.instructions || [],
      thumbnail: recipe?.thumbnail || "",
      hasMedia: recipe?.hasMedia || false,
      additionalImages: recipe?.additionalImages || [],
      video: recipe?.video || null,
      documents: recipe?.documents || []
    },
  })

  async function onSubmit(data: RecipeFormValues) {
    setIsSaving(true)
    try {
      // Here you would typically make an API call to save the recipe
      console.log("Saving recipe:", data)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Navigate back to recipe list
      router.push("/operational-planning/recipe-management/recipes")
      router.refresh()
    } catch (error) {
      console.error("Error saving recipe:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditIngredient = (index: number) => {
    const ingredient = form.getValues('ingredients')[index]
    setIngredientForm(ingredient)
    setEditingIngredientIndex(index)
    const dialog = document.getElementById('add-ingredient-dialog') as HTMLDialogElement
    if (dialog) dialog.showModal()
  }

  const handleRemoveIngredient = (index: number) => {
    const ingredients = form.getValues('ingredients')
    form.setValue('ingredients', ingredients.filter((_, i) => i !== index))
  }

  const handleSaveIngredient = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    const newIngredient = {
      ...ingredientForm,
      id: editingIngredientIndex === null ? crypto.randomUUID() : form.getValues('ingredients')[editingIngredientIndex].id,
    }

    const ingredients = form.getValues('ingredients') || []
    
    if (editingIngredientIndex === null) {
      form.setValue('ingredients', [...ingredients, newIngredient])
    } else {
      const updatedIngredients = [...ingredients]
      updatedIngredients[editingIngredientIndex] = newIngredient
      form.setValue('ingredients', updatedIngredients)
    }

    setIngredientForm({
      name: '',
      quantity: 0,
      unit: '',
      category: '',
      cost: 0,
    })
    setEditingIngredientIndex(null)

    const dialog = document.getElementById('add-ingredient-dialog') as HTMLDialogElement
    if (dialog) dialog.close()
  }

  const calculateTotalCost = () => {
    const ingredients = form.watch('ingredients') || []
    return ingredients.reduce((total, ingredient) => total + ingredient.cost, 0)
  }

  const calculateCostPerPortion = () => {
    const totalCost = calculateTotalCost()
    const laborCost = totalCost * (laborCostPercentage / 100)
    const overheadCost = totalCost * (overheadPercentage / 100)
    return totalCost + laborCost + overheadCost
  }

  const updatePricing = () => {
    const costPerPortion = calculateCostPerPortion()
    const currentSellingPrice = form.watch('sellingPrice') || costPerPortion * 3
    const grossMargin = ((currentSellingPrice - costPerPortion) / currentSellingPrice) * 100

    form.setValue('costPerPortion', costPerPortion)
    form.setValue('grossMargin', grossMargin)
  }

  // Update pricing whenever costs change
  useEffect(() => {
    updatePricing()
  }, [laborCostPercentage, overheadPercentage, form.watch('ingredients')])

  const handleUpdateSellingPrice = (value: number) => {
    form.setValue('sellingPrice', value)
    updatePricing()
  }

  const availableEquipment = [
    'Oven',
    'Stove',
    'Mixer',
    'Food Processor',
    'Blender',
    'Grill',
    'Deep Fryer',
    'Steamer',
  ]

  const toggleEquipment = (equipment: string) => {
    setInstructionForm(prev => ({
      ...prev,
      equipments: prev.equipments?.includes(equipment)
        ? prev.equipments.filter(e => e !== equipment)
        : [...(prev.equipments || []), equipment]
    }))
  }

  const handleEditInstruction = (index: number) => {
    const instruction = form.getValues('instructions')[index]
    setInstructionForm(instruction)
    setEditingInstructionIndex(index)
    const dialog = document.getElementById('add-instruction-dialog') as HTMLDialogElement
    if (dialog) dialog.showModal()
  }

  const handleRemoveInstruction = (index: number) => {
    const instructions = form.getValues('instructions')
    form.setValue('instructions', instructions.filter((_, i) => i !== index))
  }

  const handleSaveInstruction = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const newInstruction = {
      ...instructionForm,
      id: editingInstructionIndex === null ? crypto.randomUUID() : form.getValues('instructions')[editingInstructionIndex].id,
    }

    const instructions = form.getValues('instructions') || []
    
    if (editingInstructionIndex === null) {
      form.setValue('instructions', [...instructions, newInstruction])
    } else {
      const updatedInstructions = [...instructions]
      updatedInstructions[editingInstructionIndex] = newInstruction
      form.setValue('instructions', updatedInstructions)
    }

    setInstructionForm({
      stepNumber: instructions.length + 2,
      description: '',
      time: undefined,
      temperature: undefined,
      notes: '',
      equipments: [],
      criticalControl: false,
    })
    setEditingInstructionIndex(null)

    const dialog = document.getElementById('add-instruction-dialog') as HTMLDialogElement
    if (dialog) dialog.close()
  }

  const openIngredientDialog = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const dialog = document.getElementById('add-ingredient-dialog') as HTMLDialogElement
    if (dialog) dialog.showModal()
  }

  const openInstructionDialog = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const dialog = document.getElementById('add-instruction-dialog') as HTMLDialogElement
    if (dialog) dialog.showModal()
  }

  // Media handling functions
  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // Here you would typically upload the file to your storage service
      // For now, we'll create a mock URL
      const mockUrl = URL.createObjectURL(file)
      form.setValue('thumbnail', mockUrl)
      form.setValue('hasMedia', true)
    } catch (error) {
      console.error('Error uploading main image:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    setIsUploading(true)
    try {
      // Process each file
      const newImages = Array.from(files).map(file => ({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        caption: ''
      }))

      const currentImages = form.getValues('additionalImages') || []
      form.setValue('additionalImages', [...currentImages, ...newImages])
      form.setValue('hasMedia', true)
    } catch (error) {
      console.error('Error uploading additional images:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // Here you would typically upload the video to your storage service
      const mockUrl = URL.createObjectURL(file)
      form.setValue('video', {
        url: mockUrl,
        thumbnail: '', // You would generate this
        duration: 0 // You would calculate this
      })
      form.setValue('hasMedia', true)
    } catch (error) {
      console.error('Error uploading video:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    setIsUploading(true)
    try {
      // Process each file
      const newDocuments = Array.from(files).map(file => ({
        id: crypto.randomUUID(),
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString()
      }))

      const currentDocuments = form.getValues('documents') || []
      form.setValue('documents', [...currentDocuments, ...newDocuments])
      form.setValue('hasMedia', true)
    } catch (error) {
      console.error('Error uploading documents:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdateImageCaption = (imageId: string, caption: string) => {
    const images = form.getValues('additionalImages')
    const updatedImages = images.map(img => 
      img.id === imageId ? { ...img, caption } : img
    )
    form.setValue('additionalImages', updatedImages)
  }

  const handleRemoveImage = (imageId: string) => {
    const images = form.getValues('additionalImages')
    const updatedImages = images.filter(img => img.id !== imageId)
    form.setValue('additionalImages', updatedImages)
    if (updatedImages.length === 0 && !form.getValues('video') && !form.getValues('documents')) {
      form.setValue('hasMedia', false)
    }
  }

  const handleRemoveMainImage = () => {
    form.setValue('thumbnail', '')
    if (!form.getValues('additionalImages').length && !form.getValues('video') && !form.getValues('documents')) {
      form.setValue('hasMedia', false)
    }
  }

  const handleRemoveVideo = () => {
    form.setValue('video', null)
    if (!form.getValues('thumbnail') && !form.getValues('additionalImages').length && !form.getValues('documents')) {
      form.setValue('hasMedia', false)
    }
  }

  const handleRemoveDocument = (documentId: string) => {
    const documents = form.getValues('documents')
    const updatedDocuments = documents.filter(doc => doc.id !== documentId)
    form.setValue('documents', updatedDocuments)
    if (!form.getValues('thumbnail') && !form.getValues('additionalImages').length && !form.getValues('video')) {
      form.setValue('hasMedia', false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Library
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {recipe ? "Edit Recipe" : "Create New Recipe"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {recipe 
                ? `Last updated: ${recipe.lastUpdated}` 
                : "Create a new recipe from scratch"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={form.watch("status") === "active" ? "default" : "secondary"}>
            {form.watch("status")}
          </Badge>
          <Button type="submit" disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
          <TabsTrigger value="costing">Costing</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Recipe Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter recipe name"
                    {...form.register("name")}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select defaultValue={form.watch("category")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appetizers">Appetizers</SelectItem>
                      <SelectItem value="main-courses">Main Courses</SelectItem>
                      <SelectItem value="desserts">Desserts</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.category.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cuisine">Cuisine Type</Label>
                  <Select defaultValue={form.watch("cuisine")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cuisine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="international">International</SelectItem>
                      <SelectItem value="italian">Italian</SelectItem>
                      <SelectItem value="chinese">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.cuisine && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.cuisine.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portion-size">Portion Size</Label>
                  <Input
                    id="portion-size"
                    placeholder="e.g., 250g"
                    {...form.register("portionSize")}
                  />
                  {form.formState.errors.portionSize && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.portionSize.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prep-time">Preparation Time</Label>
                  <Select defaultValue={form.watch("preparationTime")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-15-mins">Under 15 mins</SelectItem>
                      <SelectItem value="15-30-mins">15-30 mins</SelectItem>
                      <SelectItem value="30-60-mins">30-60 mins</SelectItem>
                      <SelectItem value="over-60-mins">Over 60 mins</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.preparationTime && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.preparationTime.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select defaultValue={form.watch("difficulty")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.difficulty && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.difficulty.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ingredients Tab */}
        <TabsContent value="ingredients">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Ingredients</h3>
                  <Button
                    onClick={openIngredientDialog}
                    type="button"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Ingredient
                  </Button>
                </div>

                {/* Ingredients Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {form.watch('ingredients')?.map((ingredient, index) => (
                        <TableRow key={ingredient.id}>
                          <TableCell>{ingredient.name}</TableCell>
                          <TableCell>{ingredient.category}</TableCell>
                          <TableCell>{ingredient.quantity}</TableCell>
                          <TableCell>{ingredient.unit}</TableCell>
                          <TableCell>${ingredient.cost.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditIngredient(index)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveIngredient(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!form.watch('ingredients') || form.watch('ingredients').length === 0) && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No ingredients added yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Summary */}
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Total Ingredients</p>
                    <p className="text-2xl font-bold">{form.watch('ingredients')?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Cost</p>
                    <p className="text-2xl font-bold">
                      ${calculateTotalCost().toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add/Edit Ingredient Dialog */}
          <dialog
            id="add-ingredient-dialog"
            className="modal p-6 rounded-lg shadow-lg bg-background border"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="space-y-4 min-w-[400px]">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  {editingIngredientIndex === null ? 'Add Ingredient' : 'Edit Ingredient'}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const dialog = document.getElementById('add-ingredient-dialog') as HTMLDialogElement
                    if (dialog) dialog.close()
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ingredient-name">Name</Label>
                  <Input
                    id="ingredient-name"
                    type="text"
                    value={ingredientForm.name}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, name: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ingredient-category">Category</Label>
                  <Select
                    value={ingredientForm.category}
                    onValueChange={(value) => setIngredientForm({ ...ingredientForm, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="produce">Produce</SelectItem>
                      <SelectItem value="meat">Meat</SelectItem>
                      <SelectItem value="dairy">Dairy</SelectItem>
                      <SelectItem value="pantry">Pantry</SelectItem>
                      <SelectItem value="spices">Spices</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ingredient-quantity">Quantity</Label>
                    <Input
                      id="ingredient-quantity"
                      type="number"
                      min="0"
                      step="0.01"
                      value={ingredientForm.quantity}
                      onChange={(e) => setIngredientForm({ ...ingredientForm, quantity: parseFloat(e.target.value) })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ingredient-unit">Unit</Label>
                    <Select
                      value={ingredientForm.unit}
                      onValueChange={(value) => setIngredientForm({ ...ingredientForm, unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="g">Grams (g)</SelectItem>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="ml">Milliliters (ml)</SelectItem>
                        <SelectItem value="l">Liters (l)</SelectItem>
                        <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ingredient-cost">Cost</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5">$</span>
                    <Input
                      id="ingredient-cost"
                      type="number"
                      min="0"
                      step="0.01"
                      className="pl-7"
                      value={ingredientForm.cost}
                      onChange={(e) => setIngredientForm({ ...ingredientForm, cost: parseFloat(e.target.value) })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      const dialog = document.getElementById('add-ingredient-dialog') as HTMLDialogElement
                      if (dialog) dialog.close()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleSaveIngredient()
                    }}
                  >
                    {editingIngredientIndex === null ? 'Add' : 'Save'} Ingredient
                  </Button>
                </div>
              </div>
            </div>
          </dialog>
        </TabsContent>

        {/* Instructions Tab */}
        <TabsContent value="instructions">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Instructions</h3>
                  <Button
                    onClick={openInstructionDialog}
                    type="button"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                </div>

                {/* Instructions List */}
                <div className="space-y-4">
                  {form.watch('instructions')?.map((instruction, index) => (
                    <Card key={instruction.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {/* Step Number */}
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-lg font-semibold">{instruction.stepNumber}</span>
                          </div>

                          {/* Step Content */}
                          <div className="flex-grow space-y-2">
                            <p>{instruction.description}</p>
                            
                            {/* Additional Info */}
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              {instruction.time && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{instruction.time} mins</span>
                                </div>
                              )}
                              {instruction.temperature && (
                                <div className="flex items-center gap-1">
                                  <Thermometer className="h-4 w-4" />
                                  <span>{instruction.temperature}°C</span>
                                </div>
                              )}
                              {instruction.criticalControl && (
                                <Badge variant="destructive">Critical Control Point</Badge>
                              )}
                            </div>

                            {/* Equipment */}
                            {instruction.equipments && instruction.equipments.length > 0 && (
                              <div className="flex gap-2">
                                {instruction.equipments.map((equipment) => (
                                  <Badge key={equipment} variant="outline">
                                    {equipment}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Notes */}
                            {instruction.notes && (
                              <div className="bg-muted p-2 rounded-md text-sm">
                                <p className="font-medium">Notes:</p>
                                <p>{instruction.notes}</p>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditInstruction(index)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveInstruction(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {(!form.watch('instructions') || form.watch('instructions').length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      No instructions added yet
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add/Edit Instruction Dialog */}
          <dialog
            id="add-instruction-dialog"
            className="modal p-6 rounded-lg shadow-lg bg-background border"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="space-y-4 min-w-[500px]">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  {editingInstructionIndex === null ? 'Add Step' : 'Edit Step'}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault()
                    const dialog = document.getElementById('add-instruction-dialog') as HTMLDialogElement
                    if (dialog) dialog.close()
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Step Number</Label>
                  <Input
                    type="number"
                    min="1"
                    value={instructionForm.stepNumber}
                    onChange={(e) => setInstructionForm({
                      ...instructionForm,
                      stepNumber: parseInt(e.target.value)
                    })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={instructionForm.description}
                    onChange={(e) => setInstructionForm({
                      ...instructionForm,
                      description: e.target.value
                    })}
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        e.preventDefault()
                      }
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Time (minutes)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={instructionForm.time}
                      onChange={(e) => setInstructionForm({
                        ...instructionForm,
                        time: parseInt(e.target.value)
                      })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Temperature (°C)</Label>
                    <Input
                      type="number"
                      value={instructionForm.temperature}
                      onChange={(e) => setInstructionForm({
                        ...instructionForm,
                        temperature: parseInt(e.target.value)
                      })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Equipment</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableEquipment.map((equipment) => (
                      <Badge
                        key={equipment}
                        variant={instructionForm.equipments?.includes(equipment) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleEquipment(equipment)}
                      >
                        {equipment}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={instructionForm.notes}
                    onChange={(e) => setInstructionForm({
                      ...instructionForm,
                      notes: e.target.value
                    })}
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        e.preventDefault()
                      }
                    }}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={instructionForm.criticalControl}
                    onCheckedChange={(checked) => setInstructionForm({
                      ...instructionForm,
                      criticalControl: checked as boolean
                    })}
                  />
                  <Label>Critical Control Point</Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault()
                      const dialog = document.getElementById('add-instruction-dialog') as HTMLDialogElement
                      if (dialog) dialog.close()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveInstruction}
                  >
                    {editingInstructionIndex === null ? 'Add' : 'Save'} Step
                  </Button>
                </div>
              </div>
            </div>
          </dialog>
        </TabsContent>

        {/* Costing Tab */}
        <TabsContent value="costing">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Cost Analysis</h3>
                  <Button variant="outline" onClick={updatePricing}>
                    <Loader2 className="h-4 w-4 mr-2" />
                    Recalculate
                  </Button>
                </div>

                {/* Cost Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Ingredient Costs */}
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-4">Ingredient Costs</h4>
                      <div className="space-y-4">
                        <div className="border rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead className="text-right">Cost</TableHead>
                                <TableHead className="text-right">%</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {form.watch('ingredients')?.map((ingredient) => (
                                <TableRow key={ingredient.id}>
                                  <TableCell>{ingredient.name}</TableCell>
                                  <TableCell className="text-right">
                                    ${ingredient.cost.toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {((ingredient.cost / calculateTotalCost()) * 100).toFixed(1)}%
                                  </TableCell>
                                </TableRow>
                              ))}
                              {(!form.watch('ingredients') || form.watch('ingredients').length === 0) && (
                                <TableRow>
                                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                                    No ingredients added
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                            <TableFooter>
                              <TableRow>
                                <TableCell>Total Ingredient Cost</TableCell>
                                <TableCell className="text-right" colSpan={2}>
                                  ${calculateTotalCost().toFixed(2)}
                                </TableCell>
                              </TableRow>
                            </TableFooter>
                          </Table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cost Summary */}
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-4">Cost Summary</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Labor Cost %</Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={laborCostPercentage}
                                onChange={(e) => setLaborCostPercentage(parseFloat(e.target.value))}
                              />
                              <span>%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Overhead %</Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={overheadPercentage}
                                onChange={(e) => setOverheadPercentage(parseFloat(e.target.value))}
                              />
                              <span>%</span>
                            </div>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4 space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Ingredient Cost:</span>
                            <span className="font-medium">${calculateTotalCost().toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Labor Cost ({laborCostPercentage}%):</span>
                            <span className="font-medium">
                              ${(calculateTotalCost() * (laborCostPercentage / 100)).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Overhead ({overheadPercentage}%):</span>
                            <span className="font-medium">
                              ${(calculateTotalCost() * (overheadPercentage / 100)).toFixed(2)}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-medium">
                            <span>Total Cost Per Portion:</span>
                            <span>${calculateCostPerPortion().toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Pricing Analysis */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-4">Pricing Analysis</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Target Food Cost %</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={targetFoodCostPercentage}
                              onChange={(e) => setTargetFoodCostPercentage(parseFloat(e.target.value))}
                            />
                            <span>%</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Selling Price</Label>
                          <div className="flex items-center space-x-2">
                            <span>$</span>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={form.watch("sellingPrice") || calculateCostPerPortion() * 3}
                              onChange={(e) => handleUpdateSellingPrice(parseFloat(e.target.value))}
                            />
                          </div>
                        </div>

                        <div className="border rounded-lg p-4 space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Recommended Price:</span>
                            <span className="font-medium">
                              ${(calculateCostPerPortion() * 3).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Current Price:</span>
                            <span className="font-medium">
                              ${(form.watch("sellingPrice") || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Food Cost %:</span>
                            <span className={cn(
                              "font-medium",
                              (calculateCostPerPortion() / (form.watch("sellingPrice") || 1)) * 100 > targetFoodCostPercentage
                                ? "text-destructive"
                                : "text-green-600"
                            )}>
                              {((calculateCostPerPortion() / (form.watch("sellingPrice") || 1)) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Gross Profit:</span>
                            <span className="font-medium">
                              ${((form.watch("sellingPrice") || 0) - calculateCostPerPortion()).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Gross Margin:</span>
                            <span className={cn(
                              "font-medium",
                              form.watch("grossMargin") < 60
                                ? "text-destructive"
                                : "text-green-600"
                            )}>
                              {form.watch("grossMargin").toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Profitability Chart */}
                      <div className="border rounded-lg p-4">
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                          Profitability Chart Coming Soon
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Competitor Analysis */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Competitor Analysis</h4>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Competitor
                      </Button>
                    </div>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Competitor</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Portion</TableHead>
                            <TableHead className="text-right">Price/100g</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                              No competitor data available
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-8">
                {/* Main Recipe Image */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Main Recipe Image</h3>
                  <div className="flex items-center gap-6">
                    {form.watch('thumbnail') ? (
                      <div className="relative w-48 h-48 rounded-lg overflow-hidden">
                        <Image
                          src={form.watch('thumbnail') || '/images/recipes/placeholder-recipe.jpg'}
                          alt={form.watch('name') || 'Recipe thumbnail'}
                          fill
                          className="object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={handleRemoveMainImage}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-48 h-48 rounded-lg border-2 border-dashed">
                        <div className="text-center">
                          <UploadCloud className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mt-2">Upload main image</p>
                        </div>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload a high-quality image that best represents your recipe. This will be used as the main thumbnail.
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleMainImageUpload}
                        disabled={isUploading}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Images */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Additional Images</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {form.watch('additionalImages')?.map((image) => (
                      <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden">
                        <Image
                          src={image.url}
                          alt={image.caption || "Recipe image"}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-2 left-2 right-2">
                            <Input
                              value={image.caption || ""}
                              placeholder="Add caption"
                              className="bg-white/90 text-sm"
                              onChange={(e) => handleUpdateImageCaption(image.id, e.target.value)}
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => handleRemoveImage(image.id)}
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <label className="flex items-center justify-center aspect-square rounded-lg border-2 border-dashed cursor-pointer">
                      <div className="text-center">
                        <UploadCloud className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-2">Add image</p>
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleAdditionalImageUpload}
                          disabled={isUploading}
                        />
                      </div>
                    </label>
                  </div>
                </div>

                {/* Video Section */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Recipe Video</h3>
                  {form.watch('video') ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                      <video
                        src={form.watch('video')?.url}
                        controls
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                        <Button variant="destructive" onClick={handleRemoveVideo} type="button">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center aspect-video rounded-lg border-2 border-dashed">
                      <div className="text-center">
                        <Video className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-2">Upload recipe video</p>
                        <Input
                          type="file"
                          accept="video/*"
                          className="mt-4 max-w-xs mx-auto"
                          onChange={handleVideoUpload}
                          disabled={isUploading}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Documents Section */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Recipe Documents</h3>
                  <div className="space-y-4">
                    {form.watch('documents')?.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-4">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.type} • {formatFileSize(doc.size)} • Uploaded {formatDate(doc.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={doc.url} download>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </a>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveDocument(doc.id)}
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-center h-32 rounded-lg border-2 border-dashed">
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-2">Upload recipe documents</p>
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="mt-4 max-w-xs mx-auto"
                          onChange={handleDocumentUpload}
                          disabled={isUploading}
                          multiple
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  )
} 