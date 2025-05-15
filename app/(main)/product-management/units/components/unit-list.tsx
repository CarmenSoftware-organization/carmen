"use client"

import { useState } from "react"
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
  MoreVertical,
  List,
  LayoutGrid
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
import ListPageTemplate from "@/components/templates/ListPageTemplate"
import { Card } from "@/components/ui/card"
import StatusBadge from "@/components/ui/custom-status-badge"
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
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
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
    
    return matchesSearch && matchesType
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

  const actionButtons = (
    <Button onClick={() => setIsCreateDialogOpen(true)}>
      <Plus className="h-4 w-4 mr-2" />
      Add Unit
    </Button>
  )

  const filters = (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="w-full sm:w-1/2 flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search units..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={filterType}
          onValueChange={setFilterType}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="INVENTORY">Inventory</SelectItem>
            <SelectItem value="ORDER">Order</SelectItem>
            <SelectItem value="RECIPE">Recipe</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex border rounded-md overflow-hidden">
        <Button
          variant={viewMode === 'table' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('table')}
          className="rounded-none h-8 px-2"
        >
          <List className="h-4 w-4" />
          <span className="sr-only">Table View</span>
        </Button>
        <Button
          variant={viewMode === 'card' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('card')}
          className="rounded-none h-8 px-2"
        >
          <LayoutGrid className="h-4 w-4" />
          <span className="sr-only">Card View</span>
        </Button>
      </div>
    </div>
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
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-primary">{unit.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{unit.code}</p>
                  </div>
                </div>
                <StatusBadge status={unit.isActive ? "Active" : "Inactive"} />
              </div>
            </div>
            
            {/* Card Content */}
            <div className="p-5 flex-grow">
              <div className="mb-4">
                <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                <p className="text-sm line-clamp-2">{unit.description || 'No description available'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Type</p>
                  <p className="text-sm font-medium">{unit.type}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Last Updated</p>
                  <p className="text-sm font-medium">
                    {unit.updatedAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Card Actions */}
            <div className="flex justify-end px-4 py-3 bg-muted/20 border-t space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedUnit(unit)}
                className="h-8 w-8 rounded-full"
              >
                <FileText className="h-4 w-4" />
                <span className="sr-only">View Details</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedUnit(unit)}
                className="h-8 w-8 rounded-full"
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">More options</span>
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
                  <DropdownMenuSeparator />
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

  const content = (
    <div className="space-y-4">
      {selectedItems.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
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

      {viewMode === 'table' ? (
        <UnitTable
          units={filteredUnits}
          onEdit={setSelectedUnit}
          selectedItems={selectedItems}
          onSelectItems={handleSelectItems}
        />
      ) : (
        renderCardView()
      )}
    </div>
  )

  return (
    <>
      <ListPageTemplate
        title="Units"
        actionButtons={actionButtons}
        filters={filters}
        content={content}
      />

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