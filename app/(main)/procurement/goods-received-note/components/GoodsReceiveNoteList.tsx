'use client'
import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, FileText, Edit, Plus, Download, Printer, ChevronDown, ArrowUpDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { GoodsReceiveNote, GoodsReceiveNoteMode } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { BulkActions } from './tabs/BulkActions'
import StatusBadge from '@/components/ui/custom-status-badge'
import ListPageTemplate from '@/components/templates/ListPageTemplate'
import { mockGoodsReceiveNotes } from '@/lib/mock/mock_goodsReceiveNotes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AdvancedFilter } from './advanced-filter'
import { Filter as FilterType } from '@/lib/utils/filter-storage'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function GoodsReceiveNoteList() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [filteredGRNs, setFilteredGRNs] = useState(mockGoodsReceiveNotes)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [sortField, setSortField] = useState<keyof GoodsReceiveNote | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const itemsPerPage = 10
  const [advancedFilters, setAdvancedFilters] = useState<FilterType<GoodsReceiveNote>[]>([])

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on items:`, selectedItems)
    // Implement bulk action logic here
    if (action === 'delete') {
      setFilteredGRNs(prev => prev.filter(grn => !selectedItems.includes(grn.id)))
    }
    setSelectedItems([])
  }

  const applyFilters = React.useCallback(() => {
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
  }, [searchTerm, statusFilter, sortField, sortOrder, advancedFilters])

  React.useEffect(() => {
    applyFilters()
  }, [searchTerm, statusFilter, sortField, sortOrder, advancedFilters, applyFilters])

  const handleApplyAdvancedFilters = (filters: FilterType<GoodsReceiveNote>[]) => {
    setAdvancedFilters(filters)
  }

  const handleClearAdvancedFilters = () => {
    setAdvancedFilters([])
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredGRNs.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredGRNs.map(grn => grn.id))
    }
  }

  const handleSort = (field: keyof GoodsReceiveNote) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const handleGoodsReceiveNoteAction = (id: string, mode: GoodsReceiveNoteMode) => {
    router.push(`/procurement/goods-received-note/${encodeURIComponent(id)}?mode=${mode}`)
  }

  const handleAddNewGoodsReceiveNote = () => {
    router.push('/procurement/goods-received-note/create')
  }

  const totalPages = Math.ceil(filteredGRNs.length / itemsPerPage)
  const paginatedGRNs = filteredGRNs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const title = 'Goods Receive Notes'
  const actionButtons = (
    <div className="flex flex-col sm:flex-row gap-2">
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

  const filters = (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                <ChevronDown className="ml-2 h-4 w-4" />
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
      
      {selectedItems.length > 0 && (
        <div className="mb-4">
          <BulkActions
            selectedCount={selectedItems.length}
            onAction={handleBulkAction}
          />
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
                    checked={selectedItems.length === paginatedGRNs.length && paginatedGRNs.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="py-3 text-gray-600 font-bold">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('ref')}>
                    GRN Number
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="py-3 text-gray-600 hidden md:table-cell font-bold">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('date')}>
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="py-3 text-gray-600 hidden lg:table-cell font-bold">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('invoiceDate')}>
                    Invoice Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="py-3 text-gray-600 hidden sm:table-cell font-bold">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('vendor')}>
                    Vendor
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="py-3 text-gray-600 hidden lg:table-cell font-bold">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('currency')}>
                    Currency
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="py-3 text-gray-600 text-right hidden md:table-cell font-bold">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('netAmount')}>
                    Net Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="py-3 text-gray-600 text-right hidden lg:table-cell font-bold">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('taxAmount')}>
                    Tax Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="py-3 text-gray-600 text-right font-bold">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('totalAmount')}>
                    Total Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="py-3 text-gray-600 font-bold">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('status')}>
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="py-3 text-gray-600 w-[100px] font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedGRNs.map((grn) => (
                <TableRow key={grn.id} className="group hover:bg-gray-50/50 cursor-pointer">
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.includes(grn.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedItems([...selectedItems, grn.id])
                        } else {
                          setSelectedItems(selectedItems.filter(id => id !== grn.id))
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell className="font-medium" onClick={() => handleGoodsReceiveNoteAction(grn.id, 'view')}>
                    <div className="text-sm font-bold">
                      {grn.ref}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell" onClick={() => handleGoodsReceiveNoteAction(grn.id, 'view')}>
                    <div className="text-sm font-bold">
                      {new Date(grn.date).toLocaleDateString('en-GB')}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell" onClick={() => handleGoodsReceiveNoteAction(grn.id, 'view')}>
                    <div className="text-sm font-bold">
                      {grn.invoiceDate ? new Date(grn.invoiceDate).toLocaleDateString('en-GB') : "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell" onClick={() => handleGoodsReceiveNoteAction(grn.id, 'view')}>
                    <div className="text-sm font-bold">
                      {grn.vendor}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell" onClick={() => handleGoodsReceiveNoteAction(grn.id, 'view')}>
                    <div className="text-sm font-bold">
                      {grn.currency}
                    </div>
                  </TableCell>
                  <TableCell className="text-right hidden md:table-cell" onClick={() => handleGoodsReceiveNoteAction(grn.id, 'view')}>
                    <div className="text-sm font-bold">
                      {grn.netAmount.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right hidden lg:table-cell" onClick={() => handleGoodsReceiveNoteAction(grn.id, 'view')}>
                    <div className="text-sm font-bold">
                      {grn.taxAmount.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right" onClick={() => handleGoodsReceiveNoteAction(grn.id, 'view')}>
                    <div className="text-sm font-bold">
                      {grn.totalAmount.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell onClick={() => handleGoodsReceiveNoteAction(grn.id, 'view')}>
                    <div className="text-sm font-bold">
                      <StatusBadge status={grn.status} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleGoodsReceiveNoteAction(grn.id, 'view')
                        }}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleGoodsReceiveNoteAction(grn.id, 'edit')
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedGRNs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="h-24 text-center">
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
          Showing {filteredGRNs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredGRNs.length)} of {filteredGRNs.length} results
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
