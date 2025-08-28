
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Policy } from "@/types/abac"

export const getPolicyColumns = (onEdit: (policy: Policy) => void, onDelete: (policyId: string) => void): ColumnDef<Policy>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => <div className="hidden md:table-cell text-sm text-muted-foreground">{row.original.description}</div>,
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => <div>{row.original.priority}</div>,
  },
  {
    accessorKey: "effect",
    header: "Effect",
    cell: ({ row }) => (
      <Badge variant={row.original.effect === 'permit' ? 'default' : 'destructive'}>
        {row.original.effect.charAt(0).toUpperCase() + row.original.effect.slice(1)}
      </Badge>
    ),
  },
  {
    accessorKey: "enabled",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.enabled ? 'outline_green' : 'outline_red'}>
        {row.original.enabled ? "Enabled" : "Disabled"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const policy = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(policy)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(policy.id)} className="text-red-600">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
