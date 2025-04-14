'use client'
import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Eye, Edit, Trash, ChevronLeft, ChevronRight, Plus, Filter, Download, Printer, LayoutGrid, List, FileText, MoreVertical, PanelRightClose, PanelRightOpen } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from 'next/navigation'
import { GoodsReceiveNote, GoodsReceiveNoteMode } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { BulkActions } from './tabs/BulkActions'
import StatusBadge from '@/components/ui/custom-status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ListPageTemplate from '@/components/templates/ListPageTemplate'
import { mockGoodsReceiveNotes } from '@/lib/mock/mock_goodsReceiveNotes'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { AdvancedFilter } from './advanced-filter'
import { Filter as FilterType } from '@/lib/utils/filter-storage'
import { format } from 'date-fns'

export function GoodsReceiveNoteList() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [filteredGRNs, setFilteredGRNs] = useState(mockGoodsReceiveNotes)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [sortField, setSortField] = useState<keyof GoodsReceiveNote | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const itemsPerPage = 7
  const [advancedFilters, setAdvancedFilters] = useState<FilterType<GoodsReceiveNote>[]>([])
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false)

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
      <Button 
        variant="ghost" 
        size="icon" 
        className="w-8 h-8"
        onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
      >
        {isRightPanelOpen ? (
          <PanelRightClose className="h-4 w-4" />
        ) : (
          <PanelRightOpen className="h-4 w-4" />
        )}
        <span className="sr-only">Toggle right panel</span>
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
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search GRNs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
      </div>
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
        <div className="flex border rounded-md overflow-hidden">
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="rounded-none h-8 px-2"
          >
            <List className="h-4 w-4" />
            <span className="sr-only">Table View</span>
          </Button>
          <Button
            variant={viewMode === 'card' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('card')}
            className="rounded-none h-8 px-2"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="sr-only">Card View</span>
          </Button>
        </div>
      </div>
    </div>
  )

  const renderRowActions = (grn: GoodsReceiveNote) => (
    <div className="flex justify-end space-x-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleGoodsReceiveNoteAction(grn.id, 'view')}
              className="h-8 w-8 rounded-full"
            >
              <span className="sr-only">View</span>
              <FileText className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>View details</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleGoodsReceiveNoteAction(grn.id, 'edit')}
              className="h-8 w-8 rounded-full"
            >
              <span className="sr-only">Edit</span>
              <Edit className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleBulkAction('delete')}
              className="h-8 w-8 rounded-full text-destructive"
            >
              <span className="sr-only">Delete</span>
              <Trash className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <span className="sr-only">More options</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => console.log('Print GRN')}>
              Print GRN
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Download PDF')}>
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Copy Reference')}>
              Copy Reference
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>
    </div>
  )

  const renderTableView = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={selectedItems.length === paginatedGRNs.length}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedGRNs.map((grn) => (
            <TableRow key={grn.id} className="hover:bg-muted/50">
              <TableCell>
                <Checkbox
                  checked={selectedItems.includes(grn.id)}
                  onCheckedChange={(checked) => {
                    setSelectedItems(prev =>
                      checked
                        ? [...prev, grn.id]
                        : prev.filter(id => id !== grn.id)
                    )
                  }}
                />
              </TableCell>
              <TableCell className="font-medium">{grn.ref}</TableCell>
              <TableCell>{grn.vendor}</TableCell>
              <TableCell>{format(new Date(grn.date), 'MMM dd, yyyy')}</TableCell>
              <TableCell>
                <StatusBadge status={grn.status} />
              </TableCell>
              <TableCell className="text-right">
                ${calculateTotalAmount(grn).toLocaleString()}
              </TableCell>
              <TableCell>{renderRowActions(grn)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {paginatedGRNs.map((grn) => (
        <Card key={grn.id} className="hover:bg-secondary/10 transition-colors">
          <CardHeader className="p-4 pb-2 bg-muted/30 border-b">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedItems.includes(grn.id)}
                  onCheckedChange={(checked) => {
                    setSelectedItems(prev =>
                      checked
                        ? [...prev, grn.id]
                        : prev.filter(id => id !== grn.id)
                    )
                  }}
                />
                <div>
                  <CardTitle className="text-lg font-semibold text-primary">
                    {grn.ref}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(grn.date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <StatusBadge status={grn.status} />
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vendor</p>
                <p className="text-sm font-medium">{grn.vendor}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Items</p>
                <p className="text-sm font-medium">{grn.items.length} items</p>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-lg font-semibold">
                  ${calculateTotalAmount(grn).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-4 pt-2 border-t">
              {renderRowActions(grn)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <ListPageTemplate
      title={title}
      actionButtons={actionButtons}
      filters={filters}
      bulkActions={bulkActions}
      content={viewMode === 'table' ? renderTableView() : renderCardView()}
    />
  )
}
