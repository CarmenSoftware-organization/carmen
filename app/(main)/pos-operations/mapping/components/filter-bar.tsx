'use client'

import { useState } from "react"
import { X, Filter, Save, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface FilterOption {
  id: string
  label: string
  value: string
}

export interface FilterGroup {
  id: string
  label: string
  type: "single" | "multiple"
  options: FilterOption[]
}

export interface AppliedFilter {
  groupId: string
  filterId: string
  label: string
  value: string
}

interface FilterBarProps {
  filterGroups: FilterGroup[]
  appliedFilters: AppliedFilter[]
  onFilterChange: (filters: AppliedFilter[]) => void
  onSavePreset?: () => void
}

export function FilterBar({
  filterGroups,
  appliedFilters,
  onFilterChange,
  onSavePreset,
}: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleFilterAdd = (
    groupId: string,
    filterId: string,
    label: string,
    value: string
  ) => {
    // For single-select filters, remove any existing filter from this group
    const group = filterGroups.find((g) => g.id === groupId)
    let newFilters = [...appliedFilters]

    if (group?.type === "single") {
      newFilters = newFilters.filter((f) => f.groupId !== groupId)
    }

    // Check if this exact filter is already applied
    const filterExists = newFilters.some(
      (f) => f.groupId === groupId && f.filterId === filterId
    )

    if (!filterExists) {
      newFilters.push({
        groupId,
        filterId,
        label,
        value,
      })
      onFilterChange(newFilters)
    }
  }

  const handleFilterRemove = (index: number) => {
    const newFilters = [...appliedFilters]
    newFilters.splice(index, 1)
    onFilterChange(newFilters)
  }

  const clearAllFilters = () => {
    onFilterChange([])
  }

  return (
    <div className="mb-6 space-y-2">
      <div className="flex flex-wrap gap-2 items-center">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="mr-2 h-3.5 w-3.5" />
              Filters
              <ChevronDown className="ml-2 h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-0" align="start">
            <ScrollArea className="h-[300px]">
              {filterGroups.map((group) => (
                <div key={group.id} className="p-2">
                  <h3 className="font-medium text-sm mb-1">{group.label}</h3>
                  <div className="space-y-1">
                    {group.options.map((option) => (
                      <Button
                        key={option.id}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-sm h-7"
                        onClick={() =>
                          handleFilterAdd(
                            group.id,
                            option.id,
                            option.label,
                            option.value
                          )
                        }
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                  <Separator className="my-2" />
                </div>
              ))}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {onSavePreset && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Save className="mr-2 h-3.5 w-3.5" />
                Save
                <ChevronDown className="ml-2 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Save filter preset</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSavePreset}>
                Save current filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {appliedFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-muted-foreground"
            onClick={clearAllFilters}
          >
            Clear all
          </Button>
        )}
      </div>

      {appliedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {appliedFilters.map((filter, index) => (
            <div
              key={`${filter.groupId}-${filter.filterId}`}
              className="flex items-center bg-muted px-2 py-1 rounded-md text-sm"
            >
              <span className="mr-1 text-muted-foreground">
                {
                  filterGroups.find((g) => g.id === filter.groupId)?.label
                }:
              </span>
              <span className="font-medium">{filter.label}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 ml-1 text-muted-foreground hover:text-foreground"
                onClick={() => handleFilterRemove(index)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove filter</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 