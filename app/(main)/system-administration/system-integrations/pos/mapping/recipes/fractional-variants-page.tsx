"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { 
  ChevronLeft, 
  Plus, 
  AlertTriangle, 
  CheckCircle2,
  Package,
  ShoppingCart,
  TrendingUp,
  BarChart3,
  Pizza,
  Cake
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Import data and helpers
import { recipeMappings } from "./data"
import { mockRecipes } from "@/app/(main)/operational-planning/recipe-management/recipes/data/mock-recipes"
import { 
  groupMappingsByBaseRecipe, 
  findUnmappedVariants, 
  getMappingStatistics,
  FractionalMappingGroup 
} from "./fractional-mapping-helper"

export default function FractionalVariantsPage() {
  const [selectedType, setSelectedType] = useState<string>("all")
  
  // Generate statistics and groupings
  const statistics = useMemo(() => 
    getMappingStatistics(mockRecipes, recipeMappings), 
    [mockRecipes, recipeMappings]
  )
  
  const fractionalGroups = useMemo(() => 
    groupMappingsByBaseRecipe(recipeMappings, mockRecipes), 
    [recipeMappings, mockRecipes]
  )
  
  const unmappedVariants = useMemo(() => 
    findUnmappedVariants(mockRecipes, recipeMappings), 
    [mockRecipes, recipeMappings]
  )
  
  // Filter groups by type
  const filteredGroups = useMemo(() => {
    if (selectedType === "all") return fractionalGroups
    return fractionalGroups.filter(group => group.fractionalSalesType === selectedType)
  }, [fractionalGroups, selectedType])
  
  const typeIcon = (type: string) => {
    switch (type) {
      case 'pizza-slice': return <Pizza className="h-4 w-4" />
      case 'cake-slice': return <Cake className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }
  
  const typeColor = (type: string) => {
    switch (type) {
      case 'pizza-slice': return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'cake-slice': return 'bg-pink-50 text-pink-700 border-pink-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
            <Link href="/system-administration/system-integrations/pos/mapping/recipes">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Fractional Sales Management</h1>
        </div>
        
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Mapping
        </Button>
      </div>
      
      <p className="text-muted-foreground">
        Manage pizza slices, cake slices, and other fractional sales items with intelligent recipe variant mapping
      </p>
      
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fractional Recipes</p>
              <p className="text-2xl font-bold">{statistics.totalFractionalRecipes}</p>
            </div>
            <Package className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Mapped Variants</p>
              <p className="text-2xl font-bold text-green-600">{statistics.totalMappedVariants}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Unmapped Variants</p>
              <p className="text-2xl font-bold text-amber-600">{statistics.totalUnmappedVariants}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Completeness</p>
                <p className="text-sm font-bold">{Math.round(statistics.mappingCompleteness)}%</p>
              </div>
              <Progress value={statistics.mappingCompleteness} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Unmapped Variants Alert */}
      {statistics.totalUnmappedVariants > 0 && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            <span className="font-medium">{statistics.totalUnmappedVariants} recipe variants</span> need POS mapping to enable fractional sales tracking.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Content Tabs */}
      <Tabs defaultValue="grouped" className="space-y-6">
        <TabsList>
          <TabsTrigger value="grouped">Grouped by Recipe</TabsTrigger>
          <TabsTrigger value="unmapped">Unmapped Variants</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grouped" className="space-y-6">
          {/* Filter by Type */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={selectedType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("all")}
            >
              All Types ({fractionalGroups.length})
            </Button>
            {statistics.fractionalSalesTypes.map(({ type, count }) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
                className="flex items-center gap-2"
              >
                {typeIcon(type)}
                {type} ({count})
              </Button>
            ))}
          </div>
          
          {/* Fractional Recipe Groups */}
          <div className="space-y-4">
            {filteredGroups.map((group) => (
              <FractionalGroupCard key={group.baseRecipeId} group={group} />
            ))}
            
            {filteredGroups.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No fractional recipes found for the selected type.
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="unmapped" className="space-y-6">
          <div className="space-y-4">
            {unmappedVariants.map(({ recipe, unmappedVariants: variants }) => (
              <Card key={recipe.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {typeIcon(recipe.fractionalSalesType || 'custom')}
                      <span>{recipe.name}</span>
                      <Badge variant="outline" className={typeColor(recipe.fractionalSalesType || 'custom')}>
                        {recipe.fractionalSalesType}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      {variants.length} unmapped
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="p-3 border rounded-lg space-y-2 bg-amber-50/50 border-amber-200"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{variant.name}</h4>
                          <Badge variant="outline">
                            ${variant.sellingPrice}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Conversion: {(variant.conversionRate * 100).toFixed(1)}% of recipe</p>
                          <p>Cost: ${variant.costPerUnit}</p>
                          <p>Unit: {variant.unit}</p>
                        </div>
                        <Button size="sm" className="w-full">
                          Create POS Mapping
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {unmappedVariants.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-green-600 mb-2">All Variants Mapped!</h3>
                <p className="text-muted-foreground">
                  All recipe variants have been successfully mapped to POS items.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sales Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Fractional Sales Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statistics.fractionalSalesTypes.map(({ type, count }) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {typeIcon(type)}
                        <span className="capitalize">{type.replace('-', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${(count / statistics.totalFractionalRecipes) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Mapping Completeness by Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Mapping Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{Math.round(statistics.mappingCompleteness)}%</span>
                    </div>
                    <Progress value={statistics.mappingCompleteness} />
                  </div>
                  
                  <Separator />
                  
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div className="flex justify-between">
                      <span>Total Variants:</span>
                      <span>{statistics.totalMappedVariants + statistics.totalUnmappedVariants}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Mapped:</span>
                      <span>{statistics.totalMappedVariants}</span>
                    </div>
                    <div className="flex justify-between text-amber-600">
                      <span>Remaining:</span>
                      <span>{statistics.totalUnmappedVariants}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Component for displaying a fractional recipe group
function FractionalGroupCard({ group }: { group: FractionalMappingGroup }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {group.fractionalSalesType === 'pizza-slice' && <Pizza className="h-5 w-5" />}
            {group.fractionalSalesType === 'cake-slice' && <Cake className="h-5 w-5" />}
            {!['pizza-slice', 'cake-slice'].includes(group.fractionalSalesType) && <Package className="h-5 w-5" />}
            <span>{group.recipeName}</span>
            <Badge variant="outline" className={
              group.fractionalSalesType === 'pizza-slice' ? 'bg-orange-50 text-orange-700 border-orange-200' :
              group.fractionalSalesType === 'cake-slice' ? 'bg-pink-50 text-pink-700 border-pink-200' :
              'bg-gray-50 text-gray-700 border-gray-200'
            }>
              {group.fractionalSalesType}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {group.variants.length} mapped
            </Badge>
            {group.unmappedVariants.length > 0 && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                {group.unmappedVariants.length} unmapped
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>POS Item</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>Conversion Rate</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {group.variants.map(({ recipeVariant, posMapping }) => (
              <TableRow key={posMapping.id}>
                <TableCell className="font-medium">
                  {posMapping.posItemCode}
                  <div className="text-sm text-muted-foreground">
                    {posMapping.posDescription}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {recipeVariant.name}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {recipeVariant.quantity} {recipeVariant.unit}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {(recipeVariant.conversionRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    of base recipe
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    ${recipeVariant.sellingPrice}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Cost: ${recipeVariant.costPerUnit}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      posMapping.status === "mapped"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : posMapping.status === "error"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }
                  >
                    {posMapping.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    Edit Mapping
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {group.unmappedVariants.length > 0 && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-medium text-amber-800 mb-2">Unmapped Variants</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {group.unmappedVariants.map(variant => (
                <div key={variant.id} className="text-sm">
                  <span className="font-medium">{variant.name}</span>
                  <span className="text-muted-foreground ml-2">
                    ({(variant.conversionRate * 100).toFixed(1)}% of recipe)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}