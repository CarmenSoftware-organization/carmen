'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { useGRNCreationStore } from '@/lib/store/grn-creation.store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from "@/components/ui/checkbox"
import { Search, ArrowLeft } from 'lucide-react';
import { PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus } from '@/lib/types'; // Import correct types
import { Vendor } from '@/app/(main)/vendor-management/manage-vendors/[id]/types'; // Keep Vendor for selectedVendor prop type
import { format } from 'date-fns';

// Mock data aligned with actual types
const MOCK_PO_ITEMS_1: PurchaseOrderItem[] = [
  { id: 'item-1', name: 'Flour', description: 'All-purpose flour', convRate: 1, orderedQuantity: 100, orderUnit: 'Kg', baseQuantity: 100, baseUnit: 'Kg', baseReceivingQty: 0, receivedQuantity: 0, remainingQuantity: 100, unitPrice: 5, status: 'Pending', isFOC: false, taxRate: 0, discountRate: 0, baseSubTotalPrice: 500, subTotalPrice: 500, baseNetAmount: 500, netAmount: 500, baseDiscAmount: 0, discountAmount: 0, baseTaxAmount: 0, taxAmount: 0, baseTotalAmount: 500, totalAmount: 500, taxIncluded: false, inventoryInfo: { onHand: 0, onOrdered: 0, reorderLevel: 0, restockLevel: 0, averageMonthlyUsage: 0, lastPrice: 0, lastOrderDate: new Date(), lastVendor: '' } },
];
const MOCK_PO_ITEMS_2: PurchaseOrderItem[] = [
  { id: 'item-2', name: 'Sugar', description: 'Granulated sugar', convRate: 1, orderedQuantity: 50, orderUnit: 'Kg', baseQuantity: 50, baseUnit: 'Kg', baseReceivingQty: 0, receivedQuantity: 0, remainingQuantity: 50, unitPrice: 7, status: 'Pending', isFOC: false, taxRate: 0, discountRate: 0, baseSubTotalPrice: 350, subTotalPrice: 350, baseNetAmount: 350, netAmount: 350, baseDiscAmount: 0, discountAmount: 0, baseTaxAmount: 0, taxAmount: 0, baseTotalAmount: 350, totalAmount: 350, taxIncluded: false, inventoryInfo: { onHand: 0, onOrdered: 0, reorderLevel: 0, restockLevel: 0, averageMonthlyUsage: 0, lastPrice: 0, lastOrderDate: new Date(), lastVendor: '' } },
  { id: 'item-3', name: 'Butter', description: 'Unsalted butter', convRate: 1, orderedQuantity: 20, orderUnit: 'Kg', baseQuantity: 20, baseUnit: 'Kg', baseReceivingQty: 0, receivedQuantity: 0, remainingQuantity: 20, unitPrice: 15, status: 'Pending', isFOC: false, taxRate: 0, discountRate: 0, baseSubTotalPrice: 300, subTotalPrice: 300, baseNetAmount: 300, netAmount: 300, baseDiscAmount: 0, discountAmount: 0, baseTaxAmount: 0, taxAmount: 0, baseTotalAmount: 300, totalAmount: 300, taxIncluded: false, inventoryInfo: { onHand: 0, onOrdered: 0, reorderLevel: 0, restockLevel: 0, averageMonthlyUsage: 0, lastPrice: 0, lastOrderDate: new Date(), lastVendor: '' } },
];
const MOCK_PO_ITEMS_3: PurchaseOrderItem[] = [
  { id: 'item-4', name: 'Apples', description: 'Fresh apples', convRate: 1, orderedQuantity: 200, orderUnit: 'Kg', baseQuantity: 200, baseUnit: 'Kg', baseReceivingQty: 0, receivedQuantity: 0, remainingQuantity: 200, unitPrice: 2, status: 'Pending', isFOC: false, taxRate: 0, discountRate: 0, baseSubTotalPrice: 400, subTotalPrice: 400, baseNetAmount: 400, netAmount: 400, baseDiscAmount: 0, discountAmount: 0, baseTaxAmount: 0, taxAmount: 0, baseTotalAmount: 400, totalAmount: 400, taxIncluded: false, inventoryInfo: { onHand: 0, onOrdered: 0, reorderLevel: 0, restockLevel: 0, averageMonthlyUsage: 0, lastPrice: 0, lastOrderDate: new Date(), lastVendor: '' } },
];
const MOCK_PO_ITEMS_4: PurchaseOrderItem[] = [
  { id: 'item-5', name: 'Oranges', description: 'Fresh oranges', convRate: 1, orderedQuantity: 150, orderUnit: 'Kg', baseQuantity: 150, baseUnit: 'Kg', baseReceivingQty: 50, receivedQuantity: 50, remainingQuantity: 100, unitPrice: 2, status: 'Pending', isFOC: false, taxRate: 0, discountRate: 0, baseSubTotalPrice: 300, subTotalPrice: 300, baseNetAmount: 300, netAmount: 300, baseDiscAmount: 0, discountAmount: 0, baseTaxAmount: 0, taxAmount: 0, baseTotalAmount: 300, totalAmount: 300, taxIncluded: false, inventoryInfo: { onHand: 0, onOrdered: 0, reorderLevel: 0, restockLevel: 0, averageMonthlyUsage: 0, lastPrice: 0, lastOrderDate: new Date(), lastVendor: '' } },
];

const MOCK_POS: PurchaseOrder[] = [
  { poId: 'po-1', number: 'PO-001', vendorId: 1, vendorName: 'Global Foods Inc.', orderDate: new Date(2024, 6, 1), status: PurchaseOrderStatus.Open, currencyCode: 'USD', exchangeRate: 1, items: MOCK_PO_ITEMS_1, baseCurrencyCode: 'USD', baseSubTotalPrice: 500, subTotalPrice: 500, baseNetAmount: 500, netAmount: 500, baseDiscAmount: 0, discountAmount: 0, baseTaxAmount: 0, taxAmount: 0, baseTotalAmount: 500, totalAmount: 500, email: '', buyer:'', creditTerms: '', description:'', remarks: '', createdBy: 1 },
  { poId: 'po-2', number: 'PO-002', vendorId: 1, vendorName: 'Global Foods Inc.', orderDate: new Date(2024, 6, 10), status: PurchaseOrderStatus.Open, currencyCode: 'USD', exchangeRate: 1, items: MOCK_PO_ITEMS_2, baseCurrencyCode: 'USD', baseSubTotalPrice: 650, subTotalPrice: 650, baseNetAmount: 650, netAmount: 650, baseDiscAmount: 0, discountAmount: 0, baseTaxAmount: 0, taxAmount: 0, baseTotalAmount: 650, totalAmount: 650, email: '', buyer:'', creditTerms: '', description:'', remarks: '', createdBy: 1 },
  { poId: 'po-3', number: 'PO-003', vendorId: 2, vendorName: 'Local Produce Suppliers', orderDate: new Date(2024, 6, 15), status: PurchaseOrderStatus.Open, currencyCode: 'USD', exchangeRate: 1, items: MOCK_PO_ITEMS_3, baseCurrencyCode: 'USD', baseSubTotalPrice: 400, subTotalPrice: 400, baseNetAmount: 400, netAmount: 400, baseDiscAmount: 0, discountAmount: 0, baseTaxAmount: 0, taxAmount: 0, baseTotalAmount: 400, totalAmount: 400, email: '', buyer:'', creditTerms: '', description:'', remarks: '', createdBy: 1 },
  { poId: 'po-4', number: 'PO-004', vendorId: 2, vendorName: 'Local Produce Suppliers', orderDate: new Date(2024, 6, 20), status: PurchaseOrderStatus.Partial, currencyCode: 'USD', exchangeRate: 1, items: MOCK_PO_ITEMS_4, baseCurrencyCode: 'USD', baseSubTotalPrice: 300, subTotalPrice: 300, baseNetAmount: 300, netAmount: 300, baseDiscAmount: 0, discountAmount: 0, baseTaxAmount: 0, taxAmount: 0, baseTotalAmount: 300, totalAmount: 300, email: '', buyer:'', creditTerms: '', description:'', remarks: '', createdBy: 1 },
];

// Note: The mock vendor IDs ('vendor-1', 'vendor-2') don't align with mock PO vendorIds (1, 2)
// This needs alignment if using real data. For mock, we proceed.
async function fetchPurchaseOrders(vendorId: string): Promise<PurchaseOrder[]> {
  // Replace with actual API call filtered by vendorId
  console.log(`Fetching POs for vendor: ${vendorId}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  // Adjust mock filtering logic if vendorId types differ (string vs number)
  const numericVendorId = parseInt(vendorId.split('-')[1], 10); // Hacky conversion for mock data
  return MOCK_POS.filter(po => po.vendorId === numericVendorId && (po.status === PurchaseOrderStatus.Open || po.status === PurchaseOrderStatus.Partial));
}

export default function POSelectionPage() {
  const router = useRouter();
  const { selectedVendor, setSelectedPOs, setStep } = useGRNCreationStore();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [filteredPOs, setFilteredPOs] = useState<PurchaseOrder[]>([]);
  const [selectedPOIds, setSelectedPOIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!selectedVendor) {
      router.replace('/procurement/goods-received-note/new/vendor-selection');
      return;
    }

    const loadPOs = async () => {
      setIsLoading(true);
      // Pass the correct vendor ID (assuming selectedVendor.id is the string 'vendor-x')
      const fetchedPOs = await fetchPurchaseOrders(selectedVendor.id);
      setPurchaseOrders(fetchedPOs);
      setFilteredPOs(fetchedPOs);
      setIsLoading(false);
    };
    loadPOs();
  }, [selectedVendor, router]);

  useEffect(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    const results = purchaseOrders.filter(po =>
      (po.number?.toLowerCase() || '').includes(lowerCaseSearch) || // Use `number`
      (po.purchaseRequisitionNumbers?.join(' ').toLowerCase() || '').includes(lowerCaseSearch) // Search in PR numbers if needed
    );
    setFilteredPOs(results);
  }, [searchTerm, purchaseOrders]);

  const handleToggleSelectPO = (poId: string) => {
    setSelectedPOIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(poId)) {
        newSet.delete(poId);
      } else {
        newSet.add(poId);
      }
      return newSet;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedPOIds.size === filteredPOs.length) {
      setSelectedPOIds(new Set());
    } else {
      // Use poId for selection
      setSelectedPOIds(new Set(filteredPOs.map(po => po.poId)));
    }
  };

  const selectedPOsData = useMemo(() => {
    // Filter using poId
    return purchaseOrders.filter(po => selectedPOIds.has(po.poId));
  }, [selectedPOIds, purchaseOrders]);

  const handleNext = () => {
    setSelectedPOs(selectedPOsData);
    setStep('item-location-selection');
    router.push('/procurement/goods-received-note/new/item-location-selection');
  };

  const handleBack = () => {
    setStep('vendor-selection');
    router.push('/procurement/goods-received-note/new/vendor-selection');
  };

  if (!selectedVendor) {
    return <div>Loading vendor information...</div>;
  }

  return (
    <Card>
       <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Select Purchase Orders</CardTitle>
            <CardDescription>
              Select POs from vendor: <span className="font-semibold">{selectedVendor.companyName}</span>
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vendor Selection
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by PO Number or PR Reference..." // Keep placeholder general
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {isLoading ? (
          <p>Loading purchase orders...</p>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        filteredPOs.length > 0 && selectedPOIds.size === filteredPOs.length
                      }
                      onCheckedChange={handleToggleSelectAll}
                      aria-label="Select all POs"
                    />
                  </TableHead>
                  <TableHead>PO Number</TableHead>
                  <TableHead>PR Reference(s)</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Items</TableHead>
                   <TableHead>Status</TableHead>
                   <TableHead>Currency</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPOs.length > 0 ? (
                  filteredPOs.map((po) => (
                    <React.Fragment key={po.poId}>
                      <TableRow data-state={selectedPOIds.has(po.poId) ? "selected" : undefined}>
                        <TableCell>
                          <Checkbox
                            checked={selectedPOIds.has(po.poId)}
                            onCheckedChange={() => handleToggleSelectPO(po.poId)}
                            aria-label={`Select PO ${po.number}`}
                          />
                        </TableCell>
                        <TableCell>{po.number}</TableCell>
                        <TableCell>{po.purchaseRequisitionNumbers?.join(', ') || 'N/A'}</TableCell>
                        <TableCell>{format(po.orderDate, 'yyyy-MM-dd')}</TableCell>
                        <TableCell>{po.items?.length || 0}</TableCell>
                        <TableCell>{po.status}</TableCell>
                        <TableCell>{po.currencyCode}</TableCell>
                        <TableCell className="text-right">{po.totalAmount?.toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow key={`${po.poId}-details`} className="bg-muted/50 hover:bg-muted/60">
                        <TableCell colSpan={8} className="p-2 pl-12">
                           <div className="text-xs text-muted-foreground space-y-1">
                             <span className="font-semibold">Items:</span>
                             {po.items && po.items.length > 0 ? (
                               po.items.map((item) => (
                                 <div key={item.id}>
                                   - {item.name} (Base Unit: {item.baseUnit || 'N/A'}, Currency: {po.currencyCode || 'N/A'})
                                 </div>
                               ))
                             ) : (
                               <div>No items found for this PO.</div>
                             )}
                           </div>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No open or partial purchase orders found for this vendor.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="flex justify-between items-center mt-4">
           <div>
            {selectedPOIds.size > 0 && (
              <span className="text-sm text-muted-foreground">
                {selectedPOIds.size} PO(s) selected.
              </span>
            )}
          </div>
          <Button onClick={handleNext} disabled={selectedPOIds.size === 0 || isLoading}>
            Next: Select Items
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 