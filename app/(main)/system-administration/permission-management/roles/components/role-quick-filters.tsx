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
  Crown,
  Shield,
  Briefcase,
  User,
  Settings,
  Users,
  CheckCircle2,
  XCircle
} from "lucide-react"

export interface QuickFilterOption {
  type: 'hierarchy' | 'type' | 'status'
  label: string
  value: string
  icon?: React.ReactNode
}

interface RoleQuickFiltersProps {
  onQuickFilter: (filter: QuickFilterOption) => void
  activeFilter: QuickFilterOption | null
}

export function RoleQuickFilters({ onQuickFilter, activeFilter }: RoleQuickFiltersProps) {
  const hierarchyOptions: QuickFilterOption[] = [
    {
      type: 'hierarchy',
      label: 'All Levels',
      value: 'all-hierarchy',
      icon: <Filter className="h-4 w-4" />
    },
    {
      type: 'hierarchy',
      label: 'Executive',
      value: 'executive',
      icon: <Crown className="h-4 w-4 text-amber-600" />
    },
    {
      type: 'hierarchy',
      label: 'Management',
      value: 'management',
      icon: <Shield className="h-4 w-4 text-blue-600" />
    },
    {
      type: 'hierarchy',
      label: 'Supervisor',
      value: 'supervisor',
      icon: <Briefcase className="h-4 w-4 text-green-600" />
    },
    {
      type: 'hierarchy',
      label: 'Staff',
      value: 'staff',
      icon: <User className="h-4 w-4 text-gray-500" />
    }
  ]

  const typeOptions: QuickFilterOption[] = [
    {
      type: 'type',
      label: 'All Types',
      value: 'all-types',
      icon: <Users className="h-4 w-4" />
    },
    {
      type: 'type',
      label: 'System Roles',
      value: 'system',
      icon: <Settings className="h-4 w-4 text-purple-600" />
    },
    {
      type: 'type',
      label: 'Custom Roles',
      value: 'custom',
      icon: <User className="h-4 w-4 text-orange-600" />
    }
  ]

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
      value: 'active',
      icon: <CheckCircle2 className="h-4 w-4 text-green-600" />
    },
    {
      type: 'status',
      label: 'Inactive',
      value: 'inactive',
      icon: <XCircle className="h-4 w-4 text-gray-500" />
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
          <DropdownMenuLabel>Hierarchy Level</DropdownMenuLabel>
          {hierarchyOptions.map((option) => (
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
          <DropdownMenuLabel>Role Type</DropdownMenuLabel>
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}