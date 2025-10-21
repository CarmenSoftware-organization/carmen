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
  TrendingDown,
  Clock,
  AlertTriangle
} from "lucide-react"
import { formatCurrency, formatNumber } from '@/lib/utils/formatters'
import { GroupedTable, useGroupedTable } from '@/components/inventory/GroupedTable'
import { ExportButton } from '@/components/inventory/ExportButton'
import { createExportData, ExportColumn } from '@/lib/utils/export-utils'
import { SlowMovingItem, generateSlowMovingItems, groupSlowMovingByLocation } from '@/lib/mock-data/location-inventory'

export default function SlowMovingPage() {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [slowMovingItems, setSlowMovingItems] = useState<SlowMovingItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [riskLevelFilter, setRiskLevelFilter] = useState("all")
  const [actionFilter, setActionFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [sortField, setSortField] = useState("daysSinceMovement")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState<"list" | "grouped">("list")
  const [groupedItems, setGroupedItems] = useState<Array<{
    locationId: string
    locationName: string
    items: SlowMovingItem[]
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
    { key: 'currentStock', label: 'Current Stock', type: 'number' },
    { key: 'unit', label: 'Unit', type: 'text' },
    { key: 'value', label: 'Value', type: 'currency' },
    { key: 'daysSinceMovement', label: 'Days Since Movement', type: 'number' },
    { key: 'turnoverRate', label: 'Turnover Rate', type: 'number', formatter: (v) => `${v.toFixed(2)}x` },
    { key: 'riskLevel', label: 'Risk Level', type: 'text' },
    { key: 'suggestedAction', label: 'Suggested Action', type: 'text' },
    { key: 'lastMovementDate', label: 'Last Movement', type: 'date' }
  ]

  // Load mock data
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      const data = generateSlowMovingItems()
      setSlowMovingItems(data)

      // Also generate grouped data
      const grouped = groupSlowMovingByLocation(data)
      setGroupedItems(grouped)
      setGroups(grouped)

      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [setGroups])

  // Update grouped data when filters change
  useEffect(() => {
    if (slowMovingItems.length > 0) {
      const filtered = getFilteredItems()
      const grouped = groupSlowMovingByLocation(filtered)
      setGroupedItems(grouped)
      setGroups(grouped)
    }
  }, [searchTerm, categoryFilter, riskLevelFilter, actionFilter, locationFilter, user, slowMovingItems, setGroups])

  // Filter items based on user permissions and filters
  const getFilteredItems = () => {
    let filteredItems = slowMovingItems

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
          !item.productCode.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Category filter
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false
      }

      // Risk level filter
      if (riskLevelFilter !== "all" && item.riskLevel !== riskLevelFilter) {
        return false
      }

      // Action filter
      if (actionFilter !== "all" && item.suggestedAction !== actionFilter) {
        return false
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
        case "daysSinceMovement":
          comparison = a.daysSinceMovement - b.daysSinceMovement
          break
        case "currentStock":
          comparison = a.currentStock - b.currentStock
          break
        case "value":
          comparison = a.value - b.value
          break
        case "turnoverRate":
          comparison = a.turnoverRate - b.turnoverRate
          break
        default:
          comparison = a.daysSinceMovement - b.daysSinceMovement
      }

      return sortDirection === "asc" ? comparison : -comparison
    }), [slowMovingItems, searchTerm, categoryFilter, riskLevelFilter, actionFilter, locationFilter, sortField, sortDirection, user])

  // Get unique categories for filter
  const categories = Array.from(new Set(slowMovingItems.map(item => item.category)))
  const locations = Array.from(new Set(slowMovingItems.map(item => ({ id: item.locationId, name: item.locationName }))))

  // Prepare export data
  const exportData = useMemo(() => {
    const filters = {
      search: searchTerm,
      category: categoryFilter,
      riskLevel: riskLevelFilter,
      action: actionFilter,
      location: locationFilter
    }

    const totalItems = viewMode === 'grouped' ?
      groups.reduce((sum, group) => sum + group.items.length, 0) :
      filteredItems.length

    const totalValue = viewMode === 'grouped' ?
      groups.reduce((sum, group) => sum + group.items.reduce((gsum, item) => gsum + item.value, 0), 0) :
      filteredItems.reduce((sum, item) => sum + item.value, 0)

    const avgDaysSinceMovement = totalItems > 0 ?
      (viewMode === 'grouped' ?
        groups.reduce((sum, group) => sum + group.items.reduce((gsum, item) => gsum + item.daysSinceMovement, 0), 0) :
        filteredItems.reduce((sum, item) => sum + item.daysSinceMovement, 0)) / totalItems : 0

    const criticalItems = viewMode === 'grouped' ?
      groups.reduce((sum, group) => sum + group.items.filter(item => item.riskLevel === 'critical').length, 0) :
      filteredItems.filter(item => item.riskLevel === 'critical').length

    const summary = {
      'Total Items': totalItems,
      'Total Value': formatCurrency(totalValue),
      'Critical Risk Items': criticalItems,
      'Average Days Since Movement': Math.round(avgDaysSinceMovement),
      'View Mode': viewMode === 'grouped' ? 'Grouped by Location' : 'List View'
    }

    const data = createExportData(
      'Slow Moving Inventory Report',
      exportColumns,
      viewMode === 'grouped' ? groups : undefined,
      viewMode === 'grouped' ? calculateGrandTotals(['currentStock', 'value', 'daysSinceMovement']) : undefined,
      filters,
      summary
    )

    // Add items for list view
    if (viewMode === 'list') {
      data.items = filteredItems
    }

    return data
  }, [groups, filteredItems, viewMode, searchTerm, categoryFilter, riskLevelFilter, actionFilter, locationFilter, exportColumns, calculateGrandTotals])

  // Handle sort change
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Render risk level badge
  const renderRiskLevelBadge = (riskLevel: SlowMovingItem['riskLevel']) => {
    const variants = {
      low: { variant: "outline" as const, className: "bg-green-50 text-green-700 border-green-200" },
      medium: { variant: "outline" as const, className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      high: { variant: "outline" as const, className: "bg-orange-50 text-orange-700 border-orange-200" },
      critical: { variant: "destructive" as const, className: "" }
    }

    return (
      <Badge
        variant={variants[riskLevel].variant}
        className={variants[riskLevel].className}
      >
        {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
      </Badge>
    )
  }

  // Render suggested action badge
  const renderActionBadge = (action: SlowMovingItem['suggestedAction']) => {
    const variants = {
      transfer: { variant: "outline" as const, className: "bg-blue-50 text-blue-700 border-blue-200" },
      promote: { variant: "outline" as const, className: "bg-purple-50 text-purple-700 border-purple-200" },
      writeoff: { variant: "destructive" as const, className: "" },
      hold: { variant: "secondary" as const, className: "" }
    }

    return (
      <Badge
        variant={variants[action].variant}
        className={variants[action].className}
      >
        {action.charAt(0).toUpperCase() + action.slice(1)}
      </Badge>
    )
  }

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalItems = filteredItems.length
    const totalValue = filteredItems.reduce((sum, item) => sum + item.value, 0)
    const avgDaysSinceMovement = totalItems > 0 ? filteredItems.reduce((sum, item) => sum + item.daysSinceMovement, 0) / totalItems : 0
    const criticalItems = filteredItems.filter(item => item.riskLevel === 'critical').length

    return {
      totalItems,
      totalValue,
      avgDaysSinceMovement: Math.round(avgDaysSinceMovement),
      criticalItems
    }
  }, [filteredItems])

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
            <TrendingDown className="h-7 w-7 text-orange-600" />
            Slow Moving Inventory
          </h1>
          <p className="text-sm text-muted-foreground">
            Identify and manage products with low turnover rates
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{formatNumber(summaryStats.totalItems)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-blue-600" />
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
                <p className="text-sm text-muted-foreground">Avg Days Since Movement</p>
                <p className="text-2xl font-bold">{summaryStats.avgDaysSinceMovement}</p>
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
                <p className="text-sm text-muted-foreground">Critical Risk Items</p>
                <p className="text-2xl font-bold">{formatNumber(summaryStats.criticalItems)}</p>
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
                  placeholder="Search by product name or code..."
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

                <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Suggested Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="promote">Promote</SelectItem>
                    <SelectItem value="writeoff">Write Off</SelectItem>
                    <SelectItem value="hold">Hold</SelectItem>
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
                          onClick={() => handleSort("category")}
                        >
                          <div className="flex items-center">
                            Category
                            {sortField === "category" && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="py-3 font-medium text-gray-600">Location</TableHead>
                        <TableHead
                          className="py-3 font-medium text-gray-600 text-right cursor-pointer"
                          onClick={() => handleSort("daysSinceMovement")}
                        >
                          <div className="flex items-center justify-end">
                            Days Since Movement
                            {sortField === "daysSinceMovement" && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                            )}
                          </div>
                        </TableHead>
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
                        <TableHead className="py-3 font-medium text-gray-600 text-center">Risk Level</TableHead>
                        <TableHead className="py-3 font-medium text-gray-600 text-center">Suggested Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="h-24 text-center">
                            No slow moving items found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredItems.map((item) => (
                          <TableRow
                            key={`${item.locationId}-${item.productId}`}
                            className="hover:bg-gray-50/50"
                          >
                            <TableCell>{item.productCode}</TableCell>
                            <TableCell className="font-medium">{item.productName}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                {item.locationName}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{item.daysSinceMovement} days</TableCell>
                            <TableCell className="text-right">
                              {formatNumber(item.currentStock)} {item.unit}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.value)}
                            </TableCell>
                            <TableCell className="text-center">
                              {renderRiskLevelBadge(item.riskLevel)}
                            </TableCell>
                            <TableCell className="text-center">
                              {renderActionBadge(item.suggestedAction)}
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
                  { key: 'location', label: 'Location', type: 'text' },
                  { key: 'productCode', label: 'Code', type: 'text' },
                  { key: 'productName', label: 'Product', type: 'text' },
                  { key: 'category', label: 'Category', type: 'text' },
                  { key: 'daysSinceMovement', label: 'Days Since Movement', type: 'number' },
                  { key: 'currentStock', label: 'Stock', type: 'number' },
                  { key: 'value', label: 'Value', type: 'currency' },
                  { key: 'riskLevel', label: 'Risk Level', type: 'badge' },
                  { key: 'suggestedAction', label: 'Suggested Action', type: 'badge' },
                ]}
                renderRow={(item: SlowMovingItem) => (
                  <TableRow
                    key={`${item.locationId}-${item.productId}`}
                    className="hover:bg-gray-50/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {item.locationName}
                      </div>
                    </TableCell>
                    <TableCell>{item.productCode}</TableCell>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right">{item.daysSinceMovement} days</TableCell>
                    <TableCell className="text-right">
                      {formatNumber(item.currentStock)} {item.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.value)}
                    </TableCell>
                    <TableCell className="text-center">
                      {renderRiskLevelBadge(item.riskLevel)}
                    </TableCell>
                    <TableCell className="text-center">
                      {renderActionBadge(item.suggestedAction)}
                    </TableCell>
                  </TableRow>
                )}
                onToggleGroup={toggleGroup}
                showSubtotals={true}
                getGroupKeyMetrics={(subtotals) => [
                  { label: 'Items', value: subtotals.totalItems, type: 'number' },
                  { label: 'Avg Days', value: Math.round(subtotals.avgDaysSinceMovement || 0), type: 'number' },
                  { label: 'Total Value', value: formatCurrency(subtotals.totalValue), type: 'text' }
                ]}
                grandTotals={calculateGrandTotals(['totalItems', 'totalValue', 'avgDaysSinceMovement'])}
              />
            )}

            {/* Summary */}
            <div className="flex justify-between text-sm text-muted-foreground">
              <div>
                Showing {filteredItems.length} of {slowMovingItems.length} slow moving items
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