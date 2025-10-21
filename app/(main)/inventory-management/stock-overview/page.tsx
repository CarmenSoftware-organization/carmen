'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Building2,
  Package,
  TrendingUp,
  AlertTriangle,
  Clock,
  BarChart3,
  ArrowRight,
  MapPin
} from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@/lib/context/simple-user-context'
import {
  getAllLocationStock,
  getAggregateMetrics,
  generateLocationComparison,
  generateTransferSuggestions,
  type LocationStockData,
  type LocationComparison,
  type TransferSuggestion
} from '@/lib/mock-data/location-inventory'
import { formatCurrency, formatNumber } from '@/lib/utils/formatters'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

interface StockOverviewData {
  allLocationData: LocationStockData[]
  aggregateMetrics: ReturnType<typeof getAggregateMetrics>
  locationComparison: LocationComparison[]
  transferSuggestions: TransferSuggestion[]
}

export default function StockOverviewPage() {
  const { user } = useUser()
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [data, setData] = useState<StockOverviewData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize data
  useEffect(() => {
    const timer = setTimeout(() => {
      setData({
        allLocationData: getAllLocationStock(),
        aggregateMetrics: getAggregateMetrics(),
        locationComparison: generateLocationComparison(),
        transferSuggestions: generateTransferSuggestions()
      })
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading || !data) {
    return <div className="container mx-auto py-6">Loading...</div>
  }

  const { allLocationData, aggregateMetrics, locationComparison, transferSuggestions } = data

  // Filter data based on selected location and user permissions
  const getFilteredLocationData = () => {
    let locations = allLocationData

    // Filter by user's accessible locations if not admin
    if (user?.role !== 'System Administrator') {
      const userLocationIds = user?.availableLocations?.map(l => l.id) || []
      locations = locations.filter(loc => userLocationIds.includes(loc.locationId))
    }

    // Filter by selected location
    if (selectedLocation !== 'all') {
      locations = locations.filter(loc => loc.locationId === selectedLocation)
    }

    return locations
  }

  const filteredData = getFilteredLocationData()
  const currentLocationMetrics = selectedLocation === 'all' ? aggregateMetrics :
    allLocationData.find(loc => loc.locationId === selectedLocation)?.metrics

  // Chart data for stock distribution
  const categoryChartData = filteredData.length === 1
    ? filteredData[0].categories.map(cat => ({
        name: cat.categoryName,
        quantity: cat.quantity,
        value: cat.value.amount
      }))
    : allLocationData.flatMap(loc => loc.categories)
        .reduce((acc, cat) => {
          const existing = acc.find(item => item.name === cat.categoryName)
          if (existing) {
            existing.quantity += cat.quantity
            existing.value += cat.value.amount
          } else {
            acc.push({ name: cat.categoryName, quantity: cat.quantity, value: cat.value.amount })
          }
          return acc
        }, [] as { name: string; quantity: number; value: number }[])

  // Location performance chart data
  const performanceChartData = locationComparison.map(loc => ({
    name: loc.locationName.substring(0, 10) + (loc.locationName.length > 10 ? '...' : ''),
    efficiency: loc.metrics.stockEfficiency,
    turnover: loc.metrics.turnoverRate,
    fillRate: loc.metrics.fillRate
  }))

  const getPerformanceBadgeColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'average': return 'bg-yellow-100 text-yellow-800'
      case 'poor': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with Location Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock Overview</h1>
          <p className="text-sm text-muted-foreground">
            Monitor inventory levels across all locations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {user?.availableLocations?.map(location => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              )) || allLocationData.map(loc => (
                <SelectItem key={loc.locationId} value={loc.locationId}>
                  {loc.locationName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedLocation === 'all'
                ? formatNumber(aggregateMetrics.totalItems)
                : formatNumber(currentLocationMetrics?.totalItems || 0)
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Across {selectedLocation === 'all' ? `${filteredData.length} locations` : '1 location'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedLocation === 'all'
                ? formatCurrency(aggregateMetrics.totalValue.amount)
                : formatCurrency(currentLocationMetrics?.totalValue.amount || 0)
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Current inventory value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {selectedLocation === 'all'
                ? aggregateMetrics.totalLowStock
                : currentLocationMetrics?.lowStockCount || 0
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Items below reorder point
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {selectedLocation === 'all'
                ? aggregateMetrics.totalExpiring
                : currentLocationMetrics?.expiringCount || 0
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Items expiring this week
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="transfers">Transfer Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Stock Distribution by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'quantity' ? `${value} items` : formatCurrency(Number(value)),
                      name === 'quantity' ? 'Quantity' : 'Value'
                    ]} />
                    <Bar dataKey="quantity" fill="#8884d8" name="quantity" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Value Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Value Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quick Navigation */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/inventory-management/stock-overview/inventory-balance">
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <BarChart3 className="h-6 w-6" />
                    <span className="text-sm">Inventory Balance</span>
                  </Button>
                </Link>
                <Link href="/inventory-management/stock-overview/stock-cards">
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <Package className="h-6 w-6" />
                    <span className="text-sm">Stock Cards</span>
                  </Button>
                </Link>
                <Link href="/inventory-management/stock-overview/slow-moving">
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <Clock className="h-6 w-6" />
                    <span className="text-sm">Slow Moving</span>
                  </Button>
                </Link>
                <Link href="/inventory-management/stock-overview/inventory-aging">
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <AlertTriangle className="h-6 w-6" />
                    <span className="text-sm">Inventory Aging</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Location Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Location Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={performanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="efficiency" fill="#8884d8" name="Stock Efficiency %" />
                  <Bar dataKey="turnover" fill="#82ca9d" name="Turnover Rate" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Location Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Location Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {locationComparison.map(location => (
                  <div key={location.locationId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{location.locationName}</h4>
                        <Badge className={getPerformanceBadgeColor(location.performance)}>
                          {location.performance}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div>Efficiency: {location.metrics.stockEfficiency}%</div>
                      <div>Turnover: {location.metrics.turnoverRate.toFixed(1)}x</div>
                      <div>Fill Rate: {location.metrics.fillRate}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Suggestions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Optimize stock distribution across locations
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transferSuggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{suggestion.itemName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {suggestion.fromLocation} → {suggestion.toLocation}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Qty: {suggestion.suggestedQuantity} • {suggestion.reason.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getPriorityBadgeColor(suggestion.priority)}>
                        {suggestion.priority}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">
                          Save {formatCurrency(suggestion.potentialSavings.amount)}
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Create Transfer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}