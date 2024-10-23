'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, Edit, Plus, Printer, XCircle, PlusCircle, MoreHorizontal, Eye, Pencil, Trash } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ItemAndLotSelection } from './item-and-lot-selection'
import { GRNSelection } from './grn-selection'
import { ItemDetailsEdit } from './item-details-edit'

function StatusBadge({ status }: { status: string }) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'void':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <Badge className={`${getStatusColor(status)} rounded-lg text-white`}>
      {status}
    </Badge>
  )
}

export function CreditNoteDetail() {
  const [isEditing, setIsEditing] = useState(false)
  const [creditNoteType, setCreditNoteType] = useState<"return" | "discount">("return")
  const [reason, setReason] = useState("")
  const [reasons, setReasons] = useState(["Damaged Goods", "Incorrect Item", "Overcharged"])
  const [isAddingReason, setIsAddingReason] = useState(false)
  const [newReason, setNewReason] = useState("")
  const [currency, setCurrency] = useState("THB")
  const [exchangeRate, setExchangeRate] = useState("1.0")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [invoiceDate, setInvoiceDate] = useState("")
  const [taxInvoiceNumber, setTaxInvoiceNumber] = useState("")
  const [taxInvoiceDate, setTaxInvoiceDate] = useState("")
  const [status, setStatus] = useState("Active")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [items, setItems] = useState([
    { 
      id: '1', 
      productName: 'Premium Pasta',
      productDescription: 'Fettuccine, 500g pack',
      product: 'Pasta Fettucini', 
      location: 'Food Store', 
      lotNo: 'LOT123', 
      orderUnit: 'Box', 
      inventoryUnit: '10 @Pcs', 
      rcvQty: 1000, 
      cnQty: 100, 
      unitPrice: 100, 
      cnAmt: 10000, 
      tax: 700, 
      total: 10700 
    },
    { 
      id: '2', 
      productName: 'Gourmet Olive Oil',
      productDescription: 'Extra Virgin, 1L bottle',
      product: 'Olive Oil Extra Virgin', 
      location: 'Food Store', 
      lotNo: 'LOT456', 
      orderUnit: 'Bottle', 
      inventoryUnit: '1 @Bottle', 
      rcvQty: 500, 
      cnQty: 50, 
      unitPrice: 200, 
      cnAmt: 10000, 
      tax: 700, 
      total: 10700 
    },
  ])
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [grnNumber, setGrnNumber] = useState("GRN-001")
  const [grnDate, setGrnDate] = useState("2023-06-14")
  const [vendors, setVendors] = useState([
    { id: '1', name: 'ACME Corp' },
    { id: '2', name: 'Global Supplies Inc.' },
    { id: '3', name: 'Tech Innovations Ltd.' },
  ])
  const [selectedVendor, setSelectedVendor] = useState(vendors[0].id)
  const [isGRNSelectionOpen, setIsGRNSelectionOpen] = useState(false)
  const [selectedGrnItems, setSelectedGrnItems] = useState<any[]>([])
  const [isItemSelectionOpen, setIsItemSelectionOpen] = useState(false)

  const handleEdit = () => setIsEditing(true)
  const handleSave = () => setIsEditing(false)
  const handleCancel = () => setIsEditing(false)

  const handleAddReason = () => {
    if (newReason.trim()) {
      setReasons([...reasons, newReason.trim()])
      setReason(newReason.trim())
      setNewReason("")
      setIsAddingReason(false)
    }
  }

  const handleAddItem = () => {
    console.log("Add Item button clicked")
    if (selectedGrnItems.length > 0) {
      console.log("Opening ItemAndLotSelection")
      setIsItemSelectionOpen(true)
    } else {
      console.error("No GRN selected. Please select a GRN first.")
    }
  }

  const handleEditItem = (itemId: string) => {
    console.log("Edit Item clicked for item:", itemId)
    const itemToEdit = items.find(item => item.id === itemId)
    if (itemToEdit) {
      setEditingItem(itemToEdit)
      console.log("Opening ItemDetailsEdit")
      setIsItemModalOpen(true)
    }
  }

  const handleSaveItem = (savedItem: any) => {
    // Process the saved item data and add it to the items list
    const newItem = {
      id: Date.now().toString(),
      productName: savedItem.productName,
      productDescription: savedItem.productDescription,
      product: savedItem.lot.lotNo,
      location: savedItem.lot.location,
      lotNo: savedItem.lot.lotNo,
      orderUnit: 'BOX', // You might want to make this dynamic
      inventoryUnit: 'PCS', // You might want to make this dynamic
      rcvQty: savedItem.lot.availableQty,
      cnQty: savedItem.returnQuantity,
      unitPrice: savedItem.lot.unitPrice,
      cnAmt: savedItem.returnQuantity * savedItem.lot.unitPrice,
      tax: 0, // Calculate tax if needed
      total: savedItem.returnQuantity * savedItem.lot.unitPrice // Add tax if needed
    }
    setItems([...items, newItem])
  }

  const handleBulkDelete = () => {
    setItems(items.filter(item => !selectedItems.includes(item.id)))
    setSelectedItems([])
  }

  const handleItemAction = (action: string, itemId: string) => {
    switch (action) {
      case 'view':
        console.log('View item', itemId)
        break
      case 'edit':
        console.log('Edit item', itemId)
        break
      case 'delete':
        setItems(items.filter(item => item.id !== itemId))
        break
    }
  }

  const handleSelectAllItems = (checked: boolean) => {
    if (checked) {
      setSelectedItems(items.map(item => item.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (checked: boolean, itemId: string) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId])
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId))
    }
  }

  const handleVendorChange = (vendorId: string) => {
    setSelectedVendor(vendorId)
    setGrnNumber('')
    setGrnDate('')
  }

  const handleGRNSelect = (grn: any) => {
    console.log("GRN selected:", grn)
    setGrnNumber(grn.number)
    setGrnDate(grn.date)
    // Here you would typically fetch the items for this GRN
    // For now, we'll use mock data
    const mockItems = [
      {
        id: '1',
        productName: 'Product A',
        productDescription: 'Description of Product A',
        orderQuantity: 100,
        unitPrice: 50,
        location: 'Warehouse A',
        orderUnit: 'Box',
        inventoryUnit: 'Piece',
        referenceLots: [
          { 
            lotNumber: 'LOT001', 
            receiveDate: '2024-01-01', 
            grnNumber: 'GRN20240101-001',
            grnDate: '2024-01-01',
            invoiceNumber: 'INV001',
            invoiceDate: '2024-01-01',
            quantity: 50, 
            unitCost: 48 
          },
          { 
            lotNumber: 'LOT002', 
            receiveDate: '2024-01-02', 
            grnNumber: 'GRN20240102-001',
            grnDate: '2024-01-02',
            invoiceNumber: 'INV002',
            invoiceDate: '2024-01-02',
            quantity: 50, 
            unitCost: 49 
          }
        ],
        availableLots: [
          { 
            lotNumber: 'LOT001', 
            receiveDate: '2024-01-01', 
            grnNumber: 'GRN20240101-001',
            grnDate: '2024-01-01',
            invoiceNumber: 'INV001',
            invoiceDate: '2024-01-01',
            availableQty: 30, 
            unitCost: 48 
          },
          { 
            lotNumber: 'LOT002', 
            receiveDate: '2024-01-02', 
            grnNumber: 'GRN20240102-001',
            grnDate: '2024-01-02',
            invoiceNumber: 'INV002',
            invoiceDate: '2024-01-02',
            availableQty: 40, 
            unitCost: 49 
          }
        ]
      },
      {
        id: '2',
        productName: 'Product B',
        productDescription: 'Description of Product B',
        orderQuantity: 200,
        unitPrice: 30,
        location: 'Warehouse B',
        orderUnit: 'Carton',
        inventoryUnit: 'Piece',
        referenceLots: [
          { lotNumber: 'LOT003', receiveDate: '2024-01-03', expiryDate: '2025-01-03', quantity: 100, unitCost: 28 },
          { lotNumber: 'LOT004', receiveDate: '2024-01-04', expiryDate: '2025-01-04', quantity: 100, unitCost: 29 }
        ],
        availableLots: [
          { lotNumber: 'LOT003', receiveDate: '2024-01-03', expiryDate: '2025-01-03', availableQty: 100, unitCost: 28 },
          { lotNumber: 'LOT004', receiveDate: '2024-01-04', expiryDate: '2025-01-04', availableQty: 100, unitCost: 29 }
        ]
      }
    ]
    setSelectedGrnItems(mockItems)
    setIsGRNSelectionOpen(false)
    setIsItemSelectionOpen(true)  // Open the item selection modal
  }

  const handleItemSave = (selectedItems: any[]) => {
    const newItems = selectedItems.flatMap(item => 
      item.appliedLots.map((lot: any) => ({
        id: Date.now().toString() + item.id + lot.lotNumber,
        productName: item.productName,
        productDescription: item.productDescription,
        product: item.productName,
        location: item.location,
        lotNo: lot.lotNumber,
        orderUnit: item.orderUnit,
        inventoryUnit: item.inventoryUnit,
        rcvQty: item.orderQuantity,
        cnQty: lot.availableQty, // You might want to allow user input for this
        unitPrice: item.unitPrice,
        cnAmt: lot.availableQty * item.unitPrice,
        tax: 0, // Calculate tax if needed
        total: lot.availableQty * item.unitPrice // Add tax if needed
      }))
    )
    setItems([...items, ...newItems])
    setIsItemSelectionOpen(false)
  }

  const handleSaveEditedItem = (editedItem: any) => {
    setItems(prevItems => prevItems.map(item => 
      item.id === editedItem.id ? editedItem : item
    ))
    setIsItemModalOpen(false)
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardHeader className="sticky top-0 z-10 bg-background">
          <div className="flex justify-between items-center">
            <CardTitle>
              <h2>Credit Note Detail</h2> </CardTitle>
            <div className="flex items-center space-x-2">
              <StatusBadge status={status} />
              {isEditing ? (
                <>
                  <Button onClick={handleSave}>Save</Button>
                  <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                </>
              ) : (
                <>
                  <Button variant="default" color='primary' onClick={handleEdit}>
                    <Plus className="mr-2 h-4 w-4 text-current" />
                    Edit
                  </Button>
                  <Button variant="destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    Void
                  </Button>
                  <Button variant="outline">
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button variant="outline">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-8 gap-4 mb-4">
            <div>
              <Label htmlFor="ref">Ref#</Label>
              <Input id="ref" value="CN-001" readOnly={!isEditing} />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value="2023-06-15" readOnly={!isEditing} />
            </div>
            <div className="sm:col-span-1">
              <Label htmlFor="creditNoteType">Credit Note Type</Label>
              {isEditing ? (
                <Select value={creditNoteType} onValueChange={(value: "return" | "discount") => setCreditNoteType(value)}>
                  <SelectTrigger id="creditNoteType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="return">Return</SelectItem>
                    <SelectItem value="discount">Discount</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input 
                  id="creditNoteType" 
                  value={creditNoteType.charAt(0).toUpperCase() + creditNoteType.slice(1)} 
                  readOnly 
                />
              )}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="vendor">Vendor</Label>
              {isEditing ? (
                <Select value={selectedVendor} onValueChange={handleVendorChange}>
                  <SelectTrigger id="vendor">
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input 
                  id="vendor" 
                  value={vendors.find(v => v.id === selectedVendor)?.name || ''} 
                  readOnly 
                />
              )}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="grnNumber">GRN #</Label>
              <div className="flex items-center">
                <Input 
                  id="grnNumber" 
                  value={grnNumber} 
                  readOnly
                  className="flex-grow"
                />
                <Button 
                  onClick={() => setIsGRNSelectionOpen(true)} 
                  className="ml-2"
                  disabled={!selectedVendor}
                >
                  Select GRN
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="grnDate">GRN Date</Label>
              <Input 
                id="grnDate" 
                type="date" 
                value={grnDate} 
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              {isEditing ? (
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="THB">THB</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    {/* Add more currencies as needed */}
                  </SelectContent>
                </Select>
              ) : (
                <Input id="currency" value={currency} readOnly />
              )}
            </div>
            <div>
              <Label htmlFor="exchangeRate">Exchange Rate</Label>
              <Input 
                id="exchangeRate" 
                value={exchangeRate} 
                readOnly={!isEditing}
                onChange={(e) => setExchangeRate(e.target.value)}
                type="number"
                step="0.0001"
              />
            </div>
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input 
                id="invoiceNumber" 
                value={invoiceNumber} 
                readOnly={!isEditing}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input 
                id="invoiceDate" 
                type="date" 
                value={invoiceDate} 
                readOnly={!isEditing}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="taxInvoiceNumber">Tax Invoice Number</Label>
              <Input 
                id="taxInvoiceNumber" 
                value={taxInvoiceNumber} 
                readOnly={!isEditing}
                onChange={(e) => setTaxInvoiceNumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="taxInvoiceDate">Tax Invoice Date</Label>
              <Input 
                id="taxInvoiceDate" 
                type="date" 
                value={taxInvoiceDate} 
                readOnly={!isEditing}
                onChange={(e) => setTaxInvoiceDate(e.target.value)}
              />
            </div>
          
            <div className="sm:col-span-2">
              <Label htmlFor="reason">Reason</Label>
              {isEditing ? (
                isAddingReason ? (
                  <div className="flex">
                    <Input
                      id="newReason"
                      value={newReason}
                      onChange={(e) => setNewReason(e.target.value)}
                      placeholder="Enter new reason"
                    />
                    <Button onClick={handleAddReason} className="ml-2">Add</Button>
                  </div>
                ) : (
                  <div className="flex">
                    <Select value={reason} onValueChange={setReason}>
                      <SelectTrigger id="reason">
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {reasons.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={() => setIsAddingReason(true)} className="ml-2">
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )
              ) : (
                <Input id="reason" value={reason} readOnly />
              )}
            </div>
          
            <div className="col-span-full">
              <Label htmlFor="description">Description</Label>
              <Input id="description" value="Returned goods" readOnly={!isEditing} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">Credit Note Items</TabsTrigger>
          <TabsTrigger value="stockMovement">Stock Movement</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="activityLog">Activity Log</TabsTrigger>
        </TabsList>
        <TabsContent value="items">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{creditNoteType.charAt(0).toUpperCase() + creditNoteType.slice(1)} Credit Note Items</CardTitle>
                <div className="space-x-2">
                  {selectedItems.length > 0 && (
                    <Button variant="destructive" onClick={handleBulkDelete}>
                      Delete Selected
                    </Button>
                  )}
                  <Button onClick={handleAddItem}>
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={selectedItems.length === items.length}
                          onCheckedChange={(checked) => handleSelectAllItems(checked as boolean)}
                        />
                      </TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Lot No.</TableHead>
                      <TableHead>
                        <div>Order Unit</div>
                        <div className="text-xs font-normal">Inventory Unit</div>
                      </TableHead>
                      <TableHead>Rcv. Qty</TableHead>
                      <TableHead>{creditNoteType === "return" ? "Return Qty." : "Discount Qty."}</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>{creditNoteType === "return" ? "Return Amt." : "Discount Amt."}</TableHead>
                      <TableHead>Tax</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={(checked) => handleSelectItem(checked as boolean, item.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-sm text-gray-500">{item.productDescription}</div>
                          <div className="text-xs text-gray-400">{item.product}</div>
                        </TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>{item.lotNo}</TableCell>
                        <TableCell>
                          <div>{item.orderUnit}</div>
                          <div className="text-xs text-gray-500">{item.inventoryUnit}</div>
                        </TableCell>
                        <TableCell>{item.rcvQty?.toFixed(2) ?? 'N/A'}</TableCell>
                        <TableCell>{item.cnQty?.toFixed(2) ?? 'N/A'}</TableCell>
                        <TableCell>{item.unitPrice?.toFixed(2) ?? 'N/A'}</TableCell>
                        <TableCell>{item.cnAmt?.toFixed(2) ?? 'N/A'}</TableCell>
                        <TableCell>{item.tax?.toFixed(2) ?? 'N/A'} (7%)</TableCell>
                        <TableCell>{item.total?.toFixed(2) ?? 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditItem(item.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleItemAction('delete', item.id)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="stockMovement">
          <Card>
            <CardHeader>
              <CardTitle>Stock Movement</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commit Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Item Description</TableHead>
                    <TableHead>Inventory Unit</TableHead>
                    <TableHead>Stock In</TableHead>
                    <TableHead>Stock Out</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>2023-06-15</TableCell>
                    <TableCell>Store A</TableCell>
                    <TableCell>Thai Milk Taa (12 pack)</TableCell>
                    <TableCell>pack</TableCell>
                    <TableCell>0</TableCell>
                    <TableCell>10</TableCell>
                    <TableCell>1000.00</TableCell>
                    <TableCell>CN-001</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Comment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell>2023-06-15</TableCell>
                    <TableCell>John Doe</TableCell>
                    <TableCell>Credit note processed for returned goods</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="attachments">
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Public Access</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Uploader</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell>invoice.pdf</TableCell>
                    <TableCell>Original invoice</TableCell>
                    <TableCell>No</TableCell>
                    <TableCell>2023-06-15</TableCell>
                    <TableCell>Jane Smith</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activityLog">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>2023-06-15 09:30:00</TableCell>
                    <TableCell>John Doe</TableCell>
                    <TableCell>Created credit note</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Transaction Currency (THB)</TableHead>
                <TableHead>Base Currency (THB)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Net</TableCell>
                <TableCell>1000.00</TableCell>
                <TableCell>1000.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Tax</TableCell>
                <TableCell>70.00</TableCell>
                <TableCell>70.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total</TableCell>
                <TableCell>1070.00</TableCell>
                <TableCell>1070.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <GRNSelection
        isOpen={isGRNSelectionOpen}
        onClose={() => {
          console.log("Closing GRNSelection")
          setIsGRNSelectionOpen(false)
        }}
        onSelect={handleGRNSelect}
        vendorId={selectedVendor}
      />

      <ItemAndLotSelection
        isOpen={isItemSelectionOpen}
        onClose={() => {
          console.log("Closing ItemAndLotSelection")
          setIsItemSelectionOpen(false)
        }}
        onSave={handleItemSave}
        grnItems={selectedGrnItems}
        grnNumber={grnNumber}
        creditNoteType={creditNoteType}
      />

      <ItemDetailsEdit
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveEditedItem}
        item={editingItem}
        creditNoteType={creditNoteType}
      />
    </div>
  )
}
