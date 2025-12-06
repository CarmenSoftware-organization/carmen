"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"
import {
  ArrowLeft,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  User,
  Calendar,
  FileText,
  AlertTriangle,
  Package,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Printer,
  Download,
  RefreshCw,
  Eye,
  ClipboardCheck,
  Target,
  BarChart3,
  AlertCircle,
  CheckCheck,
  Ban
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { getSpotCheckById } from "@/lib/mock-data/spot-checks"
import type {
  SpotCheck,
  SpotCheckItem,
  SpotCheckStatus,
  SpotCheckType,
  ItemCheckStatus,
  ItemCondition
} from "../types"

// Status configuration
const statusConfig: Record<SpotCheckStatus, { label: string; color: string; icon: React.ReactNode }> = {
  'draft': { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: <FileText className="h-4 w-4" /> },
  'pending': { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: <Clock className="h-4 w-4" /> },
  'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: <RefreshCw className="h-4 w-4" /> },
  'completed': { label: 'Completed', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="h-4 w-4" /> },
  'cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: <XCircle className="h-4 w-4" /> },
  'on-hold': { label: 'On Hold', color: 'bg-orange-100 text-orange-700', icon: <Pause className="h-4 w-4" /> }
}

const typeConfig: Record<SpotCheckType, { label: string; color: string; icon: React.ReactNode }> = {
  'random': { label: 'Random', color: 'bg-purple-100 text-purple-700', icon: <Target className="h-4 w-4" /> },
  'targeted': { label: 'Targeted', color: 'bg-blue-100 text-blue-700', icon: <Target className="h-4 w-4" /> },
  'high-value': { label: 'High Value', color: 'bg-amber-100 text-amber-700', icon: <TrendingUp className="h-4 w-4" /> },
  'variance-based': { label: 'Variance Based', color: 'bg-red-100 text-red-700', icon: <BarChart3 className="h-4 w-4" /> },
  'cycle-count': { label: 'Cycle Count', color: 'bg-green-100 text-green-700', icon: <RefreshCw className="h-4 w-4" /> }
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  'low': { label: 'Low', color: 'bg-gray-100 text-gray-700' },
  'medium': { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  'high': { label: 'High', color: 'bg-orange-100 text-orange-700' },
  'critical': { label: 'Critical', color: 'bg-red-100 text-red-700' }
}

const itemStatusConfig: Record<ItemCheckStatus, { label: string; color: string }> = {
  'pending': { label: 'Pending', color: 'bg-gray-100 text-gray-700' },
  'counted': { label: 'Counted', color: 'bg-green-100 text-green-700' },
  'variance': { label: 'Variance', color: 'bg-red-100 text-red-700' },
  'skipped': { label: 'Skipped', color: 'bg-amber-100 text-amber-700' }
}

const conditionConfig: Record<ItemCondition, { label: string; color: string }> = {
  'good': { label: 'Good', color: 'bg-green-100 text-green-700' },
  'damaged': { label: 'Damaged', color: 'bg-orange-100 text-orange-700' },
  'expired': { label: 'Expired', color: 'bg-red-100 text-red-700' },
  'missing': { label: 'Missing', color: 'bg-gray-100 text-gray-700' }
}

export default function SpotCheckDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [spotCheck, setSpotCheck] = useState<SpotCheck | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "items" | "variance" | "history">("overview")
  const [itemSearch, setItemSearch] = useState("")
  const [itemStatusFilter, setItemStatusFilter] = useState<ItemCheckStatus | "all">("all")
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState("")

  // Load spot check data
  useEffect(() => {
    const data = getSpotCheckById(id)
    if (data) {
      setSpotCheck(data)
    }
    setLoading(false)
  }, [id])

  // Filter items
  const filteredItems = useMemo(() => {
    if (!spotCheck) return []

    return spotCheck.items.filter(item => {
      const matchesSearch =
        item.itemName.toLowerCase().includes(itemSearch.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(itemSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(itemSearch.toLowerCase())

      const matchesStatus = itemStatusFilter === "all" || item.status === itemStatusFilter

      return matchesSearch && matchesStatus
    })
  }, [spotCheck, itemSearch, itemStatusFilter])

  // Variance items
  const varianceItems = useMemo(() => {
    if (!spotCheck) return []
    return spotCheck.items.filter(item => item.status === 'variance')
  }, [spotCheck])

  // Handlers
  const handleStartCount = () => {
    router.push(`/inventory-management/spot-check/${id}/count`)
  }

  const handleResumeCount = () => {
    router.push(`/inventory-management/spot-check/${id}/count`)
  }

  const handleCompleteCheck = () => {
    // In a real app, this would update the status via API
    if (spotCheck) {
      setSpotCheck({
        ...spotCheck,
        status: 'completed',
        completedAt: new Date()
      })
    }
  }

  const handleCancelCheck = () => {
    if (spotCheck && cancelReason) {
      setSpotCheck({
        ...spotCheck,
        status: 'cancelled',
        notes: cancelReason
      })
      setShowCancelDialog(false)
      setCancelReason("")
    }
  }

  const handlePutOnHold = () => {
    if (spotCheck) {
      setSpotCheck({
        ...spotCheck,
        status: 'on-hold'
      })
    }
  }

  const handleResumeFromHold = () => {
    if (spotCheck) {
      setSpotCheck({
        ...spotCheck,
        status: spotCheck.countedItems > 0 ? 'in-progress' : 'pending'
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!spotCheck) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Spot Check Not Found</h2>
        <p className="text-muted-foreground">The spot check you're looking for doesn't exist.</p>
        <Button onClick={() => router.push("/inventory-management/spot-check")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Spot Checks
        </Button>
      </div>
    )
  }

  const status = statusConfig[spotCheck.status]
  const type = typeConfig[spotCheck.checkType]
  const priority = priorityConfig[spotCheck.priority]
  const progress = spotCheck.totalItems > 0 ? (spotCheck.countedItems / spotCheck.totalItems) * 100 : 0
  const isOverdue = spotCheck.dueDate && new Date(spotCheck.dueDate) < new Date() &&
    spotCheck.status !== 'completed' && spotCheck.status !== 'cancelled'

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/inventory-management/spot-check" className="hover:text-foreground transition-colors">
            Spot Checks
          </Link>
          <span>/</span>
          <span className="text-foreground">{spotCheck.checkNumber}</span>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/inventory-management/spot-check")}
              className="mt-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{spotCheck.checkNumber}</h1>
                <Badge className={status.color}>
                  {status.icon}
                  <span className="ml-1">{status.label}</span>
                </Badge>
                <Badge className={type.color}>
                  {type.label}
                </Badge>
                <Badge className={priority.color}>
                  {priority.label} Priority
                </Badge>
                {isOverdue && (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">{spotCheck.reason}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {spotCheck.status === 'pending' && (
              <Button onClick={handleStartCount}>
                <Play className="h-4 w-4 mr-2" />
                Start Count
              </Button>
            )}
            {spotCheck.status === 'in-progress' && (
              <>
                <Button variant="outline" onClick={handlePutOnHold}>
                  <Pause className="h-4 w-4 mr-2" />
                  Put On Hold
                </Button>
                <Button onClick={handleResumeCount}>
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Continue Count
                </Button>
              </>
            )}
            {spotCheck.status === 'on-hold' && (
              <Button onClick={handleResumeFromHold}>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            )}
            {spotCheck.status === 'draft' && (
              <Button onClick={handleStartCount}>
                <Play className="h-4 w-4 mr-2" />
                Activate
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Checklist
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {spotCheck.status !== 'completed' && spotCheck.status !== 'cancelled' && (
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Check
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Progress Bar (for in-progress checks) */}
      {(spotCheck.status === 'in-progress' || spotCheck.status === 'on-hold') && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Counting Progress</span>
              <span className="text-sm text-muted-foreground">
                {spotCheck.countedItems} of {spotCheck.totalItems} items ({progress.toFixed(0)}%)
              </span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>{spotCheck.matchedItems} matched</span>
              <span>{spotCheck.varianceItems} with variance</span>
              <span>{spotCheck.totalItems - spotCheck.countedItems} remaining</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{spotCheck.totalItems}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                <p className="text-2xl font-bold">
                  {spotCheck.accuracy > 0 ? `${spotCheck.accuracy}%` : '-'}
                </p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${spotCheck.totalValue.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Variance Value</p>
                <p className={`text-2xl font-bold ${spotCheck.varianceValue > 0 ? 'text-red-600' : ''}`}>
                  ${spotCheck.varianceValue.toLocaleString()}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">
            Items ({spotCheck.totalItems})
          </TabsTrigger>
          <TabsTrigger value="variance">
            Variances ({spotCheck.varianceItems})
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Details */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Check Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {spotCheck.locationName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">{spotCheck.departmentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned To</p>
                    <p className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {spotCheck.assignedToName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created By</p>
                    <p className="font-medium">{spotCheck.createdBy}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Scheduled Date</p>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(spotCheck.scheduledDate), "PPP")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                      {spotCheck.dueDate ? format(new Date(spotCheck.dueDate), "PPP") : '-'}
                    </p>
                  </div>
                  {spotCheck.startedAt && (
                    <div>
                      <p className="text-sm text-muted-foreground">Started At</p>
                      <p className="font-medium">
                        {format(new Date(spotCheck.startedAt), "PPP p")}
                      </p>
                    </div>
                  )}
                  {spotCheck.completedAt && (
                    <div>
                      <p className="text-sm text-muted-foreground">Completed At</p>
                      <p className="font-medium">
                        {format(new Date(spotCheck.completedAt), "PPP p")}
                      </p>
                    </div>
                  )}
                </div>

                {spotCheck.notes && (
                  <div className="col-span-2">
                    <Separator className="my-4" />
                    <p className="text-sm text-muted-foreground mb-2">Notes</p>
                    <p className="text-sm">{spotCheck.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right Column - Quick Stats */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Item Status Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <CheckCheck className="h-4 w-4 text-green-500" />
                      Matched
                    </span>
                    <span className="font-medium">{spotCheck.matchedItems}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Variance
                    </span>
                    <span className="font-medium">{spotCheck.varianceItems}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      Pending
                    </span>
                    <span className="font-medium">
                      {spotCheck.totalItems - spotCheck.countedItems}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative pl-4 border-l-2 border-muted space-y-4">
                    <div className="relative">
                      <div className="absolute -left-[21px] w-4 h-4 rounded-full bg-green-500" />
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(spotCheck.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {spotCheck.startedAt && (
                      <div className="relative">
                        <div className="absolute -left-[21px] w-4 h-4 rounded-full bg-blue-500" />
                        <p className="text-sm font-medium">Started</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(spotCheck.startedAt), { addSuffix: true })}
                        </p>
                      </div>
                    )}
                    {spotCheck.completedAt && (
                      <div className="relative">
                        <div className="absolute -left-[21px] w-4 h-4 rounded-full bg-green-500" />
                        <p className="text-sm font-medium">Completed</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(spotCheck.completedAt), { addSuffix: true })}
                        </p>
                      </div>
                    )}
                    {spotCheck.status === 'cancelled' && (
                      <div className="relative">
                        <div className="absolute -left-[21px] w-4 h-4 rounded-full bg-red-500" />
                        <p className="text-sm font-medium">Cancelled</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(spotCheck.updatedAt), { addSuffix: true })}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Items</CardTitle>
                <div className="flex items-center gap-4">
                  <Input
                    placeholder="Search items..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    className="w-64"
                  />
                  <Select value={itemStatusFilter} onValueChange={(v) => setItemStatusFilter(v as typeof itemStatusFilter)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="counted">Counted</SelectItem>
                      <SelectItem value="variance">Variance</SelectItem>
                      <SelectItem value="skipped">Skipped</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">System Qty</TableHead>
                    <TableHead className="text-right">Counted Qty</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.itemName}</p>
                          <p className="text-xs text-muted-foreground">{item.itemCode}</p>
                        </div>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell className="text-right">
                        {item.systemQuantity} {item.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.countedQuantity !== null
                          ? `${item.countedQuantity} ${item.unit}`
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        {item.countedQuantity !== null ? (
                          <span className={item.variance !== 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                            {item.variance > 0 ? '+' : ''}{item.variance} ({item.variancePercent}%)
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={conditionConfig[item.condition].color}>
                          {conditionConfig[item.condition].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={itemStatusConfig[item.status].color}>
                          {itemStatusConfig[item.status].label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No items match your search</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variance Tab */}
        <TabsContent value="variance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Variance Items</CardTitle>
              <CardDescription>
                Items with discrepancies between system and counted quantities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {varianceItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">System Qty</TableHead>
                      <TableHead className="text-right">Counted Qty</TableHead>
                      <TableHead className="text-right">Variance</TableHead>
                      <TableHead className="text-right">Value Impact</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {varianceItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.itemName}</p>
                            <p className="text-xs text-muted-foreground">{item.itemCode}</p>
                          </div>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right">
                          {item.systemQuantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.countedQuantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-red-600 font-medium">
                            {item.variance > 0 ? '+' : ''}{item.variance} ({item.variancePercent}%)
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={item.variance < 0 ? 'text-red-600' : 'text-amber-600'}>
                            ${Math.abs(item.variance * (item.value / item.systemQuantity)).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={conditionConfig[item.condition].color}>
                            {conditionConfig[item.condition].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground max-w-[200px] truncate">
                            {item.notes || '-'}
                          </p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                  <p className="text-lg font-medium">No Variances Found</p>
                  <p className="text-muted-foreground">All counted items match the system quantities</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>
                Timeline of all actions taken on this spot check
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 border-l-2 border-muted space-y-6">
                <div className="relative">
                  <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-green-500" />
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">Spot Check Created</p>
                      <p className="text-sm text-muted-foreground">
                        Created by {spotCheck.createdBy}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(spotCheck.createdAt), "PPP p")}
                    </p>
                  </div>
                </div>

                {spotCheck.startedAt && (
                  <div className="relative">
                    <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-blue-500" />
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">Counting Started</p>
                        <p className="text-sm text-muted-foreground">
                          Started by {spotCheck.assignedToName}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(spotCheck.startedAt), "PPP p")}
                      </p>
                    </div>
                  </div>
                )}

                {spotCheck.countedItems > 0 && !spotCheck.completedAt && (
                  <div className="relative">
                    <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-amber-500" />
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">Items Counted</p>
                        <p className="text-sm text-muted-foreground">
                          {spotCheck.countedItems} of {spotCheck.totalItems} items counted
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(spotCheck.updatedAt), "PPP p")}
                      </p>
                    </div>
                  </div>
                )}

                {spotCheck.completedAt && (
                  <div className="relative">
                    <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-green-500" />
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">Spot Check Completed</p>
                        <p className="text-sm text-muted-foreground">
                          Completed by {spotCheck.assignedToName} • Accuracy: {spotCheck.accuracy}%
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(spotCheck.completedAt), "PPP p")}
                      </p>
                    </div>
                  </div>
                )}

                {spotCheck.status === 'cancelled' && (
                  <div className="relative">
                    <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-red-500" />
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">Spot Check Cancelled</p>
                        <p className="text-sm text-muted-foreground">
                          {spotCheck.notes}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(spotCheck.updatedAt), "PPP p")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Spot Check</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this spot check? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Please provide a reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Check
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelCheck}
              disabled={!cancelReason.trim()}
            >
              Cancel Check
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
