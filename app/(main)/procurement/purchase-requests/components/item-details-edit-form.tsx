"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format, parse } from "date-fns";
import {
  Calendar as CalendarIcon,
  X,
  HelpCircle,
  Upload,
  Users,
  BarChart2,
  Package,
  TruckIcon,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import InventoryBreakdown from "./inventory-breakdown";
import VendorComparison from "./vendor-comparison";
import { PendingPurchaseOrdersComponent } from "./pending-purchase-orders";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ItemDetailsFormProps = {
  onSave: (formData: FormData) => void;
  onCancel: () => void;
  onDelete?: () => void;
  initialData?: any;
  mode: "view" | "edit" | "add";
  onModeChange: (mode: "view" | "edit" | "add") => void;
};

const emptyItemData = {
  location: "",
  name: "",
  description: "",
  unit: "",
  quantityRequested: 0,
  quantityApproved: 0,
  deliveryDate: "",
  deliveryPoint: "",
  currency: "",
  currencyRate: 1,
  price: 0,
  foc: 0,
  netAmount: 0,
  adjustment: false,
  discountRate: 0,
  discountAmount: 0,
  taxRate: 0,
  taxAmount: 0,
  totalAmount: 0,
  vendor: "",
  pricelistNumber: "",
  comment: "",
  createdBy: "",
  createdDate: "",
  lastModifiedBy: "",
  lastModifiedDate: "",
  itemCategory: "",
  itemSubcategory: "",
  inventoryInfo: {
    onHand: 0,
    onOrdered: 0,
    reorderLevel: 0,
    restockLevel: 0,
    averageMonthlyUsage: 0,
    lastPrice: 0,
    lastOrderDate: "",
    lastVendor: "",
  },
};

type FormDataType = typeof emptyItemData;

// Add this mock data near the top of the file, after the imports and before the component definition

const mockItemData: FormDataType = {
  location: "Main Warehouse",
  name: "Organic Quinoa",
  description: "Premium organic white quinoa grains",
  unit: "Kg",
  quantityRequested: 500,
  quantityApproved: 450,
  deliveryDate: "2023-07-15",
  deliveryPoint: "Kitchen Storage",
  currency: "USD",
  currencyRate: 1,
  price: 3.99,
  foc: 10,
  netAmount: 1795.5,
  adjustment: false,
  discountRate: 5,
  discountAmount: 89.78,
  taxRate: 7,
  taxAmount: 119.4,
  totalAmount: 1825.12,
  vendor: "Healthy Grains Co.",
  pricelistNumber: "PL-2023-056",
  comment: "Bulk order for summer menu",
  createdBy: "John Doe",
  createdDate: "2023-06-01",
  lastModifiedBy: "Jane Smith",
  lastModifiedDate: "2023-06-05",
  itemCategory: "Grains",
  itemSubcategory: "Quinoa",
  inventoryInfo: {
    onHand: 100,
    onOrdered: 200,
    reorderLevel: 50,
    restockLevel: 300,
    averageMonthlyUsage: 400,
    lastPrice: 3.85,
    lastOrderDate: "2023-05-15",
    lastVendor: "Organic Supplies Inc.",
  },
};

export function ItemDetailsEditForm({
  onSave,
  onCancel,
  onDelete,
  initialData,
  mode,
  onModeChange,
}: ItemDetailsFormProps) {
  const router = useRouter();
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(
    mockItemData.deliveryDate
      ? parse(mockItemData.deliveryDate, "yyyy-MM-dd", new Date())
      : undefined
  );
  const [formData, setFormData] = useState<FormDataType>(mockItemData);
  const [isInventoryBreakdownOpen, setIsInventoryBreakdownOpen] =
    useState(false);
  const [isVendorComparisonOpen, setIsVendorComparisonOpen] = useState(false);
  const [isOnOrderOpen, setIsOnOrderOpen] = useState(false);

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    setFormData((prevData: FormDataType) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formDataToSubmit = new FormData(event.currentTarget);
    if (deliveryDate) {
      formDataToSubmit.set("deliveryDate", format(deliveryDate, "yyyy-MM-dd"));
    }
    onSave(formDataToSubmit);
    onModeChange("view");
  };

  const handleVendorComparison = () => {
    router.push("/procurement/vendor-comparison");
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
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}
        >
          {label}
        </Label>
      </div>
      {mode === "view" ? (
        <div className="mt-1 text-sm">
          {typeof formData[id as keyof typeof formData] === "object"
            ? JSON.stringify(formData[id as keyof typeof formData])
            : (formData[id as keyof typeof formData] as
                | string
                | number
                | null) ?? "N/A"}
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
    <Card className="w-full max-w-full mx-auto border-none shadow-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl sm:text-2xl font-bold">
          {mode === "add" ? "Add New Item" : "Item Details"}
        </CardTitle>
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
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <ScrollArea className="h-auto px-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Item Information */}
            <Card className="px-4 py-2">
              <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <FormField id="location" label="Location" required>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    disabled={mode === "view"}
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
                    />
                  </FormField>
                </div>
              </div>
            </Card>

            {/* Tab Section */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsContent value="details">
                {/* Quantity and Delivery Section */}
                <Card className="px-4 py-2">
              <h3 className="text-lg font-semibold mb-2">
                Quantity and Delivery
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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
                            "w-full justify-start text-left font-normal",
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
                            setFormData((prevData: FormDataType) => ({
                              ...prevData,
                              deliveryDate: date
                                ? format(date, "yyyy-MM-dd")
                                : "",
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
                  />
                </FormField>
              </div>
              {/* Inventory Information Section */}
              <div>
                <div className="bg-muted p-3 rounded-md">
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
            </Card>

            {/* Pricing Section */}
            <Card className="px-4 py-2">
              <h3 className="text-lg font-semibold mb-2">Pricing</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <FormField
                  id="currency"
                  label="Currency"
                  required
                  baseValue="USD"
                >
                  <Select
                    name="currency"
                    value={formData.currency}
                    onValueChange={(value) =>
                      setFormData((prevData: FormDataType) => ({
                        ...prevData,
                        currency: value,
                      }))
                    }
                    disabled={mode === "view"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="THB">THB</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField id="currencyRate" label="Rate" baseValue="1.000000">
                  <Input
                    id="currencyRate"
                    name="currencyRate"
                    type="number"
                    step="0.000001"
                    value={formData.currencyRate}
                    onChange={handleInputChange}
                    disabled={mode === "view"}
                  />
                </FormField>
                <FormField id="price" label="Price" required baseValue="$5.99">
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    disabled={mode === "view"}
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
                  />
                </FormField>
                <div className="col-span-1">
                  <FormField
                    id="netAmount"
                    label="Net Amount"
                    baseValue="$59.90"
                  >
                    <Input
                      id="netAmount"
                      name="netAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.netAmount}
                      onChange={handleInputChange}
                      readOnly
                      disabled={mode === "view"}
                    />
                  </FormField>
                </div>
                <div className="col-start-1 grid grid-cols-2 gap-3">
                  <FormField id="adjustment" label="Adjustment">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="adjustment"
                        name="adjustment"
                        checked={formData.adjustment}
                        onCheckedChange={(checked) =>
                          setFormData((prevData: FormDataType) => ({
                            ...prevData,
                            adjustment: checked as boolean,
                          }))
                        }
                        disabled={mode === "view"}
                      />
                    </div>
                  </FormField>

                  <FormField id="discountRate" label="Disc Rate">
                    <Input
                      id="discountRate"
                      name="discountRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.discountRate}
                      onChange={handleInputChange}
                      disabled={mode === "view"}
                    />
                  </FormField>
                </div>
                <FormField
                  id="discountAmount"
                  label="Discount Amount"
                  baseValue="$0.00"
                >
                  <Input
                    id="discountAmount"
                    name="discountAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discountAmount}
                    onChange={handleInputChange}
                    disabled={mode === "view"}
                  />
                </FormField>
                <FormField id="taxRate" label="Tax Rate">
                  <Input
                    id="taxRate"
                    name="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.taxRate}
                    onChange={handleInputChange}
                    disabled={mode === "view"}
                  />
                </FormField>
                <FormField id="taxAmount" label="Tax Amount" baseValue="$4.19">
                  <Input
                    id="taxAmount"
                    name="taxAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.taxAmount}
                    onChange={handleInputChange}
                    disabled={mode === "view"}
                  />
                </FormField>
                <div className="col-span-1">
                  <FormField
                    id="totalAmount"
                    label="Total Amount"
                    baseValue="$64.09"
                  >
                    <Input
                      id="totalAmount"
                      name="totalAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.totalAmount}
                      onChange={handleInputChange}
                      readOnly
                      disabled={mode === "view"}
                    />
                  </FormField>
                </div>
              </div>
              {/* Inventory Information Section */}
              <div>
                <div className="bg-muted p-3 rounded-md">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <p className="font-medium">Last Price</p>
                      <p className="text-muted-foreground">
                        ${formData.inventoryInfo?.lastPrice} per Kg
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Last Order Date</p>
                      <p className="text-muted-foreground">
                        {formData.inventoryInfo?.lastOrderDate}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Last Vendor</p>
                      <p className="text-muted-foreground">
                        {formData.inventoryInfo?.lastVendor}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Vendor and Additional Information Section */}
            <Card className="px-4 py-2">
              <h3 className="text-lg font-semibold mb-2">
                Vendor and Additional Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <FormField id="vendor" label="Vendor">
                  <Input
                    id="vendor"
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleInputChange}
                    placeholder="Vendor name"
                    disabled={mode === "view"}
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
                      />
                    )}
                  </FormField>
                </div>
              </div>
            </Card>

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
                  <DialogContent className="sm:max-w-[60vw]">
                    <Card className="">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl sm:text-2xl font-bold">
                          On Hand by Location
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsInventoryBreakdownOpen(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </CardHeader>

                      <CardContent>
                        <InventoryBreakdown />
                      </CardContent>
                    </Card>
                  </DialogContent>
                </Dialog>

                <Dialog open={isOnOrderOpen} onOpenChange={setIsOnOrderOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      <TruckIcon className="mr-2 h-4 w-4" />
                      On Order
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[60vw]">
                    <Card className="">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl sm:text-2xl font-bold">
                          Pending Purchase Order
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsOnOrderOpen(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </CardHeader>

                      <CardContent>
                        {/* <div className="bg-red-300 h-48"></div> */}
                        <PendingPurchaseOrdersComponent />
                        {/* <InventoryBreakdown /> */}
                      </CardContent>
                    </Card>
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
                  <DialogContent className="sm:max-w-[80vw] bg-white p-6">
                    <VendorComparison />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </form>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-end gap-2 p-4 sm:p-6">
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
      </CardFooter>
    </Card>
  );
}
