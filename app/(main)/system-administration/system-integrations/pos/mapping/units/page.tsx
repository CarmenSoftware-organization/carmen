"use client"

import { useState, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

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

import { UnitMapping, UnitType } from "./types"
import { unitMappings, baseUnits } from "./data"
import { UnitEditDrawer } from "../components/unit-edit-drawer"
import { DeleteConfirmationDialog } from "../components/delete-confirmation-dialog"
import { MappingHistoryDrawer } from "../components/mapping-history-drawer"

// Type adapter for UnitEditDrawer compatibility
type DrawerUnitMapping = {
  id: string
  posUnitId: string
  posUnitName: string
  carmenUnitId: string
  carmenUnitName: string
  conversionRate: number
  unitType: string
  baseUnit: string
  isActive: boolean
  mappedBy: {
    id: string
    name: string
  }
  mappedAt: string
}

// Type adapter for DeleteConfirmationDialog compatibility
type BaseMapping = {
  id: string
  posUnitName?: string
  isActive: boolean
}

export default function UnitMappingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilter[]>([])
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<UnitMapping | null>(null)

  // Convert UnitMapping to DrawerUnitMapping for the drawer component
  const toDrawerMapping = (unit: UnitMapping | null): DrawerUnitMapping | null => {
    if (!unit) return null
    return {
      id: unit.id,
      posUnitId: unit.unitCode,
      posUnitName: unit.unitName,
      carmenUnitId: unit.id,
      carmenUnitName: unit.unitName,
      conversionRate: unit.conversionRate,
      unitType: unit.unitType,
      baseUnit: unit.baseUnit,
      isActive: unit.status === "active",
      mappedBy: {
        id: "current-user",
        name: "Current User"
      },
      mappedAt: unit.updatedAt.toISOString()
    }
  }

  // Convert UnitMapping to BaseMapping for the delete dialog component
  const toBaseMapping = (unit: UnitMapping | null): BaseMapping | null => {
    if (!unit) return null
    return {
      id: unit.id,
      posUnitName: unit.unitName,
      isActive: unit.status === "active"
    }
  }
  
  // Setup filter groups
  const filterGroups: FilterGroup[] = [
    {
      id: "unitType",
      label: "Unit Type",
      type: "multiple",
      options: [
        { id: "recipe", label: "Recipe Units", value: "recipe" },
        { id: "sales", label: "Sales Units", value: "sales" },
        { id: "both", label: "Both", value: "both" },
      ],
    },
    {
      id: "status",
      label: "Status",
      type: "multiple",
      options: [
        { id: "active", label: "Active", value: "active" },
        { id: "inactive", label: "Inactive", value: "inactive" },
        { id: "custom", label: "Custom", value: "custom" },
      ],
    },
    {
      id: "baseUnit",
      label: "Base Unit",
      type: "multiple",
      options: baseUnits.map(unit => ({
        id: unit.id,
        label: unit.name,
        value: unit.name,
      })),
    },
  ]

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // Handle row actions
  const handleRowAction = (action: ActionType, unit: UnitMapping) => {
    setSelectedUnit(unit)

    switch(action) {
      case "edit":
        setEditDrawerOpen(true)
        break
      case "delete":
        setDeleteDialogOpen(true)
        break
      case "history":
        setHistoryDrawerOpen(true)
        break
    }
  }

  // Handle save mapping
  const handleSaveMapping = (updatedMapping: Partial<DrawerUnitMapping>) => {
    console.log("Saving updated mapping:", updatedMapping)
    // TODO: Implement actual save logic with API call
    // Convert back from DrawerUnitMapping to UnitMapping if needed
  }

  // Handle delete mapping
  const handleDeleteMapping = (deleteType: "soft" | "hard", reason?: string) => {
    console.log(`Deleting mapping (${deleteType}):`, selectedUnit?.id, "Reason:", reason)
    // TODO: Implement actual delete logic with API call
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

  // Get row class based on status
  const getRowClassName = (unit: UnitMapping) => {
    if (unit.status === "inactive") {
      return "bg-gray-50 dark:bg-gray-900/10"
    }
    if (unit.status === "custom") {
      return "bg-indigo-50 dark:bg-indigo-900/10"
    }
    return ""
  }

  return (
    <div>
      <MappingHeader
        title="Unit Mapping"
        addButtonLabel="Add Unit"
        searchPlaceholder="Search by unit name or code"
        addRoute="/system-administration/system-integrations/pos/mapping/units/new"
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

      <UnitEditDrawer
        open={editDrawerOpen}
        onOpenChange={setEditDrawerOpen}
        mapping={toDrawerMapping(selectedUnit)}
        onSave={handleSaveMapping}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        mapping={toBaseMapping(selectedUnit)}
        mappingType="unit"
        onConfirm={handleDeleteMapping}
      />

      <MappingHistoryDrawer
        open={historyDrawerOpen}
        onOpenChange={setHistoryDrawerOpen}
        mappingId={selectedUnit?.id || ""}
        mappingType="unit"
        mappingName={selectedUnit?.unitName || ""}
      />
    </div>
  )
} 