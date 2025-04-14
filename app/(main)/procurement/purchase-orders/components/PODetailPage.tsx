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
import StatusBadge from "@/components/ui/custom-status-badge";
import SummaryTotal from "./SummaryTotal";
import { CreditNoteDetail } from "../../credit-note/components/credit-note-detail"

interface PODetailPageProps {
  params: { id: string }
}

export function PODetailPage({ params }: PODetailPageProps) {
  const router = useRouter();
  const [poData, setPOData] = useState<PurchaseOrder | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const samplePO: PurchaseOrder | undefined = Mock_purchaseOrders.filter(
      (po) => po.poId === (params.id)
    )[0];

    setPOData(samplePO as PurchaseOrder);
  }, [params.id]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);
  const handleSave = () => {
    setIsEditing(false);
    // Implement save logic
  };

  const handleDelete = () => setShowDeleteDialog(true);
  const handleConfirmDelete = () => {
    setShowDeleteDialog(false);
    // Implement delete logic
  };

  const handlePrint = () => {
    // Implement print logic
  };

  const handleEmail = () => {
    // Implement email logic
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
      <h1 className="text-xl md:text-2xl font-bold">Purchase Order</h1>
    </div>
  );

  const actionButtons = (
    <div className="flex flex-wrap gap-2">
      {isEditing ? (
        <>
          <Button onClick={handleSave} size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button variant="outline" onClick={handleCancel} size="sm">
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </>
      ) : (
        <>
          <Button onClick={handleEdit} size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete} size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button variant="outline" onClick={handlePrint} size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={handleEmail} size="sm">
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
        </>
      )}
    </div>
  );

  const content = (
    <>
      <Card className="mb-4 bg-white dark:bg-gray-800"> {/* Reduced bottom margin */}
        <CardHeader className="py-3"> {/* Reduced vertical padding */}
          <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
            <div className="flex justify-end">
              <StatusBadge
                status={poData?.status === "Open" ? "default" : "secondary"}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="py-2 "> {/* Reduced vertical padding */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-1">
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
                Exch. Rate
              </Label>
              <Input value={poData?.exchangeRate || "1"} readOnly />
            </div>
            <div className="col-span-1">
              <Label className="text-xs text-muted-foreground">
                Credit Terms
              </Label>
              <Input value={poData?.creditTerms || ""} readOnly />
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
      <Card className="mb-4 bg-white dark:bg-gray-800">
      <Tabs defaultValue="items" className="w-full bg-white dark:bg-gray-800 " >
        <TabsList className="grid w-full grid-cols-6 bg-gray-100 dark:bg-gray-700">
          <TabsTrigger value="items" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground  ">Items</TabsTrigger>
          <TabsTrigger value="GoodsReceiveNoteTab" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground  " >Goods Receive</TabsTrigger>
          <TabsTrigger value="RelatedDocumentsTab" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground  ">Documents</TabsTrigger>
          {/* <TabsTrigger value="CommentsAttachmentsTab" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground  ">Comments & Attachments</TabsTrigger> */}
          {/* <TabsTrigger value="ActivityLogsTab" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground  ">Activity Log</TabsTrigger> */}
        </TabsList>
        <TabsContent value="items" className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
          <ItemsTab
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onAddItem={handleAddItem}
            poData={poData as PurchaseOrder}
          />
        </TabsContent>
        <TabsContent
          value="GoodsReceiveNoteTab"
          className="bg-white dark:bg-gray-800 p-4 rounded-md shadow"
        >
          <GoodsReceiveNoteTab poData={poData} />
        </TabsContent>
        <TabsContent
          value="RelatedDocumentsTab"
          className="bg-white dark:bg-gray-800 p-4 rounded-md shadow"
        >
          <RelatedDocumentsTab poData={poData} />
        </TabsContent>
        {/* <TabsContent
          value="CommentsAttachmentsTab"
          className="bg-white dark:bg-gray-800 p-4 rounded-md shadow"
        >
          <CommentsAttachmentsTab poData={poData} />
        </TabsContent> */}
        {/* <TabsContent
          value="ActivityLogsTab"
          className="bg-white dark:bg-gray-800 p-4 rounded-md shadow"
        >
          <ActivityLogTab poData={poData} />
        </TabsContent> */}
        </Tabs>
      </Card>
      {/* Add SummaryTotal component here */}
      <Card className="mt-4 bg-white dark:bg-gray-800"> {/* Reduced top margin */}
        <CardHeader className="py-3"> {/* Reduced vertical padding */}
          <CardTitle>Transaction Summary</CardTitle>
        </CardHeader>
        <CardContent className="py-2"> {/* Reduced vertical padding */}
          <SummaryTotal poData={poData} />
        </CardContent>
      </Card>
    
    </>
  );

  return (
    <div className="-mt-4 bg-white dark:bg-gray-800">
      <DetailPageTemplate
        title={title}
        actionButtons={actionButtons}
        content={content}
      />
    </div>
  );
}