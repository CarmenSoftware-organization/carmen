"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  RefreshCcw,
  Filter,
  MoreHorizontal,
  Search,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
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
  SelectItem,
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
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"

// Import mock data
import {
  mockFailedTransactions,
  mockTransactionErrors,
} from "@/lib/mock-data/pos-transactions"
import type {
  POSTransaction,
} from "@/lib/types/pos-integration"
import {
  ErrorCategory,
} from "@/lib/types/pos-integration"

// Import Transaction Detail Drawer
import { TransactionDetailDrawer } from "../components/TransactionDetailDrawer"

// Error Category badge component
function ErrorCategoryBadge({ category }: { category: ErrorCategory }) {
  const getCategoryColor = (category: ErrorCategory) => {
    switch (category) {
      case ErrorCategory.MAPPING_ERROR:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case ErrorCategory.STOCK_INSUFFICIENT:
        return "bg-red-100 text-red-800 border-red-200"
      case ErrorCategory.VALIDATION_ERROR:
        return "bg-orange-100 text-orange-800 border-orange-200"
      case ErrorCategory.SYSTEM_ERROR:
        return "bg-purple-100 text-purple-800 border-purple-200"
      case ErrorCategory.CONNECTION_ERROR:
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCategoryLabel = (category: ErrorCategory) => {
    return category.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(category)}`}>
      <AlertTriangle className="h-3 w-3" />
      {getCategoryLabel(category)}
    </span>
  )
}

// Severity badge component
function SeverityBadge({ severity }: { severity: string }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(severity)}`}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  )
}

export default function FailedTransactionsPage() {
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
  const [locationFilter, setLocationFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
  const [selectedTransaction, setSelectedTransaction] = useState<POSTransaction | null>(null)

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return mockFailedTransactions.filter(txn => {
      // Location filter
      if (locationFilter !== "all" && txn.locationId !== locationFilter) {
        return false
      }

      // Get transaction error
      const error = mockTransactionErrors[txn.id]

      // Category filter
      if (categoryFilter !== "all" && error && error.category !== categoryFilter) {
        return false
      }

      // Severity filter
      if (severityFilter !== "all" && error && error.severity !== severityFilter) {
        return false
      }

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          txn.transactionId.toLowerCase().includes(query) ||
          txn.location.name.toLowerCase().includes(query) ||
          (error && error.message.toLowerCase().includes(query))
        )
      }

      return true
    })
  }, [locationFilter, categoryFilter, severityFilter, searchQuery])

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
    if (selectedRows.length === filteredTransactions.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(filteredTransactions.map(t => t.id))
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

  // Bulk retry transactions
  const handleBulkRetry = () => {
    console.log("Bulk retrying transactions:", selectedRows)
    // TODO: Implement bulk retry logic
    setSelectedRows([])
  }

  // View transaction details
  const handleViewDetails = (transactionId: string) => {
    const transaction = filteredTransactions.find(t => t.id === transactionId)
    if (transaction) {
      setSelectedTransaction(transaction)
      setDrawerOpen(true)
    }
  }

  // Retry single transaction
  const handleRetry = (transactionId: string) => {
    console.log("Retrying transaction:", transactionId)
    // TODO: Implement retry logic with API call
    setDrawerOpen(false)
    setSelectedTransaction(null)
  }

  // Manually resolve transaction
  const handleManualResolve = (transactionId: string) => {
    console.log("Manually resolving transaction:", transactionId)
    // TODO: Implement manual resolution logic
  }

  // Format date
  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(dateObj)
  }

  // Format time
  const formatTime = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(dateObj)
  }

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Failed Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and resolve failed POS transactions
          </p>
        </div>
      </div>

      {/* Header row with date range */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <DateRangePicker
            dateRange={dateRange}
            setDateRange={setDateRange}
            className="w-full sm:w-auto"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="text-sm">
            {filteredTransactions.length} Failed
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Location Filter */}
        <div className="w-full sm:w-auto">
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="loc-001">Downtown Store</SelectItem>
              <SelectItem value="loc-002">Uptown Branch</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Error Category Filter */}
        <div className="w-full sm:w-auto">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="MAPPING_ERROR">Mapping Error</SelectItem>
              <SelectItem value="STOCK_INSUFFICIENT">Stock Insufficient</SelectItem>
              <SelectItem value="VALIDATION_ERROR">Validation Error</SelectItem>
              <SelectItem value="SYSTEM_ERROR">System Error</SelectItem>
              <SelectItem value="CONNECTION_ERROR">Connection Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Severity Filter */}
        <div className="w-full sm:w-auto">
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Severity Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity Levels</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedRows.length > 0 && (
        <div className="bg-muted/50 px-4 py-3 rounded-md flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedRows.length} transaction{selectedRows.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleBulkRetry}
            >
              <RefreshCcw className="mr-1 h-4 w-4" />
              Retry Selected
            </Button>
          </div>
        </div>
      )}

      {/* Failed Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedRows.length === filteredTransactions.length && filteredTransactions.length > 0}
                    onCheckedChange={() => toggleAllRowsSelection()}
                  />
                </TableHead>
                <TableHead className="w-[140px]">Transaction ID</TableHead>
                <TableHead className="w-[140px]">Date/Time</TableHead>
                <TableHead className="w-[140px]">Location</TableHead>
                <TableHead className="w-[180px]">Error Category</TableHead>
                <TableHead className="w-[120px]">Severity</TableHead>
                <TableHead className="w-[120px]">Amount</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No failed transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => {
                  const error = mockTransactionErrors[transaction.id]

                  return (
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
                        {transaction.transactionId}
                        <div className="text-xs text-muted-foreground">
                          {transaction.externalId}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{formatDate(transaction.date)}</div>
                        <div className="text-muted-foreground text-xs">
                          {formatTime(transaction.date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{transaction.location.name}</div>
                        <div className="text-muted-foreground text-xs">
                          #{transaction.locationId}
                        </div>
                      </TableCell>
                      <TableCell>
                        {error ? (
                          <div className="space-y-1">
                            <ErrorCategoryBadge category={error.category} />
                            <button
                              onClick={() => toggleRowExpansion(transaction.id)}
                              className="text-xs text-primary hover:underline"
                            >
                              View details
                            </button>

                            {expandedRows.includes(transaction.id) && (
                              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm space-y-2">
                                <div>
                                  <p className="font-medium text-red-900">Error Details</p>
                                  <p className="text-red-800 mt-1">{error.message}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Error Code</p>
                                  <code className="text-xs bg-white px-2 py-1 rounded border">
                                    {error.code}
                                  </code>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Occurred At</p>
                                  <p className="text-xs">{formatDate(error.occurredAt)} {formatTime(error.occurredAt)}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No error details</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {error && <SeverityBadge severity={error.severity} />}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(transaction.totalAmount.amount, transaction.totalAmount.currency)}
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
                            <DropdownMenuItem onClick={() => handleViewDetails(transaction.id)}>
                              <FileText className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-blue-600"
                              onClick={() => handleRetry(transaction.id)}
                            >
                              <RefreshCcw className="mr-2 h-4 w-4" /> Retry
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-green-600"
                              onClick={() => handleManualResolve(transaction.id)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" /> Resolve Manually
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredTransactions.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedRows.length > 0 ? (
              <span>Selected: {selectedRows.length}</span>
            ) : (
              <span>
                Showing {Math.min(filteredTransactions.length, itemsPerPage)} of {filteredTransactions.length} transactions
              </span>
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
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}

      {/* Transaction Detail Drawer */}
      <TransactionDetailDrawer
        transaction={selectedTransaction}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onRetry={handleRetry}
      />
    </div>
  )
}
