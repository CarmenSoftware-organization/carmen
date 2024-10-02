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
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import InventoryBreakdown from "./inventory-breakdown";
import VendorComparison from "./vendor-comparison";
import { PendingPurchaseOrdersComponent } from "./pending-purchase-orders";
import { PricingFormComponent } from "./pricing-form";
import StatusBadge from "@/components/ui/custom-status-badge";
import { PurchaseRequestItemStatus, PurchaseRequestItem } from "@/lib/types";

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
  },
  accountCode: "",
  jobCode: "",
  baseSubTotalPrice: 0,
  subTotalPrice: 0,
  baseNetAmount: 0,
  baseDiscAmount: 0,
  baseTaxAmount: 0,
  baseTotalAmount: 0,
};

export function ItemDetailsEditForm({
  onSave,
  onCancel,
  onDelete,
  initialData,
  mode,
  onModeChange,
}: ItemDetailsFormProps) {
  const [formData, setFormData] = useState<PurchaseRequestItem>(initialData ? { ...emptyItemData, ...initialData } : emptyItemData);
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(formData.deliveryDate);
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

  const FormField = ({
    id,
    label,
    required = false,
    children,
    smallText,
    baseValue,
  }: any) => (
    <div>
      <div className="flex items-center space-x-2">
        <Label
          htmlFor={id}
          className={cn(
            "text-xs text-muted-foreground",
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}
        >
          {label}
        </Label>
      </div>
      {mode === "view" ? (
        <div className="mt-1 text-sm">
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
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          {/* Basic Item Information */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <StatusBadge status={formData.status} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <FormField id="location" label="Location" required>
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
              <FormField id="name" label="Name" required>
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
              <div className="sm:col-span-2">
                <FormField id="description" label="Description" required>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    disabled={mode === "view"}
                    className="h-8 text-sm"
                  />
                </FormField>
              </div>
            </div>
          </div>

          <Separator className="my-2" />

          {/* Quantity and Delivery Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Quantity and Delivery
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
              <FormField
                id="unit"
                label="Unit"
                required
                smallText="Base: Kg | 1 Bag = 0.5 Kg"
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
                label="Quantity Requested"
                required
                smallText="5 Kg"
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
                label="Quantity Approved"
                smallText="4.5 Kg"
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
              <FormField id="deliveryDate" label="Delivery Date" required>
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
            {/* Inventory Information Section */}
            <div className="mt-2">
              <div className="bg-muted p-2 rounded-md">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <p className="font-medium">On Hand</p>
                    <p className="text-muted-foreground">
                      {formData.inventoryInfo?.onHand} Kg
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">On Ordered</p>
                    <p className="text-muted-foreground">
                      {formData.inventoryInfo?.onOrdered} Kg
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Reorder Level</p>
                    <p className="text-muted-foreground">
                      {formData.inventoryInfo?.reorderLevel} Kg
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Restock Level</p>
                    <p className="text-muted-foreground">
                      {formData.inventoryInfo?.restockLevel} Kg
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-2" />

          {/* Pricing Section */}
          <PricingFormComponent initialMode={mode} />

          <Separator className="my-2" />

          {/* Vendor and Additional Information Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Vendor and Additional Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <FormField id="vendor" label="Vendor">
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
              <FormField id="pricelistNumber" label="Pricelist Number">
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
              <div className="sm:col-span-2">
                <FormField id="comment" label="Comment">
                  {mode === "view" ? (
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
          </div>

          <Separator className="my-2" />

          {/* Action Buttons */}
          <div>
            <div className="flex flex-wrap justify-end gap-2">
              <Dialog
                open={isInventoryBreakdownOpen}
                onOpenChange={setIsInventoryBreakdownOpen}
              >
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">
                    <Package className="mr-2 h-4 w-4" />
                    On Hand
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[50vw] w-[80vw] overflow-y-auto [&>button]:hidden">
                  <DialogHeader>
                    <div className="flex justify-between w-full items-center">
                      <DialogTitle>On Hand by Location</DialogTitle>
                      <DialogClose asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsInventoryBreakdownOpen(false)}
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </DialogClose>
                    </div>
                  </DialogHeader>
                  <InventoryBreakdown />
                </DialogContent>
              </Dialog>

              <Dialog open={isOnOrderOpen} onOpenChange={setIsOnOrderOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">
                    <TruckIcon className="mr-2 h-4 w-4" />
                    On Order
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[50vw] overflow-y-auto [&>button]:hidden">
                  <DialogHeader>
                    <div className="flex justify-between w-full items-center">
                      <DialogTitle> Pending Purchase Order</DialogTitle>
                      <DialogClose asChild>
                        <Button variant="ghost" size="sm" onClick={() => setIsOnOrderOpen(false)}>
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </DialogClose>
                    </div>
                  </DialogHeader>
                  <PendingPurchaseOrdersComponent />
                </DialogContent>
              </Dialog>
              <Dialog
                open={isVendorComparisonOpen}
                onOpenChange={setIsVendorComparisonOpen}
              >
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">
                    <Package className="mr-2 h-4 w-4" />
                    Vendor Comparison
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[50vw] bg-white p-6  overflow-y-auto [&>button]:hidden">
                  <DialogHeader>
                    <div className="flex justify-between w-full items-center">
                      <DialogTitle>Vendor Comparison</DialogTitle>
                      <DialogClose asChild>
                        <Button variant="ghost" size="sm">
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </DialogClose>
                    </div>
                  </DialogHeader>
                  <VendorComparison />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </form>
      </ScrollArea>
      <div className="flex flex-wrap justify-end gap-2 mt-4">
        {mode === "view" ? (
          <>
            <Button variant="outline" onClick={onCancel}>
              Close
            </Button>
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
    </div>
  );
}