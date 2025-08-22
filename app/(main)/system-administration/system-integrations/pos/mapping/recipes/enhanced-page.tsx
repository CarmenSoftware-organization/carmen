"use client"

import { useState, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import Link from "next/link"
import { ExternalLink, Pizza, Cake, Package2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { 
  MappingHeader, 
  FilterBar, 
  DataTable, 
  StatusBadge, 
  RowActions,
  FilterGroup,
  AppliedFilter,
  ActionType,
} from "../components"

import { RecipeMapping } from "./types"
import { recipeMappings, categories, locations } from "./data"

export default function EnhancedRecipeMappingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilter[]>([])
  
  // Setup filter groups
  const filterGroups: FilterGroup[] = [
    {
      id: "status",
      label: "Status",
      type: "multiple",
      options: [
        { id: "mapped", label: "Mapped", value: "mapped" },
        { id: "unmapped", label: "Unmapped", value: "unmapped" },
        { id: "error", label: "Error", value: "error" },
      ],
    },
    {
      id: "category",
      label: "Category", 
      type: "multiple",
      options: categories.map(cat => ({
        id: cat.id,
        label: cat.name,
        value: cat.name,
      })),
    },
    {
      id: "fractionalType",
      label: "Fractional Type",
      type: "multiple", 
      options: [
        { id: "pizza-slice", label: "Pizza Slice", value: "pizza-slice" },
        { id: "cake-slice", label: "Cake Slice", value: "cake-slice" },
        { id: "standard", label: "Standard", value: "standard" },
      ],
    },
  ]

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // Handle row actions
  const handleRowAction = (action: ActionType, recipe: RecipeMapping) => {
    console.log(`${action} action on recipe:`, recipe)
  }

  // Filter data based on search query and applied filters
  const filteredData = useMemo(() => {
    return recipeMappings.filter(recipe => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (
          !recipe.posItemCode.toLowerCase().includes(query) &&
          !recipe.posDescription.toLowerCase().includes(query) &&
          !recipe.recipeCode.toLowerCase().includes(query) &&
          !recipe.recipeName.toLowerCase().includes(query)
        ) {
          return false
        }
      }

      // Apply status filters
      const statusFilters = appliedFilters
        .filter(f => f.groupId === "status")
        .map(f => f.value)
      
      if (statusFilters.length > 0 && !statusFilters.includes(recipe.status)) {
        return false
      }

      // Apply category filters
      const categoryFilters = appliedFilters
        .filter(f => f.groupId === "category")
        .map(f => f.value)
        
      if (categoryFilters.length > 0 && !categoryFilters.includes(recipe.category)) {
        return false
      }

      // Apply fractional type filters
      const fractionalFilters = appliedFilters
        .filter(f => f.groupId === "fractionalType")
        .map(f => f.value)
        
      if (fractionalFilters.length > 0) {
        const recipeType = recipe.fractionalSalesType || "standard"
        if (!fractionalFilters.includes(recipeType)) {
          return false
        }
      }

      return true
    })
  }, [recipeMappings, searchQuery, appliedFilters])

  // Define table columns
  const columns: ColumnDef<RecipeMapping>[] = [
    {
      accessorKey: "posItemCode",
      header: "POS Item Code",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.posItemCode}
          {row.original.fractionalSalesType && (
            <div className="flex items-center gap-1 mt-1">
              {row.original.fractionalSalesType === 'pizza-slice' && (
                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                  <Pizza className="h-2 w-2 mr-1" />
                  Pizza
                </Badge>
              )}
              {row.original.fractionalSalesType === 'cake-slice' && (
                <Badge variant="outline" className="text-xs bg-pink-50 text-pink-700 border-pink-200">
                  <Cake className="h-2 w-2 mr-1" />
                  Cake
                </Badge>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "posDescription",
      header: "POS Description",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.posDescription}</div>
          {row.original.variantName && (
            <div className="text-sm text-muted-foreground">
              Variant: {row.original.variantName}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "recipeCode",
      header: "Recipe",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.recipeCode}</div>
          <div className="text-sm text-muted-foreground">{row.original.recipeName}</div>
        </div>
      ),
    },
    {
      accessorKey: "conversionRate",
      header: "Conversion Rate",
      cell: ({ row }) => {
        const rate = row.original.conversionRate
        const percentage = (rate * 100).toFixed(1)
        return (
          <div className="text-center">
            <div className="font-medium">{percentage}%</div>
            <div className="text-xs text-muted-foreground">
              {rate < 1 ? `${rate} of recipe` : 'Full recipe'}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "lastSyncDate",
      header: "Last Sync",
      cell: ({ row }) => {
        if (!row.original.lastSyncDate) return "-"
        return (
          <div className="text-sm">
            {format(row.original.lastSyncDate, "MMM d, yyyy")}
            <div className="text-xs text-muted-foreground">
              {format(row.original.lastSyncDate, "h:mm a")}
            </div>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button onClick={() => handleRowAction("edit", row.original)}>Edit</button>
          <button onClick={() => handleRowAction("delete", row.original)}>Delete</button>
          <button onClick={() => handleRowAction("edit", row.original)}>View</button>
        </div>
      ),
    },
  ]

  const getRowClassName = (recipe: RecipeMapping) => {
    if (recipe.status === "error") return "bg-red-50"
    if (recipe.status === "unmapped") return "bg-amber-50"
    if (recipe.fractionalSalesType) return "bg-purple-50/30"
    return ""
  }

  // Calculate fractional sales statistics
  const fractionalStats = useMemo(() => {
    const fractionalMappings = recipeMappings.filter(m => m.fractionalSalesType)
    const pizzaMappings = fractionalMappings.filter(m => m.fractionalSalesType === 'pizza-slice')
    const cakeMappings = fractionalMappings.filter(m => m.fractionalSalesType === 'cake-slice')
    
    return {
      total: fractionalMappings.length,
      pizza: pizzaMappings.length,
      cake: cakeMappings.length,
      unmapped: fractionalMappings.filter(m => m.status === 'unmapped').length
    }
  }, [])

  return (
    <div>
      <MappingHeader
        title="Recipe Mapping"
        addButtonLabel="Add Recipe Mapping"
        searchPlaceholder="Search by POS item code or recipe code"
        addRoute="/system-administration/system-integrations/pos/mapping/recipes/new"
        onSearch={handleSearch}
      />
      
      {/* Fractional Sales Management Section */}
      <div className="mb-6 space-y-4">
        <Alert className="bg-gradient-to-r from-orange-50 to-pink-50 border-l-4 border-l-orange-500">
          <div className="flex items-center">
            <Pizza className="h-4 w-4 text-orange-600 mr-1" />
            <Cake className="h-4 w-4 text-pink-600" />
          </div>
          <AlertDescription className="flex items-center justify-between w-full">
            <div>
              <span className="font-medium text-gray-900">Fractional Sales Management</span>
              <p className="text-sm text-gray-600 mt-1">
                Manage pizza slices, cake portions, and multi-yield recipes with advanced variant mapping. 
                Track inventory deduction for fractional sales automatically.
              </p>
            </div>
            <Button asChild variant="default" size="sm" className="ml-4 shrink-0">
              <Link href="/system-administration/system-integrations/pos/mapping/recipes/fractional-variants">
                <Package2 className="h-4 w-4 mr-2" />
                Manage Variants
              </Link>
            </Button>
          </AlertDescription>
        </Alert>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{fractionalStats.pizza}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Pizza className="h-3 w-3" />
                Pizza Variants
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-pink-600">{fractionalStats.cake}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Cake className="h-3 w-3" />
                Cake Variants
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{fractionalStats.total}</div>
              <div className="text-sm text-muted-foreground">Total Fractional</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">{fractionalStats.unmapped}</div>
              <div className="text-sm text-muted-foreground">Need Mapping</div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <FilterBar
        filterGroups={filterGroups}
        appliedFilters={appliedFilters}
        onFilterChange={setAppliedFilters}
        onSavePreset={() => console.log("Save preset")}
      />
      <DataTable
        columns={columns}
        data={filteredData}
        rowClassName={getRowClassName}
      />
    </div>
  )
}