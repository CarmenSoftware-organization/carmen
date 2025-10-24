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
import { LocationEditDrawer } from "../components/location-edit-drawer"
import { DeleteConfirmationDialog } from "../components/delete-confirmation-dialog"
import { MappingHistoryDrawer } from "../components/mapping-history-drawer"

export default function LocationMappingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilter[]>([])
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<LocationMapping | null>(null)
  
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
    setSelectedLocation(location)

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
  const handleSaveMapping = (updatedMapping: Partial<LocationMapping>) => {
    console.log("Saving updated mapping:", updatedMapping)
    // TODO: Implement actual save logic with API call
  }

  // Handle delete mapping
  const handleDeleteMapping = (deleteType: "soft" | "hard", reason?: string) => {
    console.log(`Deleting mapping (${deleteType}):`, selectedLocation?.id, "Reason:", reason)
    // TODO: Implement actual delete logic with API call
  }

  // Filter data based on search query and applied filters
  const filteredData = useMemo(() => {
    return locationMappings.filter(location => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (
          !location.posLocationCode?.toLowerCase().includes(query) &&
          !location.posLocationName.toLowerCase().includes(query) &&
          !location.carmenLocationName.toLowerCase().includes(query)
        ) {
          return false
        }
      }

      // Apply status filters - using isActive instead of status
      const statusFilters = appliedFilters
        .filter(f => f.groupId === "status")
        .map(f => f.value)

      if (statusFilters.length > 0) {
        const statusValue = location.isActive ? "active" : "inactive"
        if (!statusFilters.includes(statusValue)) {
          return false
        }
      }

      // Apply POS type filters - using carmenLocationType
      const posTypeFilters = appliedFilters
        .filter(f => f.groupId === "posType")
        .map(f => f.value)

      if (posTypeFilters.length > 0 && !posTypeFilters.includes(location.carmenLocationType)) {
        return false
      }

      return true
    })
  }, [searchQuery, appliedFilters])

  // Define columns
  const columns: ColumnDef<LocationMapping>[] = [
    {
      accessorKey: "posLocationCode",
      header: "Location Code",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.posLocationCode || row.original.posLocationId}</div>
      ),
    },
    {
      accessorKey: "posLocationName",
      header: "POS Location Name",
      cell: ({ row }) => <div>{row.original.posLocationName}</div>,
    },
    {
      accessorKey: "carmenLocationName",
      header: "Mapped Name",
      cell: ({ row }) => <div>{row.original.carmenLocationName}</div>,
    },
    {
      accessorKey: "carmenLocationType",
      header: "POS Type",
      cell: ({ row }) => <div>{row.original.carmenLocationType}</div>,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.isActive ? "active" : "inactive"} />
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
    if (!location.isActive || !location.syncEnabled) {
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

      <LocationEditDrawer
        open={editDrawerOpen}
        onOpenChange={setEditDrawerOpen}
        mapping={selectedLocation}
        onSave={handleSaveMapping}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        mapping={selectedLocation}
        mappingType="location"
        onConfirm={handleDeleteMapping}
      />

      <MappingHistoryDrawer
        open={historyDrawerOpen}
        onOpenChange={setHistoryDrawerOpen}
        mappingId={selectedLocation?.id || ""}
        mappingType="location"
        mappingName={selectedLocation?.posLocationName || ""}
      />
    </div>
  )
} 