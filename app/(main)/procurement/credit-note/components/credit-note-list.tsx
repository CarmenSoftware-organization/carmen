'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Search, Filter, Plus, Download, Printer, ChevronDown, Edit, ArrowUpDown, FileText, Star, History, Code, Save, X, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import StatusBadge from '@/components/ui/custom-status-badge'
import { CreditNote } from '@/lib/types/credit-note'
import { staticCreditNotes } from '@/lib/mock/static-credit-notes'
import ListPageTemplate from '@/components/templates/ListPageTemplate'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Types for the advanced filter
type FilterOperator = 'equals' | 'contains' | 'in' | 'between' | 'greaterThan' | 'lessThan';
type LogicalOperator = 'AND' | 'OR';
type FilterValue = string | number;

interface FilterType {
  field: string;
  operator: FilterOperator;
  value: FilterValue;
  logicalOperator?: LogicalOperator;
}

interface SavedFilter {
  id: string;
  name: string;
  filters: FilterType[];
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

const filterFields = [
  { value: 'refNumber', label: 'Reference #' },
  { value: 'status', label: 'Status' },
  { value: 'createdDate', label: 'Created Date' },
  { value: 'docDate', label: 'Document Date' },
  { value: 'vendorName', label: 'Vendor' },
  { value: 'totalAmount', label: 'Total Amount' }
]

export function CreditNoteList() {
  const router = useRouter()
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>(staticCreditNotes)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNotes, setSelectedNotes] = useState<number[]>([])
  const [sortField, setSortField] = useState<keyof CreditNote | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('build')
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([
    { 
      id: '1', 
      name: 'Recent Draft CNs', 
      isDefault: true,
      filters: [{ field: 'status', operator: 'equals', value: 'Draft' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    { 
      id: '2', 
      name: 'High-Value Pending', 
      isDefault: false,
      filters: [
        { field: 'status', operator: 'equals', value: 'Pending Approval' },
        { field: 'totalAmount', operator: 'greaterThan', value: 100000, logicalOperator: 'AND' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ])
  const itemsPerPage = 10
  const [quickFilter, setQuickFilter] = useState<string>('all')

  const handleCreateCreditNote = () => {
    console.log('Creating new credit note')
    router.push('/procurement/credit-note/new')
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    setCurrentPage(1)
  }

  const handleViewDetails = (id: number) => {
    console.log(`Viewing details of credit note ${id}`)
    router.push(`/procurement/credit-note/${id}`)
  }

  const handleEdit = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log(`Editing credit note ${id}`)
  }

  const handleSelectAll = () => {
    if (selectedNotes.length === paginatedCreditNotes.length) {
      setSelectedNotes([])
    } else {
      setSelectedNotes(paginatedCreditNotes.map(note => note.id))
    }
  }

  const handleSelectNote = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedNotes([...selectedNotes, id])
    } else {
      setSelectedNotes(selectedNotes.filter(noteId => noteId !== id))
    }
  }

  const handleBulkAction = (action: 'approve' | 'reject' | 'delete') => {
    console.log(`Performing bulk ${action} on credit notes: ${selectedNotes.join(', ')}`)
    if (action === 'delete') {
      setCreditNotes(creditNotes.filter(note => !selectedNotes.includes(note.id)))
    } else {
      setCreditNotes(creditNotes.map(note => 
        selectedNotes.includes(note.id) ? { ...note, status: action === 'approve' ? 'Approved' : 'Rejected' } : note
      ))
    }
    setSelectedNotes([])
  }

  const handleSort = (field: keyof CreditNote) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const removeFilter = (index: number) => {
    setActiveFilters(activeFilters.filter((_, i) => i !== index))
  }

  const clearAllFilters = () => {
    setActiveFilters([])
  }

  const addFilter = () => {
    setActiveFilters([...activeFilters, {
      field: '',
      operator: 'equals',
      value: '',
    }])
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

  const handleFieldChange = (index: number, value: string) => {
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

  const handleSaveFilter = () => {
    const name = prompt('Enter a name for this filter:')
    if (!name) return

    const now = new Date().toISOString()
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name,
      filters: activeFilters,
      isDefault: false,
      createdAt: now,
      updatedAt: now
    }
    
    setSavedFilters([...savedFilters, newFilter])
  }

  const handleToggleStar = (filter: SavedFilter) => {
    setSavedFilters(savedFilters.map(f => 
      f.id === filter.id ? { ...f, isDefault: !f.isDefault } : f
    ))
  }

  const handleDeleteSavedFilter = (id: string) => {
    setSavedFilters(savedFilters.filter(f => f.id !== id))
  }

  const applyFilter = (filter: SavedFilter) => {
    setActiveFilters(filter.filters)
    setIsFilterOpen(false)
  }

  const applyFilterConditions = (note: CreditNote, conditions: FilterType[]): boolean => {
    if (conditions.length === 0) return true

    return conditions.every((condition, index) => {
      const value = note[condition.field as keyof CreditNote]
      
      let matches = false
      switch(condition.operator) {
        case 'equals':
          matches = value === condition.value
          break
        case 'contains':
          matches = String(value).toLowerCase().includes(String(condition.value).toLowerCase())
          break
        case 'in':
          if (Array.isArray(condition.value)) {
            matches = condition.value.includes(value)
          } else {
            matches = String(value) === String(condition.value)
          }
          break
        case 'between':
          if (Array.isArray(condition.value) && condition.value.length === 2) {
            if (value instanceof Date) {
              const dateValue = new Date(value)
              const [start, end] = condition.value.map(v => new Date(v))
              matches = dateValue >= start && dateValue <= end
            } else {
              const numValue = Number(value)
              const [start, end] = condition.value.map(Number)
              matches = numValue >= start && numValue <= end
            }
          }
          break
        case 'greaterThan':
          if (value instanceof Date) {
            matches = new Date(value) > new Date(condition.value)
          } else {
            matches = Number(value) > Number(condition.value)
          }
          break
        case 'lessThan':
          if (value instanceof Date) {
            matches = new Date(value) < new Date(condition.value)
          } else {
            matches = Number(value) < Number(condition.value)
          }
          break
        default:
          matches = false
      }

      if (index === 0) return matches
      return condition.logicalOperator === 'AND' ? matches : true
    })
  }

  // Generate a display string for a filter
  const getFilterDisplay = (filter: FilterType): string => {
    const field = filterFields.find(f => f.value === filter.field)?.label || filter.field
    const value = typeof filter.value === 'number' ? filter.value.toString() : filter.value
    
    switch (filter.operator) {
      case 'equals':
        return `${field} is ${value}`
      case 'contains':
        return `${field} contains ${value}`
      case 'in':
        return `${field} in (${value})`
      case 'between':
        return `${field} between ${value}`
      case 'greaterThan':
        return `${field} > ${value}`
      case 'lessThan':
        return `${field} < ${value}`
      default:
        return `${field} ${filter.operator} ${value}`
    }
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

  const handleQuickFilter = (filter: string) => {
    setQuickFilter(filter)
    // Apply the quick filter
    switch (filter) {
      case 'draft':
        setActiveFilters([{ field: 'status', operator: 'equals', value: 'Draft' }])
        break
      case 'pending':
        setActiveFilters([{ field: 'status', operator: 'equals', value: 'Pending Approval' }])
        break
      case 'approved':
        setActiveFilters([{ field: 'status', operator: 'equals', value: 'Approved' }])
        break
      case 'rejected':
        setActiveFilters([{ field: 'status', operator: 'equals', value: 'Rejected' }])
        break
      case 'high-value':
        setActiveFilters([{ field: 'totalAmount', operator: 'greaterThan', value: '100000' }])
        break
      case 'all':
        setActiveFilters([])
        break
    }
  }

  const filteredCreditNotes = creditNotes
    .filter(note => 
      note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.refNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(note => applyFilterConditions(note, activeFilters))

  // Apply sorting
  const sortedCreditNotes = [...filteredCreditNotes]
  if (sortField) {
    sortedCreditNotes.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      if (aValue == null || bValue == null) return 0
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue)
      }
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })
  }

  const totalPages = Math.ceil(filteredCreditNotes.length / itemsPerPage)
  const paginatedCreditNotes = sortedCreditNotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const title = 'Credit Notes'
  
  const actionButtons = (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button className="w-full sm:w-auto" onClick={handleCreateCreditNote}>
        <Plus className="mr-2 h-4 w-4" />New Credit Note
      </Button>
      <Button variant="outline" className="w-full sm:w-auto">
        <Download className="mr-2 h-4 w-4" /> Export
      </Button>
      <Button variant="outline" className="w-full sm:w-auto">
        <Printer className="mr-2 h-4 w-4" /> Print
      </Button>
    </div>
  )

  const filters = (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-1/2 flex space-x-2">
          <Input 
            placeholder="Search credit notes..." 
            className="w-full" 
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Button variant="secondary" size="icon"><Search className="h-4 w-4" /></Button>
        </div>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 px-2 lg:px-3">
                <span>Quick Filters</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={() => handleQuickFilter('all')}
                className="flex items-center justify-between"
              >
                All
                {quickFilter === 'all' && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleQuickFilter('draft')}
                className="flex items-center justify-between"
              >
                Draft
                {quickFilter === 'draft' && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleQuickFilter('pending')}
                className="flex items-center justify-between"
              >
                Pending Approval
                {quickFilter === 'pending' && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleQuickFilter('approved')}
                className="flex items-center justify-between"
              >
                Approved
                {quickFilter === 'approved' && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleQuickFilter('rejected')}
                className="flex items-center justify-between"
              >
                Rejected
                {quickFilter === 'rejected' && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Amount</DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={() => handleQuickFilter('high-value')}
                className="flex items-center justify-between"
              >
                High Value (&gt;฿100,000)
                {quickFilter === 'high-value' && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
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
          
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {activeFilters.length > 0 && (
                  <span className="ml-2 rounded-full bg-primary w-6 h-6 flex items-center justify-center text-xs text-primary-foreground">
                    {activeFilters.length}
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
                                value={filter.field}
                                onValueChange={(value) => handleFieldChange(index, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select field" />
                                </SelectTrigger>
                                <SelectContent>
                                  {filterFields.map((field) => (
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
                                value={typeof filter.value === 'string' ? filter.value : Array.isArray(filter.value) ? filter.value.join(', ') : filter.value}
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
                  <Button variant="outline" onClick={() => setIsFilterOpen(false)}>Cancel</Button>
                  <Button onClick={() => setIsFilterOpen(false)}>Apply</Button>
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
        </div>
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center py-2">
          <span className="text-sm font-medium text-gray-500">Active filters:</span>
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-1 px-2 py-1">
              {getFilterDisplay(filter)}
              <button onClick={() => removeFilter(index)} className="ml-1 rounded-full hover:bg-gray-200">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={clearAllFilters}>
            Clear all
          </Button>
        </div>
      )}

      {selectedNotes.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-start space-x-2">
            <Button onClick={() => handleBulkAction('approve')}>
              Approve Selected ({selectedNotes.length})
            </Button>
            <Button onClick={() => handleBulkAction('reject')} variant="secondary">
              Reject Selected ({selectedNotes.length})
            </Button>
            <Button onClick={() => handleBulkAction('delete')} variant="destructive">
              Delete Selected ({selectedNotes.length})
            </Button>
          </div>
        </div>
      )}
    </div>
  )

  const content = (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/75">
                <TableHead className="w-[50px] py-3 text-gray-600 font-bold">
                  <Checkbox
                    checked={selectedNotes.length === paginatedCreditNotes.length && paginatedCreditNotes.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-[120px] py-3 text-gray-600 font-bold">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('refNumber')}>
                    Reference #
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="min-w-[200px] py-3 text-gray-600 font-bold">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('description')}>
                    Description
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[120px] py-3 text-gray-600 hidden md:table-cell font-bold">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('createdDate')}>
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[180px] py-3 text-gray-600 hidden sm:table-cell font-bold">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('vendorName')}>
                    Vendor
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[120px] py-3 text-gray-600 hidden lg:table-cell font-bold">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('docNumber')}>
                    Doc. #
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[120px] py-3 text-gray-600 hidden lg:table-cell font-bold">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('docDate')}>
                    Doc. Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[120px] py-3 text-gray-600 text-right hidden md:table-cell font-bold">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('netAmount')}>
                    Net Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[120px] py-3 text-gray-600 text-right hidden lg:table-cell font-bold">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('taxAmount')}>
                    Tax Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[120px] py-3 text-gray-600 text-right font-bold">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('totalAmount')}>
                    Total Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[120px] py-3 text-gray-600 font-bold">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('status')}>
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[100px] py-3 text-gray-600 font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCreditNotes.map((note) => (
                <TableRow key={note.id} className="group hover:bg-gray-50/50 cursor-pointer" onClick={() => handleViewDetails(note.id)}>
                  <TableCell className="w-[50px]">
                    <Checkbox
                      checked={selectedNotes.includes(note.id)}
                      onCheckedChange={(checked) => handleSelectNote(note.id, checked as boolean)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell className="w-[120px] font-medium">
                    {note.refNumber}
                  </TableCell>
                  <TableCell className="min-w-[200px]">
                    {note.description}
                  </TableCell>
                  <TableCell className="w-[120px] hidden md:table-cell">
                    {new Date(note.createdDate).toLocaleDateString('en-GB')}
                  </TableCell>
                  <TableCell className="w-[180px] hidden sm:table-cell">
                    {note.vendorName}
                  </TableCell>
                  <TableCell className="w-[120px] hidden lg:table-cell">
                    {note.docNumber}
                  </TableCell>
                  <TableCell className="w-[120px] hidden lg:table-cell">
                    {new Date(note.docDate).toLocaleDateString('en-GB')}
                  </TableCell>
                  <TableCell className="w-[120px] text-right hidden md:table-cell">
                    {note.netAmount.toLocaleString('en-US', { style: 'currency', currency: 'THB' })}
                  </TableCell>
                  <TableCell className="w-[120px] text-right hidden lg:table-cell">
                    {note.taxAmount.toLocaleString('en-US', { style: 'currency', currency: 'THB' })}
                  </TableCell>
                  <TableCell className="w-[120px] text-right">
                    {note.totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'THB' })}
                  </TableCell>
                  <TableCell className="w-[120px]">
                    <StatusBadge status={note.status} />
                  </TableCell>
                  <TableCell className="w-[100px]">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewDetails(note.id)
                        }}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(note.id, e)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedCreditNotes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground text-center sm:text-left">
          Showing {filteredCreditNotes.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredCreditNotes.length)} of {filteredCreditNotes.length} results
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <span className="sr-only">First page</span>
            «
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Previous page</span>
            ‹
          </Button>
          <span className="text-sm font-medium">
            Page {currentPage} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <span className="sr-only">Next page</span>
            ›
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <span className="sr-only">Last page</span>
            »
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <ListPageTemplate
      title={title}
      actionButtons={actionButtons}
      filters={filters}
      content={content}
    />
  )
} 