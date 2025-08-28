"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  FileText, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Eye,
  Copy,
  Settings,
  GitBranch,
  Users,
  Calendar,
  Clock
} from "lucide-react"
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

interface WorkflowCardViewProps {
  data: Workflow[]
  selectedItems: string[]
  onSelectItem: (id: string) => void
  onSelectAll: () => void
  onView: (workflow: Workflow) => void
  onEdit: (workflow: Workflow) => void
  onDelete: (workflow: Workflow) => void
  onDuplicate: (workflow: Workflow) => void
}

export function WorkflowCardView({
  data,
  selectedItems,
  onSelectItem,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
  onDuplicate
}: WorkflowCardViewProps) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    }
  }

  return (
    <div className="space-y-4">
      {/* Select All Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={selectedItems.length === data.length && data.length > 0}
          onCheckedChange={onSelectAll}
          aria-label="Select all workflows"
        />
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Select all workflows ({selectedItems.length} of {data.length} selected)
        </label>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((workflow) => {
          const { date, time } = formatDate(workflow.lastModified)
          return (
            <Card key={workflow.id} className="relative hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedItems.includes(workflow.id)}
                      onCheckedChange={() => onSelectItem(workflow.id)}
                      aria-label={`Select ${workflow.name}`}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate">{workflow.name}</h3>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <GitBranch className="h-3 w-3 mr-1" />
                        <span className="truncate">ID: {workflow.id}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
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
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pb-4">
                {/* Description */}
                {workflow.description && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Description</div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{workflow.description}</p>
                  </div>
                )}

                {/* Workflow Type */}
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Type</div>
                  <div className="flex items-center gap-2">
                    {getTypeBadge(workflow.type)}
                  </div>
                </div>

                {/* Stages and Users */}
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Configuration</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center text-sm">
                      <GitBranch className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span>{workflow.stageCount || 0} stages</span>
                    </div>
                    {workflow.activeUsers !== undefined && (
                      <div className="flex items-center text-sm">
                        <Users className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span>{workflow.activeUsers} users</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Last Modified */}
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Last Modified</div>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span>{date}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{time}</span>
                    </div>
                    {workflow.createdBy && (
                      <div className="text-xs text-muted-foreground">
                        by {workflow.createdBy}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {getStatusBadge(workflow.status)}
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => onView(workflow)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(workflow)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No workflows found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  )
}