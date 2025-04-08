"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import CreatePOFromPR from "../components/createpofrompr";
import { PurchaseRequest } from "@/lib/types";

export default function CreatePOFromPRPage() {
  const router = useRouter();
  const [selectedPRs, setSelectedPRs] = useState<PurchaseRequest[]>([]);

  const handleSelectPRs = (prs: PurchaseRequest[]) => {
    setSelectedPRs(prs);
  };

  const handleCreatePO = () => {
    if (selectedPRs.length === 0) {
      alert("Please select at least one Purchase Request");
      return;
    }

    // In a real app, you would pass the selected PR IDs to the create page
    // For now, we'll just navigate to the create page with query params
    const prIds = selectedPRs.map(pr => pr.id).join(",");
    router.push(`/procurement/purchase-orders/create?prs=${prIds}`);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/procurement/purchase-orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Create PO from Purchase Requests</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleCreatePO} disabled={selectedPRs.length === 0}>
            Create PO from {selectedPRs.length} PR{selectedPRs.length !== 1 ? 's' : ''}
          </Button>
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