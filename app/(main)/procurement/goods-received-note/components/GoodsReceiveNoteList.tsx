'use client'
import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, Edit, Trash } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from 'next/navigation'
import { GoodsReceiveNote } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { BulkActions } from '@/app/(main)/procurement/goods-received-note/components/BulkActions'
import StatusBadge from '@/components/ui/custom-status-badge'
import { Card, CardContent } from '@/components/ui/card'
import ListPageTemplate from '@/components/templates/ListPageTemplate'
import { mockGoodsReceiveNotes } from '@/lib/mock/mock_goodsReceiveNotes'

export function GoodsReceiveNoteList() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState('all')

  // Implement search and filter logic here
  const filteredGRNs = mockGoodsReceiveNotes.filter((grn: GoodsReceiveNote) => {
    const matchesSearch = 
      grn.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grn.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grn.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || grn.status === statusFilter

    return matchesSearch && matchesStatus
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

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredGRNs.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredGRNs.map(grn => grn.id));
    }
  };

  // Function to calculate total amount
  const calculateTotalAmount = (grn: GoodsReceiveNote) => {
    return grn.items.reduce((total, item) => total + item.netAmount, 0);
  };

  const title = 'Goods Receive Notes';
  const actionButtons = (
    <>
     <div className="flex space-x-2">
          <Button>New Goods Receive Note</Button>
          <Button variant="outline">Export</Button>
          <Button variant="outline">Print</Button>
        </div>
    </>
  );

  const bulkActions = (
    <>
    {selectedItems.length > 0 && (
        <div className="mb-4">
          <BulkActions
            selectedItems={selectedItems}
            onAction={handleBulkAction}
          />
        </div>
      )}

      <div className="mb-4 flex items-center">
        <Checkbox
          checked={selectedItems.length === filteredGRNs.length && filteredGRNs.length > 0}
          onCheckedChange={toggleSelectAll}
        />
        <span className="ml-2">Select All</span>
      </div>
    </>
  )

  const filter = (
    <>
     <div className="flex items-center space-x-4 mb-4">
        <div className="flex-grow">
          <Input
            placeholder="Search goods receive notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="border rounded p-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <Button variant="outline">More Filters</Button>
      </div>
    </>
  )

  const content = (
    <>
    <div className="space-y-4">
        {filteredGRNs.map((grn) => (
          <Card key={grn.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={selectedItems.includes(grn.id)}
                    onCheckedChange={(checked) => toggleItemSelection(grn.id)}
                  />
                  <StatusBadge status={grn.status} />
                  <div>
                    <h3 className="font-semibold">{grn.ref}</h3>
                    <p className="text-sm text-gray-500">{grn.description}</p>
                  </div>
                </div>
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
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p>{grn.date.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vendor</p>
                  <p>{grn.vendor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Invoice #</p>
                  <p>{grn.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Invoice Date</p>
                  <p>{grn.invoiceDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-semibold">${calculateTotalAmount(grn).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )

  return (

    <ListPageTemplate
    title={title}
    actionButtons={actionButtons}
    filters={filter}
    content={content}
    bulkActions={bulkActions}
    />


  )
}