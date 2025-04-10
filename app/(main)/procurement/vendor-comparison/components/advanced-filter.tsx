'use client'

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Filter, Plus, Save, X, Star, ChevronDown, History, Code } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import { BaseFilter, SavedFilter, saveFilter, getSavedFilters, deleteFilter } from "@/lib/utils/filter-storage"
import { PurchaseRequest } from "../types"

type FilterOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan'
type LogicalOperator = 'AND' | 'OR'

interface FilterOption {
  label: string
  value: keyof PurchaseRequest
  operators: FilterOperator[]
}

const filterOptions: FilterOption[] = [
  { 
    label: "PR Number", 
    value: "number", 
    operators: ['equals', 'contains', 'startsWith'] 
  },
  { 
    label: "Department", 
    value: "department", 
    operators: ['equals', 'contains'] 
  },
  { 
    label: "Total Amount", 
    value: "total", 
    operators: ['equals', 'greaterThan', 'lessThan'] 
  },
  { 
    label: "Status", 
    value: "status", 
    operators: ['equals'] 
  }
]

interface AdvancedFilterProps {
  onApplyFilters: (filters: BaseFilter<PurchaseRequest>[]) => void
  onClearFilters: () => void
}

export function AdvancedFilter({ onApplyFilters, onClearFilters }: AdvancedFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('build')
  const [currentFilters, setCurrentFilters] = useState<BaseFilter<PurchaseRequest>[]>([])
  const [savedFilters, setSavedFilters] = useState<SavedFilter<PurchaseRequest>[]>([])
  const [field, setField] = useState<keyof PurchaseRequest | ''>('')
  const [operator, setOperator] = useState<FilterOperator>('equals')
  const [value, setValue] = useState('')
  const [availableOperators, setAvailableOperators] = useState<FilterOperator[]>([])

  // Load saved filters on mount
  useEffect(() => {
    loadSavedFilters()
  }, [])

  const loadSavedFilters = async () => {
    try {
      const filters = await getSavedFilters<PurchaseRequest>('vendor-comparison')
      setSavedFilters(filters)
    } catch (error) {
      toast.error("Error loading saved filters", {
        description: "There was an error loading your saved filters."
      })
    }
  }

  const handleDeleteSavedFilter = async (filterId: string) => {
    try {
      await deleteFilter<PurchaseRequest>(filterId, 'vendor-comparison')
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

  const handleToggleStar = async (filter: SavedFilter<PurchaseRequest>) => {
    try {
      await saveFilter('vendor-comparison', {
        ...filter,
        isDefault: !filter.isDefault
      })
      setSavedFilters(savedFilters.map(f => 
        f.id === filter.id ? { ...f, isDefault: !f.isDefault } : f
      ))
    } catch (error) {
      toast.error("Error updating filter", {
        description: "There was a problem updating your filter."
      })
    }
  }

  const applyFilter = (filter: SavedFilter<PurchaseRequest>) => {
    onApplyFilters(filter.filters)
    setIsOpen(false)
  }

  // Add a new filter
  const addFilter = () => {
    if (!field || !value) return
    
    const newFilter: BaseFilter<PurchaseRequest> = {
      field: field,
      operator: operator,
      value: value
    }
    
    setCurrentFilters([...currentFilters, newFilter])
    
    // Reset input fields
    setField('')
    setOperator('equals')
    setValue('')
    setAvailableOperators([])
  }

  // Remove a filter
  const removeFilter = (index: number) => {
    const updatedFilters = [...currentFilters]
    updatedFilters.splice(index, 1)
    setCurrentFilters(updatedFilters)
  }

  // Handle logical operator change
  const handleLogicalOperatorChange = (index: number, value: LogicalOperator) => {
    const updatedFilters = [...currentFilters]
    if (updatedFilters[index]) {
      updatedFilters[index] = {
        ...updatedFilters[index],
        logicalOperator: value
      }
      setCurrentFilters(updatedFilters)
    }
  }

  // Handle field change
  const handleFieldChange = (newField: string) => {
    setField(newField as keyof PurchaseRequest)
    
    // Update available operators
    const option = filterOptions.find(option => option.value === newField)
    if (option) {
      setAvailableOperators(option.operators)
      setOperator(option.operators[0]) // Set default operator
      
      // Set default value for boolean fields
      if (newField === 'status') {
        setValue('Pending')
      } else {
        setValue('')
      }
    }
  }

  // Handle operator change
  const handleOperatorChange = (index: number, value: FilterOperator) => {
    const updatedFilters = [...currentFilters]
    if (updatedFilters[index]) {
      updatedFilters[index] = { ...updatedFilters[index], operator: value }
      setCurrentFilters(updatedFilters)
    }
  }

  // Handle value change
  const handleValueChange = (index: number, value: string) => {
    const updatedFilters = [...currentFilters]
    if (updatedFilters[index]) {
      updatedFilters[index] = { ...updatedFilters[index], value }
      setCurrentFilters(updatedFilters)
    }
  }

  // Apply all filters
  const handleApplyFilters = () => {
    onApplyFilters(currentFilters)
    setIsOpen(false)
  }

  // Save filter
  const handleSaveFilter = async () => {
    const name = prompt('Enter a name for this filter:')
    if (!name) return

    try {
      const now = new Date().toISOString()
      const newFilter: SavedFilter<PurchaseRequest> = {
        id: Date.now().toString(),
        name,
        filters: currentFilters,
        createdAt: now,
        updatedAt: now,
        isDefault: false
      }
      
      await saveFilter('vendor-comparison', newFilter)
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

  // Get display text for a filter
  const getFilterDisplay = (filter: BaseFilter<PurchaseRequest>) => {
    const fieldOption = filterOptions.find(option => option.value === filter.field)
    
    // Handle special cases
    if (filter.field === 'status') {
      return `${fieldOption?.label} ${filter.operator} "${filter.value}"`
    }
    
    return `${fieldOption?.label} ${filter.operator} "${filter.value}"`
  }

  // Get JSON view for debugging
  const getJsonView = () => {
    return JSON.stringify({
      conditions: currentFilters.map(filter => ({
        field: filter.field,
        operator: filter.operator,
        value: filter.value
      })),
      logicalOperator: "AND"
    }, null, 2)
  }

  return (
    <div className="flex items-center">
      {savedFilters.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-8 px-2 lg:px-3 mr-2">
              <span>Saved Filters</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <div className="space-y-2">
              <h3 className="font-medium">Saved Filters</h3>
              <div className="space-y-1">
                {savedFilters.map((filter) => (
                  <div key={filter.id} className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-gray-100">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStar(filter)}
                        className="h-6 w-6"
                      >
                        <Star className={`h-4 w-4 ${filter.isDefault ? 'fill-yellow-400 text-yellow-400' : ''}`} />
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
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {currentFilters.length > 0 && (
        <div className="mr-2 flex flex-wrap gap-2">
          {currentFilters.map((filter, index) => (
            <Badge key={index} variant="outline" className="h-8 flex items-center gap-1 px-2">
              {getFilterDisplay(filter)}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 -mr-1 hover:bg-transparent p-0"
                onClick={() => removeFilter(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={onClearFilters}
          >
            Clear All
          </Button>
        </div>
      )}

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1"
          >
            <Filter className="h-4 w-4" />
            {currentFilters.length > 0 ? `Filters (${currentFilters.length})` : "Add Filters"}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Advanced Filters</SheetTitle>
            <SheetDescription>
              Create filters to narrow down purchase requests
            </SheetDescription>
          </SheetHeader>

          <Tabs defaultValue="build" className="mt-4" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="build">Build</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
            </TabsList>
            
            <TabsContent value="build" className="space-y-4 py-4">
              <div className="mt-6 space-y-6">
                <div className="space-y-4">
                  {/* Current filters section */}
                  {currentFilters.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Current Filters</h3>
                      <div className="flex flex-col gap-2">
                        {currentFilters.map((filter, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{getFilterDisplay(filter)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeFilter(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add new filter section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Add Filter</h3>
                    
                    {/* Field selection */}
                    <div className="grid gap-2">
                      <Label htmlFor="filter-field">Field</Label>
                      <Select
                        value={field as string}
                        onValueChange={handleFieldChange}
                      >
                        <SelectTrigger id="filter-field">
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {filterOptions.map((option) => (
                            <SelectItem key={option.value as string} value={option.value as string}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Operator selection */}
                    {field && (
                      <div className="grid gap-2">
                        <Label htmlFor="filter-operator">Operator</Label>
                        <Select
                          value={operator}
                          onValueChange={(value) => setOperator(value as FilterOperator)}
                        >
                          <SelectTrigger id="filter-operator">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableOperators.map((op) => (
                              <SelectItem key={op} value={op}>
                                {op.charAt(0).toUpperCase() + op.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Value input */}
                    {field && (
                      <div className="grid gap-2">
                        <Label htmlFor="filter-value">Value</Label>
                        {field === 'status' ? (
                          <Select
                            value={value}
                            onValueChange={setValue}
                          >
                            <SelectTrigger id="filter-value">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Approved">Approved</SelectItem>
                              <SelectItem value="In-progress">In-progress</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id="filter-value"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="Enter value"
                          />
                        )}
                      </div>
                    )}

                    {/* Add filter button */}
                    {field && (
                      <Button 
                        onClick={addFilter}
                        className="w-full"
                        disabled={!field || !value}
                      >
                        Add Filter
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={onClearFilters}>
                    Clear All
                  </Button>
                  <Button onClick={handleApplyFilters} disabled={currentFilters.length === 0}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="json" className="py-4">
              <div className="bg-gray-100 p-3 rounded-md font-mono text-sm overflow-auto max-h-[300px]">
                {getJsonView()}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Save this filter</h3>
              <Button size="sm" variant="outline" onClick={handleSaveFilter}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
} 