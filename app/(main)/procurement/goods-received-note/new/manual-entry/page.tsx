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
import { Vendor } from '@/app/(main)/vendor-management/manage-vendors/[id]/types'; // Assuming Vendor type exists
import { GoodsReceiveNoteItem, GoodsReceiveNote } from '@/lib/types';
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Trash2, PlusCircle, ChevronLeft } from 'lucide-react'

// Mock data - replace with actual API calls
const MOCK_VENDORS: Vendor[] = [
  { id: 'vendor-1', companyName: 'Global Foods Inc.', businessRegistrationNumber: 'BRN001', taxId: 'T001', establishmentDate: '2000-01-01', businessTypeId: 'Food', rating: 4, isActive: true, addresses: [], contacts: [], certifications: [] },
  { id: 'vendor-2', companyName: 'Local Produce Suppliers', businessRegistrationNumber: 'BRN002', taxId: 'T002', establishmentDate: '2010-05-15', businessTypeId: 'Produce', rating: 5, isActive: true, addresses: [], contacts: [], certifications: [] },
  { id: 'vendor-3', companyName: 'Specialty Imports Ltd.', businessRegistrationNumber: 'BRN003', taxId: 'T003', establishmentDate: '2005-11-20', businessTypeId: 'Import', rating: 3, isActive: false, addresses: [], contacts: [], certifications: [] },
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
    if (field === 'name') {
        const selectedMockItem = MOCK_ITEMS.find(i => i.name === value);
        if (selectedMockItem) {
            currentItem.unit = selectedMockItem.unit;
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
    if (!localDetails.vendor || !localDetails.date || localItems.length === 0 || localItems.some(item => !item.name || !item.receivedQuantity || !item.location))
    {
      alert("Please fill in Vendor, Date, and ensure all items have Name, Quantity, and Location.");
      return;
    }

    // Update store with header details (optional, could just use localDetails)
    // setGrnDetails(localDetails);

    // Filter out potentially empty rows and ensure required fields are present
    // Also add default/calculated values if needed
    const finalItems = localItems.filter(item => item.name && item.receivedQuantity && item.location)
                                .map(item => ({
                                    id: item.id || crypto.randomUUID(),
                                    name: item.name || '',
                                    description: item.description || '',
                                    orderedQuantity: item.orderedQuantity || 0, // Manual doesn't have ordered quantity
                                    receivedQuantity: item.receivedQuantity || 0,
                                    unit: item.unit || '',
                                    unitPrice: item.unitPrice || 0,
                                    // TODO: Implement proper calculation based on PRD 3.4.5.5
                                    subTotalAmount: (item.receivedQuantity || 0) * (item.unitPrice || 0), // Simplified
                                    totalAmount: (item.receivedQuantity || 0) * (item.unitPrice || 0), // Simplified
                                    taxRate: 0, // Default
                                    taxAmount: 0, // Simplified
                                    discountRate: 0, // Default
                                    discountAmount: 0, // Simplified
                                    netAmount: (item.receivedQuantity || 0) * (item.unitPrice || 0), // Simplified
                                    baseCurrency: 'USD', // Default or get from settings
                                    baseQuantity: item.receivedQuantity || 0, // Assuming 1:1 conversion for manual
                                    baseUnitPrice: item.unitPrice || 0,
                                    baseUnit: item.unit || '',
                                    baseSubTotalAmount: (item.receivedQuantity || 0) * (item.unitPrice || 0), // Simplified
                                    baseNetAmount: (item.receivedQuantity || 0) * (item.unitPrice || 0), // Simplified
                                    baseTotalAmount: (item.receivedQuantity || 0) * (item.unitPrice || 0), // Simplified
                                    baseTaxRate: 0, // Default
                                    baseTaxAmount: 0, // Simplified
                                    baseDiscountRate: 0, // Default
                                    baseDiscountAmount: 0, // Simplified
                                    conversionRate: 1, // Default
                                    currency: 'USD', // Default or get from settings
                                    exchangeRate: 1, // Default
                                    extraCost: 0, // Default
                                    inventoryOnHand: 0, // TBD - fetch if needed
                                    inventoryOnOrder: 0,
                                    inventoryReorderThreshold: 0,
                                    inventoryRestockLevel: 0,
                                    purchaseOrderRef: 'Manual', // Indicate manual entry
                                    lastPurchasePrice: 0,
                                    lastOrderDate: new Date(),
                                    lastVendor: localDetails.vendor || '',
                                    lotNumber: '', // TBD
                                    deliveryPoint: item.location || '',
                                    deliveryDate: localDetails.date || new Date(),
                                    location: item.location || '',
                                    isFreeOfCharge: false, // Default
                                    taxIncluded: false, // Default
                                    jobCode: '', // Default
                                    adjustments: { discount: false, tax: false }, // Default
                                }) as GoodsReceiveNoteItem);

    // Construct the main GRN object
    const tempId = `new-${crypto.randomUUID()}`;
    const newGRNData: GoodsReceiveNote = {
        id: tempId,
        ref: localDetails.reference || `GRN-MANUAL-${tempId.substring(0, 8)}`, // Generate manual ref
        selectedItems: [],
        date: localDetails.date || new Date(),
        invoiceDate: localDetails.date || new Date(), // Use GRN date as default
        invoiceNumber: '', // Manual entry might not have invoice initially
        description: localDetails.remarks || `Manual GRN created on ${format(new Date(), 'PPP')}`,
        receiver: 'Current User', // Get current user
        vendor: localDetails.vendor || '',
        vendorId: MOCK_VENDORS.find(v => v.companyName === localDetails.vendor)?.id || '', // Get ID from mock data
        location: 'Main Warehouse', // Default or TBD
        currency: 'USD', // Default
        status: 'Received', // Initial status
        items: finalItems,
        stockMovements: [],
        isConsignment: false, // Default
        isCash: false, // Default
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
                                    value={item.name || ''}
                                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
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
                                 <Select onValueChange={(value) => handleItemChange(index, 'location', value)} value={item.location as string | undefined}>
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
                                    value={item.unitPrice || ''}
                                    onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
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