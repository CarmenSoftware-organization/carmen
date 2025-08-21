"use client"

import { useState } from "react"
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
  Copy
} from "lucide-react"
import { UnitTable } from "./unit-table"
import { UnitForm } from "./unit-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { mockUnits } from "../data/mock-units"
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

export interface Unit {
  id: string
  code: string
  name: string
  description?: string
  type: 'INVENTORY' | 'ORDER' | 'RECIPE'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export function UnitList() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')

  // Use mock data
  const units = mockUnits

  const filteredUnits = units.filter((unit) => {
    const matchesSearch = 
      unit.code.toLowerCase().includes(search.toLowerCase()) ||
      unit.name.toLowerCase().includes(search.toLowerCase()) ||
      unit.description?.toLowerCase().includes(search.toLowerCase())
    
    const matchesType = filterType === "all" || unit.type === filterType
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && unit.isActive) || 
      (statusFilter === "inactive" && !unit.isActive)
    
    return matchesSearch && matchesType && matchesStatus
  })

  const handleSelectItems = (itemIds: string[]) => {
    setSelectedItems(itemIds)
  }

  const handleBulkDelete = () => {
    console.log('Delete items:', selectedItems)
    setSelectedItems([])
  }

  const handleBulkStatusUpdate = (status: boolean) => {
    console.log('Update status:', status, 'for items:', selectedItems)
    setSelectedItems([])
  }

  const handleBulkExport = () => {
    console.log('Export items:', selectedItems)
  }

  const handleAddUnit = () => {
    setIsCreateDialogOpen(true)
  }

  const handleAddFilters = () => {
    console.log('Add filters functionality')
  }

  const handleSavedFilters = () => {
    console.log('Saved filters functionality')
  }

  const renderTableView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Unit Code</TableHead>
          <TableHead>Unit Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredUnits.map((unit) => (
          <TableRow key={unit.id} className="hover:bg-muted/50">
            <TableCell className="font-medium">{unit.code}</TableCell>
            <TableCell>{unit.name}</TableCell>
            <TableCell>
              <Badge variant="outline" className="text-xs">
                {unit.type}
              </Badge>
            </TableCell>
            <TableCell className="max-w-[200px] truncate">
              {unit.description || 'No description'}
            </TableCell>
            <TableCell>
              <Badge 
                className={`text-xs px-2 py-1 ${
                  unit.isActive 
                    ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {unit.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedUnit(unit)}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedUnit(unit)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {filteredUnits.map((unit) => (
        <Card 
          key={unit.id} 
          className="overflow-hidden hover:bg-secondary/10 transition-colors h-full shadow-sm"
        >
          <div className="flex flex-col h-full">
            {/* Card Header */}
            <div className="p-5 pb-3 bg-muted/30 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-primary">{unit.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{unit.code}</p>
                </div>
                <Badge 
                  className={`text-xs px-2 py-1 ${
                    unit.isActive 
                      ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {unit.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            
            {/* Card Content */}
            <div className="p-5 flex-grow">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Type</p>
                  <Badge variant="outline" className="text-xs">
                    {unit.type}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm line-clamp-2">{unit.description || 'No description available'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Last Updated</p>
                  <p className="text-sm">{unit.updatedAt.toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            {/* Card Actions */}
            <div className="flex justify-end px-4 py-3 bg-muted/20 border-t">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedUnit(unit)}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedUnit(unit)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      ))}
    </div>
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
                <CardTitle className="text-2xl font-bold text-gray-900">Unit Management</CardTitle>
                <div className="text-sm text-gray-600">Manage measurement units and conversions</div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button size="sm" onClick={handleAddUnit} className="bg-blue-600 hover:bg-blue-700">
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
                      placeholder="Search units..."
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="INVENTORY">Inventory</SelectItem>
                      <SelectItem value="ORDER">Order</SelectItem>
                      <SelectItem value="RECIPE">Recipe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right Side - Action Buttons and View Toggle */}
              <div className="flex gap-2 items-center">
                <Button variant="outline" size="sm" onClick={handleSavedFilters}>
                  Saved Filters
                </Button>

                <Button variant="outline" size="sm" onClick={handleAddFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Add Filters
                </Button>

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
            {/* Bulk Actions Bar */}
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg mb-4">
                <span className="text-sm text-muted-foreground">
                  {selectedItems.length} items selected
                </span>
                <div className="flex-1" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkExport}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate(true)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Set Active
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate(false)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Set Inactive
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            )}

            {/* Data Display */}
            {viewMode === 'table' ? renderTableView() : renderCardView()}
          </CardContent>
        </Card>
      </div>

      {/* Create Unit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Unit</DialogTitle>
          </DialogHeader>
          <UnitForm
            onSuccess={(data) => {
              console.log('Created:', data)
              setIsCreateDialogOpen(false)
            }}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Unit Dialog */}
      <Dialog open={!!selectedUnit} onOpenChange={() => setSelectedUnit(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Unit</DialogTitle>
          </DialogHeader>
          {selectedUnit && (
            <UnitForm
              unit={selectedUnit}
              onSuccess={(data) => {
                console.log('Updated:', data)
                setSelectedUnit(null)
              }}
              onCancel={() => setSelectedUnit(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}