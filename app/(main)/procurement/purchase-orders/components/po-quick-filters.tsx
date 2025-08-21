"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface QuickFiltersProps {
  onQuickFilter: (filter: QuickFilterOption) => void
  activeFilter: QuickFilterOption | null
}

export interface QuickFilterOption {
  type: 'status' | 'delivery-date'
  value: string
  label: string
}

export function POQuickFilters({ onQuickFilter, activeFilter }: QuickFiltersProps) {
  // Purchase Order specific status options
  const statusOptions = [
    { value: 'all-status', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'open', label: 'Open' },
    { value: 'sent', label: 'Sent' },
    { value: 'partial-received', label: 'Partial Received' },
    { value: 'received', label: 'Received' },
    { value: 'closed', label: 'Closed' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  // Delivery date options for filtering
  const deliveryDateOptions = [
    { value: 'all-delivery-date', label: 'All Delivery Dates' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'due-today', label: 'Due Today' },
    { value: 'due-this-week', label: 'Due This Week' },
    { value: 'due-next-week', label: 'Due Next Week' },
    { value: 'due-this-month', label: 'Due This Month' },
  ]

  return (
    <div className="flex items-center space-x-2">
      {/* Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            {activeFilter?.type === 'status' ? activeFilter.label : 'All Status'}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          {statusOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onQuickFilter({ type: 'status', value: option.value, label: option.label })}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delivery Date Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            {activeFilter?.type === 'delivery-date' ? activeFilter.label : 'All Delivery Dates'}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          {deliveryDateOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onQuickFilter({ type: 'delivery-date', value: option.value, label: option.label })}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}