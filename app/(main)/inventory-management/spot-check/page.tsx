"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/context/simple-user-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  List,
  LayoutGrid,
  ArrowUpDown,
  FileDown,
  Filter,
  MoreHorizontal,
  ClipboardCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Pause,
  Play,
  Eye,
  Trash2,
  Calendar,
  MapPin,
  User,
  BarChart3,
  Package,
  TrendingUp,
  RefreshCw
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import {
  SpotCheck,
  SpotCheckStatus,
  SpotCheckType,
  SpotCheckSummary
} from "./types"
import {
  mockSpotChecks,
  getSpotCheckSummary,
  getSpotCheckDashboardStats
} from "@/lib/mock-data/spot-checks"

// Status badge configuration
const statusConfig: Record<SpotCheckStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  "draft": { label: "Draft", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
  "pending": { label: "Pending", variant: "outline", icon: <Clock className="h-3 w-3" /> },
  "in-progress": { label: "In Progress", variant: "default", icon: <Play className="h-3 w-3" /> },
  "completed": { label: "Completed", variant: "secondary", icon: <CheckCircle2 className="h-3 w-3" /> },
  "cancelled": { label: "Cancelled", variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
  "on-hold": { label: "On Hold", variant: "outline", icon: <Pause className="h-3 w-3" /> }
}

// Type badge configuration
const typeConfig: Record<SpotCheckType, { label: string; color: string }> = {
  "random": { label: "Random", color: "bg-blue-100 text-blue-800" },
  "targeted": { label: "Targeted", color: "bg-purple-100 text-purple-800" },
  "high-value": { label: "High Value", color: "bg-amber-100 text-amber-800" },
  "variance-based": { label: "Variance", color: "bg-orange-100 text-orange-800" },
  "cycle-count": { label: "Cycle Count", color: "bg-green-100 text-green-800" }
}

// Priority badge configuration
const priorityConfig: Record<string, { label: string; color: string }> = {
  "low": { label: "Low", color: "bg-slate-100 text-slate-600" },
  "medium": { label: "Medium", color: "bg-blue-100 text-blue-700" },
  "high": { label: "High", color: "bg-orange-100 text-orange-700" },
  "critical": { label: "Critical", color: "bg-red-100 text-red-700" }
}

// Summary card component
function SummaryCard({
  title,
  value,
  icon,
  description,
  trend
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
  trend?: { value: number; isPositive: boolean }
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              {description && (
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              )}
            </div>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`h-3 w-3 ${!trend.isPositive && 'rotate-180'}`} />
              {trend.value}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Spot check row component
function SpotCheckRow({
  check,
  onView,
  onStart,
  onDelete
}: {
  check: SpotCheck
  onView: () => void
  onStart: () => void
  onDelete: () => void
}) {
  const status = statusConfig[check.status]
  const type = typeConfig[check.checkType]
  const priority = priorityConfig[check.priority]
  const progress = check.totalItems > 0 ? (check.countedItems / check.totalItems) * 100 : 0

  return (
    <TableRow className="cursor-pointer hover:bg-muted/50" onClick={onView}>
      <TableCell>
        <div className="flex flex-col gap-1">
          <span className="font-medium">{check.checkNumber}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${type.color}`}>
            {type.label}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{check.locationName}</p>
            <p className="text-xs text-muted-foreground">{check.departmentName}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{check.assignedToName}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={status.variant} className="gap-1">
          {status.icon}
          {status.label}
        </Badge>
      </TableCell>
      <TableCell>
        <span className={`text-xs px-2 py-1 rounded-full ${priority.color}`}>
          {priority.label}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span>{check.countedItems}/{check.totalItems} items</span>
            <span className="text-muted-foreground">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          {check.status === 'completed' && check.accuracy !== undefined ? (
            <span className={check.accuracy >= 95 ? 'text-green-600' : check.accuracy >= 90 ? 'text-amber-600' : 'text-red-600'}>
              {check.accuracy.toFixed(1)}%
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm">{format(check.scheduledDate, "MMM d, yyyy")}</span>
          {check.dueDate && (
            <span className="text-xs text-muted-foreground">
              Due: {format(check.dueDate, "MMM d")}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            {(check.status === 'pending' || check.status === 'draft') && (
              <DropdownMenuItem onClick={onStart}>
                <Play className="h-4 w-4 mr-2" />
                Start Count
              </DropdownMenuItem>
            )}
            {check.status === 'in-progress' && (
              <DropdownMenuItem onClick={onStart}>
                <Play className="h-4 w-4 mr-2" />
                Continue Count
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

// Spot check card component for grid view
function SpotCheckCard({
  check,
  onView,
  onStart,
  onDelete
}: {
  check: SpotCheck
  onView: () => void
  onStart: () => void
  onDelete: () => void
}) {
  const status = statusConfig[check.status]
  const type = typeConfig[check.checkType]
  const priority = priorityConfig[check.priority]
  const progress = check.totalItems > 0 ? (check.countedItems / check.totalItems) * 100 : 0

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onView}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold">{check.checkNumber}</CardTitle>
            <CardDescription className="mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${type.color}`}>
                {type.label}
              </span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={status.variant} className="gap-1">
              {status.icon}
              {status.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{check.locationName}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{check.departmentName}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{check.assignedToName}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{check.countedItems}/{check.totalItems} items</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {format(check.scheduledDate, "MMM d, yyyy")}
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${priority.color}`}>
            {priority.label}
          </span>
        </div>

        <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" size="sm" className="flex-1" onClick={onView}>
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          {(check.status === 'pending' || check.status === 'draft' || check.status === 'in-progress') && (
            <Button size="sm" className="flex-1" onClick={onStart}>
              <Play className="h-3 w-3 mr-1" />
              {check.status === 'in-progress' ? 'Continue' : 'Start'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SpotCheckPage() {
  const router = useRouter()
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [spotChecks, setSpotChecks] = useState<SpotCheck[]>([])
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">("all")

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<SpotCheckStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<SpotCheckType | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [locationFilter, setLocationFilter] = useState<string>("all")

  // Sort
  const [sortField, setSortField] = useState<keyof SpotCheck>("scheduledDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Load data
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setSpotChecks(mockSpotChecks)
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Get summary and stats
  const summary = useMemo(() => getSpotCheckSummary(spotChecks), [spotChecks])
  const stats = useMemo(() => getSpotCheckDashboardStats(), [])

  // Get unique locations for filter
  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(spotChecks.map(c => c.locationName))]
    return uniqueLocations.sort()
  }, [spotChecks])

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = [...spotChecks]

    // Apply tab filter
    if (activeTab === "active") {
      result = result.filter(c => c.status === "pending" || c.status === "in-progress")
    } else if (activeTab === "completed") {
      result = result.filter(c => c.status === "completed")
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(c =>
        c.checkNumber.toLowerCase().includes(term) ||
        c.locationName.toLowerCase().includes(term) ||
        c.assignedToName.toLowerCase().includes(term) ||
        c.reason.toLowerCase().includes(term)
      )
    }

    // Apply filters
    if (statusFilter !== "all") {
      result = result.filter(c => c.status === statusFilter)
    }
    if (typeFilter !== "all") {
      result = result.filter(c => c.checkType === typeFilter)
    }
    if (priorityFilter !== "all") {
      result = result.filter(c => c.priority === priorityFilter)
    }
    if (locationFilter !== "all") {
      result = result.filter(c => c.locationName === locationFilter)
    }

    // Apply sort
    result.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === "asc"
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime()
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      return 0
    })

    return result
  }, [spotChecks, activeTab, searchTerm, statusFilter, typeFilter, priorityFilter, locationFilter, sortField, sortDirection])

  // Handlers
  const handleNewSpotCheck = () => {
    router.push("/inventory-management/spot-check/new")
  }

  const handleViewSpotCheck = (id: string) => {
    router.push(`/inventory-management/spot-check/${id}`)
  }

  const handleStartSpotCheck = (id: string) => {
    router.push(`/inventory-management/spot-check/${id}/count`)
  }

  const handleDeleteSpotCheck = (id: string) => {
    setSpotChecks(prev => prev.filter(c => c.id !== id))
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setSpotChecks(mockSpotChecks)
      setIsLoading(false)
    }, 500)
  }

  const toggleSort = (field: keyof SpotCheck) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Spot Check</h1>
            <p className="text-muted-foreground">Random inventory spot checks for accuracy verification</p>
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Spot Check</h1>
          <p className="text-muted-foreground">Random inventory spot checks for accuracy verification</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-1" />
            Export
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Spot Check
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleNewSpotCheck}>
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Random Spot Check
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleNewSpotCheck}>
                <Package className="h-4 w-4 mr-2" />
                High-Value Items
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleNewSpotCheck}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Variance Investigation
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleNewSpotCheck}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Cycle Count
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Active Checks"
          value={stats.activeChecks}
          icon={<ClipboardCheck className="h-5 w-5 text-blue-600" />}
          description={`${summary.pending} pending, ${summary.inProgress} in progress`}
        />
        <SummaryCard
          title="Completed Today"
          value={stats.completedToday}
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          description={`${summary.completed} total completed`}
        />
        <SummaryCard
          title="Average Accuracy"
          value={`${stats.averageAccuracy}%`}
          icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
          description={`${stats.itemsCounted} items counted`}
        />
        <SummaryCard
          title="Variance Value"
          value={`$${stats.totalVarianceValue.toLocaleString()}`}
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
          description={`${stats.varianceItemsCount} items with variance`}
        />
      </div>

      {/* Tabs and Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList>
                <TabsTrigger value="all">
                  All ({summary.total})
                </TabsTrigger>
                <TabsTrigger value="active">
                  Active ({summary.pending + summary.inProgress})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({summary.completed})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search spot checks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="random">Random</SelectItem>
                <SelectItem value="targeted">Targeted</SelectItem>
                <SelectItem value="high-value">High Value</SelectItem>
                <SelectItem value="variance-based">Variance</SelectItem>
                <SelectItem value="cycle-count">Cycle Count</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(loc => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {filteredData.length} of {spotChecks.length} spot checks</span>
          </div>

          {/* Data display */}
          {viewMode === "list" ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">
                      <Button variant="ghost" size="sm" className="h-8 -ml-3" onClick={() => toggleSort("checkNumber")}>
                        Check #
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      </Button>
                    </TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="w-[140px]">Progress</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" className="h-8 -ml-3" onClick={() => toggleSort("scheduledDate")}>
                        Schedule
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <ClipboardCheck className="h-8 w-8" />
                          <p>No spot checks found</p>
                          <Button variant="outline" size="sm" onClick={handleNewSpotCheck}>
                            Create New Spot Check
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((check) => (
                      <SpotCheckRow
                        key={check.id}
                        check={check}
                        onView={() => handleViewSpotCheck(check.id)}
                        onStart={() => handleStartSpotCheck(check.id)}
                        onDelete={() => handleDeleteSpotCheck(check.id)}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredData.length === 0 ? (
                <div className="col-span-full flex flex-col items-center gap-2 py-12 text-muted-foreground">
                  <ClipboardCheck className="h-8 w-8" />
                  <p>No spot checks found</p>
                  <Button variant="outline" size="sm" onClick={handleNewSpotCheck}>
                    Create New Spot Check
                  </Button>
                </div>
              ) : (
                filteredData.map((check) => (
                  <SpotCheckCard
                    key={check.id}
                    check={check}
                    onView={() => handleViewSpotCheck(check.id)}
                    onStart={() => handleStartSpotCheck(check.id)}
                    onDelete={() => handleDeleteSpotCheck(check.id)}
                  />
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
