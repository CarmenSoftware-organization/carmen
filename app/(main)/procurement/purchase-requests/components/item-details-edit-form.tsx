"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar as CalendarIcon,
  X,
  Package,
  TruckIcon,
  Edit,
  XIcon,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/custom-dialog";
import InventoryBreakdown from "./inventory-breakdown";
import { PendingPurchaseOrdersComponent } from "./pending-purchase-orders";
import { PricingFormComponent } from "./pricing-form";
import StatusBadge from "@/components/ui/custom-status-badge";
import { PurchaseRequestItem } from "@/lib/types";

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
  status: "Pending",
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
};

export function ItemDetailsEditForm({
  onSave,
  onCancel,
  onDelete,
  initialData,
  mode,
  onModeChange,
}: ItemDetailsFormProps) {
  const [formData, setFormData] = useState<PurchaseRequestItem>(
    initialData ? { ...emptyItemData, ...initialData } : emptyItemData
  );
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(formData.deliveryDate);
  const [isInventoryBreakdownOpen, setIsInventoryBreakdownOpen] = useState(false);
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

  interface FormFieldProps {
    id: string;
    label: string;
    required?: boolean;
    children?: React.ReactNode;
    smallText?: string;
    baseValue?: string | number;
    readOnly?: boolean;
  }

  const FormField = ({
    id,
    label,
    required = false,
    children,
    smallText,
    baseValue,
    readOnly,
  }: FormFieldProps) => (
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
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onModeChange("edit")}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDelete}
                >
                  <X className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-6 p-2">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField id="name" label="Item Name" required>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    readOnly={mode === "view"}
                  />
                </FormField>
                <FormField id="description" label="Description">
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    readOnly={mode === "view"}
                  />
                </FormField>
              </div>
            </div>

            {/* Inventory Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Inventory Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField id="onHand" label="On Hand">
                  <div className="flex items-center space-x-2">
                    <Input
                      id="onHand"
                      name="onHand"
                      value={formData.inventoryInfo.onHand}
                      readOnly
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setIsInventoryBreakdownOpen(true)}
                    >
                      <Package className="h-4 w-4" />
                    </Button>
                  </div>
                </FormField>
                <FormField id="onOrdered" label="On Order">
                  <div className="flex items-center space-x-2">
                    <Input
                      id="onOrdered"
                      name="onOrdered"
                      value={formData.inventoryInfo.onOrdered}
                      readOnly
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setIsOnOrderOpen(true)}
                    >
                      <TruckIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </FormField>
                <FormField id="unit" label="Unit" required>
                  <Input
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    required
                    readOnly={mode === "view"}
                  />
                </FormField>
              </div>
            </div>

            {/* Quantity and Delivery */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quantity and Delivery</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField id="quantityRequested" label="Quantity Requested" required>
                  <Input
                    type="number"
                    id="quantityRequested"
                    name="quantityRequested"
                    value={formData.quantityRequested}
                    onChange={handleInputChange}
                    required
                    readOnly={mode === "view"}
                  />
                </FormField>
                <FormField id="deliveryDate" label="Delivery Date" required>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !deliveryDate && "text-muted-foreground"
                        )}
                        disabled={mode === "view"}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deliveryDate ? format(deliveryDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={deliveryDate}
                        onSelect={setDeliveryDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormField>
                <FormField id="deliveryPoint" label="Delivery Point" required>
                  <Input
                    id="deliveryPoint"
                    name="deliveryPoint"
                    value={formData.deliveryPoint}
                    onChange={handleInputChange}
                    required
                    readOnly={mode === "view"}
                  />
                </FormField>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pricing Information</h3>
              <PricingFormComponent
                data={formData}
                initialMode={mode}
              />
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <FormField id="comment" label="Comments">
                  <Textarea
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    readOnly={mode === "view"}
                  />
                </FormField>
              </div>
            </div>
          </div>
        </ScrollArea>

        {mode !== "view" && (
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        )}
      </form>

      <InventoryBreakdown
        isOpen={isInventoryBreakdownOpen}
        onClose={() => setIsInventoryBreakdownOpen(false)}
        itemData={{
          name: formData.name,
          description: formData.description,
          status: formData.status,
        }}
        inventoryData={[
          {
            location: "Main Kitchen",
            quantityOnHand: 25,
            units: "KG",
            par: 30,
            reorderPoint: 15,
            minStock: 10,
            maxStock: 50
          },
          {
            location: "Bar Storage",
            quantityOnHand: 10,
            units: "KG",
            par: 15,
            reorderPoint: 8,
            minStock: 5,
            maxStock: 20
          }
        ]}
      />

      <Dialog open={isOnOrderOpen} onOpenChange={setIsOnOrderOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] [&>button]:hidden">
          <DialogHeader>
            <div className="flex justify-between w-full items-center">
              <DialogTitle>Pending Purchase Orders</DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="sm">
                  <XIcon className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
          <PendingPurchaseOrdersComponent />
        </DialogContent>
      </Dialog>
    </div>
  );
}