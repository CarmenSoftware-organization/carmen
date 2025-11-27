'use client'

import React, { useState } from 'react';
import { useGRNCreationStore } from '@/lib/store/grn-creation.store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Vendor, GoodsReceiveNoteItem, GoodsReceiveNote } from '@/lib/types';
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Trash2, PlusCircle, ChevronLeft } from 'lucide-react'

// Mock data - replace with actual API calls
const MOCK_VENDORS: Vendor[] = [
  {
    id: 'vendor-1',
    vendorCode: 'V001',
    companyName: 'Global Foods Inc.',
    businessRegistrationNumber: 'BRN001',
    taxId: 'T001',
    establishmentDate: '2000-01-01',
    businessType: 'distributor',
    status: 'active',
    rating: 4,
    isActive: true,
    preferredCurrency: 'USD',
    preferredPaymentTerms: 'Net 30',
    addresses: [],
    contacts: [],
    certifications: [],
    bankAccounts: []
  },
  {
    id: 'vendor-2',
    vendorCode: 'V002',
    companyName: 'Local Produce Suppliers',
    businessRegistrationNumber: 'BRN002',
    taxId: 'T002',
    establishmentDate: '2010-05-15',
    businessType: 'wholesaler',
    status: 'active',
    rating: 5,
    isActive: true,
    preferredCurrency: 'USD',
    preferredPaymentTerms: 'Net 15',
    addresses: [],
    contacts: [],
    certifications: [],
    bankAccounts: []
  },
  {
    id: 'vendor-3',
    vendorCode: 'V003',
    companyName: 'Specialty Imports Ltd.',
    businessRegistrationNumber: 'BRN003',
    taxId: 'T003',
    establishmentDate: '2005-11-20',
    businessType: 'distributor',
    status: 'inactive',
    rating: 3,
    isActive: false,
    preferredCurrency: 'USD',
    preferredPaymentTerms: 'Net 30',
    addresses: [],
    contacts: [],
    certifications: [],
    bankAccounts: []
  },
];
// Mock items for lookup
const MOCK_ITEMS = [
    { id: 'item-flour', name: 'Flour', unit: 'Kg' },
    { id: 'item-sugar', name: 'Sugar', unit: 'Kg' },
    { id: 'item-butter', name: 'Butter', unit: 'Kg' },
    { id: 'item-apples', name: 'Apples', unit: 'Kg' },
    { id: 'item-oranges', name: 'Oranges', unit: 'Kg' },
];
const MOCK_LOCATIONS = ['Main Warehouse', 'Store Room A', 'Receiving Bay'];

export default function ManualEntryPage() {
  const router = useRouter();
  const { setGrnDetails, setManualItems, setStep, grnDetails, manualItems, setNewlyCreatedGRNData } = useGRNCreationStore();
  const [localItems, setLocalItems] = useState<Partial<GoodsReceiveNoteItem>[]>(manualItems.length > 0 ? manualItems : [{ id: crypto.randomUUID() }]); // Start with one empty row or existing items
  const [localDetails, setLocalDetails] = useState<Partial<typeof grnDetails>>(grnDetails);

  const handleDetailChange = (field: keyof typeof grnDetails, value: any) => {
    setLocalDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof GoodsReceiveNoteItem, value: any) => {
    const updatedItems = [...localItems];
    const currentItem = { ...updatedItems[index] };
    (currentItem as any)[field] = value;

    // If item is selected from lookup, populate unit
    if ((field as string) === 'name') {
        const selectedMockItem = MOCK_ITEMS.find(i => i.name === value);
        if (selectedMockItem) {
            (currentItem as any).unit = selectedMockItem.unit;
            // Optionally set description or other fields based on lookup
            currentItem.description = selectedMockItem.name; // Example
        }
    }

    updatedItems[index] = currentItem;
    setLocalItems(updatedItems);
  };

  const handleAddItem = () => {
    setLocalItems([...localItems, { id: crypto.randomUUID() }]);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = localItems.filter((_, i) => i !== index);
    setLocalItems(updatedItems);
  };

  const handleNext = () => {
    // Basic validation
    if (!localDetails.vendor || !localDetails.date || localItems.length === 0 || localItems.some(item => !(item as any).name || !(item as any).receivedQuantity || !(item as any).location))
    {
      alert("Please fill in Vendor, Date, and ensure all items have Name, Quantity, and Location.");
      return;
    }

    // Update store with header details (optional, could just use localDetails)
    // setGrnDetails(localDetails);

    // Filter out potentially empty rows and ensure required fields are present
    // Also add default/calculated values if needed
    const finalItems = localItems.filter(item => (item as any).name && (item as any).receivedQuantity && (item as any).location)
                                .map((item, index) => ({
                                    id: item.id || crypto.randomUUID(),
                                    grnId: '', // Will be set after GRN creation
                                    lineNumber: index + 1,
                                    itemId: (item as any).itemId || crypto.randomUUID(),
                                    itemCode: (item as any).itemCode || '',
                                    itemName: (item as any).name || '',
                                    description: (item as any).description || '',
                                    orderedQuantity: (item as any).orderedQuantity || 0,
                                    deliveredQuantity: (item as any).receivedQuantity || 0,
                                    receivedQuantity: (item as any).receivedQuantity || 0,
                                    rejectedQuantity: 0,
                                    damagedQuantity: 0,
                                    unit: (item as any).unit || '',
                                    unitPrice: {
                                        amount: (item as any).unitPrice || 0,
                                        currency: 'USD'
                                    },
                                    totalValue: {
                                        amount: ((item as any).receivedQuantity || 0) * ((item as any).unitPrice || 0),
                                        currency: 'USD'
                                    },
                                    lotNumber: (item as any).lotNumber || '',
                                    storageLocationId: (item as any).location || '',
                                    hasDiscrepancy: false,
                                    // Legacy fields for compatibility (remove in future refactor)
                                    name: (item as any).name || '',
                                    subTotalAmount: ((item as any).receivedQuantity || 0) * ((item as any).unitPrice || 0),
                                    totalAmount: ((item as any).receivedQuantity || 0) * ((item as any).unitPrice || 0),
                                    taxRate: 0,
                                    taxAmount: 0,
                                    discountRate: 0,
                                    discountAmount: 0,
                                    netAmount: ((item as any).receivedQuantity || 0) * ((item as any).unitPrice || 0),
                                    baseCurrency: 'USD',
                                    baseQuantity: (item as any).receivedQuantity || 0,
                                    baseUnitPrice: (item as any).unitPrice || 0,
                                    baseUnit: (item as any).unit || '',
                                    baseSubTotalAmount: ((item as any).receivedQuantity || 0) * ((item as any).unitPrice || 0),
                                    baseNetAmount: ((item as any).receivedQuantity || 0) * ((item as any).unitPrice || 0),
                                    baseTotalAmount: ((item as any).receivedQuantity || 0) * ((item as any).unitPrice || 0),
                                    baseTaxRate: 0,
                                    baseTaxAmount: 0,
                                    baseDiscountRate: 0,
                                    baseDiscountAmount: 0,
                                    conversionRate: 1,
                                    currency: 'USD',
                                    exchangeRate: 1,
                                    extraCost: 0,
                                    inventoryOnHand: 0,
                                    inventoryOnOrder: 0,
                                    inventoryReorderThreshold: 0,
                                    inventoryRestockLevel: 0,
                                    purchaseOrderRef: 'Manual',
                                    lastPurchasePrice: 0,
                                    lastOrderDate: new Date(),
                                    lastVendor: localDetails.vendor || '',
                                    deliveryPoint: (item as any).location || '',
                                    deliveryDate: localDetails.date || new Date(),
                                    location: (item as any).location || '',
                                    isFreeOfCharge: false,
                                    taxIncluded: false,
                                    jobCode: '',
                                    adjustments: { discount: false, tax: false },
                                }) as any);

    // Construct the main GRN object
    const tempId = `new-${crypto.randomUUID()}`;
    const newGRNData = {
        id: tempId,
        grnNumber: localDetails.reference || `GRN-MANUAL-${tempId.substring(0, 8)}`,
        receiptDate: localDetails.date || new Date(),
        vendorId: MOCK_VENDORS.find(v => v.companyName === localDetails.vendor)?.id || '',
        vendorName: localDetails.vendor || '',
        invoiceNumber: '',
        invoiceDate: localDetails.date || new Date(),
        status: 'RECEIVED' as any,
        receivedBy: 'Current User',
        locationId: 'Main Warehouse',
        totalItems: finalItems.length,
        totalQuantity: finalItems.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0),
        totalValue: {
            amount: finalItems.reduce((sum, item) => sum + ((item as any).totalAmount || 0), 0),
            currency: 'USD'
        },
        discrepancies: 0,
        // Legacy/extra fields for compatibility
        ref: localDetails.reference || `GRN-MANUAL-${tempId.substring(0, 8)}`,
        selectedItems: [],
        date: localDetails.date || new Date(),
        description: localDetails.remarks || `Manual GRN created on ${format(new Date(), 'PPP')}`,
        receiver: 'Current User',
        vendor: localDetails.vendor || '',
        location: 'Main Warehouse',
        currency: 'USD',
        items: finalItems,
        stockMovements: [],
        isConsignment: false,
        isCash: false,
        extraCosts: [],
        comments: [],
        attachments: [],
        activityLog: [],
        financialSummary: null,
        exchangeRate: 1,
        baseCurrency: 'USD',
        // Aggregate financial totals (simplified)
        baseSubTotalPrice: finalItems.reduce((sum, item) => sum + item.baseSubTotalAmount, 0),
        subTotalPrice: finalItems.reduce((sum, item) => sum + item.subTotalAmount, 0),
        baseNetAmount: finalItems.reduce((sum, item) => sum + item.baseNetAmount, 0),
        netAmount: finalItems.reduce((sum, item) => sum + item.netAmount, 0),
        baseDiscAmount: finalItems.reduce((sum, item) => sum + item.baseDiscountAmount, 0),
        discountAmount: finalItems.reduce((sum, item) => sum + item.discountAmount, 0),
        baseTaxAmount: finalItems.reduce((sum, item) => sum + item.baseTaxAmount, 0),
        taxAmount: finalItems.reduce((sum, item) => sum + item.taxAmount, 0),
        baseTotalAmount: finalItems.reduce((sum, item) => sum + item.baseTotalAmount, 0),
        totalAmount: finalItems.reduce((sum, item) => sum + item.totalAmount, 0),
    };

    // setManualItems(finalItems); // No longer need to store just manual items separately
    setNewlyCreatedGRNData(newGRNData); // Save the full GRN object
    // setStep('confirmation'); // Remove this step
    router.push(`/procurement/goods-received-note/${tempId}?mode=confirm`); // Navigate to detail page
  };

   const handleBack = () => {
       // Reset store or navigate back based on where manual entry was initiated from
       // For simplicity, just go back to the list page
       setStep('process-selection'); // Or potentially reset store completely
       router.push('/procurement/goods-received-note');
   };

  return (
    <Card>
      <CardHeader>
         <div className="flex justify-between items-center">
            <div>
                <CardTitle>Manual Goods Receive Note</CardTitle>
                <CardDescription>Enter GRN details and received items manually.</CardDescription>
            </div>
             <Button variant="outline" size="sm" onClick={handleBack}>
                 <ChevronLeft className="mr-2 h-4 w-4" /> Cancel / Back to List
             </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Header Details */}
        <div className="space-y-4 border p-4 rounded-md">
          <h3 className="text-lg font-medium mb-2">GRN Header</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="vendor">Vendor*</Label>
               <Select onValueChange={(value) => handleDetailChange('vendor', value)} value={localDetails.vendor as string | undefined}>
                <SelectTrigger id="vendor">
                    <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                    {MOCK_VENDORS.map(v => <SelectItem key={v.id} value={v.companyName}>{v.companyName}</SelectItem>)}
                </SelectContent>
                </Select>
            </div>
            <div>
              <Label htmlFor="reference">Reference #</Label>
              <Input id="reference" value={localDetails.reference || ''} onChange={(e) => handleDetailChange('reference', e.target.value)} />
            </div>
            <div>
                <Label htmlFor="date">Date*</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !localDetails.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {localDetails.date ? format(localDetails.date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={localDetails.date}
                        onSelect={(date) => handleDetailChange('date', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
            </div>
             <div className="md:col-span-3">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea id="remarks" value={localDetails.remarks || ''} onChange={(e) => handleDetailChange('remarks', e.target.value)} />
             </div>
          </div>
        </div>

        {/* Items Table */}
         <div className="space-y-4 border p-4 rounded-md">
            <h3 className="text-lg font-medium">Received Items</h3>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Item Name*</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Quantity*</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Location*</TableHead>
                        <TableHead>Unit Price</TableHead>
                         <TableHead className="w-[50px]"></TableHead> {/* Actions */}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {localItems.map((item, index) => (
                        <TableRow key={item.id || index}>
                            <TableCell>
                                 {/* Basic Input - Replace with Autocomplete/Combobox later */}
                                <Input
                                    value={(item as any).name || ''}
                                    onChange={(e) => handleItemChange(index, 'name' as any, e.target.value)}
                                    placeholder="Type to search item..."
                                />
                            </TableCell>
                             <TableCell>
                                <Input
                                    value={item.description || ''}
                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    type="number"
                                    value={item.receivedQuantity || ''}
                                    onChange={(e) => handleItemChange(index, 'receivedQuantity', parseFloat(e.target.value) || 0)}
                                    className="text-right"
                                    min="0"
                                />
                            </TableCell>
                            <TableCell>
                                 <Input
                                    value={item.unit || ''}
                                    onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                />
                            </TableCell>
                            <TableCell>
                                 <Select onValueChange={(value) => handleItemChange(index, 'location' as any, value)} value={(item as any).location as string | undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MOCK_LOCATIONS.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell>
                                <Input
                                    type="number"
                                    value={typeof (item as any).unitPrice === 'object' ? (item as any).unitPrice?.amount : (item as any).unitPrice || ''}
                                    onChange={(e) => handleItemChange(index, 'unitPrice' as any, parseFloat(e.target.value) || 0)}
                                     className="text-right"
                                    min="0"
                                />
                            </TableCell>
                             <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} disabled={localItems.length <= 1}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
             </div>
            <Button variant="outline" size="sm" onClick={handleAddItem}> <PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
        </div>

         {/* Footer Actions */}
        <div className="flex justify-end items-center mt-4">
          <Button onClick={handleNext}>
            Next: Confirm GRN
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 