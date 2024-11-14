'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Printer, Search } from 'lucide-react'

interface ListHeaderProps {
  searchTerm: string
  onSearchChange: (value: string) => void
}

export function ListHeader({ searchTerm, onSearchChange }: ListHeaderProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between w-full">
        <h2 className="text-2xl font-semibold">Store Requisition List</h2>
        <div className="flex items-center gap-2">
          <Button 
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Request
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>
      <div className="relative sm:col-span-5">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          className="pl-8 w-full"
          placeholder="Search requisitions..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search requisitions"
        />
      </div>
    </div>
  )
} 