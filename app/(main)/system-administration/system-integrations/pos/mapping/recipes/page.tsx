"use client"

import { useState, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import Link from "next/link"
import { ExternalLink, Pizza, Cake, Package2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

export default function RecipeMappingPage() {
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
      id: "location",
      label: "Location",
      type: "multiple",
      options: locations.map(loc => ({
        id: loc.id,
        label: loc.name,
        value: loc.name,
      })),
    },
  ]

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // Handle row actions
  const handleRowAction = (action: ActionType, recipe: RecipeMapping) => {
    console.log(`${action} action on recipe:`, recipe)
    // Implement action handlers here
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

      // Apply location filters (in a real app, would filter by recipe-location relationship)
      // For demo purposes, we'll assume all recipes are available in all locations
      
      return true
    })
  }, [searchQuery, appliedFilters])

  // Define columns
  const columns: ColumnDef<RecipeMapping>[] = [
    {
      accessorKey: "posItemCode",
      header: "POS Item Code",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.posItemCode}</div>
      ),
    },
    {
      accessorKey: "posDescription",
      header: "POS Description",
      cell: ({ row }) => <div>{row.original.posDescription}</div>,
    },
    {
      accessorKey: "recipeCode",
      header: "Recipe Code",
      cell: ({ row }) => (
        <div>
          {row.original.recipeCode ? (
            <Link 
              href={`/operational-planning/recipe-management/recipes/${row.original.recipeCode}`} 
              className="flex items-center text-primary hover:underline"
            >
              {row.original.recipeCode}
              <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          ) : (
            <span className="text-muted-foreground">Not mapped</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "units",
      header: "Units",
      cell: ({ row }) => (
        <div className="text-sm">
          <div>
            POS: <span className="font-medium">{row.original.posUnit}</span>
          </div>
          <div>
            Recipe: <span className="font-medium">{row.original.recipeUnit || "-"}</span>
          </div>
          {row.original.conversionRate > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              Conversion: {row.original.conversionRate}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <div>{row.original.category}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status} />
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <RowActions
          onAction={(action) => handleRowAction(action, row.original)}
          availableActions={["edit", "delete", "history", "test"]}
        />
      ),
    },
  ]

  // Get row class based on status
  const getRowClassName = (recipe: RecipeMapping) => {
    if (recipe.status === "error") {
      return "bg-red-50 dark:bg-red-900/10"
    }
    if (recipe.status === "unmapped") {
      return "bg-amber-50 dark:bg-amber-900/10"
    }
    return ""
  }

  return (
    <div>
      <MappingHeader
        title="Recipe Mapping"
        addButtonLabel="Add Recipe Mapping"
        searchPlaceholder="Search by POS item code or recipe code"
        addRoute="/system-administration/system-integrations/pos/mapping/recipes/new"
        onSearch={handleSearch}
      />

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