"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PODetailPage } from "../components/PODetailPage";
import { 
  PurchaseOrder, 
  PurchaseOrderStatus, 
  PurchaseRequest, 
  PurchaseRequestItem,
  PurchaseOrderItem,
  PurchaseRequestItemStatus
} from "@/lib/types";
import { getRecentPRById } from "../../purchase-requests/data/mock-recent-prs";
import { Skeleton } from "@/components/ui/skeleton";

function CreatePurchaseOrderContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [initialPOData, setInitialPOData] = useState<PurchaseOrder | null>(null);

  useEffect(() => {
    // Check if we have PR IDs in the query parameters
    const prIds = searchParams.get('prs')?.split(',') || [];
    
    // Create a blank PO template
    const blankPO: PurchaseOrder = {
      poId: "new", // Will be replaced with a real ID when saved
      number: "PO-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      vendorId: 0,
      vendorName: "",
      orderDate: new Date(),
      DeliveryDate: new Date(new Date().setDate(new Date().getDate() + 14)), // Default to 2 weeks from now
      status: PurchaseOrderStatus.Draft,
      currencyCode: "USD",
      exchangeRate: 1,
      notes: "",
      createdBy: 101, // This would be the current user ID in a real app
      email: "",
      buyer: "",
      creditTerms: "Net 30",
      description: "",
      remarks: "",
      items: [], // Initialize with empty array
      baseCurrencyCode: "USD",
      baseSubTotalPrice: 0,
      subTotalPrice: 0,
      baseNetAmount: 0,
      netAmount: 0,
      baseDiscAmount: 0,
      discountAmount: 0,
      baseTaxAmount: 0,
      taxAmount: 0,
      baseTotalAmount: 0,
      totalAmount: 0
    };

    // If we have PR IDs, fetch the PR data and populate the PO
    if (prIds.length > 0) {
      blankPO.notes = `Created from PR IDs: ${prIds.join(', ')}`;
      
      // Fetch PR data from mock data
      const prs: Partial<PurchaseRequest>[] = prIds.map(id => getRecentPRById(id)).filter(pr => pr !== undefined) as Partial<PurchaseRequest>[];
      
      console.log("Found PRs:", prs);
      
      if (prs.length > 0) {
        // Use the first PR's vendor for the PO if available
        const firstPR = prs[0];
        if (firstPR.vendor && firstPR.vendorId) {
          blankPO.vendorName = firstPR.vendor;
          blankPO.vendorId = firstPR.vendorId;
        }
        
        // Use the first PR's currency if available
        if (firstPR.currency) {
          blankPO.currencyCode = firstPR.currency;
        }
        
        // Add items from all PRs
        const poItems: PurchaseOrderItem[] = [];
        
        prs.forEach(pr => {
          console.log(`Processing PR ${pr.id} with ${pr.items?.length || 0} items`);
          
          if (pr.items && pr.items.length > 0) {
            pr.items.forEach((prItem: PurchaseRequestItem) => {
              // Convert PR item to PO item
              const poItem: PurchaseOrderItem = {
                id: `new-${Math.random().toString(36).substring(2, 9)}`, // Generate a temporary ID
                name: prItem.name,
                description: prItem.description,
                convRate: 1,
                orderedQuantity: prItem.quantityApproved,
                orderUnit: prItem.unit,
                baseQuantity: prItem.quantityApproved,
                baseUnit: prItem.unit,
                baseReceivingQty: 0,
                receivedQuantity: 0,
                remainingQuantity: prItem.quantityApproved,
                unitPrice: prItem.price,
                status: prItem.status as PurchaseRequestItemStatus,
                isFOC: prItem.foc > 0,
                taxRate: prItem.taxRate,
                discountRate: prItem.discountRate,
                baseSubTotalPrice: prItem.baseSubTotalPrice || (prItem.price * prItem.quantityApproved),
                subTotalPrice: prItem.subTotalPrice || (prItem.price * prItem.quantityApproved),
                baseNetAmount: prItem.baseNetAmount || (prItem.price * prItem.quantityApproved),
                netAmount: prItem.netAmount || (prItem.price * prItem.quantityApproved),
                baseDiscAmount: prItem.baseDiscAmount || 0,
                discountAmount: prItem.discountAmount || 0,
                baseTaxAmount: prItem.baseTaxAmount || 0,
                taxAmount: prItem.taxAmount || 0,
                baseTotalAmount: prItem.baseTotalAmount || (prItem.price * prItem.quantityApproved),
                totalAmount: prItem.totalAmount || (prItem.price * prItem.quantityApproved),
                taxIncluded: prItem.taxIncluded,
                adjustments: {
                  discount: prItem.adjustments?.discount || false,
                  tax: prItem.adjustments?.tax || false
                },
                inventoryInfo: {
                  onHand: prItem.inventoryInfo?.onHand || 0,
                  onOrdered: prItem.inventoryInfo?.onOrdered || 0,
                  reorderLevel: prItem.inventoryInfo?.reorderLevel || 0,
                  restockLevel: prItem.inventoryInfo?.restockLevel || 0,
                  averageMonthlyUsage: prItem.inventoryInfo?.averageMonthlyUsage || 0,
                  lastPrice: prItem.inventoryInfo?.lastPrice || 0,
                  lastOrderDate: prItem.inventoryInfo?.lastOrderDate || new Date(),
                  lastVendor: prItem.inventoryInfo?.lastVendor || ""
                },
                comment: prItem.comment || "",
              };
              
              // Add PR reference to the comment
              poItem.comment = `${poItem.comment} (From PR: ${pr.refNumber || 'Unknown'})`.trim();
              
              console.log("Created PO item:", poItem);
              
              poItems.push(poItem);
            });
          }
        });
        
        // Add items to the PO
        blankPO.items = [...poItems]; // Create a new array to ensure reactivity
        
        console.log(`Added ${poItems.length} items to the PO`);
        console.log("Items array:", blankPO.items);
        
        // Calculate totals
        if (poItems.length > 0) {
          blankPO.subTotalPrice = poItems.reduce((sum, item) => sum + item.subTotalPrice, 0);
          blankPO.baseSubTotalPrice = poItems.reduce((sum, item) => sum + item.baseSubTotalPrice, 0);
          blankPO.netAmount = poItems.reduce((sum, item) => sum + item.netAmount, 0);
          blankPO.baseNetAmount = poItems.reduce((sum, item) => sum + item.baseNetAmount, 0);
          blankPO.discountAmount = poItems.reduce((sum, item) => sum + item.discountAmount, 0);
          blankPO.baseDiscAmount = poItems.reduce((sum, item) => sum + item.baseDiscAmount, 0);
          blankPO.taxAmount = poItems.reduce((sum, item) => sum + item.taxAmount, 0);
          blankPO.baseTaxAmount = poItems.reduce((sum, item) => sum + item.baseTaxAmount, 0);
          blankPO.totalAmount = poItems.reduce((sum, item) => sum + item.totalAmount, 0);
          blankPO.baseTotalAmount = poItems.reduce((sum, item) => sum + item.baseTotalAmount, 0);
        }
      }
    }

    console.log("Final PO data:", JSON.stringify(blankPO, null, 2));
    
    // Create a new object to ensure reactivity
    const finalPO = {
      ...blankPO,
      items: [...blankPO.items] // Create a new array to ensure reactivity
    };
    
    setInitialPOData(finalPO);
    setIsLoading(false);
  }, [searchParams]);

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href="/procurement/purchase-orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Purchase Orders
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : initialPOData ? (
        <PODetailPage 
          params={{ id: "new" }}
          initialData={initialPOData}
        />
      ) : (
        <div>Error loading data</div>
      )}
    </div>
  );
}

export default function CreatePurchaseOrderPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    }>
      <CreatePurchaseOrderContent />
    </Suspense>
  );
} 