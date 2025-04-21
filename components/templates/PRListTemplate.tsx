"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Plus,
  Download,
  Printer,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import StatusBadge from "@/components/ui/custom-status-badge"
import { PurchaseRequest } from "@/lib/types"

interface FieldConfig {
  label: string
  field: keyof PurchaseRequest | 'requestor.name'
  format?: (value: any) => string
}

interface FilterOption {
  label: string
  value: string
}

interface PRListTemplateProps {
  title: string
  data: PurchaseRequest[]
  selectedItems: string[]
  currentPage: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onSearch: (term: string) => void
  onTypeChange: (type: string) => void
  onStatusChange: (status: string) => void
  onSelectItem: (id: string) => void
  onSelectAll: (checked: boolean) => void
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onCreateNew: () => void
  typeOptions: FilterOption[]
  statusOptions: FilterOption[]
  fieldConfigs: FieldConfig[]
  advancedFilter?: React.ReactNode
  customActions?: React.ReactNode
  viewToggle?: React.ReactNode
  viewMode: 'table' | 'card'
  tableView?: React.ReactNode
  cardView?: React.ReactNode
}

export function PRListTemplate({
  title,
  data,
  selectedItems,
  currentPage,
  itemsPerPage,
  onPageChange,
  onSearch,
  onTypeChange,
  onStatusChange,
  onSelectItem,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
  onCreateNew,
  typeOptions,
  statusOptions,
  fieldConfigs,
  advancedFilter,
  customActions,
  viewToggle,
  viewMode,
  tableView,
  cardView,
}: PRListTemplateProps) {
  const router = useRouter()
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = data.slice(startIndex, endIndex)

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex items-center gap-2">
          <Button onClick={onCreateNew} className="group">
            <Plus className="mr-2 h-4 w-4" /> New Purchase Request
          </Button>
          <Button variant="outline" className="group">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button variant="outline" className="group">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-1/2 flex space-x-2">
          <Input
            placeholder="Search PRs..."
            className="w-full"
            onChange={(e) => onSearch(e.target.value)}
          />
          <Button variant="secondary" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Type
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {typeOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onSelect={() => onTypeChange(option.value)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Status
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {statusOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onSelect={() => onStatusChange(option.value)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {advancedFilter}
          {viewToggle}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customActions}
        </div>
      )}

      {/* List Content */}
      {viewMode === 'table' ? (
        tableView
      ) : (
        cardView
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} results
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 