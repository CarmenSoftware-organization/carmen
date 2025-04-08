"use client"

import React, { useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StockMovementItem, Lot } from "../types"

interface StockMovementTableProps {
  items: StockMovementItem[]
}

export function StockMovementTable({ items }: StockMovementTableProps): JSX.Element {
  const calculateInQuantityTotal = useMemo(() => {
    return items.reduce((sum: number, item: StockMovementItem) => 
      sum + item.lots.reduce((lotSum: number, lot: Lot) => 
        lot.quantity > 0 ? lotSum + lot.quantity : lotSum, 0
      ), 0
    )
  }, [items])

  const calculateOutQuantityTotal = useMemo(() => {
    return items.reduce((sum: number, item: StockMovementItem) => 
      sum + item.lots.reduce((lotSum: number, lot: Lot) => 
        lot.quantity < 0 ? lotSum + Math.abs(lot.quantity) : lotSum, 0
      ), 0
    )
  }, [items])

  const calculateTotalCost = useMemo(() => {
    return items.reduce((sum: number, item: StockMovementItem) => sum + item.totalCost, 0)
  }, [items])

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    })
  }

  const formatNumber = (value: number): string => {
    return value.toLocaleString()
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[200px]">Location</TableHead>
          <TableHead className="w-[200px]">Product</TableHead>
          <TableHead>Lot No.</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead className="text-center" colSpan={2}>
            <div className="flex flex-col items-center gap-1">
              <span>STOCK</span>
              <div className="flex justify-center gap-8 w-full border-t pt-1">
                <div className="w-16 text-right">In</div>
                <div className="w-16 text-right">Out</div>
              </div>
            </div>
          </TableHead>
          <TableHead className="text-right">Unit Cost</TableHead>
          <TableHead className="text-right">Total Cost</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item: StockMovementItem) => (
          item.lots.map((lot: Lot, lotIndex: number) => (
            <TableRow key={`${item.id}-${lot.lotNo}`} className="hover:bg-muted/50">
              <TableCell>
                {lotIndex === 0 && (
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium">{item.location.name}</div>
                    <div className="text-xs text-muted-foreground">{item.location.code}</div>
                  </div>
                )}
              </TableCell>
              <TableCell>
                {lotIndex === 0 && (
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium">{item.productName}</div>
                    <div className="text-xs text-muted-foreground">{item.sku}</div>
                  </div>
                )}
              </TableCell>
              <TableCell>{lot.lotNo}</TableCell>
              <TableCell>{item.uom}</TableCell>
              <TableCell className="text-right text-green-600">
                {lot.quantity > 0 ? formatNumber(lot.quantity) : ''}
              </TableCell>
              <TableCell className="text-right text-red-600">
                {lot.quantity < 0 ? formatNumber(Math.abs(lot.quantity)) : ''}
              </TableCell>
              <TableCell className="text-right">
                {lotIndex === 0 ? formatCurrency(item.unitCost) : ''}
              </TableCell>
              <TableCell className="text-right">
                {lotIndex === 0 ? formatCurrency(lot.quantity > 0 
                  ? lot.quantity * item.unitCost
                  : Math.abs(lot.quantity) * item.unitCost) : ''}
              </TableCell>
            </TableRow>
          ))
        ))}
        <TableRow className="hover:bg-transparent border-t-2">
          <TableCell colSpan={4} className="font-medium">Total</TableCell>
          <TableCell className="text-right font-medium text-green-600">
            {formatNumber(calculateInQuantityTotal)}
          </TableCell>
          <TableCell className="text-right font-medium text-red-600">
            {formatNumber(calculateOutQuantityTotal)}
          </TableCell>
          <TableCell className="text-right"></TableCell>
          <TableCell className="text-right font-medium">
            {formatCurrency(calculateTotalCost)}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
