'use client'
import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Eye, Edit, Trash, ChevronLeft, ChevronRight, Plus, Filter, Download, Printer } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from 'next/navigation'
import { GoodsReceiveNote, GoodsReceiveNoteMode } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { BulkActions } from './tabs/BulkActions'
import StatusBadge from '@/components/ui/custom-status-badge'
import { Card, CardContent } from '@/components/ui/card'
import ListPageTemplate from '@/components/templates/ListPageTemplate'
import { mockGoodsReceiveNotes } from '@/lib/mock/mock_goodsReceiveNotes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { AdvancedFilter } from './advanced-filter'
import { Filter as FilterType } from '@/lib/utils/filter-storage'

export function GoodsReceiveNoteList() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [filteredGRNs, setFilteredGRNs] = useState(mockGoodsReceiveNotes)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [sortField, setSortField] = useState<keyof GoodsReceiveNote | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const itemsPerPage = 7
  const [advancedFilters, setAdvancedFilters] = useState<FilterType<GoodsReceiveNote>[]>([])

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on items:`, selectedItems)
    // Implement bulk action logic here
    if (action === 'delete') {
      setFilteredGRNs(prev => prev.filter(grn => !selectedItems.includes(grn.id)))
    }
    setSelectedItems([])
  }

  const applyFilters = () => {
    let filtered = mockGoodsReceiveNotes.filter(
      (grn) =>
        (grn.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
          grn.vendor.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === "" || grn.status === statusFilter)
    )

    // Apply advanced filters
    if (advancedFilters.length > 0) {
      filtered = filtered.filter((grn) => {
        return advancedFilters.reduce((result, filter, index) => {
          const fieldValue = grn[filter.field as keyof GoodsReceiveNote]
          let matches = false
          
          // Skip comparison if fieldValue is undefined or null
          if (fieldValue === undefined || fieldValue === null) {
            return index === 0 ? false : result
          }

          switch (filter.operator) {
            case 'equals':
              if (typeof fieldValue === 'string' || typeof fieldValue === 'number' || fieldValue instanceof Date) {
                if (typeof filter.value === typeof fieldValue || (fieldValue instanceof Date && typeof filter.value === 'string')) {
                  matches = fieldValue.toString() === filter.value.toString()
                }
              }
              break
            case 'contains':
              if (typeof fieldValue === 'string' && typeof filter.value === 'string') {
                matches = fieldValue.toLowerCase().includes(filter.value.toLowerCase())
              }
              break
            case 'in':
              if (Array.isArray(filter.value)) {
                matches = filter.value.some(val => val === fieldValue)
              }
              break
            case 'between':
              if (Array.isArray(filter.value) && filter.value.length === 2) {
                if (fieldValue instanceof Date && typeof filter.value[0] === 'string' && typeof filter.value[1] === 'string') {
                  const startDate = new Date(filter.value[0])
                  const endDate = new Date(filter.value[1])
                  matches = fieldValue >= startDate && fieldValue <= endDate
                } else if (typeof fieldValue === 'number' && typeof filter.value[0] === 'number' && typeof filter.value[1] === 'number') {
                  matches = fieldValue >= filter.value[0] && fieldValue <= filter.value[1]
                }
              }
              break
            case 'greaterThan':
              if (typeof fieldValue === 'number' && typeof filter.value === 'number') {
                matches = fieldValue > filter.value
              } else if (fieldValue instanceof Date && typeof filter.value === 'string') {
                matches = fieldValue > new Date(filter.value)
              }
              break
            case 'lessThan':
              if (typeof fieldValue === 'number' && typeof filter.value === 'number') {
                matches = fieldValue < filter.value
              } else if (fieldValue instanceof Date && typeof filter.value === 'string') {
                matches = fieldValue < new Date(filter.value)
              }
              break
            default:
              matches = true
          }

          // First filter doesn't have a logical operator
          if (index === 0) return matches

          // Apply logical operator
          return filter.logicalOperator === 'AND'
            ? result && matches
            : result || matches
        }, true)
      })
    }

    if (sortField) {
      filtered = filtered.sort((a, b) => {
        const aValue = a[sortField]
        const bValue = b[sortField]
        if (aValue == null || bValue == null) return 0
        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
        return 0
      })
    }

    setFilteredGRNs(filtered)
    setSelectedItems([])
    setCurrentPage(1)
  }

  // Update useEffect to use applyFilters
  React.useEffect(() => {
    applyFilters()
  }, [searchTerm, statusFilter, sortField, sortOrder, advancedFilters])

  const handleApplyAdvancedFilters = (filters: FilterType<GoodsReceiveNote>[]) => {
    setAdvancedFilters(filters)
  }

  const handleClearAdvancedFilters = () => {
    setAdvancedFilters([])
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === paginatedGRNs.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(paginatedGRNs.map(grn => grn.id))
    }
  }

  const calculateTotalAmount = (grn: GoodsReceiveNote) => {
    return grn.items.reduce((total, item) => total + item.netAmount, 0)
  }

  const handleGoodsReceiveNoteAction = (id: string, mode: GoodsReceiveNoteMode) => {
    router.push(`/procurement/goods-received-note/${id}?mode=${mode}`)
  }

  const handleAddNewGoodsReceiveNote = () => {
    router.push('/procurement/goods-received-note/0?mode=create')
  }

  const totalPages = Math.ceil(filteredGRNs.length / itemsPerPage)
  const paginatedGRNs = filteredGRNs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const title = 'Goods Receive Notes'
  const actionButtons = (
    <div className="flex flex-col sm:flex-row ">
      <Button className="w-full sm:w-auto" onClick={handleAddNewGoodsReceiveNote}>
        <Plus className="mr-2 h-4 w-4" />Goods Receive Note
      </Button>
      <Button variant="outline" className="w-full sm:w-auto">
        <Download className="mr-2 h-4 w-4" /> Export
      </Button>
      <Button variant="outline" className="w-full sm:w-auto">
        <Printer className="mr-2 h-4 w-4" /> Print
      </Button>
    </div>
  )

  const bulkActions = (
    <>
      {selectedItems.length > 0 && (
        <div className="mb-4">
          <BulkActions
            selectedItems={selectedItems}
            onAction={handleBulkAction}
          />
        </div>
      )}
      <div className="mb-4 flex items-center">
        <Checkbox
          checked={selectedItems.length === paginatedGRNs.length && paginatedGRNs.length > 0}
          onCheckedChange={toggleSelectAll}
        />
        <span className="ml-2">Select All</span>
      </div>
    </>
  )

  const filters = (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="w-full sm:w-1/2 flex space-x-2">
          <Input
            placeholder="Search GRNs..."
            className="w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="secondary" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {statusFilter || "All Statuses"}
                <ChevronLeft className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setStatusFilter("")}>All Statuses</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setStatusFilter("Pending")}>Pending</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setStatusFilter("Received")}>Received</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setStatusFilter("Partial")}>Partial</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setStatusFilter("Cancelled")}>Cancelled</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setStatusFilter("Voided")}>Voided</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AdvancedFilter 
            onApplyFilters={handleApplyAdvancedFilters}
            onClearFilters={handleClearAdvancedFilters}
          />
        </div>
      </div>
    </>
  )

  const content = (
    <>
      {bulkActions}
      <div className="space-y-2">
        {paginatedGRNs.map((grn) => (
          <Card key={grn.id}>
            <CardContent className="p-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                  <Checkbox
                    checked={selectedItems.includes(grn.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedItems([...selectedItems, grn.id])
                      } else {
                        setSelectedItems(selectedItems.filter(id => id !== grn.id))
                      }
                    }}
                  />
                  <StatusBadge status={grn.status} />
                  <h3 className="text-muted-foreground text-lg">{grn.ref}</h3>
                  <h3 className="font-semibold text-lg">{grn.description}</h3>
                </div>
                <TooltipProvider>
                  <div className="flex space-x-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleGoodsReceiveNoteAction(grn.id, 'view')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleGoodsReceiveNoteAction(grn.id, 'edit')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-4 text-sm">
                <div className="text-left">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <p>{grn.date.toLocaleDateString()}</p>
                </div>
                <div className="text-left">
                  <span className="text-sm text-muted-foreground">Invoice Date</span>
                  <p>{grn.invoiceDate ? grn.invoiceDate.toLocaleDateString() : "N/A"}</p>
                </div>
                <div className="">
                  <span className="text-sm text-muted-foreground">Currency</span>
                  <p>{grn.currency}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-muted-foreground">Net Amount</span>
                  <p>{grn.netAmount.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-muted-foreground">Tax Amount</span>
                  <p>{grn.taxAmount.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-muted-foreground">Total Amount</span>
                  <p>{grn.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredGRNs.length)} of {filteredGRNs.length} results
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
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Next page</span>
            ›
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Last page</span>
            »
          </Button>
        </div>
      </div>
    </>
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
