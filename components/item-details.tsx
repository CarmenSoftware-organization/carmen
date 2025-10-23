'use client'

import { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/custom-dialog"
import { CalendarIcon, Edit2Icon, PlusIcon, XIcon, EyeIcon, SaveIcon } from "lucide-react"
import { PurchaseOrderItem } from "@/lib/types"

type Mode = 'view' | 'edit' | 'add'

interface ItemDetailsComponentProps {
  initialMode: Mode
  onClose: () => void
  isOpen: boolean
  initialData?: PurchaseOrderItem
  onSubmit?: (item: PurchaseOrderItem) => void
}

export function ItemDetailsComponent({
  initialMode,
  onClose,
  isOpen,
  initialData,
  onSubmit
}: ItemDetailsComponentProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [mode, setMode] = useState<Mode>(initialMode)
  const [itemData, setItemData] = useState<Partial<PurchaseOrderItem>>(initialData || {})

  useEffect(() => {
    setMode(initialMode)
    setItemData(initialData || {})
  }, [initialMode, initialData])

  const isReadOnly = mode === 'view'

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode)
  }

  const handleInputChange = (field: keyof PurchaseOrderItem, value: any) => {
    setItemData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    if (onSubmit && (mode === 'edit' || mode === 'add')) {
      onSubmit(itemData as PurchaseOrderItem)
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span className="text-2xl font-bold">Item Details</span>
            <div className="flex items-center space-x-2">
              {mode === 'view' && (
                <>
                  <Button variant="outline" size="sm" onClick={() => handleModeChange('edit')}>
                    <Edit2Icon className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  {!initialData && (
                    <Button variant="outline" size="sm" onClick={() => handleModeChange('add')}>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add New
                    </Button>
                  )}
                </>
              )}
              {(mode === 'edit' || mode === 'add') && (
                <>
                  <Button variant="outline" size="sm" onClick={handleSave}>
                    <SaveIcon className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={onClose}>
                    <XIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comment">Comment</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-2 mt-2">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <CardTitle className="text-lg font-semibold mb-2 sm:mb-0">Basic Information</CardTitle>
                  {mode === 'view' && <Badge variant="secondary">Accepted</Badge>}
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="location" className="text-xs">Location</Label>
                    <Input id="location" defaultValue="Main Warehouse" readOnly={isReadOnly} className="h-7 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-xs">Name</Label>
                    <Input
                      id="name"
                      value={itemData.itemName || ''}
                      onChange={(e) => handleInputChange('itemName', e.target.value)}
                      readOnly={isReadOnly}
                      className="h-7 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="description" className="text-xs">Description</Label>
                    <Input id="description" defaultValue="Premium organic white quinoa grains" readOnly={isReadOnly} className="h-7 text-sm" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Quantity and Delivery</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-2">
                  <div className="lg:col-span-1 space-y-1">
                    <Label htmlFor="unit" className="text-xs">Unit</Label>
                    <Input id="unit" defaultValue="Kg" readOnly={isReadOnly} className="h-7 text-sm" />
                    <p className="text-xs text-gray-500">Base: Kg | 1 Bag = 0.5 Kg</p>
                  </div>
                  <div className="lg:col-span-1 space-y-1 flex items-center">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="foc" disabled={isReadOnly} />
                      <Label htmlFor="foc" className="text-xs">FOC</Label>
                    </div>
                  </div>
                  <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="quantity-requested" className="text-xs">Quantity Requested</Label>
                      <Input id="quantity-requested" defaultValue="500" readOnly={isReadOnly} className="h-7 text-sm" />
                      <p className="text-xs text-gray-500">5 Kg</p>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="quantity-approved" className="text-xs">Quantity Approved</Label>
                      <Input id="quantity-approved" defaultValue="450" readOnly={isReadOnly} className="h-7 text-sm" />
                      <p className="text-xs text-gray-500">4.5 Kg</p>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="remaining-quantity" className="text-xs">Remaining Quantity</Label>
                      <Input id="remaining-quantity" defaultValue="50" readOnly={isReadOnly} className="h-7 text-sm" />
                      <p className="text-xs text-gray-500">0.5 Kg</p>
                    </div>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-500">
                  <div>
                    <Label className="block">On Hand</Label>
                    <span>100 Kg</span>
                  </div>
                  <div>
                    <Label className="block">On Ordered</Label>
                    <span>200 Kg</span>
                  </div>
                  <div>
                    <Label className="block">Reorder Level</Label>
                    <span>50 Kg</span>
                  </div>
                  <div>
                    <Label className="block">Restock Level</Label>
                    <span>300 Kg</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Pricing</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="space-y-1 sm:col-span-1">
                        <Label htmlFor="currency" className="text-xs">Currency</Label>
                        <Input id="currency" defaultValue="USD" readOnly={isReadOnly} className="h-7 text-sm" />
                      </div>
                      <div className="space-y-1 sm:col-span-1">
                        <Label htmlFor="exch-rate" className="text-xs">Exch. Rate</Label>
                        <Input id="exch-rate" defaultValue="1" readOnly={isReadOnly} className="h-7 text-sm" />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor="price" className="text-xs">Price</Label>
                        <Input id="price" defaultValue="3.99" readOnly={isReadOnly} className="h-7 text-sm" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="enable-adjustment" disabled={isReadOnly} />
                      <Label htmlFor="enable-adjustment" className="text-xs">Enable adjustment</Label>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="disc-rate" className="text-xs">Disc. Rate (%)</Label>
                        <Input id="disc-rate" defaultValue="5" readOnly={isReadOnly} className="h-7 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="override-discount" className="text-xs">Override Discount</Label>
                        <Input id="override-discount" placeholder="Enter to override" readOnly={isReadOnly} className="h-7 text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="tax-rate" className="text-xs">Tax Rate (%)</Label>
                        <Input id="tax-rate" defaultValue="7" readOnly={isReadOnly} className="h-7 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="override-tax" className="text-xs">Override Tax</Label>
                        <Input id="override-tax" placeholder="Enter to override" readOnly={isReadOnly} className="h-7 text-sm" />
                      </div>
                    </div>
                    <Separator className="my-2" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-500">
                      <div>
                        <Label className="block">Last Price</Label>
                        <span>$3.85 per Kg</span>
                      </div>
                      <div>
                        <Label className="block">Last Order Date</Label>
                        <span>2023-05-15</span>
                      </div>
                      <div>
                        <Label className="block">Last Vendor</Label>
                        <span>Organic Supplies Inc.</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Calculated Amounts</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs">Base Amount:</Label>
                      <div className="text-right">
                        <div className="text-[10px] text-gray-500">USD 1795.50</div>
                        <div className="font-semibold">USD 1795.50</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <Label className="text-xs">Discount Amount:</Label>
                      <div className="text-right">
                        <div className="text-[10px] text-gray-500">USD 89.78</div>
                        <div className="font-semibold">USD 89.78</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <Label className="text-xs">Net Amount:</Label>
                      <div className="text-right">
                        <div className="text-[10px] text-gray-500">USD 1705.72</div>
                        <div className="font-semibold">USD 1705.72</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <Label className="text-xs">Tax Amount:</Label>
                      <div className="text-right">
                        <div className="text-[10px] text-gray-500">USD 119.40</div>
                        <div className="font-semibold">USD 119.40</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <Label className="text-xs">Total Amount:</Label>
                      <div className="text-right">
                        <div className="text-[10px] text-gray-500">USD 1825.13</div>
                        <div className="font-semibold">USD 1825.13</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="comment" className="mt-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Comment</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <Textarea 
                  placeholder="Add your comment here..." 
                  className="text-sm h-[calc(100vh-280px)]"
                  readOnly={isReadOnly}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardContent className="flex flex-wrap justify-end gap-2 py-2">
            <Button variant="outline" size="sm">
              Request #
            </Button>
            <Button variant="outline" size="sm">
              On Hand
            </Button>
            <Button variant="outline" size="sm">
              On Order
            </Button>
            <Button variant="outline" size="sm">
              G. Received
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}