'use client'
import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, Edit, Trash, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, Plus, Filter, ArrowUpDown, Download, Printer } from 'lucide-react'
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
import { FilterBuilder } from './FilterBuilder'

type GoodsReceiveNoteStatus = 
  | "Draft"
  | "In Process"
  | "Complete"
  | "Reject"
  | "Voided"
  | "Accept"
  | "Review"

export function GoodsReceiveNoteList() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const filteredGRNs = mockGoodsReceiveNotes.filter((grn: GoodsReceiveNote) => {
    const matchesSearch = 
      grn.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grn.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grn.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || grn.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const sortedAndFilteredGRNs = filteredGRNs.sort((a, b) => {
    const aValue = a[sortField as keyof GoodsReceiveNote]
    const bValue = b[sortField as keyof GoodsReceiveNote]

    if (aValue == null && bValue == null) return 0
    if (aValue == null) return sortDirection === 'asc' ? -1 : 1
    if (bValue == null) return sortDirection === 'asc' ? 1 : -1

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedAndFilteredGRNs.length / itemsPerPage)
  const paginatedGRNs = sortedAndFilteredGRNs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on items:`, selectedItems)
  }

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
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

  const filter = (
    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
      <div className="w-full sm:w-auto flex-grow">
        <Input
          placeholder="Search goods receive notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <select 
        className="w-full sm:w-auto border rounded p-2"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="all">All Statuses</option>
        <option value="draft">Draft</option>
        <option value="submitted">Submitted</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            More Filters
          </Button>
        </DialogTrigger>
        <DialogContent className='sm:w-[70vw] max-w-[60vw]'>
          <FilterBuilder 
            fields={[
              { value: 'ref', label: 'Reference' },
              { value: 'vendor', label: 'Vendor' },
              { value: 'date', label: 'Date' },
              { value: 'invoiceNumber', label: 'Invoice Number' },
              { value: 'invoiceDate', label: 'Invoice Date' },
              { value: 'status', label: 'Status' },
            ]}
            onFilterChange={(filters) => {
              // Handle filter changes
              console.log(filters)
              // You'll need to implement the actual filtering logic
            }}
          />
        </DialogContent>
      </Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Sort
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => {
            setSortField('date')
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
          }}>
            Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            setSortField('vendor')
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
          }}>
            Vendor {sortField === 'vendor' && (sortDirection === 'asc' ? '↑' : '↓')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            setSortField('status')
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
          }}>
            Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  const content = (
    <div className="space-y-2">
      {paginatedGRNs.map((grn) => (
        <Card key={grn.id}>
          <CardContent className="p-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
              <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                <Checkbox
                  checked={selectedItems.includes(grn.id)}
                  onCheckedChange={(checked) => toggleItemSelection(grn.id)}
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Print</DropdownMenuItem>
                      <DropdownMenuItem>Export</DropdownMenuItem>
                      <DropdownMenuItem>Share</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TooltipProvider>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-sm">
              <div>
                <p className="text-gray-500">Date</p>
                <p>{grn.date.toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Vendor</p>
                <p>{grn.vendor}</p>
              </div>
              <div>
                <p className="text-gray-500">Invoice #</p>
                <p>{grn.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-gray-500">Invoice Date</p>
                <p>{grn.invoiceDate.toLocaleDateString()}</p>
              </div>
              <div className="col-span-2 sm:col-span-1 text-right">
                <p className="text-gray-500">Total Amount</p>
                <p className="font-semibold ">{calculateTotalAmount(grn).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-end items-center mt-4 space-x-4">
        <span className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <ListPageTemplate
      title={title}
      actionButtons={actionButtons}
      filters={filter}
      content={content}
      bulkActions={bulkActions}
    />
  )
}
