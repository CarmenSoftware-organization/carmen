import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GoodsReceiveNoteMode } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaxTabProps {
  mode: GoodsReceiveNoteMode;
  taxInvoiceNumber?: string;
  taxInvoiceDate?: Date | undefined;
  taxStatus?: string;
  taxPeriod?: string;
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
  taxStatus,
  taxPeriod,
  onTaxInvoiceChange,
  documentTotals,
  currency,
  baseCurrency,
}: TaxTabProps) {
  const isEditable = mode === 'edit' || mode === 'add';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
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
        <div className="space-y-2">
          <Label htmlFor="tax-status">Tax Status</Label>
          <Select
            disabled={!isEditable}
            value={taxStatus}
            onValueChange={(value) => onTaxInvoiceChange('taxStatus', value)}
          >
            <SelectTrigger id="tax-status">
              <SelectValue placeholder="Select tax status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="exempt">Exempt</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tax-period">Tax Period</Label>
          <Input
            id="tax-period"
            value={taxPeriod}
            onChange={(e) => onTaxInvoiceChange('taxPeriod', e.target.value)}
            readOnly={!isEditable}
            placeholder="e.g., Q2 2023"
          />
        </div>
      </div>

      <div>
        {/* <h3 className="text-lg font-semibold mb-2">Tax Invoice Totals</h3> */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Net Amount</TableHead>
              <TableHead className="text-right">Tax Amount</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Base Amount ({baseCurrency})</TableCell>
              <TableCell className="text-right text-xs">{documentTotals.baseCurrency.netAmount.toFixed(2)}</TableCell>
              <TableCell className="text-right text-xs">{documentTotals.baseCurrency.taxAmount.toFixed(2)}</TableCell>
              <TableCell className="font-semibold text-right text-xs">{documentTotals.baseCurrency.totalAmount.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
