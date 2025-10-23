"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import CreatePOFromPR from "../../components/createpofrompr";
import { PurchaseRequest } from "@/lib/types";

export default function CreatePOFromPRPage() {
  const router = useRouter();

  const handleSelectPRs = (selectedPRs: PurchaseRequest[]) => {
    if (selectedPRs.length > 0) {
      // Extract all items from selected PRs
      // Note: items array exists in mock data but not in PurchaseRequest interface
      const allItems = selectedPRs.flatMap(pr =>
        (pr as any).items?.map((item: any) => ({
          ...item,
          sourcePR: pr,
          prId: pr.id,
          prNumber: (pr as any).refNumber,
          vendor: (pr as any).vendor,
          vendorId: (pr as any).vendorId,
          currency: (pr as any).currency,
          deliveryDate: (pr as any).deliveryDate
        })) || []
      );
      
      // Group items by vendor + currency + deliveryDate - each group becomes a separate PO
      const groupedItems = allItems.reduce((groups, item) => {
        const key = `${item.vendor}-${item.currency}-${item.deliveryDate}`;
        if (!groups[key]) {
          groups[key] = {
            vendor: item.vendor,
            vendorId: item.vendorId,
            currency: item.currency,
            deliveryDate: item.deliveryDate,
            items: [],
            totalAmount: 0,
            sourcePRs: new Set()
          };
        }
        groups[key].items.push(item);
        groups[key].totalAmount += item.totalAmount || 0;
        groups[key].sourcePRs.add(item.prNumber);
        return groups;
      }, {} as Record<string, { 
        vendor: string; 
        vendorId: number; 
        currency: string; 
        deliveryDate: Date;
        items: any[];
        totalAmount: number;
        sourcePRs: Set<string>;
      }>);

      // Convert Set to Array for serialization
      type GroupType = {
        vendor: string;
        vendorId: number;
        currency: string;
        deliveryDate: Date;
        items: any[];
        totalAmount: number;
        sourcePRs: Set<string>;
      };

      const serializedGroups = (Object.entries(groupedItems) as [string, GroupType][]).reduce((acc, [key, group]) => {
        // Explicitly extract object properties to avoid spread type error
        acc[key] = {
          vendor: group.vendor,
          vendorId: group.vendorId,
          currency: group.currency,
          deliveryDate: group.deliveryDate,
          items: group.items,
          totalAmount: group.totalAmount,
          sourcePRs: Array.from(group.sourcePRs)
        };
        return acc;
      }, {} as Record<string, any>);

      // Store grouped items for PO creation
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('groupedPurchaseRequests', JSON.stringify(serializedGroups));
          localStorage.setItem('selectedPurchaseRequests', JSON.stringify(selectedPRs)); // Keep for compatibility
        }
      } catch (error) {
        console.error('Error storing grouped items:', error);
      }
      
      // Navigate to PO creation page with grouped data
      const groupCount = Object.keys(groupedItems).length;
      if (groupCount === 1) {
        // Single PO - go directly to creation page
        router.push('/procurement/purchase-orders/create?mode=fromPR&grouped=true');
      } else {
        // Multiple POs - go to bulk creation page
        router.push('/procurement/purchase-orders/create/bulk');
      }
    }
  };

  const handleBack = () => {
    router.push('/procurement/purchase-orders');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Purchase Orders
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Purchase Orders from Purchase Requests</h1>
            <p className="text-muted-foreground">
              Select approved Purchase Requests to convert into Purchase Orders. Items will be automatically grouped by vendor, currency, and delivery date.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Purchase Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <CreatePOFromPR onSelectPRs={handleSelectPRs} />
        </CardContent>
      </Card>
    </div>
  );
}