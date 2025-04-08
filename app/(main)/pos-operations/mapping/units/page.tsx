'use client'

import { useState, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { 
  StatusBadge, 
  RowActions,
  FilterGroup,
  AppliedFilter,
  ActionType,
} from "../components"
import { UnitMapping, UnitType } from "./types"
import { unitMappings, baseUnits } from "./data"
import { columns } from "./components/columns"

export default function UnitMappingPage() {
  const [searchQuery] = useState("")
  const [appliedFilters] = useState<AppliedFilter[]>([])
  
  // Handle row actions
  const handleRowAction = (action: ActionType, unit: UnitMapping) => {
    console.log(`${action} action on unit:`, unit)
    // Implement action handlers here
  }

  // Format unit type for display
  const formatUnitType = (type: UnitType) => {
    switch (type) {
      case "recipe":
        return "Recipe Unit"
      case "sales":
        return "Sales Unit"
      case "both":
        return "Both"
      default:
        return type
    }
  }

  // Format conversion rate for display
  const formatConversionRate = (rate: number) => {
    if (rate === 1) return "1"
    if (rate < 0.001) return rate.toExponential(2)
    return rate.toFixed(rate % 1 === 0 ? 0 : 4)
  }

  // Filter data based on search query and applied filters
  const filteredData = useMemo(() => {
    return unitMappings.filter(unit => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (
          !unit.unitCode.toLowerCase().includes(query) &&
          !unit.unitName.toLowerCase().includes(query)
        ) {
          return false
        }
      }

      // Apply unit type filters
      const unitTypeFilters = appliedFilters
        .filter(f => f.groupId === "unitType")
        .map(f => f.value)
      
      if (unitTypeFilters.length > 0 && !unitTypeFilters.includes(unit.unitType)) {
        return false
      }

      // Apply status filters
      const statusFilters = appliedFilters
        .filter(f => f.groupId === "status")
        .map(f => f.value)
      
      if (statusFilters.length > 0 && !statusFilters.includes(unit.status)) {
        return false
      }

      // Apply base unit filters
      const baseUnitFilters = appliedFilters
        .filter(f => f.groupId === "baseUnit")
        .map(f => f.value)
      
      if (baseUnitFilters.length > 0 && !baseUnitFilters.includes(unit.baseUnit)) {
        return false
      }

      return true
    })
  }, [searchQuery, appliedFilters])

  // Define columns
  const columns: ColumnDef<UnitMapping>[] = [
    {
      accessorKey: "unitCode",
      header: "Unit Code",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.unitCode}</div>
      ),
    },
    {
      accessorKey: "unitName",
      header: "Unit Name",
      cell: ({ row }) => <div>{row.original.unitName}</div>,
    },
    {
      accessorKey: "unitType",
      header: "Unit Type",
      cell: ({ row }) => <div>{formatUnitType(row.original.unitType)}</div>,
    },
    {
      accessorKey: "baseUnit",
      header: "Base Unit",
      cell: ({ row }) => <div>{row.original.baseUnit}</div>,
    },
    {
      accessorKey: "conversionRate",
      header: "Conversion Rate",
      cell: ({ row }) => (
        <div className="font-mono">
          {formatConversionRate(row.original.conversionRate)}
        </div>
      ),
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
          availableActions={["edit", "delete", "history"]}
        />
      ),
    },
  ]

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Unit Mapping</h1>
        <Button>Add New Mapping</Button>
      </div>
      <DataTable columns={columns} data={filteredData} />
    </div>
  )
} 