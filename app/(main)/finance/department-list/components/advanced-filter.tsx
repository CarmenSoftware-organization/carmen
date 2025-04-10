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
import { toast } from 'sonner'
import { SavedFilter, saveFilter, getSavedFilters, deleteFilter, BaseFilter } from '@/lib/utils/filter-storage'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Department } from '@/components/departments/department-dialog'
import { UserType } from '@/components/departments/user-search'
import { Label } from "@/components/ui/label"

type FilterOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'in' | 'notIn' | 'isNull' | 'isNotNull'
type LogicalOperator = 'AND' | 'OR'

interface FilterOption {
  label: string
  value: keyof Department
  operators: FilterOperator[]
}

const filterOptions: FilterOption[] = [
  { 
    label: "Department Code", 
    value: "code", 
    operators: ['equals', 'contains'] 
  },
  { 
    label: "Department Name", 
    value: "name", 
    operators: ['equals', 'contains'] 
  },
  { 
    label: "Account Code", 
    value: "accountCode", 
    operators: ['equals', 'contains'] 
  },
  { 
    label: "Active Status", 
    value: "isActive", 
    operators: ['equals'] 
  },
  { 
    label: "Department Head", 
    value: "heads", 
    operators: ['contains'] 
  }
]

interface AdvancedFilterProps {
  onApplyFilters: (filters: BaseFilter<Department>[]) => void
  onClearFilters: () => void
}

export function AdvancedFilter({ onApplyFilters, onClearFilters }: AdvancedFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('build')
  const [activeFilters, setActiveFilters] = useState<BaseFilter<Department>[]>([])
  const [savedFilters, setSavedFilters] = useState<SavedFilter<Department>[]>([])
  const [currentFilters, setCurrentFilters] = useState<BaseFilter<Department>[]>([])
  const [field, setField] = useState<keyof Department | ''>('')
  const [operator, setOperator] = useState<FilterOperator>('equals')
  const [value, setValue] = useState('')
  const [availableOperators, setAvailableOperators] = useState<FilterOperator[]>([])

  // Load saved filters on mount
  useEffect(() => {
    loadSavedFilters()
  }, [])

  const loadSavedFilters = async () => {
    try {
      const filters = await getSavedFilters<Department>('department')
      setSavedFilters(filters)
    } catch (error) {
      toast.error("Error loading saved filters", {
        description: "There was an error loading your saved filters."
      })
    }
  }

  const handleDeleteSavedFilter = async (filterId: string) => {
    try {
      await deleteFilter<Department>(filterId, 'department')
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

  const handleToggleStar = async (filter: SavedFilter<Department>) => {
    try {
      await saveFilter('department', {
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

  const applyFilter = (filter: SavedFilter<Department>) => {
    onApplyFilters(filter.filters)
    setIsOpen(false)
  }

  const addFilter = () => {
    if (!field || !value) return
    
    const newFilter: BaseFilter<Department> = {
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

  const removeFilter = (index: number) => {
    const updatedFilters = [...currentFilters]
    updatedFilters.splice(index, 1)
    setCurrentFilters(updatedFilters)
  }

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

  const handleFieldChange = (newField: string) => {
    setField(newField as keyof Department)
    
    // Update available operators
    const option = filterOptions.find(option => option.value === newField)
    if (option) {
      setAvailableOperators(option.operators)
      setOperator(option.operators[0]) // Set default operator
      
      // Set default value for boolean fields
      if (newField === 'isActive') {
        setValue('true')
      } else {
        setValue('')
      }
    }
  }

  const handleOperatorChange = (index: number, value: FilterOperator) => {
    const updatedFilters = [...currentFilters]
    if (updatedFilters[index]) {
      updatedFilters[index] = { ...updatedFilters[index], operator: value }
      setCurrentFilters(updatedFilters)
    }
  }

  const handleValueChange = (index: number, value: string) => {
    const updatedFilters = [...currentFilters]
    if (updatedFilters[index]) {
      updatedFilters[index] = { ...updatedFilters[index], value }
      setCurrentFilters(updatedFilters)
    }
  }

  const handleSaveFilter = async () => {
    const name = prompt('Enter a name for this filter:')
    if (!name) return

    try {
      const now = new Date().toISOString()
      const newFilter: SavedFilter<Department> = {
        id: Date.now().toString(),
        name,
        filters: currentFilters,
        createdAt: now,
        updatedAt: now,
        isDefault: false
      }
      
      await saveFilter('department', newFilter)
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

  const handleApplyFilters = () => {
    onApplyFilters(currentFilters)
    setIsOpen(false)
  }

  // Generate a display string for a filter
  const getFilterDisplay = (filter: BaseFilter<Department>): string => {
    const fieldOption = filterOptions.find(option => option.value === filter.field)
    
    // Handle special cases
    if (filter.field === 'isActive') {
      return `${fieldOption?.label} ${filter.operator} ${filter.value === 'true' ? 'Active' : 'Inactive'}`
    }
    
    return `${fieldOption?.label} ${filter.operator} "${filter.value}"`
  }

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
    <div className="flex items-center space-x-2">
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
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button className="h-8">
            <Filter className="mr-2 h-4 w-4" />
            <span>Add Filter</span>
          </Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Department Filter</SheetTitle>
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
                  {currentFilters.map((filter, index) => (
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
                            onValueChange={(value) => handleFieldChange(value as keyof Department)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              {filterOptions.map((option) => (
                                <SelectItem key={String(option.value)} value={String(option.value)}>
                                  {option.label}
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
                              {availableOperators.map((op) => (
                                <SelectItem key={op} value={op}>
                                  {op.charAt(0).toUpperCase() + op.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="col-span-3">
                          <Input
                            placeholder="Value"
                            value={filter.value}
                            onChange={(e) => handleValueChange(index, e.target.value)}
                          />
                        </div>
                        
                        <div className="col-span-1 flex items-center justify-center">
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
                    </div>
                  ))}
                  
                  <Button variant="outline" size="sm" onClick={addFilter}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Condition
                  </Button>
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="json" className="py-4">
              <div className="bg-gray-100 p-3 rounded-md font-mono text-sm overflow-auto max-h-[300px]">
                {getJsonView()}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 flex justify-between items-center">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <History className="h-4 w-4 mr-1" />
                History
              </Button>
              <Button size="sm" variant="outline">
                <Code className="h-4 w-4 mr-1" />
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
              <h3 className="text-sm font-medium">Save this filter</h3>
              <Button size="sm" variant="outline" onClick={handleSaveFilter}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Active filters display */}
      {currentFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {currentFilters.map((filter, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-1 px-2 py-1">
              {getFilterDisplay(filter)}
              <button onClick={() => removeFilter(index)} className="ml-1 rounded-full hover:bg-gray-200">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={onClearFilters}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
} 