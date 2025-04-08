'use client'

import React, { useState, useEffect } from 'react'
import { Plus, X, Filter, Star, Search, Save, ChevronDown, History, Code } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { FilterType, SavedFilter, FilterOperator, LogicalOperator, saveFilter, deleteFilter, getSavedFilters } from '@/lib/utils/filter-storage'
import { Vendor } from '../[id]/types'

interface AdvancedFilterProps {
  onFilterChange: (filters: FilterType<Vendor>[]) => void
}

const filterFields = [
  { value: 'companyName', label: 'Company Name' },
  { value: 'businessRegistrationNumber', label: 'Registration No.' },
  { value: 'taxId', label: 'Tax ID' },
  { value: 'businessTypeId', label: 'Business Type' },
  { value: 'addresses.addressLine', label: 'Address' },
  { value: 'contacts.name', label: 'Contact Name' },
  { value: 'contacts.phone', label: 'Contact Phone' },
  { value: 'rating', label: 'Rating' },
  { value: 'isActive', label: 'Status' }
] as const

export function AdvancedFilter({ onFilterChange }: AdvancedFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('build')
  const [activeFilters, setActiveFilters] = useState<FilterType<Vendor>[]>([])
  const [savedFilters, setSavedFilters] = useState<SavedFilter<Vendor>[]>([])

  useEffect(() => {
    const filters = getSavedFilters<Vendor>('vendor-management')
    setSavedFilters(filters)
  }, [])

  const removeFilter = (index: number) => {
    const newFilters = activeFilters.filter((_, i) => i !== index)
    setActiveFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearAllFilters = () => {
    setActiveFilters([])
    onFilterChange([])
  }

  const addFilter = () => {
    const newFilter: FilterType<Vendor> = {
      field: 'companyName',
      operator: 'equals',
      value: ''
    }
    setActiveFilters([...activeFilters, newFilter])
  }

  const handleLogicalOperatorChange = (index: number, value: LogicalOperator) => {
    const newFilters = [...activeFilters]
    if (newFilters[index]) {
      newFilters[index] = {
        ...newFilters[index],
        logicalOperator: value
      }
      setActiveFilters(newFilters)
      onFilterChange(newFilters)
    }
  }

  const handleFieldChange = (index: number, value: keyof Vendor | string) => {
    const newFilters = [...activeFilters]
    if (newFilters[index]) {
      newFilters[index] = { ...newFilters[index], field: value }
      setActiveFilters(newFilters)
      onFilterChange(newFilters)
    }
  }

  const handleOperatorChange = (index: number, value: FilterOperator) => {
    const newFilters = [...activeFilters]
    if (newFilters[index]) {
      newFilters[index] = { ...newFilters[index], operator: value }
      setActiveFilters(newFilters)
      onFilterChange(newFilters)
    }
  }

  const handleValueChange = (index: number, value: string) => {
    const newFilters = [...activeFilters]
    if (newFilters[index]) {
      newFilters[index] = { ...newFilters[index], value }
      setActiveFilters(newFilters)
      onFilterChange(newFilters)
    }
  }

  const handleSaveFilter = async () => {
    const name = prompt('Enter a name for this filter:')
    if (!name) return

    try {
      const now = new Date().toISOString()
      const newFilter: SavedFilter<Vendor> = {
        id: Date.now().toString(),
        name,
        filters: activeFilters,
        createdAt: now,
        updatedAt: now,
        isDefault: false
      }
      
      await saveFilter('vendor-management', newFilter)
      setSavedFilters([...savedFilters, newFilter])
      
      toast.success("Filter saved", {
        description: "Your filter has been saved successfully."
      })
    } catch (error) {
      toast.error("Error saving filter", {
        description: "There was a problem saving your filter."
      })
    }
  }

  const handleToggleStar = (filter: SavedFilter<Vendor>) => {
    const updatedFilters = savedFilters.map(f => 
      f.id === filter.id ? { ...f, isDefault: !f.isDefault } : f
    )
    setSavedFilters(updatedFilters)
    if (filter.isDefault) {
      deleteFilter('vendor-management', filter.id)
    } else {
      saveFilter('vendor-management', { ...filter, isDefault: true })
    }
  }

  const handleDeleteSavedFilter = async (filterId: string) => {
    try {
      await deleteFilter(filterId, 'vendor-management')
      setSavedFilters(savedFilters.filter(f => f.id !== filterId))
      toast.success("Filter deleted", {
        description: "Your filter has been deleted successfully."
      })
    } catch (error) {
      toast.error("Error deleting filter", {
        description: "There was a problem deleting your filter."
      })
    }
  }

  const applyFilter = (filter: SavedFilter<Vendor>) => {
    setActiveFilters(filter.filters)
    onFilterChange(filter.filters)
    setIsOpen(false)
  }

  const getFilterDisplay = (filter: FilterType<Vendor>): string => {
    const field = filterFields?.find(f => f.value === filter.field)?.label || filter.field
    
    let operatorText = ''
    switch (filter.operator) {
      case 'equals': operatorText = 'is'; break
      case 'contains': operatorText = 'contains'; break
      case 'in': operatorText = 'is one of'; break
      case 'between': operatorText = 'is between'; break
      case 'greaterThan': operatorText = 'is greater than'; break
      case 'lessThan': operatorText = 'is less than'; break
      default: operatorText = filter.operator
    }
    
    let valueText = ''
    if (Array.isArray(filter.value)) {
      valueText = filter.value.join(', ')
    } else {
      valueText = filter.value
    }
    
    return `${field} ${operatorText} ${valueText}`
  }

  const getJsonView = () => {
    return JSON.stringify({
      conditions: activeFilters.map(filter => ({
        field: filter.field,
        operator: filter.operator,
        value: filter.value
      })),
      logicalOperator: "AND"
    }, null, 2)
  }

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-8 px-2 lg:px-3">
            <span>Saved Filters</span>
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <div className="space-y-2">
            <h3 className="font-medium">Saved Filters</h3>
            <div className="space-y-1">
              {savedFilters.length === 0 && (
                <p className="text-sm text-muted-foreground">No saved filters yet</p>
              )}
              {savedFilters.map(filter => (
                <div key={filter.id} className="flex items-center justify-between">
                  <button
                    className="flex items-center gap-2 text-sm hover:text-primary"
                    onClick={() => applyFilter(filter)}
                  >
                    {filter.name}
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      className={`text-${filter.isDefault ? 'yellow' : 'gray'}-500 hover:text-yellow-600`}
                      onClick={() => handleToggleStar(filter)}
                    >
                      <Star className="h-4 w-4" />
                    </button>
                    <button
                      className="text-gray-500 hover:text-red-600"
                      onClick={() => handleDeleteSavedFilter(filter.id)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="h-8 px-2 lg:px-3">
            <Filter className="mr-2 h-4 w-4" />
            Advanced Filter
            {activeFilters.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilters.length}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Advanced Filter</SheetTitle>
            <SheetDescription>
              Build complex filters to find exactly what you're looking for.
            </SheetDescription>
          </SheetHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="build">
                <Filter className="mr-2 h-4 w-4" />
                Build
              </TabsTrigger>
              <TabsTrigger value="code">
                <Code className="mr-2 h-4 w-4" />
                JSON
              </TabsTrigger>
            </TabsList>

            <TabsContent value="build" className="mt-4 space-y-4">
              <div className="space-y-4">
                {activeFilters.map((filter, index) => (
                  <div key={index} className="flex items-start gap-2">
                    {index > 0 && (
                      <Select
                        value={filter.logicalOperator || 'AND'}
                        onValueChange={(value) => handleLogicalOperatorChange(index, value as LogicalOperator)}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AND">AND</SelectItem>
                          <SelectItem value="OR">OR</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <Select
                          value={filter.field}
                          onValueChange={(value) => handleFieldChange(index, value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {filterFields.map(field => (
                              <SelectItem key={field.value} value={field.value}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={filter.operator}
                          onValueChange={(value) => handleOperatorChange(index, value as FilterOperator)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                            <SelectItem value="startsWith">Starts with</SelectItem>
                            <SelectItem value="endsWith">Ends with</SelectItem>
                            <SelectItem value="greaterThan">Greater than</SelectItem>
                            <SelectItem value="lessThan">Less than</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFilter(index)}
                          className="h-10 w-10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Value"
                        value={filter.value}
                        onChange={(e) => handleValueChange(index, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button onClick={addFilter} variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Filter
                </Button>
                {activeFilters.length > 0 && (
                  <>
                    <Button onClick={handleSaveFilter} variant="outline">
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    <Button onClick={clearAllFilters} variant="outline">
                      <X className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                  </>
                )}
              </div>

              {activeFilters.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Active Filters</h4>
                  <ScrollArea className="h-[100px] rounded-md border p-2">
                    <div className="space-y-2">
                      {activeFilters.map((filter, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          {index > 0 && (
                            <Badge variant="outline">
                              {filter.logicalOperator || 'AND'}
                            </Badge>
                          )}
                          <span>{getFilterDisplay(filter)}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </TabsContent>

            <TabsContent value="code" className="mt-4">
              <div className="rounded-md bg-muted p-4">
                <pre className="text-sm">{getJsonView()}</pre>
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  )
} 