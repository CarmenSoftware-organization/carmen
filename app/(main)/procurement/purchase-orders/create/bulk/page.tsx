"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ArrowLeft, 
  Package, 
  Building2, 
  Calendar, 
  DollarSign,
  ShoppingCart,
  CheckCircle
} from "lucide-react";
import { PurchaseRequest, PurchaseOrderStatus } from "@/lib/types";

interface GroupedItemData {
  vendor: string;
  vendorId: number;
  currency: string;
  deliveryDate: Date;
  items: any[];
  totalAmount: number;
  sourcePRs: string[];
}

export default function BulkPOCreationPage() {
  const router = useRouter();
  const [groupedItems, setGroupedItems] = useState<Record<string, GroupedItemData>>({});
  const [createdPOs, setCreatedPOs] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // Load grouped item data from localStorage
    try {
      const groupedItemsData = localStorage.getItem('groupedPurchaseRequests');
      if (groupedItemsData) {
        const data = JSON.parse(groupedItemsData);
        // Convert string dates back to Date objects
        const processedData = Object.entries(data).reduce((acc, [key, group]: [string, any]) => {
          acc[key] = {
            ...group,
            deliveryDate: new Date(group.deliveryDate)
          };
          return acc;
        }, {} as Record<string, GroupedItemData>);
        setGroupedItems(processedData);
      } else {
        // No data found, redirect back to PO list
        router.push('/procurement/purchase-orders');
      }
    } catch (error) {
      console.error('Error loading grouped item data:', error);
      router.push('/procurement/purchase-orders');
    }
  }, [router]);

  const handleCreateAllPOs = async () => {
    setIsCreating(true);
    const newCreatedPOs: string[] = [];

    try {
      // Create POs for each group
      for (const [groupKey, group] of Object.entries(groupedItems)) {
        // Generate a unique PO ID
        const poId = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        
        // Create PO data structure
        const newPO = {
          poId,
          number: poId,
          vendorId: group.vendorId,
          vendorName: group.vendor,
          orderDate: new Date(),
          DeliveryDate: group.deliveryDate,
          status: PurchaseOrderStatus.DRAFT,
          currencyCode: group.currency,
          baseCurrencyCode: 'USD',
          exchangeRate: 1,
          createdBy: 1,
          email: '',
          buyer: '',
          creditTerms: '',
          description: `Purchase Order created from ${group.items.length} item${group.items.length > 1 ? 's' : ''} from PR${group.sourcePRs.length > 1 ? 's' : ''}: ${group.sourcePRs.join(', ')}`,
          remarks: '',
          purchaseRequisitionIds: group.items.map(item => item.prId),
          purchaseRequisitionNumbers: group.sourcePRs,
          items: group.items.map(item => ({
            id: `po-item-${Math.random().toString(36).substr(2, 9)}`,
            name: item.name,
            description: item.description,
            convRate: 1,
            orderedQuantity: item.quantityApproved || item.quantityRequested,
            orderUnit: item.unit,
            baseQuantity: item.quantityApproved || item.quantityRequested,
            baseUnit: item.unit,
            baseReceivingQty: 0,
            receivedQuantity: 0,
            remainingQuantity: item.quantityApproved || item.quantityRequested,
            unitPrice: item.price || 0,
            status: 'Open' as any,
            isFOC: false,
            taxRate: (item.taxRate || 0) * 100,
            discountRate: (item.discountRate || 0) * 100,
            taxIncluded: item.taxIncluded || false,
            // Add PR traceability
            sourcePRId: item.prId,
            sourcePRNumber: item.prNumber,
            sourcePRItemId: item.id
          })),
          baseSubTotalPrice: group.items.reduce((sum, item) => sum + (item.baseSubTotalPrice || 0), 0),
          subTotalPrice: group.items.reduce((sum, item) => sum + (item.subTotalPrice || 0), 0),
          baseNetAmount: group.items.reduce((sum, item) => sum + (item.baseNetAmount || 0), 0),
          netAmount: group.items.reduce((sum, item) => sum + (item.netAmount || 0), 0),
          baseDiscAmount: group.items.reduce((sum, item) => sum + (item.baseDiscAmount || 0), 0),
          discountAmount: group.items.reduce((sum, item) => sum + (item.discountAmount || 0), 0),
          baseTaxAmount: group.items.reduce((sum, item) => sum + (item.baseTaxAmount || 0), 0),
          taxAmount: group.items.reduce((sum, item) => sum + (item.taxAmount || 0), 0),
          baseTotalAmount: group.totalAmount,
          totalAmount: group.totalAmount,
          activityLog: []
        };

        // In a real implementation, this would be an API call
        console.log('Creating PO:', newPO);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        newCreatedPOs.push(poId);
      }

      setCreatedPOs(newCreatedPOs);
      
      // Clear localStorage
      localStorage.removeItem('groupedPurchaseRequests');
      localStorage.removeItem('selectedPurchaseRequests');
      
    } catch (error) {
      console.error('Error creating POs:', error);
    } finally {
      setIsCreating(false);
    }
  };


  const handleBackToReselect = () => {
    // Clear localStorage and go back to PR selection page
    localStorage.removeItem('groupedPurchaseRequests');
    localStorage.removeItem('selectedPurchaseRequests');
    router.push('/procurement/purchase-orders/create/from-pr');
  };

  const groupEntries = Object.entries(groupedItems);

  if (createdPOs.length > 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">
              Purchase Orders Created Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-muted-foreground mb-6">
              {createdPOs.length} Purchase Order{createdPOs.length > 1 ? 's' : ''} created from your selected Purchase Requests.
            </div>
            
            <div className="space-y-2">
              {createdPOs.map((poId, index) => (
                <div key={poId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-green-600" />
                    <span className="font-medium">{poId}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/procurement/purchase-orders/${poId}`)}
                  >
                    View PO
                  </Button>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex justify-center space-x-4">
              <Button onClick={() => router.push('/procurement/purchase-orders')}>
                View All Purchase Orders
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/procurement/purchase-requests')}
              >
                Back to Purchase Requests
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBackToReselect}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reselect PRs
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Purchase Orders from PRs</h1>
            <p className="text-muted-foreground">
              {groupEntries.length} Purchase Order{groupEntries.length > 1 ? 's' : ''} will be created, grouped by vendor, currency, and delivery date. Go back to reselect PRs if you need different groupings.
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            onClick={handleCreateAllPOs}
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : `Create All ${groupEntries.length} POs`}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {groupEntries.map(([groupKey, group], index) => (
          <Card key={groupKey}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{group.vendor}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {group.currency}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {group.deliveryDate.toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        {group.items.length} item{group.items.length > 1 ? 's' : ''} from {group.sourcePRs.length} PR{group.sourcePRs.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {group.currency} {group.totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Source PR</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.items.map((item, itemIndex) => (
                    <TableRow key={itemIndex}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.prNumber}</TableCell>
                      <TableCell>{item.quantityApproved || item.quantityRequested} {item.unit}</TableCell>
                      <TableCell className="text-right">
                        {group.currency} {(item.price || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {group.currency} {(item.totalAmount || 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}