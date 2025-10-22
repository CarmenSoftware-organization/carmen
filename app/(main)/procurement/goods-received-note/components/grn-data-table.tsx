'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, ChevronDown, List, LayoutGrid, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { GoodsReceiveNote, GRNStatus } from '@/lib/types'
import { AdvancedFilter } from './advanced-filter'
import { GRNQuickFilters, QuickFilterOption } from './grn-quick-filters'
import { Filter as FilterType } from '@/lib/utils/filter-storage'
import { format } from 'date-fns'
import StatusBadge from '@/components/ui/custom-status-badge'

interface GRNDataTableProps {
  data: GoodsReceiveNote[]
  viewMode: 'table' | 'card'
  onViewModeChange: (mode: 'table' | 'card') => void
  cardView: React.ReactElement
  onApplyFilters: (filters: FilterType<GoodsReceiveNote>[]) => void
  onClearFilters: () => void
  selectedItems: string[]
  onSelectItems: (items: string[]) => void
  renderRowActions: (grn: GoodsReceiveNote) => React.ReactNode
  bulkActions?: React.ReactNode
}

export function GRNDataTable({
  data,
  viewMode,
  onViewModeChange,
  cardView,
  onApplyFilters,
  onClearFilters,
  selectedItems,
  onSelectItems,
  renderRowActions,
  bulkActions
}: GRNDataTableProps) {
  const [globalFilter, setGlobalFilter] = useState("")
  const [appliedFilters, setAppliedFilters] = useState<FilterType<GoodsReceiveNote>[]>([])
  const [quickFilter, setQuickFilter] = useState<QuickFilterOption | null>(null)
  const [filteredData, setFilteredData] = useState<GoodsReceiveNote[]>(data)
  const [visibleColumns, setVisibleColumns] = useState({
    reference: true,
    vendor: true,
    date: true,
    status: true,
    totalAmount: true,
  })

  // Filter data based on search, quick filters, and advanced filters
  useEffect(() => {
    let filtered = data

    // Apply global search filter
    if (globalFilter) {
      filtered = filtered.filter(grn =>
        grn.grnNumber.toLowerCase().includes(globalFilter.toLowerCase()) ||
        grn.vendorName.toLowerCase().includes(globalFilter.toLowerCase()) ||
        grn.status.toLowerCase().includes(globalFilter.toLowerCase())
      )
    }

    // Apply quick filter
    if (quickFilter) {
      switch (quickFilter.type) {
        case 'view':
          if (quickFilter.value === 'pending') {
            filtered = filtered.filter(grn =>
              grn.status === GRNStatus.RECEIVED
            )
          }
          break
        case 'status':
          filtered = filtered.filter(grn => grn.status === quickFilter.value)
          break
        case 'type':
          // Filter by GRN type based on properties
          if (quickFilter.value === 'consignment') {
            filtered = filtered.filter(grn => (grn as any).isConsignment)
          } else if (quickFilter.value === 'cash') {
            filtered = filtered.filter(grn => (grn as any).isCash)
          } else if (quickFilter.value === 'from-po') {
            // Assuming GRNs from PO have items with PO references
            filtered = filtered.filter(grn => (grn as any).items?.some((item: any) => item.poLineId))
          } else if (quickFilter.value === 'manual') {
            // Manual GRNs don't have PO references
            filtered = filtered.filter(grn => !(grn as any).items?.some((item: any) => item.poLineId))
          }
          break
      }
    }

    // Apply advanced filters
    if (appliedFilters.length > 0) {
      filtered = filtered.filter((grn) => {
        return appliedFilters.reduce((result, filter, index) => {
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

    setFilteredData(filtered)
  }, [data, globalFilter, quickFilter, appliedFilters])

  const handleQuickFilter = (filter: QuickFilterOption | null) => {
    setQuickFilter(filter)
  }

  const handleApplyAdvancedFilters = (filters: FilterType<GoodsReceiveNote>[]) => {
    setAppliedFilters(filters)
    onApplyFilters(filters)
  }

  const handleClearAdvancedFilters = () => {
    setAppliedFilters([])
    onClearFilters()
  }

  const handleClearAllFilters = () => {
    setAppliedFilters([])
    setQuickFilter(null)
    setGlobalFilter("")
    onClearFilters()
  }

  const handleRemoveFilter = (index: number) => {
    const newFilters = appliedFilters.filter((_, i) => i !== index)
    setAppliedFilters(newFilters)
    onApplyFilters(newFilters)
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredData.length) {
      onSelectItems([])
    } else {
      onSelectItems(filteredData.map(grn => grn.id))
    }
  }

  const calculateTotalAmount = (grn: GoodsReceiveNote) => {
    return (grn as any).items?.reduce((total: number, item: any) => total + (item.netAmount || 0), 0) || 0
  }

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search GRNs..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-8 h-9 w-[250px] lg:w-[300px]"
            />
          </div>
          
          {/* Quick Filters */}
          <GRNQuickFilters 
            onQuickFilter={handleQuickFilter}
            activeFilter={quickFilter}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Advanced Filter */}
          <AdvancedFilter
            onApplyFilters={handleApplyAdvancedFilters}
            onClearFilters={handleClearAdvancedFilters}
          />
          
          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Columns
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              {Object.entries(visibleColumns).map(([column, visible]) => (
                <DropdownMenuCheckboxItem
                  key={column}
                  className="capitalize"
                  checked={visible}
                  onCheckedChange={(checked) => 
                    setVisibleColumns(prev => ({ ...prev, [column]: !!checked }))
                  }
                >
                  {column.replace(/([A-Z])/g, ' $1').trim()}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* View Mode Toggle */}
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('table')}
              className="rounded-none h-8 px-2"
            >
              <List className="h-4 w-4" />
              <span className="sr-only">Table View</span>
            </Button>
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('card')}
              className="rounded-none h-8 px-2"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="sr-only">Card View</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {bulkActions && (
        <div className="mb-2">
          {bulkActions}
        </div>
      )}

      {/* Active filters display */}
      {(appliedFilters.length > 0 || quickFilter) && (
        <div className="flex flex-wrap gap-2 items-center">
          {quickFilter && (
            <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
              {quickFilter.label}
              <button 
                onClick={() => setQuickFilter(null)} 
                className="ml-1 rounded-full hover:bg-gray-200"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {appliedFilters.map((filter, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-1 px-2 py-1">
              {`${filter.field} ${filter.operator} ${filter.value}`}
              <button 
                onClick={() => handleRemoveFilter(index)} 
                className="ml-1 rounded-full hover:bg-gray-200"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={handleClearAllFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Table or Card View */}
      {viewMode === 'table' ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={selectedItems.length === filteredData.length && filteredData.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                {visibleColumns.reference && <TableHead>Reference</TableHead>}
                {visibleColumns.vendor && <TableHead>Vendor</TableHead>}
                {visibleColumns.date && <TableHead>Date</TableHead>}
                {visibleColumns.status && <TableHead>Status</TableHead>}
                {visibleColumns.totalAmount && <TableHead className="text-right">Total Amount</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((grn) => (
                <TableRow key={grn.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.includes(grn.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onSelectItems([...selectedItems, grn.id])
                        } else {
                          onSelectItems(selectedItems.filter(id => id !== grn.id))
                        }
                      }}
                    />
                  </TableCell>
                  {visibleColumns.reference && (
                    <TableCell className="font-medium">
                      <Link 
                        href={`/procurement/goods-received-note/${grn.id}?mode=view`}
                        className="text-primary hover:text-primary/80 hover:underline"
                      >
                        {grn.grnNumber}
                      </Link>
                    </TableCell>
                  )}
                  {visibleColumns.vendor && <TableCell>{grn.vendorName}</TableCell>}
                  {visibleColumns.date && (
                    <TableCell>{format(new Date(grn.receiptDate), 'MMM dd, yyyy')}</TableCell>
                  )}
                  {visibleColumns.status && (
                    <TableCell>
                      <StatusBadge status={grn.status} />
                    </TableCell>
                  )}
                  {visibleColumns.totalAmount && (
                    <TableCell className="text-right">
                      ${calculateTotalAmount(grn).toLocaleString()}
                    </TableCell>
                  )}
                  <TableCell>{renderRowActions(grn)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        React.cloneElement(cardView, { data: filteredData })
      )}

      {/* Pagination info */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {selectedItems.length} of {filteredData.length} row(s) selected.
        </div>
      </div>
    </div>
  )
}