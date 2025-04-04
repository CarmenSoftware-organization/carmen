import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { EditedItem } from '@/lib/types/credit-note'

// This type matches the array type in EditedItem.appliedLots
interface AppliedLot {
  lotNumber: string;
  receiveDate: string | Date;
  grnNumber: string;
  invoiceNumber: string;
  availableQty?: number; // Optional because it might not exist in all contexts
  unitCost?: number;     // Optional because it might not exist in all contexts
}

// Helper function to format dates as strings
const formatDate = (date: string | Date): string => {
  if (date instanceof Date) {
    return date.toLocaleDateString();
  }
  return date;
};

interface ItemDetailsEditProps {
  isOpen: boolean
  onClose: () => void
  onSave: (item: EditedItem) => void
  item: EditedItem | null
  creditNoteType: "return" | "discount"
}

export function ItemDetailsEdit({ isOpen, onClose, onSave, item, creditNoteType }: ItemDetailsEditProps) {
  const [editedItem, setEditedItem] = useState<EditedItem | null>(null)

  useEffect(() => {
    if (item) {
      setEditedItem({
        ...item,
        appliedLots: item.appliedLots || []
      })
    }
  }, [item])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditedItem(prev => {
      if (!prev) return null
      const updatedItem = { ...prev, [name]: value }
      return calculateAmounts(updatedItem)
    })
  }

  const calculateAmounts = (item: EditedItem): EditedItem => {
    const cnAmt = Number(item.cnQty) * item.unitPrice
    const tax = (cnAmt * item.taxRate) / 100
    const total = cnAmt + tax
    return { ...item, cnAmt, tax, total }
  }

  const handleSave = () => {
    if (editedItem) {
      onSave(editedItem)
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>
        {editedItem ? (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Product Name</Label>
                    <div>{editedItem.productName}</div>
                  </div>
                  <div>
                    <Label>Product Description</Label>
                    <div>{editedItem.productDescription}</div>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <div>{editedItem.location}</div>
                  </div>
                  <div>
                    <Label>Lot Number</Label>
                    <div>{editedItem.lotNo}</div>
                  </div>
                  <div>
                    <Label>Order Unit</Label>
                    <div>{editedItem.orderUnit}</div>
                  </div>
                  <div>
                    <Label>Inventory Unit</Label>
                    <div>{editedItem.inventoryUnit}</div>
                  </div>
                  <div>
                    <Label>Received Quantity</Label>
                    <div>{editedItem.rcvQty}</div>
                  </div>
                  <div>
                    <Label>Unit Price</Label>
                    <div>{editedItem.unitPrice.toFixed(2)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cnQty">
                  {creditNoteType === "return" ? "Return Quantity" : "Discount Quantity"}
                </Label>
                <Input
                  id="cnQty"
                  name="cnQty"
                  type="number"
                  value={editedItem.cnQty}
                  onChange={handleChange}
                />
              </div>
              {creditNoteType === "discount" && (
                <div className="space-y-2">
                  <Label htmlFor="discountAmount">Discount Amount</Label>
                  <Input
                    id="discountAmount"
                    name="discountAmount"
                    type="number"
                    value={editedItem.discountAmount || 0}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cnAmt">
                  {creditNoteType === "return" ? "Return Amount" : "Discount Amount"}
                </Label>
                <Input
                  id="cnAmt"
                  name="cnAmt"
                  type="number"
                  value={editedItem.cnAmt.toFixed(2)}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax">Tax</Label>
                <Input
                  id="tax"
                  name="tax"
                  type="number"
                  value={editedItem.tax.toFixed(2)}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total">Total</Label>
                <Input
                  id="total"
                  name="total"
                  type="number"
                  value={editedItem.total.toFixed(2)}
                  readOnly
                />
              </div>
            </div>

            {creditNoteType === "return" && editedItem.appliedLots && editedItem.appliedLots.length > 0 && (
              <Card>
                <CardContent>
                  <h4 className="text-sm font-semibold mb-2">Affected Lots</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lot No.</TableHead>
                        <TableHead>Receive Date</TableHead>
                        <TableHead>GRN Number</TableHead>
                        <TableHead>Invoice Number</TableHead>
                        <TableHead>Available Qty</TableHead>
                        <TableHead>Unit Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editedItem.appliedLots.map((lot: AppliedLot) => (
                        <TableRow key={lot.lotNumber}>
                          <TableCell>{lot.lotNumber}</TableCell>
                          <TableCell>{formatDate(lot.receiveDate)}</TableCell>
                          <TableCell>{lot.grnNumber}</TableCell>
                          <TableCell>{lot.invoiceNumber}</TableCell>
                          <TableCell>{lot.availableQty}</TableCell>
                          <TableCell>{lot.unitCost?.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div>Loading...</div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!editedItem}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
