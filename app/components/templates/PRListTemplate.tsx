'use client'

import React, { useState } from 'react'
import { ArrowUpDown } from 'lucide-react'
import { ListPageTemplate } from './ListPageTemplate'
import StatusBadge from '@/components/ui/custom-status-badge'
import { PurchaseRequest } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

export interface PRListTemplateProps {
  data: PurchaseRequest[]
  onCreateNew?: () => void
  onExport?: () => void
  onPrint?: () => void
  onSearch?: (term: string) => void
  renderFilters?: () => React.ReactNode
  renderBulkActions?: (selectedItems: string[]) => React.ReactNode
  onRowClick?: (id: string) => void
  title?: string
  selectedItems?: string[]
}

export function PRListTemplate({
  data,
  onCreateNew,
  onExport,
  onPrint,
  onSearch,
  renderFilters,
  renderBulkActions,
  onRowClick,
  title = "Purchase Requests",
  selectedItems: externalSelectedItems,
}: PRListTemplateProps) {
  const [internalSelectedItems, setInternalSelectedItems] = useState<string[]>([])
  const selectedItems = externalSelectedItems || internalSelectedItems

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setInternalSelectedItems(data.map(item => item.id))
    } else {
      setInternalSelectedItems([])
    }
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setInternalSelectedItems(prev => [...prev, id])
    } else {
      setInternalSelectedItems(prev => prev.filter(item => item !== id))
    }
  }

  return (
    <ListPageTemplate
      title={title}
      onCreateNew={onCreateNew}
      onExport={onExport}
      onPrint={onPrint}
      onSearch={onSearch}
      renderFilters={renderFilters}
      renderBulkActions={renderBulkActions}
      selectedItems={selectedItems}
      createButtonText="Create Request"
      searchPlaceholder="Search requests..."
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/75">
            <TableHead className="w-[50px] py-3">
              <input
                type="checkbox"
                checked={selectedItems.length === data.length && data.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300"
              />
            </TableHead>
            <TableHead className="py-3 font-medium text-gray-600">
              <div className="flex items-center gap-2">
                PR Number
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="py-3 font-medium text-gray-600">Title</TableHead>
            <TableHead className="py-3 font-medium text-gray-600">Requested By</TableHead>
            <TableHead className="py-3 font-medium text-gray-600">Department</TableHead>
            <TableHead className="py-3 font-medium text-gray-600">Status</TableHead>
            <TableHead className="py-3 font-medium text-gray-600 text-right">Total Amount</TableHead>
            <TableHead className="py-3 font-medium text-gray-600">Created Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow
              key={item.id}
              className="group hover:bg-gray-50/50 cursor-pointer"
              onClick={() => onRowClick?.(item.id)}
            >
              <TableCell className="w-[50px]" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                  className="rounded border-gray-300"
                />
              </TableCell>
              <TableCell className="font-medium">{item.refNumber}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>{item.requestor.name}</TableCell>
              <TableCell>{item.department}</TableCell>
              <TableCell>
                <StatusBadge status={item.status.toString()} />
              </TableCell>
              <TableCell className="text-right">
                ${item.totalAmount.toFixed(2)}
              </TableCell>
              <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ListPageTemplate>
  )
}
