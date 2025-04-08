'use client'

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { MappingItem } from "../store/mapping-store"

// Type for the handler function passed into the columns definition
type EditHandler = (item: MappingItem) => void;

// Define the columns, accepting the edit handler
export const columns = (onEdit: EditHandler): ColumnDef<MappingItem>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Item Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "lastSale",
    header: "Last Sale",
    cell: ({ row }) => {
      const date = row.getValue("lastSale")
      return date ? format(new Date(date as string), "PP") : "N/A"
    },
  },
  {
    accessorKey: "saleFrequency",
    header: "Sale Frequency",
    cell: ({ row }) => {
      const frequency = row.getValue("saleFrequency") as string
      let variant: "default" | "secondary" | "outline" | "destructive" | null | undefined = "secondary";
      switch (frequency) {
        case "High": variant = "default"; break;
        case "Medium": variant = "secondary"; break;
        case "Low": variant = "outline"; break;
        // Add more cases if needed
      }
      return <Badge variant={variant}>{frequency}</Badge>
    },
  },
  {
    accessorKey: "lastUpdated",
    header: "Last Updated",
    cell: ({ row }) => {
      const date = row.getValue("lastUpdated")
      return date ? format(new Date(date as string), "PPpp") : "-"
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original
      return (
        <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit Mapping</span>
        </Button>
      )
    },
  },
]