"use client"

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItemsTab } from "./tabs/ItemsTab";
import { ResponsiveBudgetScreen } from "./tabs/budget-tab";
import { WorkflowTab } from "./tabs/WorkflowTab";
import { AttachmentsTab } from "./tabs/AttachmentsTab";
import { ActivityTab } from "./tabs/ActivityTab";
import { samplePRData } from "./sampleData";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import StatusBadge from "@/components/ui/custom-status-badge";
import SummaryTotal from "./SummaryTotal";
import { SaveTemplateDialog } from './save-template-dialog';
import { toast } from "sonner";
import { getTemplateById } from "../data/mock-templates";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  PrinterIcon,
  DownloadIcon,
  BuildingIcon,
  UserIcon,
  ShareIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  RotateCcwIcon,
  CheckCircle,
  X,
  Save,
  BookmarkIcon,
} from "lucide-react";
import {
  PurchaseRequest,
  WorkflowAction,
  PRType,
  DocumentStatus,
  WorkflowStatus,
  WorkflowStage,
  Requestor,
  PRTemplate,
  PurchaseRequestItem
} from "@/lib/types";
import {
  getNextWorkflowStage,
  getPreviousWorkflowStage,
} from "./utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// File: PRDetailPage.tsx

interface PRDetailPageProps {
  mode?: "view" | "edit" | "add";
  id?: string;
}

// Local type that enforces items array is required
interface LocalPurchaseRequest {
  id: string
  refNumber: string
  date: Date
  vendor: string
  vendorId: number
  type: PRType
  deliveryDate: Date
  description: string
  requestorId: string
  requestor: {
    name: string
    id: string
    department: string
  }
  status: DocumentStatus
  workflowStatus: WorkflowStatus
  currentWorkflowStage: WorkflowStage
  location: string
  department: string
  jobCode: string
  estimatedTotal: number
  currency: string
  baseCurrencyCode: string
  baseSubTotalPrice: number
  subTotalPrice: number
  baseNetAmount: number
  netAmount: number
  baseDiscAmount: number
  discountAmount: number
  baseTaxAmount: number
  taxAmount: number
  baseTotalAmount: number
  totalAmount: number
  items: PurchaseRequestItem[] // Required here
}

// Helper function to ensure items array exists
function ensureItems(pr: PurchaseRequest): LocalPurchaseRequest {
  const emptyPR = getEmptyPurchaseRequest()
  return {
    ...emptyPR,
    ...pr,
    items: pr.items || [emptyPR.items[0]], // Use empty item if no items
  }
}

function convertTemplateToLocalPR(template: PRTemplate): LocalPurchaseRequest {
  const emptyPR = getEmptyPurchaseRequest()
  const completeItems = (template.prData.items || []).map((partialItem) => ({
    ...emptyPR.items[0],
    ...partialItem,
  }))

  // Ensure we have at least one item
  const finalItems = completeItems.length > 0 ? completeItems : [emptyPR.items[0]]

  // Start with empty PR to get all required fields
  const result: LocalPurchaseRequest = {
    ...emptyPR,
    // Override with template data if available
    ...(template.prData.vendor ? { vendor: template.prData.vendor } : {}),
    ...(template.prData.vendorId ? { vendorId: template.prData.vendorId } : {}),
    ...(template.prData.description ? { description: template.prData.description } : {}),
    ...(template.prData.location ? { location: template.prData.location } : {}),
    ...(template.prData.department ? { department: template.prData.department } : {}),
    ...(template.prData.jobCode ? { jobCode: template.prData.jobCode } : {}),
    ...(template.prData.currency ? { currency: template.prData.currency } : {}),
    // Ensure required fields
    date: new Date(),
    deliveryDate: new Date(),
    status: DocumentStatus.Draft,
    workflowStatus: WorkflowStatus.pending,
    currentWorkflowStage: WorkflowStage.requester,
    items: finalItems,
  }

  return result
}

export default function PRDetailPage({ mode = "view", id }: PRDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAddMode = searchParams?.get("mode") === "add";

  const [viewMode, setViewMode] = useState<"view" | "edit" | "add">(mode);
  const [formData, setFormData] = useState<LocalPurchaseRequest>(
    isAddMode ? getEmptyPurchaseRequest() : ensureItems(samplePRData)
  );
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<LocalPurchaseRequest>({
    defaultValues: isAddMode ? getEmptyPurchaseRequest() : ensureItems(samplePRData),
  })

  useEffect(() => {
    if (isAddMode) {
      setViewMode("add");
      
      const templateId = searchParams?.get("templateId");
      const fromPRId = searchParams?.get("fromPR");
      
      if (templateId) {
        // Load template data
        loadTemplate(templateId).then((template: PRTemplate) => {
          const completePR = convertTemplateToLocalPR(template)
          form.reset(completePR)
          setFormData(completePR)
        }).catch((error) => {
          toast.error(error.message)
        });
      } else if (fromPRId) {
        // In a real app, you would fetch the PR data from the API
        // For now, we'll just use the sample data
        const completePR = ensureItems(samplePRData)
        form.reset(completePR)
        setFormData(completePR)
      }
    }
  }, [isAddMode, searchParams, form]);

  useEffect(() => {
    form.reset(formData);
  }, [formData, form]);

  const handleModeChange = (newMode: "view" | "edit") => setViewMode(newMode);

  // New function to handle saving without submitting
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In a real app, you would make an API call to save the PR
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log("PR saved:", formData);
      toast.success("Purchase Request saved successfully");
      
      // Don't change mode - stay in edit mode
    } catch (error) {
      console.error("Error saving PR:", error);
      toast.error("Failed to save Purchase Request");
    } finally {
      setIsSaving(false);
    }
  };

  // This function now handles submission and workflow changes
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    if (viewMode === "add") {
      // Here you would typically save the new PR to your backend
      console.log("New PR created:", formData);
      toast.success("Purchase Request created successfully");
      router.push("/procurement/purchase-requests"); // Redirect back to the list
    } else {
      setViewMode("view");
      toast.success("Purchase Request updated and submitted");
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
    
    toast.success(`Purchase Request ${action}ed successfully`);
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

  const handleSaveTemplate = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setIsSaveTemplateModalOpen(false);
      toast.success("Template saved successfully!");
    }, 1000);
  };

  return (
    <div className="container mx-auto py-0">
      <Card className="mb-6 bg-white dark:bg-gray-800">
        <CardHeader className="flex flex-col space-y-4 bg-white dark:bg-gray-800">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              {viewMode === "add"
                ? "Create New Purchase Request"
                : "Purchase Request Details"}
            </h1>
            <div className="flex items-center gap-2">
              {/* Edit/Save/Cancel buttons */}
              {viewMode === "view" ? (
                <Button onClick={() => handleModeChange("edit")}>
                  <PencilIcon className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <>
                  {/* Save button - just saves without changing mode */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="default" 
                          onClick={handleSave}
                          disabled={isSaving}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {isSaving ? "Saving..." : "Save Draft"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Save changes without submitting or changing status</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {/* Submit button - saves and changes mode */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          onClick={handleSubmit}
                          disabled={isSaving}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          {viewMode === "add" ? "Submit" : "Save & Submit"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Save changes and submit for approval</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setViewMode("view");
                      // Reset form data to original if needed
                      if (!isAddMode) {
                        const localPR = ensureItems(samplePRData);
                        setFormData(localPR);
                      }
                    }}
                    disabled={isSaving}
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
              {viewMode !== "add" && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsSaveTemplateModalOpen(true)}
                      >
                        <BookmarkIcon className="mr-2 h-4 w-4" />
                        Save as Template
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Create a reusable template from this PR</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
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
                    disabled={viewMode === "view"}
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
                    disabled={viewMode === "view"}
                  />
                </div>
                <div>
                  <Label htmlFor="type">PR Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value as PRType })
                    }
                    disabled={viewMode === "view"}
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
                    disabled={viewMode === 'view'}
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
                            typeof formData[id as keyof LocalPurchaseRequest] ===
                            "object"
                              ? (
                                  formData[
                                    id as keyof LocalPurchaseRequest
                                  ] as Requestor
                                )[id.split(".")[1] as keyof Requestor]
                              : String(formData[id as keyof LocalPurchaseRequest])
                          }
                          onChange={handleInputChange}
                          disabled={viewMode === "view"}
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
                    disabled={viewMode === "view"}
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
                              formData[key as keyof LocalPurchaseRequest]
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

          {/* <PRForm formData={formData} setFormData={setFormData} isDisabled={viewMode === 'view'} /> */}
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
                  <ItemsTab
                    items={formData.items}
                    mode={viewMode === "add" ? "edit" : viewMode}
                    onAddItem={() => {/* Add item handler */}}
                    onEditItem={(item) => {/* Edit item handler */}}
                    onDeleteItem={(item) => {/* Delete item handler */}}
                  />
                </TabsContent>
                <TabsContent value="budgets">
                  <ResponsiveBudgetScreen purchaseRequest={formData} />
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
              {/* {(viewMode === "edit" || viewMode === "add") && (
                // <Button type="submit" className="mt-6">
                //   {viewMode === "add" ? "Create Purchase Request" : "Update"}
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
        {viewMode !== "add" && (
          <CardFooter className="flex justify-end space-x-2">
            {viewMode === "view" && [
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
            {viewMode === "edit" && (
              <div className="flex space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleSave}
                        variant="default"
                        size="sm"
                        disabled={isSaving}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? "Saving..." : "Save Draft"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Save changes without submitting or changing status</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </CardFooter>
        )}
      </Card>
      {/* Save as Template Dialog */}
      {isSaveTemplateModalOpen && (
        <SaveTemplateDialog
          isOpen={isSaveTemplateModalOpen}
          onClose={() => setIsSaveTemplateModalOpen(false)}
          onSave={handleSaveTemplate}
          purchaseRequest={formData}
        />
      )}
    </div>
  );
}
function getEmptyPurchaseRequest(): LocalPurchaseRequest {
  const emptyItem: PurchaseRequestItem = {
    id: "",
    status: "Pending",
    location: "",
    name: "",
    description: "",
    unit: "",
    quantityRequested: 0,
    quantityApproved: 0,
    deliveryDate: new Date(),
    deliveryPoint: "",
    currency: "THB",
    currencyRate: 1,
    price: 0,
    foc: 0,
    netAmount: 0,
    adjustments: {
      discount: false,
      tax: false,
    },
    taxIncluded: false,
    discountRate: 0,
    discountAmount: 0,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 0,
    vendor: "",
    pricelistNumber: "",
    comment: "",
    createdBy: "",
    createdDate: new Date(),
    updatedBy: "",
    updatedDate: new Date(),
    itemCategory: "",
    itemSubcategory: "",
    inventoryInfo: {
      onHand: 0,
      onOrdered: 0,
      reorderLevel: 0,
      restockLevel: 0,
      averageMonthlyUsage: 0,
      lastPrice: 0,
      lastOrderDate: new Date(),
      lastVendor: "",
      inventoryUnit: "",
    },
    accountCode: "",
    jobCode: "",
    baseSubTotalPrice: 0,
    subTotalPrice: 0,
    baseNetAmount: 0,
    baseDiscAmount: 0,
    baseTaxAmount: 0,
    baseTotalAmount: 0,
  }

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
    currency: "THB",
    baseCurrencyCode: "THB",
    vendor: "",
    vendorId: 0,
    deliveryDate: new Date(),
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
    items: [emptyItem], // Initialize with an empty item
  };
}

const loadTemplate = (templateId: string): Promise<PRTemplate> => {
  return new Promise((resolve, reject) => {
    const template = getTemplateById(templateId)
    if (!template) {
      reject(new Error(`Template with ID ${templateId} not found`))
      return
    }
    resolve(template)
  })
}
