'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { JournalEntry } from "../types"

interface JournalTableProps {
  entries: JournalEntry[]
}

export function JournalTable({ entries }: JournalTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[250px]">Account</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Reference</TableHead>
          <TableHead className="text-right">Debit</TableHead>
          <TableHead className="text-right">Credit</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id} className="hover:bg-muted/50">
            <TableCell>
              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium">{entry.accountName}</div>
                <div className="text-xs text-muted-foreground">{entry.account}</div>
              </div>
            </TableCell>
            <TableCell>{entry.department}</TableCell>
            <TableCell>{entry.reference}</TableCell>
            <TableCell className="text-right">
              {entry.debit > 0 ? entry.debit.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
              }) : ''}
            </TableCell>
            <TableCell className="text-right">
              {entry.credit > 0 ? entry.credit.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
              }) : ''}
            </TableCell>
          </TableRow>
        ))}
        <TableRow className="hover:bg-transparent border-t-2">
          <TableCell colSpan={3} className="font-medium">Total</TableCell>
          <TableCell className="text-right font-medium">
            {entries.reduce((sum, entry) => sum + entry.debit, 0).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD'
            })}
          </TableCell>
          <TableCell className="text-right font-medium">
            {entries.reduce((sum, entry) => sum + entry.credit, 0).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD'
            })}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
