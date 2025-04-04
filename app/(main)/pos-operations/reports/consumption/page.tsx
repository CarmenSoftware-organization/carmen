"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Download, Filter, RefreshCcw, ArrowLeft, BarChart2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Types
interface ConsumptionData {
  day: string
  theoretical: number
  actual: number
}

interface CategoryData {
  name: string
  value: number
  color: string
}

interface WasteItem {
  name: string
  actual: number
  theoretical: number
  variance: number
  percent: number
}

interface PieLabelProps {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
  index: number
}

type DateRange = 'today' | 'week' | 'mtd' | 'ytd'
type Location = 'all' | 'main' | 'coffee' | 'bar'
type ActiveTab = 'overview' | 'byCategory' | 'byItem'

// Constants
const LOCATIONS: Record<Location, string> = {
  all: 'All Locations',
  main: 'Main Restaurant',
  coffee: 'Coffee Shop',
  bar: 'Bar & Lounge'
} as const

const DATE_RANGES: Record<DateRange, string> = {
  today: 'Today',
  week: 'This Week',
  mtd: 'Month to Date',
  ytd: 'Year to Date'
} as const

// Mock data with proper typing
const CONSUMPTION_DATA: ConsumptionData[] = [
  { day: '01', theoretical: 4200, actual: 4500 },
  { day: '02', theoretical: 4000, actual: 4100 },
  { day: '03', theoretical: 4100, actual: 4300 },
  { day: '04', theoretical: 3900, actual: 4000 },
  { day: '05', theoretical: 4300, actual: 4600 },
  { day: '06', theoretical: 4500, actual: 4800 },
  { day: '07', theoretical: 3800, actual: 3900 },
  { day: '08', theoretical: 4200, actual: 4400 },
  { day: '09', theoretical: 4100, actual: 4300 },
  { day: '10', theoretical: 4000, actual: 4200 }
]

const CATEGORY_DATA: CategoryData[] = [
  { name: 'Meat', value: 35, color: '#4f46e5' },
  { name: 'Produce', value: 25, color: '#10b981' },
  { name: 'Dairy', value: 15, color: '#f59e0b' },
  { name: 'Grains', value: 10, color: '#ef4444' },
  { name: 'Beverages', value: 15, color: '#8b5cf6' }
]

const TOP_WASTE_ITEMS: WasteItem[] = [
  { name: 'Fresh vegetables', actual: 120, theoretical: 100, variance: 20, percent: 20 },
  { name: 'Chicken breast', actual: 85, theoretical: 75, variance: 10, percent: 13.3 },
  { name: 'Fresh fruits', actual: 75, theoretical: 68, variance: 7, percent: 10.3 },
  { name: 'Ground beef', actual: 65, theoretical: 60, variance: 5, percent: 8.3 },
  { name: 'Milk', actual: 40, theoretical: 38, variance: 2, percent: 5.3 }
]

// Helper functions
function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value)
}

function calculatePercentage(value: number, total: number): string {
  return ((value / total) * 100).toFixed(1)
}

// Components
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelProps) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180)
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180)

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function ConsumptionReportPage() {
  const [dateRange, setDateRange] = useState<DateRange>('mtd')
  const [location, setLocation] = useState<Location>('all')
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')

  // Handler functions with proper typing
  const handleLocationChange = (value: string) => {
    setLocation(value as Location)
  }

  const handleDateRangeChange = (value: string) => {
    setDateRange(value as DateRange)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as ActiveTab)
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
            <Link href="/system-administration/system-integrations/pos/reports">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Reports</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Consumption Report</h1>
            <p className="text-muted-foreground">Analyze actual vs. theoretical usage</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Select value={location} onValueChange={handleLocationChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LOCATIONS).map(([value, label]) => (
                <SelectItem key={value} value={value as Location}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DATE_RANGES).map(([value, label]) => (
                <SelectItem key={value} value={value as DateRange}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            More Filters
          </Button>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Theoretical Usage</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold">$42,590</p>
                <Badge variant="outline">Base</Badge>
              </div>
              <Progress value={100} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Actual Usage</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold">$45,100</p>
                <Badge variant="outline" className="text-amber-600">+5.9%</Badge>
              </div>
              <Progress value={105.9} className="h-1 bg-muted" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Variance Amount</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold">$2,510</p>
                <Badge variant="outline" className="text-red-600">Loss</Badge>
              </div>
              <p className="text-xs text-muted-foreground">5.9% of theoretical usage</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Target Variance</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold">3.0%</p>
                <Badge variant="outline" className="text-red-600">+2.9%</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={3} max={10} className="h-1 flex-1" />
                <Progress value={5.9} max={10} className="h-1 w-8 bg-red-200" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="byCategory">By Category</TabsTrigger>
          <TabsTrigger value="byItem">By Item</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          {/* Overview Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={CATEGORY_DATA}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {CATEGORY_DATA.map((entry: CategoryData, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="byItem">
          {/* By Item Tab Content */}
          <Card>
            <CardHeader>
              <CardTitle>Top Waste Items</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Item</th>
                    <th className="text-right p-4">Actual</th>
                    <th className="text-right p-4">Theoretical</th>
                    <th className="text-right p-4">Variance</th>
                    <th className="text-right p-4">%</th>
                  </tr>
                </thead>
                <tbody>
                  {TOP_WASTE_ITEMS.map((item: WasteItem, index: number) => (
                    <tr key={index} className="border-b">
                      <td className="p-4">{item.name}</td>
                      <td className="text-right p-4">{formatNumber(item.actual)}</td>
                      <td className="text-right p-4">{formatNumber(item.theoretical)}</td>
                      <td className="text-right p-4">{formatNumber(item.variance)}</td>
                      <td className="text-right p-4">{item.percent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}