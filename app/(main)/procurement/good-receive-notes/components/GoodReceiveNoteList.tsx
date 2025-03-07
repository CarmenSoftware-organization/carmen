"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Search, Eye, Edit2Icon, Trash2, Plus, FileDown, Printer } from 'lucide-react'
import { AdvancedFilter } from './advanced-filter'
import { Filter as FilterType } from '@/lib/utils/filter-storage'
import { GoodsReceiveNote } from '@/lib/types'
import { mockGoodsReceiveNotes } from '@/lib/mock/mock_goodsReceiveNotes'
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import StatusBadge from "@/components/ui/custom-status-badge"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import ListPageTemplate from "@/components/templates/ListPageTemplate"

// ... rest of the imports ...

export function GoodReceiveNoteList() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [filteredGRNs, setFilteredGRNs] = useState(mockGoodsReceiveNotes)
  const [selectedGRNs, setSelectedGRNs] = useState<string[]>([])
  const [sortField, setSortField] = useState<keyof GoodsReceiveNote | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const itemsPerPage = 7
  const [advancedFilters, setAdvancedFilters] = useState<FilterType<GoodsReceiveNote>[]>([])
  const [filteredData, setFilteredData] = useState<GoodsReceiveNote[]>(mockGoodsReceiveNotes)

  useEffect(() => {
    let filtered = mockGoodsReceiveNotes.filter(
      (grn) =>
        (grn.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
          grn.vendor.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === "" || grn.status === statusFilter)
    )

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
    setSelectedGRNs([])
    setCurrentPage(1)
  }, [searchTerm, statusFilter, sortField, sortOrder])

  const handleSelectGRN = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedGRNs([...selectedGRNs, id])
    } else {
      setSelectedGRNs(selectedGRNs.filter((grnId) => grnId !== id))
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

  const handleApplyAdvancedFilters = (filters: FilterType<GoodsReceiveNote>[]) => {
    setAdvancedFilters(filters)
    const filtered = mockGoodsReceiveNotes.filter((grn) => {
      return filters.reduce((result, filter, index) => {
        const fieldValue = grn[filter.field as keyof GoodsReceiveNote]
        let matches = false
        
        switch (filter.operator) {
          case 'equals':
            matches = fieldValue === filter.value
            break
          case 'contains':
            if (typeof fieldValue === 'string' && typeof filter.value === 'string') {
              matches = fieldValue.toLowerCase().includes(filter.value.toLowerCase())
            }
            break
          case 'in':
            if (Array.isArray(filter.value)) {
              if (filter.value.every((item: unknown): item is string => typeof item === 'string')) {
                matches = (filter.value as string[]).includes(fieldValue as string)
              }
              if (filter.value.every((item: unknown): item is number => typeof item === 'number')) {
                matches = (filter.value as number[]).includes(fieldValue as number)
              }
            }
            break
          case 'between':
            if (Array.isArray(filter.value) && 
                filter.value.length === 2 && 
                typeof fieldValue === 'number' &&
                typeof filter.value[0] === 'number' &&
                typeof filter.value[1] === 'number') {
              matches = fieldValue >= filter.value[0] && fieldValue <= filter.value[1]
            }
            break
          case 'greaterThan':
            if (typeof fieldValue === 'number' && typeof filter.value === 'number') {
              matches = fieldValue > filter.value
            }
            break
          case 'lessThan':
            if (typeof fieldValue === 'number' && typeof filter.value === 'number') {
              matches = fieldValue < filter.value
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
    setFilteredData(filtered)
  }

  const handleClearAdvancedFilters = () => {
    setAdvancedFilters([])
    setFilteredData(mockGoodsReceiveNotes)
  }

  const totalPages = Math.ceil(filteredGRNs.length / itemsPerPage)
  const paginatedGRNs = filteredGRNs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filters = (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="w-full sm:w-1/2 flex space-x-2">
          <Input
            placeholder="Search GRNs..."
            className="w-full"
            value={searchTerm}
            onChange={handleSearch}
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
    </>
  )

  const content = (
    <>
      <div className="space-y-2">
        {paginatedGRNs.map((grn) => (
          <Card key={grn.id} className="hover:bg-accent">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={selectedGRNs.includes(grn.id)}
                    onCheckedChange={(checked) => handleSelectGRN(grn.id, checked as boolean)}
                  />
                  <StatusBadge status={grn.status} />
                  <div>
                    <h3 className="text-lg font-semibold">
                      <span className="font-normal text-muted-foreground">{grn.ref}</span>
                      <span className="">{grn.vendor}</span>
                    </h3>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/procurement/good-receive-notes/${grn.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/procurement/good-receive-notes/${grn.id}/edit`}>
                            <Edit2Icon className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-4 text-sm">
                <div className="text-left">
                  <Label className="text-sm text-muted-foreground">Date</Label>
                  <p>{grn.date.toLocaleDateString()}</p>
                </div>
                <div className="text-left">
                  <Label className="text-sm text-muted-foreground">Invoice Date</Label>
                  <p>{grn.invoiceDate ? grn.invoiceDate.toLocaleDateString() : "N/A"}</p>
                </div>
                <div className="">
                  <Label className="text-sm text-muted-foreground">Currency</Label>
                  <p>{grn.currency}</p>
                </div>
                <div className="text-right">
                  <Label className="text-sm text-muted-foreground">Net Amount</Label>
                  <p>{grn.netAmount.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <Label className="text-sm text-muted-foreground">Tax Amount</Label>
                  <p>{grn.taxAmount.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <Label className="text-sm text-muted-foreground">Total Amount</Label>
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

  const actionButtons = (
    <>
      <Button className="group">
        <Plus className="mr-2 h-4 w-4" /> New Goods Receive Note
      </Button>
      <Button variant="outline" className="group">
        <FileDown className="mr-2 h-4 w-4" />
        Export
      </Button>
      <Button variant="outline">
        <Printer className="mr-2 h-4 w-4" />
        Print
      </Button>
    </>
  )

  return (
    <ListPageTemplate
      title="Goods Receive Notes"
      actionButtons={actionButtons}
      filters={filters}
      content={content}
    />
  )
} 