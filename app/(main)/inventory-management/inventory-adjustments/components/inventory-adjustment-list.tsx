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
import StatusBadge  from "@/components/ui/custom-status-badge"


// Mock data - replace with actual API call
const mockAdjustments = [
  {
    id: "ADJ-2024-001",
    date: "2024-01-15",
    type: "IN",
    status: "Posted",
    location: "Main Warehouse",
    reason: "Physical Count Variance",
    items: 12,
    totalValue: 2845.50
  },
  {
    id: "ADJ-2024-002",
    date: "2024-01-16",
    type: "OUT",
    status: "Posted",
    location: "Main Warehouse",
    reason: "Damaged Goods",
    items: 3,
    totalValue: 567.80
  },
  {
    id: "ADJ-2024-003",
    date: "2024-01-17",
    type: "IN",
    status: "Posted",
    location: "Production Store",
    reason: "System Reconciliation",
    items: 8,
    totalValue: 1234.60
  },
  {
    id: "ADJ-2024-004",
    date: "2024-01-18",
    type: "OUT",
    status: "Draft",
    location: "Main Warehouse",
    reason: "Quality Control Rejection",
    items: 5,
    totalValue: 890.25
  },
  {
    id: "ADJ-2024-005",
    date: "2024-01-18",
    type: "IN",
    status: "Draft",
    location: "Production Store",
    reason: "Spot Check Variance",
    items: 4,
    totalValue: 445.75
  },
  {
    id: "ADJ-2024-006",
    date: "2024-01-19",
    type: "OUT",
    status: "Voided",
    location: "Main Warehouse",
    reason: "Expired Items",
    items: 15,
    totalValue: 3567.90
  },
  {
    id: "ADJ-2024-007",
    date: "2024-01-19",
    type: "IN",
    status: "Posted",
    location: "Production Store",
    reason: "Production Yield Variance",
    items: 6,
    totalValue: 789.30
  },
  {
    id: "ADJ-2024-008",
    date: "2024-01-20",
    type: "OUT",
    status: "Draft",
    location: "Main Warehouse",
    reason: "Theft/Loss",
    items: 2,
    totalValue: 234.50
  }
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
                  <StatusBadge status= {adjustment.type}/>
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
                  <StatusBadge status={adjustment.status} />
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
