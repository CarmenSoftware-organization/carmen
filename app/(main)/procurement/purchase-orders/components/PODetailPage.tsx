"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Edit,
  Trash2,
  X,
  CheckSquare,
  FileDown,
  Mail,
  Printer,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  PanelRight,
  PanelRightClose,
  Download,
  FileText,
  Table as TableIcon,
  Plus
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
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
  ActivityLogEntry
} from "@/lib/types";
import { Mock_purchaseOrders } from "@/lib/mock/mock_purchaseOrder";
import StatusBadge from "@/components/ui/custom-status-badge";
import SummaryTotal from "./SummaryTotal";

interface PODetailPageProps {
  params: { id: string }
}

export default function PODetailPage({ params }: PODetailPageProps) {
  const router = useRouter();
  const [poData, setPOData] = useState<PurchaseOrder | null>(null);
  const [isEditing, setIsEditing] = useState(params.id === 'new');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [statusHistory, setStatusHistory] = useState<ActivityLogEntry[]>([]);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<PurchaseOrderStatus | null>(null);
  const [statusReason, setStatusReason] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf");
  const [selectedSections, setSelectedSections] = useState<string[]>([
    "header",
    "items",
    "financialSummary"
  ]);


  useEffect(() => {
    if (params.id === 'new') {
      // Check if we're creating a PO from PRs
      const searchParams = new URLSearchParams(window.location.search);
      const fromPR = searchParams.get('fromPR') === 'true';
      const grouped = searchParams.get('grouped') === 'true';
      const bulk = searchParams.get('bulk') === 'true';
      
      let newPO = {
        poId: 'new',
        number: 'New PO',
        vendorId: 0,
        vendorName: '',
        orderDate: new Date(),
        status: PurchaseOrderStatus.Draft,
        currencyCode: 'USD',
        baseCurrencyCode: 'USD',
        exchangeRate: 1,
        createdBy: 1,
        email: '',
        buyer: '',
        creditTerms: '',
        description: '',
        remarks: '',
        items: [],
        purchaseRequisitionIds: [] as string[],
        purchaseRequisitionNumbers: [] as string[],
        baseSubTotalPrice: 0,
        subTotalPrice: 0,
        baseNetAmount: 0,
        netAmount: 0,
        baseDiscAmount: 0,
        discountAmount: 0,
        baseTaxAmount: 0,
        taxAmount: 0,
        baseTotalAmount: 0,
        totalAmount: 0,
        activityLog: []
      };

      if (fromPR && grouped) {
        try {
          const groupedPRsData = localStorage.getItem('groupedPurchaseRequests');
          if (groupedPRsData) {
            const groupedItems = JSON.parse(groupedPRsData);
            const groups = Object.values(groupedItems) as any[];
            
            if (groups.length > 0) {
              // For single PO creation, use the first group
              const firstGroup = groups[0];
              
              // Convert item group data to PO format
              newPO = {
                ...newPO,
                vendorId: firstGroup.vendorId,
                vendorName: firstGroup.vendor,
                currencyCode: firstGroup.currency,
                description: `Purchase Order created from ${firstGroup.items.length} item${firstGroup.items.length > 1 ? 's' : ''} from PR${firstGroup.sourcePRs.length > 1 ? 's' : ''}: ${firstGroup.sourcePRs.join(', ')}`,
                purchaseRequisitionIds: firstGroup.items.map((item: any) => item.prId),
                purchaseRequisitionNumbers: firstGroup.sourcePRs,
                // Convert items to PO items
                items: firstGroup.items.map((item: any) => ({
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
                  baseSubTotalPrice: (item.price || 0) * (item.quantityApproved || item.quantityRequested || 0),
                  subTotalPrice: (item.price || 0) * (item.quantityApproved || item.quantityRequested || 0),
                  baseNetAmount: item.netAmount || 0,
                  netAmount: item.netAmount || 0,
                  baseDiscAmount: item.discountAmount || 0,
                  discountAmount: item.discountAmount || 0,
                  baseTaxAmount: item.taxAmount || 0,
                  taxAmount: item.taxAmount || 0,
                  baseTotalAmount: item.totalAmount || 0,
                  totalAmount: item.totalAmount || 0,
                  inventoryInfo: item.inventoryInfo || {
                    onHand: 0,
                    onOrdered: 0,
                    reorderLevel: 0,
                    restockLevel: 0,
                    averageMonthlyUsage: 0,
                    lastPrice: 0,
                    lastOrderDate: new Date(),
                    lastVendor: ''
                  },
                  // Add PR traceability
                  sourcePRId: item.prId,
                  sourcePRNumber: item.prNumber,
                  sourcePRItemId: item.id
                })),
                // Calculate totals from items
                baseSubTotalPrice: firstGroup.items.reduce((sum: number, item: any) => sum + (item.baseSubTotalPrice || 0), 0),
                subTotalPrice: firstGroup.items.reduce((sum: number, item: any) => sum + (item.subTotalPrice || 0), 0),
                baseNetAmount: firstGroup.items.reduce((sum: number, item: any) => sum + (item.baseNetAmount || 0), 0),
                netAmount: firstGroup.items.reduce((sum: number, item: any) => sum + (item.netAmount || 0), 0),
                baseDiscAmount: firstGroup.items.reduce((sum: number, item: any) => sum + (item.baseDiscAmount || 0), 0),
                discountAmount: firstGroup.items.reduce((sum: number, item: any) => sum + (item.discountAmount || 0), 0),
                baseTaxAmount: firstGroup.items.reduce((sum: number, item: any) => sum + (item.baseTaxAmount || 0), 0),
                taxAmount: firstGroup.items.reduce((sum: number, item: any) => sum + (item.taxAmount || 0), 0),
                baseTotalAmount: firstGroup.totalAmount,
                totalAmount: firstGroup.totalAmount
              };
            }
            
            // Clear the localStorage after use
            localStorage.removeItem('groupedPurchaseRequests');
            localStorage.removeItem('selectedPurchaseRequests');
          }
        } catch (error) {
          console.error('Error processing grouped item data:', error);
        }
      }
      
      setPOData(newPO);
      setStatusHistory([]);
    } else {
      // Fetch existing PO
      const foundPO = Mock_purchaseOrders.find(po => po.poId === params.id);
      if (foundPO) {
        setPOData(foundPO);
        // Extract status-related entries from activity log
        if (foundPO.activityLog) {
          const statusEntries = foundPO.activityLog.filter(
            entry => entry.activityType === "StatusChange"
          );
          setStatusHistory(statusEntries);
        }
      }
    }
  }, [params.id]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);
  const handleSave = () => {
    setIsEditing(false);
    // Save logic would go here
    console.log("Saving PO:", poData);
  };

  const handleDelete = () => setShowDeleteDialog(true);
  const handleConfirmDelete = () => {
    // Delete logic would go here
    console.log("Deleting PO:", poData);
    router.push('/procurement/purchase-orders');
  };

  const handlePrint = () => {
    // Print logic would go here
    console.log("Printing PO:", poData);
  };

  const handleEmail = () => {
    // Email logic would go here
    console.log("Emailing PO:", poData);
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

  const handleStatusChange = (newStatus: string) => {
    if (!poData || poData.status === newStatus) return;
    
    // Set the pending status and show confirmation dialog
    setPendingStatus(newStatus as PurchaseOrderStatus);
    setStatusReason("");
    setShowStatusDialog(true);
  };

  const handleConfirmStatusChange = () => {
    if (!poData || !pendingStatus) return;
    
    const oldStatus = poData.status;
    
    // Create new activity log entry
    const statusChangeEntry: ActivityLogEntry = {
      id: crypto.randomUUID(),
      action: "Status Change",
      userId: "1", // Would come from auth context in a real app
      userName: "Current User", // Would come from auth context in a real app
      activityType: "StatusChange",
      description: `Status changed from ${oldStatus} to ${pendingStatus}${statusReason ? ` - Reason: ${statusReason}` : ''}`,
      timestamp: new Date()
    };
    
    // Update the PO data with new status and updated activity log
    const updatedActivityLog = poData.activityLog ? 
      [...poData.activityLog, statusChangeEntry] : 
      [statusChangeEntry];
    
    setPOData({
      ...poData,
      status: pendingStatus,
      activityLog: updatedActivityLog
    });
    
    // Update status history
    setStatusHistory([...statusHistory, statusChangeEntry]);
    
    // Close the dialog
    setShowStatusDialog(false);
    setPendingStatus(null);
    setStatusReason("");
    
    // In a real app, you would also update the backend here
    console.log(`Status changed from ${oldStatus} to ${pendingStatus} - Reason: ${statusReason || 'None provided'}`);
  };

  const handleCancelStatusChange = () => {
    setShowStatusDialog(false);
    setPendingStatus(null);
    setStatusReason("");
  };

  const getStatusChangeMessage = () => {
    if (!poData || !pendingStatus) return "";
    
    const oldStatus = poData.status;
    
    if (oldStatus === PurchaseOrderStatus.Draft && pendingStatus === PurchaseOrderStatus.Sent) {
      return "This will mark the purchase order as sent to the vendor. Continue?";
    }
    
    if (pendingStatus === PurchaseOrderStatus.Voided || pendingStatus === PurchaseOrderStatus.Cancelled) {
      return "This action cannot be undone. Please provide a reason for cancelling or voiding this purchase order.";
    }
    
    if (pendingStatus === PurchaseOrderStatus.Closed) {
      return "This will mark the purchase order as closed. Any remaining quantities will no longer be available for receiving. Continue?";
    }
    
    if (pendingStatus === PurchaseOrderStatus.FullyReceived) {
      return "This will mark the purchase order as fully received. Continue?";
    }
    
    return `Are you sure you want to change the status from "${oldStatus}" to "${pendingStatus}"?`;
  };

  const requiresReason = () => {
    if (!pendingStatus) return false;
    return pendingStatus === PurchaseOrderStatus.Voided || pendingStatus === PurchaseOrderStatus.Cancelled;
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleExport = () => {
    setShowExportDialog(true);
  };

  const handleConfirmExport = () => {
    // In a real app, this would trigger the actual export
    console.log("Exporting PO in format:", exportFormat);
    console.log("Including sections:", selectedSections);
    setShowExportDialog(false);
  };

  const toggleSelectedSection = (section: string) => {
    setSelectedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  if (!poData) {
    return <div>Loading... (Data not found)</div>;
  }

  const title = (
    <div className="flex items-center space-x-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => router.push('/procurement/purchase-orders')}
        className="mr-2 h-8 w-8"
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="sr-only">Back to Purchase Orders</span>
      </Button>
      <h1 className="text-xl md:text-2xl font-bold">Purchase Order</h1>
    </div>
  );

  const actionButtons = (
    <div className="flex flex-wrap gap-2">
      {isEditing ? (
        <>
          <Button variant="default" onClick={handleSave}>
            <CheckSquare className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </>
      ) : (
        <>
          <Button variant="default" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleDelete}>
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
          <Button variant="outline" onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>

        </>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <DetailPageTemplate
        title={title}
        backLink="/procurement/purchase-orders"
        actionButtons={actionButtons}
        content={
          <div className="flex flex-col lg:flex-row gap-4 relative">
            {/* Main content area */}
            <div className={`flex-1 space-y-4 ${isSidebarCollapsed ? 'lg:pr-0' : 'lg:pr-4'}`}>
              {/* Header information */}
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="py-3">
                  <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-start">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-1">
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
                            name="orderDate"
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
                            name="vendorName"
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
                        <Label className="text-xs text-muted-foreground">Status</Label>
                        <div className="font-semibold">
                          {isEditing ? (
                            <Select 
                              value={poData.status} 
                              onValueChange={handleStatusChange}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(PurchaseOrderStatus).map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <StatusBadge status={poData?.status} />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Panel toggle button in header - updated with better icons */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline" 
                          size="icon" 
                          onClick={toggleSidebar}
                          className="hidden lg:flex h-8 w-8 rounded-full ml-4 mt-1"
                        >
                          {isSidebarCollapsed ? (
                            <PanelRight className="h-4 w-4" />
                          ) : (
                            <PanelRightClose className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isSidebarCollapsed ? "Show panel" : "Hide panel"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Delivery Date
                      </Label>
                      {isEditing ? (
                        <Input 
                          type="date"
                          name="DeliveryDate"
                          value={poData?.DeliveryDate?.toISOString().split("T")[0] || ""}
                          onChange={handleInputChange}
                          className="w-full"
                        />
                      ) : (
                        <div className="font-semibold mt-1">
                          {poData?.DeliveryDate?.toISOString().split("T")[0] || ""}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Currency</Label>
                      {isEditing ? (
                        <Input 
                          name="currencyCode"
                          value={poData?.currencyCode || ""}
                          onChange={handleInputChange}
                          className="w-full"
                        />
                      ) : (
                        <div className="font-semibold mt-1">{poData?.currencyCode || ""}</div>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Exch. Rate
                      </Label>
                      {isEditing ? (
                        <Input 
                          type="number"
                          step="0.0001"
                          name="exchangeRate"
                          value={poData?.exchangeRate || "1"}
                          onChange={handleInputChange}
                          className="w-full"
                        />
                      ) : (
                        <div className="font-semibold mt-1">{poData?.exchangeRate || "1"}</div>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Credit Terms
                      </Label>
                      {isEditing ? (
                        <Input 
                          name="creditTerms"
                          value={poData?.creditTerms || ""}
                          onChange={handleInputChange}
                          className="w-full"
                        />
                      ) : (
                        <div className="font-semibold mt-1">{poData?.creditTerms || ""}</div>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Buyer
                      </Label>
                      {isEditing ? (
                        <Input 
                          name="buyer"
                          value={poData?.buyer || ""}
                          onChange={handleInputChange}
                          className="w-full"
                        />
                      ) : (
                        <div className="font-semibold mt-1">{poData?.buyer || ""}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Description
                      </Label>
                      {isEditing ? (
                        <Textarea 
                          name="description"
                          value={poData?.description || ""}
                          onChange={(e) => poData && setPOData({ ...poData, description: e.target.value })}
                          className="w-full h-24"
                        />
                      ) : (
                        <div className="font-semibold mt-1 bg-gray-50 p-2 rounded-md h-24 overflow-auto">
                          {poData?.description || ""}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Remarks</Label>
                      {isEditing ? (
                        <Textarea 
                          name="remarks"
                          value={poData?.remarks || ""}
                          onChange={(e) => poData && setPOData({ ...poData, remarks: e.target.value })}
                          className="w-full h-24"
                        />
                      ) : (
                        <div className="font-semibold mt-1 bg-gray-50 p-2 rounded-md h-24 overflow-auto">
                          {poData?.remarks || ""}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <Card className="bg-white dark:bg-gray-800">
                <Tabs defaultValue="items" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-700">
                    <TabsTrigger value="items" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Items
                    </TabsTrigger>
                    {params.id !== 'new' && (
                      <>
                        <TabsTrigger value="goodsReceive" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                          Goods Receive
                        </TabsTrigger>
                        <TabsTrigger value="relatedDocs" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                          Documents
                        </TabsTrigger>
                        <TabsTrigger value="activityLog" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                          Activity Log
                        </TabsTrigger>
                      </>
                    )}
                  </TabsList>

                  <TabsContent value="items" className="p-4">
                    <ItemsTab
                      poData={poData}
                      onUpdateItem={handleUpdateItem}
                      onDeleteItem={handleDeleteItem}
                      onAddItem={handleAddItem}
                    />
                  </TabsContent>

                  {params.id !== 'new' && (
                    <>
                      <TabsContent value="goodsReceive" className="p-4">
                        <GoodsReceiveNoteTab poData={poData} />
                      </TabsContent>

                      <TabsContent value="relatedDocs" className="p-4">
                        <RelatedDocumentsTab poData={poData} />
                      </TabsContent>

                      <TabsContent value="activityLog" className="p-4">
                        <ActivityLogTab poData={poData} />
                        
                        {/* Status History Section */}
                        {statusHistory.length > 0 && (
                          <div className="mt-6 border rounded-md p-4">
                            <h3 className="text-md font-medium mb-3">Status Change History</h3>
                            <div className="space-y-3">
                              {statusHistory.map((entry) => (
                                <div key={entry.id} className="flex justify-between border-b pb-2">
                                  <div>
                                    <p className="text-sm">{entry.description}</p>
                                    <p className="text-xs text-muted-foreground">{entry.userName}</p>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {entry.timestamp.toLocaleString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>
                    </>
                  )}
                </Tabs>
              </Card>

              {/* Financial Summary */}
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="py-3">
                  <CardTitle>Transaction Summary</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <SummaryTotal poData={poData} />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Comments/Attachments */}
            <div 
              className={`transition-all duration-300 ease-in-out ${
                isSidebarCollapsed 
                  ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' 
                  : 'lg:w-80 opacity-100'
              } space-y-4`}
            >
              {/* Comments & Attachments */}
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="py-3">
                  <CardTitle>Comments & Attachments</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  {params.id !== 'new' && <CommentsAttachmentsTab poData={poData} />}
                </CardContent>
              </Card>
            </div>
          </div>
        }
      />

      {/* Status Change Confirmation Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Confirm Status Change
            </DialogTitle>
            <DialogDescription>
              {getStatusChangeMessage()}
            </DialogDescription>
          </DialogHeader>
          
          {requiresReason() && (
            <div className="py-4">
              <Label htmlFor="status-reason" className="text-right mb-2">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="status-reason"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Please provide a reason for this status change"
                className="w-full"
              />
            </div>
          )}
          
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelStatusChange}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmStatusChange}
              disabled={requiresReason() && !statusReason.trim()}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Purchase Order</DialogTitle>
            <DialogDescription>
              Select the format and sections to include in the export.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Export Format</h3>
              <RadioGroup value={exportFormat} onValueChange={setExportFormat} className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="pdf" />
                  <Label htmlFor="pdf" className="flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                    PDF Document
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excel" id="excel" />
                  <Label htmlFor="excel" className="flex items-center">
                    <TableIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    Excel Spreadsheet
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="csv" />
                  <Label htmlFor="csv" className="flex items-center">
                    <Download className="mr-2 h-4 w-4 text-muted-foreground" />
                    CSV File
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Include Sections</h3>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="header" 
                    checked={selectedSections.includes("header")}
                    onCheckedChange={() => toggleSelectedSection("header")}
                  />
                  <Label htmlFor="header">Header Information</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="items" 
                    checked={selectedSections.includes("items")}
                    onCheckedChange={() => toggleSelectedSection("items")}
                  />
                  <Label htmlFor="items">Items Detail</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="financialSummary" 
                    checked={selectedSections.includes("financialSummary")}
                    onCheckedChange={() => toggleSelectedSection("financialSummary")}
                  />
                  <Label htmlFor="financialSummary">Financial Summary</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="vendorInfo" 
                    checked={selectedSections.includes("vendorInfo")}
                    onCheckedChange={() => toggleSelectedSection("vendorInfo")}
                  />
                  <Label htmlFor="vendorInfo">Vendor Information</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="comments" 
                    checked={selectedSections.includes("comments")}
                    onCheckedChange={() => toggleSelectedSection("comments")}
                  />
                  <Label htmlFor="comments">Comments</Label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowExportDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmExport}
              disabled={selectedSections.length === 0}
            >
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </TooltipProvider>
  );
}