'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GoodsReceiveNote, Vendor } from '@/lib/types'
import type { GoodsReceiveNoteItem } from '@/lib/types'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Search, ArrowUpDown, AlertCircle, Table } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Local types
type SortConfig = {
  key: keyof GoodsReceiveNote | null
  direction: 'ascending' | 'descending'
}

type CreditNoteType = 'item-based' | 'amount-only' | null

type SelectedItem = GoodsReceiveNoteItem & {
  creditQuantity: number
  creditPrice: number,
  lotNumber: string
  creditLotNumber: string
}

type Errors = {
  items?: string
  amount?: string
  reason?: string
  [key: string]: string | undefined
}

// id: string;
// companyName: string;
// businessRegistrationNumber: string;
// taxId: string;
// establishmentDate: string;
// businessTypeId: string;
// isActive: boolean;
// addresses: Address[];
// contacts: Contact[];
// rating: number;
// Update mock data to use the correct types
const mockVendors: Vendor[] = [

  { id: '1', companyName: 'Supplier A',businessRegistrationNumber : '1234567890', taxId: '1234567890', establishmentDate: '2024-01-01', businessTypeId: '1234567890', isActive: true, rating: 4.5,
    contacts : 
    [ { id: '1', name: 'John Doe', position: 'Manager', phone: '123-456-7890', email: 'john.doe@example.com', department: 'Sales', isPrimary: true } ], 
    addresses: [
      { id: '1', addressType: 'MAIN', addressLine: '123 Main St', subDistrictId: '1', districtId: '1', provinceId: '1', postalCode: '10100', isPrimary: true },
    ],
  },
  { id: '2', companyName: 'Vendor B', businessRegistrationNumber : '1234567890', taxId: '1234567890', establishmentDate: '2024-01-01', businessTypeId: '1234567890', isActive: true, rating: 4.5,
    contacts : 
    [ { id: '2', name: 'Jane Smith', position: 'Sales Manager', phone: '234-567-8901', email: 'jane.smith@example.com', department: 'Sales', isPrimary: true } ], 
    addresses: [
      { id: '2', addressType: 'BILLING', addressLine: '456 Oak St', subDistrictId: '2', districtId: '2', provinceId: '2', postalCode: '20200', isPrimary: false },
    ],
  },
  { id: '3', companyName: 'Company C', businessRegistrationNumber : '1234567890', taxId: '1234567890', establishmentDate: '2024-01-01', businessTypeId: '1234567890', isActive: true, rating: 4.5,
    contacts : 
    [ { id: '3', name: 'Bob Johnson', position: 'Sales Manager', phone: '345-678-9012', email: 'bob.johnson@example.com', department: 'Sales', isPrimary: true } ], 
    addresses: [
      { id: '3', addressType: 'SHIPPING', addressLine: '789 Pine St', subDistrictId: '3', districtId: '3', provinceId: '3', postalCode: '30300', isPrimary: false },
    ],
  },
]

// grnItemId: number;
// grnRefNo: string;
// poLineId: number;
// itemId: number;
// storeLocationId: number;
// receivedQuantity: number;
// receivedUnitId: number;
// isFOC: boolean;
// price: number;
// taxAmount: number;
// totalAmount: number;
// status: GRNItemStatus;
// deliveryPoint?: string;
// basePrice: number;
// baseQuantity: number;
// extraCost: number;
// totalCost: number;
// discountAdjustment: boolean;
// discountAmount?: number;
// taxAdjustment: boolean;
// lotNumber?: string;
// expiryDate?: Date;
// comment?: string;

const mockGRNItems: GoodsReceiveNoteItem[] = [
  // { id: '1', name: 'Item A', quantity: 10, price: 50, total: 500, lotNumber: 'LOT001', expirationDate: new Date('2024-12-31') },
  // { id: '2', name: 'Item B', quantity: 5, price: 100, total: 500, lotNumber: 'LOT002', expirationDate: new Date('2024-11-30') },
  // { id: '3', name: 'Item C', quantity: 20, price: 25, total: 500, lotNumber: 'LOT003', expirationDate: new Date('2024-10-31') },
  // { id: '4', name: 'Item D', quantity: 2, price: 250, total: 500, lotNumber: 'LOT004', expirationDate: new Date('2024-09-30') },

  {
    id: '1',
    name: 'Item A',
    description: 'Item A',
    jobCode: 'Item A',
    orderedQuantity: 100,
    receivedQuantity: 100,
    unit: 'EA',
    unitPrice: 50,
    subTotalAmount: 5000,
    totalAmount: 5035,
    taxRate: 7,
    taxAmount: 35,
    discountRate: 0,
    discountAmount: 0,
    netAmount: 5035,
    expiryDate: new Date('2024-12-31'),
    serialNumber: '1234567890',
    notes: 'First item received',
    baseCurrency: 'THB',
    baseQuantity: 100,
    extraCost: 0,
    baseUnitPrice: 50,
    baseUnit: 'EA',
    baseSubTotalAmount: 5000,
    baseNetAmount: 5035,
    baseTotalAmount: 5035,
    baseTaxAmount: 35,
    baseDiscountAmount: 0,
    baseDiscountRate: 0,
    baseTaxRate: 7,
    conversionRate: 1,
    currency: 'THB',
    exchangeRate: 1,
    inventoryOnHand: 100,
    inventoryOnOrder: 0,
    inventoryReorderThreshold: 10,
    inventoryRestockLevel: 10,
    purchaseOrderRef: 'PO001',
    lastPurchasePrice: 50,
    lastOrderDate: new Date('2024-12-31'),
    lastVendor: 'Vendor A',
    lotNumber: 'LOT001',
    deliveryPoint: 'Warehouse A',
    deliveryDate: new Date('2024-12-31'),
    location: 'Warehouse A',
    isFreeOfCharge: false,
    taxIncluded: true,
    adjustments: {
      discount: false,
      tax: false,
    }
  },
    {
      id: '2',
      name: 'Item B',
      description: 'Item B',
      jobCode: 'Item B',
      orderedQuantity: 100,
      receivedQuantity: 100,
      unit: 'EA',
      unitPrice: 100,
      subTotalAmount: 10000,
      totalAmount: 10700,
      taxRate: 7,
      taxAmount: 700,
      discountRate: 0,
      discountAmount: 0,
      netAmount: 10700,
      expiryDate: new Date('2024-12-31'),
      serialNumber: '1234567890',
      notes: 'Second item received',
      baseCurrency: 'THB',
      baseQuantity: 100,
      extraCost: 0,
      baseUnitPrice: 100,
      baseUnit: 'EA',
      baseSubTotalAmount: 10000,
      baseNetAmount: 10700,
      baseTotalAmount: 10700,
      baseTaxAmount: 700,
      baseDiscountAmount: 0,
      baseDiscountRate: 0,
      baseTaxRate: 7,
      conversionRate: 1,
      currency: 'THB',
      exchangeRate: 1,
      inventoryOnHand: 100,
      inventoryOnOrder: 0,
      inventoryReorderThreshold: 10,
      inventoryRestockLevel: 10,
      purchaseOrderRef: 'PO002',
      lastPurchasePrice: 100,
      lastOrderDate: new Date('2024-12-31'),
      lastVendor: 'Vendor B',
      lotNumber: 'LOT002',
      deliveryPoint: 'Warehouse B',
      deliveryDate: new Date('2024-12-31'),
      location: 'Warehouse B',
      isFreeOfCharge: false,
      taxIncluded: true,
      adjustments: {
        discount: false,
        tax: false,
      },
    }
]

const mockGoodsReceiveNotes: GoodsReceiveNote[] = [
  // { id: '1', vendorId: '1', items: mockGRNItems, totalAmount: 2000, date: new Date('2023-10-15'), status: 'completed', invoiceNumber: 'INV-001' },
  // { id: '2', vendorId: '2', items: mockGRNItems.slice(0, 2), totalAmount: 1000, date: new Date('2023-10-10'), status: 'completed', invoiceNumber: 'INV-002' },
  // { id: '3', vendorId: '3', items: mockGRNItems.slice(1, 3), totalAmount: 1500, date: new Date('2023-10-20'), status: 'completed', invoiceNumber: 'INV-003' },
  // { id: '4', vendorId: '4', items: mockGRNItems.slice(2, 4), totalAmount: 1750, date: new Date('2023-10-05'), status: 'completed', invoiceNumber: 'INV-004' },
  // { id: '5', vendorId: '5', items: mockGRNItems, totalAmount: 2000, date: new Date('2023-10-18'), status: 'completed', invoiceNumber: 'INV-005' },

  { 
    id: '1', 
    vendorId: mockVendors[0].id, 
    items: mockGRNItems.map(item => ({
      ...item,
      id: item.id.toString(),
      name: item.name.toString(),
      description: item.description.toString(),
      jobCode: item.jobCode.toString(),
      // Add other required properties
    })), 
    totalAmount: 15675, 
    date: new Date('2023-10-15'), 
    status: "Received",
    invoiceNumber: 'INV-001',
    ref: 'REF-001',
    invoiceDate: new Date('2023-10-15'),
    description: 'Invoice for Item A',
    receiver: 'Receiver A',
    location: 'Warehouse A',
    currency: 'THB',
    exchangeRate: 1,
    baseCurrency: 'THB',
    baseSubTotalPrice: 15675,
    subTotalPrice: 15675,
    baseNetAmount: 15675,
    netAmount: 15675,
    baseDiscAmount: 0,
    discountAmount: 0,
    baseTaxAmount: 1075,
    taxAmount: 1075,
    extraCosts: [],
    stockMovements: [],
    comments: [],
    attachments: [],
    activityLog: [],
    financialSummary: null,
    baseTotalAmount: 15675,
    creditTerms: 'Due on receipt',
    dueDate: new Date('2023-10-15'),
    selectedItems: [],
    vendor: mockVendors[0].companyName,
    isConsignment: false,
    isCash: false,
  },
  {
    id: '2',
    vendorId: mockVendors[1].id,
    items: mockGRNItems.map(item => ({
      ...item,
      id: item.id.toString(),
      name: item.name.toString(),
      description: item.description.toString(),
      jobCode: item.jobCode.toString(),
      // Add other required properties
    })), 
    totalAmount: 15675, 
    date: new Date('2023-10-15'), 
    status: "Received",
    invoiceNumber: 'INV-001',
    ref: 'REF-001',
    invoiceDate: new Date('2023-10-15'),  
    description: 'Invoice for Item B',
    receiver: 'Receiver B',
    location: 'Warehouse B',
    currency: 'THB',
    exchangeRate: 1,
    baseCurrency: 'THB',
    baseSubTotalPrice: 15675,
    subTotalPrice: 15675,
    baseNetAmount: 15675, 
    netAmount: 15675,
    baseDiscAmount: 0,
    discountAmount: 0,
    baseTaxAmount: 1075,
    taxAmount: 1075,
    extraCosts: [],
    stockMovements: [],
    comments: [],
    attachments: [],
    activityLog: [],
    financialSummary: null,
    baseTotalAmount: 15675,
    creditTerms: 'Due on receipt',
    dueDate: new Date('2023-10-15'),
    selectedItems: [],
    vendor: mockVendors[1].companyName,
    isConsignment: false,
    isCash: false,  
  }
]

// Define the custom type that matches what we're actually passing to the function
interface ItemBasedCreditNote {
  type: 'item-based';
  vendor: string | number | undefined;
  items: Array<SelectedItem & { gainLoss: number }>;
}

interface AmountOnlyCreditNote {
  type: 'amount-only';
  vendor: string | number | undefined;
  amount: number;
  reason: string;
}

type CreatedCreditNote = ItemBasedCreditNote | AmountOnlyCreditNote;

interface VendorSelectionProps {
  onCreditNoteCreate?: (creditNote: CreatedCreditNote) => void
}

export function VendorSelection({ onCreditNoteCreate }: VendorSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' })
  const [selectedGRN, setSelectedGRN] = useState<GoodsReceiveNote | null>(null)
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [creditNoteType, setCreditNoteType] = useState<CreditNoteType>(null)
  const [amountOnlyValue, setAmountOnlyValue] = useState('')
  const [amountOnlyReason, setAmountOnlyReason] = useState('')
  const [currentStep, setCurrentStep] = useState<'selectType' | 'selectGRN' | 'chooseItems' | 'adjustQuantities' | 'reviewItemBased' | 'enterAmount' | 'reviewAmountOnly' | 'summary'>('selectType')
  const [errors, setErrors] = useState<Errors>({})
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(true)

  const router = useRouter();

  useEffect(() => {
    setIsTypeDialogOpen(true)
  }, [])

  const sortedGRNs = useMemo(() => {
    const sortableGRNs = [...mockGoodsReceiveNotes];
    if (sortConfig.key) {
      sortableGRNs.sort((a, b) => {
        const key = sortConfig.key as keyof GoodsReceiveNote;
        const aValue = String(a[key] ?? '');
        const bValue = String(b[key] ?? '');
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableGRNs;
  }, [sortConfig.key, sortConfig.direction]);

  const filteredGRNs = useMemo(() => {
    return sortedGRNs.filter(grn => 
      grn.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mockVendors.find(v => v.id === grn.vendorId)?.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [sortedGRNs, searchTerm])

  const requestSort = (key: keyof GoodsReceiveNote) => {
    let direction: 'ascending' | 'descending' = 'ascending'
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  const SortableHeader = ({ label, sortKey }: { label: string, sortKey: keyof GoodsReceiveNote }) => (
    <Button
      variant="ghost"
      onClick={() => requestSort(sortKey)}
      className="flex items-center justify-between p-1 h-auto w-full text-left hover:bg-transparent"
    >
      <span className="font-medium">{label}</span>
      <ArrowUpDown className={`h-4 w-4 ${sortConfig.key === sortKey ? 'text-primary' : 'text-muted-foreground'}`} />
    </Button>
  )

  const handleGRNSelect = (grn: GoodsReceiveNote) => {
    setSelectedGRN(grn)
    setSelectedItems([])
    setCurrentStep(creditNoteType === 'item-based' ? 'chooseItems' : 'enterAmount')
  }

  const handleItemSelect = (item: GoodsReceiveNoteItem) => {
    setSelectedItems(prev => {
      const isSelected = prev.find(i => i.id === item.id && i.lotNumber === item.lotNumber && i.creditLotNumber === item.lotNumber)
      if (isSelected) {
        return prev.filter(i => i.id !== item.id || i.lotNumber !== item.lotNumber || i.creditLotNumber !== item.lotNumber)
      } else {
        return [...prev, { ...item, creditQuantity: item.receivedQuantity, creditPrice: item.unitPrice, creditLotNumber: item.lotNumber }]
      }
    })
  }

  const handleCreditNoteCancel = () => {
    setIsConfirmDialogOpen(false)
    router.push(`/procurement/credit-note`);
  }

  const handleQuantityChange = (id: string, value: string) => {
    setSelectedItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, creditQuantity: parseInt(value) || 0, total: (parseInt(value) || 0) * item.creditPrice } 
          : item
      )
    )
  }

  const handlePriceChange = (id: string, value: string) => {
    setSelectedItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, creditPrice: parseFloat(value) || 0, total: item.creditQuantity * (parseFloat(value) || 0) } 
          : item
      )
    )
  }

  const handleLotNumberChange = (id: string, value: string) => {
    setSelectedItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, creditLotNumber: value } 
          : item
      )
    )
  }

  const calculateGainLoss = (item: SelectedItem) => {
    const originalValue = item.receivedQuantity * item.unitPrice
    const creditValue = item.creditQuantity * item.creditPrice
    return creditValue - originalValue
  }

  const validateForm = () => {
    const newErrors: Errors = {}

    if (creditNoteType === 'item-based') {
      if (selectedItems.length === 0) {
        newErrors.items = 'Please select at least one item'
      }
      selectedItems.forEach(item => {
        if (item.creditQuantity <= 0) {
          newErrors[`quantity_${item.id}`] = 'Quantity must be greater than 0'
        }
        if (item.creditPrice <= 0) {
          newErrors[`price_${item.id}`] = 'Price must be greater than 0'
        }
      })
    } else {
      if (!amountOnlyValue || parseFloat(amountOnlyValue) <= 0) {
        newErrors.amount = 'Please enter a valid amount'
      }
      if (!amountOnlyReason.trim()) {
        newErrors.reason = 'Please provide a reason for the credit note'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateCreditNote = () => {
    if (validateForm()) {
      setIsConfirmDialogOpen(true)
    }
  }

  const confirmCreateCreditNote = () => {
    if (!onCreditNoteCreate) return

    if (creditNoteType === 'item-based') {
      onCreditNoteCreate({ 
        type: 'item-based',
        vendor: selectedGRN?.vendorId, 
        items: selectedItems.map(item => ({
          ...item,
          gainLoss: calculateGainLoss(item)
        }))
      })
    } else {
      onCreditNoteCreate({
        type: 'amount-only',
        vendor: selectedGRN?.vendorId,
        amount: parseFloat(amountOnlyValue),
        reason: amountOnlyReason
      })
    }
    router.push(`/procurement/credit-note/1`)
  }

  const getProgressPercentage = () => {
    const steps = ['selectType', 'selectGRN', 'chooseItems', 'adjustQuantities', 'reviewItemBased', 'enterAmount', 'reviewAmountOnly', 'summary']
    return ((steps.indexOf(currentStep) + 1) / steps.length) * 100
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'selectType':
        return (
          <Dialog open={isTypeDialogOpen} onOpenChange={setIsTypeDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Credit Note Type</DialogTitle>
                <DialogDescription>Choose the type of credit note you want to create</DialogDescription>
              </DialogHeader>
              <RadioGroup
                onValueChange={(value) => {
                  setCreditNoteType(value as CreditNoteType)
                  setCurrentStep('selectGRN')
                  setIsTypeDialogOpen(false)
                }}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <RadioGroupItem value="item-based" id="item-based" />
                  <Label htmlFor="item-based">Item-based</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="amount-only" id="amount-only" />
                  <Label htmlFor="amount-only">Amount-only</Label>
                </div>
              </RadioGroup>
            </DialogContent>
          </Dialog>
        )
      case 'selectGRN':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Select Goods Receive Note</CardTitle>
              <CardDescription>Choose a GRN for the credit note</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search GRN, invoice number, or vendor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><SortableHeader label="GRN ID" sortKey="id" /></TableHead>
                      <TableHead><SortableHeader label="Vendor" sortKey="vendorId" /></TableHead>
                      <TableHead><SortableHeader label="Invoice Number" sortKey="invoiceNumber" /></TableHead>
                      <TableHead><SortableHeader label="Date" sortKey="date" /></TableHead>
                      <TableHead className="text-right"><SortableHeader label="Total Amount" sortKey="totalAmount" /></TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGRNs.map((grn) => (
                      <TableRow key={grn.id}>
                        <TableCell>{grn.id}</TableCell>
                        <TableCell>{mockVendors.find(v => v.id === grn.vendorId)?.companyName}</TableCell>
                        <TableCell>{grn.invoiceNumber}</TableCell>
                        <TableCell>{grn.date.toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">{grn.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button onClick={() => handleGRNSelect(grn)} size="sm">
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )
      case 'chooseItems':
      case 'adjustQuantities':
        return (
          <Dialog open={selectedGRN !== null} onOpenChange={() => setSelectedGRN(null)}>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>{currentStep === 'chooseItems' ? 'Select Items for Credit Note' : 'Adjust Quantities, Prices, and Lot Numbers'}</DialogTitle>
                <DialogDescription>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="font-semibold">Vendor Details:</p>
                      <p>Name: {mockVendors.find(v => v.id === selectedGRN?.vendorId)?.companyName}</p>
                      <p>Invoice Number: {selectedGRN?.invoiceNumber}</p>
                      <p>Invoice Date: {selectedGRN?.date.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Financial Details:</p>
                      <p>Currency: {selectedGRN?.currency}</p>
                      <p>Net Amount: {selectedGRN?.netAmount.toFixed(2)}</p>
                      <p>Tax Amount: {selectedGRN?.taxAmount.toFixed(2)}</p>
                      <p>Total Amount: {selectedGRN?.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="font-semibold">GRN Details:</p>
                    <p>Last GRN: {selectedGRN?.ref}</p>
                    <p>Last Delivery Date: {selectedGRN?.date.toLocaleDateString()}</p>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[400px] mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Select</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Reference Lot</TableHead>
                      <TableHead>Credit Lot</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Gain/Loss</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockGRNItems.map((item) => {
                      const selectedItem = selectedItems.find(i => i.id === item.id)
                      const gainLoss = selectedItem ? calculateGainLoss(selectedItem) : 0
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Checkbox
                              id={`item-${item.id}`}
                              checked={selectedItem !== undefined}
                              onCheckedChange={() => handleItemSelect(item)}
                            />
                          </TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.lotNumber}</TableCell>
                          <TableCell>
                            {selectedItem && (
                              <Select
                                value={selectedItem.creditLotNumber}
                                onValueChange={(value) => handleLotNumberChange(item.id, value)}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Select a lot" />
                                </SelectTrigger>
                                <SelectContent>
                                  {item.availableLots?.map((lot) => (
                                    <SelectItem key={lot.lotNumber} value={lot.lotNumber}>{lot.lotNumber}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </TableCell>
                          <TableCell>
                            {selectedItem ? (
                              <Input
                                type="number"
                                value={selectedItem.creditQuantity}
                                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                min="1"
                                max={item.receivedQuantity}
                                className="w-20"
                              />
                            ) : (
                              item.receivedQuantity
                            )}
                            {errors[`quantity_${item.id}`] && (
                              <p className="text-red-500 text-xs mt-1">{errors[`quantity_${item.id}`]}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            {selectedItem ? (
                              <Input
                                type="number"
                                value={selectedItem.creditPrice}
                                onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                min="0"
                                step="0.01"
                                className="w-24"
                              />
                            ) : (
                              `${selectedGRN?.currency} ${item.unitPrice.toFixed(2)}`
                            )}
                            {errors[`price_${item.id}`] && (
                              <p className="text-red-500 text-xs mt-1">{errors[`price_${item.id}`]}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            {selectedItem
                              ? `${selectedGRN?.currency} ${(selectedItem.creditQuantity * selectedItem.creditPrice).toFixed(2)}`
                              : `${selectedGRN?.currency} ${item.totalAmount.toFixed(2)}`
                            }
                          </TableCell>
                          <TableCell>
                            {selectedItem && (
                              <Badge variant={gainLoss >= 0 ? "default" : "destructive"}>
                                {gainLoss >= 0 ? '+' : '-'}${Math.abs(gainLoss).toFixed(2)}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
              {errors.items && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errors.items}</AlertDescription>
                </Alert>
              )}
              <DialogFooter>
                <Button onClick={() => setCurrentStep('reviewItemBased')} className="w-full mt-4" disabled={selectedItems.length === 0}>
                  {currentStep === 'chooseItems' ? 'Proceed to Review' : 'Review Credit Note'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      case 'enterAmount':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Enter Credit Note Amount</CardTitle>
              <CardDescription>Vendor: {mockVendors.find(v => v.id === selectedGRN?.vendorId)?.companyName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    placeholder="Enter amount"
                    type="number"
                    value={amountOnlyValue}
                    onChange={(e) => setAmountOnlyValue(e.target.value)}
                  />
                  {errors.amount && <p className="text-red-500 text-xs">{errors.amount}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    placeholder="Enter reason for credit note"
                    value={amountOnlyReason}
                    onChange={(e) => setAmountOnlyReason(e.target.value)}
                  />
                  {errors.reason && <p className="text-red-500 text-xs">{errors.reason}</p>}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setCurrentStep('reviewAmountOnly')} className="w-full" disabled={!amountOnlyValue || !amountOnlyReason}>
                Review Credit Note
              </Button>
            </CardFooter>
          </Card>
        )
      case 'reviewItemBased':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Review Item-based Credit Note</CardTitle>
              <CardDescription>Vendor: {mockVendors.find(v => v.id === selectedGRN?.vendorId)?.companyName}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Reference Lot</TableHead>
                      <TableHead>Credit Lot</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Gain/Loss</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItems.map((item) => {
                      const gainLoss = calculateGainLoss(item)
                      return (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.lotNumber}</TableCell>
                          <TableCell>{item.creditLotNumber}</TableCell>
                          <TableCell>{item.creditQuantity}</TableCell>
                          <TableCell>{selectedGRN?.currency} {item.creditPrice.toFixed(2)}</TableCell>
                          <TableCell>{selectedGRN?.currency} {(item.creditQuantity * item.creditPrice).toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={gainLoss >= 0 ? "default" : "destructive"}>
                              {gainLoss >= 0 ? '+' : '-'}${Math.abs(gainLoss).toFixed(2)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
              <div className="mt-4 text-right">
                <p className="font-semibold">Total Credit Amount: {selectedGRN?.currency} {selectedItems.reduce((sum, item) => sum + item.creditQuantity * item.creditPrice, 0).toFixed(2)}</p>
                <p className="font-semibold">Total Gain/Loss: {selectedGRN?.currency} {selectedItems.reduce((sum, item) => sum + calculateGainLoss(item), 0).toFixed(2)}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('adjustQuantities')}>
                Back to Adjust
              </Button>
              <Button onClick={() => setCurrentStep('summary')}>
                Proceed to Summary
              </Button>
            </CardFooter>
          </Card>
        )
      case 'reviewAmountOnly':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Review Amount-only Credit Note</CardTitle>
              <CardDescription>Vendor: {mockVendors.find(v => v.id === selectedGRN?.vendorId)?.companyName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold">Amount:</p>
                  <p>{selectedGRN?.currency} {parseFloat(amountOnlyValue).toFixed(2)}</p>
                </div>
                <div>
                  <p className="font-semibold">Reason:</p>
                  <p>{amountOnlyReason}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('enterAmount')}>
                Back to Edit
              </Button>
              <Button onClick={() => setCurrentStep('summary')}>
                Proceed to Summary
              </Button>
            </CardFooter>
          </Card>
        )
      case 'summary':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Credit Note Summary</CardTitle>
              <CardDescription>Review the details before creating the credit note</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold">Vendor:</p>
                  <p>{mockVendors.find(v => v.id === selectedGRN?.vendorId)?.companyName}</p>
                </div>
                <div>
                  <p className="font-semibold">Credit Note Type:</p>
                  <p>{creditNoteType === 'item-based' ? 'Item-based' : 'Amount-only'}</p>
                </div>
                {creditNoteType === 'item-based' ? (
                  <div>
                    <p className="font-semibold">Items:</p>
                    <ul className="list-disc list-inside">
                      {selectedItems.map(item => (
                        <li key={item.id}>
                          {item.name} - Quantity: {item.creditQuantity}, Price: {selectedGRN?.currency} {item.creditPrice.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                    <p className="font-semibold mt-2">Total Credit Amount: {selectedGRN?.currency} {selectedItems.reduce((sum, item) => sum + item.creditQuantity * item.creditPrice, 0).toFixed(2)}</p>
                    <p className="font-semibold">Total Gain/Loss: {selectedGRN?.currency} {selectedItems.reduce((sum, item) => sum + calculateGainLoss(item), 0).toFixed(2)}</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold">Amount:</p>
                    <p>{selectedGRN?.currency} {parseFloat(amountOnlyValue).toFixed(2)}</p>
                    <p className="font-semibold mt-2">Reason:</p>
                    <p>{amountOnlyReason}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(creditNoteType === 'item-based' ? 'reviewItemBased' : 'reviewAmountOnly')}>
                Back to Review
              </Button>
              <Button onClick={handleCreateCreditNote}>
                Create Credit Note
              </Button>
            </CardFooter>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <Progress value={getProgressPercentage()} className="w-full" />
      {renderStep()}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Credit Note Creation</DialogTitle>
            <DialogDescription>
              Are you sure you want to create this credit note? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleCreditNoteCancel()}>Cancel</Button>
            <Button onClick={confirmCreateCreditNote}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}