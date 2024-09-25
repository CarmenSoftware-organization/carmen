"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Edit,
  Trash2,
  X,
  CheckSquare,
  FileDown,
  Mail,
  Printer,
} from "lucide-react";
import DetailPageTemplate from "@/components/templates/DetailPageTemplate";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import ItemsTab from "./tabs/ItemsTab";
import FinancialDetailsTab from "./tabs/FinancialDetailsTab";
import GoodsReceiveNoteTab from "./tabs/GoodsReceiveNoteTab";
import RelatedDocumentsTab from "./tabs/RelatedDocumentsTab";
import CommentsAttachmentsTab from "./tabs/CommentsAttachmentsTab";
import ActivityLogTab from "./tabs/ActivityLogTab";
import {
  PurchaseOrderItem,
  PurchaseOrderStatus,
  PurchaseOrder,
} from "@/lib/types";
import { Mock_purchaseOrders } from "@/lib/mock/mock_purchaseOrder";

export function PODetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [poData, setPOData] = useState<PurchaseOrder | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const samplePO: PurchaseOrder | undefined = Mock_purchaseOrders.filter(
      (po) => po.poId === (params.id)
    )[0];

    setPOData(samplePO as PurchaseOrder);
  }, [params.id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Implement save functionality
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDelete = () => {
    // Implement delete functionality
    console.log("Delete PO:", params.id);
  };

  const handlePrint = () => {
    // Implement print functionality
    console.log("Print PO:", params.id);
  };

  const handleEmail = () => {
    // Implement email functionality
    console.log("Email PO:", params.id);
  };

  const handleUpdateItem = (updatedItem: PurchaseOrderItem) => {
    if (poData) {
      const updatedItems = poData.items.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      );
      setPOData({ ...poData, items: updatedItems as PurchaseOrderItem[] });
    }
  };

  const handleDeleteItem = (itemId: string) => {
    if (poData) {
      const updatedItems = poData.items.filter((item) => item.id !== itemId);
      setPOData({ ...poData, items: updatedItems });
    }
  };

  const handleAddItem = (newItem: PurchaseOrderItem) => {
    if (poData) {
      setPOData({
        ...poData,
        items: [...poData.items, newItem as unknown as PurchaseOrderItem],
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (poData) {
      setPOData({ ...poData, [name]: value });
    }
  };

  if (!poData) {
    return <div>Loading... (Data not found)</div>;
  }

  const title = (
    <div className="flex items-center space-x-2">
      <h1 className="text-2xl font-bold">Purchase Order</h1>
    </div>
  );

  const actionButtons = (
    <>
      {isEditing ? (
        <>
          <Button onClick={handleSave}>
            <Edit className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </>
      ) : (
        <>
          <Button onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={handleEmail}>
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
        </>
      )}
    </>
  );

  const content = (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div>
                <Label className="text-xs text-muted-foreground">
                  PO Number
                </Label>
                <div className="font-semibold">{poData?.number}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Date</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    name="date"
                    value={poData?.orderDate?.toISOString().split("T")[0] || ""}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                ) : (
                  <div className="font-semibold">
                    {poData?.orderDate?.toISOString().split("T")[0] || ""}
                  </div>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Vendor</Label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="vendor"
                    value={poData?.vendorName || ""}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                ) : (
                  <div className="font-semibold">
                    {poData?.vendorName || ""}
                  </div>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                {isEditing ? (
                  <Input
                    type="email"
                    name="email"
                    value={poData?.email || ""}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                ) : (
                  <div className="font-semibold">{poData?.email || ""}</div>
                )}
              </div>
            </div>
            <Badge
              variant={poData?.status === "Open" ? "default" : "secondary"}
            >
              {poData?.status || ""}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-4">
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">
                Delivery Date
              </Label>
              <Input
                type="date"
                value={poData?.DeliveryDate?.toISOString().split("T")[0] || ""}
                readOnly
              />
            </div>
            <div className="col-span-1">
              <Label className="text-xs text-muted-foreground">Currency</Label>
              <Input value={poData?.currencyCode || ""} readOnly />
            </div>
            <div className="col-span-1">
              <Label className="text-xs text-muted-foreground">
                Credit Terms
              </Label>
              <Input value={poData?.creditTerms || ""} readOnly />
            </div>
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">Total</Label>
              <Input
                value={`$${poData?.totalAmount?.toFixed(2) || ""}`}
                readOnly
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">Buyer</Label>
              <Input value={poData?.buyer || ""} readOnly />
            </div>
            <div className="col-span-4">
              <Label className="text-xs text-muted-foreground">
                Description
              </Label>
              <Textarea value={poData?.description || ""} readOnly />
            </div>
            <div className="col-span-4">
              <Label className="text-xs text-muted-foreground">Remarks</Label>
              <Textarea value={poData?.remarks || ""} readOnly />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="items" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="FinancialDetailsTab">Financials</TabsTrigger>
          <TabsTrigger value="GoodsReceiveNoteTab">Goods Receive</TabsTrigger>
          <TabsTrigger value="RelatedDocumentsTab">Documents</TabsTrigger>
          <TabsTrigger value="CommentsAttachmentsTab">Comments</TabsTrigger>
          <TabsTrigger value="ActivityLogsTab">Activity Log</TabsTrigger>
        </TabsList>
        <TabsContent value="items" className="bg-white p-4 rounded-md shadow">
          <ItemsTab
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onAddItem={handleAddItem}
            poData={poData as PurchaseOrder}
          />
        </TabsContent>
        <TabsContent
          value="FinancialDetailsTab"
          className="bg-white p-4 rounded-md shadow"
        >
          <FinancialDetailsTab poData={poData} />
        </TabsContent>
        <TabsContent
          value="GoodsReceiveNoteTab"
          className="bg-white p-4 rounded-md shadow"
        >
          <GoodsReceiveNoteTab poData={poData} />
        </TabsContent>
        <TabsContent
          value="RelatedDocumentsTab"
          className="bg-white p-4 rounded-md shadow"
        >
          <RelatedDocumentsTab poData={poData} />
        </TabsContent>
        <TabsContent
          value="CommentsAttachmentsTab"
          className="bg-white p-4 rounded-md shadow"
        >
          <CommentsAttachmentsTab poData={poData} />
        </TabsContent>
        <TabsContent
          value="ActivityLogsTab"
          className="bg-white p-4 rounded-md shadow"
        >
          <ActivityLogTab poData={poData} />
        </TabsContent>
      </Tabs>
    </>
  );

  const backLink = (
    <Button variant="ghost" size="icon" asChild className="mr-1">
      <Link href="/procurement/purchase-orders">
        <ArrowLeft className="h-4 w-4" />
      </Link>
    </Button>
  );

  return (
    <>
      <DetailPageTemplate
        title={title}
        actionButtons={actionButtons}
        content={content}
        backLink={backLink}
      />
    </>
  );
}
