"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FilterCriteria } from "../types"
import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface QuickFiltersProps {
  onFilterChange?: (filters: Partial<FilterCriteria>) => void
}

export function QuickFilters({ onFilterChange }: QuickFiltersProps) {
  const [filters, setFilters] = useState<Partial<FilterCriteria>>({})

  const handleFilterChange = (key: keyof FilterCriteria, value: FilterCriteria[keyof FilterCriteria]) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  return (
    <div className="space-y-4 bg-white rounded-lg shadow-sm border p-4">
      {/* Search and Quick Actions */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search items..." 
            className="pl-9 bg-muted/30"
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>
        <Button variant="secondary" className="shrink-0">Advanced Filters</Button>
      </div>

      {/* Main Filters */}
      <div className="flex flex-wrap gap-4">
        <Select
          onValueChange={(value) => handleFilterChange("locations", [value])}
        >
          <SelectTrigger className="w-[200px] bg-white">
            <SelectValue placeholder="Select Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="warehouse">Warehouse</SelectItem>
            <SelectItem value="store">Store</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => handleFilterChange("itemStatus", value)}
        >
          <SelectTrigger className="w-[200px] bg-white">
            <SelectValue placeholder="Item Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => handleFilterChange("stockStatus", value)}
        >
          <SelectTrigger className="w-[200px] bg-white">
            <SelectValue placeholder="Stock Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="IN_STOCK">In Stock</SelectItem>
            <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
            <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
            <SelectItem value="EXCESS_STOCK">Excess Stock</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          variant="outline" 
          onClick={() => {
            setFilters({})
            onFilterChange?.({})
          }}
          className="shrink-0"
        >
          Reset Filters
        </Button>
      </div>

      {/* Quick Status Filters */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
        <span className="text-sm font-medium text-muted-foreground mr-2">Quick Filters:</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFilterChange?.({ stockStatus: "OUT_OF_STOCK" })}
          className="bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300"
        >
          Out of Stock
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFilterChange?.({ stockStatus: "LOW_STOCK" })}
          className="bg-yellow-50 border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300"
        >
          Low Stock
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFilterChange?.({ stockStatus: "IN_STOCK" })}
          className="bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300"
        >
          In Stock
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFilterChange?.({ stockStatus: "EXCESS_STOCK" })}
          className="bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
        >
          Excess Stock
        </Button>
      </div>
    </div>
  )
} 