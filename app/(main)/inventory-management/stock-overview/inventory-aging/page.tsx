"use client"

import { useState, useEffect, useMemo } from "react"
import { useUser } from '@/lib/context/simple-user-context'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowUpDown,
  FileDown,
  Search,
  SlidersHorizontal,
  MapPin,
  List,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Calendar,
  Clock,
  AlertTriangle,
  CalendarDays
} from "lucide-react"
import { formatCurrency, formatNumber } from '@/lib/utils/formatters'
import { GroupedTable, useGroupedTable } from '@/components/inventory/GroupedTable'
import { ExportButton } from '@/components/inventory/ExportButton'
import { createExportData, ExportColumn } from '@/lib/utils/export-utils'
import { AgingItem, generateAgingItems, groupAgingByLocation, groupAgingByAgeBucket } from '@/lib/mock-data/location-inventory'

export default function InventoryAgingPage() {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [agingItems, setAgingItems] = useState<AgingItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [ageBucketFilter, setAgeBucketFilter] = useState("all")
  const [expiryStatusFilter, setExpiryStatusFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [sortField, setSortField] = useState("daysOld")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState<"list" | "grouped">("list")
  const [groupingMode, setGroupingMode] = useState<"location" | "age">("location")
  const [groupedItems, setGroupedItems] = useState<Array<{
    locationId: string
    locationName: string
    items: AgingItem[]
    subtotals: Record<string, number>
    isExpanded: boolean
  }>>([])

  const {
    groups,
    setGroups,
    toggleGroup,
    expandAll,
    collapseAll,
    calculateGrandTotals
  } = useGroupedTable(groupedItems)

  // Export columns configuration
  const exportColumns: ExportColumn[] = [
    { key: 'productCode', label: 'Product Code', type: 'text' },
    { key: 'productName', label: 'Product Name', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'locationName', label: 'Location', type: 'text' },
    { key: 'batchNumber', label: 'Batch Number', type: 'text' },
    { key: 'currentStock', label: 'Current Stock', type: 'number' },
    { key: 'unit', label: 'Unit', type: 'text' },
    { key: 'value', label: 'Value', type: 'currency' },
    { key: 'daysOld', label: 'Days Old', type: 'number' },
    { key: 'ageBucket', label: 'Age Bucket', type: 'text' },
    { key: 'receiptDate', label: 'Receipt Date', type: 'date' },
    { key: 'expiryDate', label: 'Expiry Date', type: 'text' },
    { key: 'daysToExpiry', label: 'Days to Expiry', type: 'number' },
    { key: 'expiryStatus', label: 'Expiry Status', type: 'text' }
  ]

  // Helper function to compute expiry status
  const getExpiryStatus = (expiryDate?: Date): 'good' | 'expiring-soon' | 'critical' | 'expired' | 'no-expiry' => {
    if (!expiryDate) return 'no-expiry'
    const daysToExpiry = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (daysToExpiry < 0) return 'expired'
    if (daysToExpiry < 30) return 'critical'
    if (daysToExpiry < 90) return 'expiring-soon'
    return 'good'
  }

  // Load mock data
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      const data = generateAgingItems()
      setAgingItems(data)

      // Generate grouped data based on current grouping mode
      const grouped = groupingMode === 'location'
        ? groupAgingByLocation(data)
        : groupAgingByAgeBucket(data)
      setGroupedItems(grouped)
      setGroups(grouped)

      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [setGroups, groupingMode])

  // Update grouped data when filters or grouping mode changes
  useEffect(() => {
    if (agingItems.length > 0) {
      const filtered = getFilteredItems()
      const grouped = groupingMode === 'location'
        ? groupAgingByLocation(filtered)
        : groupAgingByAgeBucket(filtered)
      setGroupedItems(grouped)
      setGroups(grouped)
    }
  }, [searchTerm, categoryFilter, ageBucketFilter, expiryStatusFilter, locationFilter, user, agingItems, groupingMode, setGroups])

  // Filter items based on user permissions and filters
  const getFilteredItems = () => {
    let filteredItems = agingItems

    // Filter by user's accessible locations if not admin
    if (user?.role !== 'System Administrator' && user?.availableLocations) {
      const userLocationIds = user.availableLocations.map(l => l.id)
      filteredItems = filteredItems.filter(item =>
        userLocationIds.includes(item.locationId)
      )
    }

    return filteredItems.filter(item => {
      // Search filter
      if (searchTerm && !item.productName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !item.productCode.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !(item.lotNumber || '').toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Category filter
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false
      }

      // Age bucket filter
      if (ageBucketFilter !== "all" && item.ageBucket !== ageBucketFilter) {
        return false
      }

      // Expiry status filter
      if (expiryStatusFilter !== "all") {
        if (!item.expiryDate) {
          if (expiryStatusFilter !== "no-expiry") return false
        } else {
          const daysToExpiry = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          let computedStatus = "expired"
          if (daysToExpiry > 90) computedStatus = "good"
          else if (daysToExpiry > 30) computedStatus = "expiring-soon"
          else if (daysToExpiry >= 0) computedStatus = "critical"

          if (computedStatus !== expiryStatusFilter) return false
        }
      }

      // Location filter
      if (locationFilter !== "all" && item.locationId !== locationFilter) {
        return false
      }

      return true
    })
  }

  const filteredItems = useMemo(() =>
    getFilteredItems().sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case "productCode":
          comparison = a.productCode.localeCompare(b.productCode)
          break
        case "productName":
          comparison = a.productName.localeCompare(b.productName)
          break
        case "category":
          comparison = a.category.localeCompare(b.category)
          break
        case "batchNumber":
          comparison = (a.lotNumber || '').localeCompare(b.lotNumber || '')
          break
        case "daysOld":
          comparison = a.ageInDays - b.ageInDays
          break
        case "currentStock":
          comparison = a.quantity - b.quantity
          break
        case "value":
          comparison = a.value - b.value
          break
        case "expiryDate":
          comparison = (a.expiryDate ? new Date(a.expiryDate).getTime() : 0) -
                      (b.expiryDate ? new Date(b.expiryDate).getTime() : 0)
          break
        case "daysToExpiry":
          const aDaysToExpiry = a.expiryDate ? Math.ceil((new Date(a.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0
          const bDaysToExpiry = b.expiryDate ? Math.ceil((new Date(b.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0
          comparison = aDaysToExpiry - bDaysToExpiry
          break
        default:
          comparison = a.ageInDays - b.ageInDays
      }

      return sortDirection === "asc" ? comparison : -comparison
    }), [agingItems, searchTerm, categoryFilter, ageBucketFilter, expiryStatusFilter, locationFilter, sortField, sortDirection, user])

  // Get unique categories for filter
  const categories = Array.from(new Set(agingItems.map(item => item.category)))
  const locations = Array.from(new Set(agingItems.map(item => ({ id: item.locationId, name: item.locationName }))))

  // Handle sort change
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Render age bucket badge
  const renderAgeBucketBadge = (bucket: AgingItem['ageBucket']) => {
    const variants = {
      '0-30': { variant: "outline" as const, className: "bg-green-50 text-green-700 border-green-200" },
      '31-60': { variant: "outline" as const, className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      '61-90': { variant: "outline" as const, className: "bg-orange-50 text-orange-700 border-orange-200" },
      '90+': { variant: "destructive" as const, className: "" }
    }

    return (
      <Badge
        variant={variants[bucket].variant}
        className={variants[bucket].className}
      >
        {bucket} days
      </Badge>
    )
  }

  // Render expiry status badge
  const renderExpiryStatusBadge = (status: 'fresh' | 'near-expiry' | 'expired' | 'no-expiry' | 'good' | 'expiring-soon' | 'critical') => {
    const variants = {
      fresh: { variant: "outline" as const, className: "bg-green-50 text-green-700 border-green-200" },
      good: { variant: "outline" as const, className: "bg-green-50 text-green-700 border-green-200" },
      'near-expiry': { variant: "outline" as const, className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      'expiring-soon': { variant: "outline" as const, className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      critical: { variant: "destructive" as const, className: "" },
      expired: { variant: "destructive" as const, className: "" },
      'no-expiry': { variant: "secondary" as const, className: "" }
    }

    const labels = {
      fresh: 'Fresh',
      good: 'Good',
      'near-expiry': 'Near Expiry',
      'expiring-soon': 'Expiring Soon',
      critical: 'Critical',
      expired: 'Expired',
      'no-expiry': 'No Expiry'
    }

    return (
      <Badge
        variant={variants[status].variant}
        className={variants[status].className}
      >
        {labels[status]}
      </Badge>
    )
  }

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalItems = filteredItems.length
    const totalValue = filteredItems.reduce((sum, item) => sum + item.value, 0)
    const avgAge = totalItems > 0 ? filteredItems.reduce((sum, item) => sum + item.ageInDays, 0) / totalItems : 0
    const expiredItems = filteredItems.filter(item => {
      if (!item.expiryDate) return false
      return new Date(item.expiryDate) < new Date()
    }).length
    const nearExpiryItems = filteredItems.filter(item => {
      if (!item.expiryDate) return false
      const daysToExpiry = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return daysToExpiry > 0 && daysToExpiry <= 30
    }).length

    return {
      totalItems,
      totalValue,
      avgAge: Math.round(avgAge),
      expiredItems,
      nearExpiryItems
    }
  }, [filteredItems])

  // Prepare export data
  const exportData = useMemo(() => {
    const filters = {
      search: searchTerm,
      category: categoryFilter,
      ageBucket: ageBucketFilter,
      expiryStatus: expiryStatusFilter,
      location: locationFilter,
      grouping: groupingMode
    }

    const totalItems = viewMode === 'grouped' ?
      groups.reduce((sum, group) => sum + group.items.length, 0) :
      filteredItems.length

    const totalValue = viewMode === 'grouped' ?
      groups.reduce((sum, group) => sum + group.items.reduce((gsum, item) => gsum + item.value, 0), 0) :
      filteredItems.reduce((sum, item) => sum + item.value, 0)

    const avgAge = totalItems > 0 ?
      (viewMode === 'grouped' ?
        groups.reduce((sum, group) => sum + group.items.reduce((gsum, item) => gsum + item.ageInDays, 0), 0) :
        filteredItems.reduce((sum, item) => sum + item.ageInDays, 0)) / totalItems : 0

    const expiredCount = viewMode === 'grouped' ?
      groups.reduce((sum, group) => sum + group.items.filter(item => getExpiryStatus(item.expiryDate) === 'expired').length, 0) :
      filteredItems.filter(item => getExpiryStatus(item.expiryDate) === 'expired').length

    const summary = {
      'Total Items': totalItems,
      'Total Value': formatCurrency(totalValue),
      'Average Age (days)': Math.round(avgAge),
      'Expired Items': expiredCount,
      'Near Expiry Items': viewMode === 'grouped' ?
        groups.reduce((sum, group) => sum + group.items.filter(item => {
          const status = getExpiryStatus(item.expiryDate)
          return status === 'critical' || status === 'expiring-soon'
        }).length, 0) :
        filteredItems.filter(item => {
          const status = getExpiryStatus(item.expiryDate)
          return status === 'critical' || status === 'expiring-soon'
        }).length,
      'Grouping Mode': groupingMode === 'location' ? 'By Location' : 'By Age Bucket',
      'View Mode': viewMode === 'grouped' ? 'Grouped View' : 'List View'
    }

    const data = createExportData(
      'Inventory Aging Report',
      exportColumns,
      viewMode === 'grouped' ? groups : undefined,
      viewMode === 'grouped' ? calculateGrandTotals(['currentStock', 'value', 'daysOld', 'daysToExpiry']) : undefined,
      filters,
      summary
    )

    // Add items for list view
    if (viewMode === 'list') {
      data.items = filteredItems
    }

    return data
  }, [groups, filteredItems, viewMode, searchTerm, categoryFilter, ageBucketFilter, expiryStatusFilter, locationFilter, groupingMode, exportColumns, calculateGrandTotals])

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-1" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Summary cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-10 w-[300px]" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-[120px]" />
                  <Skeleton className="h-10 w-[120px]" />
                </div>
              </div>

              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="h-7 w-7 text-blue-600" />
            Inventory Aging
          </h1>
          <p className="text-sm text-muted-foreground">
            Track inventory age and expiry status across locations
          </p>
        </div>

        <div className="flex flex-wrap gap-2 self-end md:self-auto">
          <div className="flex items-center bg-muted rounded-md p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
            <Button
              variant={viewMode === 'grouped' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grouped')}
              className="h-8 px-3"
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              Grouped
            </Button>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
          <ExportButton
            data={exportData}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{formatNumber(summaryStats.totalItems)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(summaryStats.totalValue)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-xl font-semibold">$</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Average Age</p>
                <p className="text-2xl font-bold">{summaryStats.avgAge} days</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Near Expiry Items</p>
                <p className="text-2xl font-bold">{formatNumber(summaryStats.nearExpiryItems)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Expired Items</p>
                <p className="text-2xl font-bold">{formatNumber(summaryStats.expiredItems)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by product name, code or batch..."
                  className="pl-8 w-full md:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {viewMode === 'grouped' && (
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={expandAll}
                      className="h-10"
                    >
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Expand All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={collapseAll}
                      className="h-10"
                    >
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Collapse All
                    </Button>
                    <Select value={groupingMode} onValueChange={(value: "location" | "age") => setGroupingMode(value)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="location">By Location</SelectItem>
                        <SelectItem value="age">By Age Bucket</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={ageBucketFilter} onValueChange={setAgeBucketFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Age Bucket" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Age Buckets</SelectItem>
                    <SelectItem value="0-30">0-30 days</SelectItem>
                    <SelectItem value="31-60">31-60 days</SelectItem>
                    <SelectItem value="61-90">61-90 days</SelectItem>
                    <SelectItem value="90+">90+ days</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={expiryStatusFilter} onValueChange={setExpiryStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Expiry Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="fresh">Fresh</SelectItem>
                    <SelectItem value="near-expiry">Near Expiry</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="no-expiry">No Expiry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Items Table */}
            {viewMode === 'list' ? (
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/75">
                        <TableHead
                          className="py-3 font-medium text-gray-600 cursor-pointer"
                          onClick={() => handleSort("productCode")}
                        >
                          <div className="flex items-center">
                            Code
                            {sortField === "productCode" && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="py-3 font-medium text-gray-600 cursor-pointer"
                          onClick={() => handleSort("productName")}
                        >
                          <div className="flex items-center">
                            Product
                            {sortField === "productName" && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="py-3 font-medium text-gray-600 cursor-pointer"
                          onClick={() => handleSort("batchNumber")}
                        >
                          <div className="flex items-center">
                            Batch
                            {sortField === "batchNumber" && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="py-3 font-medium text-gray-600">Location</TableHead>
                        <TableHead
                          className="py-3 font-medium text-gray-600 text-right cursor-pointer"
                          onClick={() => handleSort("daysOld")}
                        >
                          <div className="flex items-center justify-end">
                            Age (Days)
                            {sortField === "daysOld" && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="py-3 font-medium text-gray-600 text-center">Age Bucket</TableHead>
                        <TableHead
                          className="py-3 font-medium text-gray-600 text-right cursor-pointer"
                          onClick={() => handleSort("currentStock")}
                        >
                          <div className="flex items-center justify-end">
                            Stock
                            {sortField === "currentStock" && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="py-3 font-medium text-gray-600 text-right cursor-pointer"
                          onClick={() => handleSort("value")}
                        >
                          <div className="flex items-center justify-end">
                            Value
                            {sortField === "value" && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="py-3 font-medium text-gray-600 text-right cursor-pointer"
                          onClick={() => handleSort("expiryDate")}
                        >
                          <div className="flex items-center justify-end">
                            Expiry Date
                            {sortField === "expiryDate" && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="py-3 font-medium text-gray-600 text-center">Expiry Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="h-24 text-center">
                            No aging items found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredItems.map((item) => (
                          <TableRow
                            key={`${item.locationId}-${item.productId}-${item.lotNumber ?? 'no-lot'}`}
                            className="hover:bg-gray-50/50"
                          >
                            <TableCell>{item.productCode}</TableCell>
                            <TableCell className="font-medium">{item.productName}</TableCell>
                            <TableCell>{item.lotNumber ?? 'N/A'}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                {item.locationName}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{item.ageInDays} days</TableCell>
                            <TableCell className="text-center">
                              {renderAgeBucketBadge(item.ageBucket)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatNumber(item.quantity)} {item.unit}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.value)}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.expiryDate ? formatDate(item.expiryDate.toISOString()) : 'No expiry'}
                            </TableCell>
                            <TableCell className="text-center">
                              {renderExpiryStatusBadge(getExpiryStatus(item.expiryDate))}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <GroupedTable
                groups={groups}
                columns={[
                  { key: 'group', label: groupingMode === 'location' ? 'Location' : 'Age Bucket', type: 'text' },
                  { key: 'productCode', label: 'Code', type: 'text' },
                  { key: 'productName', label: 'Product', type: 'text' },
                  { key: 'lotNumber', label: 'Lot', type: 'text' },
                  { key: 'ageInDays', label: 'Age (Days)', type: 'number' },
                  { key: 'ageBucket', label: 'Age Bucket', type: 'badge' },
                  { key: 'quantity', label: 'Stock', type: 'number' },
                  { key: 'value', label: 'Value', type: 'currency' },
                  { key: 'expiryDate', label: 'Expiry Date', type: 'date' },
                  { key: 'expiryStatus', label: 'Expiry Status', type: 'badge' }
                ]}
                renderRow={(item: AgingItem) => (
                  <TableRow
                    key={`${item.locationId}-${item.productId}-${item.lotNumber ?? 'no-lot'}`}
                    className="hover:bg-gray-50/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {groupingMode === 'location' ? (
                          <>
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {item.locationName}
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {item.ageBucket} days
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.productCode}</TableCell>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell>{item.lotNumber ?? 'N/A'}</TableCell>
                    <TableCell className="text-right">{item.ageInDays} days</TableCell>
                    <TableCell className="text-center">
                      {renderAgeBucketBadge(item.ageBucket)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(item.quantity)} {item.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.value)}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.expiryDate ? formatDate(item.expiryDate.toISOString()) : 'No expiry'}
                    </TableCell>
                    <TableCell className="text-center">
                      {renderExpiryStatusBadge(getExpiryStatus(item.expiryDate))}
                    </TableCell>
                  </TableRow>
                )}
                onToggleGroup={toggleGroup}
                showSubtotals={true}
                getGroupKeyMetrics={(subtotals) => [
                  { label: 'Items', value: subtotals.totalItems, type: 'number' },
                  { label: 'Avg Age', value: Math.round(subtotals.avgAge || 0), type: 'number' },
                  { label: 'Total Value', value: formatCurrency(subtotals.totalValue), type: 'text' },
                  { label: 'Expired', value: subtotals.expiredItems || 0, type: 'number' }
                ]}
                grandTotals={calculateGrandTotals(['totalItems', 'totalValue', 'avgAge', 'expiredItems'])}
              />
            )}

            {/* Summary */}
            <div className="flex justify-between text-sm text-muted-foreground">
              <div>
                Showing {filteredItems.length} of {agingItems.length} inventory items
              </div>
              <div>
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 