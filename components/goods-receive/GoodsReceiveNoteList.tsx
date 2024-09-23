'use client'
import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, Edit, Trash } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from 'next/navigation'
import { sampleGoodsReceiveNotes } from '@/lib/sample-data'
import { GoodsReceiveNote } from '@/lib/types/types'
import { Button } from '@/components/ui/button'

// Make sure these components are properly imported or implemented
import { FilterBuilder } from '@/components/FilterBuilder'
import { BulkActions } from '@/components/BulkActions'

export function GoodsReceiveNoteList() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [filters, setFilters] = useState<Array<{ field: string; value: string }>>([])

  // Implement search and filter logic here
  const filteredGRNs = sampleGoodsReceiveNotes.filter((grn: GoodsReceiveNote) => {
    const matchesSearch = 
      grn.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grn.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grn.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilters = filters.every(filter => 
      String(grn[filter.field as keyof GoodsReceiveNote]).toLowerCase().includes(filter.value.toLowerCase())
    )

    return matchesSearch && matchesFilters
  })

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on items:`, selectedItems);
    // Implement bulk action logic here
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleFilterChange = (newFilters: Array<{ field: string; value: string }>) => {
    setFilters(newFilters);
  };

  // Function to calculate total amount
  const calculateTotalAmount = (grn: GoodsReceiveNote) => {
    return grn.items.reduce((total, item) => total + item.netAmount, 0);
  };

  return (
    <div>
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-grow">
          <Input
            placeholder="Search goods receive notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <FilterBuilder
          fields={[
            { label: 'Reference Number', value: 'ref' },
            { label: 'Date', value: 'date' },
            { label: 'Vendor', value: 'vendor' },
            { label: 'Status', value: 'status' },
          ]}
          onFilterChange={handleFilterChange}
        />
      </div>

      <div className="mb-4">
        <BulkActions
          selectedItems={selectedItems}
          onAction={handleBulkAction}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedItems.length === filteredGRNs.length}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedItems(filteredGRNs.map(grn => grn.id))
                  } else {
                    setSelectedItems([])
                  }
                }}
              />
            </TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Ref.#</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Invoice#</TableHead>
            <TableHead>Invoice Date</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredGRNs.map((grn) => (
            <TableRow key={grn.id}>
              <TableCell>
                <Checkbox
                  checked={selectedItems.includes(grn.id)}
                  onCheckedChange={(checked) => toggleItemSelection(grn.id)}
                />
              </TableCell>
              <TableCell>{grn.date}</TableCell>
              <TableCell>{grn.description}</TableCell>
              <TableCell>{grn.ref}</TableCell>
              <TableCell>{grn.vendor}</TableCell>
              <TableCell>{grn.invoiceNumber}</TableCell>
              <TableCell>{grn.invoiceDate}</TableCell>
              <TableCell>{calculateTotalAmount(grn).toFixed(2)}</TableCell>
              <TableCell>{grn.status}</TableCell>
              <TableCell>
                <TooltipProvider>
                  <div className="flex space-x-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/procurement/goods-received-note/${grn.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/procurement/goods-received-note/${grn.id}/edit`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}