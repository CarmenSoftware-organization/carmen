"use client"

/**
 * Costing Analytics Panel
 * 
 * Advanced analytics panel for deep-dive cost analysis, variance tracking,
 * and predictive insights for portion-based pricing.
 */

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  DollarSign,
  Clock,
  BarChart3,
  Activity,
  Zap,
  Filter,
  Download,
  Calendar
} from 'lucide-react'

import {
  PortionCostBreakdown,
  CostVarianceAlert,
  VariantProfitabilityAnalysis,
  DynamicPricingResult
} from "@/lib/types/enhanced-costing-engine"

interface CostingAnalyticsPanelProps {
  recipeId?: string
  variantId?: string
  timeRange: string
  onExport?: () => void
}

// Mock data for analytics
const mockVarianceData = [
  { date: '2024-08-01', theoretical: 8.50, actual: 8.75, variance: 0.25 },
  { date: '2024-08-02', theoretical: 8.60, actual: 8.90, variance: 0.30 },
  { date: '2024-08-03', theoretical: 8.45, actual: 8.65, variance: 0.20 },
  { date: '2024-08-04', theoretical: 8.70, actual: 9.10, variance: 0.40 },
  { date: '2024-08-05', theoretical: 8.55, actual: 8.80, variance: 0.25 },
  { date: '2024-08-06', theoretical: 8.65, actual: 8.95, variance: 0.30 },
  { date: '2024-08-07', theoretical: 8.40, actual: 8.60, variance: 0.20 }
]

const mockEfficiencyData = [
  { category: 'Ingredient Usage', efficiency: 87.5, target: 90 },
  { category: 'Labor Efficiency', efficiency: 82.3, target: 85 },
  { category: 'Waste Reduction', efficiency: 91.2, target: 95 },
  { category: 'Portion Control', efficiency: 76.8, target: 80 },
  { category: 'Energy Usage', efficiency: 88.9, target: 85 }
]

const mockPricingScenarios = [
  { scenario: 'Current', price: 12.50, volume: 100, revenue: 1250, profit: 450, margin: 36 },
  { scenario: 'Optimal', price: 13.25, volume: 95, revenue: 1259, profit: 521, margin: 42 },
  { scenario: 'Premium', price: 14.50, volume: 85, revenue: 1233, profit: 598, margin: 48 },
  { scenario: 'Value', price: 11.75, volume: 115, revenue: 1351, profit: 378, margin: 28 }
]

const mockCostDrivers = [
  { driver: 'Ingredient Prices', impact: 45, trend: 'increasing' },
  { driver: 'Labor Costs', impact: 25, trend: 'stable' },
  { driver: 'Waste Levels', impact: 15, trend: 'decreasing' },
  { driver: 'Energy Costs', impact: 10, trend: 'increasing' },
  { driver: 'Packaging', impact: 5, trend: 'stable' }
]

export function CostingAnalyticsPanel({ 
  recipeId, 
  variantId, 
  timeRange, 
  onExport 
}: CostingAnalyticsPanelProps) {
  const [selectedMetric, setSelectedMetric] = useState('variance')
  const [analysisDepth, setAnalysisDepth] = useState('detailed')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getVarianceTrend = (variance: number) => {
    if (variance > 0.30) return { color: 'text-red-600', icon: AlertTriangle }
    if (variance > 0.15) return { color: 'text-orange-600', icon: TrendingUp }
    return { color: 'text-green-600', icon: Target }
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cost Analytics</h2>
          <p className="text-muted-foreground">
            Deep-dive analysis and variance tracking for {timeRange}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={analysisDepth} onValueChange={setAnalysisDepth}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">Summary</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={onExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Variance</p>
                <p className="text-2xl font-bold text-orange-600">+3.2%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cost Accuracy</p>
                <p className="text-2xl font-bold text-green-600">92.8%</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Efficiency Score</p>
                <p className="text-2xl font-bold text-blue-600">85.3</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Optimization Potential</p>
                <p className="text-2xl font-bold text-purple-600">$1,250</p>
              </div>
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="variance" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="variance">Variance Analysis</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency Metrics</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Analysis</TabsTrigger>
          <TabsTrigger value="drivers">Cost Drivers</TabsTrigger>
        </TabsList>

        {/* Variance Analysis Tab */}
        <TabsContent value="variance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Variance Trend Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Cost Variance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockVarianceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Line 
                      type="monotone" 
                      dataKey="theoretical" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Theoretical Cost"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      name="Actual Cost"
                    />
                    <Area
                      type="monotone"
                      dataKey="variance"
                      stroke="#F59E0B"
                      fill="#F59E0B"
                      fillOpacity={0.3}
                      name="Variance"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Variance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Variance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockVarianceData.slice(-3).map((item, index) => {
                    const trend = getVarianceTrend(item.variance)
                    const TrendIcon = trend.icon
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <TrendIcon className={`h-4 w-4 ${trend.color}`} />
                          <div>
                            <p className="font-medium">{item.date}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatPercentage((item.variance / item.theoretical) * 100)} variance
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(item.actual)}</p>
                          <p className="text-xs text-muted-foreground">
                            vs {formatCurrency(item.theoretical)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Efficiency Metrics Tab */}
        <TabsContent value="efficiency" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Efficiency Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Efficiency vs Targets</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockEfficiencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="efficiency" fill="#3B82F6" name="Current Efficiency" />
                    <Bar dataKey="target" fill="#10B981" name="Target" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Efficiency Details */}
            <Card>
              <CardHeader>
                <CardTitle>Efficiency Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEfficiencyData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.category}</span>
                        <span className={item.efficiency >= item.target ? 'text-green-600' : 'text-orange-600'}>
                          {formatPercentage(item.efficiency)} / {formatPercentage(item.target)}
                        </span>
                      </div>
                      <Progress 
                        value={(item.efficiency / item.target) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pricing Analysis Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pricing Scenarios */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Scenario Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={mockPricingScenarios}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="price" name="Price" unit="$" />
                    <YAxis dataKey="profit" name="Profit" unit="$" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'profit' ? formatCurrency(Number(value)) : value,
                        name === 'profit' ? 'Profit' : 'Price'
                      ]}
                    />
                    <Scatter 
                      data={mockPricingScenarios} 
                      fill="#3B82F6"
                      name="Scenarios"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Scenario Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Scenario Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPricingScenarios.map((scenario, index) => (
                    <div key={index} className={`p-3 rounded-lg border-2 ${
                      scenario.scenario === 'Optimal' 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{scenario.scenario}</h4>
                        {scenario.scenario === 'Optimal' && (
                          <Badge variant="default" className="bg-green-600">
                            <Target className="h-3 w-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span>Price:</span>
                          <span className="font-medium">{formatCurrency(scenario.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Volume:</span>
                          <span className="font-medium">{scenario.volume}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Revenue:</span>
                          <span className="font-medium">{formatCurrency(scenario.revenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Margin:</span>
                          <span className="font-medium">{formatPercentage(scenario.margin)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cost Drivers Tab */}
        <TabsContent value="drivers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Driver Impact */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Driver Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockCostDrivers.map(d => ({ name: d.driver, value: d.impact }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {mockCostDrivers.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Driver Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Driver Trends & Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCostDrivers.map((driver, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <p className="font-medium">{driver.driver}</p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            {driver.trend === 'increasing' && (
                              <TrendingUp className="h-3 w-3 text-red-500" />
                            )}
                            {driver.trend === 'decreasing' && (
                              <TrendingDown className="h-3 w-3 text-green-500" />
                            )}
                            {driver.trend === 'stable' && (
                              <div className="h-3 w-3 rounded-full bg-blue-500" />
                            )}
                            <span className="capitalize">{driver.trend}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{driver.impact}%</p>
                        <p className="text-xs text-muted-foreground">Impact</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CostingAnalyticsPanel