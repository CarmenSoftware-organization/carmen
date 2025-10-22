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
  Plus,
  Calendar as CalendarIcon,
  Tag as TagIcon,
  User as UserIcon,
  Building as BuildingIcon,
  Truck as TruckIcon,
  DollarSign as DollarSignIcon,
  TrendingUp as TrendingUpIcon,
  CreditCard as CreditCardIcon,
  FileText as FileTextIcon,
  MessageSquare as MessageSquareIcon
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
import EnhancedItemsTab from "./tabs/EnhancedItemsTab";
import FinancialDetailsTab from "./tabs/FinancialDetailsTab";
import RelatedDocumentsTab from "./tabs/RelatedDocumentsTab";
import ActivityLogTab from "./tabs/ActivityLogTab";
import {
  PurchaseOrderItem,
  PurchaseOrderStatus,
  PurchaseOrder
} from "@/lib/types";

// Local type definition for activity log
interface ActivityLogEntry {
  id: string;
  action: string;
  userId: string;
  userName: string;
  activityType: string;
  description: string;
  timestamp: Date;
}
import { mockPurchaseOrders } from "@/lib/mock-data";
import StatusBadge from "@/components/ui/custom-status-badge";
import TransactionSummary from "./TransactionSummary";

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
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
        status: PurchaseOrderStatus.DRAFT,
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
      
      setPOData(newPO as any);
      setStatusHistory([]);
    } else {
      // Fetch existing PO
      const foundPO = mockPurchaseOrders.find(po => (po as any).poId === params.id || po.id === params.id);
      if (foundPO) {
        setPOData(foundPO as any);
        // Extract status-related entries from activity log
        if ((foundPO as any).activityLog) {
          const statusEntries = (foundPO as any).activityLog.filter(
            (entry: any) => entry.activityType === "StatusChange"
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
      const updatedItems = (poData as any).items.map((item: any) =>
        item.id === updatedItem.id ? updatedItem : item
      );
      setPOData({ ...poData, items: updatedItems as PurchaseOrderItem[] } as any);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    if (poData) {
      const updatedItems = (poData as any).items.filter((item: any) => item.id !== itemId);
      setPOData({ ...poData, items: updatedItems } as any);
    }
  };

  const handleAddItem = (newItem: PurchaseOrderItem) => {
    if (poData) {
      setPOData({
        ...poData,
        items: [...(poData as any).items, newItem as unknown as PurchaseOrderItem],
      } as any);
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
    const updatedActivityLog = (poData as any).activityLog ?
      [...(poData as any).activityLog, statusChangeEntry] :
      [statusChangeEntry];

    setPOData({
      ...poData,
      status: pendingStatus,
      activityLog: updatedActivityLog
    } as any);
    
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
    const newStatus = pendingStatus as any; // Cast to any for comparison with string literals

    // Note: PurchaseOrder interface uses lowercase string literals, not enum values
    if (oldStatus === 'draft' && newStatus === 'sent') {
      return "This will mark the purchase order as sent to the vendor. Continue?";
    }

    if (newStatus === 'cancelled') {
      return "This action cannot be undone. Please provide a reason for cancelling this purchase order.";
    }

    if (newStatus === 'closed') {
      return "This will mark the purchase order as closed. Any remaining quantities will no longer be available for receiving. Continue?";
    }

    if (newStatus === 'fully_received') {
      return "This will mark the purchase order as fully received. Continue?";
    }

    return `Are you sure you want to change the status from "${oldStatus}" to "${newStatus}"?`;
  };

  const requiresReason = () => {
    if (!pendingStatus) return false;
    return (pendingStatus as any) === 'cancelled';
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
        className="mr-2 h-6 w-6"
      >
        <ChevronLeft className="h-3 w-3" />
        <span className="sr-only">Back to Purchase Orders</span>
      </Button>
      <div className="flex flex-col">
        <h1 className="text-lg font-bold">{(poData as any)?.number || poData?.orderNumber || 'Purchase Order'}</h1>
        {((poData as any)?.number || poData?.orderNumber) && (poData as any)?.number !== 'New PO' && (
          <p className="text-xs text-muted-foreground mt-1">Purchase Order</p>
        )}
      </div>
    </div>
  );

  const headerDetails = (
    <div className="space-y-6">
      {/* Status Change for Editing Mode */}
      {isEditing && (
        <div className="mb-6">
          <Label className="text-xs font-medium text-muted-foreground mb-2 block">Update Status</Label>
          <Select 
            value={poData.status} 
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-40 h-8 text-xs">
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
        </div>
      )}

      {/* Key Information Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <Label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            Date
          </Label>
          {isEditing ? (
            <Input
              type="date"
              name="orderDate"
              value={poData?.orderDate?.toISOString().split("T")[0] || ""}
              onChange={handleInputChange}
              className="w-full h-8 text-xs"
            />
          ) : (
            <div className="text-xs text-gray-900 font-medium">
              {poData?.orderDate ? new Date(poData.orderDate).toLocaleDateString('en-GB') : ""}
            </div>
          )}
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1">
            <TagIcon className="h-3 w-3" />
            PO Type
          </Label>
          <div className="text-gray-900 font-medium">General Purchase</div>
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1">
            <UserIcon className="h-3 w-3" />
            Requestor
          </Label>
          {isEditing ? (
            <Input
              type="text"
              name="buyer"
              value={(poData as any)?.buyer || poData?.approvedBy || ""}
              onChange={handleInputChange}
              className="w-full h-8 text-xs"
            />
          ) : (
            <div className="text-xs text-gray-900 font-medium">{(poData as any)?.buyer || poData?.approvedBy || ""}</div>
          )}
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1">
            <BuildingIcon className="h-3 w-3" />
            Department
          </Label>
          {isEditing ? (
            <Input
              type="text"
              name="vendorName"
              value={poData?.vendorName || ""}
              onChange={handleInputChange}
              className="w-full h-8 text-xs"
            />
          ) : (
            <div className="text-xs text-gray-900 font-medium">{poData?.vendorName || "Not specified"}</div>
          )}
        </div>
      </div>
      
      {/* Additional Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <Label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1">
            <TruckIcon className="h-3 w-3" />
            Delivery Date
          </Label>
          {isEditing ? (
            <Input 
              type="date"
              name="DeliveryDate"
              value={poData?.DeliveryDate?.toISOString().split("T")[0] || ""}
              onChange={handleInputChange}
              className="w-full h-8 text-xs"
            />
          ) : (
            <div className="text-xs text-gray-900 font-medium">
              {poData?.DeliveryDate?.toISOString().split("T")[0] || "Not set"}
            </div>
          )}
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1">
            <DollarSignIcon className="h-3 w-3" />
            Currency
          </Label>
          {isEditing ? (
            <Input 
              name="currencyCode"
              value={poData?.currencyCode || ""}
              onChange={handleInputChange}
              className="w-full h-8 text-xs"
            />
          ) : (
            <div className="text-xs text-gray-900 font-medium">{poData?.currencyCode || ""}</div>
          )}
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1">
            <TrendingUpIcon className="h-3 w-3" />
            Exchange Rate
          </Label>
          {isEditing ? (
            <Input 
              type="number"
              step="0.0001"
              name="exchangeRate"
              value={poData?.exchangeRate || "1"}
              onChange={handleInputChange}
              className="w-full h-8 text-xs"
            />
          ) : (
            <div className="text-xs text-gray-900 font-medium">{poData?.exchangeRate || "1"}</div>
          )}
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1">
            <CreditCardIcon className="h-3 w-3" />
            Credit Terms
          </Label>
          {isEditing ? (
            <Input 
              name="creditTerms"
              value={poData?.creditTerms || ""}
              onChange={handleInputChange}
              className="w-full h-8 text-xs"
            />
          ) : (
            <div className="text-xs text-gray-900 font-medium">{poData?.creditTerms || "Not specified"}</div>
          )}
        </div>
      </div>

      {/* Description and Remarks Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block flex items-center gap-1">
            <FileTextIcon className="h-3 w-3" />
            Description
          </Label>
          {isEditing ? (
            <Textarea 
              name="description"
              value={poData?.description || ""}
              onChange={(e) => poData && setPOData({ ...poData, description: e.target.value })}
              className="w-full h-20"
              placeholder="Add purchase order description..."
            />
          ) : (
            <div className="text-gray-900 font-medium bg-gray-50 p-3 rounded-md min-h-[60px]">
              {poData?.description || "No description"}
            </div>
          )}
        </div>
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block flex items-center gap-1">
            <MessageSquareIcon className="h-3 w-3" />
            Remarks
          </Label>
          {isEditing ? (
            <Textarea 
              name="remarks"
              value={poData?.remarks || ""}
              onChange={(e) => poData && setPOData({ ...poData, remarks: e.target.value })}
              className="w-full h-20"
              placeholder="Add any additional remarks or notes..."
            />
          ) : (
            <div className="text-gray-900 font-medium bg-gray-50 p-3 rounded-md min-h-[60px]">
              {poData?.remarks || "No remarks"}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const actionButtons = (
    <div className="flex flex-wrap gap-2 items-center">
      {isEditing ? (
        <>
          <Button variant="default" className="h-8 px-3 text-xs" onClick={handleSave}>
            <CheckSquare className="mr-2 h-3 w-3" />
            Save
          </Button>
          <Button variant="outline" className="h-8 px-2 text-xs" onClick={handleCancel}>
            <X className="mr-2 h-3 w-3" />
            Cancel
          </Button>
        </>
      ) : (
        <>
          <Button variant="default" onClick={handleEdit}>
            <Edit className="mr-2 h-3 w-3" />
            Edit
          </Button>
          <Button variant="outline" className="h-8 px-2 text-xs" onClick={handleDelete}>
            <Trash2 className="mr-2 h-3 w-3" />
            Delete
          </Button>
          <Button variant="outline" className="h-8 px-2 text-xs" onClick={handlePrint}>
            <Printer className="mr-2 h-3 w-3" />
            Print
          </Button>
          <Button variant="outline" className="h-8 px-2 text-xs" onClick={handleEmail}>
            <Mail className="mr-2 h-3 w-3" />
            Email
          </Button>
          <Button variant="outline" className="h-8 px-2 text-xs" onClick={handleExport}>
            <FileDown className="mr-2 h-3 w-3" />
            Export
          </Button>
        </>
      )}
      
      {/* Panel toggle button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline" 
              size="icon" 
              onClick={toggleSidebar}
              className="h-6 w-6"
            >
              {isSidebarCollapsed ? (
                <PanelRight className="h-3 w-3" />
              ) : (
                <PanelRightClose className="h-3 w-3" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isSidebarCollapsed ? "Show panel" : "Hide panel"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  return (
    <TooltipProvider>
      <DetailPageTemplate
        title={title}
        status={poData?.status && <StatusBadge status={poData.status} />}
        details={headerDetails}
        isEditing={isEditing}
        backLink="/procurement/purchase-orders"
        actionButtons={actionButtons}
        content={
          <div className="flex flex-col lg:flex-row gap-4 relative">
            {/* Main content area */}
            <div className={`flex-1 space-y-4 ${isSidebarCollapsed ? 'lg:pr-0' : 'lg:pr-4'}`}>

              {/* Tabs */}
              <Card className="bg-white dark:bg-gray-800">
                <Tabs defaultValue="items" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-700">
                    <TabsTrigger value="items" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Items
                    </TabsTrigger>
                    {params.id !== 'new' && (
                      <>
                        <TabsTrigger value="relatedDocs" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                          Documents
                        </TabsTrigger>
                      </>
                    )}
                  </TabsList>

                  <TabsContent value="items" className="p-4">
                    <EnhancedItemsTab
                      poData={poData}
                      onUpdateItem={handleUpdateItem}
                      onDeleteItem={handleDeleteItem}
                      onAddItem={handleAddItem}
                      onGoodsReceived={(item) => {
                        // Implement goods received logic
                        console.log('Goods received for item:', item);
                      }}
                      onSplitLine={(item) => {
                        // Implement split line logic
                        console.log('Split line for item:', item);
                      }}
                      onCancelItem={(item) => {
                        // Implement cancel item logic
                        console.log('Cancel item:', item);
                      }}
                      editable={isEditing}
                    />
                  </TabsContent>

                  {params.id !== 'new' && (
                    <>

                      <TabsContent value="relatedDocs" className="p-4">
                        <RelatedDocumentsTab poData={poData} />
                      </TabsContent>
                    </>
                  )}
                </Tabs>
              </Card>

              {/* Financial Summary */}
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="py-6">
                  <TransactionSummary poData={poData} isEditing={isEditing} />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Activity Log */}
            <div 
              className={`transition-all duration-300 ease-in-out ${
                isSidebarCollapsed 
                  ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' 
                  : 'lg:w-80 opacity-100'
              } space-y-4`}
            >
              {/* Activity Log */}
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="py-3">
                  <CardTitle className="text-base">Activity Log</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  {params.id !== 'new' && <ActivityLogTab poData={poData} />}
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
            <DialogTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-3 w-3 text-yellow-500" />
              Confirm Status Change
            </DialogTitle>
            <DialogDescription>
              {getStatusChangeMessage()}
            </DialogDescription>
          </DialogHeader>
          
          {requiresReason() && (
            <div className="py-4">
              <Label htmlFor="status-reason" className="text-xs font-medium mb-2">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="status-reason"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Please provide a reason for this status change"
                className="w-full h-8 text-xs"
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
            <DialogTitle className="text-lg">Export Purchase Order</DialogTitle>
            <DialogDescription>
              Select the format and sections to include in the export.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-xs font-medium">Export Format</h3>
              <RadioGroup value={exportFormat} onValueChange={setExportFormat} className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="pdf" />
                  <Label htmlFor="pdf" className="flex items-center">
                    <FileText className="mr-2 h-3 w-3 text-muted-foreground" />
                    PDF Document
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excel" id="excel" />
                  <Label htmlFor="excel" className="flex items-center">
                    <TableIcon className="mr-2 h-3 w-3 text-muted-foreground" />
                    Excel Spreadsheet
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="csv" />
                  <Label htmlFor="csv" className="flex items-center">
                    <Download className="mr-2 h-3 w-3 text-muted-foreground" />
                    CSV File
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xs font-medium">Include Sections</h3>
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