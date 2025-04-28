'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { useGRNCreationStore } from '@/lib/store/grn-creation.store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowLeft } from 'lucide-react';
import { PurchaseOrder, PurchaseOrderItem, GoodsReceiveNoteItem, GoodsReceiveNote } from '@/lib/types';
import { Label } from '@/components/ui/label';


// Helper to flatten PO items and add PO reference
const flattenPOItems = (pos: PurchaseOrder[]): (PurchaseOrderItem & { poNumber: string, location?: string, isSelected?: boolean, receivingQuantity?: number })[] => {
  return pos.flatMap(po =>
    po.items.map(item => ({
      ...item,
      poNumber: po.number, // Add PO number reference
      location: item.inventoryInfo?.lastVendor || 'Default Location' // Placeholder for location logic
    }))
  );
};

export default function ItemLocationSelectionPage() {
  const router = useRouter();
  const {
    selectedVendor,
    selectedPOs,
    setNewlyCreatedGRNData, // Use the new action
    setStep,
    // Get existing selected GRN items if needed for updates
    selectedItems: existingSelectedGRNItems // This state now holds final GRN items
  } = useGRNCreationStore();

  const allPOItems = useMemo(() => flattenPOItems(selectedPOs), [selectedPOs]);

  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set());
  const [displayItems, setDisplayItems] = useState<typeof allPOItems>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({}); // { [itemId]: receivingQuantity }
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!selectedVendor || selectedPOs.length === 0) {
      router.replace('/procurement/goods-received-note/new/po-selection');
      return;
    }

    // Extract unique locations
    const uniqueLocations = Array.from(new Set(allPOItems.map(item => item.location).filter(Boolean))) as string[];
    setLocations(uniqueLocations);
    setSelectedLocations(new Set(uniqueLocations)); // Select all by default

    // Initialize selected items and quantities based on store if applicable
    const initialSelectedIds = new Set<string>();
    const initialQuantities: Record<string, number> = {};
    // Logic to re-populate selection based on existingSelectedGRNItems might need rework
    // If existingSelectedGRNItems holds FINAL items, maybe we shouldn't re-populate?
    // Or we need a temporary state in the store for the current selection step?
    // For now, we assume we start fresh or the mapping logic is handled elsewhere.
    // existingSelectedGRNItems.forEach(grnItem => { ... });
    setSelectedItemIds(initialSelectedIds);
    setItemQuantities(initialQuantities);

  }, [selectedVendor, selectedPOs, router, allPOItems/*, existingSelectedGRNItems */]); // Remove dependency if not used

  // Filter items based on selected locations and search term
  useEffect(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = allPOItems.filter(item =>
      selectedLocations.has(item.location || '') &&
      (item.name.toLowerCase().includes(lowerCaseSearch) ||
       item.description.toLowerCase().includes(lowerCaseSearch) ||
       item.poNumber.toLowerCase().includes(lowerCaseSearch))
    );
    setDisplayItems(filtered);
  }, [selectedLocations, searchTerm, allPOItems]);

  const handleToggleLocation = (location: string) => {
    setSelectedLocations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(location)) {
        newSet.delete(location);
      } else {
        newSet.add(location);
      }
      return newSet;
    });
    // Optionally reset item selections when locations change
    // setSelectedItemIds(new Set());
    // setItemQuantities({});
  };

  const handleToggleSelectItem = (itemId: string) => {
    setSelectedItemIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
        // Also remove quantity for deselected item
        setItemQuantities(currentQuantities => {
            const { [itemId]: _, ...rest } = currentQuantities;
            return rest;
        });
      } else {
        newSet.add(itemId);
         // Initialize quantity if needed (e.g., default to remaining)
         const item = allPOItems.find(i => i.id === itemId);
         if(item && !itemQuantities[itemId]) {
            handleQuantityChange(itemId, item.remainingQuantity); // Default to remaining
         }
      }
      return newSet;
    });
  };

  const handleQuantityChange = (itemId: string, value: number | string) => {
    const quantity = typeof value === 'string' ? parseFloat(value) : value;
    const item = allPOItems.find(i => i.id === itemId);
    if (!item) return;

    // Prevent negative or exceeding remaining quantity
    const maxQuantity = item.remainingQuantity;
    const validatedQuantity = Math.max(0, Math.min(isNaN(quantity) ? 0 : quantity, maxQuantity));

    setItemQuantities(prev => ({
      ...prev,
      [itemId]: validatedQuantity,
    }));

    // Ensure item is selected if quantity is entered
    if (validatedQuantity > 0 && !selectedItemIds.has(itemId)) {
      setSelectedItemIds(prev => new Set(prev).add(itemId));
    }
     // Deselect item if quantity is zero
    // else if (validatedQuantity <= 0 && selectedItemIds.has(itemId)) {
    //    handleToggleSelectItem(itemId);
    // }
  };

  const handleToggleSelectAllItems = () => {
      const allDisplayedIds = new Set(displayItems.map(item => item.id));
      // Use Array.from() for iteration compatibility
      if (selectedItemIds.size === allDisplayedIds.size && Array.from(selectedItemIds).every(id => allDisplayedIds.has(id))) {
          // Deselect all displayed
          setSelectedItemIds(prev => {
              const newSet = new Set(prev);
              displayItems.forEach(item => newSet.delete(item.id));
              return newSet;
          });
          setItemQuantities(prev => {
              const newQuantities = { ...prev };
              displayItems.forEach(item => delete newQuantities[item.id]);
              return newQuantities;
          });
      } else {
          // Select all displayed
          // Use Array.from() for iteration compatibility
          setSelectedItemIds(prev => new Set([...Array.from(prev), ...displayItems.map(item => item.id)]));
          // Set quantities for newly selected items (defaulting to remaining)
          const newQuantities = { ...itemQuantities };
          displayItems.forEach(item => {
              if (!newQuantities[item.id]) {
                  newQuantities[item.id] = item.remainingQuantity;
              }
          });
          setItemQuantities(newQuantities);
      }
  };

  const handleNext = () => {
    const itemsToSave: GoodsReceiveNoteItem[] = [];
    Array.from(selectedItemIds).forEach(id => {
      const poItem = allPOItems.find(item => item.id === id);
      const receivingQty = itemQuantities[id];
      if (poItem && receivingQty > 0) {
        // Mapping from PurchaseOrderItem to GoodsReceiveNoteItem
        itemsToSave.push({
          id: `temp-grnitem-${crypto.randomUUID()}`, // Temporary unique ID for GRN item
          purchaseOrderRef: poItem.poNumber,
          // poLineId: poItem.id, // Link to original PO item ID
          name: poItem.name,
          description: poItem.description,
          orderedQuantity: poItem.orderedQuantity,
          receivedQuantity: receivingQty,
          unit: poItem.orderUnit,
          unitPrice: poItem.unitPrice,
          // TODO: Implement proper calculation based on PRD 3.4.5.5
          subTotalAmount: receivingQty * poItem.unitPrice,
          totalAmount: receivingQty * poItem.unitPrice, // Simplified
          taxRate: poItem.taxRate,
          taxAmount: 0, // Simplified
          discountRate: poItem.discountRate,
          discountAmount: 0, // Simplified
          netAmount: receivingQty * poItem.unitPrice, // Simplified
          baseCurrency: poItem.baseUnit, // Assuming baseUnit is base currency
          baseQuantity: receivingQty * poItem.convRate,
          baseUnitPrice: poItem.unitPrice, // Needs adjustment based on taxIncluded?
          baseUnit: poItem.baseUnit,
          baseSubTotalAmount: receivingQty * poItem.unitPrice, // Simplified
          baseNetAmount: receivingQty * poItem.unitPrice, // Simplified
          baseTotalAmount: receivingQty * poItem.unitPrice, // Simplified
          baseTaxRate: poItem.taxRate,
          baseTaxAmount: 0, // Simplified
          baseDiscountRate: poItem.discountRate,
          baseDiscountAmount: 0, // Simplified
          conversionRate: poItem.convRate,
          currency: selectedPOs[0]?.currencyCode || 'USD', // Get from first PO
          exchangeRate: selectedPOs[0]?.exchangeRate || 1, // Get from first PO
          extraCost: 0,
          inventoryOnHand: poItem.inventoryInfo.onHand,
          inventoryOnOrder: poItem.inventoryInfo.onOrdered,
          inventoryReorderThreshold: poItem.inventoryInfo.reorderLevel,
          inventoryRestockLevel: poItem.inventoryInfo.restockLevel,
          lastPurchasePrice: poItem.inventoryInfo.lastPrice,
          lastOrderDate: poItem.inventoryInfo.lastOrderDate,
          lastVendor: poItem.inventoryInfo.lastVendor,
          lotNumber: '', // TBD
          deliveryPoint: poItem.location || 'Default Location', // Use item's determined location
          deliveryDate: new Date(), // TBD
          location: poItem.location || 'Default Location',
          isFreeOfCharge: poItem.isFOC,
          taxIncluded: poItem.taxIncluded,
          jobCode: '', // TBD
          adjustments: { discount: false, tax: false },
          // Missing fields from GoodsReceiveNoteItem to consider:
          // serialNumber?: string;
          // notes?: string;
          // availableLots?: { lotNumber: string; expiryDate: Date; }[];
          // focQuantity?: number;
          // focUnit?: string;
          // focConversionRate?: number;
          // isConsignment?: boolean;
          // isTaxInclusive?: boolean;
        });
      }
    });

    // Construct the main GRN object
    const tempId = `new-${crypto.randomUUID()}`;
    const newGRNData: GoodsReceiveNote = {
        id: tempId,
        ref: 'GRN-TEMP-REF', // Placeholder - generate properly later
        selectedItems: [], // This seems unused in GoodsReceiveNote type?
        date: new Date(),
        invoiceDate: new Date(), // Default or TBD
        invoiceNumber: '', // TBD
        description: `GRN for PO(s): ${selectedPOs.map(p => p.number).join(', ')}`,
        receiver: 'Current User', // Get current user
        vendor: selectedVendor?.companyName || '',
        vendorId: selectedVendor?.id || '',
        location: 'Main Warehouse', // Default or TBD
        currency: selectedPOs[0]?.currencyCode || 'USD',
        status: 'Pending', // Initial status before confirmation
        items: itemsToSave,
        stockMovements: [],
        isConsignment: false, // Default
        isCash: false, // Default
        extraCosts: [],
        comments: [],
        attachments: [],
        activityLog: [],
        financialSummary: null, // Will be calculated on detail page or backend
        exchangeRate: selectedPOs[0]?.exchangeRate || 1,
        baseCurrency: selectedPOs[0]?.baseCurrencyCode || 'USD',
        // Aggregate financial totals (simplified - recalculate properly later)
        baseSubTotalPrice: itemsToSave.reduce((sum, item) => sum + item.baseSubTotalAmount, 0),
        subTotalPrice: itemsToSave.reduce((sum, item) => sum + item.subTotalAmount, 0),
        baseNetAmount: itemsToSave.reduce((sum, item) => sum + item.baseNetAmount, 0),
        netAmount: itemsToSave.reduce((sum, item) => sum + item.netAmount, 0),
        baseDiscAmount: itemsToSave.reduce((sum, item) => sum + item.baseDiscountAmount, 0),
        discountAmount: itemsToSave.reduce((sum, item) => sum + item.discountAmount, 0),
        baseTaxAmount: itemsToSave.reduce((sum, item) => sum + item.baseTaxAmount, 0),
        taxAmount: itemsToSave.reduce((sum, item) => sum + item.taxAmount, 0),
        baseTotalAmount: itemsToSave.reduce((sum, item) => sum + item.baseTotalAmount, 0),
        totalAmount: itemsToSave.reduce((sum, item) => sum + item.totalAmount, 0),
    };

    console.log("Constructed GRN Data:", newGRNData);
    setNewlyCreatedGRNData(newGRNData); // Save to store
    // setStep('confirmation'); // Remove this step
    router.push(`/procurement/goods-received-note/${tempId}?mode=confirm`); // Navigate to detail page
  };

  const handleBack = () => {
    setStep('po-selection');
    router.push('/procurement/goods-received-note/new/po-selection');
  };

  const isNextDisabled = useMemo(() => {
     // Use Array.from() for iteration compatibility
     return selectedItemIds.size === 0 || Array.from(selectedItemIds).some(id => !itemQuantities[id] || itemQuantities[id] <= 0);
  }, [selectedItemIds, itemQuantities]);

  if (!selectedVendor || selectedPOs.length === 0) {
    return <div>Loading PO information...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Select Items and Locations</CardTitle>
            <CardDescription>
              Select items to receive for Vendor: <span className="font-semibold">{selectedVendor.companyName}</span> from PO(s): {selectedPOs.map(p => p.number).join(', ')}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to PO Selection
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Location Filter */}
        <div className="mb-4">
            <Label className='mr-2'>Filter by Location:</Label>
            <div className="flex flex-wrap gap-2 mt-1">
            {locations.map(loc => (
                <Badge
                key={loc}
                variant={selectedLocations.has(loc) ? 'default' : 'outline'}
                onClick={() => handleToggleLocation(loc)}
                className="cursor-pointer"
                >
                {loc}
                </Badge>
            ))}
            </div>
        </div>

         {/* Search Input */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Item Name, Description, or PO Number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Items Table */}
        <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                       checked={displayItems.length > 0 && selectedItemIds.size === displayItems.length && displayItems.every(item => selectedItemIds.has(item.id))}
                       onCheckedChange={handleToggleSelectAllItems}
                       aria-label="Select all items"
                    />
                  </TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>PO Num</TableHead>
                  <TableHead>Ordered</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead className="w-[120px]">Receive Qty</TableHead>
                  <TableHead>Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayItems.length > 0 ? (
                  displayItems.map((item) => (
                    <TableRow
                      key={`${item.poNumber}-${item.id}`} // Unique key per PO line
                      data-state={selectedItemIds.has(item.id) ? "selected" : undefined}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedItemIds.has(item.id)}
                          onCheckedChange={() => handleToggleSelectItem(item.id)}
                          aria-label={`Select item ${item.name}`}
                        />
                      </TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>{item.poNumber}</TableCell>
                      <TableCell>{item.orderedQuantity}</TableCell>
                      <TableCell>{item.receivedQuantity}</TableCell>
                      <TableCell className="font-medium">{item.remainingQuantity}</TableCell>
                       <TableCell>
                         <Input
                            type="number"
                            value={itemQuantities[item.id] || ''}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            onFocus={() => !selectedItemIds.has(item.id) && handleToggleSelectItem(item.id)} // Select on focus if not selected
                            min="0"
                            max={item.remainingQuantity} // Set max based on remaining
                            disabled={item.remainingQuantity <= 0} // Disable if nothing remaining
                            className="h-8 text-sm text-right"
                          />
                       </TableCell>
                      <TableCell>{item.orderUnit}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center">
                      No items found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center mt-4">
            <div>
                {selectedItemIds.size > 0 && (
                <span className="text-sm text-muted-foreground">
                    {selectedItemIds.size} item(s) selected.
                </span>
                )}
          </div>
          <Button onClick={handleNext} disabled={isNextDisabled}>
            Next: Confirm GRN
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 