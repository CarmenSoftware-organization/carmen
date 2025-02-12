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
import { CheckCircle, Download, Plus, Search, Trash2, XCircle } from "lucide-react"
import { UnitTable } from "./unit-table"
import { UnitForm } from "./unit-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { mockUnits } from "../data/mock-units"

export interface Unit {
  id: string
  code: string
  name: string
  description?: string
  type: 'INVENTORY' | 'ORDER' | 'RECIPE' | 'COUNTING'
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Units</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Unit
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center space-x-2">
          <div className="relative w-96">
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
              <SelectItem value="COUNTING">Counting</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedItems.length > 0 && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground ml-2">
              {selectedItems.length} items selected
            </span>
            <div className="flex items-center gap-2 ml-4">
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
                variant="outline"
                size="sm"
                onClick={handleBulkExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Selected
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
          </div>
        )}
      </div>

      <UnitTable
        units={filteredUnits}
        onEdit={setSelectedUnit}
        selectedItems={selectedItems}
        onSelectItems={handleSelectItems}
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
    </div>
  )
} 