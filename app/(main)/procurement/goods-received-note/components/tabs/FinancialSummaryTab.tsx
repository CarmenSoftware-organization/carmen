import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table'
import { GoodsReceiveNoteMode, FinancialSummary } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface FinancialSummaryTabProps {
  mode: GoodsReceiveNoteMode
  summary: FinancialSummary | null,
  currency: string,
  baseCurrency: string,
}
interface JVDetail {
  department: {
    name: string
  }
  accountCode: {
    code: string
  }
  accountName: string
  currency: string
  debit: number
  credit: number
  baseDebit: number
  baseCredit: number
}
interface JVDetailTotals {
  debit: number
  credit: number
  baseDebit: number
  baseCredit: number
  currency: string
  baseCurrency: string
}


export function FinancialSummaryTab({ mode, summary, currency, baseCurrency }: FinancialSummaryTabProps) {
  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No financial summary available</p>
        </CardContent>
      </Card>
    )
  }

  const jvDetailTotals: JVDetailTotals = summary.jvDetail?.reduce(
    (acc, entry) => ({
      debit: acc.debit + entry.debit,
      credit: acc.credit + entry.credit,
      baseDebit: acc.baseDebit + entry.baseDebit,
      baseCredit: acc.baseCredit + entry.baseCredit,
      currency: entry.currency,
      baseCurrency: entry.baseCurrency,
    }),
    { debit: 0, credit: 0, baseDebit: 0, baseCredit: 0, currency, baseCurrency }
  ) || { debit: 0, credit: 0, baseDebit: 0, baseCredit: 0, currency, baseCurrency };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-4 mb-6">
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
          <div>
            <label className="block text-sm font-medium text-gray-700">JV Reference</label>
            <Input value={summary.jvReference} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Currency</label>
            <Input value={currency} readOnly />
          </div>
          <div className="col-span-6">
            <label className="block text-sm font-medium text-gray-700">JV Description</label>
            <Textarea value={summary.jvDescription} readOnly />
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
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead>Base Currency</TableHead>
                <TableHead className="text-right">Base Debit</TableHead>
                <TableHead className="text-right">Base Credit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.jvDetail?.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{entry.department?.name}</TableCell>
                  <TableCell>{entry.accountCode?.code}</TableCell>
                  <TableCell>{entry.accountName}</TableCell>
                  <TableCell>{entry.currency}</TableCell>
                  <TableCell className="text-right">{entry.debit.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{entry.credit.toFixed(2)}</TableCell>
                  <TableCell>{entry.baseCurrency}</TableCell>
                  <TableCell className="text-right">{entry.baseDebit.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{entry.baseCredit.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="font-medium">Total</TableCell>
                <TableCell className="text-right font-medium">{jvDetailTotals.debit.toFixed(2)}</TableCell>
                <TableCell className="text-right font-medium">{jvDetailTotals.credit.toFixed(2)}</TableCell>
                <TableCell>{jvDetailTotals.currency}</TableCell>
                <TableCell className="text-right font-medium">{jvDetailTotals.baseDebit.toFixed(2)}</TableCell>
                <TableCell className="text-right font-medium">{jvDetailTotals.baseCredit.toFixed(2)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        {/* <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">JV Total</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Total</TableCell>
                <TableCell>{currency}</TableCell>
                <TableCell className="text-right">{summary.jvTotal.debit.toFixed(2)}</TableCell>
                <TableCell className="text-right">{summary.jvTotal.credit.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow className="text-xs text-muted-foreground">
                <TableCell className="font-semibold">Base Total</TableCell>
                <TableCell>{baseCurrency}</TableCell>
                <TableCell className="text-right">{summary.jvTotal.baseDebit.toFixed(2)}</TableCell>
                <TableCell className="text-right">{summary.jvTotal.baseCredit.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div> */}
      </CardContent>
    </Card>
  )
}
