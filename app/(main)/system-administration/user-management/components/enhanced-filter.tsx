'use client'

import React, { useState, ChangeEvent } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, Plus, Save, X, Filter, Star, History, Code, Check } from 'lucide-react'
import {
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import {
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import {
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"

// Define types for our filter system
export type FilterOperator = 'equals' | 'contains' | 'notEquals' | 'in' | 'between' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty'
export type LogicalOperator = 'AND' | 'OR'

export interface FilterCondition {
  id: string
  field: string
  operator: FilterOperator
  value: string | string[]
  logicalOperator?: LogicalOperator
}

export interface SavedFilter {
  id: string
  name: string
  conditions: FilterCondition[]
  isDefault?: boolean
  createdAt: string
  updatedAt: string
}

interface EnhancedFilterProps {
  filterConditions: FilterCondition[]
  onFilterChange: (conditions: FilterCondition[]) => void
  savedFilters: SavedFilter[]
  onSaveFilter: (filter: SavedFilter) => void
  onDeleteSavedFilter: (id: string) => void
  onToggleDefaultFilter: (id: string) => void
}

export function EnhancedFilter({
  filterConditions,
  onFilterChange,
  savedFilters,
  onSaveFilter,
  onDeleteSavedFilter,
  onToggleDefaultFilter
}: EnhancedFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('build')
  const [filterName, setFilterName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const filterFields = [
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'businessUnit', label: 'Business Unit' },
    { value: 'department', label: 'Department' },
    { value: 'roles', label: 'Roles' },
    { value: 'hodStatus', label: 'HOD Status' },
    { value: 'inviteStatus', label: 'Invite Status' },
    { value: 'accountStatus', label: 'Account Status' },
    { value: 'lastLogin', label: 'Last Login' },
  ]

  const removeFilter = (id: string) => {
    onFilterChange(filterConditions.filter(condition => condition.id !== id))
  }

  const clearAllFilters = () => {
    onFilterChange([])
  }

  const addFilter = () => {
    const newCondition: FilterCondition = {
      id: Math.random().toString(36).substring(2, 9),
      field: filterFields[0].value,
      operator: 'equals',
      value: '',
      logicalOperator: filterConditions.length > 0 ? 'AND' : undefined
    }
    onFilterChange([...filterConditions, newCondition])
  }

  const handleLogicalOperatorChange = (id: string, value: LogicalOperator) => {
    const newFilters = filterConditions.map(condition => 
      condition.id === id ? { ...condition, logicalOperator: value } : condition
    )
    onFilterChange(newFilters)
  }

  const handleFieldChange = (id: string, value: string) => {
    const newFilters = filterConditions.map(condition => 
      condition.id === id ? { ...condition, field: value } : condition
    )
    onFilterChange(newFilters)
  }

  const handleOperatorChange = (id: string, value: FilterOperator) => {
    const newFilters = filterConditions.map(condition => 
      condition.id === id ? { ...condition, operator: value } : condition
    )
    onFilterChange(newFilters)
  }

  const handleValueChange = (id: string, value: string) => {
    const newFilters = filterConditions.map(condition => 
      condition.id === id ? { ...condition, value } : condition
    )
    onFilterChange(newFilters)
  }

  const handleSaveFilter = () => {
    if (!filterName.trim()) return
    
    const now = new Date().toISOString()
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName,
      conditions: filterConditions,
      isDefault: false,
      createdAt: now,
      updatedAt: now
    }
    
    onSaveFilter(newFilter)
    setFilterName('')
    setShowSaveDialog(false)
  }

  const applyFilter = (filter: SavedFilter) => {
    onFilterChange(filter.conditions)
    setIsOpen(false)
  }

  // Generate a display string for a filter
  const getFilterDisplay = (filter: FilterCondition): string => {
    const field = filterFields?.find(f => f.value === filter.field)?.label || filter.field
    
    let operatorText = ''
    switch (filter.operator) {
      case 'equals': operatorText = 'is'; break
      case 'contains': operatorText = 'contains'; break
      case 'notEquals': operatorText = 'is not'; break
      case 'in': operatorText = 'is one of'; break
      case 'between': operatorText = 'is between'; break
      case 'greaterThan': operatorText = 'is greater than'; break
      case 'lessThan': operatorText = 'is less than'; break
      case 'isEmpty': operatorText = 'is empty'; break
      case 'isNotEmpty': operatorText = 'is not empty'; break
      default: operatorText = filter.operator
    }
    
    let valueText = ''
    if (['isEmpty', 'isNotEmpty'].includes(filter.operator)) {
      valueText = ''
    } else if (Array.isArray(filter.value)) {
      valueText = filter.value.join(', ')
    } else {
      valueText = filter.value
    }
    
    return `${field} ${operatorText}${valueText ? ' ' + valueText : ''}`
  }

  const getJsonView = () => {
    return JSON.stringify({
      conditions: filterConditions.map(filter => ({
        id: filter.id,
        field: filter.field,
        operator: filter.operator,
        value: filter.value,
        logicalOperator: filter.logicalOperator
      }))
    }, null, 2)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="build">Build</TabsTrigger>
                <TabsTrigger value="saved">Saved</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
              </TabsList>
              <div className="p-4">
                <TabsContent value="build" className="mt-0 space-y-4">
                  <div className="space-y-2">
                    {filterConditions.map((condition, index) => (
                      <div key={condition.id} className="flex items-center gap-2">
                        {index > 0 && (
                          <Select
                            value={condition.logicalOperator}
                            onValueChange={(value) => handleLogicalOperatorChange(condition.id, value as LogicalOperator)}
                          >
                            <SelectTrigger className="w-[80px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AND">AND</SelectItem>
                              <SelectItem value="OR">OR</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        <Select
                          value={condition.field}
                          onValueChange={(value) => handleFieldChange(condition.id, value)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {filterFields.map((field) => (
                              <SelectItem key={field.value} value={field.value}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={condition.operator}
                          onValueChange={(value) => handleOperatorChange(condition.id, value as FilterOperator)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">equals</SelectItem>
                            <SelectItem value="contains">contains</SelectItem>
                            <SelectItem value="notEquals">not equals</SelectItem>
                            <SelectItem value="in">in</SelectItem>
                            <SelectItem value="between">between</SelectItem>
                            <SelectItem value="greaterThan">greater than</SelectItem>
                            <SelectItem value="lessThan">less than</SelectItem>
                            <SelectItem value="isEmpty">is empty</SelectItem>
                            <SelectItem value="isNotEmpty">is not empty</SelectItem>
                          </SelectContent>
                        </Select>
                        {!['isEmpty', 'isNotEmpty'].includes(condition.operator) && (
                          <Input
                            className="flex-1"
                            value={Array.isArray(condition.value) ? condition.value.join(', ') : condition.value}
                            onChange={(e) => handleValueChange(condition.id, e.target.value)}
                            placeholder="Value"
                          />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFilter(condition.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={addFilter} variant="outline" size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Filter
                    </Button>
                    {filterConditions.length > 0 && (
                      <>
                        <Button onClick={clearAllFilters} variant="outline" size="sm">
                          Clear All
                        </Button>
                        <Button onClick={() => setShowSaveDialog(true)} variant="outline" size="sm" className="gap-2">
                          <Save className="h-4 w-4" />
                          Save Filter
                        </Button>
                      </>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="saved" className="mt-0">
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {savedFilters.map((filter) => (
                        <div
                          key={filter.id}
                          className="flex items-center justify-between rounded-lg border p-2"
                        >
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onToggleDefaultFilter(filter.id)}
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  filter.isDefault ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                                }`}
                              />
                            </Button>
                            <div>
                              <div className="font-medium">{filter.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {filter.conditions.length} conditions
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => applyFilter(filter)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDeleteSavedFilter(filter.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="json" className="mt-0">
                  <pre className="rounded-lg bg-muted p-4">
                    <code>{getJsonView()}</code>
                  </pre>
                </TabsContent>
              </div>
            </Tabs>
          </PopoverContent>
        </Popover>
        {filterConditions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filterConditions.map((condition, index) => (
              <Badge key={condition.id} variant="secondary" className="gap-2">
                {index > 0 && (
                  <span className="text-muted-foreground">{condition.logicalOperator}</span>
                )}
                {getFilterDisplay(condition)}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeFilter(condition.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={clearAllFilters}
            >
              Clear All
            </Button>
          </div>
        )}
      </div>
      {showSaveDialog && (
        <Sheet open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Save Filter</SheetTitle>
              <SheetDescription>
                Give your filter a name to save it for later use.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="filterName">Filter Name</Label>
                <Input
                  id="filterName"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="Enter filter name"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveFilter}>Save Filter</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
} 