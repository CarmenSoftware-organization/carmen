'use client'

import { useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { 
  StatusBadge, 
  RowActions,
} from "../components"
import { LocationMapping } from "./types"
import { locationMappings } from "./data"
import { columns } from "./components/columns"

export default function LocationMappingPage() {
  const columns: ColumnDef<LocationMapping>[] = useMemo(
    () => [
      {
        accessorKey: "locationCode",
        header: "Location Code",
      },
      {
        accessorKey: "posLocationName",
        header: "POS Location Name",
      },
      {
        accessorKey: "mappedName",
        header: "Mapped Name",
      },
      {
        accessorKey: "posType",
        header: "POS Type",
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
          row.original.lastSyncDate 
            ? format(row.original.lastSyncDate, "dd/MM/yyyy HH:mm")
            : "Never"
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <RowActions
            onAction={(action) => console.log(action, row.original)}
            availableActions={["edit", "delete"]}
          />
        ),
      },
    ],
    []
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location Mapping</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <div className="flex gap-2">
            <Button variant="outline">Filter</Button>
          </div>
          <Button>Add Location</Button>
        </div>
        <DataTable
          columns={columns}
          data={locationMappings}
        />
      </CardContent>
    </Card>
  )
} 