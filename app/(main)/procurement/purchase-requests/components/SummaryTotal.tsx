import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PurchaseRequest } from "@/lib/types";
import { Calculator, TrendingUp, DollarSign, Percent } from "lucide-react";

interface ISummaryTotalProps {
  prData: PurchaseRequest;
}

export default function SummaryTotal({ prData }: ISummaryTotalProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const summaryData = [
    {
      label: "Subtotal",
      icon: DollarSign,
      amount: prData.subTotalPrice ?? 0,
      baseAmount: prData.baseSubTotalPrice ?? 0,
      type: "subtotal",
    },
    {
      label: "Discount",
      icon: Percent,
      amount: -(prData.discountAmount ?? 0),
      baseAmount: -(prData.baseDiscAmount ?? 0),
      type: "discount",
    },
    {
      label: "Tax",
      icon: Calculator,
      amount: prData.taxAmount ?? 0,
      baseAmount: prData.baseTaxAmount ?? 0,
      type: "tax",
    },
  ];

  const netAmount = prData.netAmount ?? 0;
  const baseNetAmount = prData.baseNetAmount ?? 0;
  const totalAmount = prData.totalAmount ?? 0;
  const baseTotalAmount = prData.baseTotalAmount ?? 0;

  const currency = prData.currency || "USD";
  const baseCurrency = prData.baseCurrencyCode || "USD";
  const showBaseCurrency = currency !== baseCurrency;

  return (
    <div className="space-y-4">
      {/* Summary Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryData.map((item) => {
          const IconComponent = item.icon;
          const isDiscount = item.type === "discount";
          const isPositive = item.amount >= 0;
          
          return (
            <Card key={item.label} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className={`h-4 w-4 ${isDiscount ? 'text-green-600' : 'text-blue-600'}`} />
                    <span className="text-sm font-medium text-muted-foreground">
                      {item.label}
                    </span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className={`text-lg font-bold ${isDiscount && item.amount < 0 ? 'text-green-600' : 'text-gray-900 dark:text-gray-100'}`}>
                    {formatCurrency(Math.abs(item.amount), currency)}
                    {isDiscount && item.amount < 0 && (
                      <span className="text-xs ml-1 text-green-600">saved</span>
                    )}
                  </div>
                  {showBaseCurrency && (
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(Math.abs(item.baseAmount), baseCurrency)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator />

      {/* Net Amount */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Calculator className="h-5 w-5 text-blue-600" />
          <span className="text-base font-semibold">Net Amount</span>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">
            {formatCurrency(netAmount, currency)}
          </div>
          {showBaseCurrency && (
            <div className="text-sm text-muted-foreground">
              {formatCurrency(baseNetAmount, baseCurrency)}
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Total Amount - Most Prominent */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-2 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-full">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Total Amount
                </h3>
                <p className="text-sm text-muted-foreground">
                  Final amount including all charges
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalAmount, currency)}
              </div>
              {showBaseCurrency && (
                <div className="text-sm text-muted-foreground mt-1">
                  {formatCurrency(baseTotalAmount, baseCurrency)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Badge variant="outline" className="text-xs">
          {currency} • Primary Currency
        </Badge>
        {showBaseCurrency && (
          <Badge variant="secondary" className="text-xs">
            {baseCurrency} • Base Currency
          </Badge>
        )}
        {prData.exchangeRate && prData.exchangeRate !== 1 && (
          <Badge variant="outline" className="text-xs">
            Rate: 1 {currency} = {prData.exchangeRate?.toFixed(4)} {baseCurrency}
          </Badge>
        )}
      </div>
    </div>
  );
}