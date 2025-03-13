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
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  RotateCcwIcon,
  CheckCircle,
  X,
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

  useEffect(() => {
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
    <div className="container mx-auto py-0">
      <Card className="mb-6 bg-white dark:bg-gray-800">
        <CardHeader className="flex flex-col space-y-4 bg-white dark:bg-gray-800">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              {mode === "add"
                ? "Create New Purchase Request"
                : "Purchase Request Details"}
            </h1>
            <div className="flex items-center gap-2">
              {/* Edit/Save/Cancel buttons */}
              {mode === "view" ? (
                <Button onClick={() => handleModeChange("edit")}>
                  <PencilIcon className="mr-2 h-4 w-4" />
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
              <div className="w-px h-6 bg-border mx-2" />
              
              {/* Action buttons that are always visible */}
              <Button variant="outline" size="sm">
                <PrinterIcon className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <DownloadIcon className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <ShareIcon className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="refNumber">Reference Number</Label>
                  <Input
                    id="refNumber"
                    value={formData.refNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, refNumber: e.target.value })
                    }
                    disabled={mode === "view"}
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
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
                  />
                </div>
                <div>
                  <Label htmlFor="type">PR Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value as PRType })
                    }
                    disabled={mode === "view"}
                  >
                    <SelectTrigger id="type">
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
                {/* <div>
                  <Label htmlFor="estimatedTotal">Estimated Cost</Label>
                  <Input
                    id="estimatedTotal"
                    type="number"
                    value={formData.estimatedTotal}
                    onChange={(e) => setFormData({...formData, estimatedTotal: parseFloat(e.target.value)})}
                    disabled={mode === 'view'}
                  />
                </div> */}
                <div className="col-span-2">
                  <div className="grid grid-cols-2 w-full">
                    {[
                      {
                        id: "requestor.name",
                        label: "Requestor",
                        icon: UserIcon,
                      },
                      {
                        id: "department",
                        label: "Department",
                        icon: BuildingIcon,
                      },
                    ].map(({ id, label, icon: Icon }) => (
                      <div key={id} className="space-y-1">
                        <Label
                          htmlFor={id}
                          className="text-[0.7rem] text-gray-500 flex items-center gap-2"
                        >
                          <Icon className="h-3 w-3" /> {label}
                        </Label>
                        <Input
                          id={id}
                          name={id}
                          value={
                            typeof formData[id as keyof PurchaseRequest] ===
                            "object"
                              ? (
                                  formData[
                                    id as keyof PurchaseRequest
                                  ] as Requestor
                                )[id.split(".")[1] as keyof Requestor]
                              : String(formData[id as keyof PurchaseRequest])
                          }
                          onChange={handleInputChange}
                          disabled={mode === "view"}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 md:col-span-3">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    disabled={mode === "view"}
                  />
                </div>

                <div className="col-span-2 bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    {["currentWorkflowStage", "workflowStatus", "status"].map(
                      (key) => (
                        <div key={key} className="space-y-2 text-center">
                          <label className="text-sm font-medium block">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </label>
                          <StatusBadge
                            status={String(
                              formData[key as keyof PurchaseRequest]
                            )}
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* <PRForm formData={formData} setFormData={setFormData} isDisabled={mode === 'view'} /> */}
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs defaultValue="items" className="w-full bg-white dark:bg-gray-800">
            <TabsList className="grid w-full grid-cols-5">
              {["items", "budgets", "workflow", "attachments", "activity"].map(
                (tab) => (
                  <TabsTrigger key={tab} value={tab} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </TabsTrigger>
                )
              )}
            </TabsList>
            <form onSubmit={handleSubmit}>
              <ScrollArea className="h-[400px] w-full rounded-md border">
                <TabsContent value="items">
                  <ItemsTab />
                </TabsContent>
                <TabsContent value="budgets">
                  <ResponsiveBudgetScreen />
                </TabsContent>
                <TabsContent value="workflow">
                  <WorkflowTab />
                </TabsContent>
                <TabsContent value="attachments">
                  <AttachmentsTab />
                </TabsContent>
                <TabsContent value="activity">
                  <ActivityTab />
                </TabsContent>
              </ScrollArea>
              {/* {(mode === "edit" || mode === "add") && (
                // <Button type="submit" className="mt-6">
                //   {mode === "add" ? "Create Purchase Request" : "Update"}
                // </Button>
              )} */}
            </form>
          </Tabs>
          
            {/* Add SummaryTotal component here */}
          <Card className="mt-6 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Transaction Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <SummaryTotal prData={formData} />
            </CardContent>
          </Card>

        </CardContent>
        {mode !== "add" && (
          <CardFooter className="flex justify-end space-x-2">
            {mode === "view" && [
              { action: "approve", icon: CheckCircleIcon, color: "green" },
              { action: "reject", icon: XCircleIcon, color: "white" },
              { action: "sendBack", icon: RotateCcwIcon, color: "white" },
            ].map(({ action, icon: Icon, color }) => (
              <Button
                key={action}
                onClick={() => handleWorkflowAction(action as WorkflowAction)}
                variant={color === "green" ? "default" : "outline"}
                size="sm"
                className={`${
                  color === "white"
                    ? "bg-white hover:bg-gray-200 text-black"
                    : color === "orange"
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : ""
                }`}
              >
                <Icon className="mr-2 h-4 w-4" />
                {action.charAt(0).toUpperCase() + action.slice(1)}
              </Button>
            ))}
          </CardFooter>
        )}
      </Card>
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
