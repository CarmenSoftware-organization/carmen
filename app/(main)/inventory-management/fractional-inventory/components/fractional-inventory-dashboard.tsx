'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Search,
  Filter,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Package,
  Scissors,
  Combine,
  RefreshCw,
  Eye,
  Settings,
  BarChart3,
  PieChart,
  Activity,
  Zap
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { 
  FractionalStock, 
  FractionalItem, 
  FractionalInventoryMetrics,
  FractionalItemState,
  InventoryAlert 
} from '@/lib/types/fractional-inventory'

interface FractionalInventoryDashboardProps {
  locationId?: string
  onStockSelect?: (stock: FractionalStock) => void
  onConversionRequest?: (stockId: string, type: 'split' | 'combine') => void
}

export function FractionalInventoryDashboard({
  locationId,
  onStockSelect,
  onConversionRequest
}: FractionalInventoryDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedState, setSelectedState] = useState<FractionalItemState | 'ALL'>('ALL')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'portions'>('portions')
  const [metrics, setMetrics] = useState<FractionalInventoryMetrics | null>(null)
  const [stocks, setStocks] = useState<FractionalStock[]>([])
  const [items, setItems] = useState<FractionalItem[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data - replace with actual API calls
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      
      // Mock fractional items
      const mockItems: FractionalItem[] = [
        {
          id: 'item-1',
          itemCode: 'PIZZA-MAR',
          itemName: 'Margherita Pizza (Large)',
          category: 'Food',
          baseUnit: 'Whole Pizza',
          supportsFractional: true,
          allowPartialSales: true,
          trackPortions: true,
          availablePortions: [
            { id: 'slice-8', name: 'Slice', portionsPerWhole: 8, isActive: true },
            { id: 'half-2', name: 'Half', portionsPerWhole: 2, isActive: true },
            { id: 'quarter-4', name: 'Quarter', portionsPerWhole: 4, isActive: true }
          ],
          defaultPortionId: 'slice-8',
          shelfLifeHours: 4,
          maxQualityHours: 2,
          allowAutoConversion: true,
          wastePercentage: 5,
          baseCostPerUnit: 250,
          conversionCostPerUnit: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'item-2',
          itemCode: 'CAKE-CHOC',
          itemName: 'Chocolate Cake',
          category: 'Dessert',
          baseUnit: 'Whole Cake',
          supportsFractional: true,
          allowPartialSales: true,
          trackPortions: true,
          availablePortions: [
            { id: 'slice-12', name: 'Slice', portionsPerWhole: 12, isActive: true },
            { id: 'half-2', name: 'Half', portionsPerWhole: 2, isActive: true }
          ],
          defaultPortionId: 'slice-12',
          shelfLifeHours: 24,
          maxQualityHours: 12,
          allowAutoConversion: true,
          wastePercentage: 3,
          baseCostPerUnit: 180,
          conversionCostPerUnit: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]

      // Mock fractional stocks
      const mockStocks: FractionalStock[] = [
        {
          id: 'stock-1',
          itemId: 'item-1',
          locationId: locationId || 'main-kitchen',
          currentState: 'PREPARED',
          stateTransitionDate: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          qualityGrade: 'GOOD',
          wholeUnitsAvailable: 5,
          partialQuantityAvailable: 0,
          totalPortionsAvailable: 40,
          reservedPortions: 8,
          originalWholeUnits: 5,
          originalTotalPortions: 40,
          conversionsApplied: [],
          totalWasteGenerated: 2.5,
          preparedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 3.5).toISOString(),
          createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          id: 'stock-2',
          itemId: 'item-2',
          locationId: locationId || 'main-kitchen',
          currentState: 'PORTIONED',
          stateTransitionDate: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          qualityGrade: 'EXCELLENT',
          wholeUnitsAvailable: 2,
          partialQuantityAvailable: 0,
          totalPortionsAvailable: 18,
          reservedPortions: 3,
          originalWholeUnits: 3,
          originalTotalPortions: 36,
          conversionsApplied: [],
          totalWasteGenerated: 0.9,
          preparedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          portionedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString(),
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        }
      ]

      // Mock metrics
      const mockMetrics: FractionalInventoryMetrics = {
        totalWholeUnits: 7,
        totalPortionsAvailable: 58,
        totalReservedPortions: 11,
        totalValueOnHand: 1450,
        dailyConversions: 12,
        conversionEfficiency: 0.92,
        wastePercentage: 4.2,
        averageQualityGrade: 4.3,
        itemsNearExpiry: 1,
        qualityDegradationRate: 0.05,
        turnoverRate: 2.3,
        stockoutEvents: 0,
        conversionBacklog: 2,
        activeAlerts: [
          {
            id: 'alert-1',
            type: 'CONVERSION_RECOMMENDED',
            severity: 'MEDIUM',
            itemId: 'item-1',
            stockId: 'stock-1',
            locationId: locationId || 'main-kitchen',
            title: 'Conversion Opportunity',
            message: 'Consider portioning prepared pizzas to meet expected demand',
            triggeredAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            triggeredBy: 'SYSTEM',
            recommendedActions: [
              {
                action: 'CONVERT',
                priority: 1,
                description: 'Convert 3 whole pizzas to slices',
                estimatedImpact: '+24 portions available'
              }
            ],
            isActive: true
          }
        ],
        recommendedConversions: []
      }

      setItems(mockItems)
      setStocks(mockStocks)
      setMetrics(mockMetrics)
      setLoading(false)
    }

    loadData()
  }, [locationId])

  const getStateColor = (state: FractionalItemState) => {
    const colors = {
      'RAW': 'bg-gray-100 text-gray-700',
      'PREPARED': 'bg-blue-100 text-blue-700',
      'PORTIONED': 'bg-green-100 text-green-700',
      'PARTIAL': 'bg-yellow-100 text-yellow-700',
      'COMBINED': 'bg-purple-100 text-purple-700',
      'WASTE': 'bg-red-100 text-red-700'
    }
    return colors[state] || 'bg-gray-100 text-gray-700'
  }

  const getQualityColor = (grade: string) => {
    const colors: { [key: string]: string } = {
      'EXCELLENT': 'text-green-600',
      'GOOD': 'text-blue-600',
      'FAIR': 'text-yellow-600',
      'POOR': 'text-orange-600',
      'EXPIRED': 'text-red-600'
    }
    return colors[grade] || 'text-gray-600'
  }

  const calculatePortionUtilization = (stock: FractionalStock) => {
    const utilization = ((stock.originalTotalPortions - stock.totalPortionsAvailable) / stock.originalTotalPortions) * 100
    return Math.max(0, Math.min(100, utilization))
  }

  const getTimeToExpiry = (expiresAt: string) => {
    const now = Date.now()
    const expiry = new Date(expiresAt).getTime()
    const hoursToExpiry = (expiry - now) / (1000 * 60 * 60)
    
    if (hoursToExpiry < 0) return 'Expired'
    if (hoursToExpiry < 1) return `${Math.round(hoursToExpiry * 60)}m`
    if (hoursToExpiry < 24) return `${Math.round(hoursToExpiry)}h`
    return `${Math.round(hoursToExpiry / 24)}d`
  }

  const filteredStocks = stocks.filter(stock => {
    const item = items.find(i => i.id === stock.itemId)
    if (!item) return false
    
    const matchesSearch = searchTerm === '' || 
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesState = selectedState === 'ALL' || stock.currentState === selectedState
    
    return matchesSearch && matchesState
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Fractional Inventory</h1>
          <p className="text-muted-foreground">
            Track portioned items, conversions, and quality states
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode('grid')}>
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewMode('list')}>
            <Activity className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewMode('portions')}>
            <PieChart className="h-4 w-4" />
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Portions</p>
                <p className="text-2xl font-bold">{metrics?.totalPortionsAvailable}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% from yesterday
                </p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Efficiency</p>
                <p className="text-2xl font-bold">{((metrics?.conversionEfficiency || 0) * 100).toFixed(1)}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Above target
                </p>
              </div>
              <Zap className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">฿{metrics?.totalValueOnHand.toLocaleString()}</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5.2% this week
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">{metrics?.activeAlerts.length}</p>
                <p className="text-xs text-orange-600 flex items-center mt-1">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Requires attention
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {metrics?.activeAlerts && metrics.activeAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.activeAlerts.map((alert) => (
              <Alert key={alert.id} className="border-orange-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    {alert.recommendedActions.length > 0 && (
                      <p className="text-sm text-blue-600 mt-1">
                        Recommended: {alert.recommendedActions[0].description}
                      </p>
                    )}
                  </div>
                  <Badge variant={alert.severity === 'HIGH' ? 'destructive' : 'secondary'}>
                    {alert.severity}
                  </Badge>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="border rounded-md px-3 py-2 bg-white"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value as FractionalItemState | 'ALL')}
          >
            <option value="ALL">All States</option>
            <option value="RAW">Raw</option>
            <option value="PREPARED">Prepared</option>
            <option value="PORTIONED">Portioned</option>
            <option value="PARTIAL">Partial</option>
          </select>
          <Button 
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Stock Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStocks.map((stock) => {
          const item = items.find(i => i.id === stock.itemId)
          if (!item) return null

          const utilizationPercentage = calculatePortionUtilization(stock)
          const availablePercentage = (stock.totalPortionsAvailable / stock.originalTotalPortions) * 100
          const reservedPercentage = (stock.reservedPortions / stock.originalTotalPortions) * 100

          return (
            <Card key={stock.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{item.itemName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{item.itemCode}</p>
                  </div>
                  <div className="flex gap-1">
                    <Badge className={getStateColor(stock.currentState)}>
                      {stock.currentState}
                    </Badge>
                    <Badge variant="outline" className={getQualityColor(stock.qualityGrade)}>
                      {stock.qualityGrade}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Portion Visualization */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Portion Usage</span>
                    <span>{utilizationPercentage.toFixed(1)}% used</span>
                  </div>
                  <div className="relative">
                    <Progress value={availablePercentage} className="h-6" />
                    <div 
                      className="absolute top-0 right-0 h-6 bg-yellow-200 rounded-r"
                      style={{ width: `${reservedPercentage}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                      {stock.totalPortionsAvailable} / {stock.originalTotalPortions} portions
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Available: {stock.totalPortionsAvailable}</span>
                    <span>Reserved: {stock.reservedPortions}</span>
                    <span>Used: {stock.originalTotalPortions - stock.totalPortionsAvailable}</span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Whole Units</p>
                    <p className="font-medium">{stock.wholeUnitsAvailable}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Waste Generated</p>
                    <p className="font-medium">{stock.totalWasteGenerated.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Time to Expiry</p>
                    <p className={`font-medium ${
                      stock.expiresAt && new Date(stock.expiresAt).getTime() < Date.now() + (4 * 60 * 60 * 1000) 
                        ? 'text-orange-600' 
                        : 'text-green-600'
                    }`}>
                      {stock.expiresAt ? getTimeToExpiry(stock.expiresAt) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Value</p>
                    <p className="font-medium">
                      ฿{((stock.wholeUnitsAvailable * item.baseCostPerUnit) + 
                        (stock.totalPortionsAvailable * (item.baseCostPerUnit / 8))).toFixed(0)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    onClick={() => onStockSelect?.(stock)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onConversionRequest?.(stock.id, 'split')}
                    disabled={stock.wholeUnitsAvailable === 0}
                  >
                    <Scissors className="h-4 w-4 mr-1" />
                    Split
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onConversionRequest?.(stock.id, 'combine')}
                    disabled={stock.totalPortionsAvailable < 4}
                  >
                    <Combine className="h-4 w-4 mr-1" />
                    Combine
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredStocks.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No fractional inventory found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedState !== 'ALL' 
                ? 'Try adjusting your search or filters'
                : 'Add fractional items to get started with portion tracking'
              }
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Fractional Item
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}