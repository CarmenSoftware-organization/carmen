"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Download, Share2, RefreshCcw, TrendingUp, TrendingDown,ChevronLeft } from 'lucide-react'

export default function GrossProfitDashboard() {
  const [dateRange, setDateRange] = useState('today')
  const [viewType, setViewType] = useState('outlet')

  // Sample data
  const performanceData = [
    { period: 'Jan', sales: 100000, cost: 35000, margin: 65 },
    { period: 'Feb', sales: 120000, cost: 40000, margin: 66.7 },
    { period: 'Mar', sales: 90000, cost: 32000, margin: 64.4 },
    { period: 'Apr', sales: 105000, cost: 36000, margin: 65.7 },
    { period: 'May', sales: 110000, cost: 37500, margin: 65.9 },
    { period: 'Jun', sales: 95000, cost: 33000, margin: 65.3 },
  ]

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
            <Link href="/system-administration/system-integrations/pos/reports">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back to Reports</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Gross Profit Analysis</h1>
            <p className="text-muted-foreground">Performance Overview</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="mtd">Month to Date</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sales Revenue</p>
                <p className="text-2xl font-bold">$310,000</p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              +5.2% vs last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cost of Sales</p>
                <p className="text-2xl font-bold">$107,000</p>
              </div>
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
            <div className="mt-2 flex items-center text-sm text-red-600">
              +2.1% vs target
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gross Profit</p>
                <p className="text-2xl font-bold">$203,000</p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              +6.8% vs target
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Margin %</p>
                <p className="text-2xl font-bold">65.5%</p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              +1.2% vs target
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="sales" name="Sales" fill="#4f46e5" />
                <Bar yAxisId="left" dataKey="cost" name="Cost" fill="#818cf8" />
                <Line yAxisId="right" dataKey="margin" name="Margin %" stroke="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detailed Analysis</CardTitle>
            <Select value={viewType} onValueChange={setViewType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="outlet">By Outlet</SelectItem>
                <SelectItem value="category">By Category</SelectItem>
                <SelectItem value="item">By Item</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4 text-left font-medium">Name</th>
                  <th className="p-4 text-right font-medium">Sales</th>
                  <th className="p-4 text-right font-medium">Cost</th>
                  <th className="p-4 text-right font-medium">Gross Profit</th>
                  <th className="p-4 text-right font-medium">Margin %</th>
                  <th className="p-4 text-right font-medium">vs Target</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4">Main Restaurant</td>
                  <td className="p-4 text-right">$120,000</td>
                  <td className="p-4 text-right">$42,000</td>
                  <td className="p-4 text-right">$78,000</td>
                  <td className="p-4 text-right">65.0%</td>
                  <td className="p-4 text-right text-green-600">+2.1%</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Coffee Shop</td>
                  <td className="p-4 text-right">$95,000</td>
                  <td className="p-4 text-right">$32,000</td>
                  <td className="p-4 text-right">$63,000</td>
                  <td className="p-4 text-right">66.3%</td>
                  <td className="p-4 text-right text-green-600">+3.4%</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Bar & Lounge</td>
                  <td className="p-4 text-right">$85,000</td>
                  <td className="p-4 text-right">$29,000</td>
                  <td className="p-4 text-right">$56,000</td>
                  <td className="p-4 text-right">65.9%</td>
                  <td className="p-4 text-right text-green-600">+3.0%</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Poolside Café</td>
                  <td className="p-4 text-right">$10,000</td>
                  <td className="p-4 text-right">$4,000</td>
                  <td className="p-4 text-right">$6,000</td>
                  <td className="p-4 text-right">60.0%</td>
                  <td className="p-4 text-right text-red-600">-2.9%</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-muted/70 font-medium">
                  <td className="p-4">Total</td>
                  <td className="p-4 text-right">$310,000</td>
                  <td className="p-4 text-right">$107,000</td>
                  <td className="p-4 text-right">$203,000</td>
                  <td className="p-4 text-right">65.5%</td>
                  <td className="p-4 text-right text-green-600">+1.2%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 