"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CheckCircle, Download, Plus, Search, Trash2, XCircle } from "lucide-react"
import { UnitTable } from "./unit-table"
import { UnitForm } from "./unit-form"
import { toast } from "sonner"
import { AdvancedFilter } from "@/components/ui/advanced-filter"
import { FilterType } from "@/lib/utils/filter-storage"
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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

// Mock data
const mockUnits: Unit[] = [
  {
    id: "1",
    code: "KG",
    name: "Kilogram",
    description: "Standard unit of mass",
    type: "INVENTORY",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2",
    code: "L",
    name: "Liter",
    description: "Standard unit of volume",
    type: "INVENTORY",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "3",
    code: "PC",
    name: "Piece",
    description: "Count unit",
    type: "ORDER",
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

export function UnitList() {
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [activeFilters, setActiveFilters] = useState<FilterType<Unit>[]>([])

  // Use mock data
  const units = mockUnits

  const filteredUnits = units.filter((unit) => {
    // Apply search filter
    const matchesSearch = 
      unit.code.toLowerCase().includes(search.toLowerCase()) ||
      unit.name.toLowerCase().includes(search.toLowerCase()) ||
      unit.description?.toLowerCase().includes(search.toLowerCase())
    
    // Apply type filter
    const matchesType = filterType === "all" || unit.type === filterType
    
    // Apply advanced filters
    const matchesAdvancedFilters = activeFilters.length === 0 || activeFilters.every(filter => {
      const field = filter.field;
      const value = filter.value;
      const operator = filter.operator;

      // Get the field value
      const fieldValue = unit[field as keyof Unit];

      // Handle undefined or null values
      if (fieldValue === undefined || fieldValue === null) {
        return false;
      }

      // Convert to string for comparison if not already a string
      const stringFieldValue = String(fieldValue).toLowerCase();
      const stringValue = String(value).toLowerCase();

      switch (operator) {
        case 'equals':
          return stringFieldValue === stringValue;
        case 'contains':
          return stringFieldValue.includes(stringValue);
        case 'startsWith':
          return stringFieldValue.startsWith(stringValue);
        case 'endsWith':
          return stringFieldValue.endsWith(stringValue);
        case 'greaterThan':
          return fieldValue > value;
        case 'lessThan':
          return fieldValue < value;
        default:
          return true;
      }
    });
    
    return matchesSearch && matchesType && matchesAdvancedFilters;
  });

  const totalPages = Math.ceil(filteredUnits.length / pageSize)
  
  const getCurrentPageData = () => {
    return filteredUnits.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    )
  }

  const handleSelectItems = (itemIds: string[]) => {
    setSelectedItems(itemIds)
  }

  const handleBulkDelete = () => {
    try {
      console.log('Delete items:', selectedItems)
      setSelectedItems([])
      toast.success("Selected units deleted successfully")
    } catch (error) {
      toast.error("Failed to delete selected units")
    }
  }

  const handleBulkStatusUpdate = (status: boolean) => {
    try {
      console.log('Update status:', status, 'for items:', selectedItems)
      setSelectedItems([])
      toast.success(`Units ${status ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      toast.error(`Failed to ${status ? 'activate' : 'deactivate'} units`)
    }
  }

  const handleBulkExport = () => {
    try {
      console.log('Export items:', selectedItems)
      toast.success("Units exported successfully")
    } catch (error) {
      toast.error("Failed to export units")
    }
  }

  const handleApplyFilters = (filters: FilterType<Unit>[]) => {
    try {
      setActiveFilters(filters);
      setCurrentPage(1);
      toast.success("Filters applied successfully")
    } catch (error) {
      console.error('Error applying filters:', error);
      toast.error("Failed to apply filters")
    }
  };

  const handleClearFilters = () => {
    try {
      setActiveFilters([]);
      toast.success("Filters cleared successfully")
    } catch (error) {
      console.error('Error clearing filters:', error);
      toast.error("Failed to clear filters")
    }
  };

  // Define filter fields for the advanced filter
  const filterFields = [
    { value: 'code' as keyof Unit, label: 'Code' },
    { value: 'name' as keyof Unit, label: 'Name' },
    { value: 'description' as keyof Unit, label: 'Description' },
    { value: 'type' as keyof Unit, label: 'Type' },
    { value: 'isActive' as keyof Unit, label: 'Status' },
    { value: 'createdAt' as keyof Unit, label: 'Created Date' },
    { value: 'updatedAt' as keyof Unit, label: 'Updated Date' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Units</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Unit
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="w-full sm:w-1/2 flex space-x-2">
            <div className="relative flex-1">
              <Input
                placeholder="Search units..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
              <Button variant="secondary" size="icon" className="absolute right-0 top-0">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={filterType}
              onValueChange={setFilterType}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="INVENTORY">Inventory</SelectItem>
                <SelectItem value="ORDER">Order</SelectItem>
                <SelectItem value="RECIPE">Recipe</SelectItem>
              </SelectContent>
            </Select>
            
            <AdvancedFilter<Unit>
              moduleName="unit-list"
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
              filterFields={filterFields}
            />
          </div>
        </div>

        {selectedItems.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap items-center gap-2 p-2 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground ml-2">
                {selectedItems.length} items selected
              </span>
              <div className="flex flex-wrap items-center gap-2 ml-0 sm:ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate(true)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Set Active
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate(false)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Set Inactive
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkExport}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Selected
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <UnitTable
          units={getCurrentPageData()}
          onEdit={setSelectedUnit}
          selectedItems={selectedItems}
          onSelectItems={handleSelectItems}
        />

        {/* Pagination */}
        {filteredUnits.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground text-center sm:text-left">
              Showing {filteredUnits.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0} to {Math.min(currentPage * pageSize, filteredUnits.length)} of {filteredUnits.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">First page</span>
                «
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Previous page</span>
                ‹
              </Button>
              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <span className="sr-only">Next page</span>
                ›
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <span className="sr-only">Last page</span>
                »
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Unit</DialogTitle>
          </DialogHeader>
          <UnitForm
            onSuccess={(data) => {
              console.log('Created:', data)
              setIsCreateDialogOpen(false)
              toast.success("Unit created successfully")
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
                toast.success("Unit updated successfully")
              }}
              onCancel={() => setSelectedUnit(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 