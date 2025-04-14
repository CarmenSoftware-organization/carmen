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
import { ArrowLeft, ChevronUp, HelpCircle, ChevronDown, PlusCircle, Plus, Edit, Trash2, X, Printer, CheckSquare, Save, ChevronRight, ChevronLeft, CalendarIcon, PanelRightClose, PanelRightOpen } from "lucide-react";
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
import { ActivityLogTab } from "./tabs/ActivityLogTab";
import { BulkActions } from "./tabs/BulkActions";
import StatusBadge from "@/components/ui/custom-status-badge";
import { useState } from "react";
import SummaryTotal from "./SummaryTotal";
import ItemDetailForm  from "./tabs/itemDetailForm";
import CommentsAttachmentsTab from "./tabs/CommentsAttachmentsTab";
import { TaxTab } from "./tabs/TaxTab";
import StockMovementContent from "./tabs/stock-movement";

interface GoodsReceiveNoteComponentProps {
  initialData: GoodsReceiveNote;
  mode: GoodsReceiveNoteMode;
}

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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = React.useState(false)
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

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

  const calculateDocumentTotals = () => {
    const netAmount = formData.items.reduce((sum, item) => sum + item.netAmount, 0);
    const taxAmount = formData.items.reduce((sum, item) => sum + item.taxAmount, 0);
    const totalAmount = netAmount + taxAmount;

    return {
      currency: {
        netAmount,
        taxAmount,
        totalAmount,
      },
      baseCurrency: {
        netAmount: netAmount * formData.exchangeRate,
        taxAmount: taxAmount * formData.exchangeRate,
        totalAmount: totalAmount * formData.exchangeRate,
      },
    };
  };

  const documentTotals = calculateDocumentTotals();

  const totals = calculateTotals();

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleGoBack = () => {
    router.back();
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
        <div className={`flex-grow space-y-4 ${isSidebarVisible ? 'lg:w-3/4' : 'w-full'}`}>
          <Card>
            <CardHeader className="pb-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" onClick={handleGoBack}>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Go back</span>
                  </Button>
                  <CardTitle className="text-xl font-bold">Goods Receive Note</CardTitle>
                  <StatusBadge status={formData.status} />
                </div>
                <div className="flex gap-2">
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={toggleSidebar}
                          className="h-8 w-8"
                        >
                          {isSidebarVisible ? (
                            <PanelRightClose className="h-4 w-4" />
                          ) : (
                            <PanelRightOpen className="h-4 w-4" />
                          )}
                          <span className="sr-only">Toggle sidebar</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
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
               
               
                 <div className="space-y-2 col-span-2">
                  <Label htmlFor="vendor" className="text-sm font-medium">
                    Vendor
                  </Label>
                  <Select
                    value={formData.vendor || undefined}
                    onValueChange={(value) => handleSelectChange("vendor", value)}
                    disabled={!isEditable}
                  >
                    <SelectTrigger id="vendor" className="h-8 text-sm">
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.vendor ? (
                        <SelectItem value={formData.vendor}>
                          {formData.vendor}
                        </SelectItem>
                      ) : (
                        <SelectItem value="no-vendor">No vendor selected</SelectItem>
                      )}
                      {/* Add more vendor options here */}
                    </SelectContent>
                  </Select>
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
                <div className="space-y-2 col-span-4">
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
                <div className="space-y-2 col-start-1">
                  <Label htmlFor="currency" className="text-sm font-medium">
                    Currency
                  </Label>
                  <Select
                    value={formData.currency || undefined}
                    onValueChange={(value) => handleSelectChange("currency", value)}
                    disabled={!isEditable}
                  >
                    <SelectTrigger id="currency" className="h-8 text-sm">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.currency ? (
                        <SelectItem value={formData.currency}>
                          {formData.currency}
                        </SelectItem>
                      ) : (
                        <SelectItem value="no-currency">No currency selected</SelectItem>
                      )}
                      {/* Add more currency options here */}
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
                <div className="space-y-2 hidden">
                  <Label htmlFor="cash-book" className="text-sm font-medium">
                    Cash Book
                  </Label>
                  <Select
                    value={formData.cashBook || undefined}
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
                        <SelectItem value="no-cashbook">No cash book selected</SelectItem>
                      )}
                      {/* Add more cash book options here */}
                    </SelectContent>
                  </Select>
                </div>
                               {/* Add these new fields */}
                               <div className="space-y-2">
                  <Label htmlFor="creditTerms" className="text-sm font-medium">Credit Terms</Label>
                  <Select 
                    defaultValue="net30"
                    onValueChange={(value) => handleSelectChange("creditTerms", value)}
                    disabled={!isEditable}
                  >
                    <SelectTrigger id="creditTerms" className="h-8 text-sm">
                      <SelectValue placeholder="Select credit terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="net30">Net 30</SelectItem>
                      <SelectItem value="net60">Net 60</SelectItem>
                      <SelectItem value="net90">Net 90</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-sm font-medium">Due Date</Label>
                  <div className="relative">
                    <Input 
                      id="dueDate" 
                      name="dueDate"
                      type="date" 
                      value={formData.dueDate ? formData.dueDate.toISOString().split('T')[0] : ''}
                      onChange={handleInputChange}
                      readOnly={!isEditable}
                      className="h-8 text-sm"
                    />
                    <CalendarIcon className="absolute right-3 top-2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                

 
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Tabs defaultValue="items" className="w-full">
                <TabsList className="w-full flex flex-wrap">
                  <TabsTrigger value="items" className="flex-1">Items</TabsTrigger>
                  <TabsTrigger value="extra-costs" className="flex-1">Extra Costs</TabsTrigger>
                  <TabsTrigger value="stock-movement" className="flex-1">Stock Movement</TabsTrigger>
                  <TabsTrigger value="journal-entries" className="flex-1">Journal Entries</TabsTrigger>
                  <TabsTrigger value="tax" className="flex-1">Tax Entries</TabsTrigger>
                </TabsList>
                <TabsContent value="items">
                  <div className="mb-4 space-y-4">
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
                    exchangeRate={formData.exchangeRate}
                    baseCurrency={formData.baseCurrency}
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
                  <StockMovementContent/>
                </TabsContent>
                
                <TabsContent value="journal-entries">
                  <FinancialSummaryTab
                    mode={mode}
                    summary={formData.financialSummary || null}
                    currency={formData.currency}
                    baseCurrency={formData.baseCurrency}
                  />
                </TabsContent>
                <TabsContent value="tax">
                  <TaxTab
                    mode={mode}
                    taxInvoiceNumber={formData.taxInvoiceNumber}
                    taxInvoiceDate={formData.taxInvoiceDate}
                    onTaxInvoiceChange={(field, value) => {
                      setFormData(prev => ({ ...prev, [field]: value }));
                    }}
                    documentTotals={documentTotals}
                    currency={formData.currency}
                    baseCurrency={formData.baseCurrency}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaction Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <SummaryTotal poData={formData} />
            </CardContent>
          </Card>
        </div>

        <div className={`space-y-4 ${isSidebarVisible ? 'lg:w-1/4' : 'w-0 opacity-0 overflow-hidden'} transition-all duration-300`}>
          <Card>
            <CardHeader>
              <CardTitle>Comments & Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <CommentsAttachmentsTab poData={formData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityLogTab activityLog={formData.activityLog} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}