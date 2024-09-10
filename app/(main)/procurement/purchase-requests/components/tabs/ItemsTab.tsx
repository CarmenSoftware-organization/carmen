// File: tabs/ItemsTab.tsx
import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit2Icon, Trash2Icon, InfoIcon, ImageIcon, MessageSquareIcon } from 'lucide-react'
import { ItemDetail } from '@/types/types'
import { Separator } from '@/components/ui/separator'

const itemDetails: ItemDetail[] = [
  // ... (item details data as before)
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

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleSelectAllItems = () => {
    setSelectedItems(prev => 
      prev.length === itemDetails.length 
        ? [] 
        : itemDetails.map(item => item.id)
    )
  }

  return (
    <Table>
      {/* <TableHeader >
        <TableRow >
          <TableHead rowSpan={2} className="w-[40px] h-fit align-center">
            <Checkbox 
              checked={selectedItems.length === itemDetails.length}
              onCheckedChange={handleSelectAllItems}
            />
          </TableHead>
          <TableHead rowSpan={2} className="align-center">Location</TableHead>
          <TableHead rowSpan={2} className="align-center">Product</TableHead>
          <TableHead rowSpan={2} className="align-center">Unit</TableHead>
          <TableHead className="text-center text-xs">Request</TableHead>
          <TableHead className="text-center text-xs">Approve</TableHead>
          <TableHead rowSpan={2} className="align-center">Curr.</TableHead>
          <TableHead className="text-center">Price</TableHead>
          <TableHead rowSpan={2} className="align-center">Total</TableHead>
          <TableHead rowSpan={2} className="align-center">Status</TableHead>
          <TableHead rowSpan={2} className="text-right align-center">Actions</TableHead>
        </TableRow>
        <TableRow className='p-0'>
          <TableHead className="text-center text-xs">Ordering</TableHead>
          <TableHead className="text-center text-xs">On Hand</TableHead>
          <TableHead className="text-center text-xs text-nowrap">Last Price</TableHead>
        </TableRow>
      </TableHeader> */}

<TableHeader >
        <TableRow className='h-6' >
          <TableHead className="w-[40px] h-fit align-center">
            <Checkbox 
              checked={selectedItems.length === itemDetails.length}
              onCheckedChange={handleSelectAllItems}
            />
          </TableHead>
          <TableHead className="align-center ">Location</TableHead>
          <TableHead className="align-center ">Product</TableHead>
          <TableHead className="align-center ">Unit</TableHead>
          <TableHead className="text-xs flex-col gap-2 justify-between items-center"><div className='text-center'>Request</div><Separator /> <div className='text-center'>Ordering</div></TableHead>
          <TableHead className="text-xs flex-col gap-2 justify-between items-center "><div className='text-center'>Approve</div><Separator /><div className='text-nowrap text-center'>On Hand</div></TableHead>
          <TableHead className="align-center ">Curr.</TableHead>
          <TableHead className="text-xs flex-col  gap-2 justify-between items-center"><div className='text-center'>Price</div><Separator /><div className='text-nowrap text-center'>Last Price</div></TableHead>
          <TableHead className="align-center ">Total</TableHead>
          <TableHead className="align-center ">Status</TableHead>
          <TableHead className="text-right align-center">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {itemDetails.map((item) => (
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
                <Badge variant={item.status === 'A' ? 'success' : 'destructive'}>
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="icon">
                    <Edit2Icon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <InfoIcon className="h-4 w-4" />
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
  )
}