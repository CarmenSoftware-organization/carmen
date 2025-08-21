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
  ResponsiveContainer, ComposedChart, AreaChart, Area, Heatmap
} from 'recharts'
import { 
  Download, Filter, RefreshCcw, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Clock, Calendar, Sun, Moon, Coffee, Utensils, Wine, Zap, AlertCircle, 
  CheckCircle, Target, BarChart3, Activity, Timer, Gauge
} from 'lucide-react'

// Types for time-based pattern analysis
interface TimePatternAnalysis {
  analysisId: string
  analysisDate: Date
  location: string
  timeRange: {
    startDate: Date
    endDate: Date
    totalHours: number
  }
  
  // Hourly patterns
  hourlyPatterns: {
    hour: number
    displayHour: string
    fractionalTransactions: number
    wholeTransactions: number
    totalRevenue: number
    averageTransactionValue: number
    efficiency: number
    staffUtilization: number
    customerWaitTime: number
    peakIndicator: 'peak' | 'high' | 'moderate' | 'low'
  }[]
  
  // Day of week patterns
  dayOfWeekPatterns: {
    dayOfWeek: number
    dayName: string
    fractionalSales: {
      transactions: number
      revenue: number
      averageValue: number
      preferenceRatio: number
    }
    wholeSales: {
      transactions: number
      revenue: number
      averageValue: number
      preferenceRatio: number
    }
    peakHours: number[]
    efficiency: number
    staffingOptimal: boolean
  }[]
  
  // Weekly patterns
  weeklyTrends: {
    weekNumber: number
    weekStartDate: Date
    fractionalPerformance: {
      totalTransactions: number
      totalRevenue: number
      growthRate: number
      marketShare: number
    }
    wholePerformance: {
      totalTransactions: number
      totalRevenue: number
      growthRate: number
      marketShare: number
    }
    efficiency: number
    seasonalFactors: {
      weather: 'sunny' | 'rainy' | 'cold' | 'hot'
      events: string[]
      holidays: boolean
      impact: number
    }
  }[]
  
  // Monthly patterns
  monthlyTrends: {
    month: number
    monthName: string
    year: number
    fractionalMetrics: {
      totalTransactions: number
      totalRevenue: number
      averageTransactionValue: number
      growthRate: number
      seasonalIndex: number
    }
    wholeMetrics: {
      totalTransactions: number
      totalRevenue: number
      averageTransactionValue: number
      growthRate: number
      seasonalIndex: number
    }
    operationalMetrics: {
      efficiency: number
      utilization: number
      customerSatisfaction: number
      staffProductivity: number
    }
    externalFactors: {
      tourism: number
      businessEvents: number
      weatherImpact: number
      competitionActivity: number
    }
  }[]
  
  // Predictive insights
  predictions: {
    nextPeriodForecast: {
      period: string
      predictedFractionalSales: number
      predictedWholeSales: number
      confidenceLevel: number
      factorsConsidered: string[]
    }
    seasonalForecasts: {
      season: 'spring' | 'summer' | 'fall' | 'winter'
      fractionalDemandMultiplier: number
      wholeDemandMultiplier: number
      recommendedStaffing: number
      optimalInventoryLevels: {
        ingredient: string
        recommendedLevel: number
        confidenceLevel: number
      }[]
    }[]
    optimizationRecommendations: {
      timeSlot: string
      currentPerformance: number
      optimizedTarget: number
      recommendedActions: string[]
      expectedImprovement: number
      implementation: 'immediate' | 'short_term' | 'long_term'
    }[]
  }
  
  // Performance insights
  insights: {
    peakPerformanceHours: {
      hour: number
      performance: number
      reasoning: string
    }[]
    underperformingPeriods: {
      period: string
      performance: number
      rootCause: string
      recommendedAction: string
    }[]
    seasonalOpportunities: {
      period: string
      opportunity: string
      potentialImpact: number
      investmentRequired: number
    }[]
    staffingRecommendations: {
      timeSlot: string
      currentStaffing: number
      recommendedStaffing: number
      reasoning: string
      costImpact: number
    }[]
  }
}

interface TimePatternAnalysisProps {
  locationId?: string
  analysisType?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'seasonal'
  timeRange?: 'week' | 'month' | 'quarter' | 'year'
}

export default function TimePatternAnalysis({
  locationId = 'main-kitchen',
  analysisType = 'hourly',
  timeRange = 'month'
}: TimePatternAnalysisProps) {
  const [activeTab, setActiveTab] = useState('hourly')
  const [selectedLocation, setSelectedLocation] = useState(locationId)
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)
  const [selectedAnalysis, setSelectedAnalysis] = useState(analysisType)

  // Mock comprehensive time pattern data
  const mockTimePatternData: TimePatternAnalysis = {
    analysisId: 'time-pattern-001',
    analysisDate: new Date(),
    location: selectedLocation,
    timeRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      totalHours: 720
    },
    
    hourlyPatterns: Array.from({length: 24}, (_, i) => {
      // Create realistic hourly patterns
      let baseTransactions = 20
      let peakMultiplier = 1
      let peakIndicator: 'peak' | 'high' | 'moderate' | 'low' = 'low'
      
      // Lunch rush (11-14)
      if (i >= 11 && i <= 14) {
        peakMultiplier = i === 12 ? 3.5 : 2.8
        peakIndicator = i === 12 ? 'peak' : 'high'
      }
      // Dinner rush (17-21)
      else if (i >= 17 && i <= 21) {
        peakMultiplier = i === 19 ? 4.0 : 3.2
        peakIndicator = i === 19 ? 'peak' : 'high'
      }
      // Breakfast (7-10)
      else if (i >= 7 && i <= 10) {
        peakMultiplier = 1.8
        peakIndicator = 'moderate'
      }
      // Late night (22-24, 0-6)
      else if (i >= 22 || i <= 6) {
        peakMultiplier = 0.3
        peakIndicator = 'low'
      }
      // Off-peak
      else {
        peakMultiplier = 0.8
        peakIndicator = 'moderate'
      }
      
      const totalTrans = Math.floor(baseTransactions * peakMultiplier)
      const fractionalTrans = Math.floor(totalTrans * (0.6 + Math.random() * 0.2))
      const wholeTrans = totalTrans - fractionalTrans
      
      return {
        hour: i,
        displayHour: i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`,
        fractionalTransactions: fractionalTrans,
        wholeTransactions: wholeTrans,
        totalRevenue: totalTrans * (15 + Math.random() * 10),
        averageTransactionValue: 15 + Math.random() * 10,
        efficiency: Math.max(60, 95 - (peakMultiplier > 2 ? 15 : 5) + Math.random() * 10),
        staffUtilization: Math.min(100, peakMultiplier * 25 + Math.random() * 15),
        customerWaitTime: peakMultiplier > 2 ? 3 + Math.random() * 4 : 1 + Math.random() * 2,
        peakIndicator
      }
    }),
    
    dayOfWeekPatterns: [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
    ].map((dayName, index) => {
      const weekendMultiplier = index >= 5 ? 1.4 : 1.0
      const fridayMultiplier = index === 4 ? 1.2 : 1.0
      const multiplier = weekendMultiplier * fridayMultiplier
      
      const fractionalBase = 180 * multiplier
      const wholeBase = 120 * multiplier
      
      return {
        dayOfWeek: index,
        dayName,
        fractionalSales: {
          transactions: Math.floor(fractionalBase * (0.9 + Math.random() * 0.2)),
          revenue: fractionalBase * 16.5,
          averageValue: 16.5,
          preferenceRatio: 0.6 + (index >= 5 ? 0.1 : 0)
        },
        wholeSales: {
          transactions: Math.floor(wholeBase * (0.9 + Math.random() * 0.2)),
          revenue: wholeBase * 22.0,
          averageValue: 22.0,
          preferenceRatio: 0.4 - (index >= 5 ? 0.1 : 0)
        },
        peakHours: index >= 5 ? [12, 19, 20] : [12, 19],
        efficiency: 85 + Math.random() * 10 + (index >= 5 ? 5 : 0),
        staffingOptimal: index < 5 || index === 6
      }
    }),
    
    weeklyTrends: Array.from({length: 4}, (_, i) => ({
      weekNumber: i + 1,
      weekStartDate: new Date(Date.now() - (4 - i) * 7 * 24 * 60 * 60 * 1000),
      fractionalPerformance: {
        totalTransactions: 1200 + i * 50 + Math.floor(Math.random() * 100),
        totalRevenue: 18000 + i * 750 + Math.floor(Math.random() * 1500),
        growthRate: (i * 2 - 3) + Math.random() * 4,
        marketShare: 62 + Math.random() * 6
      },
      wholePerformance: {
        totalTransactions: 800 + i * 30 + Math.floor(Math.random() * 80),
        totalRevenue: 16000 + i * 600 + Math.floor(Math.random() * 1200),
        growthRate: (i * 1.5 - 2) + Math.random() * 3,
        marketShare: 38 - Math.random() * 6
      },
      efficiency: 88 + Math.random() * 8,
      seasonalFactors: {
        weather: ['rainy', 'sunny', 'cold', 'hot'][Math.floor(Math.random() * 4)] as any,
        events: i === 2 ? ['Local Festival'] : [],
        holidays: i === 3,
        impact: i === 2 ? 15 : i === 3 ? 25 : Math.random() * 5
      }
    })),
    
    monthlyTrends: Array.from({length: 6}, (_, i) => {
      const month = new Date().getMonth() - 5 + i
      const adjustedMonth = month < 0 ? month + 12 : month
      const seasonalMultiplier = [0.8, 0.85, 0.95, 1.1, 1.2, 1.15, 1.1, 1.05, 1.0, 0.9, 0.85, 0.9][adjustedMonth]
      
      return {
        month: adjustedMonth + 1,
        monthName: new Date(2024, adjustedMonth, 1).toLocaleString('default', { month: 'long' }),
        year: 2024,
        fractionalMetrics: {
          totalTransactions: Math.floor(4800 * seasonalMultiplier * (0.9 + Math.random() * 0.2)),
          totalRevenue: 72000 * seasonalMultiplier * (0.9 + Math.random() * 0.2),
          averageTransactionValue: 15 + Math.random() * 3,
          growthRate: (i - 3) * 2 + Math.random() * 6 - 3,
          seasonalIndex: seasonalMultiplier
        },
        wholeMetrics: {
          totalTransactions: Math.floor(3200 * seasonalMultiplier * (0.9 + Math.random() * 0.2)),
          totalRevenue: 64000 * seasonalMultiplier * (0.9 + Math.random() * 0.2),
          averageTransactionValue: 20 + Math.random() * 4,
          growthRate: (i - 3) * 1.5 + Math.random() * 4 - 2,
          seasonalIndex: seasonalMultiplier
        },
        operationalMetrics: {
          efficiency: 85 + seasonalMultiplier * 10,
          utilization: 75 + seasonalMultiplier * 15,
          customerSatisfaction: 8.5 + seasonalMultiplier * 0.5,
          staffProductivity: 80 + seasonalMultiplier * 10
        },
        externalFactors: {
          tourism: seasonalMultiplier * 100,
          businessEvents: Math.floor(Math.random() * 5),
          weatherImpact: (seasonalMultiplier - 1) * 100,
          competitionActivity: Math.floor(Math.random() * 3)
        }
      }
    }),
    
    predictions: {
      nextPeriodForecast: {
        period: 'Next Month',
        predictedFractionalSales: 5250,
        predictedWholeSales: 3450,
        confidenceLevel: 87,
        factorsConsidered: ['Seasonal trends', 'Historical performance', 'Economic indicators', 'Local events']
      },
      seasonalForecasts: [
        {
          season: 'spring',
          fractionalDemandMultiplier: 1.15,
          wholeDemandMultiplier: 1.05,
          recommendedStaffing: 14,
          optimalInventoryLevels: [
            { ingredient: 'Fresh Vegetables', recommendedLevel: 125, confidenceLevel: 92 },
            { ingredient: 'Dairy Products', recommendedLevel: 88, confidenceLevel: 89 }
          ]
        },
        {
          season: 'summer',
          fractionalDemandMultiplier: 1.35,
          wholeDemandMultiplier: 1.20,
          recommendedStaffing: 18,
          optimalInventoryLevels: [
            { ingredient: 'Fresh Vegetables', recommendedLevel: 165, confidenceLevel: 95 },
            { ingredient: 'Beverages', recommendedLevel: 210, confidenceLevel: 93 }
          ]
        }
      ] as any[],
      optimizationRecommendations: [
        {
          timeSlot: '11:00-14:00 Lunch Rush',
          currentPerformance: 78,
          optimizedTarget: 92,
          recommendedActions: [
            'Add 2 additional prep staff during peak hours',
            'Pre-prepare fractional portions before rush',
            'Implement express service queue for fractional orders'
          ],
          expectedImprovement: 18,
          implementation: 'short_term'
        },
        {
          timeSlot: '17:00-21:00 Dinner Rush', 
          currentPerformance: 82,
          optimizedTarget: 94,
          recommendedActions: [
            'Optimize kitchen workflow for peak efficiency',
            'Cross-train staff for flexible role assignment',
            'Implement demand prediction for better preparation'
          ],
          expectedImprovement: 15,
          implementation: 'short_term'
        }
      ] as any[]
    },
    
    insights: {
      peakPerformanceHours: [
        { hour: 19, performance: 96, reasoning: 'Optimal staffing and well-prepared inventory during dinner rush' },
        { hour: 12, performance: 94, reasoning: 'Efficient lunch service with good fractional sales conversion' }
      ],
      underperformingPeriods: [
        {
          period: '15:00-17:00 Afternoon Lull',
          performance: 68,
          rootCause: 'Overstaffing and low customer demand',
          recommendedAction: 'Reduce staff and focus on prep for dinner rush'
        },
        {
          period: '22:00-24:00 Late Night',
          performance: 52,
          rootCause: 'Limited menu options and high operational costs',
          recommendedAction: 'Consider reduced hours or limited late-night menu'
        }
      ],
      seasonalOpportunities: [
        {
          period: 'Summer Weekend Evenings',
          opportunity: 'Expand outdoor seating and fractional beverage offerings',
          potentialImpact: 28,
          investmentRequired: 15000
        },
        {
          period: 'Holiday Seasons',
          opportunity: 'Special fractional dessert and gift options',
          potentialImpact: 35,
          investmentRequired: 8000
        }
      ],
      staffingRecommendations: [
        {
          timeSlot: '11:00-14:00',
          currentStaffing: 8,
          recommendedStaffing: 12,
          reasoning: 'Peak lunch demand requires additional prep and service staff',
          costImpact: 2400
        },
        {
          timeSlot: '15:00-17:00',
          currentStaffing: 8,
          recommendedStaffing: 5,
          reasoning: 'Low demand period - maintain core staff only',
          costImpact: -1800
        }
      ]
    }
  }

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`
  const formatNumber = (value: number) => value.toLocaleString()

  // Generate heatmap data for hourly patterns
  const heatmapData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const hours = Array.from({length: 24}, (_, i) => i)
    
    return days.flatMap((day, dayIndex) =>
      hours.map(hour => {
        const hourData = mockTimePatternData.hourlyPatterns[hour]
        const dayData = mockTimePatternData.dayOfWeekPatterns[dayIndex]
        const efficiency = hourData.efficiency * (dayData.efficiency / 100)
        
        return {
          day,
          hour: hour === 0 ? '12a' : hour < 12 ? `${hour}a` : hour === 12 ? '12p' : `${hour-12}p`,
          value: Math.round(efficiency),
          transactions: Math.round(hourData.fractionalTransactions * (dayData.fractionalSales.transactions / 180))
        }
      })
    )
  }, [mockTimePatternData])

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Time-Based Consumption Pattern Analysis</h2>
          <p className="text-muted-foreground">
            Optimize operations through temporal consumption insights
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedAnalysis} onValueChange={setSelectedAnalysis}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Hourly Analysis</SelectItem>
              <SelectItem value="daily">Daily Patterns</SelectItem>
              <SelectItem value="weekly">Weekly Trends</SelectItem>
              <SelectItem value="monthly">Monthly Analysis</SelectItem>
              <SelectItem value="seasonal">Seasonal Forecast</SelectItem>
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
            Export Analysis
          </Button>
        </div>
      </div>

      {/* Key Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Peak Performance Hour</span>
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">7:00 PM</div>
              <div className="text-xs text-blue-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                96% efficiency
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Best Day</span>
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold">Saturday</div>
              <div className="text-xs text-green-600 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                40% above average
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Optimization Potential</span>
                <Target className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold">{formatPercentage(23.5)}</div>
              <div className="text-xs text-purple-600">Revenue increase opportunity</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Prediction Confidence</span>
                <Gauge className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold">{formatPercentage(87)}</div>
              <div className="text-xs text-amber-600">Next month forecast</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="hourly">Hourly Patterns</TabsTrigger>
          <TabsTrigger value="daily">Daily Analysis</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Trends</TabsTrigger>
          <TabsTrigger value="monthly">Monthly View</TabsTrigger>
          <TabsTrigger value="predictions">Forecasting</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        {/* Hourly Patterns Tab */}
        <TabsContent value="hourly" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Hourly Revenue Patterns</CardTitle>
                <CardDescription>Revenue and transaction volume by hour</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={mockTimePatternData.hourlyPatterns}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="displayHour" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="totalRevenue" name="Revenue" fill="#8b5cf6" />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="efficiency" 
                        name="Efficiency %" 
                        stroke="#10b981" 
                        strokeWidth={2}
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="staffUtilization" 
                        name="Staff Utilization %" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fractional vs Whole Sales by Hour</CardTitle>
                <CardDescription>Customer preference patterns throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockTimePatternData.hourlyPatterns}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="displayHour" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="fractionalTransactions"
                        name="Fractional Sales"
                        stackId="1"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="wholeTransactions"
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

          <Card>
            <CardHeader>
              <CardTitle>Performance Heatmap</CardTitle>
              <CardDescription>Efficiency across days and hours (higher values indicate better performance)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-24 gap-1 text-xs">
                {/* Hour headers */}
                <div className="col-span-24 grid grid-cols-24 gap-1 mb-2">
                  {Array.from({length: 24}, (_, i) => (
                    <div key={i} className="text-center text-xs text-muted-foreground">
                      {i === 0 ? '12a' : i < 12 ? `${i}a` : i === 12 ? '12p' : `${i-12}p`}
                    </div>
                  ))}
                </div>
                
                {/* Day rows */}
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIndex) => (
                  <div key={day} className="col-span-24 grid grid-cols-24 gap-1 mb-1">
                    {Array.from({length: 24}, (_, hour) => {
                      const hourData = mockTimePatternData.hourlyPatterns[hour]
                      const dayData = mockTimePatternData.dayOfWeekPatterns[dayIndex]
                      const efficiency = hourData.efficiency * (dayData.efficiency / 100)
                      
                      let bgColor = 'bg-gray-100'
                      if (efficiency > 90) bgColor = 'bg-green-500'
                      else if (efficiency > 80) bgColor = 'bg-green-400'
                      else if (efficiency > 70) bgColor = 'bg-yellow-400'
                      else if (efficiency > 60) bgColor = 'bg-orange-400'
                      else bgColor = 'bg-red-400'
                      
                      return (
                        <div
                          key={hour}
                          className={`h-6 ${bgColor} rounded flex items-center justify-center text-white text-xs font-medium`}
                          title={`${day} ${hour}:00 - ${efficiency.toFixed(0)}% efficiency`}
                        >
                          {efficiency.toFixed(0)}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-400 rounded"></div>
                  <span>Low (50-60%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-400 rounded"></div>
                  <span>Fair (60-70%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                  <span>Good (70-80%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-400 rounded"></div>
                  <span>Very Good (80-90%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Excellent (90%+)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Daily Analysis Tab */}
        <TabsContent value="daily" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Day of Week Performance</CardTitle>
              <CardDescription>Revenue and efficiency patterns by day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={mockTimePatternData.dayOfWeekPatterns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dayName" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      yAxisId="left" 
                      dataKey="fractionalSales.revenue" 
                      name="Fractional Revenue" 
                      fill="#8b5cf6" 
                    />
                    <Bar 
                      yAxisId="left" 
                      dataKey="wholeSales.revenue" 
                      name="Whole Revenue" 
                      fill="#06b6d4" 
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="efficiency" 
                      name="Efficiency %" 
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
              <CardTitle>Daily Performance Summary</CardTitle>
              <CardDescription>Detailed breakdown by day of the week</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead className="text-right">Fractional Sales</TableHead>
                    <TableHead className="text-right">Whole Sales</TableHead>
                    <TableHead className="text-right">Total Revenue</TableHead>
                    <TableHead className="text-right">Efficiency</TableHead>
                    <TableHead className="text-right">Peak Hours</TableHead>
                    <TableHead>Staffing</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTimePatternData.dayOfWeekPatterns.map((day) => (
                    <TableRow key={day.dayName}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {day.dayOfWeek >= 5 ? <Sun className="h-4 w-4 text-orange-500" /> : <Coffee className="h-4 w-4 text-brown-500" />}
                          {day.dayName}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <div className="font-medium">{formatCurrency(day.fractionalSales.revenue)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatNumber(day.fractionalSales.transactions)} orders
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <div className="font-medium">{formatCurrency(day.wholeSales.revenue)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatNumber(day.wholeSales.transactions)} orders
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium">
                          {formatCurrency(day.fractionalSales.revenue + day.wholeSales.revenue)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <div className="font-medium">{formatPercentage(day.efficiency)}</div>
                          <Progress value={day.efficiency} className="h-1" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="text-sm">
                          {day.peakHours.map(hour => 
                            hour === 0 ? '12a' : hour < 12 ? `${hour}a` : hour === 12 ? '12p' : `${hour-12}p`
                          ).join(', ')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={day.staffingOptimal ? 'default' : 'outline'}>
                          {day.staffingOptimal ? 'OPTIMAL' : 'NEEDS ADJUSTMENT'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly Trends Tab */}
        <TabsContent value="weekly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Performance Trends</CardTitle>
              <CardDescription>Revenue growth and market share evolution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={mockTimePatternData.weeklyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="weekNumber" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      yAxisId="left" 
                      dataKey="fractionalPerformance.totalRevenue" 
                      name="Fractional Revenue" 
                      fill="#8b5cf6" 
                    />
                    <Bar 
                      yAxisId="left" 
                      dataKey="wholePerformance.totalRevenue" 
                      name="Whole Revenue" 
                      fill="#06b6d4" 
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="fractionalPerformance.marketShare" 
                      name="Fractional Market Share %" 
                      stroke="#10b981" 
                      strokeWidth={3}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Growth Rate Analysis</CardTitle>
                <CardDescription>Week-over-week growth trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTimePatternData.weeklyTrends.map((week, index) => (
                    <div key={week.weekNumber} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Week {week.weekNumber}</span>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Fractional: </span>
                            <Badge variant={week.fractionalPerformance.growthRate > 0 ? 'default' : 'destructive'}>
                              {week.fractionalPerformance.growthRate > 0 ? '+' : ''}{formatPercentage(week.fractionalPerformance.growthRate)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm">Whole: </span>
                            <Badge variant={week.wholePerformance.growthRate > 0 ? 'default' : 'destructive'}>
                              {week.wholePerformance.growthRate > 0 ? '+' : ''}{formatPercentage(week.wholePerformance.growthRate)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {week.seasonalFactors.impact > 10 && (
                        <div className="text-xs text-muted-foreground">
                          External impact: {week.seasonalFactors.events.join(', ') || week.seasonalFactors.weather} 
                          ({formatPercentage(week.seasonalFactors.impact)})
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>External Factors Impact</CardTitle>
                <CardDescription>How external events affect performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTimePatternData.weeklyTrends.map((week) => (
                    <div key={week.weekNumber} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Week {week.weekNumber}</span>
                        <Badge variant="outline" className="capitalize">
                          {week.seasonalFactors.weather}
                        </Badge>
                      </div>
                      
                      {week.seasonalFactors.events.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{week.seasonalFactors.events.join(', ')}</span>
                        </div>
                      )}
                      
                      {week.seasonalFactors.holidays && (
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">Holiday period</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Impact</span>
                        <span className="font-medium">{formatPercentage(week.seasonalFactors.impact)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Monthly View Tab */}
        <TabsContent value="monthly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance Overview</CardTitle>
              <CardDescription>Long-term trends and seasonal patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={mockTimePatternData.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="monthName" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="fractionalMetrics.totalRevenue"
                      name="Fractional Revenue"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="wholeMetrics.totalRevenue"
                      name="Whole Revenue"
                      stroke="#06b6d4"
                      fill="#06b6d4"
                      fillOpacity={0.3}
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="operationalMetrics.efficiency" 
                      name="Efficiency %" 
                      stroke="#10b981" 
                      strokeWidth={3}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Index</CardTitle>
                <CardDescription>Monthly demand patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockTimePatternData.monthlyTrends.map((month) => (
                    <div key={month.month} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{month.monthName}</span>
                        <span className="text-sm">{month.fractionalMetrics.seasonalIndex.toFixed(2)}x</span>
                      </div>
                      <Progress value={month.fractionalMetrics.seasonalIndex * 100} max={150} className="h-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Rates</CardTitle>
                <CardDescription>Month-over-month growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockTimePatternData.monthlyTrends.map((month) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="text-sm">{month.monthName}</span>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          {month.fractionalMetrics.growthRate > 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-600" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-600" />
                          )}
                          <span className="text-sm font-medium">
                            {month.fractionalMetrics.growthRate > 0 ? '+' : ''}{formatPercentage(month.fractionalMetrics.growthRate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>External Factors</CardTitle>
                <CardDescription>Market conditions impact</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockTimePatternData.monthlyTrends.map((month) => (
                    <div key={month.month} className="space-y-2">
                      <div className="font-medium text-sm">{month.monthName}</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Tourism: {month.externalFactors.tourism.toFixed(0)}%</div>
                        <div>Weather: {month.externalFactors.weatherImpact > 0 ? '+' : ''}{month.externalFactors.weatherImpact.toFixed(0)}%</div>
                        <div>Events: {month.externalFactors.businessEvents}</div>
                        <div>Competition: {month.externalFactors.competitionActivity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Next Period Forecast</CardTitle>
              <CardDescription>Predicted performance for the upcoming period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Forecast Summary</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Fractional Sales</span>
                        <span className="font-bold">{formatNumber(mockTimePatternData.predictions.nextPeriodForecast.predictedFractionalSales)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Whole Sales</span>
                        <span className="font-bold">{formatNumber(mockTimePatternData.predictions.nextPeriodForecast.predictedWholeSales)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Confidence Level</span>
                        <Badge variant="default">
                          {formatPercentage(mockTimePatternData.predictions.nextPeriodForecast.confidenceLevel)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Factors Considered</div>
                    <div className="space-y-1">
                      {mockTimePatternData.predictions.nextPeriodForecast.factorsConsidered.map((factor, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="text-sm">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {formatNumber(mockTimePatternData.predictions.nextPeriodForecast.predictedFractionalSales + mockTimePatternData.predictions.nextPeriodForecast.predictedWholeSales)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Predicted Transactions</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Fractional Share</span>
                      <span className="text-sm font-medium">
                        {formatPercentage(
                          mockTimePatternData.predictions.nextPeriodForecast.predictedFractionalSales / 
                          (mockTimePatternData.predictions.nextPeriodForecast.predictedFractionalSales + mockTimePatternData.predictions.nextPeriodForecast.predictedWholeSales) * 100
                        )}
                      </span>
                    </div>
                    <Progress 
                      value={
                        mockTimePatternData.predictions.nextPeriodForecast.predictedFractionalSales / 
                        (mockTimePatternData.predictions.nextPeriodForecast.predictedFractionalSales + mockTimePatternData.predictions.nextPeriodForecast.predictedWholeSales) * 100
                      } 
                      className="h-2" 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seasonal Forecasts</CardTitle>
              <CardDescription>Demand predictions by season with inventory recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 lg:grid-cols-2">
                {mockTimePatternData.predictions.seasonalForecasts.map((season, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg capitalize">{season.season}</CardTitle>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Demand Multiplier</div>
                          <div className="font-bold">
                            F: {season.fractionalDemandMultiplier}x | W: {season.wholeDemandMultiplier}x
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Recommended Staffing</span>
                          <Badge variant="outline">{season.recommendedStaffing} staff</Badge>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-2">Inventory Recommendations</div>
                          <div className="space-y-1">
                            {season.optimalInventoryLevels.map((item, i) => (
                              <div key={i} className="flex items-center justify-between text-sm">
                                <span>{item.ingredient}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{item.recommendedLevel} units</span>
                                  <Badge variant="outline" className="text-xs">
                                    {formatPercentage(item.confidenceLevel)}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-6">
          <div className="grid gap-6">
            {mockTimePatternData.predictions.optimizationRecommendations.map((rec, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{rec.timeSlot}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Current: {formatPercentage(rec.currentPerformance)}
                      </Badge>
                      <Badge variant="default">
                        Target: {formatPercentage(rec.optimizedTarget)}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Potential improvement: {formatPercentage(rec.expectedImprovement)} | Implementation: {rec.implementation.replace('_', ' ')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-sm font-medium mb-2">Current Performance</div>
                        <Progress value={rec.currentPerformance} className="h-2" />
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-sm font-medium mb-2">Optimized Target</div>
                        <Progress value={rec.optimizedTarget} className="h-2 bg-green-200" />
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium mb-2">Recommended Actions</div>
                      <div className="space-y-1">
                        {rec.recommendedActions.map((action, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span>{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button className="w-full">
                        {rec.implementation === 'immediate' ? 'Implement Now' : 'Plan Implementation'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Staffing Optimization</CardTitle>
                <CardDescription>Recommended staffing adjustments by time slot</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTimePatternData.insights.staffingRecommendations.map((staffing, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{staffing.timeSlot}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {staffing.currentStaffing} → {staffing.recommendedStaffing}
                          </Badge>
                          <Badge variant={staffing.costImpact > 0 ? 'destructive' : 'default'}>
                            {staffing.costImpact > 0 ? '+' : ''}{formatCurrency(staffing.costImpact)}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{staffing.reasoning}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seasonal Opportunities</CardTitle>
                <CardDescription>Strategic opportunities by time period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTimePatternData.insights.seasonalOpportunities.map((opp, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{opp.period}</span>
                        <Badge variant="outline">
                          {formatPercentage(opp.potentialImpact)} impact
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{opp.opportunity}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Investment Required:</span>
                        <span className="font-medium">{formatCurrency(opp.investmentRequired)}</span>
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