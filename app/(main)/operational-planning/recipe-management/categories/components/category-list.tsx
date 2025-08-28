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
  DropdownMenuSeparator,
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
  ChevronDown,
  ChevronRight,
  Edit,
  FileDown,
  FileUp,
  Filter,
  FolderTree,
  MoreVertical,
  Plus,
  Printer,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { RecipeCategory, mockCategories } from "../data/mock-categories"

interface FilterState {
  status: string[]
  hasParent: boolean | null
  minRecipes: number | null
  maxRecipes: number | null
  minMargin: number | null
  maxMargin: number | null
}

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
  { label: "Status", value: "status" },
  { label: "Recipe Count", value: "recipeCount" },
  { label: "Active Recipe Count", value: "activeRecipeCount" },
  { label: "Average Cost", value: "averageCost" },
  { label: "Average Margin", value: "averageMargin" },
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

export function CategoryList() {
  const [categories] = useState<RecipeCategory[]>(mockCategories)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | null>(null)
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    hasParent: null,
    minRecipes: null,
    maxRecipes: null,
    minMargin: null,
    maxMargin: null,
  })
  const [quickFilters, setQuickFilters] = useState<string[]>([])
  const [formData, setFormData] = useState<Partial<RecipeCategory>>({
    name: "",
    code: "",
    description: "",
    parentId: null,
    status: "active",
    defaultCostSettings: {
      laborCostPercentage: 30,
      overheadPercentage: 20,
      targetFoodCostPercentage: 30
    },
    defaultMargins: {
      minimumMargin: 65,
      targetMargin: 70
    }
  })
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const handleEdit = (category: RecipeCategory) => {
    setSelectedCategory(category)
    setFormData({
      ...category,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (category: RecipeCategory) => {
    setSelectedCategory(category)
    setIsDeleteDialogOpen(true)
  }

  const handleCreate = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      parentId: null,
      status: "active",
      defaultCostSettings: {
        laborCostPercentage: 30,
        overheadPercentage: 20,
        targetFoodCostPercentage: 30
      },
      defaultMargins: {
        minimumMargin: 65,
        targetMargin: 70
      }
    })
    setIsCreateDialogOpen(true)
  }

  const handleSave = async () => {
    // Here you would typically make an API call to save the category
    console.log("Saving category:", formData)
    
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
      parentId: null,
      status: "active",
      defaultCostSettings: {
        laborCostPercentage: 30,
        overheadPercentage: 20,
        targetFoodCostPercentage: 30
      },
      defaultMargins: {
        minimumMargin: 65,
        targetMargin: 70
      }
    })
  }

  const handleConfirmDelete = async () => {
    if (!selectedCategory) return
    
    // Here you would typically make an API call to delete the category
    console.log("Deleting category:", selectedCategory.id)
    
    setIsDeleteDialogOpen(false)
    setSelectedCategory(null)
  }

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

  const applyFilters = (category: RecipeCategory) => {
    // Quick filters
    if (quickFilters.length > 0) {
      if (quickFilters.includes('noRecipes') && category.recipeCount > 0) return false
      if (quickFilters.includes('hasRecipes') && category.recipeCount === 0) return false
      if (quickFilters.includes('topLevel') && category.parentId !== null) return false
      if (quickFilters.includes('subLevel') && category.parentId === null) return false
    }

    // Advanced filters
    return filterConditions.every((condition) => {
      const fieldValue = category[condition.field as keyof RecipeCategory]
      
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = filteredCategories.reduce((acc: string[], category) => {
        acc.push(category.id)
        // Also include all child categories
        const getAllChildIds = (parentId: string): string[] => {
          const children = categories.filter(c => c.parentId === parentId)
          return children.reduce((childAcc: string[], child) => {
            return [...childAcc, child.id, ...getAllChildIds(child.id)]
          }, [])
        }
        return [...acc, ...getAllChildIds(category.id)]
      }, [])
      setSelectedCategories(allIds)
    } else {
      setSelectedCategories([])
    }
  }

  const handleSelect = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId])
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId))
    }
  }

  const renderCategoryRow = (category: RecipeCategory, depth = 0): JSX.Element => {
    const isExpanded = expandedCategories.has(category.id)
    const childCategories = categories.filter(c => c.parentId === category.id)
    const hasChildren = childCategories.length > 0

    return (
      <>
        <TableRow key={category.id} role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined}>
          <TableCell>
            <Checkbox
              checked={selectedCategories.includes(category.id)}
              onCheckedChange={(checked) => handleSelect(category.id, checked as boolean)}
            />
          </TableCell>
          <TableCell className="font-medium">
            <div className="flex items-center">
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mr-2 p-2 h-11 w-11"
                  onClick={() => toggleExpand(category.id)}
                  aria-label={isExpanded ? `Collapse ${category.name}` : `Expand ${category.name}`}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              <span style={{ marginLeft: `${depth * 24}px` }}>{category.name}</span>
            </div>
          </TableCell>
          <TableCell>{category.code}</TableCell>
          <TableCell>{category.description}</TableCell>
          <TableCell>
            <Badge variant={category.status === "active" ? "default" : "secondary"}>
              {category.status}
            </Badge>
          </TableCell>
          <TableCell className="text-right">{category.recipeCount}</TableCell>
          <TableCell className="text-right">{category.activeRecipeCount}</TableCell>
          <TableCell className="text-right">${category.averageCost.toFixed(2)}</TableCell>
          <TableCell className="text-right">{category.averageMargin.toFixed(1)}%</TableCell>
          <TableCell>{category.lastUpdated}</TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-11 w-11 p-2"
                  aria-label={`Actions for ${category.name}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(category)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(category)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        {isExpanded && childCategories.map(child => renderCategoryRow(child, depth + 1))}
      </>
    )
  }

  const rootCategories = categories.filter(category => !category.parentId)
  const filteredCategories = rootCategories
    .filter(category => 
      (category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       category.code.toLowerCase().includes(searchTerm.toLowerCase())) &&
      applyFilters(category)
    )

  // Add new bulk action handler
  const handleBulkAction = async (action: string) => {
    switch (action) {
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedCategories.length} categories?`)) {
          // Here you would make an API call to delete the categories
          console.log("Deleting categories:", selectedCategories)
          setSelectedCategories([])
        }
        break
      case 'activate':
        // Here you would make an API call to activate the categories
        console.log("Activating categories:", selectedCategories)
        break
      case 'deactivate':
        // Here you would make an API call to deactivate the categories
        console.log("Deactivating categories:", selectedCategories)
        break
      case 'export':
        // Here you would trigger the export functionality
        console.log("Exporting categories:", selectedCategories)
        break
      default:
        break
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Recipe Categories</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="h-11 px-4">
            <FileUp className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" className="h-11 px-4">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" className="h-11 px-4">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleCreate} className="h-11 px-4">
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex gap-2">
              <Button
                variant={quickFilters.includes('noRecipes') ? 'default' : 'outline'}
                size="sm"
                className="h-11 px-4"
                onClick={() => handleQuickFilter('noRecipes')}
                aria-pressed={quickFilters.includes('noRecipes')}
              >
                No Recipes
              </Button>
              <Button
                variant={quickFilters.includes('hasRecipes') ? 'default' : 'outline'}
                size="sm"
                className="h-11 px-4"
                onClick={() => handleQuickFilter('hasRecipes')}
                aria-pressed={quickFilters.includes('hasRecipes')}
              >
                Has Recipes
              </Button>
              <Button
                variant={quickFilters.includes('topLevel') ? 'default' : 'outline'}
                size="sm"
                className="h-11 px-4"
                onClick={() => handleQuickFilter('topLevel')}
                aria-pressed={quickFilters.includes('topLevel')}
              >
                Top Level
              </Button>
              <Button
                variant={quickFilters.includes('subLevel') ? 'default' : 'outline'}
                size="sm"
                className="h-11 px-4"
                onClick={() => handleQuickFilter('subLevel')}
                aria-pressed={quickFilters.includes('subLevel')}
              >
                Sub Level
              </Button>
            </div>

            <Popover open={isAdvancedFilterOpen} onOpenChange={setIsAdvancedFilterOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-11 px-4"
                  aria-expanded={isAdvancedFilterOpen}
                >
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
                        className="h-11 w-11 p-2"
                        onClick={() => removeFilterCondition(condition.id)}
                        aria-label="Remove filter condition"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full h-11"
                    onClick={addFilterCondition}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add filter
                  </Button>
                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm" className="h-11 px-4" onClick={clearFilters}>
                      Clear All
                    </Button>
                    <Button size="sm" className="h-11 px-4" onClick={() => setIsAdvancedFilterOpen(false)}>
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
                className="text-muted-foreground h-11 px-4"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCategories.length > 0 && (
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-11 px-4"
                onClick={() => handleBulkAction('activate')}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-11 px-4"
                onClick={() => handleBulkAction('deactivate')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Deactivate
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-11 px-4"
                onClick={() => handleBulkAction('export')}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export Selected
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-11 px-4"
                onClick={() => handleBulkAction('delete')}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedCategories.length} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-11 px-4"
                onClick={() => setSelectedCategories([])}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Categories Table */}
      <div className="border rounded-lg" role="tree" aria-label="Recipe categories table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    filteredCategories.length > 0 &&
                    filteredCategories.every(category => 
                      selectedCategories.includes(category.id)
                    )
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Recipes</TableHead>
              <TableHead className="text-right">Active</TableHead>
              <TableHead className="text-right">Avg. Cost</TableHead>
              <TableHead className="text-right">Avg. Margin</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map(category => renderCategoryRow(category))}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={() => {
        setIsCreateDialogOpen(false)
        setIsEditDialogOpen(false)
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? "Edit Category" : "Create New Category"}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen
                ? "Edit the category details below"
                : "Fill in the details to create a new category"}
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
                <Label htmlFor="parent">Parent Category</Label>
                <Select
                  value={formData.parentId || "none"}
                  onValueChange={(value) => setFormData({ ...formData, parentId: value === "none" ? null : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
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
            <div className="space-y-4">
              <h4 className="font-medium">Default Cost Settings</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="laborCost">Labor Cost %</Label>
                  <Input
                    id="laborCost"
                    type="number"
                    value={formData.defaultCostSettings?.laborCostPercentage}
                    onChange={(e) => setFormData({
                      ...formData,
                      defaultCostSettings: {
                        ...formData.defaultCostSettings!,
                        laborCostPercentage: parseFloat(e.target.value)
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overhead">Overhead %</Label>
                  <Input
                    id="overhead"
                    type="number"
                    value={formData.defaultCostSettings?.overheadPercentage}
                    onChange={(e) => setFormData({
                      ...formData,
                      defaultCostSettings: {
                        ...formData.defaultCostSettings!,
                        overheadPercentage: parseFloat(e.target.value)
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetFoodCost">Target Food Cost %</Label>
                  <Input
                    id="targetFoodCost"
                    type="number"
                    value={formData.defaultCostSettings?.targetFoodCostPercentage}
                    onChange={(e) => setFormData({
                      ...formData,
                      defaultCostSettings: {
                        ...formData.defaultCostSettings!,
                        targetFoodCostPercentage: parseFloat(e.target.value)
                      }
                    })}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Default Margins</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minimumMargin">Minimum Margin %</Label>
                  <Input
                    id="minimumMargin"
                    type="number"
                    value={formData.defaultMargins?.minimumMargin}
                    onChange={(e) => setFormData({
                      ...formData,
                      defaultMargins: {
                        ...formData.defaultMargins!,
                        minimumMargin: parseFloat(e.target.value)
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetMargin">Target Margin %</Label>
                  <Input
                    id="targetMargin"
                    type="number"
                    value={formData.defaultMargins?.targetMargin}
                    onChange={(e) => setFormData({
                      ...formData,
                      defaultMargins: {
                        ...formData.defaultMargins!,
                        targetMargin: parseFloat(e.target.value)
                      }
                    })}
                  />
                </div>
              </div>
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
              {isEditDialogOpen ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedCategory?.name}&quot;? This action cannot be undone.
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