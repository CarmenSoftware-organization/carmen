"use client"

import * as React from "react"
import Link from "next/link"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { 
  ArrowUpDown, 
  ChevronDown, 
  MoreHorizontal, 
  Search,
  Filter,
  List,
  LayoutGrid,
  X
} from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import StatusBadge from "@/components/ui/custom-status-badge"
import { GoodsReceiveNote } from "@/lib/types"
import { BulkActions } from "./tabs/BulkActions"
import { AdvancedFilter } from "./advanced-filter"
import { GRNQuickFilters, QuickFilterOption } from "./grn-quick-filters"
import { Filter as FilterType } from "@/lib/utils/filter-storage"

interface GRNShadcnDataTableProps {
  data: GoodsReceiveNote[]
}

// Define the columns for the GRN table
export const grnColumns: ColumnDef<GoodsReceiveNote>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "ref",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          GRN #
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <Link 
        href={`/procurement/goods-received-note/${row.original.id}?mode=view`}
        className="text-primary hover:text-primary/80 hover:underline font-medium"
      >
        {row.getValue("ref")}
      </Link>
    ),
  },
  {
    accessorKey: "vendor",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Vendor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("vendor")}</div>,
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("date") as Date
      return <div>{format(new Date(date), 'MMM dd, yyyy')}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge status={row.getValue("status")} />
    ),
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="justify-end"
          >
            Total Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalAmount") || "0")
      
      const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)

      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "currency",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Currency
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const currency = row.getValue("currency") as string
      return <div className="font-medium">{currency || "USD"}</div>
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const grn = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => console.log('Print GRN')}>
              Print GRN
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Download PDF')}>
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => console.log('Delete GRN')}
              className="text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function GRNShadcnDataTable({ data }: GRNShadcnDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [viewMode, setViewMode] = React.useState<'table' | 'card'>('table')
  const [appliedFilters, setAppliedFilters] = React.useState<FilterType<GoodsReceiveNote>[]>([])
  const [quickFilter, setQuickFilter] = React.useState<QuickFilterOption | null>(null)

  const table = useReactTable({
    data,
    columns: grnColumns,
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

  const selectedItems = Object.keys(rowSelection).filter(key => rowSelection[key as keyof typeof rowSelection])
  const selectedCount = selectedItems.length

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on items:`, selectedItems)
    // Reset selection after action
    setRowSelection({})
  }

  const handleQuickFilter = (filter: QuickFilterOption | null) => {
    setQuickFilter(filter)
    // Apply quick filter to table
    if (filter) {
      table.getColumn("status")?.setFilterValue(filter.value === "all" ? "" : filter.value)
    } else {
      table.getColumn("status")?.setFilterValue("")
    }
  }

  const handleApplyAdvancedFilters = (filters: FilterType<GoodsReceiveNote>[]) => {
    setAppliedFilters(filters)
    // Apply advanced filters to table
    // This would need more complex implementation based on filter types
  }

  const handleClearAdvancedFilters = () => {
    setAppliedFilters([])
    // Clear all advanced filters
  }

  const calculateTotalAmount = (grn: GoodsReceiveNote) => {
    return (grn as any).items?.reduce((total: number, item: any) => total + item.netAmount, 0) || 0
  }

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {table.getRowModel().rows.map((row) => {
        const grn = row.original
        return (
          <Card key={grn.id} className="hover:bg-secondary/10 transition-colors">
            <CardHeader className="p-4 pb-2 bg-muted/30 border-b">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                  />
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      <Link 
                        href={`/procurement/goods-received-note/${grn.id}?mode=view`}
                        className="text-primary hover:text-primary/80 hover:underline"
                      >
                        {grn.grnNumber}
                      </Link>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(grn.receiptDate), 'MMM dd, yyyy')}
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
                  <p className="text-sm font-medium">{grn.vendorName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Items</p>
                  <p className="text-sm font-medium">{(grn as any).items?.length || 0} items</p>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-lg font-semibold">
                    ${calculateTotalAmount(grn).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex justify-end mt-4 pt-2 border-t">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <span className="sr-only">More options</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => console.log('Print GRN')}>
                      Print GRN
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log('Download PDF')}>
                      Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => console.log('Delete GRN')}
                      className="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

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
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
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
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
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
                      {column.id === "ref" ? "Reference" : 
                       column.id === "totalAmount" ? "Total Amount" :
                       column.id === "currency" ? "Currency" :
                       column.id}
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

      {/* Bulk Actions */}
      {selectedCount > 0 && (
        <div className="mb-2">
          <BulkActions
            selectedItems={selectedItems}
            onAction={handleBulkAction}
          />
        </div>
      )}

      {/* Active filters display */}
      {(appliedFilters.length > 0 || quickFilter) && (
        <div className="flex flex-wrap gap-2 items-center">
          {quickFilter && (
            <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
              {quickFilter.label}
              <button 
                onClick={() => handleQuickFilter(null)} 
                className="ml-1 rounded-full hover:bg-gray-200"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {appliedFilters.map((filter, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-1 px-2 py-1">
              {filter.field} {filter.operator} {filter.value}
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
        </div>
      )}

      {/* Table or Card View */}
      {viewMode === 'table' ? (
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
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
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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
                    colSpan={grnColumns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        renderCardView()
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}