"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  GitBranch,
  Users,
  Calendar,
  Pause
} from "lucide-react"

export interface QuickFilterOption {
  type: 'status' | 'type' | 'recent'
  label: string
  value: string
  icon?: React.ReactNode
}

interface WorkflowQuickFiltersProps {
  onQuickFilter: (filter: QuickFilterOption) => void
  activeFilter: QuickFilterOption | null
}

export function WorkflowQuickFilters({ onQuickFilter, activeFilter }: WorkflowQuickFiltersProps) {
  const statusOptions: QuickFilterOption[] = [
    {
      type: 'status',
      label: 'All Status',
      value: 'all-status',
      icon: <Filter className="h-4 w-4" />
    },
    {
      type: 'status',
      label: 'Active',
      value: 'Active',
      icon: <CheckCircle2 className="h-4 w-4 text-green-600" />
    },
    {
      type: 'status',
      label: 'Inactive',
      value: 'Inactive',
      icon: <Pause className="h-4 w-4 text-gray-500" />
    },
    {
      type: 'status',
      label: 'Draft',
      value: 'Draft',
      icon: <Clock className="h-4 w-4 text-yellow-600" />
    },
    {
      type: 'status',
      label: 'Archived',
      value: 'Archived',
      icon: <XCircle className="h-4 w-4 text-red-500" />
    }
  ]

  const typeOptions: QuickFilterOption[] = [
    {
      type: 'type',
      label: 'All Types',
      value: 'all-types',
      icon: <GitBranch className="h-4 w-4" />
    },
    {
      type: 'type',
      label: 'Purchase Request',
      value: 'Purchase Request',
      icon: <FileText className="h-4 w-4 text-blue-600" />
    },
    {
      type: 'type',
      label: 'Store Requisition',
      value: 'Store Requisition',
      icon: <FileText className="h-4 w-4 text-purple-600" />
    },
    {
      type: 'type',
      label: 'Approval Workflow',
      value: 'Approval Workflow',
      icon: <Users className="h-4 w-4 text-orange-600" />
    },
    {
      type: 'type',
      label: 'Review Process',
      value: 'Review Process',
      icon: <CheckCircle2 className="h-4 w-4 text-green-600" />
    }
  ]

  const recentOptions: QuickFilterOption[] = [
    {
      type: 'recent',
      label: 'All Periods',
      value: 'all-recent',
      icon: <Calendar className="h-4 w-4" />
    },
    {
      type: 'recent',
      label: 'Last Week',
      value: 'last-week',
      icon: <Calendar className="h-4 w-4 text-blue-600" />
    },
    {
      type: 'recent',
      label: 'Last Month',
      value: 'last-month',
      icon: <Calendar className="h-4 w-4 text-purple-600" />
    },
    {
      type: 'recent',
      label: 'Last Quarter',
      value: 'last-quarter',
      icon: <Calendar className="h-4 w-4 text-orange-600" />
    }
  ]

  const handleFilterSelect = (option: QuickFilterOption) => {
    onQuickFilter(option)
  }

  const getActiveFilterLabel = () => {
    if (!activeFilter) return 'Quick Filters'
    return activeFilter.label
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="border-dashed">
          <Filter className="mr-2 h-4 w-4" />
          {getActiveFilterLabel()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          {statusOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleFilterSelect(option)}
              className={activeFilter?.value === option.value ? "bg-accent" : ""}
            >
              <div className="flex items-center gap-2">
                {option.icon}
                <span>{option.label}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuLabel>Workflow Type</DropdownMenuLabel>
          {typeOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleFilterSelect(option)}
              className={activeFilter?.value === option.value ? "bg-accent" : ""}
            >
              <div className="flex items-center gap-2">
                {option.icon}
                <span className="truncate">{option.label}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuLabel>Recently Modified</DropdownMenuLabel>
          {recentOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleFilterSelect(option)}
              className={activeFilter?.value === option.value ? "bg-accent" : ""}
            >
              <div className="flex items-center gap-2">
                {option.icon}
                <span>{option.label}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}