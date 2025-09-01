"use client"

import { useState, useEffect } from 'react'
import { Plus, X, Filter, Star, Save, ChevronDown, History, Code } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from '@/components/ui/use-toast'
import { FilterType, SavedFilter, saveFilter, getSavedFilters, deleteFilter } from '@/lib/utils/filter-storage'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { PurchaseOrder } from '@/lib/types'

type FilterOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'in' | 'notIn' | 'isNull' | 'isNotNull'
type LogicalOperator = 'AND' | 'OR'

interface POAdvancedFilterProps {
  onApplyFilters: (filters: FilterType<PurchaseOrder>[]) => void
  onClearFilters: () => void
  activeFiltersCount: number
}

const filterFields = [
  { value: 'poId', label: 'PO Number' },
  { value: 'orderDate', label: 'Order Date' },
  { value: 'status', label: 'Status' },
  { value: 'vendorName', label: 'Vendor' },
  { value: 'currencyCode', label: 'Currency' },
  { value: 'DeliveryDate', label: 'Delivery Date' },
  { value: 'createdBy', label: 'Created By' },
  { value: 'buyer', label: 'Buyer' },
  { value: 'creditTerms', label: 'Credit Terms' },
  { value: 'description', label: 'Description' }
]

export function POAdvancedFilter({ onApplyFilters, onClearFilters, activeFiltersCount }: POAdvancedFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('build')
  const [activeFilters, setActiveFilters] = useState<FilterType<PurchaseOrder>[]>([])
  const [savedFilters, setSavedFilters] = useState<SavedFilter<PurchaseOrder>[]>([])

  // Load saved filters on mount
  useEffect(() => {
    loadSavedFilters()
  }, [])

  const loadSavedFilters = () => {
    try {
      const filters = getSavedFilters<PurchaseOrder>()
      setSavedFilters(filters)
    } catch (error) {
      toast({
        title: "Error loading filters",
        description: "There was a problem loading your saved filters.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteSavedFilter = async (filterId: string) => {
    try {
      await deleteFilter<PurchaseOrder>(filterId)
      setSavedFilters(savedFilters.filter(f => f.id !== filterId))
      toast({
        title: "Filter deleted",
        description: "Your filter has been deleted successfully."
      })
    } catch (error) {
      toast({
        title: "Error deleting filter",
        description: "There was a problem deleting your filter.",
        variant: "destructive"
      })
    }
  }

  const handleToggleStar = async (filter: SavedFilter<PurchaseOrder>) => {
    try {
      const updatedFilter = await saveFilter<PurchaseOrder>({
        ...filter,
        isDefault: !filter.isDefault
      })
      setSavedFilters(savedFilters.map(f => 
        f.id === filter.id ? { ...f, isDefault: !f.isDefault } : f
      ))
    } catch (error) {
      toast({
        title: "Error updating filter",
        description: "There was a problem updating your filter.",
        variant: "destructive"
      })
    }
  }

  const applyFilter = (filter: SavedFilter<PurchaseOrder>) => {
    onApplyFilters(filter.filters)
    setIsOpen(false)
  }

  const addFilter = () => {
    setActiveFilters([...activeFilters, {
      field: 'poId' as keyof PurchaseOrder,
      operator: 'equals',
      value: '',
    }])
  }

  const removeFilter = (index: number) => {
    setActiveFilters(activeFilters.filter((_, i) => i !== index))
  }

  const handleLogicalOperatorChange = (index: number, value: LogicalOperator) => {
    const newFilters = [...activeFilters]
    if (newFilters[index]) {
      newFilters[index] = {
        ...newFilters[index],
        logicalOperator: value
      }
      setActiveFilters(newFilters)
    }
  }

  const handleFieldChange = (index: number, value: keyof PurchaseOrder) => {
    const newFilters = [...activeFilters]
    if (newFilters[index]) {
      newFilters[index] = { ...newFilters[index], field: value }
      setActiveFilters(newFilters)
    }
  }

  const handleOperatorChange = (index: number, value: FilterOperator) => {
    const newFilters = [...activeFilters]
    if (newFilters[index]) {
      newFilters[index] = { ...newFilters[index], operator: value }
      setActiveFilters(newFilters)
    }
  }

  const handleValueChange = (index: number, value: string) => {
    const newFilters = [...activeFilters]
    if (newFilters[index]) {
      newFilters[index] = { ...newFilters[index], value }
      setActiveFilters(newFilters)
    }
  }

  const handleSaveFilter = async () => {
    const name = prompt('Enter a name for this filter:')
    if (!name) return

    try {
      const now = new Date().toISOString()
      const newFilter: SavedFilter<PurchaseOrder> = {
        id: Date.now().toString(),
        name,
        filters: activeFilters,
        createdAt: now,
        updatedAt: now,
        isDefault: false
      }
      
      await saveFilter(newFilter)
      setSavedFilters([...savedFilters, newFilter])
      
      toast({
        title: "Filter saved",
        description: "Your filter has been saved successfully."
      })
    } catch (error) {
      toast({
        title: "Error saving filter",
        description: "There was a problem saving your filter.",
        variant: "destructive"
      })
    }
  }

  const handleApplyFilters = () => {
    onApplyFilters(activeFilters)
    setIsOpen(false)
  }

  // Generate a display string for a filter
  const getFilterDisplay = (filter: FilterType<PurchaseOrder>): string => {
    const field = filterFields?.find(f => f.value === filter.field)?.label || String(filter.field)
    
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
      valueText = String(filter.value)
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
    <div className="flex items-center space-x-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
            <span>Saved Filters</span>
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <div className="space-y-2">
            <h3 className="font-medium">Saved Filters</h3>
            <div className="space-y-1">
              {savedFilters.length === 0 && (
                <p className="text-xs text-muted-foreground">No saved filters yet</p>
              )}
              {savedFilters.map((filter) => (
                <div key={filter.id} className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-gray-100">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleStar(filter)}
                      className="h-6 w-6"
                    >
                      <Star className={`h-3 w-3 ${filter.isDefault ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </Button>
                    <span className="text-xs">{filter.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => applyFilter(filter)}
                      className="h-6 w-6"
                    >
                      <Filter className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSavedFilter(filter.id)}
                      className="h-6 w-6"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className={`h-8 px-2 text-xs ${activeFiltersCount > 0 ? 'bg-primary/10 border-primary/20' : ''}`}
          >
            <Filter className="mr-1 h-3 w-3" />
            <span>Filter</span>
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Advanced Filter</SheetTitle>
            <SheetDescription>
              Create complex filters to find exactly what you need.
            </SheetDescription>
          </SheetHeader>
          
          <Tabs defaultValue="build" className="mt-4" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="build">Build</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
            </TabsList>
            
            <TabsContent value="build" className="space-y-4 py-4">
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {activeFilters.map((filter, index) => (
                    <div key={index} className="space-y-2">
                      {index > 0 && (
                        <Select
                          value={filter.logicalOperator || 'AND'}
                          onValueChange={(value) => handleLogicalOperatorChange(index, value as LogicalOperator)}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AND">AND</SelectItem>
                            <SelectItem value="OR">OR</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-5">
                          <Select
                            value={String(filter.field)}
                            onValueChange={(value) => handleFieldChange(index, value as keyof PurchaseOrder)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              {filterFields.map((field) => (
                                <SelectItem key={String(field.value)} value={String(field.value)}>
                                  {field.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="col-span-3">
                          <Select
                            value={filter.operator}
                            onValueChange={(value) => handleOperatorChange(index, value as FilterOperator)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Operator" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equals">Equals</SelectItem>
                              <SelectItem value="contains">Contains</SelectItem>
                              <SelectItem value="in">In</SelectItem>
                              <SelectItem value="between">Between</SelectItem>
                              <SelectItem value="greaterThan">Greater than</SelectItem>
                              <SelectItem value="lessThan">Less than</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="col-span-3">
                          <Input
                            placeholder="Value"
                            value={filter.value}
                            onChange={(e) => handleValueChange(index, e.target.value)}
                            type={filter.field === 'createdBy' ? 'number' : (filter.field === 'orderDate' || filter.field === 'DeliveryDate') ? 'date' : 'text'}
                          />
                        </div>
                        
                        <div className="col-span-1 flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFilter(index)}
                            className="h-6 w-6"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="outline" size="sm" onClick={addFilter} className="h-8 px-2 text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Condition
                  </Button>
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="json" className="py-4">
              <div className="bg-gray-100 p-3 rounded-md font-mono text-xs overflow-auto max-h-[300px]">
                {getJsonView()}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 flex justify-between items-center">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                <History className="h-3 w-3 mr-1" />
                History
              </Button>
              <Button size="sm" variant="outline" className="h-8 px-2 text-xs">
                <Code className="h-3 w-3 mr-1" />
                Test
              </Button>
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleApplyFilters}>Apply</Button>
            </div>
          </div>
          
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-medium">Save this filter</h3>
              <Button size="sm" variant="outline" onClick={handleSaveFilter} className="h-8 px-2 text-xs">
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}