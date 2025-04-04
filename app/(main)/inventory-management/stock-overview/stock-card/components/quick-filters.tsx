'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, ChevronsUpDown } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useCallback } from "react"

interface QuickFilterOption {
  value: string
  label: string
}

interface QuickFiltersProps {
  filterOptions: QuickFilterOption[]
  selectedFilters: string[]
  onFilterChange: (value: string[]) => void
}

export function QuickFilters({
  filterOptions,
  selectedFilters,
  onFilterChange,
}: QuickFiltersProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = useCallback((currentValue: string) => {
    setOpen(false)
    let updatedFilters: string[]
    
    if (selectedFilters.includes(currentValue)) {
      updatedFilters = selectedFilters.filter((item) => item !== currentValue)
    } else {
      updatedFilters = [...selectedFilters, currentValue]
    }
    
    onFilterChange(updatedFilters)
  }, [selectedFilters, onFilterChange])

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="justify-between w-[200px]"
              >
                {selectedFilters.length > 0
                  ? `${selectedFilters.length} selected`
                  : "Select filters"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search filters..." />
                <CommandEmpty>No filter found.</CommandEmpty>
                <ScrollArea className="h-[200px]">
                  <CommandGroup>
                    {filterOptions.map((filter) => (
                      <CommandItem
                        key={filter.value}
                        value={filter.value}
                        onSelect={handleSelect}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedFilters.includes(filter.value)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {filter.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </ScrollArea>
              </Command>
            </PopoverContent>
          </Popover>

          {selectedFilters.length > 0 && (
            <Button
              variant="ghost"
              onClick={() => onFilterChange([])}
              className="text-xs text-muted-foreground h-9"
            >
              Clear all
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 