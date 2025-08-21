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
  PolarAngleAxis, PolarRadiusAxis, Radar, HeatmapChart
} from 'recharts'
import { 
  Download, Filter, RefreshCcw, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  MapPin, Building2, Award, Target, AlertCircle, CheckCircle, BarChart3,
  Users, Clock, Zap, DollarSign, Package, Star, Gauge
} from 'lucide-react'

// Types for cross-location analysis
interface LocationPerformance {
  locationId: string
  locationName: string
  locationType: 'main_kitchen' | 'satellite_kitchen' | 'bar_station' | 'pastry_section' | 'prep_area'
  capacity: {
    maxCovers: number
    staffCount: number
    equipmentScore: number
    storageCapacity: number
  }
  fractionalSalesMetrics: {
    totalTransactions: number
    totalRevenue: number
    averageTransactionValue: number
    conversionRate: number
    customerSatisfaction: number
    operationalEfficiency: number
  }
  efficiency: {
    revenuePerSqFt: number
    revenuePerStaff: number
    utilization: number
    wastePercentage: number
    speedOfService: number // minutes per order
    qualityScore: number
  }
  fractionalTypes: {
    type: 'pizza-slice' | 'cake-slice' | 'bottle-glass' | 'portion-control' | 'custom'
    transactions: number
    revenue: number
    profitMargin: number
    efficiency: number
    customerPreference: number
  }[]
  benchmarks: {
    industryAverage: number
    companyAverage: number
    topPerformer: number
    improvementPotential: number
  }
  trends: {
    period: string
    revenue: number
    efficiency: number
    satisfaction: number
    utilization: number
  }[]
  challenges: {
    type: 'capacity' | 'staffing' | 'equipment' | 'training' | 'process'
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    impact: number
    recommendedAction: string
  }[]
  opportunities: {
    type: 'expansion' | 'optimization' | 'automation' | 'cross_training' | 'menu_mix'
    priority: 'high' | 'medium' | 'low'
    description: string
    potentialImpact: number
    investmentRequired: number
    timeframe: string
  }[]
}

interface CrossLocationComparison {
  analysisDate: Date
  locations: LocationPerformance[]
  overallMetrics: {
    totalRevenue: number
    averageEfficiency: number
    topPerformingLocation: string
    underperformingLocation: string
    efficiencyGap: number
    standardizationScore: number
  }
  correlationAnalysis: {
    factorImpact: {
      factor: string
      correlationCoeff: number
      significance: 'high' | 'medium' | 'low'
      description: string
    }[]
  }
  networkOptimization: {
    currentConfiguration: string
    recommendedChanges: {
      location: string
      change: string
      expectedImpact: number
    }[]
    overallImprovementPotential: number
  }
}

interface CrossLocationEfficiencyProps {
  timeRange?: 'week' | 'month' | 'quarter' | 'year'
  comparisonType?: 'efficiency' | 'revenue' | 'satisfaction' | 'all'
}

export default function CrossLocationEfficiency({
  timeRange = 'month',
  comparisonType = 'all'
}: CrossLocationEfficiencyProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)
  const [selectedMetric, setSelectedMetric] = useState(comparisonType)
  const [selectedLocations, setSelectedLocations] = useState<string[]>(['all'])

  // Mock comprehensive cross-location data
  const mockLocationData: CrossLocationComparison = {
    analysisDate: new Date(),
    locations: [
      {
        locationId: 'main-kitchen',
        locationName: 'Main Kitchen',
        locationType: 'main_kitchen',
        capacity: {
          maxCovers: 200,
          staffCount: 12,
          equipmentScore: 9.2,
          storageCapacity: 85
        },
        fractionalSalesMetrics: {
          totalTransactions: 1247,
          totalRevenue: 18650.00,
          averageTransactionValue: 14.96,
          conversionRate: 0.89,
          customerSatisfaction: 9.2,
          operationalEfficiency: 94.8
        },
        efficiency: {
          revenuePerSqFt: 156.42,
          revenuePerStaff: 1554.17,
          utilization: 87.5,
          wastePercentage: 3.2,
          speedOfService: 4.2,
          qualityScore: 9.1
        },
        fractionalTypes: [
          { type: 'pizza-slice', transactions: 678, revenue: 8136.00, profitMargin: 68.5, efficiency: 95.2, customerPreference: 8.9 },
          { type: 'cake-slice', transactions: 234, revenue: 3276.00, profitMargin: 72.1, efficiency: 89.6, customerPreference: 9.4 },
          { type: 'bottle-glass', transactions: 189, revenue: 2835.00, profitMargin: 75.3, efficiency: 92.1, customerPreference: 8.7 },
          { type: 'portion-control', transactions: 146, revenue: 4403.00, profitMargin: 65.8, efficiency: 88.9, customerPreference: 8.5 }
        ],
        benchmarks: {
          industryAverage: 85.0,
          companyAverage: 87.2,
          topPerformer: 94.8,
          improvementPotential: 8.2
        },
        trends: [
          { period: 'Week 1', revenue: 4425, efficiency: 93.8, satisfaction: 9.0, utilization: 85.2 },
          { period: 'Week 2', revenue: 4712, efficiency: 94.5, satisfaction: 9.1, utilization: 86.8 },
          { period: 'Week 3', revenue: 4638, efficiency: 95.1, satisfaction: 9.3, utilization: 88.1 },
          { period: 'Week 4', revenue: 4875, efficiency: 94.8, satisfaction: 9.2, utilization: 87.5 }
        ],
        challenges: [
          {
            type: 'capacity',
            severity: 'medium',
            description: 'Peak hour bottlenecks affecting service speed',
            impact: 12.5,
            recommendedAction: 'Add additional prep station during rush hours'
          }
        ],
        opportunities: [
          {
            type: 'optimization',
            priority: 'high',
            description: 'Implement advanced inventory management system',
            potentialImpact: 15.2,
            investmentRequired: 8500,
            timeframe: '2-3 months'
          }
        ]
      },
      {
        locationId: 'bar-station',
        locationName: 'Bar Station',
        locationType: 'bar_station',
        capacity: {
          maxCovers: 80,
          staffCount: 4,
          equipmentScore: 8.1,
          storageCapacity: 35
        },
        fractionalSalesMetrics: {
          totalTransactions: 892,
          totalRevenue: 15680.00,
          averageTransactionValue: 17.58,
          conversionRate: 0.82,
          customerSatisfaction: 8.9,
          operationalEfficiency: 91.3
        },
        efficiency: {
          revenuePerSqFt: 392.00,
          revenuePerStaff: 3920.00,
          utilization: 78.5,
          wastePercentage: 2.1,
          speedOfService: 2.8,
          qualityScore: 8.9
        },
        fractionalTypes: [
          { type: 'bottle-glass', transactions: 567, revenue: 11907.00, profitMargin: 78.2, efficiency: 96.5, customerPreference: 9.3 },
          { type: 'portion-control', transactions: 213, revenue: 2556.00, profitMargin: 71.8, efficiency: 88.7, customerPreference: 8.6 },
          { type: 'custom', transactions: 112, revenue: 1217.00, profitMargin: 69.4, efficiency: 85.2, customerPreference: 8.2 }
        ],
        benchmarks: {
          industryAverage: 82.5,
          companyAverage: 87.2,
          topPerformer: 91.3,
          improvementPotential: 11.8
        },
        trends: [
          { period: 'Week 1', revenue: 3725, efficiency: 90.2, satisfaction: 8.7, utilization: 76.8 },
          { period: 'Week 2', revenue: 3892, efficiency: 91.1, satisfaction: 8.9, utilization: 78.2 },
          { period: 'Week 3', revenue: 3968, efficiency: 91.8, satisfaction: 9.0, utilization: 79.1 },
          { period: 'Week 4', revenue: 4095, efficiency: 91.3, satisfaction: 8.9, utilization: 78.5 }
        ],
        challenges: [
          {
            type: 'staffing',
            severity: 'medium',
            description: 'Limited specialized cocktail expertise during peak hours',
            impact: 8.7,
            recommendedAction: 'Cross-train additional staff in bartending skills'
          }
        ],
        opportunities: [
          {
            type: 'menu_mix',
            priority: 'high',
            description: 'Expand premium spirits selection for higher margins',
            potentialImpact: 18.5,
            investmentRequired: 12000,
            timeframe: '1-2 months'
          }
        ]
      },
      {
        locationId: 'pastry-section',
        locationName: 'Pastry Section',
        locationType: 'pastry_section',
        capacity: {
          maxCovers: 0,
          staffCount: 6,
          equipmentScore: 8.9,
          storageCapacity: 45
        },
        fractionalSalesMetrics: {
          totalTransactions: 567,
          totalRevenue: 8505.00,
          averageTransactionValue: 15.00,
          conversionRate: 0.76,
          customerSatisfaction: 9.5,
          operationalEfficiency: 86.4
        },
        efficiency: {
          revenuePerSqFt: 340.20,
          revenuePerStaff: 1417.50,
          utilization: 73.2,
          wastePercentage: 4.8,
          speedOfService: 3.5,
          qualityScore: 9.6
        },
        fractionalTypes: [
          { type: 'cake-slice', transactions: 387, revenue: 6198.00, profitMargin: 74.2, efficiency: 88.1, customerPreference: 9.6 },
          { type: 'portion-control', transactions: 124, revenue: 1674.00, profitMargin: 69.8, efficiency: 82.3, customerPreference: 9.2 },
          { type: 'custom', transactions: 56, revenue: 633.00, profitMargin: 71.5, efficiency: 79.8, customerPreference: 9.4 }
        ],
        benchmarks: {
          industryAverage: 78.5,
          companyAverage: 87.2,
          topPerformer: 91.3,
          improvementPotential: 14.2
        },
        trends: [
          { period: 'Week 1', revenue: 2025, efficiency: 85.1, satisfaction: 9.4, utilization: 71.8 },
          { period: 'Week 2', revenue: 2145, efficiency: 86.2, satisfaction: 9.5, utilization: 72.9 },
          { period: 'Week 3', revenue: 2180, efficiency: 87.1, satisfaction: 9.6, utilization: 74.1 },
          { period: 'Week 4', revenue: 2155, efficiency: 86.4, satisfaction: 9.5, utilization: 73.2 }
        ],
        challenges: [
          {
            type: 'equipment',
            severity: 'medium',
            description: 'Limited oven capacity during high-demand periods',
            impact: 16.8,
            recommendedAction: 'Install additional convection oven or optimize baking schedules'
          }
        ],
        opportunities: [
          {
            type: 'expansion',
            priority: 'medium',
            description: 'Introduce specialty dietary options (gluten-free, vegan)',
            potentialImpact: 22.3,
            investmentRequired: 5500,
            timeframe: '3-4 months'
          }
        ]
      },
      {
        locationId: 'satellite-kitchen',
        locationName: 'Satellite Kitchen',
        locationType: 'satellite_kitchen',
        capacity: {
          maxCovers: 120,
          staffCount: 8,
          equipmentScore: 7.8,
          storageCapacity: 60
        },
        fractionalSalesMetrics: {
          totalTransactions: 756,
          totalRevenue: 9828.00,
          averageTransactionValue: 13.00,
          conversionRate: 0.71,
          customerSatisfaction: 8.1,
          operationalEfficiency: 82.6
        },
        efficiency: {
          revenuePerSqFt: 98.28,
          revenuePerStaff: 1228.50,
          utilization: 68.9,
          wastePercentage: 6.5,
          speedOfService: 5.8,
          qualityScore: 8.2
        },
        fractionalTypes: [
          { type: 'pizza-slice', transactions: 445, revenue: 4895.00, profitMargin: 62.1, efficiency: 81.2, customerPreference: 7.9 },
          { type: 'portion-control', transactions: 201, revenue: 2814.00, profitMargin: 58.9, efficiency: 78.5, customerPreference: 8.1 },
          { type: 'custom', transactions: 110, revenue: 2119.00, profitMargin: 65.3, efficiency: 85.7, customerPreference: 8.5 }
        ],
        benchmarks: {
          industryAverage: 85.0,
          companyAverage: 87.2,
          topPerformer: 94.8,
          improvementPotential: 23.8
        },
        trends: [
          { period: 'Week 1', revenue: 2325, efficiency: 80.8, satisfaction: 7.9, utilization: 66.5 },
          { period: 'Week 2', revenue: 2456, efficiency: 82.1, satisfaction: 8.0, utilization: 68.2 },
          { period: 'Week 3', revenue: 2512, efficiency: 83.5, satisfaction: 8.2, utilization: 70.1 },
          { period: 'Week 4', revenue: 2535, efficiency: 82.6, satisfaction: 8.1, utilization: 68.9 }
        ],
        challenges: [
          {
            type: 'training',
            severity: 'high',
            description: 'Inconsistent food quality and preparation standards',
            impact: 25.3,
            recommendedAction: 'Implement comprehensive training program and quality monitoring'
          },
          {
            type: 'equipment',
            severity: 'medium',
            description: 'Aging equipment affecting efficiency and reliability',
            impact: 18.9,
            recommendedAction: 'Equipment upgrade and preventive maintenance program'
          }
        ],
        opportunities: [
          {
            type: 'optimization',
            priority: 'high',
            description: 'Standardize processes to match main kitchen performance',
            potentialImpact: 28.7,
            investmentRequired: 15000,
            timeframe: '4-6 months'
          }
        ]
      }
    ],
    overallMetrics: {
      totalRevenue: 52663.00,
      averageEfficiency: 88.8,
      topPerformingLocation: 'main-kitchen',
      underperformingLocation: 'satellite-kitchen',
      efficiencyGap: 12.2,
      standardizationScore: 0.73
    },
    correlationAnalysis: {
      factorImpact: [
        { factor: 'Staff Training Level', correlationCoeff: 0.87, significance: 'high', description: 'Strong positive correlation with efficiency and quality' },
        { factor: 'Equipment Quality', correlationCoeff: 0.72, significance: 'high', description: 'Equipment condition significantly impacts performance' },
        { factor: 'Storage Capacity', correlationCoeff: 0.58, significance: 'medium', description: 'Adequate storage reduces waste and improves efficiency' },
        { factor: 'Location Size', correlationCoeff: 0.34, significance: 'low', description: 'Size has minimal impact compared to operational factors' }
      ]
    },
    networkOptimization: {
      currentConfiguration: 'Decentralized with varying standards',
      recommendedChanges: [
        { location: 'satellite-kitchen', change: 'Standardize processes and upgrade equipment', expectedImpact: 28.7 },
        { location: 'pastry-section', change: 'Increase production capacity and optimize workflow', expectedImpact: 14.2 },
        { location: 'bar-station', change: 'Expand premium offerings and cross-train staff', expectedImpact: 18.5 }
      ],
      overallImprovementPotential: 23.4
    }
  }

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`
  const formatNumber = (value: number) => value.toLocaleString()

  // Colors for different locations
  const LOCATION_COLORS = {
    'main-kitchen': '#8b5cf6',
    'bar-station': '#06b6d4', 
    'pastry-section': '#10b981',
    'satellite-kitchen': '#f59e0b'
  }

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'main_kitchen': return <Building2 className="h-4 w-4" />
      case 'bar_station': return <Package className="h-4 w-4" />
      case 'pastry_section': return <Star className="h-4 w-4" />
      default: return <MapPin className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cross-Location Efficiency Analysis</h2>
          <p className="text-muted-foreground">
            Compare fractional sales performance across all locations
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Metrics</SelectItem>
              <SelectItem value="efficiency">Efficiency</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="satisfaction">Satisfaction</SelectItem>
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
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Network Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total Network Revenue</span>
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{formatCurrency(mockLocationData.overallMetrics.totalRevenue)}</div>
              <div className="text-xs text-muted-foreground">
                {mockLocationData.locations.length} active locations
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Average Efficiency</span>
                <Gauge className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">{formatPercentage(mockLocationData.overallMetrics.averageEfficiency)}</div>
              <div className="text-xs text-blue-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Above industry average
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Top Performer</span>
                <Award className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="text-lg font-bold">
                {mockLocationData.locations.find(l => l.locationId === mockLocationData.overallMetrics.topPerformingLocation)?.locationName}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatPercentage(
                  mockLocationData.locations.find(l => l.locationId === mockLocationData.overallMetrics.topPerformingLocation)?.fractionalSalesMetrics.operationalEfficiency || 0
                )} efficiency
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Improvement Potential</span>
                <Target className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">{formatPercentage(mockLocationData.networkOptimization.overallImprovementPotential)}</div>
              <div className="text-xs text-muted-foreground">Network-wide opportunity</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="network">Network Analysis</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Location Performance Radar</CardTitle>
                <CardDescription>Multi-dimensional performance comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={[
                      {
                        metric: 'Efficiency',
                        ...Object.fromEntries(
                          mockLocationData.locations.map(l => [l.locationName, l.fractionalSalesMetrics.operationalEfficiency])
                        )
                      },
                      {
                        metric: 'Revenue/Staff',
                        ...Object.fromEntries(
                          mockLocationData.locations.map(l => [l.locationName, l.efficiency.revenuePerStaff / 50])
                        )
                      },
                      {
                        metric: 'Customer Satisfaction',
                        ...Object.fromEntries(
                          mockLocationData.locations.map(l => [l.locationName, l.fractionalSalesMetrics.customerSatisfaction * 10])
                        )
                      },
                      {
                        metric: 'Utilization',
                        ...Object.fromEntries(
                          mockLocationData.locations.map(l => [l.locationName, l.efficiency.utilization])
                        )
                      },
                      {
                        metric: 'Quality Score',
                        ...Object.fromEntries(
                          mockLocationData.locations.map(l => [l.locationName, l.efficiency.qualityScore * 10])
                        )
                      }
                    ]}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      {mockLocationData.locations.map((location, index) => (
                        <Radar
                          key={location.locationId}
                          name={location.locationName}
                          dataKey={location.locationName}
                          stroke={Object.values(LOCATION_COLORS)[index]}
                          fill={Object.values(LOCATION_COLORS)[index]}
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

            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Efficiency Scatter</CardTitle>
                <CardDescription>Location positioning by key metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={mockLocationData.locations.map(l => ({
                      name: l.locationName,
                      revenue: l.fractionalSalesMetrics.totalRevenue,
                      efficiency: l.fractionalSalesMetrics.operationalEfficiency,
                      staff: l.capacity.staffCount
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" dataKey="revenue" name="Revenue" />
                      <YAxis type="number" dataKey="efficiency" name="Efficiency" />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(value, name) => [
                          name === 'revenue' ? formatCurrency(value as number) : 
                          name === 'efficiency' ? formatPercentage(value as number) : value,
                          name === 'revenue' ? 'Revenue' : 
                          name === 'efficiency' ? 'Efficiency' : 'Staff Count'
                        ]}
                      />
                      <Scatter dataKey="efficiency" fill="#8884d8" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Location Summary</CardTitle>
              <CardDescription>Key performance metrics by location</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                    <TableHead className="text-right">Efficiency</TableHead>
                    <TableHead className="text-right">Satisfaction</TableHead>
                    <TableHead className="text-right">Utilization</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockLocationData.locations
                    .sort((a, b) => b.fractionalSalesMetrics.operationalEfficiency - a.fractionalSalesMetrics.operationalEfficiency)
                    .map((location, index) => (
                    <TableRow key={location.locationId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getLocationIcon(location.locationType)}
                          <div>
                            <div className="font-medium">{location.locationName}</div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {location.locationType.replace('_', ' ')}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <div className="font-medium">{formatCurrency(location.fractionalSalesMetrics.totalRevenue)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(location.fractionalSalesMetrics.averageTransactionValue)} avg
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(location.fractionalSalesMetrics.totalTransactions)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <div className="font-medium">{formatPercentage(location.fractionalSalesMetrics.operationalEfficiency)}</div>
                          <Progress value={location.fractionalSalesMetrics.operationalEfficiency} className="h-1" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span>{location.fractionalSalesMetrics.customerSatisfaction}/10</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPercentage(location.efficiency.utilization)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            index === 0 ? 'default' :
                            location.fractionalSalesMetrics.operationalEfficiency > mockLocationData.overallMetrics.averageEfficiency ? 'secondary' :
                            'outline'
                          }
                        >
                          {index === 0 ? 'TOP PERFORMER' :
                           location.fractionalSalesMetrics.operationalEfficiency > mockLocationData.overallMetrics.averageEfficiency ? 'ABOVE AVERAGE' :
                           'NEEDS IMPROVEMENT'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Comparison</CardTitle>
                <CardDescription>Total revenue and revenue per staff across locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={mockLocationData.locations}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="locationName" angle={-45} textAnchor="end" height={80} />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        yAxisId="left" 
                        dataKey="fractionalSalesMetrics.totalRevenue" 
                        name="Total Revenue" 
                        fill="#8b5cf6" 
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="efficiency.revenuePerStaff" 
                        name="Revenue per Staff" 
                        stroke="#10b981" 
                        strokeWidth={3}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Efficiency Metrics Comparison</CardTitle>
                <CardDescription>Operational efficiency and utilization rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockLocationData.locations}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="locationName" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip formatter={(value) => formatPercentage(value as number)} />
                      <Legend />
                      <Bar 
                        dataKey="fractionalSalesMetrics.operationalEfficiency" 
                        name="Operational Efficiency" 
                        fill="#06b6d4" 
                      />
                      <Bar 
                        dataKey="efficiency.utilization" 
                        name="Utilization" 
                        fill="#10b981" 
                        fillOpacity={0.7}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Fractional Sales Type Performance by Location</CardTitle>
              <CardDescription>Revenue breakdown by fractional sale type across locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={mockLocationData.locations.map(location => ({
                      locationName: location.locationName,
                      ...location.fractionalTypes.reduce((acc, type) => ({
                        ...acc,
                        [type.type]: type.revenue
                      }), {})
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="locationName" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="pizza-slice" stackId="a" name="Pizza Slice" fill="#8b5cf6" />
                    <Bar dataKey="cake-slice" stackId="a" name="Cake Slice" fill="#06b6d4" />
                    <Bar dataKey="bottle-glass" stackId="a" name="Bottle Glass" fill="#10b981" />
                    <Bar dataKey="portion-control" stackId="a" name="Portion Control" fill="#f59e0b" />
                    <Bar dataKey="custom" stackId="a" name="Custom" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Efficiency Tab */}
        <TabsContent value="efficiency" className="space-y-6">
          <div className="grid gap-4">
            {mockLocationData.locations.map((location) => (
              <Card key={location.locationId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getLocationIcon(location.locationType)}
                      <CardTitle className="text-lg">{location.locationName}</CardTitle>
                    </div>
                    <Badge
                      variant={
                        location.fractionalSalesMetrics.operationalEfficiency > 90 ? 'default' :
                        location.fractionalSalesMetrics.operationalEfficiency > 85 ? 'secondary' : 'outline'
                      }
                    >
                      {formatPercentage(location.fractionalSalesMetrics.operationalEfficiency)} Efficiency
                    </Badge>
                  </div>
                  <CardDescription>Comprehensive efficiency analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 lg:grid-cols-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">Revenue per Sq Ft</div>
                      <div className="text-xl font-bold">{formatCurrency(location.efficiency.revenuePerSqFt)}</div>
                      <div className="text-xs text-muted-foreground">Monthly average</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">Revenue per Staff</div>
                      <div className="text-xl font-bold">{formatCurrency(location.efficiency.revenuePerStaff)}</div>
                      <div className="text-xs text-muted-foreground">{location.capacity.staffCount} staff members</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">Service Speed</div>
                      <div className="text-xl font-bold">{location.efficiency.speedOfService} min</div>
                      <div className="text-xs text-muted-foreground">Average per order</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">Waste Rate</div>
                      <div className="text-xl font-bold text-red-600">{formatPercentage(location.efficiency.wastePercentage)}</div>
                      <div className="text-xs text-muted-foreground">Monthly average</div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Overall Efficiency</span>
                        <span className="text-sm">{formatPercentage(location.fractionalSalesMetrics.operationalEfficiency)}</span>
                      </div>
                      <Progress value={location.fractionalSalesMetrics.operationalEfficiency} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Utilization Rate</span>
                        <span className="text-sm">{formatPercentage(location.efficiency.utilization)}</span>
                      </div>
                      <Progress value={location.efficiency.utilization} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Quality Score</span>
                        <span className="text-sm">{location.efficiency.qualityScore}/10</span>
                      </div>
                      <Progress value={location.efficiency.qualityScore * 10} className="h-2" />
                    </div>
                  </div>

                  {location.challenges.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium">Key Challenges</span>
                      </div>
                      {location.challenges.map((challenge, index) => (
                        <div key={index} className="text-xs text-muted-foreground mb-1">
                          • {challenge.description} (Impact: {formatPercentage(challenge.impact)})
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends by Location</CardTitle>
              <CardDescription>Revenue and efficiency trends over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={
                    mockLocationData.locations[0].trends.map(trend => ({
                      period: trend.period,
                      ...Object.fromEntries(
                        mockLocationData.locations.map(location => [
                          location.locationName, 
                          location.trends.find(t => t.period === trend.period)?.revenue || 0
                        ])
                      )
                    }))
                  }>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    {mockLocationData.locations.map((location, index) => (
                      <Line 
                        key={location.locationId}
                        type="monotone" 
                        dataKey={location.locationName} 
                        stroke={Object.values(LOCATION_COLORS)[index]} 
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
                <CardTitle>Efficiency Trends</CardTitle>
                <CardDescription>Operational efficiency evolution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={
                      mockLocationData.locations[0].trends.map(trend => ({
                        period: trend.period,
                        ...Object.fromEntries(
                          mockLocationData.locations.map(location => [
                            location.locationName, 
                            location.trends.find(t => t.period === trend.period)?.efficiency || 0
                          ])
                        )
                      }))
                    }>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatPercentage(value as number)} />
                      <Legend />
                      {mockLocationData.locations.map((location, index) => (
                        <Line 
                          key={location.locationId}
                          type="monotone" 
                          dataKey={location.locationName} 
                          stroke={Object.values(LOCATION_COLORS)[index]} 
                          strokeWidth={2}
                          strokeDasharray={index % 2 === 1 ? "5 5" : "0"}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Satisfaction Trends</CardTitle>
                <CardDescription>Service quality over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={
                      mockLocationData.locations[0].trends.map(trend => ({
                        period: trend.period,
                        ...Object.fromEntries(
                          mockLocationData.locations.map(location => [
                            location.locationName, 
                            location.trends.find(t => t.period === trend.period)?.satisfaction || 0
                          ])
                        )
                      }))
                    }>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis domain={[7, 10]} />
                      <Tooltip formatter={(value) => `${value}/10`} />
                      <Legend />
                      {mockLocationData.locations.map((location, index) => (
                        <Line 
                          key={location.locationId}
                          type="monotone" 
                          dataKey={location.locationName} 
                          stroke={Object.values(LOCATION_COLORS)[index]} 
                          strokeWidth={2}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-6">
          <div className="grid gap-6">
            {mockLocationData.networkOptimization.recommendedChanges.map((change, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {mockLocationData.locations.find(l => l.locationId === change.location)?.locationName} Optimization
                    </CardTitle>
                    <Badge variant="outline">
                      {formatPercentage(change.expectedImpact)} Impact
                    </Badge>
                  </div>
                  <CardDescription>Recommended improvements for enhanced performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="font-medium text-sm mb-2">Recommended Changes</div>
                      <div className="text-sm text-muted-foreground">{change.change}</div>
                    </div>
                    
                    {/* Find corresponding location data */}
                    {(() => {
                      const location = mockLocationData.locations.find(l => l.locationId === change.location)
                      return location && (
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div>
                            <div className="text-sm font-medium mb-2">Current Challenges</div>
                            <div className="space-y-1">
                              {location.challenges.map((challenge, i) => (
                                <div key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                                  <AlertCircle className="h-3 w-3" />
                                  {challenge.description}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-2">Opportunities</div>
                            <div className="space-y-1">
                              {location.opportunities.map((opportunity, i) => (
                                <div key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  {opportunity.description}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                    
                    <div className="pt-2">
                      <Button className="w-full">
                        Implement Optimization Plan
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Network Analysis Tab */}
        <TabsContent value="network" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Correlation Analysis</CardTitle>
              <CardDescription>Factors that impact location performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLocationData.correlationAnalysis.factorImpact.map((factor, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{factor.factor}</span>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            factor.significance === 'high' ? 'default' :
                            factor.significance === 'medium' ? 'secondary' : 'outline'
                          }
                        >
                          {factor.significance.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium">{(factor.correlationCoeff * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <Progress value={Math.abs(factor.correlationCoeff) * 100} className="h-2" />
                    <div className="text-xs text-muted-foreground">{factor.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Network Standardization</CardTitle>
                <CardDescription>Consistency across locations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Standardization Score</span>
                    <span className="text-sm font-bold">{(mockLocationData.overallMetrics.standardizationScore * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={mockLocationData.overallMetrics.standardizationScore * 100} className="h-2" />
                  <div className="text-xs text-muted-foreground">Measure of consistency across locations</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Efficiency Gap</span>
                    <span className="text-sm font-bold text-amber-600">{formatPercentage(mockLocationData.overallMetrics.efficiencyGap)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Difference between top and bottom performers
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="text-sm font-medium mb-2">Key Insights</div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>• Staff training shows highest correlation with performance</div>
                    <div>• Equipment quality significantly impacts efficiency</div>
                    <div>• Location size has minimal impact on success</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network Optimization Summary</CardTitle>
                <CardDescription>Overall improvement potential</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-green-600">
                    {formatPercentage(mockLocationData.networkOptimization.overallImprovementPotential)}
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Network Improvement Potential</div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-medium">Current Configuration</div>
                  <div className="text-xs text-muted-foreground">
                    {mockLocationData.networkOptimization.currentConfiguration}
                  </div>
                  
                  <div className="text-sm font-medium">Recommended Changes</div>
                  <div className="space-y-1">
                    {mockLocationData.networkOptimization.recommendedChanges.map((change, i) => (
                      <div key={i} className="text-xs text-muted-foreground">
                        • {change.location}: {formatPercentage(change.expectedImpact)} potential improvement
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full">
                  Generate Network Optimization Plan
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}