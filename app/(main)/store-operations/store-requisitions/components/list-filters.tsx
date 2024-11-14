'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { ChevronDown, ArrowUpDown, SlidersHorizontal } from 'lucide-react'
import { FilterBuilder } from './filter-builder'
import { FilterCondition } from '../types/index'

interface ListFiltersProps {
  statusFilter: string
  setStatusFilter: (value: string) => void
  sortBy: string
  onSort: (column: string) => void
  filters: FilterCondition[]
  setFilters: React.Dispatch<React.SetStateAction<FilterCondition[]>>
}

export function ListFilters({
  statusFilter,
  setStatusFilter,
  sortBy,
  onSort,
  filters,
  setFilters
}: ListFiltersProps) {
  return (
    <div className="sm:col-span-7 flex justify-end gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[150px] justify-between">
            {statusFilter === 'all' ? 'All Status' : statusFilter}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[150px]">
          <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
            <DropdownMenuRadioItem value="all">All Status</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="draft">Draft</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="in-process">In Process</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="complete">Complete</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="reject">Reject</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="void">Void</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[180px] justify-between">
            <ArrowUpDown className="ml-2 h-4 w-4" />
            Sort by: {sortBy}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[150px]">
          <DropdownMenuRadioGroup value={sortBy} onValueChange={onSort}>
            {/* ... sort options ... */}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-[150px] flex items-center justify-between"
          >
            <SlidersHorizontal className="h-4 w-4" />
            More filters
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filter Requisitions
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <FilterBuilder filters={filters} setFilters={setFilters} />
          </div>
          <Button onClick={() => console.log('Applying filters:', filters)}>
            Apply Filters
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
} 