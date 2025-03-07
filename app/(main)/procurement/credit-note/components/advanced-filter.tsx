"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Plus, Save, X, Filter, Star, Trash2 } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { readSavedFilters, addSavedFilter, deleteSavedFilter, toggleFilterStar, SavedFilter, Filter as BaseFilter } from '@/lib/utils/filter-storage'
import { toast } from 'sonner'

// Define the CreditNote interface based on the API spec
interface CreditNote {
  id: string
  refNumber: string
  date: string
  poId: string
  poRefNumber: string
  grnId?: string
  grnRefNumber?: string
  status: CreditNoteStatus
  type: CreditNoteType
  reason: string
  location: string
  department: string
  vendor: string
  vendorId: number
  requestedBy: {
    id: string
    name: string
    department: string
  }
  approvedBy?: {
    id: string
    name: string
    department: string
  }
  currency: string
  baseCurrencyCode: string
  exchangeRate: number
  totalQuantity: number
  baseSubTotalAmount: number
  subTotalAmount: number
  baseTaxAmount: number
  taxAmount: number
  baseTotalAmount: number
  totalAmount: number
  createdAt: string
  updatedAt: string
}

type CreditNoteStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Cancelled' | 'Completed'
type CreditNoteType = 'Return' | 'Price Adjustment' | 'Quality Issue' | 'Quantity Discrepancy'

// Define our own Filter type to ensure type safety
type FilterFields = typeof filterFields[number]['value']

interface AdvancedFilterProps {
  onApplyFilters: (filters: BaseFilter<CreditNote>[]) => void
  onClearFilters: () => void
}

const filterFields = [
  { value: 'refNumber', label: 'Credit Note #' },
  { value: 'date', label: 'Date' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'status', label: 'Status' },
  { value: 'type', label: 'Type' },
  { value: 'reason', label: 'Reason' },
  { value: 'location', label: 'Location' },
  { value: 'department', label: 'Department' },
  { value: 'totalAmount', label: 'Total Amount' },
  { value: 'currency', label: 'Currency' }
] as const

const operators = [
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'in', label: 'In' },
  { value: 'between', label: 'Between' },
  { value: 'greaterThan', label: 'Greater Than' },
  { value: 'lessThan', label: 'Less Than' }
] as const

const logicalOperators = [
  { value: 'AND', label: 'AND' },
  { value: 'OR', label: 'OR' }
] as const

export function AdvancedFilter({ onApplyFilters, onClearFilters }: AdvancedFilterProps) {
  const [activeFilters, setActiveFilters] = useState<BaseFilter<CreditNote>[]>([])
  const [savedFilters, setSavedFilters] = useState<SavedFilter<CreditNote>[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Load saved filters on component mount
  useEffect(() => {
    const loadFilters = () => {
      try {
        const filters = readSavedFilters<CreditNote>()
        setSavedFilters(filters)
      } catch (error) {
        console.error('Error loading filters:', error)
        toast.error('Failed to load saved filters')
      }
    }
    loadFilters()
  }, [])

  const addFilter = () => {
    setActiveFilters([...activeFilters, { 
      field: 'refNumber', 
      operator: 'equals', 
      value: '',
      logicalOperator: activeFilters.length > 0 ? 'AND' : undefined
    }])
  }

  const removeFilter = (index: number) => {
    setActiveFilters(activeFilters.filter((_, i) => i !== index))
  }

  const updateFilter = (index: number, field: keyof BaseFilter<CreditNote>, value: string) => {
    const newFilters = [...activeFilters]
    const currentFilter = newFilters[index]
    
    if (field === 'value') {
      // Convert value based on field type
      if (currentFilter.field === 'totalAmount') {
        newFilters[index] = { 
          ...currentFilter, 
          value: Number(value) || 0 
        }
      } else {
        newFilters[index] = { 
          ...currentFilter, 
          value: value
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

    try {
      const newSavedFilter: SavedFilter<CreditNote> = {
        id: Date.now(),
        name,
        isStarred: false,
        filters: activeFilters
      }
      
      addSavedFilter(newSavedFilter)
      setSavedFilters([...savedFilters, newSavedFilter])
      toast.success('Filter saved successfully')
    } catch (error) {
      console.error('Error saving filter:', error)
      toast.error('Failed to save filter')
    }
  }

  const applyFilter = (filter: SavedFilter<CreditNote>) => {
    setActiveFilters(filter.filters)
    onApplyFilters(filter.filters)
  }

  const handleDeleteSavedFilter = (id: number) => {
    try {
      deleteSavedFilter<CreditNote>(id)
      setSavedFilters(savedFilters.filter(f => f.id !== id))
      toast.success('Filter deleted successfully')
    } catch (error) {
      console.error('Error deleting filter:', error)
      toast.error('Failed to delete filter')
    }
  }

  const handleToggleStar = (id: number) => {
    try {
      toggleFilterStar<CreditNote>(id)
      setSavedFilters(savedFilters.map(f => 
        f.id === id ? { ...f, isStarred: !f.isStarred } : f
      ))
    } catch (error) {
      console.error('Error toggling star:', error)
      toast.error('Failed to update filter')
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Advanced Filter
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[500px] sm:w-[720px] md:w-[900px]">
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
                  <div key={index} className="space-y-3">
                    {index > 0 && (
                      <div className="flex items-center gap-2 px-4">
                        <div className="h-px flex-1 bg-border" />
                        <Select
                          value={filter.logicalOperator || ''}
                          onValueChange={(value: string) => updateFilter(index, 'logicalOperator', value as 'AND' | 'OR')}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {logicalOperators.map(op => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                    )}
                    <div className="flex items-start gap-3 p-4 border rounded-lg">
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-12 gap-3">
                          <div className="col-span-5">
                            <Select
                              value={String(filter.field)}
                              onValueChange={(value: string) => updateFilter(index, 'field', value as keyof CreditNote)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select field" />
                              </SelectTrigger>
                              <SelectContent>
                                {filterFields.map(field => (
                                  <SelectItem key={String(field.value)} value={String(field.value)}>
                                    {field.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="col-span-3">
                            <Select
                              value={String(filter.operator)}
                              onValueChange={(value: string) => updateFilter(index, 'operator', value as BaseFilter<CreditNote>['operator'])}
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
                              value={filter.value?.toString() || ''}
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
                              onClick={() => handleToggleStar(filter.id)}
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
                              onClick={() => handleDeleteSavedFilter(filter.id)}
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