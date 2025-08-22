"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Edit,
  FileDown,
  FileUp,
  Filter,
  MoreVertical,
  Plus,
  Printer,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  LayoutList,
} from "lucide-react"
import { RecipeCuisine, mockCuisines } from "../data/mock-cuisines"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FilterCondition {
  id: string
  field: string
  operator: string
  value: string
}

const FILTER_FIELDS = [
  { label: "Name", value: "name" },
  { label: "Code", value: "code" },
  { label: "Description", value: "description" },
  { label: "Region", value: "region" },
  { label: "Status", value: "status" },
  { label: "Recipe Count", value: "recipeCount" },
  { label: "Active Recipe Count", value: "activeRecipeCount" },
]

const FILTER_OPERATORS = [
  { label: "Contains", value: "contains" },
  { label: "Equals", value: "equals" },
  { label: "Not equals", value: "notEquals" },
  { label: "Greater than", value: "greaterThan" },
  { label: "Less than", value: "lessThan" },
  { label: "Is empty", value: "isEmpty" },
  { label: "Is not empty", value: "isNotEmpty" },
]

const REGIONS = [
  "Asia",
  "Europe",
  "Americas",
  "Africa",
  "Middle East",
  "Oceania",
]

export function CuisineList() {
  const [cuisines] = useState<RecipeCuisine[]>(mockCuisines)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCuisine, setSelectedCuisine] = useState<RecipeCuisine | null>(null)
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false)
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([])
  const [quickFilters, setQuickFilters] = useState<string[]>([])
  const [formData, setFormData] = useState<Partial<RecipeCuisine>>({
    name: "",
    code: "",
    description: "",
    region: "",
    status: "active",
    popularDishes: [],
    keyIngredients: [],
  })
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleQuickFilter = (filter: string) => {
    setQuickFilters(prev => {
      const newFilters = prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
      return newFilters
    })
  }

  const addFilterCondition = () => {
    const newCondition: FilterCondition = {
      id: Math.random().toString(36).substr(2, 9),
      field: FILTER_FIELDS[0].value,
      operator: FILTER_OPERATORS[0].value,
      value: "",
    }
    setFilterConditions([...filterConditions, newCondition])
  }

  const removeFilterCondition = (id: string) => {
    setFilterConditions(filterConditions.filter((condition) => condition.id !== id))
  }

  const updateFilterCondition = (
    id: string,
    field: keyof FilterCondition,
    value: string
  ) => {
    setFilterConditions(
      filterConditions.map((condition) =>
        condition.id === id ? { ...condition, [field]: value } : condition
      )
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCuisines(filteredCuisines.map(cuisine => cuisine.id))
    } else {
      setSelectedCuisines([])
    }
  }

  const handleSelect = (cuisineId: string, checked: boolean) => {
    if (checked) {
      setSelectedCuisines(prev => [...prev, cuisineId])
    } else {
      setSelectedCuisines(prev => prev.filter(id => id !== cuisineId))
    }
  }

  const handleEdit = (cuisine: RecipeCuisine) => {
    setSelectedCuisine(cuisine)
    setFormData({
      ...cuisine,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (cuisine: RecipeCuisine) => {
    setSelectedCuisine(cuisine)
    setIsDeleteDialogOpen(true)
  }

  const handleCreate = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      region: "",
      status: "active",
      popularDishes: [],
      keyIngredients: [],
    })
    setIsCreateDialogOpen(true)
  }

  const handleSave = async () => {
    // Here you would typically make an API call to save the cuisine
    console.log("Saving cuisine:", formData)
    
    if (isEditDialogOpen) {
      setIsEditDialogOpen(false)
    } else {
      setIsCreateDialogOpen(false)
    }
    
    // Reset form
    setFormData({
      name: "",
      code: "",
      description: "",
      region: "",
      status: "active",
      popularDishes: [],
      keyIngredients: [],
    })
  }

  const handleConfirmDelete = async () => {
    if (!selectedCuisine) return
    
    // Here you would typically make an API call to delete the cuisine
    console.log("Deleting cuisine:", selectedCuisine.id)
    
    setIsDeleteDialogOpen(false)
    setSelectedCuisine(null)
  }

  const handleBulkAction = async (action: string) => {
    switch (action) {
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedCuisines.length} cuisines?`)) {
          // Here you would make an API call to delete the cuisines
          console.log("Deleting cuisines:", selectedCuisines)
          setSelectedCuisines([])
        }
        break
      case 'activate':
        // Here you would make an API call to activate the cuisines
        console.log("Activating cuisines:", selectedCuisines)
        break
      case 'deactivate':
        // Here you would make an API call to deactivate the cuisines
        console.log("Deactivating cuisines:", selectedCuisines)
        break
      case 'export':
        // Here you would trigger the export functionality
        console.log("Exporting cuisines:", selectedCuisines)
        break
      default:
        break
    }
  }

  const applyFilters = (cuisine: RecipeCuisine) => {
    // Quick filters
    if (quickFilters.length > 0) {
      if (quickFilters.includes('noRecipes') && cuisine.recipeCount > 0) return false
      if (quickFilters.includes('hasRecipes') && cuisine.recipeCount === 0) return false
      if (quickFilters.includes('asian') && cuisine.region !== 'Asia') return false
      if (quickFilters.includes('european') && cuisine.region !== 'Europe') return false
    }

    // Advanced filters
    return filterConditions.every((condition) => {
      const fieldValue = cuisine[condition.field as keyof RecipeCuisine]
      
      switch (condition.operator) {
        case "contains":
          return String(fieldValue)
            .toLowerCase()
            .includes(condition.value.toLowerCase())
        case "equals":
          return String(fieldValue).toLowerCase() === condition.value.toLowerCase()
        case "notEquals":
          return String(fieldValue).toLowerCase() !== condition.value.toLowerCase()
        case "greaterThan":
          return Number(fieldValue) > Number(condition.value)
        case "lessThan":
          return Number(fieldValue) < Number(condition.value)
        case "isEmpty":
          return !fieldValue || String(fieldValue).trim() === ""
        case "isNotEmpty":
          return fieldValue && String(fieldValue).trim() !== ""
        default:
          return true
      }
    })
  }

  const clearFilters = () => {
    setFilterConditions([])
    setQuickFilters([])
  }

  const filteredCuisines = cuisines.filter(cuisine => 
    (cuisine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     cuisine.code.toLowerCase().includes(searchTerm.toLowerCase())) &&
    applyFilters(cuisine)
  )

  if (error) {
    return (
      <Alert variant="destructive" className="mx-4 my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div 
      className="space-y-6"
      role="region" 
      aria-label="Recipe Cuisine Types"
    >
      {/* Primary Header (60px height) */}
      <div 
        className="h-[60px] flex justify-between items-center px-4"
        role="toolbar" 
        aria-label="Primary Actions"
      >
        <h1 className="text-2xl font-semibold">Recipe Cuisine Types</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileUp className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Cuisine Type
          </Button>
        </div>
      </div>

      {/* Secondary Header (48px height) - Search and Filters */}
      <div 
        className="h-[48px] flex items-center gap-4 px-4 border-b"
        role="search"
      >
        <div className="relative w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cuisine types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            aria-label="Search cuisine types"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex gap-2">
            <Button
              variant={quickFilters.includes('noRecipes') ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickFilter('noRecipes')}
            >
              No Recipes
            </Button>
            <Button
              variant={quickFilters.includes('hasRecipes') ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickFilter('hasRecipes')}
            >
              Has Recipes
            </Button>
            <Button
              variant={quickFilters.includes('asian') ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickFilter('asian')}
            >
              Asian
            </Button>
            <Button
              variant={quickFilters.includes('european') ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickFilter('european')}
            >
              European
            </Button>
          </div>

          <Popover open={isAdvancedFilterOpen} onOpenChange={setIsAdvancedFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                More Filters {filterConditions.length > 0 && `(${filterConditions.length})`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-4" align="end">
              <div className="space-y-4">
                <div className="font-medium flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </div>
                {filterConditions.map((condition) => (
                  <div key={condition.id} className="flex items-center gap-2">
                    <Select
                      value={condition.field}
                      onValueChange={(value) =>
                        updateFilterCondition(condition.id, "field", value)
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FILTER_FIELDS.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={condition.operator}
                      onValueChange={(value) =>
                        updateFilterCondition(condition.id, "operator", value)
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FILTER_OPERATORS.map((operator) => (
                          <SelectItem key={operator.value} value={operator.value}>
                            {operator.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!["isEmpty", "isNotEmpty"].includes(condition.operator) && (
                      <Input
                        value={condition.value}
                        onChange={(e) =>
                          updateFilterCondition(
                            condition.id,
                            "value",
                            e.target.value
                          )
                        }
                        className="flex-1"
                        placeholder="Value"
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFilterCondition(condition.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={addFilterCondition}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add filter
                </Button>
                <div className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                  <Button size="sm" onClick={() => setIsAdvancedFilterOpen(false)}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {(quickFilters.length > 0 || filterConditions.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          )}

          {/* View Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="ml-2"
          >
            {viewMode === 'list' ? (
              <LayoutGrid className="h-4 w-4" />
            ) : (
              <LayoutList className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Bulk Actions Menu */}
      {selectedCuisines.length > 0 && (
        <div 
          className="h-[48px] border-b bg-muted/50 flex items-center justify-between px-4"
          role="toolbar"
          aria-label="Bulk Actions"
        >
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('activate')}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Activate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('deactivate')}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Deactivate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('export')}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export Selected
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleBulkAction('delete')}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedCuisines.length} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCuisines([])}
            >
              <X className="h-4 w-4 mr-2" />
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* List/Grid Container */}
      {isLoading ? (
        viewMode === 'list' ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Skeleton className="h-4 w-4" />
                  </TableHead>
                  <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-48" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                  <TableHead className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
                  <TableHead className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                  <TableHead className="w-[100px]"><Skeleton className="h-4 w-8" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <>
          {viewMode === 'list' ? (
            <div 
              className="border rounded-lg"
              role="grid"
              aria-label="Cuisine Types List"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={
                          filteredCuisines.length > 0 &&
                          filteredCuisines.every(cuisine => 
                            selectedCuisines.includes(cuisine.id)
                          )
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Recipes</TableHead>
                    <TableHead className="text-right">Active</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCuisines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-[400px] text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="h-[120px] w-[120px] flex items-center justify-center rounded-full bg-muted">
                            <Search className="h-12 w-12 text-muted-foreground" />
                          </div>
                          <h3 className="font-semibold text-lg">No cuisines found</h3>
                          <p className="text-muted-foreground">
                            No cuisine types match your search criteria.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearchTerm("")
                              clearFilters()
                            }}
                          >
                            Clear all filters
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCuisines.map((cuisine) => (
                      <TableRow 
                        key={cuisine.id}
                        className={cn(
                          "h-[48px]", // Minimum touch target height
                          selectedCuisines.includes(cuisine.id) && "bg-muted/50"
                        )}
                      >
                        <TableCell className="w-[50px]">
                          <Checkbox
                            checked={selectedCuisines.includes(cuisine.id)}
                            onCheckedChange={(checked) => handleSelect(cuisine.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{cuisine.name}</TableCell>
                        <TableCell>{cuisine.code}</TableCell>
                        <TableCell className="max-w-[300px] truncate">{cuisine.description}</TableCell>
                        <TableCell>{cuisine.region}</TableCell>
                        <TableCell>
                          <Badge variant={cuisine.status === "active" ? "default" : "secondary"}>
                            {cuisine.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{cuisine.recipeCount}</TableCell>
                        <TableCell className="text-right">{cuisine.activeRecipeCount}</TableCell>
                        <TableCell>{cuisine.lastUpdated}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(cuisine)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(cuisine)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4"
              role="grid"
              aria-label="Cuisine Types Grid"
            >
              {filteredCuisines.length === 0 ? (
                <div className="col-span-full h-[400px] flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-[120px] w-[120px] flex items-center justify-center rounded-full bg-muted">
                      <Search className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg">No cuisines found</h3>
                    <p className="text-muted-foreground">
                      No cuisine types match your search criteria.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("")
                        clearFilters()
                      }}
                    >
                      Clear all filters
                    </Button>
                  </div>
                </div>
              ) : (
                filteredCuisines.map((cuisine) => (
                  <div
                    key={cuisine.id}
                    className={cn(
                      "group relative border rounded-lg p-4 hover:border-primary transition-colors",
                      selectedCuisines.includes(cuisine.id) && "bg-muted/50 border-primary"
                    )}
                  >
                    <div className="absolute top-2 left-2">
                      <Checkbox
                        checked={selectedCuisines.includes(cuisine.id)}
                        onCheckedChange={(checked) => handleSelect(cuisine.id, checked as boolean)}
                      />
                    </div>
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(cuisine)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(cuisine)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="pt-6">
                      <h3 className="font-semibold truncate">{cuisine.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{cuisine.code}</p>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{cuisine.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <Badge variant={cuisine.status === "active" ? "default" : "secondary"}>
                          {cuisine.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{cuisine.region}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                        <span>{cuisine.recipeCount} recipes</span>
                        <span>{cuisine.activeRecipeCount} active</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={() => {
        setIsCreateDialogOpen(false)
        setIsEditDialogOpen(false)
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? "Edit Cuisine Type" : "Create New Cuisine Type"}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen
                ? "Edit the cuisine type details below"
                : "Fill in the details to create a new cuisine type"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value) => setFormData({ ...formData, region: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="popularDishes">Popular Dishes (comma-separated)</Label>
              <Input
                id="popularDishes"
                value={formData.popularDishes?.join(", ")}
                onChange={(e) => setFormData({
                  ...formData,
                  popularDishes: e.target.value.split(",").map(s => s.trim())
                })}
                placeholder="E.g., Sushi, Ramen, Tempura"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keyIngredients">Key Ingredients (comma-separated)</Label>
              <Input
                id="keyIngredients"
                value={formData.keyIngredients?.join(", ")}
                onChange={(e) => setFormData({
                  ...formData,
                  keyIngredients: e.target.value.split(",").map(s => s.trim())
                })}
                placeholder="E.g., Rice, Seaweed, Dashi"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false)
              setIsEditDialogOpen(false)
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isEditDialogOpen ? "Save Changes" : "Create Cuisine Type"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Cuisine Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedCuisine?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 