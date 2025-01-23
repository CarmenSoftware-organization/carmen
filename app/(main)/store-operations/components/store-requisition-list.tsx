'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  ChevronFirst, 
  ChevronLast, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Printer,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  X,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  Hash,
  Building2,
  Store,
  FileText,
  Tags,
  Filter,
  DollarSign
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from 'next/navigation'
import StatusBadge from '@/components/ui/custom-status-badge'

interface Requisition {
  date: string
  refNo: string
  requestTo: string
  storeName: string
  description: string
  status: 'In Process' | 'Complete' | 'Reject' | 'Void' | 'Draft'
  totalAmount: number
}

interface FilterCondition {
  field: string
  operator: string
  value: string
}

const StatusIndicator = ({ status }: { status: Requisition['status'] }) => {
  const statusColors = {
    'In Process': 'bg-blue-500',
    'Complete': 'bg-green-500',
    'Reject': 'bg-red-500',
    'Void': 'bg-gray-500',
    'Draft': 'bg-yellow-500'
  } as const

  return (
    <span className={`px-2 py-1 rounded-full text-white text-sm ${statusColors[status]}`}>
      {status}
    </span>
  )
}

const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) => {
  const [goToPage, setGoToPage] = useState('')

  const handleGoToPage = () => {
    const page = parseInt(goToPage, 10)
    if (page >= 1 && page <= totalPages) {
      onPageChange(page)
      setGoToPage('')
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
      <div className="text-sm text-gray-500">
        Showing page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="First page"
        >
          <ChevronFirst className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={goToPage}
            onChange={(e) => setGoToPage(e.target.value)}
            className="w-16"
            placeholder="Page"
          />
          <Button onClick={handleGoToPage} variant="outline" size="sm">
            Go
          </Button>
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last page"
        >
          <ChevronLast className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

const FilterBuilder = ({ filters, setFilters }: { filters: FilterCondition[], setFilters: React.Dispatch<React.SetStateAction<FilterCondition[]>> }) => {
  const addFilter = () => {
    setFilters([...filters, { field: 'date', operator: 'equals', value: '' }])
  }

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index))
  }

  const updateFilter = (index: number, key: keyof FilterCondition, value: string) => {
    const newFilters = [...filters]
    newFilters[index][key] = value
    setFilters(newFilters)
  }

  return (
    <div className="space-y-4">
      {filters.map((filter, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Select value={filter.field} onValueChange={(value) => updateFilter(index, 'field', value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="refNo">Ref #</SelectItem>
              <SelectItem value="requestTo">Request To</SelectItem>
              <SelectItem value="storeName">Store Name</SelectItem>
              <SelectItem value="description">Description</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="processStatus">Process Status</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filter.operator} onValueChange={(value) => updateFilter(index, 'operator', value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equals">Equals</SelectItem>
              <SelectItem value="contains">Contains</SelectItem>
              <SelectItem value="greater_than">Greater than</SelectItem>
              <SelectItem value="less_than">Less than</SelectItem>
            </SelectContent>
          </Select>
          <Input 
            type="text" 
            value={filter.value} 
            onChange={(e) => updateFilter(index, 'value', e.target.value)}
            placeholder="Enter value"
            className="flex-grow"
          />
          <Button variant="outline" size="icon" onClick={() => removeFilter(index)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button onClick={addFilter}>Add Filter</Button>
    </div>
  )
}

export function StoreRequisitionListComponent() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('date')
  const [filters, setFilters] = useState<FilterCondition[]>([])

  // Sample data - would come from API in real implementation
  const requisitions: Requisition[] = [
    { date: '2024-01-15', refNo: 'SR-2024-001', requestTo: 'M01', storeName: 'Main Store', description: 'Monthly supplies request', status: 'In Process', totalAmount: 1500.00 },
    { date: '2024-01-14', refNo: 'SR-2024-002', requestTo: 'B01', storeName: 'Branch Store 1', description: 'Emergency stock replenishment', status: 'Complete', totalAmount: 2750.50 },
    { date: '2024-01-13', refNo: 'SR-2024-003', requestTo: 'M02', storeName: 'Main Store', description: 'Draft Requisition', status: 'Draft', totalAmount: 1000.00 },
    { date: '2024-01-12', refNo: 'SR-2024-004', requestTo: 'B02', storeName: 'Branch Store 2', description: 'Quarterly inventory update', status: 'In Process', totalAmount: 1200.00 },
    { date: '2024-01-11', refNo: 'SR-2024-005', requestTo: 'M01', storeName: 'Main Store', description: 'Office supplies restock', status: 'Complete', totalAmount: 1800.00 },
    { date: '2024-01-10', refNo: 'SR-2024-006', requestTo: 'B03', storeName: 'Branch Store 3', description: 'Emergency equipment request', status: 'Reject', totalAmount: 1500.00 },
    { date: '2024-01-09', refNo: 'SR-2024-007', requestTo: 'M02', storeName: 'Main Store', description: 'IT department supplies', status: 'In Process', totalAmount: 1000.00 },
    { date: '2024-01-08', refNo: 'SR-2024-008', requestTo: 'B01', storeName: 'Branch Store 1', description: 'Seasonal inventory preparation', status: 'Draft', totalAmount: 1100.00 },
    { date: '2024-01-07', refNo: 'SR-2024-009', requestTo: 'M01', storeName: 'Main Store', description: 'Maintenance tools request', status: 'Complete', totalAmount: 1300.00 },
    { date: '2024-01-06', refNo: 'SR-2024-010', requestTo: 'B02', storeName: 'Branch Store 2', description: 'Staff uniform order', status: 'In Process', totalAmount: 1200.00 },
    { date: '2024-01-05', refNo: 'SR-2024-011', requestTo: 'M02', storeName: 'Main Store', description: 'Marketing materials request', status: 'Void', totalAmount: 1000.00 },
    { date: '2024-01-04', refNo: 'SR-2024-012', requestTo: 'B03', storeName: 'Branch Store 3', description: 'Safety equipment restock', status: 'Complete', totalAmount: 1400.00 },
    { date: '2024-01-03', refNo: 'SR-2024-013', requestTo: 'M01', storeName: 'Main Store', description: 'Cleaning supplies order', status: 'In Process', totalAmount: 1100.00 },
    { date: '2024-01-02', refNo: 'SR-2024-014', requestTo: 'B01', storeName: 'Branch Store 1', description: 'New product samples request', status: 'Draft', totalAmount: 1000.00 },
    { date: '2024-01-01', refNo: 'SR-2024-015', requestTo: 'M02', storeName: 'Main Store', description: 'Year-end inventory count supplies', status: 'Complete', totalAmount: 1600.00 },
  ]

  const itemsPerPage = 10
  const totalPages = Math.ceil(requisitions.length / itemsPerPage)

  const handleSearch = () => {
    setIsLoading(true)
    // Simulating API call
    setTimeout(() => {
      setIsLoading(false)
      // If there was an error, you would set it here
      // setError('An error occurred while fetching data')
    }, 1000)
  }

  const handleSort = (column: string) => {
    setSortBy(column)
    // Here you would implement the sorting logic
    console.log(`Sorting by ${column}`)
  }

  const applyFilters = () => {
    // Here you would implement the filtering logic
    console.log('Applying filters:', filters)
  }

  const handleViewClick = (refNo: string) => {
    router.push(`/store-operations/store-requisitions/${refNo}`)
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  const paginatedRequisitions = requisitions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col gap-6 py-6">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between w-full">
            <CardTitle>Store Requisition List</CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Request
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <div className="relative sm:col-span-5">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                className="pl-8 w-full"
                placeholder="Search requisitions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search requisitions"
              />
            </div>
            <div className="sm:col-span-7 flex justify-end gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[150px] justify-between">
                    {statusFilter === 'all' ? 'All Status' : statusFilter}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[150px]">
                  <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                    <DropdownMenuRadioItem value="all">All Status</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="draft">Draft</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="in-process">In Process</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="complete">Complete</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="reject">Reject</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="void">Void</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[180px] justify-between">
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                    Sort by: {sortBy}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[150px]">
                  <DropdownMenuRadioGroup value={sortBy} onValueChange={handleSort}>
                    <DropdownMenuRadioItem value="date" className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      Date
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="refNo" className="flex items-center">
                      <Hash className="mr-2 h-4 w-4" />
                      Ref #
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="requestTo" className="flex items-center">
                      <Building2 className="mr-2 h-4 w-4" />
                      Request To
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="storeName" className="flex items-center">
                      <Store className="mr-2 h-4 w-4" />
                      Store Name
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="description" className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      Description
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="status" className="flex items-center">
                      <Tags className="mr-2 h-4 w-4" />
                      Status
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="totalAmount" className="flex items-center">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Total Amount
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[150px] flex items-center justify-between"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    More filters
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                      Filter Requisitions
                    </DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <FilterBuilder filters={filters} setFilters={setFilters} />
                  </div>
                  <Button onClick={applyFilters}>Apply Filters</Button>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-6">
        <div className="flex flex-col gap-4">
          {/* Table */}
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Ref #</TableHead>
                    <TableHead>Request To</TableHead>
                    <TableHead>Store Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRequisitions.map((req) => (
                    <TableRow key={req.refNo} className="cursor-pointer hover:bg-gray-50">
                      <TableCell>{req.date}</TableCell>
                      <TableCell>{req.refNo}</TableCell>
                      <TableCell>{req.requestTo}</TableCell>
                      <TableCell>{req.storeName}</TableCell>
                      <TableCell>{req.description}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }).format(req.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={req.status} />
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <div className="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleViewClick(req.refNo)
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6">
        {/* Pagination */}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </CardFooter>
    </Card>
  )
}