'use client'

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontalIcon, SearchIcon } from "lucide-react"
import { FilterSortOptions } from "./filter-sort-options"

// Mock data - replace with actual API call
const mockAdjustments = [
  {
    id: "ADJ-2024-001",
    date: "2024-01-15",
    type: "IN",
    status: "Draft",
    location: "Main Warehouse",
    reason: "Stock Count Adjustment",
    items: 5,
    totalValue: 1500.00
  },
  {
    id: "ADJ-2024-002",
    date: "2024-01-16",
    type: "OUT",
    status: "Posted",
    location: "Main Warehouse",
    reason: "Damage",
    items: 2,
    totalValue: 300.00
  },
  // Add more mock data as needed
]

export function InventoryAdjustmentList() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [sortConfig, setSortConfig] = useState({ field: "date", order: "desc" })

  const filteredAndSortedData = useMemo(() => {
    let filtered = mockAdjustments

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    // Apply filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter(item =>
        activeFilters.some(filter =>
          item.status === filter ||
          item.type === filter ||
          item.location === filter
        )
      )
    }

    // Apply sorting
    return [...filtered].sort((a: any, b: any) => {
      const aValue = a[sortConfig.field]
      const bValue = b[sortConfig.field]
      
      if (typeof aValue === 'string') {
        return sortConfig.order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      return sortConfig.order === 'asc'
        ? aValue - bValue
        : bValue - aValue
    })
  }, [mockAdjustments, searchQuery, activeFilters, sortConfig])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search adjustments..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <FilterSortOptions
          onFilterChange={setActiveFilters}
          onSortChange={setSortConfig}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Adjustment #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedData.map((adjustment) => (
              <TableRow key={adjustment.id}>
                <TableCell className="font-medium">
                  {adjustment.id}
                </TableCell>
                <TableCell>{adjustment.date}</TableCell>
                <TableCell>
                  <Badge variant={adjustment.type === 'IN' ? 'default' : 'destructive'}>
                    {adjustment.type}
                  </Badge>
                </TableCell>
                <TableCell>{adjustment.location}</TableCell>
                <TableCell>{adjustment.reason}</TableCell>
                <TableCell>{adjustment.items}</TableCell>
                <TableCell className="text-right">
                  {adjustment.totalValue.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  })}
                </TableCell>
                <TableCell>
                  <Badge variant={adjustment.status === 'Draft' ? 'secondary' : 'default'}>
                    {adjustment.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/inventory-management/inventory-adjustments/${adjustment.id}`)}
                      >
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
