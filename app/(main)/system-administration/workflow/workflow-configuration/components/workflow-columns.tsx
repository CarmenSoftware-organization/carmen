"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, FileText, Edit, Trash2, Copy, Eye, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import Link from "next/link"

interface Workflow {
  id: string
  name: string
  type: string
  status: string
  lastModified: string
  description?: string
  createdBy?: string
  stageCount?: number
  activeUsers?: number
}

interface WorkflowColumnsProps {
  onView: (workflow: Workflow) => void
  onEdit: (workflow: Workflow) => void
  onDelete: (workflow: Workflow) => void
  onDuplicate: (workflow: Workflow) => void
}

export const createWorkflowColumns = ({ onView, onEdit, onDelete, onDuplicate }: WorkflowColumnsProps): ColumnDef<Workflow>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Workflow Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const workflow = row.original
      return (
        <div className="space-y-1">
          <div className="font-medium text-foreground">{workflow.name}</div>
          {workflow.description && (
            <div className="text-sm text-muted-foreground line-clamp-2">{workflow.description}</div>
          )}
          <div className="text-xs text-muted-foreground">ID: {workflow.id}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const workflow = row.original
      
      const getTypeBadge = (type: string) => {
        switch (type) {
          case 'Purchase Request':
            return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Purchase Request</Badge>
          case 'Store Requisition':
            return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Store Requisition</Badge>
          case 'Approval Workflow':
            return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Approval</Badge>
          case 'Review Process':
            return <Badge className="bg-green-100 text-green-800 border-green-200">Review</Badge>
          default:
            return <Badge variant="secondary">{type}</Badge>
        }
      }

      return getTypeBadge(workflow.type)
    },
  },
  {
    accessorKey: "stageCount",
    header: "Stages",
    cell: ({ row }) => {
      const workflow = row.original
      
      return (
        <div className="space-y-1">
          <div className="text-sm font-medium">
            {workflow.stageCount || 0} stages
          </div>
          {workflow.activeUsers !== undefined && (
            <div className="text-xs text-muted-foreground">
              {workflow.activeUsers} active users
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const workflow = row.original
      
      const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
          case 'active':
            return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
          case 'inactive':
            return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>
          case 'draft':
            return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Draft</Badge>
          case 'archived':
            return <Badge className="bg-red-100 text-red-800 border-red-200">Archived</Badge>
          default:
            return <Badge variant="secondary">{status}</Badge>
        }
      }

      return getStatusBadge(workflow.status)
    },
  },
  {
    accessorKey: "lastModified",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Last Modified
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const workflow = row.original
      const date = new Date(workflow.lastModified)
      
      return (
        <div className="space-y-1">
          <div className="text-sm">{date.toLocaleDateString()}</div>
          <div className="text-xs text-muted-foreground">{date.toLocaleTimeString()}</div>
          {workflow.createdBy && (
            <div className="text-xs text-muted-foreground">by {workflow.createdBy}</div>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const workflow = row.original

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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(workflow.id)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy workflow ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onView(workflow)}>
              <Eye className="mr-2 h-4 w-4" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(workflow)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit workflow
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(workflow)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/system-administration/workflow/workflow-configuration/${workflow.id}?tab=settings`}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(workflow)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete workflow
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]