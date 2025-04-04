"use client"

import Link from 'next/link'
import { ArrowLeft, ArrowRight, BarChart, FileBarChart2, PieChart, GanttChart, RefreshCcw } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export default function ReportsIndexPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
            <Link href="/system-administration/system-integrations/pos">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to POS Integration</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">POS Reports</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Select defaultValue="this-month">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="last-week">Last Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <RefreshCcw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground">Access reports and analytics for POS integration data</p>
      
      {/* Featured Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="pb-2 bg-slate-50">
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              <span>Gross Profit Analysis</span>
            </CardTitle>
            <CardDescription>
              Performance overview and profit margin analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Total Sales</p>
                  <p className="text-2xl font-bold">$310,000</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-right">Margin</p>
                  <p className="text-2xl font-bold text-right text-green-600">65.5%</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="relative h-20">
                <div className="absolute inset-0 flex items-center">
                  <div className="h-4 w-full bg-muted rounded overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: '65.5%' }}
                    ></div>
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>Target: 60%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-3 flex justify-end">
            <Button asChild size="sm">
              <Link href="/system-administration/system-integrations/pos/reports/gross-profit">
                View Report
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="pb-2 bg-slate-50">
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              <span>Consumption Report</span>
            </CardTitle>
            <CardDescription>
              Actual vs. theoretical usage analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Theoretical</p>
                  <p className="text-xl font-bold">$42,590</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-center">Actual</p>
                  <p className="text-xl font-bold text-center">$45,100</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-right">Variance</p>
                  <p className="text-xl font-bold text-right text-red-600">+5.9%</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Top Issue:</p>
                  <p className="font-medium">Fresh Vegetables (+20%)</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Status:</p>
                  <p className="font-medium text-amber-600">Above Target</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-3 flex justify-end">
            <Button asChild size="sm">
              <Link href="/system-administration/system-integrations/pos/reports/consumption">
                View Report
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* All Reports Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Reports</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center gap-2">
                <BarChart className="h-4 w-4 text-primary" />
                Gross Profit
              </CardTitle>
            </CardHeader>
            <CardFooter className="pt-0 pb-3">
              <Button asChild variant="ghost" size="sm" className="w-full justify-between">
                <Link href="/system-administration/system-integrations/pos/reports/gross-profit">
                  <span>View</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center gap-2">
                <PieChart className="h-4 w-4 text-primary" />
                Consumption
              </CardTitle>
            </CardHeader>
            <CardFooter className="pt-0 pb-3">
              <Button asChild variant="ghost" size="sm" className="w-full justify-between">
                <Link href="/system-administration/system-integrations/pos/reports/consumption">
                  <span>View</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center gap-2">
                <FileBarChart2 className="h-4 w-4 text-primary" />
                Sales Analysis
              </CardTitle>
            </CardHeader>
            <CardFooter className="pt-0 pb-3">
              <Button asChild variant="ghost" size="sm" className="w-full justify-between">
                <Link href="/system-administration/system-integrations/pos/reports/sales">
                  <span>View</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center gap-2">
                <GanttChart className="h-4 w-4 text-primary" />
                Inventory Trend
              </CardTitle>
            </CardHeader>
            <CardFooter className="pt-0 pb-3">
              <Button asChild variant="ghost" size="sm" className="w-full justify-between">
                <Link href="/system-administration/system-integrations/pos/reports/inventory">
                  <span>View</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
} 