import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PurchaseRequest, asMockPurchaseRequest } from "@/lib/types";
import { Calculator, TrendingUp, DollarSign, Percent } from "lucide-react";

interface ISummaryTotalProps {
  prData: PurchaseRequest;
}

export default function SummaryTotal({ prData }: ISummaryTotalProps) {
  const mockPrData = asMockPurchaseRequest(prData);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const summaryData = [
    {
      label: "Subtotal",
      icon: DollarSign,
      amount: mockPrData.subTotalPrice ?? 0,
      baseAmount: mockPrData.baseSubTotalPrice ?? 0,
      type: "subtotal",
    },
    {
      label: "Discount",
      icon: Percent,
      amount: -(mockPrData.discountAmount ?? 0),
      baseAmount: -(mockPrData.baseDiscAmount ?? 0),
      type: "discount",
    },
  ];

  const netAmount = mockPrData.netAmount ?? 0;
  const baseNetAmount = mockPrData.baseNetAmount ?? 0;
  const totalAmount = mockPrData.totalAmount ?? 0;
  const baseTotalAmount = mockPrData.baseTotalAmount ?? 0;

  const currency = mockPrData.currency || "USD";
  const baseCurrency = mockPrData.baseCurrencyCode || "USD";
  const showBaseCurrency = currency !== baseCurrency;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Subtotal, Discount, Net Amount, Tax - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        {/* Subtotal */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-2 sm:p-3 lg:p-4">
            <div className="flex items-center justify-end">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Subtotal
                </span>
              </div>
            </div>
            <div className="mt-1 sm:mt-2 text-right">
              <div className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(mockPrData.subTotalPrice ?? 0, currency)}
              </div>
              {showBaseCurrency && (
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(mockPrData.baseSubTotalPrice ?? 0, baseCurrency)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Discount */}
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-2 sm:p-3 lg:p-4">
            <div className="flex items-center justify-end">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Percent className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Discount
                </span>
              </div>
            </div>
            <div className="mt-1 sm:mt-2 text-right">
              <div className="text-sm sm:text-base lg:text-lg font-bold text-green-600">
                {formatCurrency(Math.abs(mockPrData.discountAmount ?? 0), currency)}
              </div>
              {showBaseCurrency && (
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(Math.abs(mockPrData.baseDiscAmount ?? 0), baseCurrency)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Net Amount */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-2 sm:p-3 lg:p-4">
            <div className="flex items-center justify-end">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Calculator className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Net Amount
                </span>
              </div>
            </div>
            <div className="mt-1 sm:mt-2 text-right">
              <div className="text-sm sm:text-base lg:text-lg font-bold text-blue-600">
                {formatCurrency(netAmount, currency)}
              </div>
              {showBaseCurrency && (
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(baseNetAmount, baseCurrency)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tax */}
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-2 sm:p-3 lg:p-4">
            <div className="flex items-center justify-end">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Calculator className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Tax
                </span>
              </div>
            </div>
            <div className="mt-1 sm:mt-2 text-right">
              <div className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(mockPrData.taxAmount ?? 0, currency)}
              </div>
              {showBaseCurrency && (
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(mockPrData.baseTaxAmount ?? 0, baseCurrency)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Total Amount - Full Width - Responsive Layout */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-2 border-blue-200 dark:border-blue-800">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-blue-600 rounded-full flex-shrink-0">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100">
                  Total Amount
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Final amount including all charges
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
                {formatCurrency(totalAmount, currency)}
              </div>
              {showBaseCurrency && (
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {formatCurrency(baseTotalAmount, baseCurrency)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info - Responsive Badge Layout */}
      <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
        {showBaseCurrency && (
          <Badge variant="secondary" className="text-xs">
            {baseCurrency} • Base Currency
          </Badge>
        )}
        {mockPrData.exchangeRate && mockPrData.exchangeRate !== 1 && (
          <Badge variant="outline" className="text-xs">
            Rate: 1 {currency} = {mockPrData.exchangeRate?.toFixed(4)} {baseCurrency}
          </Badge>
        )}
      </div>
    </div>
  );
}