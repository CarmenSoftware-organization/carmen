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
import {
  PurchaseRequest,
  WorkflowAction,
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
import { samplePRData } from "./sampleData";
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (isAddMode) {
      setMode("add");
      setFormData(getEmptyPurchaseRequest());
    }
  }, [isAddMode]);

  const handleModeChange = (newMode: "view" | "edit") => setMode(newMode);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      requestor: name.startsWith("requestor.")
        ? { ...prev.requestor, [name.split(".")[1]]: value }
        : prev.requestor,
    }));
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
                <Button onClick={() => handleModeChange("edit")}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
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
              
              {/* Separator between edit/save buttons and action buttons */}
              <div className="w-px h-6 bg-border mx-2 hidden md:block" />
              
              {/* Action buttons that are always visible */}
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
                    <HashIcon className="h-3 w-3" /> Reference Number
                  </Label>
                  <Input
                    id="refNumber"
                    value={formData.refNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, refNumber: e.target.value })
                    }
                    disabled={mode === "view"}
                    className={mode === "view" ? "bg-muted" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" /> Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date.toISOString().split("T")[0]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        date: new Date(e.target.value),
                      })
                    }
                    disabled={mode === "view"}
                    className={mode === "view" ? "bg-muted" : ""}
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
                    disabled={mode === "view"}
                  >
                    <SelectTrigger id="type" className={mode === "view" ? "bg-muted" : ""}>
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
                    disabled={mode === "view"}
                    className={mode === "view" ? "bg-muted" : ""}
                  />
                </div>
              </div>
              
              {/* Secondary Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-xs text-muted-foreground flex items-center gap-1">
                    <BuildingIcon className="h-3 w-3" /> Department
                  </Label>
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    disabled={mode === "view"}
                    className={mode === "view" ? "bg-muted" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPinIcon className="h-3 w-3" /> Location
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={mode === "view"}
                    className={mode === "view" ? "bg-muted" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobCode" className="text-xs text-muted-foreground flex items-center gap-1">
                    <ClipboardListIcon className="h-3 w-3" /> Job Code
                  </Label>
                  <Input
                    id="jobCode"
                    name="jobCode"
                    value={formData.jobCode}
                    onChange={handleInputChange}
                    disabled={mode === "view"}
                    className={mode === "view" ? "bg-muted" : ""}
                  />
                </div>
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs text-muted-foreground">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  disabled={mode === "view"}
                  className={`min-h-[100px] ${mode === "view" ? "bg-muted" : ""}`}
                />
              </div>
            </div>
            
            {/* Right side - Status */}
            <div className="col-span-4">
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium">Status Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
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
              <ScrollArea className="h-[calc(100vh-600px)] min-h-[300px] w-full rounded-b-md border-t">
                <div className="p-6">
                  <TabsContent value="items" className="mt-0">
                    <ItemsTab />
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
              </ScrollArea>
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
