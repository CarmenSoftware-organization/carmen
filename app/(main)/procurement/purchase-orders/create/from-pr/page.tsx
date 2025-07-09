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
      const allItems = selectedPRs.flatMap(pr => 
        pr.items?.map(item => ({
          ...item,
          sourcePR: pr,
          prId: pr.id,
          prNumber: pr.refNumber,
          vendor: pr.vendor,
          vendorId: pr.vendorId,
          currency: pr.currency,
          deliveryDate: pr.deliveryDate
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
      const serializedGroups = Object.entries(groupedItems).reduce((acc, [key, group]) => {
        acc[key] = {
          ...group,
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