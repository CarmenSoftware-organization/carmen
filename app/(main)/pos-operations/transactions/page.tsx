"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  ArrowLeft, 
  ArrowDownToLine, 
  Check, 
  ChevronDown, 
  Filter, 
  MoreHorizontal, 
  Search, 
  Trash,
  RefreshCcw,
  Eye 
} from "lucide-react"
import { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DateRangePicker } from "@/components/ui/date-picker"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Separator } from "@/components/ui/separator"

// Mock transaction data
const transactions = [
  {
    id: "TR-001",
    dateTime: new Date("2023-12-01T14:32:00"),
    location: { code: "LOC001", name: "Main Restaurant" },
    items: [
      { code: "ITEM001", name: "Chicken Curry", category: "Main Course", unitPrice: 12.75, quantity: 2 }
    ],
    amount: 25.50,
    status: "completed",
    actions: ["view", "void", "export"]
  },
  {
    id: "TR-002",
    dateTime: new Date("2023-12-01T15:45:00"),
    location: { code: "LOC003", name: "Pool Bar" },
    items: [
      { code: "ITEM002", name: "Mojito", category: "Beverages", unitPrice: 12.00, quantity: 1 }
    ],
    amount: 12.00,
    status: "completed",
    actions: ["view", "void", "export"]
  },
  {
    id: "TR-003",
    dateTime: new Date("2023-12-01T16:12:00"),
    location: { code: "LOC001", name: "Main Restaurant" },
    items: [
      { code: "ITEM003", name: "Club Sandwich", category: "Snacks", unitPrice: 18.75, quantity: 1 }
    ],
    amount: 18.75,
    status: "failed",
    actions: ["view", "reprocess", "export"]
  },
  {
    id: "TR-004",
    dateTime: new Date("2023-12-02T10:25:00"),
    location: { code: "LOC002", name: "Lobby Lounge" },
    items: [
      { code: "ITEM004", name: "Cappuccino", category: "Beverages", unitPrice: 6.50, quantity: 2 },
      { code: "ITEM005", name: "Croissant", category: "Bakery", unitPrice: 4.25, quantity: 2 }
    ],
    amount: 21.50,
    status: "completed",
    actions: ["view", "void", "export"]
  },
  {
    id: "TR-005",
    dateTime: new Date("2023-12-02T12:40:00"),
    location: { code: "LOC001", name: "Main Restaurant" },
    items: [
      { code: "ITEM006", name: "Caesar Salad", category: "Starters", unitPrice: 14.50, quantity: 1 },
      { code: "ITEM007", name: "Grilled Salmon", category: "Main Course", unitPrice: 24.75, quantity: 1 }
    ],
    amount: 39.25,
    status: "processing",
    actions: ["view"]
  },
  {
    id: "TR-006",
    dateTime: new Date("2023-12-02T18:15:00"),
    location: { code: "LOC003", name: "Pool Bar" },
    items: [
      { code: "ITEM008", name: "Margarita", category: "Beverages", unitPrice: 14.00, quantity: 2 },
      { code: "ITEM009", name: "Nachos", category: "Snacks", unitPrice: 12.50, quantity: 1 }
    ],
    amount: 40.50,
    status: "completed",
    actions: ["view", "void", "export"]
  },
  {
    id: "TR-007",
    dateTime: new Date("2023-12-03T09:30:00"),
    location: { code: "LOC002", name: "Lobby Lounge" },
    items: [
      { code: "ITEM010", name: "English Breakfast Tea", category: "Beverages", unitPrice: 5.50, quantity: 1 }
    ],
    amount: 5.50,
    status: "voided",
    actions: ["view"]
  },
  {
    id: "TR-008",
    dateTime: new Date("2023-12-03T13:45:00"),
    location: { code: "LOC001", name: "Main Restaurant" },
    items: [
      { code: "ITEM011", name: "Vegetable Pasta", category: "Main Course", unitPrice: 16.75, quantity: 1 },
      { code: "ITEM012", name: "Garlic Bread", category: "Sides", unitPrice: 6.25, quantity: 1 }
    ],
    amount: 23.00,
    status: "completed",
    actions: ["view", "void", "export"]
  }
]

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      case "voided":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default function TransactionsPage() {
  // State for filters and UI
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  })
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [expandedRows, setExpandedRows] = useState<string[]>([])
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)
  
  // Filter states
  const [locationFilter, setLocationFilter] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string[]>([])

  // Toggle row selection
  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    )
  }

  // Toggle all rows selection
  const toggleAllRowsSelection = () => {
    if (selectedRows.length === transactions.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(transactions.map(t => t.id))
    }
  }

  // Toggle row expansion
  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    )
  }

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date)
  }

  // Format time
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 mr-2">
          <Link href="/system-administration/system-integrations/pos">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
      </div>

      {/* Header row with date range and export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <DateRangePicker 
            dateRange={dateRange}
            setDateRange={setDateRange}
            className="w-full sm:w-auto"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <ArrowDownToLine className="mr-2 h-4 w-4" />
              Export
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled={selectedRows.length === 0}>
              Export Selected ({selectedRows.length})
            </DropdownMenuItem>
            <DropdownMenuItem>
              Export All
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Export Filtered
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Location Filter */}
        <div className="w-full sm:w-auto">
          <Select>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Quick Selections</SelectLabel>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="active">Active Locations</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Locations</SelectLabel>
                <SelectItem value="loc001">Main Restaurant</SelectItem>
                <SelectItem value="loc002">Lobby Lounge</SelectItem>
                <SelectItem value="loc003">Pool Bar</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-auto">
          <Select>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="voided">Voided</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transaction Type Filter */}
        <div className="w-full sm:w-auto">
          <Select>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Transaction Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="voids">Voids</SelectItem>
              <SelectItem value="refunds">Refunds</SelectItem>
              <SelectItem value="manual">Manual Entries</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="w-full sm:w-auto flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search transactions..."
              className="w-full pl-8"
            />
          </div>
        </div>
      </div>

      {/* Selected items and actions */}
      {selectedRows.length > 0 && (
        <div className="bg-muted/50 px-4 py-2 rounded-md flex items-center justify-between">
          <span className="text-sm font-medium">Selected: {selectedRows.length}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="mr-1 h-4 w-4" />
              View
            </Button>
            <Button variant="outline" size="sm">
              <Trash className="mr-1 h-4 w-4" />
              Void
            </Button>
            <Button variant="outline" size="sm">
              <ArrowDownToLine className="mr-1 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={selectedRows.length === transactions.length && transactions.length > 0}
                    onCheckedChange={() => toggleAllRowsSelection()}
                  />
                </TableHead>
                <TableHead className="w-[150px]">Date/Time</TableHead>
                <TableHead className="w-[150px]">Location</TableHead>
                <TableHead className="w-[250px]">Item Details</TableHead>
                <TableHead className="w-[120px]">Amount</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow 
                  key={transaction.id}
                  className={expandedRows.includes(transaction.id) ? "bg-muted/30" : ""}
                >
                  <TableCell>
                    <Checkbox 
                      checked={selectedRows.includes(transaction.id)}
                      onCheckedChange={() => toggleRowSelection(transaction.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>{formatDate(transaction.dateTime)}</div>
                    <div className="text-muted-foreground text-xs">{formatTime(transaction.dateTime)}</div>
                  </TableCell>
                  <TableCell>
                    <div>{transaction.location.name}</div>
                    <div className="text-muted-foreground text-xs">#{transaction.location.code}</div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleRowExpansion(transaction.id)}
                      className="text-left hover:underline text-primary w-full"
                    >
                      {transaction.items[0].name}
                      {transaction.items.length > 1 && ` +${transaction.items.length - 1} more`}
                    </button>
                    
                    {expandedRows.includes(transaction.id) && (
                      <div className="mt-2 space-y-2 text-sm">
                        {transaction.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between pb-1 border-b border-muted">
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground">{item.code} | {item.category}</div>
                            </div>
                            <div className="text-right">
                              <div>{formatCurrency(item.unitPrice)} x {item.quantity}</div>
                              <div className="font-medium">{formatCurrency(item.unitPrice * item.quantity)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                  <TableCell>
                    <StatusBadge status={transaction.status} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" /> View details
                        </DropdownMenuItem>
                        
                        {transaction.status !== "voided" && transaction.status !== "processing" && (
                          <DropdownMenuItem>
                            <Trash className="mr-2 h-4 w-4" /> Void transaction
                          </DropdownMenuItem>
                        )}
                        
                        {transaction.status === "failed" && (
                          <DropdownMenuItem>
                            <RefreshCcw className="mr-2 h-4 w-4" /> Reprocess
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem>
                          <ArrowDownToLine className="mr-2 h-4 w-4" /> Export
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedRows.length > 0 ? (
            <span>Selected: {selectedRows.length}</span>
          ) : (
            <span>Showing 1-{Math.min(transactions.length, itemsPerPage)} of {transactions.length} items</span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => setItemsPerPage(parseInt(value))}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="10 per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
} 