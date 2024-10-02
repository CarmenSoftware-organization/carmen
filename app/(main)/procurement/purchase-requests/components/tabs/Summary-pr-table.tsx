'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableHeader,
} from "@/components/ui/table";

interface SummaryPRTableProps {
  item: {
    currency: string;
    currencyRate: number;
    baseSubTotalPrice: number;
    subTotalPrice: number;
    baseNetAmount: number;
    netAmount: number;
    baseDiscAmount: number;
    discountAmount: number;
    baseTaxAmount: number;
    taxAmount: number;
    baseTotalAmount: number;
    totalAmount: number;
    discountRate: number;
    taxRate: number;
  };
  localCurrency: string;
  currentCurrency: string;
}

export default function SummaryPRTable({ item, localCurrency, currentCurrency }: SummaryPRTableProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">{localCurrency}</TableHead>
          <TableHead className="text-right">{currentCurrency}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Subtotal</TableCell>
          <TableCell className="text-right">
            <span className="text-xs">{formatCurrency(item.baseSubTotalPrice, localCurrency)}</span>
          </TableCell>
          <TableCell className="text-right">{formatCurrency(item.subTotalPrice, currentCurrency)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Discount ({item.discountRate}%)</TableCell>
          <TableCell className="text-right">
            <span className="text-xs">{formatCurrency(item.baseDiscAmount, localCurrency)}</span>
          </TableCell>
          <TableCell className="text-right">{formatCurrency(item.discountAmount, currentCurrency)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Net Amount</TableCell>
          <TableCell className="text-right">
            <span className="text-xs">{formatCurrency(item.baseNetAmount, localCurrency)}</span>
          </TableCell>
          <TableCell className="text-right">{formatCurrency(item.netAmount, currentCurrency)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Tax ({item.taxRate}%)</TableCell>
          <TableCell className="text-right">
            <span className="text-xs">{formatCurrency(item.baseTaxAmount, localCurrency)}</span>
          </TableCell>
          <TableCell className="text-right">{formatCurrency(item.taxAmount, currentCurrency)}</TableCell>
        </TableRow>
        <TableRow className="font-bold">
          <TableCell>Total Amount</TableCell>
          <TableCell className="text-right">
            <span className="text-xs">{formatCurrency(item.baseTotalAmount, localCurrency)}</span>
          </TableCell>
          <TableCell className="text-right">{formatCurrency(item.totalAmount, currentCurrency)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
