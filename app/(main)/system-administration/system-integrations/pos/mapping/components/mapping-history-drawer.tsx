"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import {
  History,
  Search,
  Download,
  Filter,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  X
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

export type HistoryAction = "created" | "updated" | "deleted" | "activated" | "deactivated" | "synced"

export interface MappingHistoryEntry {
  id: string
  timestamp: Date
  action: HistoryAction
  user: {
    id: string
    name: string
    email: string
  }
  changes: {
    field: string
    oldValue: string | null
    newValue: string | null
  }[]
  reason?: string
  metadata?: {
    ipAddress?: string
    userAgent?: string
    apiVersion?: string
  }
}

interface MappingHistoryDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mappingId: string
  mappingType: "recipe" | "unit" | "location"
  mappingName: string
}

export function MappingHistoryDrawer({
  open,
  onOpenChange,
  mappingId,
  mappingType,
  mappingName,
}: MappingHistoryDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState<HistoryAction | "all">("all")
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all")
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())

  // Mock history data - in production, this would come from API
  const mockHistory: MappingHistoryEntry[] = [
    {
      id: "hist-001",
      timestamp: new Date("2025-01-15T14:30:00"),
      action: "updated",
      user: {
        id: "user-001",
        name: "Sarah Johnson",
        email: "sarah.j@example.com",
      },
      changes: [
        { field: "Portion Size", oldValue: "1.0", newValue: "1.5" },
        { field: "Unit", oldValue: "serving", newValue: "plate" },
      ],
    },
    {
      id: "hist-002",
      timestamp: new Date("2025-01-10T09:15:00"),
      action: "activated",
      user: {
        id: "user-002",
        name: "Michael Chen",
        email: "m.chen@example.com",
      },
      changes: [
        { field: "Status", oldValue: "inactive", newValue: "active" },
      ],
      reason: "Mapping verified and approved for production use",
    },
    {
      id: "hist-003",
      timestamp: new Date("2025-01-05T16:45:00"),
      action: "created",
      user: {
        id: "user-001",
        name: "Sarah Johnson",
        email: "sarah.j@example.com",
      },
      changes: [
        { field: "POS Item", oldValue: null, newValue: "PIZZA-001" },
        { field: "Recipe", oldValue: null, newValue: "Margherita Pizza" },
        { field: "Portion Size", oldValue: null, newValue: "1.0" },
      ],
    },
    {
      id: "hist-004",
      timestamp: new Date("2024-12-20T11:20:00"),
      action: "synced",
      user: {
        id: "system",
        name: "System",
        email: "system@carmen.app",
      },
      changes: [
        { field: "Last Sync", oldValue: "2024-12-19 11:20", newValue: "2024-12-20 11:20" },
      ],
    },
  ]

  // Filter history entries
  const filteredHistory = useMemo(() => {
    let filtered = mockHistory

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(entry =>
        entry.user.name.toLowerCase().includes(query) ||
        entry.changes.some(change =>
          change.field.toLowerCase().includes(query) ||
          change.oldValue?.toLowerCase().includes(query) ||
          change.newValue?.toLowerCase().includes(query)
        )
      )
    }

    // Apply action filter
    if (actionFilter !== "all") {
      filtered = filtered.filter(entry => entry.action === actionFilter)
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0)
          break
        case "week":
          filterDate.setDate(now.getDate() - 7)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          break
      }

      filtered = filtered.filter(entry => entry.timestamp >= filterDate)
    }

    return filtered
  }, [searchQuery, actionFilter, dateFilter])

  // Toggle entry expansion
  const toggleEntry = (entryId: string) => {
    const newExpanded = new Set(expandedEntries)
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId)
    } else {
      newExpanded.add(entryId)
    }
    setExpandedEntries(newExpanded)
  }

  // Export history to JSON
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(filteredHistory, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${mappingType}-mapping-history-${mappingId}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Export history to CSV
  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Action', 'User', 'Field', 'Old Value', 'New Value', 'Reason']
    const rows = filteredHistory.flatMap(entry =>
      entry.changes.map(change => [
        format(entry.timestamp, 'yyyy-MM-dd HH:mm:ss'),
        entry.action,
        entry.user.name,
        change.field,
        change.oldValue || '',
        change.newValue || '',
        entry.reason || '',
      ])
    )

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const dataBlob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${mappingType}-mapping-history-${mappingId}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Get action badge variant
  const getActionBadge = (action: HistoryAction) => {
    const variants: Record<HistoryAction, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      created: { variant: "default", label: "Created" },
      updated: { variant: "secondary", label: "Updated" },
      deleted: { variant: "destructive", label: "Deleted" },
      activated: { variant: "default", label: "Activated" },
      deactivated: { variant: "outline", label: "Deactivated" },
      synced: { variant: "outline", label: "Synced" },
    }
    return variants[action]
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setActionFilter("all")
    setDateFilter("all")
  }

  const hasActiveFilters = searchQuery || actionFilter !== "all" || dateFilter !== "all"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[700px] flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Mapping History
          </SheetTitle>
          <SheetDescription>
            Audit trail for {mappingName} ({mappingType})
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-4 mt-6 overflow-hidden">
          {/* Search and Filters */}
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="action-filter" className="text-xs text-muted-foreground">
                  Action
                </Label>
                <Select value={actionFilter} onValueChange={(value) => setActionFilter(value as HistoryAction | "all")}>
                  <SelectTrigger id="action-filter" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="created">Created</SelectItem>
                    <SelectItem value="updated">Updated</SelectItem>
                    <SelectItem value="deleted">Deleted</SelectItem>
                    <SelectItem value="activated">Activated</SelectItem>
                    <SelectItem value="deactivated">Deactivated</SelectItem>
                    <SelectItem value="synced">Synced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date-filter" className="text-xs text-muted-foreground">
                  Date Range
                </Label>
                <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as typeof dateFilter)}>
                  <SelectTrigger id="date-filter" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {filteredHistory.length} {filteredHistory.length === 1 ? 'entry' : 'entries'}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear filters
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* History Timeline */}
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-4 pb-4">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="text-sm">No history entries found</p>
                </div>
              ) : (
                filteredHistory.map((entry, index) => {
                  const isExpanded = expandedEntries.has(entry.id)
                  const actionBadge = getActionBadge(entry.action)

                  return (
                    <div key={entry.id} className="relative">
                      {/* Timeline line */}
                      {index !== filteredHistory.length - 1 && (
                        <div className="absolute left-[11px] top-10 bottom-0 w-[2px] bg-border" />
                      )}

                      {/* Entry card */}
                      <div className="flex gap-3">
                        {/* Timeline dot */}
                        <div className="mt-1 relative">
                          <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                            entry.action === 'deleted' ? 'border-destructive bg-destructive/10' :
                            entry.action === 'created' ? 'border-primary bg-primary/10' :
                            entry.action === 'activated' ? 'border-green-500 bg-green-500/10' :
                            'border-muted-foreground bg-background'
                          }`}>
                            <div className={`h-2 w-2 rounded-full ${
                              entry.action === 'deleted' ? 'bg-destructive' :
                              entry.action === 'created' ? 'bg-primary' :
                              entry.action === 'activated' ? 'bg-green-500' :
                              'bg-muted-foreground'
                            }`} />
                          </div>
                        </div>

                        {/* Entry content */}
                        <div className="flex-1 pb-4">
                          <div
                            className="p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors cursor-pointer"
                            onClick={() => toggleEntry(entry.id)}
                          >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant={actionBadge.variant} className="text-xs">
                                  {actionBadge.label}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {format(entry.timestamp, 'MMM dd, yyyy @ hh:mm a')}
                                </span>
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                              )}
                            </div>

                            {/* User */}
                            <div className="flex items-center gap-2 text-sm mb-2">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium">{entry.user.name}</span>
                              <span className="text-muted-foreground text-xs">
                                {entry.user.email}
                              </span>
                            </div>

                            {/* Changes summary */}
                            {!isExpanded && (
                              <p className="text-sm text-muted-foreground">
                                {entry.changes.length} {entry.changes.length === 1 ? 'change' : 'changes'}
                              </p>
                            )}

                            {/* Expanded details */}
                            {isExpanded && (
                              <div className="mt-3 space-y-2">
                                {entry.changes.map((change, idx) => (
                                  <div
                                    key={idx}
                                    className="p-2 bg-muted/50 rounded border text-sm"
                                  >
                                    <div className="font-medium text-xs text-muted-foreground mb-1">
                                      {change.field}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {change.oldValue !== null && (
                                        <>
                                          <code className="px-2 py-1 bg-destructive/10 text-destructive rounded text-xs">
                                            {change.oldValue}
                                          </code>
                                          <span className="text-muted-foreground">→</span>
                                        </>
                                      )}
                                      <code className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                                        {change.newValue}
                                      </code>
                                    </div>
                                  </div>
                                ))}

                                {entry.reason && (
                                  <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20 rounded">
                                    <p className="text-xs font-medium text-amber-900 dark:text-amber-100 mb-1">
                                      Reason
                                    </p>
                                    <p className="text-xs text-amber-800 dark:text-amber-200">
                                      {entry.reason}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-muted-foreground">
              Showing {filteredHistory.length} of {mockHistory.length} entries
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={filteredHistory.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJSON}
                disabled={filteredHistory.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
