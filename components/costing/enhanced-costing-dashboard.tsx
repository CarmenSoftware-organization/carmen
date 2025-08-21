"use client"

/**
 * Enhanced Costing Dashboard
 * 
 * Real-time costing dashboard for portion-based pricing with advanced analytics,
 * dynamic pricing recommendations, and profitability insights.
 */

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  Calculator,
  Zap,
  RefreshCw
} from 'lucide-react'

import {
  CostingDashboardMetrics,
  PortionCostBreakdown,
  DynamicPricingResult,
  CostVarianceAlert,
  VariantProfitabilityAnalysis
} from "@/lib/types/enhanced-costing-engine"

interface EnhancedCostingDashboardProps {
  location: string
  period: string
  onRefresh?: () => void
}

// Mock data for demonstration
const mockDashboardMetrics: CostingDashboardMetrics = {
  location: "Main Kitchen",
  period: "2024-08",
  generatedAt: new Date(),
  totalRecipes: 156,
  totalVariants: 423,
  averageFoodCostPercentage: 32.5,
  overallProfitMargin: 67.5,
  costTrends: [
    { period: "Week 1", averageCost: 8.50, averageRevenue: 12.75, averageMargin: 4.25 },
    { period: "Week 2", averageCost: 8.75, averageRevenue: 13.00, averageMargin: 4.25 },
    { period: "Week 3", averageCost: 9.00, averageRevenue: 13.50, averageMargin: 4.50 },
    { period: "Week 4", averageCost: 9.25, averageRevenue: 14.00, averageMargin: 4.75 }
  ],
  topProfitableVariants: [
    { recipeId: "pizza-1", recipeName: "Margherita Pizza", variantId: "slice", variantName: "Single Slice", profitMargin: 72.3, revenue: 4850.00 },
    { recipeId: "cake-1", recipeName: "Chocolate Cake", variantId: "slice", variantName: "Slice", profitMargin: 68.9, revenue: 3200.00 },
    { recipeId: "pasta-1", recipeName: "Carbonara", variantId: "half", variantName: "Half Portion", profitMargin: 65.2, revenue: 2890.00 }
  ],
  costVarianceAlerts: [],
  totalWasteValue: 1850.75,
  wasteReductionOpportunity: 925.50,
  topWasteItems: [
    { ingredientName: "Fresh Mozzarella", wasteValue: 245.80, wastePercentage: 12.5 },
    { ingredientName: "Tomatoes", wasteValue: 189.30, wastePercentage: 8.7 },
    { ingredientName: "Fresh Basil", wasteValue: 156.90, wastePercentage: 15.2 }
  ],
  pricingOpportunities: [
    { recipeId: "burger-1", variantId: "full", currentMargin: 58.2, optimizedMargin: 65.8, revenueImpact: 890.50 },
    { recipeId: "salad-1", variantId: "large", currentMargin: 45.6, optimizedMargin: 52.3, revenueImpact: 650.25 }
  ],
  competitiveAlerts: [
    { competitorName: "Tony's Pizza", productName: "Pizza Slice", priceChange: -0.50, impactAssessment: "Moderate competitive pressure" }
  ]
}

const mockCostBreakdowns: PortionCostBreakdown[] = [
  {
    recipeId: "pizza-1",
    recipeName: "Margherita Pizza",
    variantId: "slice",
    variantName: "Single Slice",
    portionSize: "1/8 pizza",
    calculatedAt: new Date(),
    ingredientCost: 3.45,
    ingredientCostPerGram: 0.023,
    preparationLaborCost: 1.25,
    cookingLaborCost: 0.85,
    serviceLaborCost: 0.35,
    totalLaborCost: 2.45,
    utilitiesCost: 0.45,
    equipmentCost: 0.25,
    facilityCost: 0.15,
    packagingCost: 0.35,
    totalOverheadCost: 1.20,
    wasteCost: 0.35,
    spillageCost: 0.15,
    spoilageCost: 0.05,
    totalLossCost: 0.55,
    directCost: 5.90,
    indirectCost: 1.75,
    totalCost: 7.65,
    baseRecipeUnitsUsed: 0.125,
    costPerBaseUnit: 61.20,
    costAccuracy: 0.92,
    lastUpdated: new Date()
  }
]

export function EnhancedCostingDashboard({ 
  location, 
  period, 
  onRefresh 
}: EnhancedCostingDashboardProps) {
  const [metrics, setMetrics] = useState<CostingDashboardMetrics>(mockDashboardMetrics)
  const [costBreakdowns, setCostBreakdowns] = useState<PortionCostBreakdown[]>(mockCostBreakdowns)
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false)
      onRefresh?.()
    }, 1500)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enhanced Costing Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time cost analysis and pricing optimization for {location} - {period}
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Food Cost %</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(metrics.averageFoodCostPercentage)}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 mr-1 text-green-500" />
              2.1% vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Margin</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPercentage(metrics.overallProfitMargin)}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
              3.2% vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waste Value</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(metrics.totalWasteValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Reduction opportunity: {formatCurrency(metrics.wasteReductionOpportunity)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Recipes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalRecipes}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalVariants} total variants
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {metrics.costVarianceAlerts.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {metrics.costVarianceAlerts.length} cost variance alerts requiring attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cost-analysis">Cost Analysis</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
          <TabsTrigger value="waste-analysis">Waste Analysis</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={metrics.costTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Area 
                      type="monotone" 
                      dataKey="averageRevenue" 
                      stackId="1" 
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.6} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="averageCost" 
                      stackId="1" 
                      stroke="#EF4444" 
                      fill="#EF4444" 
                      fillOpacity={0.6} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.topProfitableVariants.map((variant, index) => (
                    <div key={`${variant.recipeId}-${variant.variantId}`} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{variant.recipeName}</p>
                          <p className="text-sm text-muted-foreground">{variant.variantName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          {formatPercentage(variant.profitMargin)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(variant.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cost Analysis Tab */}
        <TabsContent value="cost-analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Breakdown Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Ingredients', value: costBreakdowns[0]?.ingredientCost || 0 },
                        { name: 'Labor', value: costBreakdowns[0]?.totalLaborCost || 0 },
                        { name: 'Overhead', value: costBreakdowns[0]?.totalOverheadCost || 0 },
                        { name: 'Waste/Loss', value: costBreakdowns[0]?.totalLossCost || 0 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Detailed Cost Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Detail Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {costBreakdowns[0] && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Direct Costs</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Ingredients:</span>
                            <span>{formatCurrency(costBreakdowns[0].ingredientCost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Labor:</span>
                            <span>{formatCurrency(costBreakdowns[0].totalLaborCost)}</span>
                          </div>
                          <div className="flex justify-between font-medium border-t pt-1">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(costBreakdowns[0].directCost)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Indirect Costs</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Overhead:</span>
                            <span>{formatCurrency(costBreakdowns[0].totalOverheadCost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Waste/Loss:</span>
                            <span>{formatCurrency(costBreakdowns[0].totalLossCost)}</span>
                          </div>
                          <div className="flex justify-between font-medium border-t pt-1">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(costBreakdowns[0].indirectCost)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total Cost:</span>
                        <span>{formatCurrency(costBreakdowns[0].totalCost)}</span>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Cost Accuracy:</span>
                          <span>{formatPercentage(costBreakdowns[0].costAccuracy * 100)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pricing Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Optimization Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.pricingOpportunities.map((opportunity, index) => (
                    <div key={`${opportunity.recipeId}-${opportunity.variantId}`} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">
                          <Zap className="h-3 w-3 mr-1" />
                          Optimization
                        </Badge>
                        <span className="text-sm text-green-600 font-medium">
                          +{formatCurrency(opportunity.revenueImpact)} potential
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Current Margin:</span>
                          <span>{formatPercentage(opportunity.currentMargin)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Optimized Margin:</span>
                          <span className="text-green-600 font-medium">
                            {formatPercentage(opportunity.optimizedMargin)}
                          </span>
                        </div>
                        
                        <Progress 
                          value={(opportunity.optimizedMargin / 100) * 100} 
                          className="mt-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Competitive Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Competitive Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.competitiveAlerts.map((alert, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{alert.competitorName}</div>
                        <Badge variant={alert.priceChange < 0 ? "destructive" : "secondary"}>
                          {alert.priceChange < 0 ? 'Price Drop' : 'Price Increase'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {alert.productName}: {formatCurrency(Math.abs(alert.priceChange))} change
                      </p>
                      
                      <p className="text-sm">{alert.impactAssessment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profitability Tab */}
        <TabsContent value="profitability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profitability Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={metrics.topProfitableVariants}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="recipeName" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'profitMargin' ? formatPercentage(Number(value)) : formatCurrency(Number(value)),
                      name === 'profitMargin' ? 'Profit Margin' : 'Revenue'
                    ]}
                  />
                  <Bar dataKey="profitMargin" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Waste Analysis Tab */}
        <TabsContent value="waste-analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Waste Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Top Waste Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.topWasteItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.ingredientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatPercentage(item.wastePercentage)} waste rate
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-orange-600">
                          {formatCurrency(item.wasteValue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Waste Reduction Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle>Waste Reduction Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-6 bg-orange-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Current Monthly Waste</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(metrics.totalWasteValue)}
                    </p>
                  </div>

                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Potential Monthly Savings</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(metrics.wasteReductionOpportunity)}
                    </p>
                  </div>

                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground mb-2">Reduction Progress</p>
                    <Progress 
                      value={50} // Mock progress
                      className="mb-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      50% of reduction target achieved this month
                    </p>
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

export default EnhancedCostingDashboard