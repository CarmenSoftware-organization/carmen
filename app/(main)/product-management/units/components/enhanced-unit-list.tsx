"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CheckCircle,
  Download,
  Plus,
  Search,
  Trash2,
  XCircle,
  FileText,
  Edit,
  MoreHorizontal,
  List,
  Grid,
  Filter,
  Copy,
  Eye,
  Settings,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Package,
  ShoppingCart,
  UtensilsCrossed,
  TrendingUp
} from "lucide-react"
import { EnhancedUnitForm } from "./enhanced-unit-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { mockUnits } from "@/lib/mock-data/units"
import { Unit } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import type { UnitFormData } from "../hooks/use-unit-form"

interface EnhancedUnitListProps {
  initialUnits?: Unit[]
  onUnitCreate?: (unit: UnitFormData) => void
  onUnitUpdate?: (id: string, unit: UnitFormData) => void
  onUnitDelete?: (id: string) => void
  showAdvancedFilters?: boolean
  enableBulkOperations?: boolean
  defaultViewMode?: 'table' | 'card'
}

export function EnhancedUnitList({
  initialUnits = mockUnits,
  onUnitCreate,
  onUnitUpdate,
  onUnitDelete,
  showAdvancedFilters = true,
  enableBulkOperations = true,
  defaultViewMode = 'table'
}: EnhancedUnitListProps) {
  const router = useRouter()

  // State management
  const [units, setUnits] = useState<Unit[]>(initialUnits)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<'table' | 'card'>(defaultViewMode)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create')
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null)

  // Filtered and sorted units with performance optimization
  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      const matchesSearch =
        (unit.code?.toLowerCase() || '').includes(search.toLowerCase()) ||
        unit.symbol.toLowerCase().includes(search.toLowerCase()) ||
        unit.name.toLowerCase().includes(search.toLowerCase()) ||
        (unit.description?.toLowerCase() || '').includes(search.toLowerCase())

      const matchesType = filterType === "all" || unit.type === filterType
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "active" && unit.isActive) ||
        (statusFilter === "inactive" && !unit.isActive)

      return matchesSearch && matchesType && matchesStatus
    })
  }, [units, search, filterType, statusFilter])

  // Unit usage statistics (FR-UNIT-009)
  const usageStatistics = useMemo(() => {
    const totalUnits = units.length
    const activeUnits = units.filter(u => u.isActive).length
    const inactiveUnits = totalUnits - activeUnits

    // Count by type
    const inventoryUnits = units.filter(u => u.type === 'INVENTORY').length
    const orderUnits = units.filter(u => u.type === 'ORDER').length
    const recipeUnits = units.filter(u => u.type === 'RECIPE').length

    // Count by category
    const weightUnits = units.filter(u => u.category === 'weight').length
    const volumeUnits = units.filter(u => u.category === 'volume').length
    const countUnits = units.filter(u => u.category === 'count').length
    const otherUnits = totalUnits - weightUnits - volumeUnits - countUnits

    // Units with conversions
    const unitsWithConversion = units.filter(u => u.baseUnit && u.conversionFactor).length

    return {
      total: totalUnits,
      active: activeUnits,
      inactive: inactiveUnits,
      byType: {
        inventory: inventoryUnits,
        order: orderUnits,
        recipe: recipeUnits
      },
      byCategory: {
        weight: weightUnits,
        volume: volumeUnits,
        count: countUnits,
        other: otherUnits
      },
      withConversion: unitsWithConversion,
      activePercentage: totalUnits > 0 ? Math.round((activeUnits / totalUnits) * 100) : 0
    }
  }, [units])

  // Event handlers
  const handleSelectItems = useCallback((itemIds: string[]) => {
    setSelectedItems(itemIds)
  }, [])

  const handleBulkDelete = useCallback(async () => {
    if (selectedItems.length === 0) return

    try {
      setIsLoading(true)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setUnits(prev => prev.filter(unit => !selectedItems.includes(unit.id)))
      setSelectedItems([])

      toast.success(`Successfully deleted ${selectedItems.length} units`)
    } catch (error) {
      toast.error('Failed to delete units')
    } finally {
      setIsLoading(false)
    }
  }, [selectedItems])

  const handleBulkStatusUpdate = useCallback(async (status: boolean) => {
    if (selectedItems.length === 0) return

    try {
      setIsLoading(true)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setUnits(prev => prev.map(unit =>
        selectedItems.includes(unit.id)
          ? { ...unit, isActive: status }
          : unit
      ))
      setSelectedItems([])

      toast.success(`Successfully ${status ? 'activated' : 'deactivated'} ${selectedItems.length} units`)
    } catch (error) {
      toast.error('Failed to update unit status')
    } finally {
      setIsLoading(false)
    }
  }, [selectedItems])

  const handleBulkExport = useCallback(() => {
    console.log('Export items:', selectedItems)
    toast.success(`Exporting ${selectedItems.length} units...`)
  }, [selectedItems])

  // Unit CRUD operations
  const handleCreateUnit = useCallback(async (data: UnitFormData) => {
    try {
      const newUnit: Unit = {
        id: Math.random().toString(36).substr(2, 9),
        code: data.symbol.toUpperCase(), // Use symbol as code
        type: 'INVENTORY' as const, // Default type
        ...data,
      }

      setUnits(prev => [...prev, newUnit])
      setIsCreateDialogOpen(false)

      onUnitCreate?.(data)

      toast.success('Unit created successfully!', {
        description: `${data.symbol} - ${data.name} has been added to the system.`
      })
    } catch (error) {
      toast.error('Failed to create unit')
      console.error('Create unit error:', error)
    }
  }, [onUnitCreate])

  const handleUpdateUnit = useCallback(async (data: UnitFormData) => {
    if (!selectedUnit) return

    try {
      const updatedUnit: Unit = {
        ...selectedUnit,
        ...data,
      }

      setUnits(prev => prev.map(unit =>
        unit.id === selectedUnit.id ? updatedUnit : unit
      ))
      setSelectedUnit(null)

      onUnitUpdate?.(selectedUnit.id, data)

      toast.success('Unit updated successfully!', {
        description: `${data.symbol} - ${data.name} has been updated.`
      })
    } catch (error) {
      toast.error('Failed to update unit')
      console.error('Update unit error:', error)
    }
  }, [selectedUnit, onUnitUpdate])

  const handleDeleteUnit = useCallback(async (unit: Unit) => {
    try {
      setIsLoading(true)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setUnits(prev => prev.filter(u => u.id !== unit.id))
      setUnitToDelete(null)

      onUnitDelete?.(unit.id)

      toast.success('Unit deleted successfully!', {
        description: `${unit.symbol} - ${unit.name} has been removed.`
      })
    } catch (error) {
      toast.error('Failed to delete unit')
      console.error('Delete unit error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [onUnitDelete])

  const handleDuplicateUnit = useCallback((unit: Unit) => {
    const duplicatedUnit: Unit = {
      ...unit,
      id: Math.random().toString(36).substr(2, 9),
      code: `${unit.code || unit.symbol}_COPY`,
      symbol: `${unit.symbol}_copy`,
      name: `${unit.name} (Copy)`,
      createdAt: new Date(),
      createdBy: 'current-user',
      updatedAt: undefined,
      updatedBy: undefined,
    }

    setUnits(prev => [...prev, duplicatedUnit])

    toast.success('Unit duplicated successfully!', {
      description: `Created copy of ${unit.code || unit.symbol} as ${duplicatedUnit.code}`
    })
  }, [])

  // Dialog handlers
  const openCreateDialog = () => {
    setDialogMode('create')
    setSelectedUnit(null)
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (unit: Unit) => {
    setDialogMode('edit')
    setSelectedUnit(unit)
    setIsCreateDialogOpen(true)
  }

  const openViewDialog = (unit: Unit) => {
    setDialogMode('view')
    setSelectedUnit(unit)
    setIsCreateDialogOpen(true)
  }

  const closeDialog = () => {
    setIsCreateDialogOpen(false)
    setSelectedUnit(null)
    setDialogMode('create')
  }

  // Helper to get type badge styling
  const getTypeBadgeStyle = (type?: string) => {
    switch (type) {
      case 'INVENTORY':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-100'
      case 'ORDER':
        return 'bg-purple-100 text-purple-700 hover:bg-purple-100'
      case 'RECIPE':
        return 'bg-amber-100 text-amber-700 hover:bg-amber-100'
      default:
        return 'bg-gray-100 text-gray-600 hover:bg-gray-100'
    }
  }

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'INVENTORY': return '📦'
      case 'ORDER': return '🛒'
      case 'RECIPE': return '👨‍🍳'
      default: return '📋'
    }
  }

  // Row renderer for table view
  const renderTableRow = (unit: Unit) => (
    <TableRow key={unit.id} className="hover:bg-muted/50">
      <TableCell className="font-medium">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-sm font-semibold">{unit.code || unit.symbol}</span>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs">
              {unit.category}
            </Badge>
            {unit.type && (
              <Badge className={`text-xs ${getTypeBadgeStyle(unit.type)}`}>
                {getTypeIcon(unit.type)} {unit.type}
              </Badge>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{unit.name}</div>
          <div className="text-sm text-muted-foreground">
            Symbol: {unit.symbol}
            {unit.baseUnit && ` • Base: ${unit.baseUnit}`}
            {unit.conversionFactor && ` (×${unit.conversionFactor})`}
          </div>
          {unit.description && (
            <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {unit.description}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge
          className={`text-xs px-2 py-1 ${unit.isActive
              ? 'bg-green-100 text-green-700 hover:bg-green-100'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
            }`}
        >
          <div className="flex items-center gap-1">
            {unit.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            {unit.isActive ? 'Active' : 'Inactive'}
          </div>
        </Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => openViewDialog(unit)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEditDialog(unit)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Unit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDuplicateUnit(unit)}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="h-4 w-4 mr-2" />
              Export
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => setUnitToDelete(unit)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )

  // Card renderer for card view
  const renderCard = (unit: Unit) => (
    <Card
      key={unit.id}
      className="overflow-hidden hover:bg-secondary/10 transition-colors h-full shadow-sm"
    >
      <div className="flex flex-col h-full">
        {/* Card Header */}
        <div className="p-5 pb-3 bg-muted/30 border-b">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                {unit.name}
                <span className="font-mono text-sm text-muted-foreground">({unit.code || unit.symbol})</span>
              </h3>
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {unit.category}
                </Badge>
                {unit.type && (
                  <Badge className={`text-xs ${getTypeBadgeStyle(unit.type)}`}>
                    {getTypeIcon(unit.type)} {unit.type}
                  </Badge>
                )}
              </div>
            </div>
            <Badge
              className={`text-xs px-2 py-1 ${unit.isActive
                  ? 'bg-green-100 text-green-700 hover:bg-green-100'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
                }`}
            >
              <div className="flex items-center gap-1">
                {unit.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                {unit.isActive ? 'Active' : 'Inactive'}
              </div>
            </Badge>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5 flex-grow">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Code</p>
                <p className="text-sm font-mono font-semibold">
                  {unit.code || unit.symbol}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Symbol</p>
                <p className="text-sm font-mono">
                  {unit.symbol}
                </p>
              </div>
            </div>
            {unit.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{unit.description}</p>
              </div>
            )}
            {(unit.baseUnit || unit.conversionFactor) && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Conversion</p>
                <p className="text-sm">
                  {unit.baseUnit && `Base: ${unit.baseUnit}`}
                  {unit.conversionFactor && ` (×${unit.conversionFactor})`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Card Actions */}
        <div className="flex justify-between items-center px-4 py-3 bg-muted/20 border-t">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => openViewDialog(unit)}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button variant="ghost" size="sm" onClick={() => openEditDialog(unit)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDuplicateUnit(unit)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => setUnitToDelete(unit)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  )

  return (
    <>
      <div className="p-8">
        {/* Unit Management Card with Header */}
        <Card>
          <CardHeader className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Unit Management
                </CardTitle>
                <div className="text-sm text-gray-600 flex items-center gap-4 mt-1">
                  <span>Manage measurement units and conversions</span>
                  <Badge variant="outline" className="text-xs">
                    {filteredUnits.length} of {units.length} units
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleBulkExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button size="sm" onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Unit
                </Button>
              </div>
            </div>

            {/* Search and Filters Row */}
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Left Side - Search and Basic Filters */}
              <div className="flex flex-col sm:flex-row gap-4 items-center flex-1">
                {/* Search Input */}
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search units by code, name, or description..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Basic Filter Dropdowns */}
                <div className="flex gap-2 items-center">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          Active
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-3 w-3 text-gray-500" />
                          Inactive
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="INVENTORY">📦 Inventory</SelectItem>
                      <SelectItem value="ORDER">🛒 Order</SelectItem>
                      <SelectItem value="RECIPE">👨‍🍳 Recipe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right Side - View Toggle and Actions */}
              <div className="flex gap-2 items-center">
                {showAdvancedFilters && (
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Filters
                  </Button>
                )}

                {/* View Toggle */}
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    className="border-r"
                    onClick={() => setViewMode('table')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'card' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('card')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Usage Statistics Panel (FR-UNIT-009) */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              {/* Total Units */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-slate-500 rounded-lg">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-600">Total Units</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{usageStatistics.total}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {usageStatistics.activePercentage}% active
                </p>
              </div>

              {/* Active Units */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-green-700">Active</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{usageStatistics.active}</p>
                <p className="text-xs text-green-600 mt-1">
                  {usageStatistics.inactive} inactive
                </p>
              </div>

              {/* Inventory Units */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-blue-700">Inventory</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{usageStatistics.byType.inventory}</p>
                <p className="text-xs text-blue-600 mt-1">
                  Stock tracking units
                </p>
              </div>

              {/* Order Units */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <ShoppingCart className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-purple-700">Order</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">{usageStatistics.byType.order}</p>
                <p className="text-xs text-purple-600 mt-1">
                  Purchasing units
                </p>
              </div>

              {/* Recipe Units */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-amber-500 rounded-lg">
                    <UtensilsCrossed className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-amber-700">Recipe</span>
                </div>
                <p className="text-2xl font-bold text-amber-900">{usageStatistics.byType.recipe}</p>
                <p className="text-xs text-amber-600 mt-1">
                  Preparation units
                </p>
              </div>

              {/* Units with Conversions */}
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4 border border-cyan-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-cyan-500 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-cyan-700">Conversions</span>
                </div>
                <p className="text-2xl font-bold text-cyan-900">{usageStatistics.withConversion}</p>
                <p className="text-xs text-cyan-600 mt-1">
                  With base unit
                </p>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="flex flex-wrap gap-3 mb-6 p-3 bg-muted/30 rounded-lg border">
              <span className="text-sm font-medium text-muted-foreground">By Category:</span>
              <Badge variant="outline" className="bg-white">
                ⚖️ Weight: {usageStatistics.byCategory.weight}
              </Badge>
              <Badge variant="outline" className="bg-white">
                🧪 Volume: {usageStatistics.byCategory.volume}
              </Badge>
              <Badge variant="outline" className="bg-white">
                🔢 Count: {usageStatistics.byCategory.count}
              </Badge>
              {usageStatistics.byCategory.other > 0 && (
                <Badge variant="outline" className="bg-white">
                  📋 Other: {usageStatistics.byCategory.other}
                </Badge>
              )}
            </div>

            {/* Bulk Actions Bar */}
            {enableBulkOperations && selectedItems.length > 0 && (
              <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg mb-4">
                <span className="text-sm text-muted-foreground">
                  {selectedItems.length} items selected
                </span>
                <div className="flex-1" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkExport}
                  disabled={isLoading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate(true)}
                  disabled={isLoading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Set Active
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate(false)}
                  disabled={isLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Set Inactive
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            )}

            {/* Data Display */}
            {filteredUnits.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  {search || filterType !== 'all' || statusFilter !== 'all' ? (
                    <>
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No units found</h3>
                      <p>Try adjusting your search or filter criteria.</p>
                    </>
                  ) : (
                    <>
                      <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No units yet</h3>
                      <p>Get started by creating your first measurement unit.</p>
                      <Button className="mt-4" onClick={openCreateDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Unit
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <>
                {viewMode === 'table' ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Unit Code & Type</TableHead>
                        <TableHead>Name & Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUnits.map(renderTableRow)}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredUnits.map(renderCard)}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Unit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' && 'Create New Unit'}
              {dialogMode === 'edit' && 'Edit Unit'}
              {dialogMode === 'view' && 'View Unit Details'}
            </DialogTitle>
          </DialogHeader>
          <EnhancedUnitForm
            unit={selectedUnit || undefined}
            mode={dialogMode}
            onSuccess={dialogMode === 'create' ? handleCreateUnit : handleUpdateUnit}
            onCancel={closeDialog}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!unitToDelete} onOpenChange={() => setUnitToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Unit
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the unit <strong>{unitToDelete?.symbol} - {unitToDelete?.name}</strong>?
              This action cannot be undone and may affect related products and transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => unitToDelete && handleDeleteUnit(unitToDelete)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Unit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}