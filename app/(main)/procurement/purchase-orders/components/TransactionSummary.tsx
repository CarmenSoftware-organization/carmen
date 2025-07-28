import { useState } from "react";
import { PurchaseOrder } from "@/lib/types";
import { DollarSign, Percent, FileText, Receipt, TrendingUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { CheckedState } from "@radix-ui/react-checkbox";

interface TransactionSummaryProps {
  poData: PurchaseOrder;
  isEditing?: boolean;
}

export default function TransactionSummary({ poData, isEditing = false }: TransactionSummaryProps) {
  // State for override checkboxes
  const [discountOverride, setDiscountOverride] = useState(false);
  const [taxOverride, setTaxOverride] = useState(false);

  // Calculate values
  const subtotal = poData.subTotalPrice ?? 0;
  const discount = poData.discountAmount ?? 0;
  const netAmount = poData.netAmount ?? 0;
  const tax = poData.taxAmount ?? 0;
  const totalAmount = poData.totalAmount ?? 0;

  // Base currency values
  const baseSubtotal = poData.baseSubTotalPrice ?? 0;
  const baseDiscount = poData.baseDiscAmount ?? 0;
  const baseNetAmount = poData.baseNetAmount ?? 0;
  const baseTax = poData.baseTaxAmount ?? 0;
  const baseTotalAmount = poData.baseTotalAmount ?? 0;

  const summaryItems = [
    {
      label: "Subtotal",
      value: subtotal,
      baseValue: baseSubtotal,
      icon: DollarSign,
      borderColor: "border-l-blue-400",
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
      hasOverride: false
    },
    {
      label: "Discount",
      value: discount,
      baseValue: baseDiscount,
      icon: Percent,
      borderColor: "border-l-green-400",
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
      hasOverride: true,
      overrideChecked: discountOverride,
      onOverrideChange: (checked: CheckedState) => setDiscountOverride(checked === true)
    },
    {
      label: "Net Amount",
      value: netAmount,
      baseValue: baseNetAmount,
      icon: FileText,
      borderColor: "border-l-blue-400",
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
      hasOverride: false
    },
    {
      label: "Tax",
      value: tax,
      baseValue: baseTax,
      icon: FileText,
      borderColor: "border-l-orange-400",
      iconColor: "text-orange-500",
      bgColor: "bg-orange-50",
      hasOverride: true,
      overrideChecked: taxOverride,
      onOverrideChange: (checked: CheckedState) => setTaxOverride(checked === true)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <h3 className="text-xl font-semibold text-black">
        Transaction Summary ({poData.currencyCode || 'USD'})
      </h3>
      
      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.label}
              className={`${item.bgColor} border border-gray-200 rounded-lg ${item.borderColor} border-l-4 overflow-hidden`}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`h-4 w-4 ${item.iconColor}`} />
                    <span className="text-sm font-medium text-gray-600">{item.label}</span>
                  </div>
                  {isEditing && item.hasOverride && (
                    <div className="flex items-center gap-1">
                      <Checkbox
                        id={`override-${item.label.toLowerCase()}`}
                        checked={item.overrideChecked}
                        onCheckedChange={item.onOverrideChange}
                        className="h-4 w-4"
                      />
                      <label 
                        htmlFor={`override-${item.label.toLowerCase()}`}
                        className="text-xs text-gray-500 cursor-pointer"
                      >
                        Override
                      </label>
                    </div>
                  )}
                </div>
                <div className="text-2xl font-bold text-black">
                  {item.value.toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {poData.baseCurrencyCode || 'THB'} {item.baseValue.toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Amount Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 rounded-full p-2.5">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold text-black">Total Amount</div>
                <div className="text-sm text-gray-600">Final amount including all charges</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {totalAmount.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {poData.baseCurrencyCode || 'THB'} {baseTotalAmount.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}