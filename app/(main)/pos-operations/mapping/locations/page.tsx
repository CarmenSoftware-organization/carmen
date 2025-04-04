"use client"

import { useState, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./components/columns"

import { 
  MappingHeader, 
  FilterBar, 
  StatusBadge, 
  RowActions,
  FilterGroup,
  AppliedFilter,
  ActionType,
} from "../components"

import { LocationMapping } from "./types"
import { locationMappings, posTypes } from "./data"

const data = [
  {
    id: "1",
    posCode: "MAIN",
    posName: "Main Kitchen",
    location: "Main Kitchen",
    type: "Kitchen",
    status: "mapped",
    lastUpdated: "2024-03-08",
  },
  {
    id: "2",
    posCode: "BAR1",
    posName: "Main Bar",
    location: "Bar Storage",
    type: "Bar",
    status: "mapped",
    lastUpdated: "2024-03-08",
  },
]

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
    <div className="flex-1 space-y-4 px-2 py-4 md:px-4 md:py-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Location Mapping</h2>
        <div className="flex items-center space-x-2">
          <Button>Map New Location</Button>
          <Button variant="secondary">Export</Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mapped Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unmapped Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Last Sync
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5m ago</div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Location Mappings</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredData} />
        </CardContent>
      </Card>
    </div>
  )
} 