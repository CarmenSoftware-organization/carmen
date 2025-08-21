"use client"

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter,
  ComposedChart
} from 'recharts'
import { 
  Download, Filter, RefreshCcw, TrendingUp, TrendingDown, AlertTriangle,
  DollarSign, Package, PieChart as PieChartIcon, Activity, Target,
  Clock, Zap, ArrowUpRight, ArrowDownRight
} from 'lucide-react'

// Enhanced consumption tracking types
import {
  RealTimeConsumptionMetrics,
  LocationConsumptionAnalytics,
  ConsumptionVarianceAnalysis,
  FractionalSalesEfficiencyReport,
  IngredientConsumptionRecord,
  RecipeConsumptionSummary
} from '@/lib/types/enhanced-consumption-tracking'

interface EnhancedConsumptionDashboardProps {
  locationId?: string
  periodId?: string
  realTimeData?: RealTimeConsumptionMetrics
  analytics?: LocationConsumptionAnalytics
  varianceAnalysis?: ConsumptionVarianceAnalysis
  efficiencyReport?: FractionalSalesEfficiencyReport
  ingredientRecords?: IngredientConsumptionRecord[]
  recipeSummaries?: RecipeConsumptionSummary[]
}

export default function EnhancedConsumptionDashboard({
  locationId = 'main-kitchen',
  periodId = 'current',
  realTimeData,
  analytics,
  varianceAnalysis,
  efficiencyReport,
  ingredientRecords = [],
  recipeSummaries = []
}: EnhancedConsumptionDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('today')
  const [selectedLocation, setSelectedLocation] = useState(locationId)
  const [refreshInterval, setRefreshInterval] = useState<number | null>(30000) // 30 seconds

  // Mock data for demonstration
  const mockRealTimeData: RealTimeConsumptionMetrics = {
    timestamp: new Date(),
    location: selectedLocation,
    currentPeriodSales: 15430.50,
    currentPeriodCosts: 5201.75,
    currentPeriodProfit: 10228.75,
    todayTransactionCount: 284,
    todayFractionalSales: 157,
    todayWholeSales: 127,
    todayWastage: 89.25,
    liveIngredientLevels: [
      {
        ingredientId: 'chicken-breast',
        ingredientName: 'Chicken Breast',
        currentLevel: 45.5,
        projectedDepletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        reorderPoint: 25,
        status: 'low'
      },
      {
        ingredientId: 'fresh-vegetables',
        ingredientName: 'Fresh Vegetables',
        currentLevel: 8.2,
        projectedDepletion: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        reorderPoint: 15,
        status: 'critical'
      }
    ],
    kpis: {
      foodCostPercentage: 33.7,
      wastePercentage: 4.8,
      fractionalSalesConversionRate: 0.142,
      averageTransactionValue: 54.33,
      profitMargin: 66.3,
      yieldEfficiency: 92.8
    },
    alerts: [
      {
        type: 'stock_low',
        severity: 'critical',
        message: 'Fresh Vegetables are critically low',
        ingredientId: 'fresh-vegetables',
        currentValue: 8.2,
        threshold: 15,
        recommendedAction: 'Order immediately'
      },
      {
        type: 'variance_high',
        severity: 'warning',
        message: 'Chicken breast variance is above acceptable threshold',
        ingredientId: 'chicken-breast',
        currentValue: 12.5,
        threshold: 8,
        recommendedAction: 'Review portion control procedures'
      }
    ]
  }

  const currentData = realTimeData || mockRealTimeData

  // Consumption trend data (mock)
  const consumptionTrendData = [
    { day: '1', theoretical: 520, actual: 548, fractional: 320, whole: 228, waste: 28 },
    { day: '2', theoretical: 485, actual: 502, fractional: 295, whole: 207, waste: 17 },
    { day: '3', theoretical: 612, actual: 645, fractional: 380, whole: 265, waste: 33 },
    { day: '4', theoretical: 550, actual: 578, fractional: 340, whole: 238, waste: 28 },
    { day: '5', theoretical: 590, actual: 625, fractional: 365, whole: 260, waste: 35 },
    { day: '6', theoretical: 675, actual: 712, fractional: 420, whole: 292, waste: 37 },
    { day: '7', theoretical: 640, actual: 668, fractional: 395, whole: 273, waste: 28 }
  ]

  // Fractional sales efficiency data
  const fractionalEfficiencyData = [
    { type: 'Pizza Slice', transactions: 89, revenue: 442.11, efficiency: 95.2, waste: 3.8 },
    { type: 'Cake Slice', transactions: 34, revenue: 237.66, efficiency: 88.5, waste: 6.2 },
    { type: 'Portion Control', transactions: 28, revenue: 168.00, efficiency: 92.1, waste: 4.1 },
    { type: 'Bottle Glass', transactions: 6, revenue: 48.00, efficiency: 85.7, waste: 8.5 }
  ]

  // Top variance ingredients
  const varianceData = [
    { ingredient: 'Fresh Vegetables', theoretical: 125, actual: 142, variance: 13.6, trend: 'up' },
    { ingredient: 'Chicken Breast', theoretical: 210, actual: 234, variance: 11.4, trend: 'up' },
    { ingredient: 'Fresh Herbs', theoretical: 45, actual: 48, variance: 6.7, trend: 'stable' },
    { ingredient: 'Dairy Products', theoretical: 89, actual: 91, variance: 2.2, trend: 'down' },
    { ingredient: 'Grains', theoretical: 78, actual: 76, variance: -2.6, trend: 'down' }
  ]

  // Auto-refresh data
  useEffect(() => {
    if (!refreshInterval) return

    const interval = setInterval(() => {
      // In production, this would trigger a data refresh
      console.log('Refreshing consumption data...')
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval])

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Consumption Analytics</h1>
          <p className="text-muted-foreground">
            Real-time consumption tracking with fractional sales analytics
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="main-kitchen">Main Kitchen</SelectItem>
              <SelectItem value="pastry-section">Pastry Section</SelectItem>
              <SelectItem value="bar-station">Bar Station</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setRefreshInterval(refreshInterval ? null : 30000)}
            className={refreshInterval ? 'bg-green-50 border-green-200' : ''}
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${refreshInterval ? 'text-green-600' : ''}`} />
            Auto-refresh {refreshInterval ? 'ON' : 'OFF'}
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time Alerts */}
      {currentData.alerts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-lg text-amber-800">Active Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {currentData.alerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="outline" 
                      className={
                        alert.severity === 'critical' 
                          ? 'border-red-300 text-red-700 bg-red-50'
                          : alert.severity === 'warning'
                          ? 'border-amber-300 text-amber-700 bg-amber-50'
                          : 'border-blue-300 text-blue-700 bg-blue-50'
                      }
                    >
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <span className="font-medium">{alert.message}</span>
                  </div>
                  <Button size="sm" variant="outline">
                    {alert.recommendedAction}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Food Cost %</p>
                <p className="text-2xl font-bold">{formatPercentage(currentData.kpis.foodCostPercentage)}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="mt-2">
              <Progress value={currentData.kpis.foodCostPercentage} max={50} className="h-1" />
              <p className="text-xs text-muted-foreground mt-1">Target: 30%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Waste %</p>
                <p className="text-2xl font-bold">{formatPercentage(currentData.kpis.wastePercentage)}</p>
              </div>
              <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-red-600" />
              </div>
            </div>
            <div className="mt-2">
              <Progress value={currentData.kpis.wastePercentage} max={10} className="h-1" />
              <p className="text-xs text-muted-foreground mt-1">Target: 3%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fractional Rate</p>
                <p className="text-2xl font-bold">{formatPercentage(currentData.kpis.fractionalSalesConversionRate * 100)}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <PieChartIcon className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">+2.3%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Transaction</p>
                <p className="text-2xl font-bold">{formatCurrency(currentData.kpis.averageTransactionValue)}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">+5.7%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profit Margin</p>
                <p className="text-2xl font-bold">{formatPercentage(currentData.kpis.profitMargin)}</p>
              </div>
              <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Target className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div className="mt-2">
              <Progress value={currentData.kpis.profitMargin} max={100} className="h-1" />
              <p className="text-xs text-muted-foreground mt-1">Excellent</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Yield Efficiency</p>
                <p className="text-2xl font-bold">{formatPercentage(currentData.kpis.yieldEfficiency)}</p>
              </div>
              <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <div className="mt-2">
              <Progress value={currentData.kpis.yieldEfficiency} max={100} className="h-1" />
              <p className="text-xs text-muted-foreground mt-1">Good performance</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fractional">Fractional Sales</TabsTrigger>
          <TabsTrigger value="variance">Variance Analysis</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Consumption Trends</CardTitle>
                <CardDescription>Theoretical vs actual consumption over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={consumptionTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), undefined]} />
                      <Legend />
                      <Bar dataKey="waste" name="Waste" fill="#ef4444" />
                      <Line 
                        type="monotone" 
                        dataKey="theoretical" 
                        name="Theoretical" 
                        stroke="#6366f1" 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="actual" 
                        name="Actual" 
                        stroke="#059669" 
                        strokeWidth={2}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales Distribution</CardTitle>
                <CardDescription>Fractional vs whole item sales breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={consumptionTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), undefined]} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="fractional"
                        name="Fractional Sales"
                        stackId="1"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="whole"
                        name="Whole Sales"
                        stackId="1"
                        stroke="#06b6d4"
                        fill="#06b6d4"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Fractional Sales Tab */}
        <TabsContent value="fractional" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Fractional Sales Efficiency by Type</CardTitle>
                <CardDescription>Revenue and efficiency metrics for different fractional sale types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fractionalEfficiencyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="revenue" name="Revenue ($)" fill="#10b981" />
                      <Bar yAxisId="left" dataKey="transactions" name="Transactions" fill="#6366f1" />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="efficiency" 
                        name="Efficiency %" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Fractional Sales</CardTitle>
                <CardDescription>Real-time fractional sales metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Transactions</span>
                  <span className="text-2xl font-bold">{currentData.todayFractionalSales}</span>
                </div>
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pizza Slices</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">89</div>
                      <div className="text-xs text-muted-foreground">56.7%</div>
                    </div>
                  </div>
                  <Progress value={56.7} className="h-1" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cake Slices</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">34</div>
                      <div className="text-xs text-muted-foreground">21.7%</div>
                    </div>
                  </div>
                  <Progress value={21.7} className="h-1" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Portions</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">28</div>
                      <div className="text-xs text-muted-foreground">17.8%</div>
                    </div>
                  </div>
                  <Progress value={17.8} className="h-1" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Others</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">6</div>
                      <div className="text-xs text-muted-foreground">3.8%</div>
                    </div>
                  </div>
                  <Progress value={3.8} className="h-1" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Variance Analysis Tab */}
        <TabsContent value="variance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Variance Ingredients</CardTitle>
              <CardDescription>Ingredients with highest variance between theoretical and actual consumption</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {varianceData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <div>
                        <div className="font-medium">{item.ingredient}</div>
                        <div className="text-sm text-muted-foreground">
                          Theoretical: {formatCurrency(item.theoretical)} | Actual: {formatCurrency(item.actual)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`font-medium ${item.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {item.variance > 0 ? '+' : ''}{formatPercentage(item.variance)}
                        </div>
                        <div className="text-xs text-muted-foreground">variance</div>
                      </div>
                      <div className="w-6 h-6 flex items-center justify-center">
                        {item.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : item.trend === 'down' ? (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="w-4 h-0.5 bg-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ingredients Tab */}
        <TabsContent value="ingredients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Ingredient Levels</CardTitle>
              <CardDescription>Real-time inventory status with consumption projections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {currentData.liveIngredientLevels.map((ingredient, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{ingredient.ingredientName}</span>
                      <Badge 
                        variant="outline"
                        className={
                          ingredient.status === 'critical' 
                            ? 'border-red-300 text-red-700 bg-red-50'
                            : ingredient.status === 'low'
                            ? 'border-amber-300 text-amber-700 bg-amber-50'
                            : 'border-green-300 text-green-700 bg-green-50'
                        }
                      >
                        {ingredient.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Current Level</span>
                        <span className="text-sm font-medium">{ingredient.currentLevel} units</span>
                      </div>
                      <Progress 
                        value={(ingredient.currentLevel / (ingredient.reorderPoint * 2)) * 100} 
                        className="h-2" 
                      />
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">Reorder: {ingredient.reorderPoint}</span>
                        <span className="text-xs text-muted-foreground">
                          {ingredient.projectedDepletion ? (
                            <>Depletion: {ingredient.projectedDepletion.toLocaleDateString()}</>
                          ) : (
                            'Stock adequate'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Efficiency Tab */}
        <TabsContent value="efficiency" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Yield Efficiency Trends</CardTitle>
                <CardDescription>Recipe yield efficiency over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={consumptionTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis domain={[80, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Efficiency']} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="theoretical" 
                        name="Target Efficiency" 
                        stroke="#6366f1" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="actual" 
                        name="Actual Efficiency" 
                        stroke="#10b981" 
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimization Opportunities</CardTitle>
                <CardDescription>Potential improvements identified</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Reduce Vegetable Waste</span>
                      <Badge>High Impact</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Improve storage and handling procedures to reduce 13.6% variance
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Potential Savings: {formatCurrency(125.50)}/day</span>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Optimize Portion Sizes</span>
                      <Badge variant="outline">Medium Impact</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Standardize fractional portion sizes for better yield control
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Potential Savings: {formatCurrency(89.25)}/day</span>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Recipe Standardization</span>
                      <Badge variant="outline">Long Term</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Update recipe specifications based on actual consumption patterns
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Potential Savings: {formatCurrency(67.80)}/day</span>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}