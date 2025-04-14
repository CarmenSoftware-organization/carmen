'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Search, Download, Filter, ArrowUpDown, Plus, PlusCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const budgetData = [
  {
    location: "Front Office",
    category: "Computer",
    totalBudget: 20000.00,
    softCommitmentDeptHead: 1000.00,
    softCommitmentPO: 3000.00,
    hardCommitment: 2000.00,
    availableBudget: 14000.00,
    currentPRAmount: 15000.00,
    status: "Over Budget",
  },
  {
    location: "Accounting",
    category: "Computer",
    totalBudget: 20000.00,
    softCommitmentDeptHead: 0.00,
    softCommitmentPO: 0.00,
    hardCommitment: 0.00,
    availableBudget: 20000.00,
    currentPRAmount: 13000.00,
    status: "Within Budget",
  },
  {
    location: "HouseKeeping",
    category: "Computer",
    totalBudget: 20000.00,
    softCommitmentDeptHead: 0.00,
    softCommitmentPO: 0.00,
    hardCommitment: 0.00,
    availableBudget: 20000.00,
    currentPRAmount: 10000.00,
    status: "Within Budget",
  },
]

export function ResponsiveBudgetScreen() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{ field: string, direction: 'asc' | 'desc' } | null>(null)

  // Filter budget data based on search term
  const filteredData = budgetData.filter(item => 
    item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Sort budget data based on sort config
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0
    
    const aValue = a[sortConfig.field as keyof typeof a]
    const bValue = b[sortConfig.field as keyof typeof b]
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue)
    }
    
    return 0
  })

  const handleSort = (field: string) => {
    setSortConfig(prevConfig => {
      if (prevConfig?.field === field) {
        return { field, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { field, direction: 'asc' }
    })
  }

  const getSortIcon = (field: string) => {
    if (sortConfig?.field !== field) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />
    return sortConfig.direction === 'asc' 
      ? <ArrowUpDown className="h-4 w-4 ml-1 rotate-180" />
      : <ArrowUpDown className="h-4 w-4 ml-1" />
  }

  const renderSortableHeader = (field: string, label: string) => (
    <div 
      className="flex items-center cursor-pointer"
      onClick={() => handleSort(field)}
    >
      {label}
      {getSortIcon(field)}
    </div>
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const getBudgetStatusBadge = (status: string) => {
    if (status === "Over Budget") {
      return <Badge variant="destructive">{status}</Badge>
    }
    return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800 dark:text-green-100">{status}</Badge>
  }

  return (
    <Card className="bg-white dark:bg-gray-900 shadow-sm border-0">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-6">
          {/* Header with actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Budget Allocation</h2>
              <p className="text-sm text-muted-foreground">Manage budget allocation for purchase requests</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-[250px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search budgets..."
                  className="pl-9 h-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="h-9 px-2.5">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Budget
              </Button>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-semibold">{renderSortableHeader('location', 'Location')}</TableHead>
                    <TableHead className="font-semibold">{renderSortableHeader('category', 'Budget Category')}</TableHead>
                    <TableHead className="font-semibold text-right">{renderSortableHeader('totalBudget', 'Total Budget')}</TableHead>
                    <TableHead className="font-semibold text-right" colSpan={2}>
                      <div className="text-right">Soft Commitment</div>
                      <div className="grid grid-cols-2 text-xs font-medium mt-1">
                        <div className="text-right pr-2">Dept. Head</div>
                        <div className="text-right">PO</div>
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-right">{renderSortableHeader('hardCommitment', 'Hard Commitment')}</TableHead>
                    <TableHead className="font-semibold text-right">{renderSortableHeader('availableBudget', 'Available Budget')}</TableHead>
                    <TableHead className="font-semibold text-right">{renderSortableHeader('currentPRAmount', 'Current PR Amount')}</TableHead>
                    <TableHead className="font-semibold text-center">{renderSortableHeader('status', 'Status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Search className="h-8 w-8 mb-2 opacity-50" />
                          <p>No budget items match your search</p>
                          {searchTerm && (
                            <Button 
                              variant="link" 
                              onClick={() => setSearchTerm("")}
                              className="mt-2"
                            >
                              Clear search
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedData.map((row, index) => (
                      <TableRow key={index} className="hover:bg-muted/20 group transition-colors">
                        <TableCell className="font-medium">{row.location}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(row.totalBudget)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.softCommitmentDeptHead)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.softCommitmentPO)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.hardCommitment)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(row.availableBudget)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(row.currentPRAmount)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            {getBudgetStatusBadge(row.status)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {sortedData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mb-2 opacity-50" />
                <p>No budget items match your search</p>
                {searchTerm && (
                  <Button 
                    variant="link" 
                    onClick={() => setSearchTerm("")}
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              sortedData.map((row, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="bg-muted/30 py-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-medium">{row.location}</CardTitle>
                      {getBudgetStatusBadge(row.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{row.category}</p>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-y-2">
                      <div className="text-sm font-medium text-muted-foreground">Total Budget:</div>
                      <div className="text-sm font-medium text-right">{formatCurrency(row.totalBudget)}</div>
                      
                      <div className="text-sm font-medium text-muted-foreground">Soft Commitment (Dept Head):</div>
                      <div className="text-sm text-right">{formatCurrency(row.softCommitmentDeptHead)}</div>
                      
                      <div className="text-sm font-medium text-muted-foreground">Soft Commitment (PO):</div>
                      <div className="text-sm text-right">{formatCurrency(row.softCommitmentPO)}</div>
                      
                      <div className="text-sm font-medium text-muted-foreground">Hard Commitment:</div>
                      <div className="text-sm text-right">{formatCurrency(row.hardCommitment)}</div>
                      
                      <div className="text-sm font-medium text-muted-foreground border-t pt-2 mt-1">Available Budget:</div>
                      <div className="text-sm font-bold text-right border-t pt-2 mt-1">{formatCurrency(row.availableBudget)}</div>
                      
                      <div className="text-sm font-medium text-muted-foreground">Current PR Amount:</div>
                      <div className="text-sm font-bold text-right">{formatCurrency(row.currentPRAmount)}</div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Budget Summary */}
          <Card className="bg-muted/20 border border-muted/30">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                <div className="text-sm text-muted-foreground">
                  Total budget allocation for this purchase request:
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Request</p>
                    <p className="text-base font-semibold">{formatCurrency(38000)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Available</p>
                    <p className="text-base font-semibold">{formatCurrency(54000)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className="text-base font-semibold">{formatCurrency(16000)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800 dark:text-green-100">Within Budget</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}