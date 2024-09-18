// File: tabs/ItemsTab.tsx
import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox} from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit2Icon, Trash2Icon, InfoIcon, ImageIcon, MessageSquareIcon, Split, Plus, CheckCircle, XCircle, RotateCcw, ArrowUpDown, Download, Printer } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

import { Eye, Edit, X } from 'lucide-react'
import { ItemDetailsEditForm } from '../item-details-edit-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Item {
  id: string,
  location: string,
  product: string,
  comment: string,
  unit: string,
  request: {
    quantity: number,
    ordering: number
  },
  approve: {
    quantity: number,
    onHand: number
  },
  currency: string,
  price: {
    current: number,
    last: number
  },
  total: number,
  status: string
}

const itemDetails: Item[] = [
  {
    id: '1',
    location: 'Food Store 1FB01',
    product: 'Pasta Fettucini brand Best 10100001',
    comment: 'need to use this with spec with this brand only',
    unit: 'Kgs',
    request: {
      quantity: 50000,
      ordering: 45000
    },
    approve: {
      quantity: 100000,
      onHand: 5000
    },
    currency: 'THB',
    price: {
      current: 19.80,
      last: 18.50
    },
    total: 990000.00,
    status: 'A'
  },
  {
    id: '2',
    location: 'Food Store 1FB01',
    product: 'Pasta Fettucini brand Best 10100001',
    comment: 'need to use this with spec with this brand only',
    unit: 'Kgs',
    request: {
      quantity: 50000,
      ordering: 48000
    },
    approve: {
      quantity: 100000,
      onHand: 2000
    },
    currency: 'THB',
    price: {
      current: 19.80,
      last: 18.50
    },
    total: 990000.00,
    status: 'R'
  }
]

export const ItemsTab: React.FC = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [items, setItems] = useState<Item[]>(itemDetails)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'view' | 'edit' | 'add'>('view')

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleSelectAllItems = () => {
    setSelectedItems(prev => 
      prev.length === items.length 
        ? [] 
        : items.map(item => item.id)
    )
  }

  const openItemForm = (item: Item | null, mode: 'view' | 'edit' | 'add') => {
    setSelectedItem(item)
    setFormMode(mode)
    setIsEditFormOpen(true)
  }

  const closeItemForm = () => {
    setSelectedItem(null)
    setIsEditFormOpen(false)
    setFormMode('view')
  }

  const handleSave = (formData: FormData) => {
    // Handle saving the form data
    console.log('Saving item:', formData)
    closeItemForm()
    // You would typically update the items state here with the new/updated item
  }

  const handleModeChange = (newMode: 'view' | 'edit' | 'add') => {
    setFormMode(newMode)
  }

  const handleBulkAction = (action: 'accept' | 'reject' | 'review') => {
    // Implement bulk action logic here
    console.log(`Bulk ${action} for items:`, selectedItems)
    // Update the items' status based on the action
    const updatedItems = items.map(item => 
      selectedItems.includes(item.id) 
        ? { ...item, status: action === 'accept' ? 'Approved' : action === 'reject' ? 'Rejected' : 'Under Review' }
        : item
    )
    setItems(updatedItems)
    setSelectedItems([])
  }

  const handleSplitItems = () => {
    // Implement split items logic here
    console.log('Splitting items:', selectedItems)
    // You would typically open a dialog or form to handle the split operation
  }

  return (
    <>
      <div>
        <Button onClick={() => openItemForm(null, 'add')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {selectedItems.length > 0 && (
        <div className="flex space-x-2 mt-4">
          <Button onClick={() => handleBulkAction('accept')}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Accept Selected
          </Button>
          <Button onClick={() => handleBulkAction('reject')}>
            <XCircle className="mr-2 h-4 w-4" />
            Reject Selected
          </Button>
          <Button onClick={() => handleBulkAction('review')}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Review Selected
          </Button>
          <Button onClick={handleSplitItems}>
            <Split className="mr-2 h-4 w-4" />
            Split Selected
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow className='h-6'>
            <TableHead className="w-[40px] h-fit align-center">
              <Checkbox 
                checked={selectedItems.length === items.length}
                onCheckedChange={handleSelectAllItems}
              />
            </TableHead>
            <TableHead className="align-center">Location</TableHead>
            <TableHead className="align-center">Product</TableHead>
            <TableHead className="align-center">Unit</TableHead>
            <TableHead className="text-xs flex-col gap-2 justify-between items-center"><div className='text-center'>Request</div><Separator /> <div className='text-center'>Ordering</div></TableHead>
            <TableHead className="text-xs flex-col gap-2 justify-between items-center"><div className='text-center'>Approve</div><Separator /><div className='text-nowrap text-center'>On Hand</div></TableHead>
            <TableHead className="align-center">Curr.</TableHead>
            <TableHead className="text-xs flex-col gap-2 justify-between items-center"><div className='text-center'>Price</div><Separator /><div className='text-nowrap text-center'>Last Price</div></TableHead>
            <TableHead className="align-center">Total</TableHead>
            <TableHead className="align-center">Status</TableHead>
            <TableHead className="text-right align-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((item) => (
            <React.Fragment key={item.id}>
              <TableRow>
                <TableCell>
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => handleSelectItem(item.id)}
                  />
                </TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>{item.product}</TableCell>
                <TableCell className='align-top'>{item.unit}</TableCell>
                <TableCell className="text-right align-top">
                  <div>{item.request.quantity.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{item.request.ordering.toLocaleString()}</div>
                </TableCell>
                <TableCell className="text-right align-top">
                  <div>{item.approve.quantity.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{item.approve.onHand.toLocaleString()}</div>
                </TableCell>
                <TableCell className='align-top'>{item.currency}</TableCell>
                <TableCell className="text-right align-top">
                  <div>{item.price.current.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{item.price.last.toFixed(2)}</div>
                </TableCell>
                <TableCell className="text-right align-top">{item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                <TableCell>
                  <Badge variant={item.status === 'A' ? 'secondary' : 'destructive'}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="icon" onClick={() => openItemForm(item, 'edit')}>
                      <Edit2Icon className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => openItemForm(item, 'view')}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow key={`${item.id}-comment`} className="bg-muted/50">
                <TableCell colSpan={11} className="py-2">
                  <div className="flex items-center space-x-2">
                    <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{item.comment}</span>
                  </div>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
        <DialogContent className="sm:max-w-[80vw] max-w-[80vw] p-0 border-none bg-transparent">
          <DialogHeader className="bg-background rounded-t-lg">
            <DialogTitle className="p-6">
              {formMode === 'add' ? 'Add New Item' : formMode === 'edit' ? 'Edit Item' : 'View Item'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={closeItemForm}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="bg-background rounded-b-lg">
            <ItemDetailsEditForm
              onSave={handleSave}
              onCancel={closeItemForm}
              initialData={selectedItem}
              mode={formMode}
              onModeChange={handleModeChange}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}