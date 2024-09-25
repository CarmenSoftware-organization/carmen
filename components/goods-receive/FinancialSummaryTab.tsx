import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { GoodsReceiveNoteMode, FinancialSummary, JournalEntryDetail } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface FinancialSummaryTabProps {
  mode: GoodsReceiveNoteMode
  summary: FinancialSummary
}

// Sample JV Detail data
const sampleJVDetail: JournalEntryDetail[] = [
  {
    department: { id: "DEPT-001", name: "Purchasing" },
    accountCode: { id: "ACC-001", code: "1000", name: "Inventory" },
    accountName: "Inventory",
    currency: "USD",
    debit: 10000.00,
    credit: 0,
    baseCurrency: "USD",
    baseDebit: 10000.00,
    baseCredit: 0
  },
  {
    department: { id: "DEPT-001", name: "Purchasing" },
    accountCode: { id: "ACC-002", code: "2000", name: "Accounts Payable" },
    accountName: "Accounts Payable",
    currency: "USD",
    debit: 0,
    credit: 9000.00,
    baseCurrency: "USD",
    baseDebit: 0,
    baseCredit: 9000.00
  },
  {
    department: { id: "DEPT-002", name: "Finance" },
    accountCode: { id: "ACC-003", code: "2200", name: "VAT Payable" },
    accountName: "VAT Payable",
    currency: "USD",
    debit: 0,
    credit: 1000.00,
    baseCurrency: "USD",
    baseDebit: 0,
    baseCredit: 1000.00
  },
  {
    department: { id: "DEPT-003", name: "Warehouse" },
    accountCode: { id: "ACC-004", code: "5000", name: "Freight In" },
    accountName: "Freight In",
    currency: "USD",
    debit: 500.00,
    credit: 0,
    baseCurrency: "USD",
    baseDebit: 500.00,
    baseCredit: 0
  },
  {
    department: { id: "DEPT-003", name: "Warehouse" },
    accountCode: { id: "ACC-002", code: "2000", name: "Accounts Payable" },
    accountName: "Accounts Payable - Freight",
    currency: "USD",
    debit: 0,
    credit: 500.00,
    baseCurrency: "USD",
    baseDebit: 0,
    baseCredit: 500.00
  }
];

export function FinancialSummaryTab({ mode, summary }: FinancialSummaryTabProps) {
  // Use the sample data if no JV detail is provided
  const jvDetail = summary.jvDetail && summary.jvDetail.length > 0 ? summary.jvDetail : sampleJVDetail;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">JV Type</label>
            <Input value={summary.jvType} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">JV Number</label>
            <Input value={summary.jvNumber} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">JV Date</label>
            <Input type="date" value={summary.jvDate.toISOString().split('T')[0]} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">JV Status</label>
            <Input value={summary.jvStatus} readOnly />
          </div>
          <div className="col-span-4">
            <label className="block text-sm font-medium text-gray-700">JV Description</label>
            <Textarea value={summary.jvDescription} readOnly />
          </div>
          <div className="col-span-4">
            <label className="block text-sm font-medium text-gray-700">JV Reference</label>
            <Input value={summary.jvReference} readOnly />
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">JV Detail</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Account Code</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Debit</TableHead>
                <TableHead>Credit</TableHead>
                <TableHead>Base Currency</TableHead>
                <TableHead>Base Debit</TableHead>
                <TableHead>Base Credit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jvDetail.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{entry.department.name}</TableCell>
                  <TableCell>{entry.accountCode.code}</TableCell>
                  <TableCell>{entry.accountName}</TableCell>
                  <TableCell>{entry.currency}</TableCell>
                  <TableCell>{entry.debit.toFixed(2)}</TableCell>
                  <TableCell>{entry.credit.toFixed(2)}</TableCell>
                  <TableCell>{entry.baseCurrency}</TableCell>
                  <TableCell>{entry.baseDebit.toFixed(2)}</TableCell>
                  <TableCell>{entry.baseCredit.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {summary.jvTotal && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold">JV Total</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p>Debit: {summary.jvTotal.debit.toFixed(2)} {summary.currency}</p>
              </div>
              <div>
                <p>Credit: {summary.jvTotal.credit.toFixed(2)} {summary.currency}</p>
              </div>
              <div>
                <p>Base Debit: {summary.jvTotal.baseDebit.toFixed(2)} {summary.baseCurrency}</p>
              </div>
              <div>
                <p>Base Credit: {summary.jvTotal.baseCredit.toFixed(2)} {summary.baseCurrency}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}