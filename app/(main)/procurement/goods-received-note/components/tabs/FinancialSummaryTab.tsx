import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { GoodsReceiveNoteMode, FinancialSummary } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

interface FinancialSummaryTabProps {
  mode: GoodsReceiveNoteMode
  summary: FinancialSummary | null
  currency: string
  baseCurrency: string
}

export function FinancialSummaryTab({ mode, summary, currency, baseCurrency }: FinancialSummaryTabProps) {
  if (!summary) return null

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Journal Entries</h3>
        <div className="text-sm text-muted-foreground mb-2">
          Source: GRN | Journal Voucher: {summary.jvNumber} | Date: {summary.jvDate.toLocaleDateString()} | Status: {summary.jvStatus}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Debit ({currency})</TableHead>
              <TableHead className="text-right">Credit ({currency})</TableHead>
              <TableHead className="text-right">Base Debit ({baseCurrency})</TableHead>
              <TableHead className="text-right">Base Credit ({baseCurrency})</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary.jvDetail?.map((entry, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div>{entry.accountName}</div>
                  <div className="text-sm text-muted-foreground">{entry.accountCode.code}</div>
                </TableCell>
                <TableCell>
                  <div>{entry.department.name}</div>
                  <div className="text-sm text-muted-foreground">ID: {entry.department.id}</div>
                </TableCell>
                <TableCell>{summary.jvDescription}</TableCell>
                <TableCell className="text-right">
                  {entry.debit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right">
                  {entry.credit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right">
                  {entry.baseDebit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right">
                  {entry.baseCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">Total Debit</div>
          <div className="font-medium">
            {summary.jvTotal.debit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">Total Credit</div>
          <div className="font-medium">
            {summary.jvTotal.credit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">Difference</div>
          <div className="font-medium">
            {(summary.jvTotal.debit - summary.jvTotal.credit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="text-sm text-green-600 font-medium">
          {summary.jvTotal.debit === summary.jvTotal.credit ? 'Balanced' : 'Unbalanced'}
        </div>
      </div>

      {/* <div className="grid grid-cols-2 gap-6 pt-4 border-t">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <Label>Net Amount:</Label>
              <span>{summary.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {currency}</span>
            </div>
            <div className="flex justify-between">
              <Label>Tax Amount:</Label>
              <span>{summary.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {currency}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <Label>Total Amount:</Label>
              <span>{summary.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {currency}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Base Currency Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <Label>Base Net Amount:</Label>
              <span>{summary.baseNetAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {baseCurrency}</span>
            </div>
            <div className="flex justify-between">
              <Label>Base Tax Amount:</Label>
              <span>{summary.baseTaxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {baseCurrency}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <Label>Base Total Amount:</Label>
              <span>{summary.baseTotalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {baseCurrency}</span>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* <div className="space-y-2 text-sm text-muted-foreground border-t pt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <div>Document Type: GRN</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <div>Reference: {summary.jvReference}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <div>Transaction Date: {summary.jvDate.toLocaleDateString()}</div>
        </div>
      </div> */}
    </div>
  )
}
