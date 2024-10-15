import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GoodsReceiveNoteMode } from "@/lib/types";

interface TaxTabProps {
  mode: GoodsReceiveNoteMode;
  taxInvoiceNumber?: string;
  taxInvoiceDate?: Date | undefined;
  onTaxInvoiceChange: (field: string, value: string | Date) => void;
  documentTotals: {
    currency: {
      netAmount: number;
      taxAmount: number;
      totalAmount: number;
    };
    baseCurrency: {
      netAmount: number;
      taxAmount: number;
      totalAmount: number;
    };
  };
  currency: string;
  baseCurrency: string;
}

export function TaxTab({
  mode,
  taxInvoiceNumber,
  taxInvoiceDate,
  onTaxInvoiceChange,
  documentTotals,
  currency,
  baseCurrency,
}: TaxTabProps) {
  const isEditable = mode === 'edit' || mode === 'add';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tax-invoice">Tax Invoice#</Label>
          <Input
            id="tax-invoice"
            value={taxInvoiceNumber}
            onChange={(e) => onTaxInvoiceChange('taxInvoiceNumber', e.target.value)}
            readOnly={!isEditable}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tax-invoice-date">Tax Invoice Date</Label>
          <Input
            id="tax-invoice-date"
            type="date"
            value={taxInvoiceDate ? taxInvoiceDate.toISOString().split('T')[0] : ''}
            onChange={(e) => onTaxInvoiceChange('taxInvoiceDate', new Date(e.target.value))}
            readOnly={!isEditable}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Document Totals</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>{currency}</TableHead>
              <TableHead>{baseCurrency}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Net Amount</TableCell>
              <TableCell>{documentTotals.currency.netAmount.toFixed(2)}</TableCell>
              <TableCell>{documentTotals.baseCurrency.netAmount.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Tax Amount</TableCell>
              <TableCell>{documentTotals.currency.taxAmount.toFixed(2)}</TableCell>
              <TableCell>{documentTotals.baseCurrency.taxAmount.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">Total Amount</TableCell>
              <TableCell className="font-semibold">{documentTotals.currency.totalAmount.toFixed(2)}</TableCell>
              <TableCell className="font-semibold">{documentTotals.baseCurrency.totalAmount.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
