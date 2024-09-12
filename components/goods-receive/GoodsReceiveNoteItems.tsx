'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { GoodsReceiveNoteMode, GoodsReceiveNoteItem } from '@/lib/types'

interface GoodsReceiveNoteItemsProps {
  mode: GoodsReceiveNoteMode
  items: GoodsReceiveNoteItem[]
  onItemsChange: (items: GoodsReceiveNoteItem[]) => void
  selectedItems: number[]
  onItemSelect: (itemId: number, isSelected: boolean) => void
}

export function GoodsReceiveNoteItems({ mode, items = [], onItemsChange, selectedItems, onItemSelect }: GoodsReceiveNoteItemsProps) {
  const [expandedItems, setExpandedItems] = useState<number[]>([])

  const toggleExpand = (id: number) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleItemChange = (id: number, field: keyof GoodsReceiveNoteItem, value: string | number | boolean) => {
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    )
    onItemsChange(updatedItems)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onItemSelect(-1, true) // Use -1 to indicate "select all"
    } else {
      onItemSelect(-1, false) // Use -1 to indicate "deselect all"
    }
  }

  const allSelected = items.length > 0 && selectedItems.length === items.length

  if (items.length === 0) {
    return <div>No items available.</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {mode !== 'view' && (
            <TableHead className="w-[50px]">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
          )}
          <TableHead>Item Name</TableHead>
          <TableHead>Ordered Qty</TableHead>
          <TableHead>Received Qty</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Unit Price</TableHead>
          <TableHead>Total Price</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <React.Fragment key={item.id}>
            <TableRow>
              {mode !== 'view' && (
                <TableCell>
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={(checked) => onItemSelect(item.id, checked as boolean)}
                  />
                </TableCell>
              )}
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.orderedQuantity}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={item.receivedQuantity}
                  onChange={(e) => handleItemChange(item.id, 'receivedQuantity', parseFloat(e.target.value))}
                  readOnly={mode === 'view'}
                />
              </TableCell>
              <TableCell>{item.unit}</TableCell>
              <TableCell>{item.unitPrice.toFixed(2)}</TableCell>
              <TableCell>{item.totalPrice.toFixed(2)}</TableCell>
              <TableCell>
                <Button variant="ghost" onClick={() => toggleExpand(item.id)}>
                  {expandedItems.includes(item.id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
            {expandedItems.includes(item.id) && (
              <TableRow>
                <TableCell colSpan={mode !== 'view' ? 9 : 8}>
                  <Card className="mt-2">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor={`description-${item.id}`}>Description</Label>
                          <Input
                            id={`description-${item.id}`}
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            readOnly={mode === 'view'}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`baseQuantity-${item.id}`}>Base Quantity</Label>
                          <Input
                            id={`baseQuantity-${item.id}`}
                            type="number"
                            value={item.baseQuantity}
                            onChange={(e) => handleItemChange(item.id, 'baseQuantity', parseFloat(e.target.value))}
                            readOnly={mode === 'view'}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`basePrice-${item.id}`}>Base Price</Label>
                          <Input
                            id={`basePrice-${item.id}`}
                            type="number"
                            value={item.basePrice}
                            onChange={(e) => handleItemChange(item.id, 'basePrice', parseFloat(e.target.value))}
                            readOnly={mode === 'view'}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`baseUnit-${item.id}`}>Base Unit</Label>
                          <Input
                            id={`baseUnit-${item.id}`}
                            value={item.baseUnit}
                            onChange={(e) => handleItemChange(item.id, 'baseUnit', e.target.value)}
                            readOnly={mode === 'view'}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`conversionRate-${item.id}`}>Conversion Rate</Label>
                          <Input
                            id={`conversionRate-${item.id}`}
                            type="number"
                            value={item.conversionRate}
                            onChange={(e) => handleItemChange(item.id, 'conversionRate', parseFloat(e.target.value))}
                            readOnly={mode === 'view'}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`extraCost-${item.id}`}>Extra Cost</Label>
                          <Input
                            id={`extraCost-${item.id}`}
                            type="number"
                            value={item.extraCost}
                            onChange={(e) => handleItemChange(item.id, 'extraCost', parseFloat(e.target.value))}
                            readOnly={mode === 'view'}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`applyDiscount-${item.id}`}
                            checked={item.applyDiscount}
                            onCheckedChange={(checked) => handleItemChange(item.id, 'applyDiscount', checked)}
                            disabled={mode === 'view'}
                          />
                          <Label htmlFor={`applyDiscount-${item.id}`}>Apply Discount</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`applyTax-${item.id}`}
                            checked={item.applyTax}
                            onCheckedChange={(checked) => handleItemChange(item.id, 'applyTax', checked)}
                            disabled={mode === 'view'}
                          />
                          <Label htmlFor={`applyTax-${item.id}`}>Apply Tax</Label>
                        </div>
                        <div>
                          <Label htmlFor={`inventoryOnHand-${item.id}`}>On Hand</Label>
                          <Input
                            id={`inventoryOnHand-${item.id}`}
                            type="number"
                            value={item.inventoryOnHand}
                            readOnly
                          />
                        </div>
                        <div>
                          <Label htmlFor={`inventoryOnOrder-${item.id}`}>On Order</Label>
                          <Input
                            id={`inventoryOnOrder-${item.id}`}
                            type="number"
                            value={item.inventoryOnOrder}
                            readOnly
                          />
                        </div>
                        <div>
                          <Label htmlFor={`inventoryReorderThreshold-${item.id}`}>Reorder Threshold</Label>
                          <Input
                            id={`inventoryReorderThreshold-${item.id}`}
                            type="number"
                            value={item.inventoryReorderThreshold}
                            readOnly
                          />
                        </div>
                        <div>
                          <Label htmlFor={`inventoryRestockLevel-${item.id}`}>Restock Level</Label>
                          <Input
                            id={`inventoryRestockLevel-${item.id}`}
                            type="number"
                            value={item.inventoryRestockLevel}
                            readOnly
                          />
                        </div>
                        <div>
                          <Label htmlFor={`purchaseOrderRef-${item.id}`}>PO Ref#</Label>
                          <Input
                            id={`purchaseOrderRef-${item.id}`}
                            value={item.purchaseOrderRef}
                            readOnly
                          />
                        </div>
                        <div>
                          <Label htmlFor={`lastPurchasePrice-${item.id}`}>Last Price</Label>
                          <Input
                            id={`lastPurchasePrice-${item.id}`}
                            type="number"
                            value={item.lastPurchasePrice}
                            readOnly
                          />
                        </div>
                        <div>
                          <Label htmlFor={`lastVendor-${item.id}`}>Last Vendor</Label>
                          <Input
                            id={`lastVendor-${item.id}`}
                            value={item.lastVendor}
                            readOnly
                          />
                        </div>
                        <div>
                          <Label htmlFor={`lotNumber-${item.id}`}>Lot Number</Label>
                          <Input
                            id={`lotNumber-${item.id}`}
                            value={item.lotNumber}
                            onChange={(e) => handleItemChange(item.id, 'lotNumber', e.target.value)}
                            readOnly={mode === 'view'}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`deliveryPoint-${item.id}`}>Delivery Point</Label>
                          <Input
                            id={`deliveryPoint-${item.id}`}
                            value={item.deliveryPoint}
                            onChange={(e) => handleItemChange(item.id, 'deliveryPoint', e.target.value)}
                            readOnly={mode === 'view'}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`location-${item.id}`}>Location</Label>
                          <Input
                            id={`location-${item.id}`}
                            value={item.location}
                            onChange={(e) => handleItemChange(item.id, 'location', e.target.value)}
                            readOnly={mode === 'view'}
                          />
                        </div>
                        <div className="mt-4">
                          <Label htmlFor={`notes-${item.id}`}>Notes</Label>
                          <Input
                            id={`notes-${item.id}`}
                            value={item.notes}
                            onChange={(e) => handleItemChange(item.id, 'notes', e.target.value)}
                            readOnly={mode === 'view'}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`isFreeOfCharge-${item.id}`}
                            checked={item.isFreeOfCharge}
                            onCheckedChange={(checked) => handleItemChange(item.id, 'isFreeOfCharge', checked as boolean)}
                            disabled={mode === 'view'}
                          />
                          <Label htmlFor={`isFreeOfCharge-${item.id}`}>Free of Charge</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TableCell>
              </TableRow>
            )}
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  )
}