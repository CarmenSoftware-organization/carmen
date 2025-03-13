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

// Define proper types for the PieChart label function
interface PieLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
}

export default function ConsumptionReportPage() {
  const [dateRange, setDateRange] = useState('mtd')
  const [location, setLocation] = useState('all')
  const [activeTab, setActiveTab] = useState('overview')

  // Sample data
  const consumptionData = [
    { day: '01', theoretical: 4200, actual: 4500 },
    { day: '02', theoretical: 4000, actual: 4100 },
    { day: '03', theoretical: 4100, actual: 4300 },
    { day: '04', theoretical: 3900, actual: 4000 },
    { day: '05', theoretical: 4300, actual: 4600 },
    { day: '06', theoretical: 4500, actual: 4800 },
    { day: '07', theoretical: 3800, actual: 3900 },
    { day: '08', theoretical: 4200, actual: 4400 },
    { day: '09', theoretical: 4100, actual: 4300 },
    { day: '10', theoretical: 4000, actual: 4200 },
  ]

  const categoryData = [
    { name: 'Meat', value: 35, color: '#4f46e5' },
    { name: 'Produce', value: 25, color: '#10b981' },
    { name: 'Dairy', value: 15, color: '#f59e0b' },
    { name: 'Grains', value: 10, color: '#ef4444' },
    { name: 'Beverages', value: 15, color: '#8b5cf6' },
  ]

  const topWasteItems = [
    { name: 'Fresh vegetables', actual: 120, theoretical: 100, variance: 20, percent: 20 },
    { name: 'Chicken breast', actual: 85, theoretical: 75, variance: 10, percent: 13.3 },
    { name: 'Fresh fruits', actual: 75, theoretical: 68, variance: 7, percent: 10.3 },
    { name: 'Ground beef', actual: 65, theoretical: 60, variance: 5, percent: 8.3 },
    { name: 'Milk', actual: 40, theoretical: 38, variance: 2, percent: 5.3 },
  ]

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: PieLabelProps) => {
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
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="main">Main Restaurant</SelectItem>
              <SelectItem value="coffee">Coffee Shop</SelectItem>
              <SelectItem value="bar">Bar & Lounge</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="mtd">Month to Date</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
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
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="byCategory">By Category</TabsTrigger>
          <TabsTrigger value="byItem">By Item</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Consumption Trend</CardTitle>
              <CardDescription>Comparing actual vs. theoretical usage over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={consumptionData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, undefined]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="theoretical" 
                      name="Theoretical" 
                      stroke="#4f46e5" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      name="Actual" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* By Category Tab */}
        <TabsContent value="byCategory" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Usage by Category</CardTitle>
                <CardDescription>Consumption breakdown by ingredient category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={130}
                        innerRadius={50}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Category Variance Analysis</CardTitle>
                <CardDescription>Showing which categories exceed theoretical usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Meat', variance: 7.2 },
                        { name: 'Produce', variance: 12.5 },
                        { name: 'Dairy', variance: 3.1 },
                        { name: 'Grains', variance: -1.8 },
                        { name: 'Beverages', variance: 4.5 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: 'Variance %', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Variance']} />
                      <Bar
                        dataKey="variance"
                        name="Variance %"
                        fill="#ef4444" // Default fill color
                      >
                        {[
                          { name: 'Meat', variance: 7.2 },
                          { name: 'Produce', variance: 12.5 },
                          { name: 'Dairy', variance: 3.1 },
                          { name: 'Grains', variance: -1.8 },
                          { name: 'Beverages', variance: 4.5 },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.variance > 0 ? '#ef4444' : '#10b981'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* By Item Tab */}
        <TabsContent value="byItem" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Items with Highest Waste</CardTitle>
              <CardDescription>Items with largest variance between actual and theoretical usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-4 text-left font-medium">Item Name</th>
                      <th className="p-4 text-right font-medium">Theoretical</th>
                      <th className="p-4 text-right font-medium">Actual</th>
                      <th className="p-4 text-right font-medium">Variance</th>
                      <th className="p-4 text-right font-medium">Variance %</th>
                      <th className="p-4 text-right font-medium">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topWasteItems.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-4">{item.name}</td>
                        <td className="p-4 text-right">${item.theoretical.toFixed(2)}</td>
                        <td className="p-4 text-right">${item.actual.toFixed(2)}</td>
                        <td className="p-4 text-right">${item.variance.toFixed(2)}</td>
                        <td className="p-4 text-right text-red-600">+{item.percent.toFixed(1)}%</td>
                        <td className="p-4 text-right">
                          <div className="inline-flex items-center space-x-1">
                            <BarChart2 className="h-4 w-4 text-red-500" />
                            <span className="text-xs text-muted-foreground">Increasing</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Recommendations</h3>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700">High Priority</Badge>
                    <span>Review vegetable storage and preparation processes to reduce waste</span>
                  </li>
                  <li className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700">High Priority</Badge>
                    <span>Adjust chicken breast portions to match recipe specifications</span>
                  </li>
                  <li className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">Medium Priority</Badge>
                    <span>Improve fruit inventory rotation and quality control</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 