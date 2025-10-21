"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Check,
  X,
  ChevronDown,
  Filter,
  MoreHorizontal,
  Search,
  FileText,
  AlertTriangle,
  Package
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
import { Badge } from "@/components/ui/badge"

// Import mock data
import { mockPendingTransactions } from "@/lib/mock-data/pos-transactions"
import type { PendingTransaction, InventoryImpact } from "@/lib/types/pos-integration"

// Import Transaction Detail Drawer
import { TransactionDetailDrawer } from "../components/TransactionDetailDrawer"

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending_approval":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
      {getStatusLabel(status)}
    </span>
  )
}

// Inventory Impact badge component
function InventoryImpactBadge({ impact }: { impact: InventoryImpact }) {
  const getImpactColor = (impact: InventoryImpact) => {
    switch (impact) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getImpactIcon = (impact: InventoryImpact) => {
    switch (impact) {
      case "low":
        return <Package className="h-3 w-3" />
      case "medium":
        return <Package className="h-3 w-3" />
      case "high":
        return <AlertTriangle className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getImpactColor(impact)}`}>
      {getImpactIcon(impact)}
      {impact.charAt(0).toUpperCase() + impact.slice(1)} Impact
    </span>
  )
}

export default function StockOutReviewPage() {
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
  const [requesterFilter, setRequesterFilter] = useState<string>("all")
  const [impactFilter, setImpactFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
  const [selectedTransaction, setSelectedTransaction] = useState<PendingTransaction | null>(null)

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return mockPendingTransactions.filter(txn => {
      // Location filter
      if (locationFilter !== "all" && txn.locationId !== locationFilter) {
        return false
      }

      // Requester filter
      if (requesterFilter !== "all" && txn.requester.id !== requesterFilter) {
        return false
      }

      // Impact filter
      if (impactFilter !== "all" && txn.inventoryImpact !== impactFilter) {
        return false
      }

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          txn.transactionId.toLowerCase().includes(query) ||
          txn.requester.name.toLowerCase().includes(query) ||
          txn.location.name.toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [locationFilter, requesterFilter, impactFilter, searchQuery])

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

  // Bulk approve transactions
  const handleBulkApprove = () => {
    console.log("Bulk approving transactions:", selectedRows)
    // TODO: Implement bulk approve logic
    setSelectedRows([])
  }

  // Bulk reject transactions
  const handleBulkReject = () => {
    console.log("Bulk rejecting transactions:", selectedRows)
    // TODO: Implement bulk reject logic
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

  // Approve single transaction
  const handleApprove = (transactionId: string) => {
    console.log("Approving transaction:", transactionId)
    // TODO: Implement approve logic with API call
    setDrawerOpen(false)
    setSelectedTransaction(null)
  }

  // Reject single transaction
  const handleReject = (transactionId: string) => {
    console.log("Rejecting transaction:", transactionId)
    // TODO: Implement reject logic with API call
    setDrawerOpen(false)
    setSelectedTransaction(null)
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
          <h1 className="text-3xl font-bold tracking-tight">Stock-out Review</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and approve pending POS transactions requiring inventory deduction
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
          <Badge variant="outline" className="text-sm">
            {filteredTransactions.length} Pending
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

        {/* Requester Filter */}
        <div className="w-full sm:w-auto">
          <Select value={requesterFilter} onValueChange={setRequesterFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Requesters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requesters</SelectItem>
              <SelectItem value="user-001">John Smith</SelectItem>
              <SelectItem value="user-002">Sarah Johnson</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Inventory Impact Filter */}
        <div className="w-full sm:w-auto">
          <Select value={impactFilter} onValueChange={setImpactFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Impact Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Impact Levels</SelectItem>
              <SelectItem value="low">Low Impact</SelectItem>
              <SelectItem value="medium">Medium Impact</SelectItem>
              <SelectItem value="high">High Impact</SelectItem>
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
              onClick={handleBulkApprove}
            >
              <Check className="mr-1 h-4 w-4" />
              Approve Selected
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkReject}
            >
              <X className="mr-1 h-4 w-4" />
              Reject Selected
            </Button>
          </div>
        </div>
      )}

      {/* Approval Queue Table */}
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
                <TableHead className="w-[140px]">Requester</TableHead>
                <TableHead className="w-[80px]">Items</TableHead>
                <TableHead className="w-[120px]">Amount</TableHead>
                <TableHead className="w-[140px]">Inventory Impact</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No pending transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
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
                      <div>{transaction.requester.name}</div>
                      <div className="text-muted-foreground text-xs">
                        {transaction.requester.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggleRowExpansion(transaction.id)}
                        className="text-primary hover:underline"
                      >
                        {transaction.lineItems.length} item{transaction.lineItems.length !== 1 ? 's' : ''}
                      </button>

                      {expandedRows.includes(transaction.id) && (
                        <div className="mt-2 space-y-2 text-sm">
                          {transaction.lineItems.map((item) => (
                            <div key={item.id} className="flex justify-between pb-1 border-b border-muted">
                              <div>
                                <div className="font-medium">{item.posItemName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {item.category} | Qty: {item.quantity}
                                </div>
                                {item.mappedRecipe && (
                                  <div className="text-xs text-green-600 mt-1">
                                    → {item.mappedRecipe.name}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-medium">
                                  {formatCurrency(item.totalPrice.amount, item.totalPrice.currency)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(transaction.totalAmount.amount, transaction.totalAmount.currency)}
                    </TableCell>
                    <TableCell>
                      <InventoryImpactBadge impact={transaction.inventoryImpact} />
                    </TableCell>
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
                          <DropdownMenuItem onClick={() => handleViewDetails(transaction.id)}>
                            <FileText className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-green-600"
                            onClick={() => handleApprove(transaction.id)}
                          >
                            <Check className="mr-2 h-4 w-4" /> Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleReject(transaction.id)}
                          >
                            <X className="mr-2 h-4 w-4" /> Reject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
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
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}
