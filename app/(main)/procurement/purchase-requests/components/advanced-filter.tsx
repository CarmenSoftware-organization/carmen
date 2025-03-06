"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CardContent } from "@/components/ui/card"
import { CardFooter } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ChevronDown, Plus, Save, X, Filter, Share2, Star, History, Code, Trash2 } from 'lucide-react'
import { DocumentStatus, PRType, WorkflowStatus } from '@/lib/types'
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PurchaseRequest {
  id: string
  type: string
  description: string
  requestor: string
  department: string
  date: string
  status: string
  amount: number
  currentStage: string
}

type FilterField = keyof PurchaseRequest
type FilterOperator = 'equals' | 'contains' | 'in' | 'between' | 'greaterThan' | 'lessThan'
type FilterValue = 
  | string 
  | number 
  | string[] // For 'in' operator with string values
  | number[] // For 'in' operator with number values
  | [number, number] // For 'between' operator

interface Filter {
  field: FilterField
  operator: FilterOperator
  value: FilterValue
}

interface SavedFilter {
  id: number
  name: string
  isStarred: boolean
  filters: Filter[]
}

interface AdvancedFilterProps {
  onApplyFilters: (filters: Filter[]) => void
  onClearFilters: () => void
}

const filterFields: { value: FilterField; label: string }[] = [
  { value: 'id', label: 'PR Number' },
  { value: 'type', label: 'Type' },
  { value: 'status', label: 'Status' },
  { value: 'department', label: 'Department' },
  { value: 'requestor', label: 'Requestor' },
  { value: 'date', label: 'Date' },
  { value: 'amount', label: 'Amount' }
]

const operators: { value: FilterOperator; label: string }[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'in', label: 'In' },
  { value: 'between', label: 'Between' },
  { value: 'greaterThan', label: 'Greater Than' },
  { value: 'lessThan', label: 'Less Than' }
]

export function AdvancedFilter({ onApplyFilters, onClearFilters }: AdvancedFilterProps) {
  const [activeFilters, setActiveFilters] = useState<Filter[]>([])
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const addFilter = () => {
    setActiveFilters([...activeFilters, { 
      field: 'id', 
      operator: 'equals', 
      value: '' as string 
    }])
  }

  const removeFilter = (index: number) => {
    setActiveFilters(activeFilters.filter((_, i) => i !== index))
  }

  const updateFilter = (index: number, field: keyof Filter, value: any) => {
    const newFilters = [...activeFilters]
    const currentFilter = newFilters[index]
    
    if (field === 'value') {
      // Convert value based on field type
      const fieldType = currentFilter.field
      if (fieldType === 'amount') {
        newFilters[index] = { 
          ...currentFilter, 
          value: Number(value) || 0 
        }
      } else if (fieldType === 'date') {
        newFilters[index] = { 
          ...currentFilter, 
          value: value as string 
        }
      } else {
        newFilters[index] = { 
          ...currentFilter, 
          value: value as string 
        }
      }
    } else {
      newFilters[index] = { ...currentFilter, [field]: value }
    }
    
    setActiveFilters(newFilters)
  }

  const saveFilter = () => {
    const name = prompt('Enter a name for this filter:')
    if (!name) return

    const newSavedFilter: SavedFilter = {
      id: Date.now(),
      name,
      isStarred: false,
      filters: activeFilters
    }
    setSavedFilters([...savedFilters, newSavedFilter])
  }

  const applyFilter = (filter: SavedFilter) => {
    setActiveFilters(filter.filters)
    onApplyFilters(filter.filters)
  }

  const toggleStar = (id: number) => {
    setSavedFilters(savedFilters.map(f => 
      f.id === id ? { ...f, isStarred: !f.isStarred } : f
    ))
  }

  const deleteSavedFilter = (id: number) => {
    setSavedFilters(savedFilters.filter(f => f.id !== id))
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Advanced Filter
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Advanced Filters</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Button variant="outline" onClick={addFilter} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Filter
                  </Button>
                  <Button variant="outline" onClick={saveFilter}>
                    Save Filter
                  </Button>
                </div>

                {activeFilters.map((filter, index) => (
                  <div key={index} className="flex items-start gap-2 p-4 border rounded-lg">
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-5">
                          <Select
                            value={filter.field}
                            onValueChange={(value) => updateFilter(index, 'field', value as FilterField)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              {filterFields.map(field => (
                                <SelectItem key={field.value} value={field.value}>
                                  {field.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="col-span-3">
                          <Select
                            value={filter.operator}
                            onValueChange={(value) => updateFilter(index, 'operator', value as FilterOperator)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Operator" />
                            </SelectTrigger>
                            <SelectContent>
                              {operators.map(op => (
                                <SelectItem key={op.value} value={op.value}>
                                  {op.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="col-span-4">
                          <Input 
                            placeholder="Value" 
                            value={filter.value as string}
                            onChange={(e) => updateFilter(index, 'value', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFilter(index)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {savedFilters.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2">Saved Filters</h3>
                    <div className="space-y-2">
                      {savedFilters.map(filter => (
                        <div key={filter.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleStar(filter.id)}
                              className="h-6 w-6"
                            >
                              <Star className={`h-4 w-4 ${filter.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            </Button>
                            <span className="text-sm">{filter.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => applyFilter(filter)}
                              className="h-6 w-6"
                            >
                              <Filter className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteSavedFilter(filter.id)}
                              className="h-6 w-6"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={onClearFilters}>
              Clear All
            </Button>
            <Button onClick={() => {
              onApplyFilters(activeFilters)
              setIsOpen(false)
            }}>
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 