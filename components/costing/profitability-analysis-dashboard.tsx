"use client"

/**
 * Profitability Analysis Dashboard
 * 
 * Advanced profitability dashboard with BCG matrix analysis, strategic recommendations,
 * and cross-variant impact assessment for portion-based items.
 */

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Star,
  Target,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Users,
  Award,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react'

import {
  VariantProfitabilityAnalysis
} from "@/lib/types/enhanced-costing-engine"

interface ProfitabilityAnalysisDashboardProps {
  recipeId: string
  period: string
  onVariantSelect?: (variantId: string) => void
}

// Mock data for demonstration
const mockProfitabilityData: VariantProfitabilityAnalysis = {
  recipeId: "pizza-1",
  recipeName: "Margherita Pizza",
  analysisDate: new Date(),
  analysisPeriod: "2024-08",
  
  totalRevenue: 15800.00,
  totalCost: 5530.00,
  totalProfit: 10270.00,
  averageMarginPercentage: 65.0,
  
  variantPerformance: [
    {
      variantId: "slice",
      variantName: "Single Slice",
      portionSize: "1/8 pizza",
      unitsSold: 485,
      salesFrequency: 16.2,
      marketShareWithinRecipe: 45.8,
      sellingPrice: 13.50,
      totalCost: 7.65,
      unitProfit: 5.85,
      marginPercentage: 43.3,
      totalRevenue: 6547.50,
      totalProfitContribution: 2837.25,
      revenuePerMinute: 218.25,
      profitPerGramIngredient: 0.39,
      costEfficiencyRank: 2,
      strategicValue: 0.85,
      customerSatisfactionImpact: 0.78,
      brandImageImpact: 0.65,
      crossSellingPotential: 0.82,
      performanceRating: 'star',
      recommendedAction: 'promote',
      optimizationOpportunities: [
        {
          opportunity: 'Increase portion visibility',
          potentialImpact: 450.00,
          implementationCost: 200,
          timeToRealize: 14
        },
        {
          opportunity: 'Bundle with drinks',
          potentialImpact: 320.00,
          implementationCost: 150,
          timeToRealize: 7
        }
      ]
    },
    {
      variantId: "half",
      variantName: "Half Pizza",
      portionSize: "1/2 pizza",
      unitsSold: 156,
      salesFrequency: 5.2,
      marketShareWithinRecipe: 34.2,
      sellingPrice: 24.50,
      totalCost: 15.30,
      unitProfit: 9.20,
      marginPercentage: 37.6,
      totalRevenue: 3822.00,
      totalProfitContribution: 1435.20,
      revenuePerMinute: 127.40,
      profitPerGramIngredient: 0.23,
      costEfficiencyRank: 3,
      strategicValue: 0.72,
      customerSatisfactionImpact: 0.85,
      brandImageImpact: 0.73,
      crossSellingPotential: 0.45,
      performanceRating: 'solid',
      recommendedAction: 'maintain',
      optimizationOpportunities: [
        {
          opportunity: 'Optimize pricing',
          potentialImpact: 285.00,
          implementationCost: 100,
          timeToRealize: 21
        }
      ]
    },
    {
      variantId: "whole",
      variantName: "Whole Pizza",
      portionSize: "Full pizza",
      unitsSold: 98,
      salesFrequency: 3.3,
      marketShareWithinRecipe: 20.0,
      sellingPrice: 36.00,
      totalCost: 25.20,
      unitProfit: 10.80,
      marginPercentage: 30.0,
      totalRevenue: 3528.00,
      totalProfitContribution: 1058.40,
      revenuePerMinute: 117.60,
      profitPerGramIngredient: 0.13,
      costEfficiencyRank: 4,
      strategicValue: 0.58,
      customerSatisfactionImpact: 0.90,
      brandImageImpact: 0.80,
      crossSellingPotential: 0.25,
      performanceRating: 'question',
      recommendedAction: 'optimize',
      optimizationOpportunities: [
        {
          opportunity: 'Family meal pricing',
          potentialImpact: 650.00,
          implementationCost: 300,
          timeToRealize: 30
        }
      ]
    }
  ],
  
  cannibalizedSales: [
    {
      fromVariantId: "half",
      toVariantId: "slice",
      impactPercentage: 8.5
    }
  ],
  
  complementaryEffects: [
    {
      variantId1: "slice",
      variantId2: "whole",
      synergyEffect: 0.15
    }
  ]
}

// BCG Matrix data transformation
const bcgMatrixData = mockProfitabilityData.variantPerformance.map(variant => ({
  x: variant.marketShareWithinRecipe,
  y: variant.marginPercentage,
  name: variant.variantName,
  size: variant.totalRevenue / 100,
  rating: variant.performanceRating,
  revenue: variant.totalRevenue
}))

const performanceColors = {
  star: '#10B981', // Green
  solid: '#3B82F6', // Blue  
  question: '#F59E0B', // Yellow
  dog: '#EF4444' // Red
}

export function ProfitabilityAnalysisDashboard({
  recipeId,
  period,
  onVariantSelect
}: ProfitabilityAnalysisDashboardProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getPerformanceIcon = (rating: string) => {
    switch (rating) {
      case 'star': return <Star className="h-4 w-4 text-yellow-500" />
      case 'solid': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'question': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'dog': return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'promote': return <ArrowUpRight className="h-4 w-4 text-green-600" />
      case 'optimize': return <Target className="h-4 w-4 text-blue-600" />
      case 'maintain': return <CheckCircle className="h-4 w-4 text-gray-600" />
      case 'consider_removal': return <ArrowDownRight className="h-4 w-4 text-red-600" />
      default: return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">Market Share: {data.x.toFixed(1)}%</p>
          <p className="text-sm">Margin: {data.y.toFixed(1)}%</p>
          <p className="text-sm">Revenue: {formatCurrency(data.revenue)}</p>
          <p className="text-sm capitalize">Rating: {data.rating}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profitability Analysis</h1>
          <p className="text-muted-foreground">
            Strategic performance analysis for {mockProfitabilityData.recipeName} - {period}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">Summary</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(mockProfitabilityData.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
              12.5% vs last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(mockProfitabilityData.totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(mockProfitabilityData.averageMarginPercentage)} avg margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variants</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockProfitabilityData.variantPerformance.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockProfitabilityData.variantPerformance.filter(v => v.performanceRating === 'star').length} stars
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimization Potential</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(
                mockProfitabilityData.variantPerformance.reduce(
                  (sum, v) => sum + v.optimizationOpportunities.reduce(
                    (opSum, op) => opSum + op.potentialImpact, 0
                  ), 0
                )
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Available opportunities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis Tabs */}
      <Tabs defaultValue="matrix" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="matrix">BCG Matrix</TabsTrigger>
          <TabsTrigger value="variants">Variant Analysis</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="strategic">Strategic View</TabsTrigger>
        </TabsList>

        {/* BCG Matrix Tab */}
        <TabsContent value="matrix" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* BCG Matrix Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Performance Matrix (BCG Style)</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Market share vs Profit margin with bubble size representing revenue
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="x" 
                      name="Market Share" 
                      unit="%" 
                      domain={[0, 60]}
                    />
                    <YAxis 
                      dataKey="y" 
                      name="Profit Margin" 
                      unit="%" 
                      domain={[25, 50]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {Object.entries(performanceColors).map(([rating, color]) => (
                      <Scatter
                        key={rating}
                        data={bcgMatrixData.filter(d => d.rating === rating)}
                        fill={color}
                        name={rating}
                      />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockProfitabilityData.variantPerformance.map((variant, index) => (
                    <div 
                      key={variant.variantId} 
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70"
                      onClick={() => setSelectedVariant(variant.variantId)}
                    >
                      <div className="flex items-center space-x-3">
                        {getPerformanceIcon(variant.performanceRating)}
                        <div>
                          <p className="font-medium">{variant.variantName}</p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Badge 
                              variant="outline" 
                              style={{ 
                                borderColor: performanceColors[variant.performanceRating as keyof typeof performanceColors],
                                color: performanceColors[variant.performanceRating as keyof typeof performanceColors]
                              }}
                            >
                              {variant.performanceRating}
                            </Badge>
                            {getActionIcon(variant.recommendedAction)}
                            <span className="capitalize">{variant.recommendedAction}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(variant.totalRevenue)}
                        </p>
                        <p className="text-sm text-green-600">
                          {formatPercentage(variant.marginPercentage)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Variant Analysis Tab */}
        <TabsContent value="variants" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockProfitabilityData.variantPerformance.map(v => ({
                        name: v.variantName,
                        value: v.totalRevenue,
                        margin: v.marginPercentage
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {mockProfitabilityData.variantPerformance.map((variant, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={performanceColors[variant.performanceRating as keyof typeof performanceColors]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockProfitabilityData.variantPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="variantName" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatPercentage(Number(value))} />
                    <Bar dataKey="marginPercentage" fill="#3B82F6" name="Profit Margin %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Variant Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Variant Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Variant</th>
                      <th className="text-right p-2">Units Sold</th>
                      <th className="text-right p-2">Avg Price</th>
                      <th className="text-right p-2">Margin %</th>
                      <th className="text-right p-2">Revenue</th>
                      <th className="text-right p-2">Profit</th>
                      <th className="text-center p-2">Strategic Value</th>
                      <th className="text-center p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockProfitabilityData.variantPerformance.map((variant) => (
                      <tr key={variant.variantId} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            {getPerformanceIcon(variant.performanceRating)}
                            <span className="font-medium">{variant.variantName}</span>
                          </div>
                        </td>
                        <td className="text-right p-2">{variant.unitsSold}</td>
                        <td className="text-right p-2">{formatCurrency(variant.sellingPrice)}</td>
                        <td className="text-right p-2">
                          <span className="font-semibold text-green-600">
                            {formatPercentage(variant.marginPercentage)}
                          </span>
                        </td>
                        <td className="text-right p-2">{formatCurrency(variant.totalRevenue)}</td>
                        <td className="text-right p-2">{formatCurrency(variant.totalProfitContribution)}</td>
                        <td className="text-center p-2">
                          <Progress value={variant.strategicValue * 100} className="w-16 h-2" />
                          <span className="text-xs">{(variant.strategicValue * 100).toFixed(0)}%</span>
                        </td>
                        <td className="text-center p-2">
                          <Badge variant="outline" className="capitalize">
                            {variant.recommendedAction.replace('_', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Optimization Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockProfitabilityData.variantPerformance.map((variant) => (
                    <div key={variant.variantId} className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        {getPerformanceIcon(variant.performanceRating)}
                        {variant.variantName}
                      </h4>
                      {variant.optimizationOpportunities.map((opportunity, index) => (
                        <div key={index} className="ml-6 p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{opportunity.opportunity}</span>
                            <Badge variant="secondary" className="text-green-600">
                              +{formatCurrency(opportunity.potentialImpact)}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Cost: {formatCurrency(opportunity.implementationCost)}</span>
                            <span>{opportunity.timeToRealize} days</span>
                            <span>
                              ROI: {((opportunity.potentialImpact / opportunity.implementationCost - 1) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Impact Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Potential Impact Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <Lightbulb className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-lg font-semibold text-green-700 mb-1">Total Opportunity</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(
                        mockProfitabilityData.variantPerformance.reduce(
                          (sum, v) => sum + v.optimizationOpportunities.reduce(
                            (opSum, op) => opSum + op.potentialImpact, 0
                          ), 0
                        )
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Potential additional profit
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Quick Wins</h4>
                    {mockProfitabilityData.variantPerformance
                      .flatMap(v => v.optimizationOpportunities.map(op => ({...op, variantName: v.variantName})))
                      .filter(op => op.timeToRealize <= 14)
                      .sort((a, b) => (b.potentialImpact / b.implementationCost) - (a.potentialImpact / a.implementationCost))
                      .slice(0, 3)
                      .map((opportunity, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{opportunity.opportunity}</span>
                            <Badge className="bg-blue-600">
                              {opportunity.timeToRealize}d
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{opportunity.variantName}</p>
                          <p className="text-sm text-blue-600 font-medium">
                            {formatCurrency(opportunity.potentialImpact)} impact
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Strategic View Tab */}
        <TabsContent value="strategic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strategic Value Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Strategic Value Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={mockProfitabilityData.variantPerformance.map(v => ({
                    variant: v.variantName,
                    strategic: v.strategicValue * 100,
                    satisfaction: v.customerSatisfactionImpact * 100,
                    brand: v.brandImageImpact * 100,
                    crossSell: v.crossSellingPotential * 100,
                    margin: v.marginPercentage
                  }))}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="variant" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Strategic Value"
                      dataKey="strategic"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.1}
                    />
                    <Radar
                      name="Customer Satisfaction"
                      dataKey="satisfaction"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.1}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cross-Variant Effects */}
            <Card>
              <CardHeader>
                <CardTitle>Cross-Variant Effects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Cannibalization Effects</h4>
                    {mockProfitabilityData.cannibalizedSales.map((effect, index) => {
                      const fromVariant = mockProfitabilityData.variantPerformance.find(v => v.variantId === effect.fromVariantId)
                      const toVariant = mockProfitabilityData.variantPerformance.find(v => v.variantId === effect.toVariantId)
                      
                      return (
                        <div key={index} className="p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <span className="font-medium">{fromVariant?.variantName}</span>
                              <span className="mx-2">→</span>
                              <span className="font-medium">{toVariant?.variantName}</span>
                            </div>
                            <Badge variant="outline" className="text-orange-600">
                              {effect.impactPercentage}% impact
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Complementary Effects</h4>
                    {mockProfitabilityData.complementaryEffects.map((effect, index) => {
                      const variant1 = mockProfitabilityData.variantPerformance.find(v => v.variantId === effect.variantId1)
                      const variant2 = mockProfitabilityData.variantPerformance.find(v => v.variantId === effect.variantId2)
                      
                      return (
                        <div key={index} className="p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <span className="font-medium">{variant1?.variantName}</span>
                              <span className="mx-2">+</span>
                              <span className="font-medium">{variant2?.variantName}</span>
                            </div>
                            <Badge variant="outline" className="text-green-600">
                              +{(effect.synergyEffect * 100).toFixed(1)}% synergy
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
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

export default ProfitabilityAnalysisDashboard