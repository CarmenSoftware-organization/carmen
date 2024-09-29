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
import { PurchaseRequestItem } from '@/lib/types'
import StatusBadge from '@/components/ui/custom-status-badge'

const itemDetails: PurchaseRequestItem[] = [
  {
    id: '1',
    location: 'Warehouse A',
    name: 'Office Chair',
    description: 'Ergonomic office chair with lumbar support',
    unit: 'Piece',
    quantityRequested: 10,
    quantityApproved: 8,
    inventoryInfo: {
      onHand: 5,
      onOrdered: 15,
      lastPrice: 199.99,
      lastOrderDate: new Date('2023-05-15'),
      lastVendor: 'Office Supplies Co.',
      reorderLevel: 10,
      restockLevel: 20,
      averageMonthlyUsage: 7
    },
    currency: 'USD',
    price: 199.99,
    totalAmount: 1599.92,
    status: 'Accepted',
    taxRate: 0.08,
    taxAmount: 127.99,
    discountRate: 0.05,
    discountAmount: 79.99,
    netAmount: 1647.92,
    deliveryDate: new Date('2023-07-01'),
    deliveryPoint: 'Main Office',
    jobCode: 'OFF-2023',
    createdDate: new Date('2023-06-01'),
    updatedDate: new Date('2023-06-10'),
    createdBy: 'John Doe',
    updatedBy: 'Jane Smith',
    itemCategory: 'Furniture',
    itemSubcategory: 'Seating',
    vendor: 'Office Supplies Co.',
    pricelistNumber: 'PL-2023-06',
    comment: 'Urgent requirement for new hires',
    adjustment: false,
    currencyRate: 1,
    foc: 0,
    accountCode: 'FURN-1001',
  },
  {
    id: '2',
    location: 'Warehouse B',
    name: 'Laptop',
    description: 'High-performance laptop for developers',
    unit: 'Piece',
    quantityRequested: 5,
    quantityApproved: 4,
    inventoryInfo: {
      onHand: 2,
      onOrdered: 10,
      lastPrice: 1299.99,
      lastOrderDate: new Date('2023-04-20'),
      lastVendor: 'Tech Solutions Inc.',
      reorderLevel: 5,
      restockLevel: 15,
      averageMonthlyUsage: 3
    },
    currency: 'USD',
    price: 1299.99,
    totalAmount: 5199.96,
    status: 'Review',
    taxRate: 0.08,
    taxAmount: 415.99,
    discountRate: 0.1,
    discountAmount: 519.99,
    netAmount: 5095.96,
    deliveryDate: new Date('2023-07-15'),
    deliveryPoint: 'IT Department',
    jobCode: 'IT-2023',
    createdDate: new Date('2023-06-05'),
    updatedDate: new Date('2023-06-12'),
    createdBy: 'Alice Johnson',
    updatedBy: 'Bob Williams',
    itemCategory: 'Electronics',
    itemSubcategory: 'Computers',
    vendor: 'Tech Solutions Inc.',
    pricelistNumber: 'PL-2023-06-TECH',
    comment: 'Needed for new development team',
    adjustment: true,
    currencyRate: 1,
    foc: 0,
    accountCode: 'TECH-2001',
  }
  
]

export function ItemsTab() {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [items, setItems] = useState<PurchaseRequestItem[]>(itemDetails)
  const [selectedItem, setSelectedItem] = useState<PurchaseRequestItem | null>(null)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'view' | 'edit' | 'add'>('view')

  function handleSelectItem(itemId: string) {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  function handleSelectAllItems() {
    setSelectedItems(prev => 
      prev.length === items.length 
        ? [] 
        : items.map(item => item.id ?? '')
    )
  }

  function openItemForm(item: PurchaseRequestItem | null, mode: 'view' | 'edit' | 'add') {
    setSelectedItem(item)
    setFormMode(mode)
    setIsEditFormOpen(true)
  }

  function closeItemForm() {
    setSelectedItem(null)
    setIsEditFormOpen(false)
    setFormMode('view')
  }

  function handleSave(formData: FormData) {
    // Handle saving the form data
    console.log('Saving item:', formData)
    closeItemForm()
    // You would typically update the items state here with the new/updated item
  }

  function handleModeChange(newMode: 'view' | 'edit' | 'add') {
    setFormMode(newMode)
  }

  function handleBulkAction(action: 'Accepted' | 'Rejected' | 'Review') {
    console.log(`Bulk ${action} for items:`, selectedItems)
    const updatedItems = items.map(item => 
      selectedItems.includes(item.id ?? '') 
        ? { ...item, status: action }
        : item
    )
    setItems(updatedItems)
    setSelectedItems([])
  }

  function handleSplitItems() {
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
          <Button onClick={() => handleBulkAction('Accepted')}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Accept Selected
          </Button>
          <Button onClick={() => handleBulkAction('Rejected')}>
            <XCircle className="mr-2 h-4 w-4" />
            Reject Selected
          </Button>
          <Button onClick={() => handleBulkAction('Review')}>
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
                    checked={selectedItems.includes(item.id ?? '')}
                    onCheckedChange={() => handleSelectItem(item.id ?? '')}
                  />
                </TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell className='align-top'>{item.unit}</TableCell>
                <TableCell className="text-right align-top">
                  <div>{item.quantityRequested.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{item.inventoryInfo.onOrdered.toLocaleString()}</div>
                </TableCell>
                <TableCell className="text-right align-top">
                  <div>{item.quantityApproved.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{item.inventoryInfo.onHand.toLocaleString()}</div>
                </TableCell>
                <TableCell className='align-top'>{item.currency}</TableCell>
                <TableCell className="text-right align-top">
                  <div>{item.price.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{item.inventoryInfo.lastPrice.toFixed(2)}</div>
                </TableCell>
                <TableCell className="text-right align-top">{item.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                <TableCell>
                  <StatusBadge status={item.status ?? '' } />
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
                    <span className="text-sm text-muted-foreground">{item.description}</span>
                  </div>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
        <DialogContent className="sm:max-w-[80vw] max-w-[80vw] p-0 border-none bg-transparent">
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