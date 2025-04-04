'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowDownUp, Filter, X } from "lucide-react"

interface FilterSortOptionsProps {
  onFilterChange: (filters: string[]) => void
  onSortChange: (sort: { field: string; order: 'asc' | 'desc' }) => void
}

export function FilterSortOptions({ onFilterChange, onSortChange }: FilterSortOptionsProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [sortField, setSortField] = useState<string>("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const filterOptions = [
    { label: "Status", options: ["Draft", "Posted", "Cancelled"] },
    { label: "Type", options: ["Stock In", "Stock Out"] },
    { label: "Location", options: ["Main Warehouse", "Store 1", "Store 2"] },
  ]

  const sortOptions = [
    { label: "Date", value: "date" },
    { label: "Adjustment #", value: "id" },
    { label: "Total Value", value: "totalValue" },
    { label: "Items Count", value: "items" },
  ]

  const handleFilterChange = (filter: string) => {
    const newFilters = activeFilters.includes(filter)
      ? activeFilters.filter(f => f !== filter)
      : [...activeFilters, filter]
    setActiveFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleSortChange = (field: string) => {
    const newOrder = field === sortField && sortOrder === "desc" ? "asc" : "desc"
    setSortField(field)
    setSortOrder(newOrder)
    onSortChange({ field, order: newOrder })
  }

  const clearFilters = () => {
    setActiveFilters([])
    onFilterChange([])
  }

  return (
    <div className="flex items-center gap-2">
      {/* Quick Sort Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <ArrowDownUp className="mr-2 h-4 w-4" />
            Sort by {sortOptions.find(opt => opt.value === sortField)?.label}
            {sortOrder === "desc" ? " (Newest)" : " (Oldest)"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className="flex items-center justify-between"
            >
              {option.label}
              {sortField === option.value && (
                <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Filters Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="mr-2 h-4 w-4" />
            Filter
            {activeFilters.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilters.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              {activeFilters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-auto p-0 text-muted-foreground"
                >
                  Clear all
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {filterOptions.map((filterGroup) => (
                <div key={filterGroup.label} className="space-y-2">
                  <Label>{filterGroup.label}</Label>
                  <div className="flex flex-wrap gap-2">
                    {filterGroup.options.map((option) => {
                      const isActive = activeFilters.includes(option)
                      return (
                        <Button
                          key={option}
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          className="h-7"
                          onClick={() => handleFilterChange(option)}
                        >
                          {option}
                          {isActive && (
                            <X className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
