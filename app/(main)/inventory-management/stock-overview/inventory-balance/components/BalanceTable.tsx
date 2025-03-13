"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BalanceReport,
  BalanceReportParams,
  CategoryBalance,
  LocationBalance,
  ProductBalance,
  LotBalance
} from "../types"
import { formatCurrency, formatNumber } from "../utils"

interface BalanceTableProps {
  params: BalanceReportParams
  report: BalanceReport
  isLoading: boolean
}

export function BalanceTable({ params, report, isLoading }: BalanceTableProps) {
  const renderLotRow = (lot: LotBalance) => (
    <TableRow key={lot.lotNumber}>
      <TableCell className="pl-8">{lot.lotNumber}</TableCell>
      <TableCell>{lot.expiryDate}</TableCell>
      <TableCell className="text-right">{formatNumber(lot.quantity)}</TableCell>
      <TableCell className="text-right">{formatCurrency(lot.unitCost)}</TableCell>
      <TableCell className="text-right">{formatCurrency(lot.value)}</TableCell>
    </TableRow>
  )

  const renderProductRow = (product: ProductBalance) => (
    <>
      <TableRow key={product.id}>
        <TableCell className="pl-4">{product.code}</TableCell>
        <TableCell>{product.name}</TableCell>
        <TableCell>{product.unit}</TableCell>
        <TableCell className="text-right">{formatNumber(product.totals.quantity)}</TableCell>
        <TableCell className="text-right">{formatCurrency(product.totals.averageCost)}</TableCell>
        <TableCell className="text-right">{formatCurrency(product.totals.value)}</TableCell>
      </TableRow>
      {params.showLots && product.lots.map(renderLotRow)}
    </>
  )

  const renderCategoryRow = (category: CategoryBalance) => (
    <>
      <TableRow key={category.id} className="bg-muted/50">
        <TableCell>{category.code}</TableCell>
        <TableCell>{category.name}</TableCell>
        <TableCell></TableCell>
        <TableCell className="text-right">{formatNumber(category.totals.quantity)}</TableCell>
        <TableCell></TableCell>
        <TableCell className="text-right">{formatCurrency(category.totals.value)}</TableCell>
      </TableRow>
      {category.products.map(renderProductRow)}
    </>
  )

  const renderLocationRow = (location: LocationBalance) => (
    <>
      <TableRow key={location.id} className="bg-muted">
        <TableCell colSpan={3}>{location.name}</TableCell>
        <TableCell className="text-right">{formatNumber(location.totals.quantity)}</TableCell>
        <TableCell></TableCell>
        <TableCell className="text-right">{formatCurrency(location.totals.value)}</TableCell>
      </TableRow>
      {location.categories.map(renderCategoryRow)}
    </>
  )

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Unit Cost</TableHead>
            <TableHead className="text-right">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {report.locations.map(renderLocationRow)}
          <TableRow className="bg-primary/10 font-medium">
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">{formatNumber(report.totals.quantity)}</TableCell>
            <TableCell></TableCell>
            <TableCell className="text-right">{formatCurrency(report.totals.value)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
} 
