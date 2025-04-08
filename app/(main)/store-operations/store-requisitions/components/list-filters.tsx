"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, ArrowUpDown, SlidersHorizontal } from 'lucide-react'
import { FilterBuilder } from './filter-builder'
import { FilterCondition } from '../types/index'
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

type StatusType = 'all' | 'draft' | 'in-process' | 'complete' | 'reject' | 'void'
type SortByType = 'date' | 'refNo' | 'status' | 'requestor' | 'department'

interface ListFiltersProps {
  statusFilter: StatusType
  setStatusFilter: (value: StatusType) => void
  sortBy: SortByType
  onSort: (column: SortByType) => void
  filters: FilterCondition[]
  setFilters: React.Dispatch<React.SetStateAction<FilterCondition[]>>
  onApplyFilters?: (filters: FilterCondition[]) => void
}

export function ListFilters({
  statusFilter,
  setStatusFilter,
  sortBy,
  onSort,
  filters,
  setFilters,
  onApplyFilters
}: ListFiltersProps): React.ReactNode {
  const handleApplyFilters = (): void => {
    onApplyFilters?.(filters)
  }

  const handleStatusChange = (value: string): void => {
    setStatusFilter(value as StatusType)
  }

  const handleSortChange = (value: string): void => {
    onSort(value as SortByType)
  }

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
          <DropdownMenuRadioGroup value={statusFilter} onValueChange={handleStatusChange}>
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
          <DropdownMenuRadioGroup value={sortBy} onValueChange={handleSortChange}>
            <DropdownMenuRadioItem value="date">Date</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="refNo">Reference No.</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="status">Status</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="requestor">Requestor</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="department">Department</DropdownMenuRadioItem>
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
          <Button onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
} 