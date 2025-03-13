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

import { LocationMapping } from "./types"
import { locationMappings, posTypes } from "./data"

export default function LocationMappingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilter[]>([])
  
  // Setup filter groups
  const filterGroups: FilterGroup[] = [
    {
      id: "status",
      label: "Status",
      type: "multiple",
      options: [
        { id: "active", label: "Active", value: "active" },
        { id: "inactive", label: "Inactive", value: "inactive" },
        { id: "pending", label: "Pending", value: "pending" },
        { id: "error", label: "Error", value: "error" },
      ],
    },
    {
      id: "posType",
      label: "POS Type",
      type: "multiple",
      options: posTypes.map(type => ({
        id: type.id,
        label: type.name,
        value: type.name,
      })),
    },
  ]

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // Handle row actions
  const handleRowAction = (action: ActionType, location: LocationMapping) => {
    console.log(`${action} action on location:`, location)
    // Implement action handlers here
  }

  // Filter data based on search query and applied filters
  const filteredData = useMemo(() => {
    return locationMappings.filter(location => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (
          !location.locationCode.toLowerCase().includes(query) &&
          !location.posLocationName.toLowerCase().includes(query) &&
          !location.mappedName.toLowerCase().includes(query)
        ) {
          return false
        }
      }

      // Apply status filters
      const statusFilters = appliedFilters
        .filter(f => f.groupId === "status")
        .map(f => f.value)
      
      if (statusFilters.length > 0 && !statusFilters.includes(location.status)) {
        return false
      }

      // Apply POS type filters
      const posTypeFilters = appliedFilters
        .filter(f => f.groupId === "posType")
        .map(f => f.value)
      
      if (posTypeFilters.length > 0 && !posTypeFilters.includes(location.posType)) {
        return false
      }

      return true
    })
  }, [searchQuery, appliedFilters])

  // Define columns
  const columns: ColumnDef<LocationMapping>[] = [
    {
      accessorKey: "locationCode",
      header: "Location Code",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.locationCode}</div>
      ),
    },
    {
      accessorKey: "posLocationName",
      header: "POS Location Name",
      cell: ({ row }) => <div>{row.original.posLocationName}</div>,
    },
    {
      accessorKey: "mappedName",
      header: "Mapped Name",
      cell: ({ row }) => <div>{row.original.mappedName}</div>,
    },
    {
      accessorKey: "posType",
      header: "POS Type",
      cell: ({ row }) => <div>{row.original.posType}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status} />
      ),
    },
    {
      accessorKey: "lastSyncDate",
      header: "Last Sync",
      cell: ({ row }) => (
        <div>
          {row.original.lastSyncDate ? (
            <div className="text-sm">
              <div>{format(row.original.lastSyncDate, "MMM dd, yyyy")}</div>
              <div className="text-muted-foreground">
                {format(row.original.lastSyncDate, "hh:mm a")}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">Never</span>
          )}
        </div>
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
  const getRowClassName = (location: LocationMapping) => {
    if (location.status === "error") {
      return "bg-red-50 dark:bg-red-900/10"
    }
    return ""
  }

  return (
    <div>
      <MappingHeader
        title="Location Mapping"
        addButtonLabel="Add Location"
        searchPlaceholder="Search locations by code or name"
        addRoute="/system-administration/system-integrations/pos/mapping/locations/new"
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