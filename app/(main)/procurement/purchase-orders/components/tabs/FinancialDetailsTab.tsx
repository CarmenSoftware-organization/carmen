import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function FinancialDetailsTab({ poData }: { poData: any }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Financial Details</h2>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <Label>Currency</Label>
          <Input value={poData.currency} readOnly />
        </div>
        <div>
          <Label>Net Amount</Label>
          <Input value={poData.netAmount} readOnly />
        </div>
        <div>
          <Label>Discount Amount</Label>
          <Input value={poData.discountAmount} readOnly />
        </div>
        <div>
          <Label>Tax Amount</Label>
          <Input value={poData.taxAmount} readOnly />
        </div>
        <div>
          <Label>Total Amount</Label>
          <Input value={poData.totalAmount} readOnly />
        </div>
        <div>
          <Label>Payment Terms</Label>
          <Input value={poData.paymentTerms} readOnly />
        </div>
        <div>
          <Label>Payment Method</Label>
          <Input value={poData.paymentMethod} readOnly />
        </div>
        <div>
          <Label>Due Date</Label>
          <Input value={poData.dueDate} readOnly />
        </div>
      </div>
      <div className="mt-4">
        <Button>Edit Financial Details</Button>
      </div>
    </div>
  )
}
