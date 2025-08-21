"use client"

/**
 * Pricing Recommendation Panel
 * 
 * AI-powered pricing recommendations with scenario analysis,
 * competitive positioning, and risk assessment for portion-based items.
 */

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts'
import {
  Target,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Zap,
  Shield,
  Users,
  Clock,
  Brain,
  Settings
} from 'lucide-react'

import {
  DynamicPricingResult,
  PricingOptimizationRequest,
  PricingObjective,
  PortionCostBreakdown
} from "@/lib/types/enhanced-costing-engine"

interface PricingRecommendationPanelProps {
  recipeId: string
  variantId: string
  currentCost: number
  currentPrice: number
  onApplyPricing?: (newPrice: number) => void
}

// Mock data for demonstration
const mockPricingResult: DynamicPricingResult = {
  recipeId: "pizza-1",
  variantId: "slice",
  optimizationId: "opt_123",
  calculatedAt: new Date(),
  
  currentPrice: 12.50,
  recommendedPrice: 13.75,
  priceChange: 1.25,
  priceChangePercentage: 10.0,
  
  projectedMargin: 6.10,
  projectedMarginPercentage: 44.4,
  projectedRevenue: 1375.00,
  projectedProfit: 610.00,
  
  currentVolume: 100,
  projectedVolume: 95,
  volumeChange: -5,
  volumeChangePercentage: -5.0,
  
  competitivePosition: 'mid_market',
  pricePerceptile: 65,
  
  riskFactors: [
    {
      factor: 'Price resistance risk',
      probability: 0.3,
      impact: -0.2,
      mitigation: 'Emphasize quality improvements and portion value'
    },
    {
      factor: 'Competitive response',
      probability: 0.4,
      impact: -0.1,
      mitigation: 'Monitor competitor pricing and adjust if needed'
    }
  ],
  
  implementationPriority: 'within_week',
  implementationComplexity: 'moderate',
  expectedPaybackPeriod: 21,
  
  alternativeScenarios: [
    {
      scenario: 'Conservative',
      price: 13.25,
      projectedOutcome: {
        margin: 42.8,
        volume: 97,
        revenue: 1285,
        riskScore: 0.2
      }
    },
    {
      scenario: 'Aggressive',
      price: 14.50,
      projectedOutcome: {
        margin: 48.3,
        volume: 88,
        revenue: 1276,
        riskScore: 0.6
      }
    }
  ]
}

const mockCompetitiveData = [
  { competitor: 'Tony\'s Pizza', price: 12.00, quality: 3.8, position: 'value' },
  { competitor: 'Mario\'s', price: 13.50, quality: 4.2, position: 'mid_market' },
  { competitor: 'Premium Slice', price: 15.00, quality: 4.5, position: 'premium' },
  { competitor: 'Fast Pizza', price: 10.50, quality: 3.2, position: 'value' }
]

const mockFactorAnalysis = [
  { factor: 'Cost Structure', current: 75, optimized: 85, max: 100 },
  { factor: 'Market Position', current: 60, optimized: 75, max: 100 },
  { factor: 'Value Perception', current: 70, optimized: 80, max: 100 },
  { factor: 'Demand Elasticity', current: 55, optimized: 65, max: 100 },
  { factor: 'Competition', current: 65, optimized: 70, max: 100 },
  { factor: 'Brand Premium', current: 45, optimized: 60, max: 100 }
]

export function PricingRecommendationPanel({ 
  recipeId, 
  variantId, 
  currentCost, 
  currentPrice,
  onApplyPricing
}: PricingRecommendationPanelProps) {
  const [pricingResult, setPricingResult] = useState<DynamicPricingResult>(mockPricingResult)
  const [objectives, setObjectives] = useState<PricingObjective[]>([
    { type: 'maximize_profit', weight: 0.4, priority: 'high' },
    { type: 'maximize_revenue', weight: 0.3, priority: 'medium' },
    { type: 'maintain_quality_perception', weight: 0.3, priority: 'medium' }
  ])
  const [customPrice, setCustomPrice] = useState([pricingResult.recommendedPrice])
  const [showAdvanced, setShowAdvanced] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getRiskBadgeVariant = (riskScore: number) => {
    if (riskScore < 0.3) return 'default'
    if (riskScore < 0.6) return 'secondary'
    return 'destructive'
  }

  const getImplementationUrgency = (priority: string) => {
    switch (priority) {
      case 'immediate': return { color: 'text-red-600', icon: AlertTriangle }
      case 'within_week': return { color: 'text-orange-600', icon: Clock }
      case 'within_month': return { color: 'text-blue-600', icon: Target }
      default: return { color: 'text-gray-600', icon: Clock }
    }
  }

  const handleApplyRecommendation = () => {
    onApplyPricing?.(pricingResult.recommendedPrice)
  }

  const handleCustomPriceApply = () => {
    onApplyPricing?.(customPrice[0])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pricing Recommendations</h2>
          <p className="text-muted-foreground">
            AI-powered pricing optimization for Recipe {recipeId} - Variant {variantId}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Switch 
              id="advanced-mode"
              checked={showAdvanced}
              onCheckedChange={setShowAdvanced}
            />
            <Label htmlFor="advanced-mode">Advanced Mode</Label>
          </div>
        </div>
      </div>

      {/* Main Recommendation Card */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              AI Recommendation
            </CardTitle>
            <Badge variant="default" className="bg-blue-600">
              <Target className="h-3 w-3 mr-1" />
              Optimized
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current vs Recommended */}
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                <p className="text-2xl font-bold">{formatCurrency(pricingResult.currentPrice)}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Recommended</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(pricingResult.recommendedPrice)}
                  </p>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <Badge variant="outline" className="text-green-600">
                  +{formatCurrency(pricingResult.priceChange)} (+{formatPercentage(pricingResult.priceChangePercentage)})
                </Badge>
              </div>
            </div>

            {/* Impact Metrics */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Projected Margin</p>
                  <p className="font-semibold text-green-600">
                    {formatPercentage(pricingResult.projectedMarginPercentage)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Volume Impact</p>
                  <p className="font-semibold text-orange-600">
                    {pricingResult.volumeChangePercentage > 0 ? '+' : ''}{formatPercentage(pricingResult.volumeChangePercentage)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Revenue</p>
                  <p className="font-semibold">{formatCurrency(pricingResult.projectedRevenue)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Profit</p>
                  <p className="font-semibold">{formatCurrency(pricingResult.projectedProfit)}</p>
                </div>
              </div>
            </div>

            {/* Implementation */}
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Implementation</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Priority:</span>
                    <Badge variant="secondary">{pricingResult.implementationPriority}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Complexity:</span>
                    <Badge variant="outline">{pricingResult.implementationComplexity}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Payback:</span>
                    <span className="font-medium">{pricingResult.expectedPaybackPeriod} days</span>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleApplyRecommendation}
                className="w-full"
              >
                <Zap className="h-4 w-4 mr-2" />
                Apply Recommendation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Tabs */}
      <Tabs defaultValue="scenarios" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="competitive">Competitive</TabsTrigger>
          <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
          <TabsTrigger value="custom">Custom Pricing</TabsTrigger>
        </TabsList>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scenario Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Scenarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Recommended Scenario */}
                  <div className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-green-700">Recommended</h4>
                      <Badge className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Optimal
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <span className="font-medium">{formatCurrency(pricingResult.recommendedPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Volume:</span>
                        <span className="font-medium">{pricingResult.projectedVolume}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Revenue:</span>
                        <span className="font-medium">{formatCurrency(pricingResult.projectedRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Margin:</span>
                        <span className="font-medium">{formatPercentage(pricingResult.projectedMarginPercentage)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Alternative Scenarios */}
                  {pricingResult.alternativeScenarios.map((scenario, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{scenario.scenario}</h4>
                        <Badge 
                          variant={getRiskBadgeVariant(scenario.projectedOutcome.riskScore)}
                        >
                          Risk: {formatPercentage(scenario.projectedOutcome.riskScore * 100)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span>Price:</span>
                          <span className="font-medium">{formatCurrency(scenario.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Volume:</span>
                          <span className="font-medium">{scenario.projectedOutcome.volume}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Revenue:</span>
                          <span className="font-medium">{formatCurrency(scenario.projectedOutcome.revenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Margin:</span>
                          <span className="font-medium">{formatPercentage(scenario.projectedOutcome.margin)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Optimization Factors */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={mockFactorAnalysis}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="factor" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Current"
                      dataKey="current"
                      stroke="#EF4444"
                      fill="#EF4444"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Optimized"
                      dataKey="optimized"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Competitive Tab */}
        <TabsContent value="competitive" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Competitive Positioning */}
            <Card>
              <CardHeader>
                <CardTitle>Competitive Landscape</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div>
                      <p className="font-medium">Your Position</p>
                      <p className="text-sm text-muted-foreground">
                        {pricingResult.competitivePosition} - {pricingResult.pricePerceptile}th percentile
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(pricingResult.recommendedPrice)}</p>
                      <Badge variant="default">Recommended</Badge>
                    </div>
                  </div>

                  {mockCompetitiveData.map((comp, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium">{comp.competitor}</p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>Quality: {comp.quality}/5</span>
                            <Badge variant="outline" className="text-xs">
                              {comp.position}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(comp.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Price vs Quality Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Price vs Quality Positioning</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart 
                    data={[...mockCompetitiveData, {
                      competitor: 'Your Product',
                      price: pricingResult.recommendedPrice,
                      quality: 4.3,
                      position: pricingResult.competitivePosition
                    }]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quality" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'price' ? formatCurrency(Number(value)) : value,
                        name === 'price' ? 'Price' : 'Quality'
                      ]}
                    />
                    <Area 
                      dataKey="price" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.3} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Risk Analysis Tab */}
        <TabsContent value="risks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Factors */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pricingResult.riskFactors.map((risk, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-orange-600" />
                          <h4 className="font-medium">{risk.factor}</h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">
                            {formatPercentage(risk.probability * 100)} chance
                          </Badge>
                          <Badge 
                            variant={Math.abs(risk.impact) > 0.3 ? "destructive" : "secondary"}
                          >
                            {risk.impact > 0 ? '+' : ''}{formatPercentage(risk.impact * 100)} impact
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {risk.mitigation}
                      </p>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Risk Level</span>
                          <span>{formatPercentage(Math.abs(risk.impact * risk.probability) * 100)}</span>
                        </div>
                        <Progress value={Math.abs(risk.impact * risk.probability) * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Overall Risk Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-lg font-semibold text-green-700 mb-1">Low Risk</p>
                    <p className="text-sm text-muted-foreground">
                      Overall risk score: 23%
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Key Mitigations</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Monitor competitor pricing weekly</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Track customer feedback on value perception</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Implement gradual price increase over 2 weeks</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Custom Pricing Tab */}
        <TabsContent value="custom" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Custom Price Selector */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Price Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium mb-4 block">
                      Set Custom Price: {formatCurrency(customPrice[0])}
                    </Label>
                    <Slider
                      value={customPrice}
                      onValueChange={setCustomPrice}
                      max={20}
                      min={8}
                      step={0.25}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>$8.00</span>
                      <span>$20.00</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Margin</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatPercentage(((customPrice[0] - currentCost) / customPrice[0]) * 100)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">vs Current</p>
                      <p className="text-lg font-bold">
                        {formatCurrency(customPrice[0] - currentPrice)}
                      </p>
                    </div>
                  </div>

                  <Button 
                    onClick={handleCustomPriceApply}
                    className="w-full"
                    variant="outline"
                  >
                    Apply Custom Price
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Objective Weights */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Objectives</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {objectives.map((objective, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm font-medium">
                          {objective.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          {formatPercentage(objective.weight * 100)}
                        </span>
                      </div>
                      <Slider
                        value={[objective.weight * 100]}
                        onValueChange={(value) => {
                          const newObjectives = [...objectives]
                          newObjectives[index].weight = value[0] / 100
                          setObjectives(newObjectives)
                        }}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full"
                      />
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

export default PricingRecommendationPanel