"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import StatusBadge from "@/components/ui/custom-status-badge"
import { PurchaseRequest, PurchaseRequestItem } from "@/lib/types"
import { format } from "date-fns"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
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
  ChevronRight
} from "lucide-react"

interface FieldConfig {
  label: string
  field: keyof PurchaseRequest | 'requestor.name'
  format?: (value: string | number | Date | PurchaseRequestItem[] | { name: string; id: string; department: string } | undefined) => string
}

interface FilterOption {
  label: string
  value: string
}

interface PRListTemplateProps {
  title: string
  description?: string
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
}

export function PRListTemplate({
  title,
  description,
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
}: PRListTemplateProps) {
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = data.slice(startIndex, endIndex)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{title}</h1>
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
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
          <div className="flex flex-wrap gap-2">
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
          </div>
        </div>
      </div>

      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customActions}
        </div>
      )}

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/75">
              <TableHead className="w-[50px] py-3">
                <Checkbox
                  checked={selectedItems.length === currentData.length}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
              {fieldConfigs.map((config) => (
                <TableHead key={config.label}>{config.label}</TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={(checked) => onSelectItem(item.id)}
                  />
                </TableCell>
                {fieldConfigs.map((config) => (
                  <TableCell key={`${item.id}-${config.label}`}>
                    {config.format
                      ? config.format(
                          config.field === 'requestor.name'
                            ? item.requestor.name
                            : item[config.field]
                        )
                      : String(
                          config.field === 'requestor.name'
                            ? item.requestor.name
                            : item[config.field]
                        )}
                  </TableCell>
                ))}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(item.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(item.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of{" "}
          {data.length} entries
        </div>
        <div className="flex items-center gap-2">
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
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
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