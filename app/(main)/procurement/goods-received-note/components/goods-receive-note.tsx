"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip, 
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowLeft, ChevronUp, HelpCircle,ChevronDown, PlusCircle, Plus, Edit, Trash2, X, Printer, CheckSquare, Save } from "lucide-react";
import {
  GoodsReceiveNote,
  GoodsReceiveNoteMode,
  GoodsReceiveNoteItem,
} from "@/lib/types";
import { GoodsReceiveNoteItems } from "./tabs/GoodsReceiveNoteItems";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExtraCostsTab } from "./tabs/ExtraCostsTab";
import { StockMovementTab } from "./tabs/StockMovementTab";
import { FinancialSummaryTab } from "./tabs/FinancialSummaryTab";
import { FinancialSummary } from "@/lib/types";
import CommentsAttachmentsTab from "./tabs/CommentsAttachmentsTab";
import { ActivityLogTab } from "./tabs/ActivityLogTab";
import { BulkActions } from "./tabs/BulkActions";
import StatusBadge from "@/components/ui/custom-status-badge";
import { useState } from "react";
import SummaryTotal from "./SummaryTotal";
import ItemDetailForm  from "./tabs/itemDetailForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/custom-dialog";

interface GoodsReceiveNoteComponentProps {
  initialData: GoodsReceiveNote;
  mode: GoodsReceiveNoteMode;
}

// const calculateFinancialSummary = (
//   formData: GoodsReceiveNote
// ): FinancialSummary => {
//   // Mock data for financial summary
//   return {<></>}
    
// };

export function GoodsReceiveNoteComponent({
  initialData,
  mode: initialMode,
}: GoodsReceiveNoteComponentProps) {
  const router = useRouter();
  const [mode, setMode] = React.useState<GoodsReceiveNoteMode>(initialMode);
  const [formData, setFormData] = React.useState<GoodsReceiveNote>(() => ({
    ...initialData,
    date: new Date(initialData.date),
    invoiceDate: new Date(initialData.invoiceDate),
    taxInvoiceDate: initialData.taxInvoiceDate
      ? new Date(initialData.taxInvoiceDate)
      : undefined,
  }));
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] =
    React.useState(false)
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === "date") {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? new Date(value) : undefined,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSave = () => {
    console.log("Saving data:", formData);
    setMode("view");
  };

  const handleCancel = () => {
    setFormData(initialData);
    setMode("view");
  };

  const isEditable = mode === "edit" || mode === "add";

  const handleItemsChange = (updatedItems: GoodsReceiveNoteItem[]) => {
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleItemSelect = (itemId: string, isSelected: boolean) => {
    setSelectedItems((prev) =>
      isSelected ? [...prev, itemId] : prev.filter((id) => id !== itemId)
    );
  };

  const handleBulkAction = (action: string) => {
    console.log(`Applying ${action} to items:`, selectedItems);
    // Implement bulk action logic here
    // For example:
    if (action === "delete") {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((item) => !selectedItems.includes(item.id)),
      }));
    }
    // Implement other actions as needed
    setSelectedItems([]);
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + item.subTotalAmount,
      0
    );
    const taxTotal = formData.items.reduce(
      (sum, item) => sum + item.taxAmount,
      0
    );
    const extraCostsTotal = formData.extraCosts.reduce(
      (sum, cost) => sum + cost.amount,
      0
    );
    const grandTotal = subtotal + taxTotal + extraCostsTotal;

    return { subtotal, taxTotal, extraCostsTotal, grandTotal };
  };

  const totals = calculateTotals();

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddItem = (newItem: GoodsReceiveNoteItem) => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
    setIsAddDialogOpen(false);
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="space-y-4 w-full max-w-7xl mx-auto">
      <Card>
        <CardHeader className="flex flex-col space-y-1.5 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={handleGoBack}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Go back</span>
              </Button>
              <CardTitle className="text-xl font-bold">Goods Receive Note</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <StatusBadge status={formData.status} />
              {mode === "view" && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setMode("edit")}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </>
              )}
              {isEditable && (
                <>
                  <Button variant="outline" size="sm" onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <CheckSquare className="mr-2 h-4 w-4" />
                Commit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="ref" className="text-sm font-medium">
               GRN #
              </Label>
              <Input
                id="ref"
                name="ref"
                value={formData.ref}
                onChange={handleInputChange}
                readOnly={!isEditable}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium">
                Date
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date.toISOString().split("T")[0]}
                onChange={handleInputChange}
                readOnly={!isEditable}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor" className="text-sm font-medium">
                Vendor
              </Label>
              <Select
                value={formData.vendor}
                onValueChange={(value) => handleSelectChange("vendor", value)}
                disabled={!isEditable}
              >
                <SelectTrigger id="vendor" className="h-8 text-sm">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={formData.vendor}>
                    {formData.vendor}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

 
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-sm font-medium">
                Currency
              </Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleSelectChange("currency", value)}
                disabled={!isEditable}
              >
                <SelectTrigger id="currency" className="h-8 text-sm">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={formData.currency}>
                    {formData.currency}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exchangeRate" className="text-sm font-medium">
                Exchange Rate
              </Label>
              <Input
                id="exchangeRate"
                name="exchangeRate"
                type="number"
                value={formData.exchangeRate}
                onChange={handleInputChange}
                readOnly={!isEditable}
                className="h-8 text-sm"
                step="0.0001"
                min="0"
              />
            </div>
            <div className="space-y-2 col-start-1" >
              <Label htmlFor="invoice" className="text-sm font-medium">
                Invoice#
              </Label>
              <Input
                id="invoice"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleInputChange}
                readOnly={!isEditable}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice-date" className="text-sm font-medium">
                Invoice Date
              </Label>
              <Input
                id="invoice-date"
                name="invoiceDate"
                type="date"
                value={formData.invoiceDate.toISOString().split("T")[0]}
                onChange={handleInputChange}
                readOnly={!isEditable}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax-invoice" className="text-sm font-medium">
                Tax Invoice#
              </Label>
              <Input
                id="tax-invoice"
                name="taxInvoiceNumber"
                value={formData.taxInvoiceNumber}
                onChange={handleInputChange}
                readOnly={!isEditable}
                className="h-8 text-sm"
              />
            </div>
 
            <div className="space-y-2">
              <Label htmlFor="tax-invoice-date" className="text-sm font-medium">
                Tax Invoice Date
              </Label>
              <Input
                id="tax-invoice-date"
                name="taxInvoiceDate"
                type="date"
                value={
                  formData.taxInvoiceDate instanceof Date
                    ? formData.taxInvoiceDate.toISOString().split("T")[0]
                    : ""
                }
                onChange={handleInputChange}
                readOnly={!isEditable}
                className="h-8 text-sm"
              />
            </div>
           
            
            <div className="flex flex-col justify-end space-y-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="consignment"
                        checked={formData.isConsignment}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            "isConsignment",
                            checked as boolean
                          )
                        }
                        disabled={!isEditable}
                      />
                      <Label
                        htmlFor="consignment"
                        className="text-sm font-medium flex items-center"
                      >
                        Consignment
                        <HelpCircle className="w-4 h-4 ml-1" />
                      </Label>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Goods sent for sale with the expectation of future payment
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cash"
                  checked={formData.isCash}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("isCash", checked as boolean)
                  }
                  disabled={!isEditable}
                />
                <Label htmlFor="cash" className="text-sm font-medium">
                  Cash
                </Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cash-book" className="text-sm font-medium">
                Cash Book
              </Label>
              <Select
                value={formData.cashBook || ""}
                onValueChange={(value) => handleSelectChange("cashBook", value)}
                disabled={!isEditable}
              >
                <SelectTrigger id="cash-book" className="h-8 text-sm w-full">
                  <SelectValue placeholder="Select cash book" />
                </SelectTrigger>
                <SelectContent>
                  {formData.cashBook ? (
                    <SelectItem value={formData.cashBook}>
                      {formData.cashBook}
                    </SelectItem>
                  ) : (
                    <SelectItem value="">No cash book selected</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
              </div>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  readOnly={!isEditable}
                  className="h-8 text-sm w-full mt-2"
                />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Tabs defaultValue="items" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="items" className="flex-1">
                Items
              </TabsTrigger>
              <TabsTrigger value="extra-costs" className="flex-1">
                Extra Costs
              </TabsTrigger>
              <TabsTrigger value="stock-movement" className="flex-1">
                Stock Movement
              </TabsTrigger>
              <TabsTrigger value="transaction-summary" className="flex-1">
                Transaction Summary
              </TabsTrigger>
              <TabsTrigger value="comments-attachments" className="flex-1">
                Comments & Attachments
              </TabsTrigger>
              <TabsTrigger value="activity-log" className="flex-1">
                Activity Log
              </TabsTrigger>
            </TabsList>
            <TabsContent value="items">
              <div className="mb-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl">
                      <ItemDetailForm
                        mode="add"
                        item={null}
                        onSave={handleAddItem}
                        onClose={() => setIsAddDialogOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                {isEditable && selectedItems.length > 0 && (
                  <BulkActions
                    selectedItems={selectedItems}
                    onAction={handleBulkAction}
                  />
                )}
              </div>
              <GoodsReceiveNoteItems
                mode={mode}
                items={formData.items}
                onItemsChange={handleItemsChange}
                onItemSelect={handleItemSelect}
                selectedItems={selectedItems}
              />
            </TabsContent>
            <TabsContent value="extra-costs">
              <ExtraCostsTab
                mode={mode}
                initialCosts={formData.extraCosts}
                onCostsChange={(newCosts) => {
                  setFormData((prev) => ({
                    ...prev,
                    extraCosts: newCosts,
                  }));
                }}
              />
            </TabsContent>
            <TabsContent value="stock-movement">
              <StockMovementTab
                mode={mode}
                movements={formData.stockMovements || []}
              />
            </TabsContent>
            <TabsContent value="transaction-summary">
              <FinancialSummaryTab
                mode={mode}
                summary= {formData.financialSummary} //{calculateFinancialSummary(formData)}
                currency={formData.currency}
                baseCurrency={formData.baseCurrency}
             />
            </TabsContent>
            <TabsContent value="comments-attachments">
              <CommentsAttachmentsTab poData={formData} />
            </TabsContent>
            <TabsContent value="activity-log">
              <ActivityLogTab activityLog={formData.activityLog} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Summary Total</CardTitle>
        </CardHeader>
        <CardContent>
          <SummaryTotal poData={formData} />
        </CardContent>
      </Card>
    </div>
  );
}