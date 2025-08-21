"use client"

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, ComposedChart, ScatterChart, Scatter
} from 'recharts'
import { 
  Download, Filter, RefreshCcw, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  DollarSign, Package, Target, Scale, Zap, AlertCircle, CheckCircle, BarChart3
} from 'lucide-react'

// Types for comparison analysis
interface FractionalVsWholeAnalysis {
  period: string
  location: string
  fractionalMetrics: {
    totalTransactions: number
    totalRevenue: number
    averageTransactionValue: number
    totalCost: number
    grossProfit: number
    profitMargin: number
    wastePercentage: number
    conversionEfficiency: number
  }
  wholeMetrics: {
    totalTransactions: number
    totalRevenue: number
    averageTransactionValue: number
    totalCost: number
    grossProfit: number
    profitMargin: number
    wastePercentage: number
    utilization: number
  }
  comparativeAnalysis: {
    revenuePerUnit: {
      fractional: number
      whole: number
      difference: number
      differencePercentage: number
    }
    profitability: {
      fractional: number
      whole: number
      difference: number
      differencePercentage: number
    }
    efficiency: {
      fractional: number
      whole: number
      difference: number
      differencePercentage: number
    }
    customerPreference: {
      fractionalPreference: number
      wholePreference: number
      trend: 'increasing' | 'decreasing' | 'stable'
    }
  }
  itemBreakdown: {
    itemId: string
    itemName: string
    fractionalPerformance: {
      revenue: number
      transactions: number
      averagePortionSize: number
      wasteRate: number
      profitMargin: number
    }
    wholePerformance: {
      revenue: number
      transactions: number
      wasteRate: number
      profitMargin: number
    }
    recommendation: 'favor_fractional' | 'favor_whole' | 'optimize_both' | 'discontinue'
    reasoning: string
  }[]
  seasonalTrends: {
    period: string
    fractionalShare: number
    wholeShare: number
    totalRevenue: number
    preferenceShift: number
  }[]
  optimizationOpportunities: {
    opportunity: string
    type: 'pricing' | 'portioning' | 'inventory' | 'menu_mix'
    currentValue: number
    targetValue: number
    potentialImpact: number
    implementation: 'easy' | 'moderate' | 'complex'
    timeframe: string
  }[]
}

interface FractionalComparisonReportsProps {
  locationId?: string
  timeRange?: 'today' | 'week' | 'month' | 'quarter'
}

export default function FractionalComparisonReports({
  locationId = 'main-kitchen',
  timeRange = 'week'
}: FractionalComparisonReportsProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedLocation, setSelectedLocation] = useState(locationId)
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)
  const [refreshing, setRefreshing] = useState(false)

  // Mock data for comprehensive analysis
  const mockAnalysis: FractionalVsWholeAnalysis = {
    period: selectedTimeRange,
    location: selectedLocation,
    fractionalMetrics: {
      totalTransactions: 487,
      totalRevenue: 15420.50,
      averageTransactionValue: 31.66,
      totalCost: 5147.70,
      grossProfit: 10272.80,
      profitMargin: 66.6,
      wastePercentage: 3.2,
      conversionEfficiency: 94.8
    },
    wholeMetrics: {
      totalTransactions: 312,
      totalRevenue: 18760.00,
      averageTransactionValue: 60.13,
      totalCost: 6252.00,
      grossProfit: 12508.00,
      profitMargin: 66.7,
      wastePercentage: 5.8,
      utilization: 87.3
    },
    comparativeAnalysis: {
      revenuePerUnit: {
        fractional: 31.66,
        whole: 60.13,
        difference: -28.47,
        differencePercentage: -47.3
      },
      profitability: {
        fractional: 66.6,
        whole: 66.7,
        difference: -0.1,
        differencePercentage: -0.15
      },
      efficiency: {
        fractional: 94.8,
        whole: 87.3,
        difference: 7.5,
        differencePercentage: 8.6
      },
      customerPreference: {
        fractionalPreference: 60.9,
        wholePreference: 39.1,
        trend: 'increasing'
      }
    },
    itemBreakdown: [
      {
        itemId: 'pizza-margherita',
        itemName: 'Margherita Pizza',
        fractionalPerformance: {
          revenue: 4280.50,
          transactions: 156,
          averagePortionSize: 0.125,
          wasteRate: 2.8,
          profitMargin: 68.2
        },
        wholePerformance: {
          revenue: 3850.00,
          transactions: 55,
          wasteRate: 4.2,
          profitMargin: 65.5
        },
        recommendation: 'favor_fractional',
        reasoning: 'Higher profit margin and lower waste rate with fractional sales'
      },
      {
        itemId: 'chocolate-cake',
        itemName: 'Chocolate Cake',
        fractionalPerformance: {
          revenue: 2840.00,
          transactions: 89,
          averagePortionSize: 0.1,
          wasteRate: 4.1,
          profitMargin: 72.5
        },
        wholePerformance: {
          revenue: 4200.00,
          transactions: 35,
          wasteRate: 8.2,
          profitMargin: 68.8
        },
        recommendation: 'optimize_both',
        reasoning: 'Strong performance in both formats, but whole cakes have higher waste'
      },
      {
        itemId: 'wine-bottle',
        itemName: 'House Red Wine',
        fractionalPerformance: {
          revenue: 1680.00,
          transactions: 112,
          averagePortionSize: 0.2,
          wasteRate: 1.5,
          profitMargin: 75.2
        },
        wholePerformance: {
          revenue: 2880.00,
          transactions: 24,
          wasteRate: 3.1,
          profitMargin: 70.8
        },
        recommendation: 'favor_fractional',
        reasoning: 'Glass sales offer higher profit margins and more customer accessibility'
      }
    ],
    seasonalTrends: [
      { period: 'Week 1', fractionalShare: 58.2, wholeShare: 41.8, totalRevenue: 8500, preferenceShift: 2.1 },
      { period: 'Week 2', fractionalShare: 61.5, wholeShare: 38.5, totalRevenue: 9200, preferenceShift: 3.3 },
      { period: 'Week 3', fractionalShare: 62.8, wholeShare: 37.2, totalRevenue: 8900, preferenceShift: 1.3 },
      { period: 'Week 4', fractionalShare: 60.9, wholeShare: 39.1, totalRevenue: 9800, preferenceShift: -1.9 }
    ],
    optimizationOpportunities: [
      {
        opportunity: 'Increase fractional pricing for premium items',
        type: 'pricing',
        currentValue: 31.66,
        targetValue: 34.50,
        potentialImpact: 8.9,
        implementation: 'easy',
        timeframe: '1-2 weeks'
      },
      {
        opportunity: 'Reduce whole item waste through better demand forecasting',
        type: 'inventory',
        currentValue: 5.8,
        targetValue: 3.5,
        potentialImpact: 15.2,
        implementation: 'moderate',
        timeframe: '1-2 months'
      },
      {
        opportunity: 'Optimize portion sizes for better margin balance',
        type: 'portioning',
        currentValue: 0.125,
        targetValue: 0.15,
        potentialImpact: 12.8,
        implementation: 'moderate',
        timeframe: '2-4 weeks'
      }
    ]
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setRefreshing(false)
  }

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  // Chart colors
  const COLORS = {
    fractional: '#8b5cf6',
    whole: '#06b6d4',
    profit: '#10b981',
    waste: '#ef4444',
    neutral: '#6b7280'
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fractional vs Whole Item Analysis</h2>
          <p className="text-muted-foreground">
            Comprehensive comparison of fractional and whole item performance
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
              <SelectItem value="all-locations">All Locations</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Updating...' : 'Refresh'}
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Revenue Comparison</span>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Fractional</span>
                  <span className="text-sm font-medium">{formatCurrency(mockAnalysis.fractionalMetrics.totalRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Whole</span>
                  <span className="text-sm font-medium">{formatCurrency(mockAnalysis.wholeMetrics.totalRevenue)}</span>
                </div>
                <div className="pt-2">
                  <Badge variant="secondary">
                    {mockAnalysis.fractionalMetrics.totalRevenue > mockAnalysis.wholeMetrics.totalRevenue ? 
                      'Fractional Leading' : 'Whole Leading'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Transaction Volume</span>
                <Target className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Fractional</span>
                  <span className="text-sm font-medium">{mockAnalysis.fractionalMetrics.totalTransactions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Whole</span>
                  <span className="text-sm font-medium">{mockAnalysis.wholeMetrics.totalTransactions}</span>
                </div>
                <div className="pt-2">
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">
                      {formatPercentage(mockAnalysis.comparativeAnalysis.customerPreference.fractionalPreference)} preference
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Profit Margin</span>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Fractional</span>
                  <span className="text-sm font-medium">{formatPercentage(mockAnalysis.fractionalMetrics.profitMargin)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Whole</span>
                  <span className="text-sm font-medium">{formatPercentage(mockAnalysis.wholeMetrics.profitMargin)}</span>
                </div>
                <div className="pt-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs text-muted-foreground">Nearly identical</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Waste Comparison</span>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Fractional</span>
                  <span className="text-sm font-medium">{formatPercentage(mockAnalysis.fractionalMetrics.wastePercentage)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Whole</span>
                  <span className="text-sm font-medium">{formatPercentage(mockAnalysis.wholeMetrics.wastePercentage)}</span>
                </div>
                <div className="pt-2">
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    Fractional 45% Lower
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="items">Item Analysis</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
                <CardDescription>Fractional vs whole item revenue comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        dataKey="value"
                        data={[
                          { name: 'Fractional Sales', value: mockAnalysis.fractionalMetrics.totalRevenue, fill: COLORS.fractional },
                          { name: 'Whole Sales', value: mockAnalysis.wholeMetrics.totalRevenue, fill: COLORS.whole }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profitability Analysis</CardTitle>
                <CardDescription>Profit margins and gross profit comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          category: 'Profit Margin %',
                          fractional: mockAnalysis.fractionalMetrics.profitMargin,
                          whole: mockAnalysis.wholeMetrics.profitMargin
                        },
                        {
                          category: 'Gross Profit ($)',
                          fractional: mockAnalysis.fractionalMetrics.grossProfit / 100,
                          whole: mockAnalysis.wholeMetrics.grossProfit / 100
                        }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'category' ? value : 
                          (value as number) > 10 ? formatCurrency((value as number) * 100) : formatPercentage(value as number),
                          name === 'fractional' ? 'Fractional' : 'Whole'
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="fractional" name="Fractional" fill={COLORS.fractional} />
                      <Bar dataKey="whole" name="Whole" fill={COLORS.whole} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Preference Trends</CardTitle>
              <CardDescription>Evolution of customer preferences over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockAnalysis.seasonalTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="fractionalShare"
                      name="Fractional Share"
                      stackId="1"
                      stroke={COLORS.fractional}
                      fill={COLORS.fractional}
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="wholeShare"
                      name="Whole Share"
                      stackId="1"
                      stroke={COLORS.whole}
                      fill={COLORS.whole}
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Efficiency Metrics</CardTitle>
                <CardDescription>Operational efficiency comparison</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Conversion Efficiency</span>
                    <span className="text-sm">{formatPercentage(mockAnalysis.fractionalMetrics.conversionEfficiency)}</span>
                  </div>
                  <Progress value={mockAnalysis.fractionalMetrics.conversionEfficiency} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Whole Item Utilization</span>
                    <span className="text-sm">{formatPercentage(mockAnalysis.wholeMetrics.utilization)}</span>
                  </div>
                  <Progress value={mockAnalysis.wholeMetrics.utilization} className="h-2" />
                </div>

                <Separator />
                
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium">Efficiency Advantage</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Fractional sales show {formatPercentage(mockAnalysis.comparativeAnalysis.efficiency.difference)} 
                    higher efficiency with lower waste rates
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(mockAnalysis.comparativeAnalysis.revenuePerUnit.fractional)}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Fractional Revenue</div>
                  <div className="text-xs text-green-600">vs {formatCurrency(mockAnalysis.comparativeAnalysis.revenuePerUnit.whole)} whole</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPercentage(mockAnalysis.comparativeAnalysis.customerPreference.fractionalPreference)}
                  </div>
                  <div className="text-sm text-muted-foreground">Customer Preference</div>
                  <div className="text-xs text-blue-600">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    {mockAnalysis.comparativeAnalysis.customerPreference.trend}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Radar</CardTitle>
              <CardDescription>Multi-dimensional performance comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={[
                      { metric: 'Revenue/Unit', fractional: 32, whole: 60 },
                      { metric: 'Profit Margin', fractional: 67, whole: 67 },
                      { metric: 'Efficiency', fractional: 95, whole: 87 },
                      { metric: 'Waste Control', fractional: 97, whole: 94 },
                      { metric: 'Customer Satisfaction', fractional: 88, whole: 85 }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="fractional" name="Fractional" fill={COLORS.fractional} fillOpacity={0.6} />
                    <Line 
                      type="monotone" 
                      dataKey="whole" 
                      name="Whole" 
                      stroke={COLORS.whole} 
                      strokeWidth={2}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Item Analysis Tab */}
        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Item-by-Item Performance Analysis</CardTitle>
              <CardDescription>Detailed breakdown of fractional vs whole performance by item</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Fractional Revenue</TableHead>
                    <TableHead className="text-right">Whole Revenue</TableHead>
                    <TableHead className="text-right">Profit Comparison</TableHead>
                    <TableHead className="text-right">Waste Comparison</TableHead>
                    <TableHead>Recommendation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAnalysis.itemBreakdown.map((item) => (
                    <TableRow key={item.itemId}>
                      <TableCell className="font-medium">{item.itemName}</TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <div>{formatCurrency(item.fractionalPerformance.revenue)}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.fractionalPerformance.transactions} transactions
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <div>{formatCurrency(item.wholePerformance.revenue)}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.wholePerformance.transactions} transactions
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-sm">F: {formatPercentage(item.fractionalPerformance.profitMargin)}</span>
                          </div>
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-sm text-muted-foreground">W: {formatPercentage(item.wholePerformance.profitMargin)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-sm">F: {formatPercentage(item.fractionalPerformance.wasteRate)}</span>
                          </div>
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-sm text-muted-foreground">W: {formatPercentage(item.wholePerformance.wasteRate)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge
                            variant={
                              item.recommendation === 'favor_fractional' ? 'default' :
                              item.recommendation === 'favor_whole' ? 'secondary' :
                              item.recommendation === 'optimize_both' ? 'outline' : 'destructive'
                            }
                            className="text-xs"
                          >
                            {item.recommendation.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <div className="text-xs text-muted-foreground">{item.reasoning}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-6">
          <div className="grid gap-6">
            {mockAnalysis.optimizationOpportunities.map((opportunity, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{opportunity.opportunity}</CardTitle>
                    <Badge
                      variant={
                        opportunity.implementation === 'easy' ? 'default' :
                        opportunity.implementation === 'moderate' ? 'secondary' : 'outline'
                      }
                    >
                      {opportunity.implementation.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription>
                    {opportunity.type.replace('_', ' ').toUpperCase()} • Potential Impact: {formatPercentage(opportunity.potentialImpact)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">Current Value</div>
                      <div className="text-2xl font-bold">
                        {opportunity.type === 'pricing' ? formatCurrency(opportunity.currentValue) :
                         opportunity.type === 'inventory' ? formatPercentage(opportunity.currentValue) :
                         opportunity.currentValue.toFixed(3)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">Target Value</div>
                      <div className="text-2xl font-bold text-green-600">
                        {opportunity.type === 'pricing' ? formatCurrency(opportunity.targetValue) :
                         opportunity.type === 'inventory' ? formatPercentage(opportunity.targetValue) :
                         opportunity.targetValue.toFixed(3)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">Implementation</div>
                      <div className="text-sm">{opportunity.timeframe}</div>
                      <Button size="sm" className="mt-2">
                        Start Implementation
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preference Shift Analysis</CardTitle>
              <CardDescription>How customer preferences are evolving over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockAnalysis.seasonalTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="fractionalShare" 
                      name="Fractional Preference" 
                      stroke={COLORS.fractional} 
                      strokeWidth={3}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="wholeShare" 
                      name="Whole Preference" 
                      stroke={COLORS.whole} 
                      strokeWidth={3}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="preferenceShift" 
                      name="Preference Shift" 
                      stroke={COLORS.neutral} 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Trend Insights</CardTitle>
                <CardDescription>Key observations from trend analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Growing Fractional Preference</div>
                    <div className="text-sm text-muted-foreground">
                      Fractional sales share increased by 4.7% over the analysis period
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Consistent Demand Pattern</div>
                    <div className="text-sm text-muted-foreground">
                      Both formats maintain steady demand with predictable fluctuations
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Scale className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Balanced Portfolio Approach</div>
                    <div className="text-sm text-muted-foreground">
                      Maintaining both formats optimizes revenue and customer satisfaction
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Correlation</CardTitle>
                <CardDescription>Relationship between fractional and whole sales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={mockAnalysis.seasonalTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" dataKey="fractionalShare" name="Fractional %" />
                      <YAxis type="number" dataKey="totalRevenue" name="Total Revenue" />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(value, name) => [
                          name === 'totalRevenue' ? formatCurrency(value as number) : `${value}%`,
                          name === 'fractionalShare' ? 'Fractional %' : 'Total Revenue'
                        ]}
                      />
                      <Scatter dataKey="totalRevenue" fill={COLORS.profit} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}