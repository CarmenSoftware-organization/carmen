"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, FileInput, PlusCircle } from "lucide-react";
import CreatePOFromPR from "./createpofrompr";
import { PurchaseRequest } from "@/lib/types";

interface NewPOModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewPOModal({ isOpen, onClose }: NewPOModalProps) {
  const router = useRouter();
  const [view, setView] = useState<"options" | "fromPR">("options");
  const [selectedPRs, setSelectedPRs] = useState<PurchaseRequest[]>([]);

  const handleCreateBlankPO = () => {
    router.push("/procurement/purchase-orders/new");
    onClose();
  };

  const handleSelectPRs = (prs: PurchaseRequest[]) => {
    setSelectedPRs(prs);
  };

  const handleCreateFromPR = () => {
    if (selectedPRs.length === 0) {
      // Show error or notification
      return;
    }
    
    // In a real implementation, you would pass the selected PRs to the new PO page
    // For now, we'll just navigate to the new PO page
    const prIds = selectedPRs.map(pr => pr.id).join(",");
    router.push(`/procurement/purchase-orders/new?prIds=${prIds}`);
    onClose();
  };

  const handleBackToOptions = () => {
    setView("options");
    setSelectedPRs([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Create New Purchase Order</DialogTitle>
          <DialogDescription>
            Choose how you want to create your new purchase order
          </DialogDescription>
        </DialogHeader>

        {view === "options" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <Card
              className="cursor-pointer hover:bg-secondary transition-colors"
              onClick={handleCreateBlankPO}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center h-40">
                <PlusCircle className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-lg font-medium">Blank Purchase Order</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Create a new purchase order from scratch
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:bg-secondary transition-colors"
              onClick={() => setView("fromPR")}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center h-40">
                <FileText className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-lg font-medium">From Purchase Request</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Create a purchase order based on existing purchase requests
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="py-4">
            <div className="mb-4">
              <Button variant="outline" onClick={handleBackToOptions} className="mb-4">
                Back to Options
              </Button>
              <h3 className="text-lg font-medium mb-2">Select Purchase Requests</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose one or more purchase requests to create your purchase order
              </p>
            </div>
            
            <CreatePOFromPR onSelectPRs={handleSelectPRs} />
            
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={handleCreateFromPR}
                disabled={selectedPRs.length === 0}
              >
                Create PO from Selected PRs ({selectedPRs.length})
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 