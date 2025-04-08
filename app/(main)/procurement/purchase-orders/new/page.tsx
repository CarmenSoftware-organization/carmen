"use client"

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Send } from "lucide-react";
import { PurchaseOrderStatus, CurrencyCode, PurchaseRequest } from "@/lib/types";
import { PurchaseOrderItemFormComponent } from "../components/po-item-form";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

function NewPurchaseOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPRs, setSelectedPRs] = useState<PurchaseRequest[]>([]);
  const [activeTab, setActiveTab] = useState("general");
  const [showItemForm, setShowItemForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    vendorName: "",
    vendorId: "",
    orderDate: new Date().toISOString().split("T")[0],
    deliveryDate: "",
    status: PurchaseOrderStatus.Draft,
    currencyCode: CurrencyCode.USD,
    exchangeRate: 1,
    description: "",
    notes: "",
    creditTerms: "",
    email: "",
    buyer: "",
  });

  // Load PRs if prIds are provided
  useEffect(() => {
    // Move prIds initialization inside the useEffect
    const prIds = searchParams.get("prIds")?.split(",") || [];
    
    if (prIds.length > 0) {
      // In a real implementation, you would fetch the PRs from the API
      // For now, we'll just simulate loading PRs
      setIsLoading(true);
      setTimeout(() => {
        // Mock data - in a real implementation, this would come from an API call
        const mockPRs: PurchaseRequest[] = [];
        setSelectedPRs(mockPRs);
        setIsLoading(false);
      }, 1000);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveDraft = () => {
    // In a real implementation, you would save the PO to the API
    console.log("Saving draft PO:", formData);
    router.push("/procurement/purchase-orders");
  };

  const handleSendToVendor = () => {
    // In a real implementation, you would save the PO and send it to the vendor
    console.log("Sending PO to vendor:", formData);
    router.push("/procurement/purchase-orders");
  };

  const handleCancel = () => {
    router.push("/procurement/purchase-orders");
  };

  const handleAddItem = () => {
    setShowItemForm(true);
  };

  const handleCloseItemForm = () => {
    setShowItemForm(false);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handleSendToVendor}>
            <Send className="h-4 w-4 mr-2" />
            Send to Vendor
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading...</p>
        </div>
      ) : (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>General Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vendorName">Vendor</Label>
                      <Input
                        id="vendorName"
                        name="vendorName"
                        value={formData.vendorName}
                        onChange={handleInputChange}
                        placeholder="Select vendor"
                      />
                    </div>
                    <div>
                      <Label htmlFor="orderDate">Order Date</Label>
                      <Input
                        id="orderDate"
                        name="orderDate"
                        type="date"
                        value={formData.orderDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="deliveryDate">Delivery Date</Label>
                      <Input
                        id="deliveryDate"
                        name="deliveryDate"
                        type="date"
                        value={formData.deliveryDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currencyCode">Currency</Label>
                      <Select
                        value={formData.currencyCode}
                        onValueChange={(value) => handleSelectChange("currencyCode", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={CurrencyCode.USD}>USD</SelectItem>
                          <SelectItem value={CurrencyCode.EUR}>EUR</SelectItem>
                          <SelectItem value={CurrencyCode.GBP}>GBP</SelectItem>
                          <SelectItem value={CurrencyCode.JPY}>JPY</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="buyer">Buyer</Label>
                      <Input
                        id="buyer"
                        name="buyer"
                        value={formData.buyer}
                        onChange={handleInputChange}
                        placeholder="Enter buyer name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter description"
                        rows={3}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Enter notes"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="creditTerms">Credit Terms</Label>
                      <Input
                        id="creditTerms"
                        name="creditTerms"
                        value={formData.creditTerms}
                        onChange={handleInputChange}
                        placeholder="Enter credit terms"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="items" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Items</CardTitle>
                  <Button onClick={handleAddItem}>Add Item</Button>
                </CardHeader>
                <CardContent>
                  {selectedPRs.length > 0 ? (
                    <div className="mb-4">
                      <h3 className="text-lg font-medium mb-2">Items from Purchase Requests</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        The following items have been added from the selected Purchase Requests:
                      </p>
                      {/* Display items from PRs here */}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No items added yet. Click &quot;Add Item&quot; to add items to this purchase order.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Financial information will be calculated based on the items added to this purchase order.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attachments" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Attachments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">No attachments added yet.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {showItemForm && (
        <PurchaseOrderItemFormComponent
          initialMode="add"
          onClose={handleCloseItemForm}
        />
      )}
    </div>
  );
}

export default function NewPurchaseOrderPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    }>
      <NewPurchaseOrderContent />
    </Suspense>
  );
} 