"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Filter, Plus, X, Settings2 } from 'lucide-react'
import { FilterType, FilterOperator } from '@/lib/utils/filter-storage'
import { Role } from '@/lib/types'

type RoleFilter = FilterType<Role> & { id: string }

interface RoleAdvancedFilterProps {
  onApplyFilters: (filters: RoleFilter[]) => void
  onClearFilters: () => void
  activeFiltersCount: number
}

const roleFields = [
  { value: 'name', label: 'Role Name' },
  { value: 'description', label: 'Description' },
  { value: 'hierarchy', label: 'Hierarchy Level' },
  { value: 'isSystem', label: 'System Role' },
  { value: 'permissions', label: 'Permissions Count' },
  { value: 'parentRoles', label: 'Parent Roles Count' },
]

const operators: { value: FilterOperator; label: string }[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'startsWith', label: 'Starts with' },
  { value: 'endsWith', label: 'Ends with' },
  { value: 'greaterThan', label: 'Greater than' },
  { value: 'lessThan', label: 'Less than' },
  { value: 'in', label: 'In' },
  { value: 'isNull', label: 'Is empty' },
  { value: 'isNotNull', label: 'Is not empty' },
]

export function RoleAdvancedFilter({ onApplyFilters, onClearFilters, activeFiltersCount }: RoleAdvancedFilterProps) {
  const [filters, setFilters] = useState<RoleFilter[]>([])
  const [open, setOpen] = useState(false)

  const addFilter = () => {
    const newFilter: RoleFilter = {
      id: Math.random().toString(36).substr(2, 9),
      field: 'name' as keyof Role,
      operator: 'contains',
      value: '',
    }
    setFilters([...filters, newFilter])
  }

  const removeFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id))
  }

  const updateFilter = (id: string, updates: Partial<RoleFilter>) => {
    setFilters(filters.map(f => 
      f.id === id ? { ...f, ...updates } : f
    ))
  }

  const handleApply = () => {
    const validFilters = filters.filter(f => 
      f.value !== '' && f.value !== null && f.value !== undefined
    )
    onApplyFilters(validFilters)
    setOpen(false)
  }

  const handleClear = () => {
    setFilters([])
    onClearFilters()
    setOpen(false)
  }

  const hasActiveFilters = activeFiltersCount > 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={hasActiveFilters ? "border-primary" : ""}>
          <Settings2 className="mr-2 h-4 w-4" />
          Advanced
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Advanced Filters</DialogTitle>
          <DialogDescription>
            Create complex filters to find specific roles.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {filters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No filters added yet. Click "Add Filter" to get started.
            </div>
          ) : (
            filters.map((filter) => (
              <div key={filter.id} className="flex items-center gap-2 p-4 border rounded-lg">
                <div className="grid grid-cols-12 gap-2 flex-1">
                  <div className="col-span-3">
                    <Label className="text-xs text-muted-foreground">Field</Label>
                    <Select
                      value={filter.field as string}
                      onValueChange={(value) => 
                        updateFilter(filter.id, { field: value as keyof Role })
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleFields.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="col-span-3">
                    <Label className="text-xs text-muted-foreground">Operator</Label>
                    <Select
                      value={filter.operator}
                      onValueChange={(value) => 
                        updateFilter(filter.id, { operator: value as FilterOperator })
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {!['isNull', 'isNotNull'].includes(filter.operator) && (
                    <div className="col-span-5">
                      <Label className="text-xs text-muted-foreground">Value</Label>
                      <Input
                        className="h-8"
                        value={filter.value as string}
                        onChange={(e) => 
                          updateFilter(filter.id, { value: e.target.value })
                        }
                        placeholder="Enter value..."
                      />
                    </div>
                  )}
                  
                  {['isNull', 'isNotNull'].includes(filter.operator) && (
                    <div className="col-span-5 flex items-end">
                      <Badge variant="outline" className="h-8 flex items-center">
                        No value required
                      </Badge>
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter(filter.id)}
                  className="h-8 w-8 p-0 shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
          
          <Button
            variant="outline"
            onClick={addFilter}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Filter
          </Button>
        </div>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleClear}>
            Clear All
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}