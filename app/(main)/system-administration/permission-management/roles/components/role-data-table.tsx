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
} from "lucide-react"

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
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Badge } from '@/components/ui/badge'
import { RoleAdvancedFilter } from './role-filter-builder'
import { FilterType } from '@/lib/utils/filter-storage'
import { RoleQuickFilters, QuickFilterOption } from './role-quick-filters'
import { Role } from '@/lib/types/permissions'

type RoleFilter = FilterType<Role> & { id: string }

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  viewMode: 'table' | 'card'
  onViewModeChange: (mode: 'table' | 'card') => void
  cardView?: React.ReactNode
}

export function RoleDataTable<TData, TValue>({
  columns,
  data,
  viewMode,
  onViewModeChange,
  cardView,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [appliedFilters, setAppliedFilters] = React.useState<RoleFilter[]>([])
  const [quickFilter, setQuickFilter] = React.useState<QuickFilterOption | null>(null)

  // Apply filters to data (both advanced and quick filters)
  const filteredData = React.useMemo(() => {
    let result = data

    // Apply quick filter first
    if (quickFilter) {
      result = result.filter((item: any) => {
        switch (quickFilter.type) {
          case 'hierarchy':
            if (quickFilter.value === 'all-hierarchy') return true
            const hierarchy = item.hierarchy || 0
            if (quickFilter.value === 'executive') return hierarchy >= 900
            if (quickFilter.value === 'management') return hierarchy >= 700 && hierarchy < 900
            if (quickFilter.value === 'supervisor') return hierarchy >= 400 && hierarchy < 700
            if (quickFilter.value === 'staff') return hierarchy < 400
            return true
          case 'type':
            if (quickFilter.value === 'all-types') return true
            if (quickFilter.value === 'system') return item.isSystem === true
            if (quickFilter.value === 'custom') return item.isSystem === false
            return true
          case 'status':
            if (quickFilter.value === 'all-status') return true
            const hasPermissions = item.permissions && item.permissions.length > 0
            if (quickFilter.value === 'active') return hasPermissions
            if (quickFilter.value === 'inactive') return !hasPermissions
            return true
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
  const handleApplyFilters = (filters: RoleFilter[]) => {
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

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-8 h-9 w-[250px] lg:w-[300px]"
            />
          </div>
          
          <RoleQuickFilters 
            onQuickFilter={handleQuickFilter}
            activeFilter={quickFilter}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <RoleAdvancedFilter 
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            activeFiltersCount={appliedFilters.length}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Columns
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" && column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
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

      {/* Active filters display */}
      {appliedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {appliedFilters.map((filter) => (
            <Badge key={filter.id} variant="outline" className="flex items-center gap-1 px-2 py-1">
              {`${filter.field} ${filter.operator} ${filter.value}`}
              <button 
                onClick={() => {
                  const newFilters = appliedFilters.filter(f => f.id !== filter.id)
                  setAppliedFilters(newFilters)
                }} 
                className="ml-1 rounded-full hover:bg-gray-200"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={handleClearFilters}>
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
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="h-12">
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
                      className="hover:bg-muted/50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-4">
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
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}