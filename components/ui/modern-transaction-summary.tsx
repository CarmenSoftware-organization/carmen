"use client"

import React from 'react'
import { DollarSign, Percent, Receipt, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TransactionItem {
  id: string
  label: string
  amount: number
  currency: string
  icon: React.ComponentType<{ className?: string }>
  borderColor: string
  iconColor: string
}

interface ModernTransactionSummaryProps {
  subtotal: number
  discount: number
  netAmount: number
  tax: number
  totalAmount: number
  currency: string
  baseCurrency?: string
  exchangeRate?: number
  className?: string
}

export function ModernTransactionSummary({
  subtotal,
  discount,
  netAmount,
  tax,
  totalAmount,
  currency,
  baseCurrency,
  exchangeRate = 1,
  className
}: ModernTransactionSummaryProps) {
  const items: TransactionItem[] = [
    {
      id: 'subtotal',
      label: 'Subtotal',
      amount: subtotal,
      currency,
      icon: DollarSign,
      borderColor: 'border-l-blue-500',
      iconColor: 'text-blue-500'
    },
    {
      id: 'discount',
      label: 'Discount',
      amount: discount,
      currency,
      icon: Percent,
      borderColor: 'border-l-green-500',
      iconColor: 'text-green-500'
    },
    {
      id: 'net',
      label: 'Net Amount',
      amount: netAmount,
      currency,
      icon: Receipt,
      borderColor: 'border-l-blue-500',
      iconColor: 'text-blue-500'
    },
    {
      id: 'tax',
      label: 'Tax',
      amount: tax,
      currency,
      icon: TrendingUp,
      borderColor: 'border-l-orange-500',
      iconColor: 'text-orange-500'
    }
  ]

  return (
    <div className={cn("space-y-3 sm:space-y-4", className)}>
      {/* Summary Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "bg-white rounded-lg border-l-4 p-2 sm:p-3 lg:p-4 shadow-sm",
              item.borderColor
            )}
          >
            <div className="space-y-1 sm:space-y-2 text-right">
              <div className="flex items-center justify-end gap-1 sm:gap-2">
                <item.icon className={cn("h-3 w-3 sm:h-4 sm:w-4", item.iconColor)} />
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {item.label}
                </span>
              </div>
              
              {/* Primary Currency Amount - Responsive Text */}
              <div className="text-sm sm:text-lg lg:text-2xl font-bold">
                {item.amount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
              
              {/* Base Currency Amount - Always show at bottom */}
              <div className="text-xs text-gray-600 border-t border-gray-200 pt-1">
                {baseCurrency && baseCurrency !== currency ? (
                  <>
                    {(item.amount * exchangeRate).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} {baseCurrency}
                  </>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Amount Card - Responsive Layout */}
      <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">Total Amount</div>
              <div className="text-xs sm:text-sm text-gray-600">Final amount including all charges</div>
            </div>
          </div>
          <div className="space-y-1 sm:space-y-2 text-left sm:text-right">
            {/* Primary Currency Total - Responsive Text */}
            <div className="text-lg sm:text-xl lg:text-3xl font-bold text-blue-600">
              {totalAmount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} {currency}
            </div>
            
            {/* Base Currency Total - Always show at bottom */}
            <div className="text-xs sm:text-sm text-gray-600 border-t border-blue-300 pt-1 sm:pt-2">
              {baseCurrency && baseCurrency !== currency ? (
                <>
                  {(totalAmount * exchangeRate).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} {baseCurrency}
                </>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}