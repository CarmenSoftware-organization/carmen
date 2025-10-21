"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Search,
  Filter,
  FileText,
  Map,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Pizza,
  RefreshCcw,
  Download,
  Calendar
} from "lucide-react"
import { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { DateRangePicker } from "@/components/ui/date-picker"

// Mock activity data
interface Activity {
  id: string
  timestamp: string
  type: "transaction" | "mapping" | "stock-out" | "fractional-sales" | "sync" | "error"
  description: string
  status: "success" | "pending" | "failed" | "warning"
  location?: string
  user?: string
  details?: string
  relatedLink?: string
}

const mockActivities: Activity[] = [
  {
    id: "act-001",
    timestamp: "2025-10-19T14:32:00Z",
    type: "transaction",
    description: "12 sales transactions processed",
    status: "success",
    location: "Main Restaurant",
    user: "POS System",
    details: "Total amount: $234.50",
    relatedLink: "/system-administration/system-integrations/pos/transactions"
  },
  {
    id: "act-002",
    timestamp: "2025-10-19T14:20:00Z",
    type: "sync",
    description: "Data synchronization completed",
    status: "success",
    user: "System",
    details: "142 items synchronized from POS"
  },
  {
    id: "act-003",
    timestamp: "2025-10-19T13:15:00Z",
    type: "mapping",
    description: "New items detected from POS system",
    status: "warning",
    user: "POS System",
    details: "12 unmapped items require attention",
    relatedLink: "/system-administration/system-integrations/pos/mapping/recipes"
  },
  {
    id: "act-004",
    timestamp: "2025-10-19T12:45:00Z",
    type: "stock-out",
    description: "Stock-out approval requested",
    status: "pending",
    location: "Coffee Shop",
    user: "Sarah Johnson",
    details: "5 items pending approval",
    relatedLink: "/system-administration/system-integrations/pos/transactions/stock-out-review"
  },
  {
    id: "act-005",
    timestamp: "2025-10-19T11:30:00Z",
    type: "transaction",
    description: "Transaction processing failed",
    status: "failed",
    location: "Downtown Store",
    user: "POS System",
    details: "Missing recipe mapping",
    relatedLink: "/system-administration/system-integrations/pos/transactions/failed"
  },
  {
    id: "act-006",
    timestamp: "2025-10-19T10:15:00Z",
    type: "fractional-sales",
    description: "24 pizza slices and 6 cake slices sold",
    status: "success",
    location: "Airport Branch",
    user: "POS System",
    details: "Inventory auto-deducted",
    relatedLink: "/system-administration/system-integrations/pos/mapping/recipes/fractional-variants"
  },
  {
    id: "act-007",
    timestamp: "2025-10-19T09:45:00Z",
    type: "mapping",
    description: "Recipe mapping updated",
    status: "success",
    location: "Main Restaurant",
    user: "John Smith",
    details: "3 new recipes mapped successfully"
  },
  {
    id: "act-008",
    timestamp: "2025-10-19T09:00:00Z",
    type: "sync",
    description: "Data synchronization started",
    status: "success",
    user: "System",
    details: "Syncing with Comanche POS"
  },
  {
    id: "act-009",
    timestamp: "2025-10-18T18:30:00Z",
    type: "transaction",
    description: "Evening batch processing completed",
    status: "success",
    location: "All Locations",
    user: "POS System",
    details: "456 transactions processed",
    relatedLink: "/system-administration/system-integrations/pos/transactions"
  },
  {
    id: "act-010",
    timestamp: "2025-10-18T17:15:00Z",
    type: "error",
    description: "POS connection temporarily lost",
    status: "failed",
    user: "System",
    details: "Connection restored automatically"
  },
  {
    id: "act-011",
    timestamp: "2025-10-18T16:45:00Z",
    type: "stock-out",
    description: "Stock-out approval completed",
    status: "success",
    location: "Pool Bar",
    user: "Financial Manager",
    details: "Approved inventory adjustment",
    relatedLink: "/system-administration/system-integrations/pos/transactions/stock-out-review"
  },
  {
    id: "act-012",
    timestamp: "2025-10-18T15:20:00Z",
    type: "fractional-sales",
    description: "Fractional variant mapping updated",
    status: "success",
    location: "Main Restaurant",
    user: "Admin User",
    details: "Pizza and cake variants configured",
    relatedLink: "/system-administration/system-integrations/pos/mapping/recipes/fractional-variants"
  }
]

export default function ActivityPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [locationFilter, setLocationFilter] = useState<string>("all")

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return mockActivities.filter(activity => {
      // Search filter
      if (searchQuery && !activity.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !activity.details?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Type filter
      if (typeFilter !== "all" && activity.type !== typeFilter) {
        return false
      }

      // Status filter
      if (statusFilter !== "all" && activity.status !== statusFilter) {
        return false
      }

      // Location filter
      if (locationFilter !== "all" && activity.location !== locationFilter) {
        return false
      }

      return true
    })
  }, [searchQuery, typeFilter, statusFilter, locationFilter])

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    }
  }

  // Get activity type badge
  const getActivityTypeBadge = (type: string) => {
    switch (type) {
      case "transaction":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <FileText className="h-3 w-3 mr-1" />
            Transaction
          </Badge>
        )
      case "mapping":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Map className="h-3 w-3 mr-1" />
            Mapping
          </Badge>
        )
      case "stock-out":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Stock-out
          </Badge>
        )
      case "fractional-sales":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <Pizza className="h-3 w-3 mr-1" />
            Fractional Sales
          </Badge>
        )
      case "sync":
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            <RefreshCcw className="h-3 w-3 mr-1" />
            Sync
          </Badge>
        )
      case "error":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            {type}
          </Badge>
        )
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Success
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Calendar className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      case "warning":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Warning
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
            <Link href="/system-administration/system-integrations/pos">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to POS Integration</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
            <p className="text-sm text-muted-foreground">
              View all POS integration activity and events
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Date Range */}
            <div className="lg:col-span-2">
              <DateRangePicker
                dateRange={dateRange}
                setDateRange={setDateRange}
                className="w-full"
              />
            </div>

            {/* Activity Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="transaction">Transaction</SelectItem>
                <SelectItem value="mapping">Mapping</SelectItem>
                <SelectItem value="stock-out">Stock-out</SelectItem>
                <SelectItem value="fractional-sales">Fractional Sales</SelectItem>
                <SelectItem value="sync">Sync</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>

            {/* Location Filter */}
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="Main Restaurant">Main Restaurant</SelectItem>
                <SelectItem value="Coffee Shop">Coffee Shop</SelectItem>
                <SelectItem value="Downtown Store">Downtown Store</SelectItem>
                <SelectItem value="Airport Branch">Airport Branch</SelectItem>
                <SelectItem value="Pool Bar">Pool Bar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search activity descriptions..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Count Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-sm">
          {filteredActivities.length} {filteredActivities.length === 1 ? 'Activity' : 'Activities'}
        </Badge>
        {(typeFilter !== "all" || statusFilter !== "all" || locationFilter !== "all" || searchQuery) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTypeFilter("all")
              setStatusFilter("all")
              setLocationFilter("all")
              setSearchQuery("")
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Activity Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Time</TableHead>
                <TableHead className="w-[150px]">Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[150px]">Location</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No activities found matching your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="text-sm">
                      {formatTimestamp(activity.timestamp)}
                    </TableCell>
                    <TableCell>
                      {getActivityTypeBadge(activity.type)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{activity.description}</div>
                        {activity.details && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {activity.details}
                          </div>
                        )}
                        {activity.user && (
                          <div className="text-xs text-muted-foreground mt-1">
                            By: {activity.user}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(activity.status)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {activity.location || '-'}
                    </TableCell>
                    <TableCell>
                      {activity.relatedLink ? (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={activity.relatedLink}>
                            View
                          </Link>
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
