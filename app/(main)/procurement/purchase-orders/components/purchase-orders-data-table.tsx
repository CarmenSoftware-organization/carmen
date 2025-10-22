"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronDown,
  Search,
  Filter,
  LayoutGrid,
  List,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import { PurchaseOrder } from "@/lib/types"
import { POQuickFilters, QuickFilterOption } from './po-quick-filters'
import { POAdvancedFilter } from './po-filter-builder'
import { FilterType } from '@/lib/utils/filter-storage'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  viewMode: 'table' | 'card'
  onViewModeChange: (mode: 'table' | 'card') => void
  cardView?: React.ReactNode
}

export function PurchaseOrdersDataTable<TData extends PurchaseOrder, TValue>({
  columns,
  data,
  viewMode,
  onViewModeChange,
  cardView,
}: DataTableProps<TData, TValue>) {
  const router = useRouter()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [appliedFilters, setAppliedFilters] = React.useState<FilterType<PurchaseOrder>[]>([])
  const [quickFilter, setQuickFilter] = React.useState<QuickFilterOption | null>(null)

  // Apply filters to data (both advanced and quick filters)
  const filteredData = React.useMemo(() => {
    let result = data

    // Apply quick filter first
    if (quickFilter) {
      result = result.filter((item: any) => {
        switch (quickFilter.type) {
          case 'status':
            if (quickFilter.value === 'all-status') return true
            const statusMap: Record<string, string> = {
              'draft': 'Draft',
              'open': 'Open',
              'sent': 'Sent',
              'partial-received': 'Partial Received',
              'received': 'Received',
              'closed': 'Closed',
              'cancelled': 'Cancelled'
            }
            return item.status === statusMap[quickFilter.value] || item.status === quickFilter.value
          case 'delivery-date':
            if (quickFilter.value === 'all-delivery-date') return true
            const today = new Date()
            const deliveryDate = new Date((item as any).DeliveryDate || item.expectedDeliveryDate || item.orderDate)
            
            switch (quickFilter.value) {
              case 'overdue':
                return deliveryDate < today
              case 'due-today':
                return deliveryDate.toDateString() === today.toDateString()
              case 'due-this-week':
                const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                return deliveryDate >= today && deliveryDate <= weekFromNow
              case 'due-next-week':
                const nextWeekStart = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                const nextWeekEnd = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)
                return deliveryDate >= nextWeekStart && deliveryDate <= nextWeekEnd
              case 'due-this-month':
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
                const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
                return deliveryDate >= monthStart && deliveryDate <= monthEnd
              default:
                return true
            }
          default:
            return true
        }
      })
    }

    // Apply advanced filters
    if (appliedFilters.length > 0) {
      result = result.filter((item: any) => {
        return appliedFilters.every((filter) => {
          const value = item[filter.field]
          let filterValue = filter.value
          
          if (filterValue === null || filterValue === undefined || filterValue === '') return true
          
          // Handle different field types
          let itemValue: any = value
          if (typeof value === 'object' && value?.name) {
            itemValue = value.name
          }

          // Convert to strings for comparison (except for numeric operations)
          const itemStr = String(itemValue).toLowerCase()
          const filterStr = String(filterValue).toLowerCase()

          switch (filter.operator) {
            case 'equals':
              return itemStr === filterStr
            case 'contains':
              return itemStr.includes(filterStr)
            case 'startsWith':
              return itemStr.startsWith(filterStr)
            case 'endsWith':
              return itemStr.endsWith(filterStr)
            case 'greaterThan':
              return parseFloat(String(itemValue)) > parseFloat(String(filterValue))
            case 'lessThan':
              return parseFloat(String(itemValue)) < parseFloat(String(filterValue))
            case 'in':
              const values = Array.isArray(filterValue) ? filterValue : filterValue.split(',').map((v: string) => v.trim())
              return values.some((v: string) => String(v).toLowerCase() === itemStr)
            case 'between':
              if (Array.isArray(filterValue) && filterValue.length === 2) {
                const numValue = parseFloat(String(itemValue))
                return numValue >= parseFloat(String(filterValue[0])) && numValue <= parseFloat(String(filterValue[1]))
              }
              return true
            case 'isNull':
              return itemValue === null || itemValue === undefined || itemValue === ''
            case 'isNotNull':
              return itemValue !== null && itemValue !== undefined && itemValue !== ''
            default:
              return true
          }
        })
      })
    }

    return result
  }, [data, appliedFilters, quickFilter])

  // Handle applying filters
  const handleApplyFilters = (filters: FilterType<PurchaseOrder>[]) => {
    setAppliedFilters(filters)
  }

  // Handle clearing filters
  const handleClearFilters = () => {
    setAppliedFilters([])
  }

  // Handle quick filter changes
  const handleQuickFilter = (filter: QuickFilterOption) => {
    setQuickFilter(filter)
  }

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  const handleRowClick = (row: any) => {
    const po = row.original as PurchaseOrder
    router.push(`/procurement/purchase-orders/${(po as any).poId || po.id}`)
  }

  return (
    <div className="w-full space-y-4">
      {/* Search and Filter Row - following size guide pattern */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
        <div className="relative flex-1 sm:flex-initial sm:w-80">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search purchase orders..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-7 h-8 text-xs"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Quick Filters Component */}
          <POQuickFilters 
            onQuickFilter={handleQuickFilter}
            activeFilter={quickFilter}
          />
          
          {/* Advanced Filter */}
          <POAdvancedFilter
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            activeFiltersCount={appliedFilters.length}
          />
          
          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                Columns
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize text-xs"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* View Mode Toggle - positioned at far right */}
          <div className="flex items-center border rounded-md ml-auto">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('table')}
              className="h-8 px-2 rounded-r-none border-0"
            >
              <List className="h-3 w-3" />
            </Button>
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('card')}
              className="h-8 px-2 rounded-l-none border-0"
            >
              <LayoutGrid className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active filters display */}
      {appliedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {appliedFilters.map((filter, index) => (
            <Badge key={index} variant="outline" className="text-xs px-2 py-0.5 bg-green-100 text-green-800">
              {`${filter.field} ${filter.operator} ${filter.value}`}
              <button 
                onClick={() => {
                  const newFilters = appliedFilters.filter((_, i) => i !== index)
                  setAppliedFilters(newFilters)
                }} 
                className="ml-1 rounded-full hover:bg-gray-200"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" className="text-xs h-8 px-2" onClick={handleClearFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Table or Card View */}
      {viewMode === 'table' ? (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-muted/30">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="font-semibold text-xs py-2">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(row)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-2 text-xs">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        React.cloneElement(cardView as React.ReactElement, { data: filteredData })
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-xs text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-xs text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronsLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronsRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}