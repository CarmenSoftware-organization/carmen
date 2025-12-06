"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Save,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Package,
  MapPin,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  RefreshCw,
  Minus,
  Plus,
  Camera,
  MessageSquare,
  AlertCircle,
  Target,
  ClipboardCheck,
  Timer,
  Boxes,
  Send,
  FileText,
  LayoutGrid,
  List,
  Search,
  Filter,
  SortAsc
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

import { getSpotCheckById } from "@/lib/mock-data/spot-checks"
import type {
  SpotCheck,
  SpotCheckItem,
  ItemCheckStatus,
  ItemCondition
} from "../../types"

const conditionOptions: { value: ItemCondition; label: string; description: string }[] = [
  { value: 'good', label: 'Good', description: 'Item is in good condition' },
  { value: 'damaged', label: 'Damaged', description: 'Item shows signs of damage' },
  { value: 'expired', label: 'Expired', description: 'Item has passed expiry date' },
  { value: 'missing', label: 'Missing', description: 'Item cannot be found' }
]

const conditionConfig: Record<ItemCondition, { color: string; bgColor: string }> = {
  'good': { color: 'text-green-700', bgColor: 'bg-green-100' },
  'damaged': { color: 'text-orange-700', bgColor: 'bg-orange-100' },
  'expired': { color: 'text-red-700', bgColor: 'bg-red-100' },
  'missing': { color: 'text-gray-700', bgColor: 'bg-gray-100' }
}

const itemStatusConfig: Record<ItemCheckStatus, { label: string; color: string }> = {
  'pending': { label: 'Pending', color: 'bg-gray-100 text-gray-700' },
  'counted': { label: 'Counted', color: 'bg-green-100 text-green-700' },
  'variance': { label: 'Variance', color: 'bg-red-100 text-red-700' },
  'skipped': { label: 'Skipped', color: 'bg-amber-100 text-amber-700' }
}

type ViewMode = 'single' | 'list'

export default function SpotCheckCountPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  // Core state
  const [spotCheck, setSpotCheck] = useState<SpotCheck | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('single')
  const [currentItemIndex, setCurrentItemIndex] = useState(0)

  // Counting state for current item
  const [countedQuantity, setCountedQuantity] = useState<string>("")
  const [condition, setCondition] = useState<ItemCondition>("good")
  const [notes, setNotes] = useState("")

  // UI state
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [showSkipDialog, setShowSkipDialog] = useState(false)
  const [skipReason, setSkipReason] = useState("")
  const [startTime] = useState(new Date())
  const [itemSearch, setItemSearch] = useState("")
  const [pendingOnly, setPendingOnly] = useState(false)

  // Load spot check data
  useEffect(() => {
    const data = getSpotCheckById(id)
    if (data) {
      // If not started, mark as in-progress
      if (data.status === 'pending' || data.status === 'draft') {
        setSpotCheck({
          ...data,
          status: 'in-progress',
          startedAt: new Date()
        })
      } else {
        setSpotCheck(data)
      }

      // Find first uncounted item
      const firstPendingIndex = data.items.findIndex(item => item.status === 'pending')
      if (firstPendingIndex !== -1) {
        setCurrentItemIndex(firstPendingIndex)
      }
    }
    setLoading(false)
  }, [id])

  // Current item
  const currentItem = useMemo(() => {
    if (!spotCheck || spotCheck.items.length === 0) return null
    return spotCheck.items[currentItemIndex]
  }, [spotCheck, currentItemIndex])

  // Reset form when item changes
  useEffect(() => {
    if (currentItem) {
      if (currentItem.countedQuantity !== null) {
        setCountedQuantity(currentItem.countedQuantity.toString())
        setCondition(currentItem.condition)
        setNotes(currentItem.notes)
      } else {
        setCountedQuantity("")
        setCondition("good")
        setNotes("")
      }
    }
  }, [currentItem])

  // Filtered items for list view
  const filteredItems = useMemo(() => {
    if (!spotCheck) return []

    return spotCheck.items.filter(item => {
      const matchesSearch =
        item.itemName.toLowerCase().includes(itemSearch.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(itemSearch.toLowerCase())

      const matchesPending = !pendingOnly || item.status === 'pending'

      return matchesSearch && matchesPending
    })
  }, [spotCheck, itemSearch, pendingOnly])

  // Progress calculations
  const progress = useMemo(() => {
    if (!spotCheck) return { counted: 0, total: 0, percent: 0, matched: 0, variance: 0 }

    const counted = spotCheck.items.filter(i => i.status === 'counted' || i.status === 'variance').length
    const matched = spotCheck.items.filter(i => i.status === 'counted').length
    const variance = spotCheck.items.filter(i => i.status === 'variance').length

    return {
      counted,
      total: spotCheck.totalItems,
      percent: spotCheck.totalItems > 0 ? (counted / spotCheck.totalItems) * 100 : 0,
      matched,
      variance
    }
  }, [spotCheck])

  // Handlers
  const handleSaveCount = useCallback(() => {
    if (!spotCheck || !currentItem) return

    const qty = parseFloat(countedQuantity)
    if (isNaN(qty) || qty < 0) return

    const variance = qty - currentItem.systemQuantity
    const variancePercent = currentItem.systemQuantity > 0
      ? Number(((variance / currentItem.systemQuantity) * 100).toFixed(2))
      : 0

    const status: ItemCheckStatus = variance !== 0 ? 'variance' : 'counted'

    const updatedItems = [...spotCheck.items]
    updatedItems[currentItemIndex] = {
      ...currentItem,
      countedQuantity: qty,
      variance,
      variancePercent,
      condition,
      status,
      notes,
      countedBy: 'Current User',
      countedAt: new Date()
    }

    // Update spot check metrics
    const countedCount = updatedItems.filter(i => i.status === 'counted' || i.status === 'variance').length
    const matchedCount = updatedItems.filter(i => i.status === 'counted').length
    const varianceCount = updatedItems.filter(i => i.status === 'variance').length
    const totalVarianceValue = updatedItems.reduce((sum, i) =>
      sum + (i.status === 'variance' ? Math.abs(i.variance * (i.value / i.systemQuantity)) : 0)
    , 0)
    const accuracy = countedCount > 0 ? (matchedCount / countedCount) * 100 : 0

    setSpotCheck({
      ...spotCheck,
      items: updatedItems,
      countedItems: countedCount,
      matchedItems: matchedCount,
      varianceItems: varianceCount,
      varianceValue: totalVarianceValue,
      accuracy: Number(accuracy.toFixed(2)),
      updatedAt: new Date()
    })

    // Move to next pending item
    const nextPendingIndex = updatedItems.findIndex((item, idx) =>
      idx > currentItemIndex && item.status === 'pending'
    )

    if (nextPendingIndex !== -1) {
      setCurrentItemIndex(nextPendingIndex)
    } else {
      // Check if there are any pending items before current
      const earlierPendingIndex = updatedItems.findIndex(item => item.status === 'pending')
      if (earlierPendingIndex !== -1 && earlierPendingIndex !== currentItemIndex) {
        setCurrentItemIndex(earlierPendingIndex)
      }
    }
  }, [spotCheck, currentItem, currentItemIndex, countedQuantity, condition, notes])

  const handleSkipItem = useCallback(() => {
    if (!spotCheck || !currentItem) return

    const updatedItems = [...spotCheck.items]
    updatedItems[currentItemIndex] = {
      ...currentItem,
      status: 'skipped',
      notes: skipReason || 'Skipped during count'
    }

    setSpotCheck({
      ...spotCheck,
      items: updatedItems,
      updatedAt: new Date()
    })

    setShowSkipDialog(false)
    setSkipReason("")

    // Move to next pending item
    const nextPendingIndex = updatedItems.findIndex((item, idx) =>
      idx > currentItemIndex && item.status === 'pending'
    )

    if (nextPendingIndex !== -1) {
      setCurrentItemIndex(nextPendingIndex)
    }
  }, [spotCheck, currentItem, currentItemIndex, skipReason])

  const handlePreviousItem = useCallback(() => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1)
    }
  }, [currentItemIndex])

  const handleNextItem = useCallback(() => {
    if (spotCheck && currentItemIndex < spotCheck.items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1)
    }
  }, [spotCheck, currentItemIndex])

  const handleSelectItem = useCallback((index: number) => {
    setCurrentItemIndex(index)
    setViewMode('single')
  }, [])

  const handleCompleteCheck = useCallback(() => {
    if (!spotCheck) return

    setSpotCheck({
      ...spotCheck,
      status: 'completed',
      completedAt: new Date()
    })

    setShowCompleteDialog(false)
    router.push(`/inventory-management/spot-check/${id}`)
  }, [spotCheck, id, router])

  const handlePauseAndExit = useCallback(() => {
    router.push(`/inventory-management/spot-check/${id}`)
  }, [id, router])

  const handleQuantityChange = (delta: number) => {
    const current = parseFloat(countedQuantity) || 0
    const newValue = Math.max(0, current + delta)
    setCountedQuantity(newValue.toString())
  }

  // Calculate elapsed time
  const getElapsedTime = () => {
    const now = new Date()
    const diff = now.getTime() - startTime.getTime()
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
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
        <Button onClick={() => router.push("/inventory-management/spot-check")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Spot Checks
        </Button>
      </div>
    )
  }

  const allItemsCounted = progress.counted === progress.total
  const hasPendingItems = spotCheck.items.some(i => i.status === 'pending')

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowExitDialog(true)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">{spotCheck.checkNumber}</h1>
              <Badge className="bg-blue-100 text-blue-700">
                <RefreshCw className="h-3 w-3 mr-1" />
                Counting
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {spotCheck.locationName} • {spotCheck.departmentName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Timer className="h-4 w-4" />
            <span>{getElapsedTime()}</span>
          </div>

          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'single' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('single')}
            >
              <Target className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" onClick={() => setShowExitDialog(true)}>
            <Pause className="h-4 w-4 mr-2" />
            Pause
          </Button>

          {allItemsCounted && (
            <Button onClick={() => setShowCompleteDialog(true)}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Complete
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-3 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Progress</span>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {progress.matched} matched
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {progress.variance} variance
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                {progress.total - progress.counted} remaining
              </span>
            </div>
          </div>
          <span className="text-sm font-medium">
            {progress.counted} / {progress.total} ({progress.percent.toFixed(0)}%)
          </span>
        </div>
        <Progress value={progress.percent} className="h-2" />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'single' ? (
          // Single Item View
          <div className="h-full flex flex-col">
            {currentItem && (
              <>
                {/* Item Navigation */}
                <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/20">
                  <Button
                    variant="ghost"
                    onClick={handlePreviousItem}
                    disabled={currentItemIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Item {currentItemIndex + 1} of {spotCheck.items.length}
                  </span>
                  <Button
                    variant="ghost"
                    onClick={handleNextItem}
                    disabled={currentItemIndex === spotCheck.items.length - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                {/* Item Details & Counting Form */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-3xl mx-auto space-y-6">
                    {/* Item Card */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div>
                              <h2 className="text-xl font-semibold">{currentItem.itemName}</h2>
                              <p className="text-muted-foreground">{currentItem.itemCode}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <Badge variant="outline">{currentItem.category}</Badge>
                                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {currentItem.location}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge className={itemStatusConfig[currentItem.status].color}>
                            {itemStatusConfig[currentItem.status].label}
                          </Badge>
                        </div>

                        <Separator className="my-6" />

                        <div className="grid grid-cols-3 gap-6">
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">System Quantity</p>
                            <p className="text-3xl font-bold">{currentItem.systemQuantity}</p>
                            <p className="text-sm text-muted-foreground">{currentItem.unit}</p>
                          </div>
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Last Count</p>
                            <p className="text-lg font-medium">
                              {currentItem.lastCountDate
                                ? format(new Date(currentItem.lastCountDate), "MMM d, yyyy")
                                : 'Never'
                              }
                            </p>
                          </div>
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Unit Value</p>
                            <p className="text-lg font-medium">
                              ${(currentItem.value / currentItem.systemQuantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Counting Form */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Enter Count</CardTitle>
                        <CardDescription>
                          Count the physical quantity and record the condition
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Quantity Input */}
                        <div className="space-y-2">
                          <Label>Counted Quantity ({currentItem.unit})</Label>
                          <div className="flex items-center gap-4">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleQuantityChange(-1)}
                              disabled={parseFloat(countedQuantity) <= 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              value={countedQuantity}
                              onChange={(e) => setCountedQuantity(e.target.value)}
                              className="text-center text-2xl font-bold h-16 w-40"
                              placeholder="0"
                              min="0"
                              step="1"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleQuantityChange(1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => setCountedQuantity(currentItem.systemQuantity.toString())}
                              className="text-sm"
                            >
                              Match System ({currentItem.systemQuantity})
                            </Button>
                          </div>

                          {/* Variance Preview */}
                          {countedQuantity && (
                            <div className={cn(
                              "flex items-center justify-center gap-2 p-3 rounded-lg mt-2",
                              parseFloat(countedQuantity) === currentItem.systemQuantity
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            )}>
                              {parseFloat(countedQuantity) === currentItem.systemQuantity ? (
                                <>
                                  <CheckCircle2 className="h-5 w-5" />
                                  <span className="font-medium">Quantities match!</span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="h-5 w-5" />
                                  <span className="font-medium">
                                    Variance: {(parseFloat(countedQuantity) - currentItem.systemQuantity) > 0 ? '+' : ''}
                                    {parseFloat(countedQuantity) - currentItem.systemQuantity} {currentItem.unit}
                                    {' '}
                                    ({(((parseFloat(countedQuantity) - currentItem.systemQuantity) / currentItem.systemQuantity) * 100).toFixed(1)}%)
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Condition Selection */}
                        <div className="space-y-2">
                          <Label>Item Condition</Label>
                          <RadioGroup
                            value={condition}
                            onValueChange={(v) => setCondition(v as ItemCondition)}
                            className="grid grid-cols-4 gap-4"
                          >
                            {conditionOptions.map((opt) => (
                              <div key={opt.value}>
                                <RadioGroupItem
                                  value={opt.value}
                                  id={`condition-${opt.value}`}
                                  className="peer sr-only"
                                />
                                <Label
                                  htmlFor={`condition-${opt.value}`}
                                  className={cn(
                                    "flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-colors",
                                    "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                                    "hover:bg-muted/50"
                                  )}
                                >
                                  <span className={cn(
                                    "font-medium",
                                    conditionConfig[opt.value].color
                                  )}>
                                    {opt.label}
                                  </span>
                                  <span className="text-xs text-muted-foreground text-center mt-1">
                                    {opt.description}
                                  </span>
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                          <Label>Notes (Optional)</Label>
                          <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any observations or comments..."
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="px-6 py-4 border-t bg-background">
                  <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setShowSkipDialog(true)}
                    >
                      <SkipForward className="h-4 w-4 mr-2" />
                      Skip Item
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={handleNextItem}
                        disabled={currentItemIndex === spotCheck.items.length - 1}
                      >
                        Save & Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                      <Button
                        onClick={handleSaveCount}
                        disabled={!countedQuantity || parseFloat(countedQuantity) < 0}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Save Count
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          // List View
          <div className="h-full flex flex-col p-6">
            {/* Filters */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button
                  variant={pendingOnly ? "secondary" : "outline"}
                  onClick={() => setPendingOnly(!pendingOnly)}
                  size="sm"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Pending Only
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                {filteredItems.length} items
              </span>
            </div>

            {/* Items Table */}
            <div className="flex-1 overflow-auto border rounded-lg">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">System Qty</TableHead>
                    <TableHead className="text-right">Counted Qty</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item, index) => {
                    const originalIndex = spotCheck.items.findIndex(i => i.id === item.id)
                    return (
                      <TableRow
                        key={item.id}
                        className={cn(
                          "cursor-pointer",
                          originalIndex === currentItemIndex && "bg-muted/50"
                        )}
                        onClick={() => handleSelectItem(originalIndex)}
                      >
                        <TableCell className="text-muted-foreground">
                          {originalIndex + 1}
                        </TableCell>
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
                              {item.variance > 0 ? '+' : ''}{item.variance}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {item.countedQuantity !== null && (
                            <Badge className={conditionConfig[item.condition].bgColor + ' ' + conditionConfig[item.condition].color}>
                              {item.condition}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={itemStatusConfig[item.status].color}>
                            {itemStatusConfig[item.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelectItem(originalIndex)
                            }}
                          >
                            {item.status === 'pending' ? 'Count' : 'Edit'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Exit Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pause Counting?</DialogTitle>
            <DialogDescription>
              Your progress will be saved. You can resume counting later.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Items counted:</span>
                <span className="font-medium">{progress.counted} / {progress.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Time elapsed:</span>
                <span className="font-medium">{getElapsedTime()}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExitDialog(false)}>
              Continue Counting
            </Button>
            <Button onClick={handlePauseAndExit}>
              Save & Exit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Skip Dialog */}
      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skip Item?</DialogTitle>
            <DialogDescription>
              This item will be marked as skipped. You can count it later.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Reason for skipping (optional)</Label>
            <Textarea
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              placeholder="e.g., Item not accessible, counting later..."
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSkipDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSkipItem}>
              Skip Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Spot Check?</DialogTitle>
            <DialogDescription>
              Review the summary before completing this spot check.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span>Total Items:</span>
                <span className="font-medium">{progress.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Items Counted:</span>
                <span className="font-medium">{progress.counted}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-green-600">
                <span>Matched:</span>
                <span className="font-medium">{progress.matched}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>With Variance:</span>
                <span className="font-medium">{progress.variance}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span>Accuracy Rate:</span>
                <span className="font-medium">
                  {progress.counted > 0 ? ((progress.matched / progress.counted) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Variance Value:</span>
                <span className="font-medium text-red-600">
                  ${spotCheck.varianceValue.toFixed(2)}
                </span>
              </div>
            </div>

            {hasPendingItems && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 text-amber-800 rounded-lg">
                <AlertTriangle className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-medium">Some items not counted</p>
                  <p className="text-sm">
                    {spotCheck.items.filter(i => i.status === 'pending').length} items are still pending.
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              Continue Counting
            </Button>
            <Button onClick={handleCompleteCheck}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Complete Spot Check
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
