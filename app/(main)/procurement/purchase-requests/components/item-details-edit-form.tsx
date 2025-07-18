"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, parse } from "date-fns";
import {
  Calendar as CalendarIcon,
  X,
  Package,
  TruckIcon,
  Edit,
  XIcon,
  CheckCircle,
  XCircle,
  RotateCcw,
  Building2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/custom-dialog";
import InventoryBreakdown from "./inventory-breakdown";
import VendorComparison from "./vendor-comparison";
import { PendingPurchaseOrdersComponent } from "./pending-purchase-orders";
import { PricingFormComponent } from "./pricing-form";
import StatusBadge from "@/components/ui/custom-status-badge";
import { PurchaseRequestItemStatus, PurchaseRequestItem, ConsolidatedButtonState } from "@/lib/types";
import { useUser } from "@/lib/context/user-context";

// Role-based field permissions based on the user matrix
const getFieldPermissions = (userRole: string) => {
  const permissions = {
    // Fields that are editable based on role
    location: userRole === 'Requestor',
    product: userRole === 'Requestor', 
    comment: ['Requestor', 'Department Manager', 'Purchasing Staff'].includes(userRole),
    requestQty: userRole === 'Requestor',
    requestUnit: userRole === 'Requestor', 
    requiredDate: userRole === 'Requestor',
    approvedQty: ['Department Manager', 'Purchasing Staff'].includes(userRole),
    vendor: userRole === 'Purchasing Staff',
    pricelist: userRole === 'Purchasing Staff',
    price: userRole === 'Purchasing Staff',
    orderUnit: false, // Read-only for all roles based on matrix
  };
  
  return permissions;
};

// Helper function to get approval button state for individual item
const getItemApprovalButtonState = (status: PurchaseRequestItemStatus, userRole: string): ConsolidatedButtonState => {
  const isApprover = ['Department Manager', 'Financial Manager', 'Purchasing Staff'].includes(userRole);
  
  if (!isApprover) {
    return {
      action: "disabled",
      label: "No Approval Permission",
      color: "gray",
      disabled: true
    };
  }

  switch (status) {
    case "Pending":
      return {
        action: "approve",
        label: "Approve",
        color: "green",
        disabled: false
      };
    case "Approved":
      return {
        action: "reject", 
        label: "Reject",
        color: "red",
        disabled: false
      };
    case "Rejected":
      return {
        action: "approve",
        label: "Approve", 
        color: "green",
        disabled: false
      };
    case "Review":
      return {
        action: "return",
        label: "Return",
        color: "orange", 
        disabled: false,
        requiresStepSelection: true
      };
    default:
      return {
        action: "disabled",
        label: "Unknown Status",
        color: "gray",
        disabled: true
      };
  }
};

type ItemDetailsFormProps = {
  onSave: (formData: PurchaseRequestItem) => void;
  onCancel: () => void;
  onDelete?: () => void;
  initialData?: Partial<PurchaseRequestItem>;
  mode: "view" | "edit" | "add";
  onModeChange: (mode: "view" | "edit" | "add") => void;
};

const emptyItemData: PurchaseRequestItem = {
  id: "",
  status: "Pending" ,
  location: "",
  name: "",
  description: "",
  unit: "",
  quantityRequested: 0,
  quantityApproved: 0,
  deliveryDate: new Date(),
  deliveryPoint: "",
  currency: "",
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
  // Business Dimensions
  event: "",
  project: "",
  marketSegment: "",
};

export function ItemDetailsEditForm({
  onSave,
  onCancel,
  onDelete,
  initialData,
  mode,
  onModeChange,
}: ItemDetailsFormProps) {
  const { user } = useUser();
  const userRole = user?.role || 'Requestor';
  const fieldPermissions = getFieldPermissions(userRole);
  
  
  const [formData, setFormData] = useState<PurchaseRequestItem>(initialData ? { ...emptyItemData, ...initialData } : emptyItemData);
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(formData.deliveryDate);
  const [isReturnStepSelectorOpen, setIsReturnStepSelectorOpen] = useState(false);

  // Update form data when initialData changes (e.g., when switching between items)
  useEffect(() => {
    if (initialData) {
      const mergedData = { ...emptyItemData, ...initialData };
      setFormData(mergedData);
      setDeliveryDate(initialData.deliveryDate);
    } else {
      setFormData(emptyItemData);
      setDeliveryDate(emptyItemData.deliveryDate);
    }
  }, [initialData]);
  const [isInventoryBreakdownOpen, setIsInventoryBreakdownOpen] = useState(false);
  const [isVendorComparisonOpen, setIsVendorComparisonOpen] = useState(false);
  const [isOnOrderOpen, setIsOnOrderOpen] = useState(false);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(formData);
    onModeChange("view");
  };

  // Approval action handlers
  const handleApprovalAction = () => {
    const buttonState = getItemApprovalButtonState(formData.status, userRole);
    
    switch (buttonState.action) {
      case "approve":
        handleApproveItem();
        break;
      case "reject":
        handleRejectItem();
        break;
      case "return":
        setIsReturnStepSelectorOpen(true);
        break;
    }
  };

  const handleApproveItem = () => {
    const updatedData = { ...formData, status: "Approved" as PurchaseRequestItemStatus };
    setFormData(updatedData);
    onSave(updatedData);
    console.log(`✓ Approving item: ${formData.name} (${formData.id})`);
    console.log(`🎉 Successfully approved item: ${formData.name}`);
  };

  const handleRejectItem = () => {
    const updatedData = { ...formData, status: "Rejected" as PurchaseRequestItemStatus };
    setFormData(updatedData);
    onSave(updatedData);
    console.log(`✓ Rejecting item: ${formData.name} (${formData.id})`);
    console.log(`🎉 Successfully rejected item: ${formData.name}`);
  };

  const handleReturnItem = () => {
    const updatedData = { ...formData, status: "Review" as PurchaseRequestItemStatus };
    setFormData(updatedData);
    onSave(updatedData);
    setIsReturnStepSelectorOpen(false);
    console.log(`✓ Returning item for review: ${formData.name} (${formData.id})`);
    console.log(`🎉 Successfully returned item for review: ${formData.name}`);
  };

  const FormField = ({
    id,
    label,
    required = false,
    children,
    smallText,
    baseValue,
    fieldPermission = true,
  }: any) => {
    const isReadOnlyByRole = mode === "edit" && !fieldPermission;
    const isViewMode = mode === "view" || isReadOnlyByRole;
    
    return (
      <div>
        <div className="flex items-center space-x-2">
          <Label
            htmlFor={id}
            className={cn(
              "text-xs text-muted-foreground",
              required && "after:content-['*'] after:ml-0.5 after:text-red-500",
              isReadOnlyByRole && "opacity-60"
            )}
          >
            {label}
            {isReadOnlyByRole && (
              <span className="ml-1 text-xs text-amber-600 font-medium">(Read-only)</span>
            )}
          </Label>
        </div>
        {isViewMode ? (
          <div className={cn(
            "mt-1 text-sm",
            isReadOnlyByRole && "bg-muted/30 p-2 rounded border opacity-75"
          )}>
            {(() => {
              const value = formData[id as keyof PurchaseRequestItem];
              if (value instanceof Date) {
                return value.toLocaleDateString();
              } else if (value === null || value === undefined) {
                return "N/A";
              } else {
                return String(value);
              }
            })()}
          </div>
        ) : (
          children
        )}
        {smallText && (
          <div className="text-xs text-muted-foreground mt-1">{smallText}</div>
        )}
        {baseValue && (
          <div className="text-xs text-muted-foreground mt-1">
          Base: {baseValue}
        </div>
      )}
    </div>
  );
  };

  return (
    <div className="w-full max-w-full mx-auto p-6">
      <div className="flex flex-row items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold">
          {mode === "add" ? "Add New Item" : "Item Details"}
        </h2>
        <div className="flex items-center gap-2">
          {mode === "view" && (
            <Button variant="outline" onClick={() => onModeChange("edit")}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          <div className="flex flex-wrap justify-end gap-2 mt-4">
        {mode === "view" ? (
          <>
            {/* <Button variant="outline" onClick={onCancel}>
              Close
            </Button> */}
          </>
        ) : (
          <>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" form="itemForm">
              Save
            </Button>
          </>
        )}
      </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Approval Section */}
      {mode === "view" && (() => {
        const buttonState = getItemApprovalButtonState(formData.status, userRole);
        const isApprover = ['Department Manager', 'Financial Manager', 'Purchasing Staff'].includes(userRole);
        
        if (!isApprover) return null;
        
        return (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900">Item Approval</h4>
                <p className="text-sm text-blue-700">Current status: {formData.status}</p>
              </div>
              <Button
                onClick={handleApprovalAction}
                disabled={buttonState.disabled}
                className={cn(
                  "font-medium",
                  buttonState.color === "green" && "bg-green-600 hover:bg-green-700 text-white",
                  buttonState.color === "red" && "bg-red-600 hover:bg-red-700 text-white",
                  buttonState.color === "orange" && "bg-orange-600 hover:bg-orange-700 text-white",
                  buttonState.color === "gray" && "bg-gray-400 cursor-not-allowed text-white"
                )}
              >
                {buttonState.action === "approve" && <CheckCircle className="mr-2 h-4 w-4" />}
                {buttonState.action === "reject" && <XCircle className="mr-2 h-4 w-4" />}
                {buttonState.action === "return" && <RotateCcw className="mr-2 h-4 w-4" />}
                {buttonState.label}
              </Button>
            </div>
          </div>
        );
      })()}

      <ScrollArea className="max-h-[80vh] overflow-y-auto">
        <form id="itemForm" onSubmit={handleSubmit} className="space-y-4 p-4">
          {/* Basic Item Information */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <StatusBadge status={formData.status} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
              <FormField id="location" label="Location" required fieldPermission={fieldPermissions.location}>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  disabled={mode === "view"}
                  className="h-8 text-sm"
                />
              </FormField>
              <div className="sm:col-span-2">
              <FormField id="name" label="Product name" required fieldPermission={fieldPermissions.product}>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={mode === "view"}
                  className="h-8 text-sm"
                />
              </FormField>
              </div>
              <div className="sm:col-span-3">
                <FormField id="description" label="Description" readOnly>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    readOnly={true}
                    className="h-8 text-sm"
                  />
                </FormField>
              </div>
              <div className="sm:col-span-1">
                <FormField id="jobcode" label="Job code">
                  <Input
                      id="jobcode"
                    name="jobcode"
                    value={formData.jobCode}
                    onChange={handleInputChange}
                    required
                    disabled={mode === "view"}
                    className="h-8 text-sm"
                  />
                </FormField>
              </div>
            </div>
            
            {/* Quantity Fields Row */}
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 mt-2">
              <FormField
                id="unit"
                label="Request Unit"
                required
                smallText="Base: Kg | 1 Bag = 0.5 Kg"
                fieldPermission={fieldPermissions.requestUnit}
              >
                <Input
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  required
                  disabled={mode === "view"}
                  className="h-8 text-sm"
                />
              </FormField>
              <FormField
                id="quantityRequested"
                label="Request Qty"
                required
                smallText="5 Kg"
                fieldPermission={fieldPermissions.requestQty}
              >
                <Input
                  id="quantityRequested"
                  name="quantityRequested"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.quantityRequested}
                  onChange={handleInputChange}
                  required
                  disabled={mode === "view"}
                  className="h-8 text-sm"
                />
              </FormField>
              <FormField
                id="quantityApproved"
                label="Approved Qty"
                smallText="4.5 Kg"
                fieldPermission={fieldPermissions.approvedQty}
              >
                <Input
                  id="quantityApproved"
                  name="quantityApproved"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.quantityApproved}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                  className="h-8 text-sm"
                />
              </FormField>
              <FormField id="foc" label="FOC Qty" baseValue="0">
                <Input
                  id="foc"
                  name="foc"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.foc}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                  className="h-8 text-sm"
                />
              </FormField>
              <FormField id="deliveryDate" label="Required Date" required fieldPermission={fieldPermissions.requiredDate}>
                {mode === "view" ? (
                  <div>
                    {deliveryDate ? format(deliveryDate, "PPP") : "Not set"}
                  </div>
                ) : (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal h-8 text-sm",
                          !deliveryDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deliveryDate ? (
                          format(deliveryDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={deliveryDate}
                        onSelect={(date) => {
                          setDeliveryDate(date);
                          setFormData((prevData) => ({
                            ...prevData,
                            deliveryDate: date ? date : new Date(),
                          }));
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </FormField>
              <FormField id="deliveryPoint" label="Delivery Point">
                <Input
                  id="deliveryPoint"
                  name="deliveryPoint"
                  value={formData.deliveryPoint}
                  onChange={handleInputChange}
                  disabled={mode === "view"}
                  className="h-8 text-sm"
                />
              </FormField>
            </div>

            <div className="w-full">
                <FormField id="comment" label="Comment" fieldPermission={fieldPermissions.comment}>
                  {mode === "view" || !fieldPermissions.comment ? (
                    <div className="mt-1 text-sm">{formData.comment}</div>
                  ) : (
                    <Textarea
                      id="comment"
                      name="comment"
                      value={formData.comment}
                      onChange={handleInputChange}
                      placeholder="Add any additional notes here"
                      className="text-sm h-8"
                    />
                  )}
                </FormField>
              </div>
          </div>

          {/* Only show vendor section to non-Requestor roles */}
          {userRole !== 'Requestor' && (
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Vendor and Additional Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <FormField id="vendor" label="Vendor" fieldPermission={fieldPermissions.vendor}>
                  <Input
                    id="vendor"
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleInputChange}
                    placeholder="Vendor name"
                    disabled={mode === "view"}
                    className="h-8 text-sm"
                  />
                </FormField>
                <FormField id="pricelistNumber" label="Pricelist Number" fieldPermission={fieldPermissions.pricelist}>
                  <Input
                    id="pricelistNumber"
                    name="pricelistNumber"
                    value={formData.pricelistNumber}
                    onChange={handleInputChange}
                    placeholder="Pricelist #"
                    disabled={mode === "view"}
                    className="h-8 text-sm"
                  />
                </FormField>
                
              </div>
            </div>
          )}
          <Separator className="my-2" />

          {/* Pricing Section */}
          <div>
            <PricingFormComponent 
              initialMode={mode} 
              data={formData}
              pricePermission={fieldPermissions.price}
            />
          </div>

          <Separator className="my-2" />

          {/* Business Dimensions Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-purple-600" />
              <h3 className="text-lg font-semibold">Business Dimensions</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField id="jobCode" label="Job Number" fieldPermission={true}>
                {mode === "view" ? (
                  <div className="mt-1 text-sm">{formData.jobCode || "Not assigned"}</div>
                ) : (
                  <Select 
                    value={formData.jobCode || ""} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, jobCode: value }))}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select job number" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JOB001">JOB001 - Office Renovation</SelectItem>
                      <SelectItem value="JOB002">JOB002 - Kitchen Upgrade</SelectItem>
                      <SelectItem value="JOB003">JOB003 - IT Infrastructure</SelectItem>
                      <SelectItem value="FB-2023-001">FB-2023-001 - Food & Beverage</SelectItem>
                      <SelectItem value="HK-2023-001">HK-2023-001 - Housekeeping</SelectItem>
                      <SelectItem value="MAINT-2023-001">MAINT-2023-001 - Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </FormField>

              <FormField id="event" label="Event" fieldPermission={true}>
                {mode === "view" ? (
                  <div className="mt-1 text-sm">{formData.event || "Not assigned"}</div>
                ) : (
                  <Select 
                    value={formData.event || ""} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, event: value }))}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONF2024">Annual Conference 2024</SelectItem>
                      <SelectItem value="LAUNCH">Product Launch Event</SelectItem>
                      <SelectItem value="WORKSHOP">Training Workshop</SelectItem>
                      <SelectItem value="MEETING">Board Meeting</SelectItem>
                      <SelectItem value="CELEBRATION">Company Celebration</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </FormField>

              <FormField id="project" label="Project" fieldPermission={true}>
                {mode === "view" ? (
                  <div className="mt-1 text-sm">{formData.project || "Not assigned"}</div>
                ) : (
                  <Select 
                    value={formData.project || ""} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, project: value }))}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PROJ001">Digital Transformation</SelectItem>
                      <SelectItem value="PROJ002">Sustainability Initiative</SelectItem>
                      <SelectItem value="PROJ003">Market Expansion</SelectItem>
                      <SelectItem value="PROJ004">Infrastructure Upgrade</SelectItem>
                      <SelectItem value="PROJ005">Process Optimization</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </FormField>

              <FormField id="marketSegment" label="Market Segment" fieldPermission={true}>
                {mode === "view" ? (
                  <div className="mt-1 text-sm">{formData.marketSegment || "Not assigned"}</div>
                ) : (
                  <Select 
                    value={formData.marketSegment || ""} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, marketSegment: value }))}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select market segment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RETAIL">Retail</SelectItem>
                      <SelectItem value="WHOLESALE">Wholesale</SelectItem>
                      <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                      <SelectItem value="GOVERNMENT">Government</SelectItem>
                      <SelectItem value="HOSPITALITY">Hospitality</SelectItem>
                      <SelectItem value="HEALTHCARE">Healthcare</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </FormField>
            </div>
          </div>

          <Separator className="my-2" />

        </form>
      </ScrollArea>

      {/* Return Step Selector Modal */}
      <Dialog open={isReturnStepSelectorOpen} onOpenChange={setIsReturnStepSelectorOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Return Step</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Choose where to return this item:
            </div>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start p-4 h-auto"
                onClick={handleReturnItem}
              >
                <div className="text-left">
                  <div className="font-medium">Return for Review</div>
                  <div className="text-xs text-gray-500 mt-1">Send back for further review</div>
                </div>
              </Button>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsReturnStepSelectorOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
    </div>
  );
}