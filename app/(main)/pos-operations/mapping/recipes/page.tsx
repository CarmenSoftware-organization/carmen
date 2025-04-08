'use client'

import { useState, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  StatusBadge, 
  RowActions,
  ActionType,
} from "../components"
import { RecipeMapping } from "./types"
import { recipeMappings } from "./data"
import { columns } from "./components/columns"

export default function RecipeMappingPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Handle row actions
  const handleRowAction = (action: ActionType, recipe: RecipeMapping) => {
    console.log(`${action} action on recipe:`, recipe)
    // Implement action handlers here
  }

  // Filter data based on search query
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
      return true
    })
  }, [searchQuery])

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

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Recipe Mapping</h1>
        <Button>Add New Mapping</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recipe Mapping</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <DataTable 
            columns={columns}
            data={filteredData}
          />
        </CardContent>
      </Card>
    </div>
  )
} 