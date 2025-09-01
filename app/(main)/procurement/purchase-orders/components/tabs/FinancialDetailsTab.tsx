import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function FinancialDetailsTab({ poData }: { poData: any }) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm sm:text-lg lg:text-xl font-semibold">Financial Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div>
          <Label className="text-xs sm:text-sm">Currency</Label>
          <Input value={poData.currency} readOnly className="h-8 text-xs sm:text-sm" />
        </div>
        <div>
          <Label className="text-xs sm:text-sm">Net Amount</Label>
          <Input value={poData.netAmount} readOnly className="h-8 text-xs sm:text-sm" />
        </div>
        <div>
          <Label className="text-xs sm:text-sm">Discount Amount</Label>
          <Input value={poData.discountAmount} readOnly className="h-8 text-xs sm:text-sm" />
        </div>
        <div>
          <Label className="text-xs sm:text-sm">Tax Amount</Label>
          <Input value={poData.taxAmount} readOnly className="h-8 text-xs sm:text-sm" />
        </div>
        <div>
          <Label className="text-xs sm:text-sm">Total Amount</Label>
          <Input value={poData.totalAmount} readOnly className="h-8 text-xs sm:text-sm" />
        </div>
        <div>
          <Label className="text-xs sm:text-sm">Payment Terms</Label>
          <Input value={poData.paymentTerms} readOnly className="h-8 text-xs sm:text-sm" />
        </div>
        <div>
          <Label className="text-xs sm:text-sm">Payment Method</Label>
          <Input value={poData.paymentMethod} readOnly className="h-8 text-xs sm:text-sm" />
        </div>
        <div>
          <Label className="text-xs sm:text-sm">Due Date</Label>
          <Input value={poData.dueDate} readOnly className="h-8 text-xs sm:text-sm" />
        </div>
      </div>
      <div className="mt-3 sm:mt-4">
        <Button className="h-8 px-3 text-xs sm:text-sm">Edit Financial Details</Button>
      </div>
    </div>
  )
}
