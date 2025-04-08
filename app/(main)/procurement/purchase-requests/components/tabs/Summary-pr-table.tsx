"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableHeader,
} from "@/components/ui/table"

interface SummaryPRTableProps {
  calculatedAmounts: {
    baseAmount: number
    discountAmount: number
    netAmount: number
    taxAmount: number
    totalAmount: number
  }
  summaryFooter: {
    baseSubTotalPrice: number
    subTotalPrice: number
    baseNetAmount: number
    netAmount: number
    baseDiscAmount: number
    discountAmount: number
    baseTaxAmount: number
    taxAmount: number
    baseTotalAmount: number
    totalAmount: number
  }
}

export function SummaryPRTable({ calculatedAmounts, summaryFooter }: SummaryPRTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Subtotal</TableCell>
          <TableCell className="text-right">{formatCurrency(calculatedAmounts.baseAmount)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Discount</TableCell>
          <TableCell className="text-right">{formatCurrency(calculatedAmounts.discountAmount)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Net Amount</TableCell>
          <TableCell className="text-right">{formatCurrency(calculatedAmounts.netAmount)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Tax</TableCell>
          <TableCell className="text-right">{formatCurrency(calculatedAmounts.taxAmount)}</TableCell>
        </TableRow>
        <TableRow className="font-bold">
          <TableCell>Total Amount</TableCell>
          <TableCell className="text-right">{formatCurrency(calculatedAmounts.totalAmount)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
