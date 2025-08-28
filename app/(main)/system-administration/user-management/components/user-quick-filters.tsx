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
  AlertCircle,
  Clock,
  Users,
  Building2,
  Crown,
  UserCheck
} from "lucide-react"
import { mockRoles, mockDepartments } from '@/lib/mock-data/permission-roles'

export interface QuickFilterOption {
  type: 'status' | 'role' | 'department' | 'hod'
  label: string
  value: string
  icon?: React.ReactNode
}

interface UserQuickFiltersProps {
  onQuickFilter: (filter: QuickFilterOption) => void
  activeFilter: QuickFilterOption | null
}

export function UserQuickFilters({ onQuickFilter, activeFilter }: UserQuickFiltersProps) {
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
    },
    {
      type: 'status',
      label: 'Suspended',
      value: 'suspended',
      icon: <AlertCircle className="h-4 w-4 text-yellow-600" />
    },
    {
      type: 'status',
      label: 'Pending',
      value: 'pending',
      icon: <Clock className="h-4 w-4 text-blue-600" />
    }
  ]

  const roleOptions: QuickFilterOption[] = [
    {
      type: 'role',
      label: 'All Roles',
      value: 'all-roles',
      icon: <Users className="h-4 w-4" />
    },
    ...mockRoles.slice(0, 6).map(role => ({
      type: 'role' as const,
      label: role.name,
      value: role.id,
      icon: <Crown className="h-4 w-4 text-blue-600" />
    }))
  ]

  const departmentOptions: QuickFilterOption[] = [
    {
      type: 'department',
      label: 'All Departments',
      value: 'all-departments',
      icon: <Building2 className="h-4 w-4" />
    },
    ...mockDepartments.slice(0, 6).map(dept => ({
      type: 'department' as const,
      label: dept.name,
      value: dept.id,
      icon: <Building2 className="h-4 w-4 text-orange-600" />
    }))
  ]

  const hodOptions: QuickFilterOption[] = [
    {
      type: 'hod',
      label: 'All Users',
      value: 'all-hod',
      icon: <Users className="h-4 w-4" />
    },
    {
      type: 'hod',
      label: 'HODs Only',
      value: 'hod',
      icon: <UserCheck className="h-4 w-4 text-purple-600" />
    },
    {
      type: 'hod',
      label: 'Non-HODs Only',
      value: 'non-hod',
      icon: <Users className="h-4 w-4 text-gray-500" />
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
          <DropdownMenuLabel>Roles</DropdownMenuLabel>
          {roleOptions.map((option) => (
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
          <DropdownMenuLabel>Departments</DropdownMenuLabel>
          {departmentOptions.map((option) => (
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
          <DropdownMenuLabel>HOD Status</DropdownMenuLabel>
          {hodOptions.map((option) => (
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