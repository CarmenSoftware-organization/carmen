"use client"

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, ComposedChart, ScatterChart, Scatter, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, TreemapChart, Treemap
} from 'recharts'
import { 
  Download, Filter, RefreshCcw, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  DollarSign, Package, Target, Star, Award, AlertTriangle, CheckCircle, BarChart3,
  PieChart, Zap, Clock, Users
} from 'lucide-react'

// Types for recipe variant analysis
interface RecipeVariantPerformance {
  recipeId: string
  recipeName: string
  baseRecipeDetails: {
    totalProduced: number
    totalIngredientCost: number
    baseProfitMargin: number
    preparationTime: number
    complexity: number
    shelfLife: number
  }
  variants: {
    variantId: string
    variantName: string
    fractionalType: 'pizza-slice' | 'cake-slice' | 'bottle-glass' | 'portion-control' | 'custom'
    conversionRate: number
    performance: {
      totalSales: number
      totalRevenue: number
      totalTransactions: number
      averageSellingPrice: number
      costPerUnit: number
      grossProfit: number
      profitMargin: number
      profitPerBaseUnit: number
    }
    efficiency: {
      conversionEfficiency: number
      wasteRate: number
      yieldOptimization: number
      customerSatisfaction: number
      operationalComplexity: number
    }
    market: {
      marketShare: number
      customerRetention: number
      priceElasticity: number
      seasonalVariation: number
      competitivePosition: 'leader' | 'contender' | 'challenger' | 'niche'
    }
    trends: {
      period: string
      sales: number
      revenue: number
      profitMargin: number
      marketShare: number
    }[]
    recommendations: {
      type: 'pricing' | 'portioning' | 'promotion' | 'discontinue' | 'expand'
      priority: 'high' | 'medium' | 'low'
      description: string
      expectedImpact: number
      implementation: 'immediate' | 'short_term' | 'long_term'
    }[]
  }[]
  competitiveAnalysis: {
    topPerformer: string
    underperformer: string
    profitabilityLeader: string
    volumeLeader: string
    insights: {
      cannibalization: {
        exists: boolean
        affectedVariants: string[]
        impact: number
      }
      optimization: {
        opportunities: string[]
        potentialGains: number
      }
      portfolio: {
        diversificationScore: number
        balanceScore: number
        riskScore: number
      }
    }
  }
  overallMetrics: {
    totalRecipeRevenue: number
    totalRecipeProfit: number
    averageProfitMargin: number
    portfolioEfficiency: number
    customerSatisfaction: number
    operationalComplexity: number
  }
}

interface RecipeVariantAnalysisProps {
  locationId?: string
  timeRange?: 'week' | 'month' | 'quarter' | 'year'
  recipeFilter?: string
}

export default function RecipeVariantPerformance({
  locationId = 'main-kitchen',
  timeRange = 'month',
  recipeFilter = 'all'
}: RecipeVariantAnalysisProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedLocation, setSelectedLocation] = useState(locationId)
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)
  const [selectedRecipe, setSelectedRecipe] = useState(recipeFilter)
  const [sortBy, setSortBy] = useState<'revenue' | 'profit' | 'efficiency' | 'volume'>('revenue')

  // Mock comprehensive data
  const mockPerformanceData: RecipeVariantPerformance[] = [
    {
      recipeId: 'pizza-margherita',
      recipeName: 'Margherita Pizza',
      baseRecipeDetails: {
        totalProduced: 125,
        totalIngredientCost: 8.50,
        baseProfitMargin: 65.2,
        preparationTime: 25,
        complexity: 3,
        shelfLife: 4
      },
      variants: [
        {
          variantId: 'slice-regular',
          variantName: 'Regular Slice (1/8)',
          fractionalType: 'pizza-slice',
          conversionRate: 0.125,
          performance: {
            totalSales: 892,
            totalRevenue: 7136.00,
            totalTransactions: 892,
            averageSellingPrice: 8.00,
            costPerUnit: 1.06,
            grossProfit: 6206.48,
            profitMargin: 87.0,
            profitPerBaseUnit: 49.65
          },
          efficiency: {
            conversionEfficiency: 96.8,
            wasteRate: 2.1,
            yieldOptimization: 94.5,
            customerSatisfaction: 9.2,
            operationalComplexity: 2
          },
          market: {
            marketShare: 45.2,
            customerRetention: 8.7,
            priceElasticity: -0.8,
            seasonalVariation: 15.3,
            competitivePosition: 'leader'
          },
          trends: [
            { period: 'Week 1', sales: 210, revenue: 1680, profitMargin: 86.5, marketShare: 44.8 },
            { period: 'Week 2', sales: 225, revenue: 1800, profitMargin: 87.2, marketShare: 45.1 },
            { period: 'Week 3', sales: 218, revenue: 1744, profitMargin: 87.3, marketShare: 45.5 },
            { period: 'Week 4', sales: 239, revenue: 1912, profitMargin: 87.0, marketShare: 45.2 }
          ],
          recommendations: [
            {
              type: 'pricing',
              priority: 'medium',
              description: 'Consider 5-10% price increase based on strong demand',
              expectedImpact: 12.5,
              implementation: 'short_term'
            },
            {
              type: 'promotion',
              priority: 'high',
              description: 'Introduce combo deals to increase transaction value',
              expectedImpact: 18.2,
              implementation: 'immediate'
            }
          ]
        },
        {
          variantId: 'slice-large',
          variantName: 'Large Slice (1/6)',
          fractionalType: 'pizza-slice',
          conversionRate: 0.167,
          performance: {
            totalSales: 324,
            totalRevenue: 3564.00,
            totalTransactions: 324,
            averageSellingPrice: 11.00,
            costPerUnit: 1.42,
            grossProfit: 3103.92,
            profitMargin: 87.1,
            profitPerBaseUnit: 57.55
          },
          efficiency: {
            conversionEfficiency: 94.2,
            wasteRate: 3.8,
            yieldOptimization: 91.2,
            customerSatisfaction: 8.9,
            operationalComplexity: 2
          },
          market: {
            marketShare: 18.7,
            customerRetention: 7.9,
            priceElasticity: -1.2,
            seasonalVariation: 12.8,
            competitivePosition: 'contender'
          },
          trends: [
            { period: 'Week 1', sales: 78, revenue: 858, profitMargin: 86.8, marketShare: 18.2 },
            { period: 'Week 2', sales: 82, revenue: 902, profitMargin: 87.1, marketShare: 18.5 },
            { period: 'Week 3', sales: 79, revenue: 869, profitMargin: 87.3, marketShare: 18.9 },
            { period: 'Week 4', sales: 85, revenue: 935, profitMargin: 87.2, marketShare: 18.7 }
          ],
          recommendations: [
            {
              type: 'portioning',
              priority: 'high',
              description: 'Optimize portion size to reduce waste while maintaining value',
              expectedImpact: 8.5,
              implementation: 'short_term'
            }
          ]
        },
        {
          variantId: 'whole-pizza',
          variantName: 'Whole Pizza',
          fractionalType: 'custom',
          conversionRate: 1.0,
          performance: {
            totalSales: 67,
            totalRevenue: 1675.00,
            totalTransactions: 67,
            averageSellingPrice: 25.00,
            costPerUnit: 8.50,
            grossProfit: 1105.50,
            profitMargin: 66.0,
            profitPerBaseUnit: 16.50
          },
          efficiency: {
            conversionEfficiency: 89.5,
            wasteRate: 6.2,
            yieldOptimization: 88.1,
            customerSatisfaction: 9.1,
            operationalComplexity: 3
          },
          market: {
            marketShare: 12.4,
            customerRetention: 6.8,
            priceElasticity: -0.6,
            seasonalVariation: 22.1,
            competitivePosition: 'niche'
          },
          trends: [
            { period: 'Week 1', sales: 16, revenue: 400, profitMargin: 65.5, marketShare: 12.1 },
            { period: 'Week 2', sales: 18, revenue: 450, profitMargin: 66.2, marketShare: 12.3 },
            { period: 'Week 3', sales: 15, revenue: 375, profitMargin: 66.3, marketShare: 12.6 },
            { period: 'Week 4', sales: 18, revenue: 450, profitMargin: 66.0, marketShare: 12.4 }
          ],
          recommendations: [
            {
              type: 'promotion',
              priority: 'medium',
              description: 'Target family/group dining with promotional packages',
              expectedImpact: 15.3,
              implementation: 'short_term'
            }
          ]
        }
      ],
      competitiveAnalysis: {
        topPerformer: 'slice-regular',
        underperformer: 'whole-pizza',
        profitabilityLeader: 'slice-large',
        volumeLeader: 'slice-regular',
        insights: {
          cannibalization: {
            exists: true,
            affectedVariants: ['slice-large', 'whole-pizza'],
            impact: 8.3
          },
          optimization: {
            opportunities: ['Increase slice pricing', 'Reduce whole pizza waste', 'Cross-sell optimization'],
            potentialGains: 23.7
          },
          portfolio: {
            diversificationScore: 0.72,
            balanceScore: 0.68,
            riskScore: 0.34
          }
        }
      },
      overallMetrics: {
        totalRecipeRevenue: 12375.00,
        totalRecipeProfit: 10415.90,
        averageProfitMargin: 84.2,
        portfolioEfficiency: 93.8,
        customerSatisfaction: 9.1,
        operationalComplexity: 2.3
      }
    },
    {
      recipeId: 'chocolate-cake',
      recipeName: 'Premium Chocolate Cake',
      baseRecipeDetails: {
        totalProduced: 45,
        totalIngredientCost: 12.80,
        baseProfitMargin: 68.5,
        preparationTime: 75,
        complexity: 5,
        shelfLife: 48
      },
      variants: [
        {
          variantId: 'slice-regular',
          variantName: 'Regular Slice (1/12)',
          fractionalType: 'cake-slice',
          conversionRate: 0.083,
          performance: {
            totalSales: 412,
            totalRevenue: 3708.00,
            totalTransactions: 412,
            averageSellingPrice: 9.00,
            costPerUnit: 1.06,
            grossProfit: 2871.28,
            profitMargin: 77.4,
            profitPerBaseUnit: 83.82
          },
          efficiency: {
            conversionEfficiency: 92.8,
            wasteRate: 4.2,
            yieldOptimization: 89.6,
            customerSatisfaction: 9.4,
            operationalComplexity: 3
          },
          market: {
            marketShare: 38.7,
            customerRetention: 8.9,
            priceElasticity: -0.7,
            seasonalVariation: 18.5,
            competitivePosition: 'leader'
          },
          trends: [
            { period: 'Week 1', sales: 98, revenue: 882, profitMargin: 77.1, marketShare: 38.2 },
            { period: 'Week 2', sales: 105, revenue: 945, profitMargin: 77.4, marketShare: 38.8 },
            { period: 'Week 3', sales: 102, revenue: 918, profitMargin: 77.6, marketShare: 39.1 },
            { period: 'Week 4', sales: 107, revenue: 963, profitMargin: 77.4, marketShare: 38.7 }
          ],
          recommendations: [
            {
              type: 'expand',
              priority: 'high',
              description: 'High-performing variant with growth potential',
              expectedImpact: 22.1,
              implementation: 'short_term'
            }
          ]
        },
        {
          variantId: 'whole-cake',
          variantName: 'Whole Cake',
          fractionalType: 'custom',
          conversionRate: 1.0,
          performance: {
            totalSales: 28,
            totalRevenue: 2800.00,
            totalTransactions: 28,
            averageSellingPrice: 100.00,
            costPerUnit: 12.80,
            grossProfit: 2441.60,
            profitMargin: 87.2,
            profitPerBaseUnit: 87.20
          },
          efficiency: {
            conversionEfficiency: 85.2,
            wasteRate: 8.5,
            yieldOptimization: 82.4,
            customerSatisfaction: 9.6,
            operationalComplexity: 4
          },
          market: {
            marketShare: 24.1,
            customerRetention: 5.2,
            priceElasticity: -0.4,
            seasonalVariation: 35.8,
            competitivePosition: 'niche'
          },
          trends: [
            { period: 'Week 1', sales: 6, revenue: 600, profitMargin: 86.8, marketShare: 23.5 },
            { period: 'Week 2', sales: 8, revenue: 800, profitMargin: 87.1, marketShare: 24.2 },
            { period: 'Week 3', sales: 7, revenue: 700, profitMargin: 87.4, marketShare: 24.8 },
            { period: 'Week 4', sales: 7, revenue: 700, profitMargin: 87.2, marketShare: 24.1 }
          ],
          recommendations: [
            {
              type: 'promotion',
              priority: 'high',
              description: 'Target special occasions and corporate orders',
              expectedImpact: 18.7,
              implementation: 'immediate'
            }
          ]
        }
      ],
      competitiveAnalysis: {
        topPerformer: 'whole-cake',
        underperformer: 'slice-regular',
        profitabilityLeader: 'whole-cake',
        volumeLeader: 'slice-regular',
        insights: {
          cannibalization: {
            exists: false,
            affectedVariants: [],
            impact: 0
          },
          optimization: {
            opportunities: ['Premium positioning', 'Special occasion marketing', 'Portion optimization'],
            potentialGains: 19.2
          },
          portfolio: {
            diversificationScore: 0.58,
            balanceScore: 0.76,
            riskScore: 0.42
          }
        }
      },
      overallMetrics: {
        totalRecipeRevenue: 6508.00,
        totalRecipeProfit: 5312.88,
        averageProfitMargin: 81.6,
        portfolioEfficiency: 87.8,
        customerSatisfaction: 9.5,
        operationalComplexity: 3.5
      }
    }
  ]

  const selectedRecipeData = selectedRecipe === 'all' 
    ? mockPerformanceData[0] // Show first recipe as example
    : mockPerformanceData.find(r => r.recipeId === selectedRecipe) || mockPerformanceData[0]

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`
  const formatNumber = (value: number) => value.toLocaleString()

  // Colors for variants
  const VARIANT_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recipe Variant Performance Analysis</h2>
          <p className="text-muted-foreground">
            Detailed profitability and efficiency analysis by recipe variant
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedRecipe} onValueChange={setSelectedRecipe}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select Recipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Recipes Overview</SelectItem>
              <SelectItem value="pizza-margherita">Margherita Pizza</SelectItem>
              <SelectItem value="chocolate-cake">Premium Chocolate Cake</SelectItem>
              <SelectItem value="house-wine">House Wine</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">By Revenue</SelectItem>
              <SelectItem value="profit">By Profit</SelectItem>
              <SelectItem value="efficiency">By Efficiency</SelectItem>
              <SelectItem value="volume">By Volume</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Recipe Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{formatCurrency(selectedRecipeData.overallMetrics.totalRecipeRevenue)}</div>
              <div className="text-xs text-muted-foreground">
                {selectedRecipeData.variants.length} variants
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Avg Profit Margin</span>
                <Target className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">{formatPercentage(selectedRecipeData.overallMetrics.averageProfitMargin)}</div>
              <div className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Above target
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Portfolio Efficiency</span>
                <Zap className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold">{formatPercentage(selectedRecipeData.overallMetrics.portfolioEfficiency)}</div>
              <div className="text-xs text-muted-foreground">Excellent performance</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Customer Satisfaction</span>
                <Star className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold">{selectedRecipeData.overallMetrics.customerSatisfaction}/10</div>
              <div className="text-xs text-purple-600">High satisfaction</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          <TabsTrigger value="market">Market Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution by Variant</CardTitle>
                <CardDescription>Revenue breakdown across all variants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedRecipeData.variants.map(v => ({
                      name: v.variantName,
                      revenue: v.performance.totalRevenue,
                      transactions: v.performance.totalTransactions
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip formatter={(value, name) => [
                        name === 'revenue' ? formatCurrency(value as number) : value,
                        name === 'revenue' ? 'Revenue' : 'Transactions'
                      ]} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#8b5cf6" />
                      <Bar yAxisId="right" dataKey="transactions" name="Transactions" fill="#06b6d4" fillOpacity={0.6} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Variant Performance Matrix</CardTitle>
                <CardDescription>Profit vs volume analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={selectedRecipeData.variants.map(v => ({
                      name: v.variantName,
                      profit: v.performance.profitMargin,
                      volume: v.performance.totalTransactions,
                      revenue: v.performance.totalRevenue
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" dataKey="volume" name="Volume" />
                      <YAxis type="number" dataKey="profit" name="Profit Margin" />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(value, name) => [
                          name === 'profit' ? formatPercentage(value as number) : value,
                          name === 'profit' ? 'Profit Margin' : 'Volume'
                        ]}
                      />
                      <Scatter dataKey="profit" fill="#10b981" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Variant Comparison Table</CardTitle>
              <CardDescription>Comprehensive variant performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Variant</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                    <TableHead className="text-right">Profit Margin</TableHead>
                    <TableHead className="text-right">Efficiency</TableHead>
                    <TableHead>Market Position</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedRecipeData.variants
                    .sort((a, b) => {
                      switch (sortBy) {
                        case 'revenue': return b.performance.totalRevenue - a.performance.totalRevenue
                        case 'profit': return b.performance.profitMargin - a.performance.profitMargin
                        case 'efficiency': return b.efficiency.conversionEfficiency - a.efficiency.conversionEfficiency
                        case 'volume': return b.performance.totalTransactions - a.performance.totalTransactions
                        default: return 0
                      }
                    })
                    .map((variant, index) => (
                    <TableRow key={variant.variantId}>
                      <TableCell className="font-medium">{variant.variantName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {variant.fractionalType.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <div className="font-medium">{formatCurrency(variant.performance.totalRevenue)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(variant.performance.averageSellingPrice)} avg
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(variant.performance.totalTransactions)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-medium">{formatPercentage(variant.performance.profitMargin)}</span>
                          {variant.performance.profitMargin > selectedRecipeData.overallMetrics.averageProfitMargin ? (
                            <TrendingUp className="h-3 w-3 text-green-600" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <Progress value={variant.efficiency.conversionEfficiency} className="h-1" />
                          <span className="text-xs">{formatPercentage(variant.efficiency.conversionEfficiency)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            variant.market.competitivePosition === 'leader' ? 'default' :
                            variant.market.competitivePosition === 'contender' ? 'secondary' :
                            variant.market.competitivePosition === 'challenger' ? 'outline' : 'destructive'
                          }
                          className="capitalize"
                        >
                          {variant.market.competitivePosition}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profitability Tab */}
        <TabsContent value="profitability" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Profitability Analysis</CardTitle>
                <CardDescription>Profit margin and profit per base unit comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={selectedRecipeData.variants.map(v => ({
                      name: v.variantName,
                      profitMargin: v.performance.profitMargin,
                      profitPerUnit: v.performance.profitPerBaseUnit,
                      volume: v.performance.totalTransactions / 10 // Scale for display
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="profitMargin" name="Profit Margin %" fill="#10b981" />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="profitPerUnit" 
                        name="Profit per Base Unit $" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                      />
                      <Bar yAxisId="right" dataKey="volume" name="Volume (scaled)" fill="#06b6d4" fillOpacity={0.3} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Structure Analysis</CardTitle>
                <CardDescription>Cost per unit vs selling price by variant</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={selectedRecipeData.variants.map(v => ({
                        name: v.variantName,
                        sellingPrice: v.performance.averageSellingPrice,
                        cost: v.performance.costPerUnit,
                        profit: v.performance.averageSellingPrice - v.performance.costPerUnit
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Bar dataKey="cost" stackId="a" name="Cost" fill="#ef4444" />
                      <Bar dataKey="profit" stackId="a" name="Profit" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profitability Insights</CardTitle>
              <CardDescription>Key insights from profitability analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium">Most Profitable</span>
                  </div>
                  <div className="pl-7">
                    <div className="font-medium">{selectedRecipeData.competitiveAnalysis.profitabilityLeader}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatPercentage(
                        selectedRecipeData.variants.find(v => 
                          v.variantId === selectedRecipeData.competitiveAnalysis.profitabilityLeader ||
                          v.variantName === selectedRecipeData.competitiveAnalysis.profitabilityLeader
                        )?.performance.profitMargin || 0
                      )} profit margin
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Volume Leader</span>
                  </div>
                  <div className="pl-7">
                    <div className="font-medium">{selectedRecipeData.competitiveAnalysis.volumeLeader}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatNumber(
                        selectedRecipeData.variants.find(v => 
                          v.variantId === selectedRecipeData.competitiveAnalysis.volumeLeader ||
                          v.variantName === selectedRecipeData.competitiveAnalysis.volumeLeader
                        )?.performance.totalTransactions || 0
                      )} transactions
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Optimization Potential</span>
                  </div>
                  <div className="pl-7">
                    <div className="font-medium">{formatPercentage(selectedRecipeData.competitiveAnalysis.insights.optimization.potentialGains)}</div>
                    <div className="text-sm text-muted-foreground">Potential revenue increase</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Efficiency Tab */}
        <TabsContent value="efficiency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Operational Efficiency Radar</CardTitle>
              <CardDescription>Multi-dimensional efficiency comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={[
                    {
                      metric: 'Conversion Efficiency',
                      ...Object.fromEntries(
                        selectedRecipeData.variants.map(v => [v.variantName, v.efficiency.conversionEfficiency])
                      )
                    },
                    {
                      metric: 'Waste Control',
                      ...Object.fromEntries(
                        selectedRecipeData.variants.map(v => [v.variantName, 100 - v.efficiency.wasteRate])
                      )
                    },
                    {
                      metric: 'Yield Optimization',
                      ...Object.fromEntries(
                        selectedRecipeData.variants.map(v => [v.variantName, v.efficiency.yieldOptimization])
                      )
                    },
                    {
                      metric: 'Customer Satisfaction',
                      ...Object.fromEntries(
                        selectedRecipeData.variants.map(v => [v.variantName, v.efficiency.customerSatisfaction * 10])
                      )
                    },
                    {
                      metric: 'Operational Simplicity',
                      ...Object.fromEntries(
                        selectedRecipeData.variants.map(v => [v.variantName, (6 - v.efficiency.operationalComplexity) * 20])
                      )
                    }
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    {selectedRecipeData.variants.map((variant, index) => (
                      <Radar
                        key={variant.variantId}
                        name={variant.variantName}
                        dataKey={variant.variantName}
                        stroke={VARIANT_COLORS[index]}
                        fill={VARIANT_COLORS[index]}
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    ))}
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Efficiency Metrics</CardTitle>
                <CardDescription>Detailed efficiency breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedRecipeData.variants.map((variant, index) => (
                    <div key={variant.variantId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{variant.variantName}</span>
                        <span className="text-sm">{formatPercentage(variant.efficiency.conversionEfficiency)}</span>
                      </div>
                      <Progress value={variant.efficiency.conversionEfficiency} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Waste: {formatPercentage(variant.efficiency.wasteRate)}</span>
                        <span>Satisfaction: {variant.efficiency.customerSatisfaction}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Portfolio Balance</CardTitle>
                <CardDescription>Portfolio risk and diversification analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Diversification Score</span>
                    <span className="text-sm font-bold">{(selectedRecipeData.competitiveAnalysis.insights.portfolio.diversificationScore * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={selectedRecipeData.competitiveAnalysis.insights.portfolio.diversificationScore * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Balance Score</span>
                    <span className="text-sm font-bold">{(selectedRecipeData.competitiveAnalysis.insights.portfolio.balanceScore * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={selectedRecipeData.competitiveAnalysis.insights.portfolio.balanceScore * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Risk Score</span>
                    <span className="text-sm font-bold text-green-600">{(selectedRecipeData.competitiveAnalysis.insights.portfolio.riskScore * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={100 - (selectedRecipeData.competitiveAnalysis.insights.portfolio.riskScore * 100)} className="h-2" />
                  <div className="text-xs text-muted-foreground">Lower is better</div>
                </div>

                {selectedRecipeData.competitiveAnalysis.insights.cannibalization.exists && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium">Cannibalization Detected</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatPercentage(selectedRecipeData.competitiveAnalysis.insights.cannibalization.impact)} impact on affected variants
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends by Variant</CardTitle>
              <CardDescription>Revenue and profit margin trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={
                    selectedRecipeData.variants[0].trends.map(trend => ({
                      period: trend.period,
                      ...Object.fromEntries(
                        selectedRecipeData.variants.map(v => [
                          v.variantName, 
                          v.trends.find(t => t.period === trend.period)?.revenue || 0
                        ])
                      )
                    }))
                  }>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    {selectedRecipeData.variants.map((variant, index) => (
                      <Line 
                        key={variant.variantId}
                        type="monotone" 
                        dataKey={variant.variantName} 
                        stroke={VARIANT_COLORS[index]} 
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Market Share Evolution</CardTitle>
                <CardDescription>How market share is changing by variant</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={
                      selectedRecipeData.variants[0].trends.map(trend => ({
                        period: trend.period,
                        ...Object.fromEntries(
                          selectedRecipeData.variants.map(v => [
                            v.variantName, 
                            v.trends.find(t => t.period === trend.period)?.marketShare || 0
                          ])
                        )
                      }))
                    }>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatPercentage(value as number)} />
                      <Legend />
                      {selectedRecipeData.variants.map((variant, index) => (
                        <Area
                          key={variant.variantId}
                          type="monotone"
                          dataKey={variant.variantName}
                          stackId="1"
                          stroke={VARIANT_COLORS[index]}
                          fill={VARIANT_COLORS[index]}
                          fillOpacity={0.6}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profitability Trends</CardTitle>
                <CardDescription>Profit margin evolution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={
                      selectedRecipeData.variants[0].trends.map(trend => ({
                        period: trend.period,
                        ...Object.fromEntries(
                          selectedRecipeData.variants.map(v => [
                            v.variantName, 
                            v.trends.find(t => t.period === trend.period)?.profitMargin || 0
                          ])
                        )
                      }))
                    }>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatPercentage(value as number)} />
                      <Legend />
                      {selectedRecipeData.variants.map((variant, index) => (
                        <Line 
                          key={variant.variantId}
                          type="monotone" 
                          dataKey={variant.variantName} 
                          stroke={VARIANT_COLORS[index]} 
                          strokeWidth={2}
                          strokeDasharray={index % 2 === 1 ? "5 5" : "0"}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid gap-6">
            {selectedRecipeData.variants.map((variant) => (
              variant.recommendations.map((rec, index) => (
                <Card key={`${variant.variantId}-${index}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{variant.variantName} - {rec.type.toUpperCase()} Recommendation</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            rec.priority === 'high' ? 'destructive' :
                            rec.priority === 'medium' ? 'default' : 'secondary'
                          }
                        >
                          {rec.priority.toUpperCase()} PRIORITY
                        </Badge>
                        <Badge variant="outline">{rec.implementation.replace('_', ' ').toUpperCase()}</Badge>
                      </div>
                    </div>
                    <CardDescription>
                      Expected Impact: {formatPercentage(rec.expectedImpact)} • {rec.type.replace('_', ' ').toUpperCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="md:col-span-2">
                        <div className="space-y-2">
                          <div className="font-medium text-sm">Recommendation</div>
                          <div className="text-sm text-muted-foreground">{rec.description}</div>
                        </div>
                      </div>
                      <div>
                        <div className="space-y-2">
                          <div className="font-medium text-sm">Expected Impact</div>
                          <div className="text-2xl font-bold text-green-600">{formatPercentage(rec.expectedImpact)}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="font-medium text-sm">Implementation</div>
                        <div className="text-sm">{rec.implementation.replace('_', ' ')}</div>
                        <Button size="sm" className="mt-2 w-full">
                          {rec.implementation === 'immediate' ? 'Implement Now' : 'Plan Implementation'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}