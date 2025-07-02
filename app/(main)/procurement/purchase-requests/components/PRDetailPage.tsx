// File: PRDetailPage.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileIcon,
  PrinterIcon,
  DownloadIcon,
  HashIcon,
  BuildingIcon,
  MapPinIcon,
  UserIcon,
  ShareIcon,
  Edit,
  CheckCircleIcon,
  XCircleIcon,
  RotateCcwIcon,
  CheckCircle,
  X,
  CalendarIcon,
  TagIcon,
  ClipboardListIcon,
  ChevronLeft,
} from "lucide-react";
import { PRHeader } from "./PRHeader";
import { ItemsTab } from "./tabs/ItemsTab";
import { ResponsiveBudgetScreen } from "./tabs/budget-tab";
import { WorkflowTab } from "./tabs/WorkflowTab";
import { AttachmentsTab } from "./tabs/AttachmentsTab";
import { ActivityTab } from "./tabs/ActivityTab";
import { PRRBACService, type WorkflowAction } from "../services/rbac-service";
import {
  PurchaseRequest,
  PRType,
  DocumentStatus,
  WorkflowStatus,
  WorkflowStage,
  Requestor,
} from "@/lib/types";
import {
  getBadgeVariant,
  handleDocumentAction,
  getNextWorkflowStage,
  getPreviousWorkflowStage,
} from "./utils";
import { samplePRData, samplePRItems } from "./sampleData";
import { useUser } from "@/lib/context/user-context";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import StatusBadge from "@/components/ui/custom-status-badge";
import SummaryTotal from "./SummaryTotal";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { canEditField } from "@/lib/utils/field-permissions";

export default function PRDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAddMode = searchParams?.get("mode") === "add";

  const [mode, setMode] = useState<"view" | "edit" | "add">(
    isAddMode ? "add" : "view"
  );
  const [formData, setFormData] = useState<PurchaseRequest>(
    isAddMode ? getEmptyPurchaseRequest() : samplePRData
  );
  
  // RBAC state
  const [availableActions, setAvailableActions] = useState<WorkflowAction[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useUser(); // Get current user from context

  useEffect(() => {
    setIsMounted(true);
    if (isAddMode) {
      setMode("add");
      setFormData(getEmptyPurchaseRequest());
    }
  }, [isAddMode]);

  // Update available actions when user or formData changes
  useEffect(() => {
    if (user && formData) {
      const actions = PRRBACService.getAvailableActions(user, formData);
      setAvailableActions(actions);
    }
  }, [user, formData]);

  const handleModeChange = (newMode: "view" | "edit") => setMode(newMode);

  // RBAC-controlled workflow action handlers
  const handleWorkflowAction = (action: WorkflowAction) => {
    if (!user || !PRRBACService.canPerformAction(user, formData, action)) {
      console.warn(`User ${user?.name} cannot perform action: ${action}`);
      return;
    }

    switch (action) {
      case 'approve':
        handleApprove();
        break;
      case 'reject':
        handleReject();
        break;
      case 'sendBack':
        handleSendBack();
        break;
      case 'edit':
        setMode('edit');
        break;
      case 'delete':
        handleDelete();
        break;
      case 'submit':
        handleSubmitForApproval();
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }
  };

  const handleApprove = () => {
    const nextStage = getNextWorkflowStage(formData.workflowStage);
    const updatedData = {
      ...formData,
      status: nextStage === WorkflowStage.Completed ? DocumentStatus.Approved : DocumentStatus.InProgress,
      workflowStage: nextStage,
      lastModified: new Date().toISOString(),
    };
    setFormData(updatedData);
    console.log('PR Approved:', updatedData);
  };

  const handleReject = () => {
    const updatedData = {
      ...formData,
      status: DocumentStatus.Rejected,
      lastModified: new Date().toISOString(),
    };
    setFormData(updatedData);
    console.log('PR Rejected:', updatedData);
  };

  const handleSendBack = () => {
    const previousStage = getPreviousWorkflowStage(formData.workflowStage);
    const updatedData = {
      ...formData,
      status: DocumentStatus.InProgress,
      workflowStage: previousStage,
      lastModified: new Date().toISOString(),
    };
    setFormData(updatedData);
    console.log('PR Sent Back:', updatedData);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this purchase request?')) {
      console.log('PR Deleted:', formData.id);
      router.push('/procurement/purchase-requests');
    }
  };

  const handleSubmitForApproval = () => {
    const updatedData = {
      ...formData,
      status: DocumentStatus.Submitted,
      workflowStage: WorkflowStage.DepartmentApproval,
      lastModified: new Date().toISOString(),
    };
    setFormData(updatedData);
    console.log('PR Submitted for Approval:', updatedData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    if (mode === "add") {
      // Here you would typically save the new PR to your backend
      console.log("New PR created:", formData);
      router.push("/procurement/purchase-requests"); // Redirect back to the list
    } else {
      setMode("view");
    }
  };

  const handleWorkflowAction = (action: WorkflowAction) => {
    console.log(`Workflow action: ${action}`);
    setFormData((prev) => ({
      ...prev,
      status:
        action === "approve"
          ? DocumentStatus.InProgress
          : action === "reject"
          ? DocumentStatus.Rejected
          : prev.status,
      workflowStatus:
        action === "approve"
          ? WorkflowStatus.approved
          : action === "reject"
          ? WorkflowStatus.rejected
          : WorkflowStatus.pending,
      currentWorkflowStage:
        action === "approve"
          ? getNextWorkflowStage(prev.currentWorkflowStage)
          : action === "reject"
          ? WorkflowStage.requester
          : action === "sendBack"
          ? getPreviousWorkflowStage(prev.currentWorkflowStage)
          : prev.currentWorkflowStage,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  };

  const handleOrderUpdate = (orderId: string, updates: any) => {
    console.log("Updating order:", orderId, updates);
    // Handle item updates here
  };

  return (
    <div className="container mx-auto py-6 space-y-6 pb-20">
      {/* Header Card */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="pb-4 border-b bg-muted/10">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 rounded-full p-0 mr-1"
                  onClick={() => router.back()}
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span className="sr-only">Back to Purchase Requests</span>
                </Button>
                <h1 className="text-2xl font-bold">
                  {mode === "add"
                    ? "Create New Purchase Request"
                    : formData.refNumber || "Purchase Request Details"}
                </h1>
                {formData.refNumber && <StatusBadge status={formData.status} className="h-6" />}
              </div>
              {formData.refNumber && (
                <CardDescription>
                  Created on {isMounted ? format(formData.date, "dd MMM yyyy") : formData.date.toISOString().split('T')[0]} • 
                  {formData.type} • {formData.description}
                </CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {/* Edit/Save/Cancel buttons */}
              {mode === "view" ? (
                (user?.context.currentRole.name === "Requestor" || isAddMode) && (
                  <Button onClick={() => handleModeChange("edit")}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )
              ) : (
                <>
                  <Button variant="default" onClick={handleSubmit}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setMode("view");
                      // Reset form data to original if needed
                      if (!isAddMode) setFormData(samplePRData);
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </>
              )}
              
              {/* RBAC-controlled workflow actions */}
              {user && availableActions.length > 0 && (
                <>
                  <div className="w-px h-6 bg-border mx-2 hidden md:block" />
                  <div className="flex items-center gap-2">
                    {PRRBACService.getWorkflowActionButtons(user, formData).map((actionBtn) => {
                      const IconComponent = actionBtn.icon === 'CheckCircle' ? CheckCircle :
                                           actionBtn.icon === 'XCircle' ? XCircleIcon :
                                           actionBtn.icon === 'RotateCcw' ? RotateCcwIcon :
                                           actionBtn.icon === 'Edit' ? Edit :
                                           actionBtn.icon === 'Trash' ? X :
                                           actionBtn.icon === 'Send' ? CheckCircle : CheckCircle;
                      
                      return (
                        <Button 
                          key={actionBtn.action}
                          onClick={() => handleWorkflowAction(actionBtn.action as WorkflowAction)} 
                          variant={actionBtn.variant} 
                          size="sm"
                          className="h-9"
                          title={actionBtn.description}
                        >
                          <IconComponent className="mr-2 h-4 w-4" />
                          {actionBtn.label}
                        </Button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Separator between workflow actions and document actions */}
              <div className="w-px h-6 bg-border mx-2 hidden md:block" />
              
              {/* Document action buttons that are always visible */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-9">
                  <PrinterIcon className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline" size="sm" className="h-9">
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button variant="outline" size="sm" className="h-9">
                  <ShareIcon className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        {/* Main Content */}
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left side - Details */}
            <div className="col-span-8 space-y-6">
              {/* Main Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="refNumber" className="text-xs text-muted-foreground flex items-center gap-1">
                    PR #
                  </Label>
                  <Input
                    id="refNumber"
                    name="refNumber"
                    value={formData.refNumber}
                    onChange={handleInputChange}
                    disabled={mode === "view" || !canEditField("refNumber", user?.context.currentRole.name || "")}
                    className={mode === "view" || !canEditField("refNumber", user?.context.currentRole.name || "") ? "bg-muted" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" /> Date
                  </Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date.toISOString().split("T")[0]}
                    onChange={handleInputChange}
                    disabled={mode === "view" || !canEditField("date", user?.context.currentRole.name || "")}
                    className={mode === "view" || !canEditField("date", user?.context.currentRole.name || "") ? "bg-muted" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-xs text-muted-foreground flex items-center gap-1">
                    <TagIcon className="h-3 w-3" /> PR Type
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value as PRType })
                    }
                    disabled={mode === "view" || !canEditField("type", user?.context.currentRole.name || "")}
                  >
                    <SelectTrigger id="type" className={mode === "view" || !canEditField("type", user?.context.currentRole.name || "") ? "bg-muted" : ""}>
                      <SelectValue placeholder="Select PR Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(PRType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requestor.name" className="text-xs text-muted-foreground flex items-center gap-1">
                    <UserIcon className="h-3 w-3" /> Requestor
                  </Label>
                  <Input
                    id="requestor.name"
                    name="requestor.name"
                    value={formData.requestor.name}
                    onChange={handleInputChange}
                    disabled={mode === "view" || !canEditField("requestor", user?.context.currentRole.name || "")}
                    className={mode === "view" || !canEditField("requestor", user?.context.currentRole.name || "") ? "bg-muted" : ""}
                  />
                </div>
              </div>
              
              {/* Secondary Details */}
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2 col-span-1">
                  <Label htmlFor="department" className="text-xs text-muted-foreground">Department</Label>
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    disabled={mode === "view" || !canEditField("department", user?.context.currentRole.name || "")}
                    className={mode === "view" || !canEditField("department", user?.context.currentRole.name || "") ? "bg-muted" : ""}
                  />
                </div>
                <div className="space-y-2 col-span-3">
                  <Label htmlFor="description" className="text-xs text-muted-foreground">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={mode === "view" || !canEditField("description", user?.context.currentRole.name || "")}
                    className={`min-h-[100px] ${mode === "view" || !canEditField("description", user?.context.currentRole.name || "") ? "bg-muted" : ""}`}
                  />
                </div>
              </div>
            </div>
            
            {/* Right side - Status */}
            <div className="col-span-4">
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium">Status Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current Stage:</span>
                      <Badge variant="outline" className="font-normal">
                        {formData.currentWorkflowStage.split(/(?=[A-Z])/).join(" ")}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Workflow Status:</span>
                      <Badge 
                        variant={formData.workflowStatus === WorkflowStatus.approved ? "default" : formData.workflowStatus === WorkflowStatus.rejected ? "destructive" : "secondary"} 
                        className={`font-normal ${formData.workflowStatus === WorkflowStatus.approved ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900" : ""}`}
                      >
                        {formData.workflowStatus.charAt(0).toUpperCase() + formData.workflowStatus.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Document Status:</span>
                      <StatusBadge status={formData.status} />
                    </div>
                    
                    <Separator className="my-2" />
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Created:</span>
                        <span className="text-sm">{isMounted ? format(formData.date, "dd MMM yyyy") : formData.date.toISOString().split('T')[0]}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Estimated Cost:</span>
                        <span className="text-sm font-medium">{new Intl.NumberFormat('en-US', { style: 'currency', currency: formData.currency }).format(formData.estimatedTotal)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs and Content */}
      <Card className="shadow-sm">
        <Tabs defaultValue="items" className="w-full">
          <CardHeader className="pb-0 pt-4 px-4">
            <TabsList className="w-full grid grid-cols-5">
              {["items", "budgets", "workflow", "attachments", "activity"].map(
                (tab) => (
                  <TabsTrigger 
                    key={tab} 
                    value={tab} 
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </TabsTrigger>
                )
              )}
            </TabsList>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleSubmit}>
              <div className="w-full rounded-b-md border-t overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                <div className="p-6">
                  <TabsContent value="items" className="mt-0">
                    {user && (
                      <ItemsTab 
                        items={samplePRItems}
                        currentUser={user}
                        onOrderUpdate={handleOrderUpdate}
                      />
                    )}
                  </TabsContent>
                  <TabsContent value="budgets" className="mt-0">
                    <ResponsiveBudgetScreen />
                  </TabsContent>
                  <TabsContent value="workflow" className="mt-0">
                    <WorkflowTab />
                  </TabsContent>
                  <TabsContent value="attachments" className="mt-0">
                    <AttachmentsTab />
                  </TabsContent>
                  <TabsContent value="activity" className="mt-0">
                    <ActivityTab />
                  </TabsContent>
                </div>
              </div>
            </form>
          </CardContent>
        </Tabs>
      </Card>
      
      {/* Transaction Summary */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Transaction Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <SummaryTotal prData={formData} />
        </CardContent>
      </Card>
      
      {/* Floating Workflow Actions */}
      {mode !== "add" && mode === "view" && (
        <div className="fixed bottom-6 right-6 flex space-x-3 z-50">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 flex space-x-3">
            {[
              { action: "approve", icon: CheckCircleIcon, variant: "default" },
              { action: "reject", icon: XCircleIcon, variant: "destructive" },
              { action: "sendBack", icon: RotateCcwIcon, variant: "outline" },
            ].map(({ action, icon: Icon, variant }) => (
              <Button
                key={action}
                onClick={() => handleWorkflowAction(action as WorkflowAction)}
                variant={variant as "default" | "destructive" | "outline"}
              >
                <Icon className="mr-2 h-4 w-4" />
                {action.charAt(0).toUpperCase() + action.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getEmptyPurchaseRequest(): PurchaseRequest {
  return {
    id: "",
    refNumber: "",
    date: new Date(),
    type: PRType.GeneralPurchase,
    description: "",
    requestorId: "",
    requestor: {
      name: "",
      id: "",
      department: "",
    },
    status: DocumentStatus.Draft,
    workflowStatus: WorkflowStatus.pending,
    currentWorkflowStage: WorkflowStage.requester,
    location: "",
    department: "",
    jobCode: "",
    estimatedTotal: 0,
    currency:"THB",
    baseCurrencyCode: "THB",
    vendor: "",
    vendorId: 0,
    deliveryDate: new Date(),
    baseSubTotalPrice : 0,
    subTotalPrice: 0,
    baseNetAmount: 0,
    netAmount: 0,
    baseDiscAmount: 0,
    discountAmount: 0,
    baseTaxAmount: 0,
    taxAmount: 0,
    baseTotalAmount: 0,
    totalAmount: 0,
  };
}
