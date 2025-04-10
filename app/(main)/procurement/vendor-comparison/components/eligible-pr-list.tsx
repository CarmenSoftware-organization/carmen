"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { PurchaseRequest, PurchaseRequestItem, Vendor } from "../types"
import { FilterOperator, FilterType } from "@/lib/utils/filter-storage"
import { AdvancedFilter } from "./advanced-filter"
import { Search } from "lucide-react"

// Mock data (simplified for the example)
// In a real application, this would come from an API
const mockItems: Partial<PurchaseRequestItem>[] = [
  {
    id: "item-001",
    name: "Fresh Vegetables",
    description: "Assorted seasonal vegetables",
    unit: "kg",
    quantityRequested: 50,
    price: 15.00,
    subTotalPrice: 750.00,
    status: "Pending",
  },
  {
    id: "item-002",
    name: "Premium Meat",
    description: "High-quality meat assortment",
    unit: "kg",
    quantityRequested: 25,
    price: 30.00,
    subTotalPrice: 750.00,
    status: "Pending",
  },
  {
    id: "item-003",
    name: "Seafood Selection",
    description: "Fresh seafood variety",
    unit: "kg",
    quantityRequested: 15,
    price: 40.00,
    subTotalPrice: 600.00,
    status: "Pending",
  }
]

const mockPurchaseRequests: PurchaseRequest[] = [
  {
    id: "pr-001",
    number: "PR-2023-001",
    date: new Date("2023-10-15"),
    department: "Kitchen",
    total: 1500.00,
    status: "Pending",
    items: mockItems as PurchaseRequestItem[]
  },
  {
    id: "pr-002",
    number: "PR-2023-002",
    date: new Date("2023-10-20"),
    department: "Bar",
    total: 850.00,
    status: "Approved",
    items: mockItems.slice(0, 2) as PurchaseRequestItem[]
  },
  {
    id: "pr-003",
    number: "PR-2023-003",
    date: new Date("2023-10-25"),
    department: "Housekeeping",
    total: 600.00,
    status: "In-progress",
    items: mockItems.slice(1, 3) as PurchaseRequestItem[]
  }
]

const mockVendors: Vendor[] = [
  {
    id: "vendor-001",
    name: "Premium Supplies Co.",
    price: 1450.00,
    leadTime: "3-5 days",
    leadTimeDays: 4,
    rating: 4.5,
    reliability: 92,
    paymentTerms: "Net 30"
  },
  {
    id: "vendor-002",
    name: "Quality Foods Inc.",
    price: 1550.00,
    leadTime: "2-3 days",
    leadTimeDays: 2.5,
    rating: 4.7,
    reliability: 95,
    paymentTerms: "Net 15"
  },
  {
    id: "vendor-003",
    name: "Global Restaurant Supply",
    price: 1400.00,
    leadTime: "4-6 days",
    leadTimeDays: 5,
    rating: 4.2,
    reliability: 90,
    paymentTerms: "Net 45"
  }
]

export function EligiblePRList() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string | null>("all")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [advancedFilters, setAdvancedFilters] = useState<FilterType<PurchaseRequest>[]>([])

  // Get unique list of departments for the filter dropdown
  const departments = Array.from(new Set(mockPurchaseRequests.map(pr => pr.department)))

  // Apply filters to purchase requests
  const filteredPRs = useMemo(() => {
    return mockPurchaseRequests.filter(pr => {
      // Search query filter
      const matchesSearch = pr.number.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           pr.department.toLowerCase().includes(searchQuery.toLowerCase())
      
      // Date range filter
      const prDate = pr.date
      if (startDate && prDate < startDate) {
        return false
      }
      if (endDate) {
        const endOfDay = new Date(endDate)
        endOfDay.setHours(23, 59, 59, 999)
        if (prDate > endOfDay) {
          return false
        }
      }
      
      // Department filter
      const matchesDepartment = selectedDepartment === "all" || 
                               pr.department === selectedDepartment
      
      // Status filter
      const matchesStatus = selectedStatus === "all" || 
                           pr.status === selectedStatus

      // Advanced filters
      let passesAdvancedFilters = true
      if (advancedFilters.length > 0) {
        passesAdvancedFilters = advancedFilters.every(filter => {
          const fieldName = filter.field as keyof PurchaseRequest
          const fieldValue = pr[fieldName]
          
          switch (filter.operator) {
            case 'equals':
              if (typeof fieldValue === 'string') {
                return fieldValue.toLowerCase() === String(filter.value).toLowerCase()
              }
              if (typeof fieldValue === 'number') {
                return fieldValue === Number(filter.value)
              }
              if (fieldValue instanceof Date && filter.value) {
                const filterDate = new Date(filter.value as string)
                return fieldValue.getTime() === filterDate.getTime()
              }
              return false
            
            case 'contains':
              if (typeof fieldValue === 'string') {
                return fieldValue.toLowerCase().includes(String(filter.value).toLowerCase())
              }
              return false
            
            case 'startsWith':
              if (typeof fieldValue === 'string') {
                return fieldValue.toLowerCase().startsWith(String(filter.value).toLowerCase())
              }
              return false
              
            case 'greaterThan':
              if (typeof fieldValue === 'number') {
                return fieldValue > Number(filter.value)
              }
              if (fieldValue instanceof Date && filter.value) {
                const filterDate = new Date(filter.value as string)
                return fieldValue > filterDate
              }
              return false
              
            case 'lessThan':
              if (typeof fieldValue === 'number') {
                return fieldValue < Number(filter.value)
              }
              if (fieldValue instanceof Date && filter.value) {
                const filterDate = new Date(filter.value as string)
                return fieldValue < filterDate
              }
              return false
            
            default:
              return true
          }
        })
      }
      
      return matchesSearch && matchesDepartment && matchesStatus && passesAdvancedFilters
    })
  }, [searchQuery, selectedDepartment, selectedStatus, startDate, endDate, advancedFilters])

  // Handle clicking on a PR row to navigate to the detail page
  const handleRowClick = (prId: string) => {
    router.push(`/procurement/vendor-comparison/${prId}`)
  }

  // Apply advanced filters
  const handleApplyAdvancedFilters = (filters: FilterType<PurchaseRequest>[]) => {
    setAdvancedFilters(filters)
  }

  // Clear advanced filters
  const handleClearAdvancedFilters = () => {
    setAdvancedFilters([])
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("")
    setSelectedDepartment("all")
    setSelectedStatus("all")
    setStartDate(undefined)
    setEndDate(undefined)
    setAdvancedFilters([])
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Approved":
        return "default"
      case "In-progress":
        return "secondary"
      case "Pending":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle>Eligible Purchase Requests</CardTitle>
        <CardDescription>
          Select a purchase request to compare vendor options
        </CardDescription>
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:items-center pt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search PR number or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 max-w-xs"
            />
          </div>
          <div className="flex items-center space-x-2">
            <DatePicker
              date={startDate}
              setDate={setStartDate}
              placeholder="Start date"
              className="w-[150px]"
            />
            <DatePicker
              date={endDate}
              setDate={setEndDate}
              placeholder="End date"
              className="w-[150px]"
            />
          </div>
          <div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Select 
              value={selectedStatus || "all"} 
              onValueChange={(value) => setSelectedStatus(value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="In-progress">In Progress</SelectItem>
              </SelectContent>
            </Select>
            <AdvancedFilter 
              onApplyFilters={handleApplyAdvancedFilters}
              onClearFilters={handleClearAdvancedFilters}
            />
            <Button variant="outline" onClick={resetFilters} className="ml-2">
              Reset All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PR Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPRs.length > 0 ? (
                filteredPRs.map((pr) => (
                  <TableRow 
                    key={pr.id} 
                    onClick={() => handleRowClick(pr.id)}
                    className="cursor-pointer hover:bg-muted"
                  >
                    <TableCell className="font-medium">{pr.number}</TableCell>
                    <TableCell>{format(pr.date, 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{pr.department}</TableCell>
                    <TableCell className="text-right">${pr.total.toFixed(2)}</TableCell>
                    <TableCell>{pr.items.length}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(pr.status)}>
                        {pr.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No purchase requests match your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
