"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format, subDays } from "date-fns"
import {
  ClipboardCheck,
  Plus,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
  RefreshCw,
  Calendar,
  BarChart3,
  AlertCircle,
  FileText,
  Play,
  ChevronRight,
  Download,
  Users,
  Boxes,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  mockSpotChecks,
  getSpotCheckDashboardStats,
  getActiveSpotChecks,
  getOverdueSpotChecks
} from "@/lib/mock-data/spot-checks"
import type { SpotCheck, SpotCheckStatus, SpotCheckType } from "../types"

// Configuration
const statusConfig: Record<SpotCheckStatus, { label: string; color: string }> = {
  'draft': { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  'pending': { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  'completed': { label: 'Completed', color: 'bg-green-100 text-green-700' },
  'cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  'on-hold': { label: 'On Hold', color: 'bg-orange-100 text-orange-700' }
}

const typeConfig: Record<SpotCheckType, { label: string; color: string }> = {
  'random': { label: 'Random', color: 'bg-purple-100 text-purple-700' },
  'targeted': { label: 'Targeted', color: 'bg-blue-100 text-blue-700' },
  'high-value': { label: 'High Value', color: 'bg-amber-100 text-amber-700' },
  'variance-based': { label: 'Variance Based', color: 'bg-red-100 text-red-700' },
  'cycle-count': { label: 'Cycle Count', color: 'bg-green-100 text-green-700' }
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  'low': { label: 'Low', color: 'bg-gray-100 text-gray-700' },
  'medium': { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  'high': { label: 'High', color: 'bg-orange-100 text-orange-700' },
  'critical': { label: 'Critical', color: 'bg-red-100 text-red-700' }
}

export default function SpotCheckDashboardPage() {
  const router = useRouter()
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  // Dashboard stats
  const stats = useMemo(() => getSpotCheckDashboardStats(), [])
  const activeChecks = useMemo(() => getActiveSpotChecks(), [])
  const overdueChecks = useMemo(() => getOverdueSpotChecks(), [])

  // Recent completed checks
  const recentCompleted = useMemo(() => {
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90
    const startDate = subDays(new Date(), days)

    return mockSpotChecks
      .filter(check =>
        check.status === 'completed' &&
        check.completedAt &&
        new Date(check.completedAt) >= startDate
      )
      .sort((a, b) =>
        new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
      )
      .slice(0, 10)
  }, [dateRange])

  // Stats by location
  const locationStats = useMemo(() => {
    const locationMap = new Map<string, { total: number; completed: number; variance: number }>()

    mockSpotChecks.forEach(check => {
      const current = locationMap.get(check.locationName) || { total: 0, completed: 0, variance: 0 }
      current.total++
      if (check.status === 'completed') {
        current.completed++
        current.variance += check.varianceValue
      }
      locationMap.set(check.locationName, current)
    })

    return Array.from(locationMap.entries())
      .map(([location, data]) => ({
        location,
        ...data,
        completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total)
  }, [])

  // Stats by type
  const typeStats = useMemo(() => {
    const typeMap = new Map<SpotCheckType, { count: number; completed: number }>()

    const types: SpotCheckType[] = ['random', 'targeted', 'high-value', 'variance-based', 'cycle-count']
    types.forEach(type => typeMap.set(type, { count: 0, completed: 0 }))

    mockSpotChecks.forEach(check => {
      const current = typeMap.get(check.checkType)!
      current.count++
      if (check.status === 'completed') current.completed++
    })

    return Array.from(typeMap.entries()).map(([type, data]) => ({
      type,
      ...typeConfig[type],
      ...data
    }))
  }, [])

  // Upcoming checks
  const upcomingChecks = useMemo(() => {
    return mockSpotChecks
      .filter(check =>
        (check.status === 'pending' || check.status === 'draft') &&
        new Date(check.scheduledDate) >= new Date()
      )
      .sort((a, b) =>
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      )
      .slice(0, 5)
  }, [])

  // Handlers
  const handleViewCheck = (id: string) => {
    router.push(`/inventory-management/spot-check/${id}`)
  }

  const handleStartCheck = (id: string) => {
    router.push(`/inventory-management/spot-check/${id}/count`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Spot Check Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of inventory spot check activities and performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button asChild>
            <Link href="/inventory-management/spot-check/new">
              <Plus className="h-4 w-4 mr-2" />
              New Spot Check
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Checks</p>
                <p className="text-3xl font-bold">{stats.totalChecks}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.activeChecks} active
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <ClipboardCheck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Accuracy</p>
                <p className="text-3xl font-bold">{stats.averageAccuracy}%</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +2.3% from last period
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Items Counted</p>
                <p className="text-3xl font-bold">{stats.itemsCounted}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.varianceItemsCount} with variance
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Variance</p>
                <p className="text-3xl font-bold text-red-600">
                  ${stats.totalVarianceValue.toLocaleString()}
                </p>
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  Requires attention
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Active & Overdue */}
        <div className="col-span-2 space-y-6">
          {/* Overdue Alert */}
          {overdueChecks.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <CardTitle className="text-red-900">Overdue Checks</CardTitle>
                  </div>
                  <Badge variant="destructive">{overdueChecks.length} overdue</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overdueChecks.slice(0, 3).map((check) => (
                    <div
                      key={check.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">{check.checkNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {check.locationName} • Due {check.dueDate && format(new Date(check.dueDate), "MMM d")}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="destructive" onClick={() => handleStartCheck(check.id)}>
                        Start Now
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Checks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Spot Checks</CardTitle>
                  <CardDescription>Currently in-progress or pending checks</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/inventory-management/spot-check?status=in-progress">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {activeChecks.length > 0 ? (
                <ScrollArea className="h-[320px] pr-4">
                  <div className="space-y-4">
                    {activeChecks.map((check) => {
                      const progress = check.totalItems > 0
                        ? (check.countedItems / check.totalItems) * 100
                        : 0

                      return (
                        <div
                          key={check.id}
                          className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => handleViewCheck(check.id)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{check.checkNumber}</h4>
                                <Badge className={statusConfig[check.status].color}>
                                  {statusConfig[check.status].label}
                                </Badge>
                                <Badge className={priorityConfig[check.priority].color}>
                                  {priorityConfig[check.priority].label}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {check.locationName} • {check.assignedToName}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant={check.status === 'in-progress' ? 'default' : 'outline'}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStartCheck(check.id)
                              }}
                            >
                              {check.status === 'in-progress' ? (
                                <>
                                  <Play className="h-4 w-4 mr-1" />
                                  Continue
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-1" />
                                  Start
                                </>
                              )}
                            </Button>
                          </div>

                          {check.status === 'in-progress' && (
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Progress</span>
                                <span>{check.countedItems} / {check.totalItems} items</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                  <p className="font-medium">No Active Checks</p>
                  <p className="text-sm text-muted-foreground">
                    All spot checks are up to date
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Completed */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recently Completed</CardTitle>
                  <CardDescription>Spot checks completed in the selected period</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/inventory-management/spot-check?status=completed">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentCompleted.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Check</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Accuracy</TableHead>
                      <TableHead>Variance</TableHead>
                      <TableHead>Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentCompleted.map((check) => (
                      <TableRow
                        key={check.id}
                        className="cursor-pointer"
                        onClick={() => handleViewCheck(check.id)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{check.checkNumber}</p>
                            <Badge className={typeConfig[check.checkType].color} variant="outline">
                              {typeConfig[check.checkType].label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{check.locationName}</TableCell>
                        <TableCell>{check.countedItems}</TableCell>
                        <TableCell>
                          <span className={check.accuracy >= 90 ? 'text-green-600' : 'text-amber-600'}>
                            {check.accuracy}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={check.varianceValue > 0 ? 'text-red-600' : ''}>
                            ${check.varianceValue.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {check.completedAt && format(new Date(check.completedAt), "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="font-medium">No Completed Checks</p>
                  <p className="text-sm text-muted-foreground">
                    No spot checks completed in this period
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/inventory-management/spot-check/new?type=random">
                  <Target className="h-4 w-4 mr-2" />
                  Create Random Check
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/inventory-management/spot-check/new?type=high-value">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  High Value Check
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/inventory-management/spot-check/new?type=variance-based">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Variance Investigation
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/inventory-management/spot-check">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View All Checks
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Checks */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Checks</CardTitle>
              <CardDescription>Scheduled for the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingChecks.length > 0 ? (
                <div className="space-y-3">
                  {upcomingChecks.map((check) => (
                    <div
                      key={check.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleViewCheck(check.id)}
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{check.checkNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(check.scheduledDate), "MMM d, h:mm a")}
                        </p>
                      </div>
                      <Badge className={priorityConfig[check.priority].color}>
                        {priorityConfig[check.priority].label}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No upcoming checks</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* By Check Type */}
          <Card>
            <CardHeader>
              <CardTitle>By Check Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {typeStats.map((stat) => (
                  <div key={stat.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={stat.color} variant="outline">
                        {stat.label}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{stat.count}</span>
                      <span className="text-sm text-muted-foreground ml-1">
                        ({stat.completed} done)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* By Location */}
          <Card>
            <CardHeader>
              <CardTitle>By Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {locationStats.slice(0, 5).map((stat) => (
                  <div key={stat.location}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{stat.location}</span>
                      <span className="text-sm text-muted-foreground">
                        {stat.completed}/{stat.total}
                      </span>
                    </div>
                    <Progress value={stat.completionRate} className="h-2" />
                    {stat.variance > 0 && (
                      <p className="text-xs text-red-600 mt-1">
                        ${stat.variance.toFixed(0)} variance
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
