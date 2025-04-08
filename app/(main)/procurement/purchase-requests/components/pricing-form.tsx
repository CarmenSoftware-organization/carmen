"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SummaryPRTable } from "./tabs/Summary-pr-table";
import { IBaseSummary, PurchaseRequestItem } from "@/lib/types";
import { Package, XIcon } from "lucide-react";
import { VendorComparison } from "./vendor-comparison";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

type FormMode = "add" | "edit" | "view";

const initialFormData: Partial<PurchaseRequestItem> = {
  currency: "USD",
  currencyRate: 1,
  price: 3.99,
  adjustments: {
    discount: false,
    tax: false,
  },
  taxIncluded: false,
  discountRate: 5,
  taxRate: 7,
};

export function PricingFormComponent({
  data,
  initialMode,
}: {
  data?: Partial<PurchaseRequestItem>;
  initialMode: FormMode;
}) {
  const [formData, setFormData] = useState<Partial<PurchaseRequestItem>>(
    data || initialFormData
  );
  const [mode, setMode] = useState<FormMode>(initialMode);
  const [calculatedAmounts, setCalculatedAmounts] = useState({
    baseAmount: 0,
    discountAmount: 0,
    netAmount: 0,
    taxAmount: 0,
    totalAmount: 0,
  });

  const [summaryFooter, setSummaryFooter] = useState<IBaseSummary>({
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
  });

  const [isVendorComparisonOpen, setIsVendorComparisonOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : parseFloat(value) || value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleModeChange = (newMode: FormMode) => {
    setMode(newMode);
    if (newMode === "add") {
      setFormData(initialFormData);
    }
  };

  function calcRate(amt: number, exchangeRate: number) {
    return amt / exchangeRate;
  }

  useEffect(() => {
    const quantity = 450; // Assuming 450 is the quantity as per the image calculations
    const baseAmount = (formData.price || 0) * quantity;
    const discountAmount =
      formData.discountAmount !== undefined && formData.discountAmount !== null
        ? formData.discountAmount
        : baseAmount * ((formData.discountRate || 0) / 100);
    const netAmount = baseAmount - discountAmount;
    const taxAmount =
      formData.taxAmount !== undefined && formData.taxAmount !== null
        ? formData.taxAmount
        : netAmount * ((formData.taxRate || 0) / 100);
    const totalAmount = netAmount + taxAmount;

    const currencyRate = formData.currencyRate || 1;

    setCalculatedAmounts({
      baseAmount,
      discountAmount,
      netAmount,
      taxAmount,
      totalAmount,
    });

    setSummaryFooter({
      baseSubTotalPrice: baseAmount / currencyRate,
      subTotalPrice: baseAmount,
      baseNetAmount: netAmount / currencyRate,
      netAmount: netAmount,
      baseDiscAmount: discountAmount / currencyRate,
      discountAmount: discountAmount,
      baseTaxAmount: taxAmount / currencyRate,
      taxAmount: taxAmount,
      baseTotalAmount: totalAmount / currencyRate,
      totalAmount: totalAmount,
    });
  }, [formData]);

  const isViewMode = mode === initialMode;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 md:gap-0 space-x-0 md:space-x-6">
        <div className="w-full md:w-1/2 ">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Pricing</h2>
            <Dialog
              open={isVendorComparisonOpen}
              onOpenChange={setIsVendorComparisonOpen}
            >
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  <Package className="mr-2 h-4 w-4" />
                  Vendor Comparison
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[60vw] bg-white p-6 overflow-y-auto [&>button]:hidden">
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
          <div className="space-y-4">
            <div className="flex items-end space-x-4">
              <div className="w-1/4">
                <Label
                  htmlFor="currency"
                  className="text-xs text-muted-foreground"
                >
                  Currency
                </Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    handleSelectChange("currency", value)
                  }
                  disabled={isViewMode}
                >
                  <SelectTrigger id="currency" className="h-8 text-sm">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-1/4">
                <Label
                  htmlFor="currencyRate"
                  className="text-xs text-muted-foreground"
                >
                  Exch. Rate
                </Label>
                <Input
                  type="number"
                  id="currencyRate"
                  name="currencyRate"
                  value={formData.currencyRate}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  className="h-8 text-sm"
                />
              </div>
              <div className="w-1/4">
                <Label
                  htmlFor="price"
                  className="text-xs text-muted-foreground"
                >
                  Price
                </Label>
                <Input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex items-center flex-col pb-2">

              <Label
                htmlFor="tax-included"
                className="space-y-1 text-xs text-muted-foreground"
              >
                Tax Incl.
              </Label>
              <div className="flex items-center h-7 pt-2">
              <Checkbox
                id="tax-included"
                name="tax-included"
                checked={formData.taxIncluded}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    adjustment: checked as boolean,
                  }))
                }
                disabled={isViewMode}
                className="text-sm"
              />
              </div>
            </div>
            </div>


            <div className="grid grid-cols-4 space-x-4">

              <div className="col-span-2 lg:col-span-1 flex gap-2 items-center w-full">
                <div className="flex flex-col">
                  <Label
                    htmlFor="enable-disc-adjustment"
                    className="space-y-1 text-xs"
                  >
                    Adj.
                  </Label>
                  <div className="flex items-center h-7 pt-2">
                    <Checkbox
                      id="enable-disc-adjustment"
                      value={formData.adjustments?.discount?.toString()}
                      className="text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1 w-full">
                  <Label htmlFor="discountRate" className="text-xs">
                    Disc. Rate (%)
                  </Label>
                  <Input
                    type="number"
                    id="discountRate"
                    name="discountRate"
                    value={formData.discountRate}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="h-7 text-sm"
                  />
                </div>
              </div>

              <div className="col-span-2 lg:col-span-3">
                <Label
                  htmlFor="discountAmount"
                  className="text-xs text-muted-foreground"
                >
                  Override Discount
                </Label>
                <Input
                  type="number"
                  id="discountAmount"
                  name="discountAmount"
                  value={formData.discountAmount ?? ""}
                  onChange={handleInputChange}
                  placeholder="Enter to override"
                  disabled={isViewMode}
                  className="h-8 text-sm"
                />
              </div>

            </div>

            <div className="grid grid-cols-4 space-x-4">
            
              <div className="col-span-2 lg:col-span-1 flex gap-2 items-center w-full">
                <div className="flex flex-col">
                  <Label
                    htmlFor="enable-tax-adjustment"
                    className="space-y-1 text-xs"
                  >
                    Adj.
                  </Label>
                  <div className="flex items-center h-7 pt-2">
                    <Checkbox
                      id="enable-tax-adjustment"
                      value={formData.adjustments?.tax.toString()}
                      className="text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1 w-full">
                  <Label htmlFor="taxRate" className="text-xs">
                    Tax Rate (%)
                  </Label>
                  <Input
                    type="number"
                    id="taxRate"
                    name="taxRate"
                    value={formData.taxRate}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="h-7 text-sm"
                  />
                </div>
              </div>

              <div className="col-span-2 lg:col-span-3">
                <Label
                  htmlFor="taxAmount"
                  className="text-xs text-muted-foreground"
                >
                  Override Tax
                </Label>
                <Input
                  type="number"
                  id="taxAmount"
                  name="taxAmount"
                  value={formData.taxAmount ?? ""}
                  onChange={handleInputChange}
                  placeholder="Enter to override"
                  disabled={isViewMode}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            {/* Last Price, Last Order Date, Last Vendor section */}
      <div className="grid grid-cols-3 gap-4 bg-gray-100 p-3 rounded-md">
        <div>
          <p className="text-xs ">Last Price</p>
          <p className="text-xs text-muted-foreground">$3.85 per Kg</p>
        </div>
        <div>
          <p className="text-xs">Last Order Date</p>
          <p className="text-xs text-muted-foreground">2023-05-15</p>
        </div>
        <div>
          <p className="text-xs">Last Vendor</p>
          <p className="text-xs">Organic Supplies Inc.</p>
        </div>
      </div>
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-semibold mb-4">Calculated Amounts</h2>
          <SummaryPRTable
            calculatedAmounts={calculatedAmounts}
            summaryFooter={summaryFooter}
          />
        </div>

      </div>

      
    </div>
  );
}
