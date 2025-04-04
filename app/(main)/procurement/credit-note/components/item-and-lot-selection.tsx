import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ReferenceLot {
  lotNumber: string;
  receiveDate: string;
  grnNumber: string;
  grnDate: string;
  invoiceNumber: string;
  invoiceDate: string;
  quantity: number;
  unitCost: number;
  remaining?: number;
}

interface AvailableLot extends ReferenceLot {
  availableQty: number;
}

interface GRNItem {
  id: string;
  productName: string;
  productDescription: string;
  orderQuantity: number;
  unitPrice: number;
  location: string;
  orderUnit: string;
  inventoryUnit: string;
  referenceLots: ReferenceLot[];
  availableLots?: AvailableLot[];
}

interface SelectedItem extends GRNItem {
  appliedLots: ReferenceLot[];
  returnQuantity: number;
  discountAmount: number;
}

interface FIFOSummary {
  totalReceivedQty: number;
  weightedAverageCost: number;
  currentCost: number;
  costVariance: number;
  returnAmount: number;
  costOfGoodsSold: number;
  realizedGainLoss: number;
}

interface ItemAndLotSelectionProps {
  isOpen: boolean
  onClose: () => void
  onSave: (selectedItems: (SelectedItem & FIFOSummary)[]) => void
  grnItems: GRNItem[] 
  grnNumber: string
  creditNoteType: "return" | "discount"
}

export function ItemAndLotSelection({ isOpen, onClose, onSave, grnItems, grnNumber, creditNoteType }: ItemAndLotSelectionProps) {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  useEffect(() => {
    setSelectedItems([])
    setExpandedItems([])
  }, [isOpen])

  const handleItemSelect = (item: GRNItem) => {
    const index = selectedItems.findIndex(i => i.id === item.id)
    if (index > -1) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id))
    } else {
      setSelectedItems([...selectedItems, { ...item, appliedLots: [], returnQuantity: 0, discountAmount: 0 }])
    }
  }

  const handleLotSelection = (itemId: string, lot: ReferenceLot) => {
    setSelectedItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId
          ? {
              ...item,
              appliedLots: item.appliedLots.some((l) => l.lotNumber === lot.lotNumber)
                ? item.appliedLots.filter((l) => l.lotNumber !== lot.lotNumber)
                : [...item.appliedLots, lot]
            }
          : item
      )
    )
  }

  const handleReturnQuantityChange = (itemId: string, quantity: number) => {
    setSelectedItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, returnQuantity: quantity }
          : item
      )
    )
  }

  const handleDiscountAmountChange = (itemId: string, amount: number) => {
    setSelectedItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, discountAmount: amount }
          : item
      )
    )
  }

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const calculateFIFOSummary = (item: GRNItem | SelectedItem): FIFOSummary => {
    const selectedItem: SelectedItem = 'returnQuantity' in item 
      ? item as SelectedItem 
      : { ...item, appliedLots: [], returnQuantity: 0, discountAmount: 0 };

    const totalReceivedQty = item.referenceLots.reduce((sum, lot) => sum + lot.quantity, 0)
    const weightedAverageCost = item.referenceLots.length > 0 
      ? item.referenceLots.reduce((sum, lot) => sum + (lot.quantity * lot.unitCost), 0) / totalReceivedQty 
      : 0;
    const currentCost = item.unitPrice
    const costVariance = currentCost - weightedAverageCost
    const returnQuantity = selectedItem.returnQuantity || 0
    const returnAmount = returnQuantity * currentCost
    const costOfGoodsSold = returnQuantity * weightedAverageCost
    const realizedGainLoss = returnAmount - costOfGoodsSold

    return {
      totalReceivedQty,
      weightedAverageCost,
      currentCost,
      costVariance,
      returnAmount,
      costOfGoodsSold,
      realizedGainLoss
    }
  }

  const handleSave = () => {
    const itemsWithCosts = selectedItems.map(item => ({
      ...item,
      ...calculateFIFOSummary(item)
    }))
    onSave(itemsWithCosts)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Select Items and Lots for GRN: {grnNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <ScrollArea className="h-[500px] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Order Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Order Unit</TableHead>
                  <TableHead>Inventory Unit</TableHead>
                  {creditNoteType === "return" ? (
                    <TableHead>Return Quantity</TableHead>
                  ) : (
                    <TableHead>Discount Amount</TableHead>
                  )}
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grnItems.map((item) => (
                  <React.Fragment key={item.id}>
                    <TableRow className={selectedItems.some(i => i.id === item.id) ? 'bg-muted' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.some(i => i.id === item.id)}
                          onCheckedChange={() => handleItemSelect(item)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-gray-500">{item.productDescription}</div>
                      </TableCell>
                      <TableCell>{item.orderQuantity}</TableCell>
                      <TableCell>{item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>{item.orderUnit}</TableCell>
                      <TableCell>{item.inventoryUnit}</TableCell>
                      <TableCell>
                        {creditNoteType === "return" ? (
                          <Input
                            type="number"
                            value={selectedItems.find(i => i.id === item.id)?.returnQuantity || 0}
                            onChange={(e) => handleReturnQuantityChange(item.id, Number(e.target.value))}
                            disabled={!selectedItems.some(i => i.id === item.id)}
                          />
                        ) : (
                          <Input
                            type="number"
                            value={selectedItems.find(i => i.id === item.id)?.discountAmount || 0}
                            onChange={(e) => handleDiscountAmountChange(item.id, Number(e.target.value))}
                            disabled={!selectedItems.some(i => i.id === item.id)}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="link" onClick={() => toggleItemExpansion(item.id)}>
                          {expandedItems.includes(item.id) ? 'Hide Details' : 'Show Details'}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedItems.includes(item.id) && (
                      <TableRow>
                        <TableCell colSpan={9}>
                          <Card>
                            <CardContent>
                              {creditNoteType === "return" && (
                                <>
                                  <h4 className="text-sm font-semibold mb-2">FIFO Layer Summary</h4>
                                  <div className="grid grid-cols-4 gap-4 mb-4">
                                    {(() => {
                                      const costs = calculateFIFOSummary(item)
                                      return (
                                        <>
                                          <div>
                                            <Label>Total Received Qty:</Label>
                                            <div>{costs.totalReceivedQty}</div>
                                          </div>
                                          <div>
                                            <Label>Weighted Average Cost:</Label>
                                            <div>{costs.weightedAverageCost.toFixed(2)}</div>
                                          </div>
                                          <div>
                                            <Label>Current Cost:</Label>
                                            <div>{costs.currentCost.toFixed(2)}</div>
                                          </div>
                                          <div>
                                            <Label>Cost Variance:</Label>
                                            <div className={costs.costVariance >= 0 ? "text-green-500" : "text-red-500"}>
                                              {costs.costVariance >= 0 ? "+" : ""}{costs.costVariance.toFixed(2)}
                                            </div>
                                          </div>
                                          <div>
                                            <Label>Return Amount:</Label>
                                            <div>{costs.returnAmount.toFixed(2)}</div>
                                          </div>
                                          <div>
                                            <Label>Cost of Goods Sold:</Label>
                                            <div>{costs.costOfGoodsSold.toFixed(2)}</div>
                                          </div>
                                          <div>
                                            <Label>Realized Gain/Loss:</Label>
                                            <div className={costs.realizedGainLoss >= 0 ? "text-green-500" : "text-red-500"}>
                                              {costs.realizedGainLoss >= 0 ? "+" : ""}{costs.realizedGainLoss.toFixed(2)}
                                            </div>
                                          </div>
                                        </>
                                      )
                                    })()}
                                  </div>
                                </>
                              )}
                              <h4 className="text-sm font-semibold mb-2">Reference Lots</h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Lot No.</TableHead>
                                    <TableHead>Receive Date</TableHead>
                                    <TableHead>GRN Number</TableHead>
                                    <TableHead>GRN Date</TableHead>
                                    <TableHead>Invoice Number</TableHead>
                                    <TableHead>Invoice Date</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Unit Cost</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {item.referenceLots.map((lot: ReferenceLot) => (
                                    <TableRow key={lot.lotNumber}>
                                      <TableCell>{lot.lotNumber}</TableCell>
                                      <TableCell>{lot.receiveDate}</TableCell>
                                      <TableCell>{lot.grnNumber}</TableCell>
                                      <TableCell>{lot.grnDate}</TableCell>
                                      <TableCell>{lot.invoiceNumber}</TableCell>
                                      <TableCell>{lot.invoiceDate}</TableCell>
                                      <TableCell>{lot.quantity}</TableCell>
                                      <TableCell>{lot.unitCost?.toFixed(2)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                              {creditNoteType === "return" && item.availableLots && item.availableLots.length > 0 && (
                                <>
                                  <h4 className="text-sm font-semibold my-2">Applied Lots</h4>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-[50px]"></TableHead>
                                        <TableHead>Lot No.</TableHead>
                                        <TableHead>Receive Date</TableHead>
                                        <TableHead>GRN Number</TableHead>
                                        <TableHead>GRN Date</TableHead>
                                        <TableHead>Invoice Number</TableHead>
                                        <TableHead>Invoice Date</TableHead>
                                        <TableHead>Available Qty</TableHead>
                                        <TableHead>Unit Cost</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {item.availableLots.map((lot: AvailableLot) => (
                                        <TableRow key={lot.lotNumber}>
                                          <TableCell>
                                            <Checkbox
                                              checked={selectedItems.find(i => i.id === item.id)?.appliedLots.some(l => l.lotNumber === lot.lotNumber)}
                                              onCheckedChange={() => handleLotSelection(item.id, lot)}
                                            />
                                          </TableCell>
                                          <TableCell>{lot.lotNumber}</TableCell>
                                          <TableCell>{lot.receiveDate}</TableCell>
                                          <TableCell>{lot.grnNumber}</TableCell>
                                          <TableCell>{lot.grnDate}</TableCell>
                                          <TableCell>{lot.invoiceNumber}</TableCell>
                                          <TableCell>{lot.invoiceDate}</TableCell>
                                          <TableCell>{lot.availableQty}</TableCell>
                                          <TableCell>{lot.unitCost.toFixed(2)}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </>
                              )}
                            </CardContent>
                          </Card>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={selectedItems.length === 0}>Add Selected Items</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
