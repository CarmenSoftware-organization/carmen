import React from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"


interface PurchaseOrderFinancialData {
  currency: string
  netAmount: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  paymentTerms: string
  paymentMethod: string
  dueDate: string
}

interface FinancialDetailsTabProps {
  poData?: PurchaseOrderFinancialData
}

// Mock data to use when no data is provided
const mockFinancialData: PurchaseOrderFinancialData = {
  currency: "USD",
  netAmount: 1500.00,
  discountAmount: 150.00,
  taxAmount: 135.00,
  totalAmount: 1485.00,
  paymentTerms: "Net 30",
  paymentMethod: "Bank Transfer",
  dueDate: "2023-08-15"
};

export default function FinancialDetailsTab({ poData }: FinancialDetailsTabProps) {
  // Use provided data or fallback to mock data
  const financialData = poData || mockFinancialData;
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Financial Details</h2>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <Label>Currency</Label>
          <Input value={financialData.currency} readOnly />
        </div>
        <div>
          <Label>Net Amount</Label>
          <Input value={financialData.netAmount} readOnly />
        </div>
        <div>
          <Label>Discount Amount</Label>
          <Input value={financialData.discountAmount} readOnly />
        </div>
        <div>
          <Label>Tax Amount</Label>
          <Input value={financialData.taxAmount} readOnly />
        </div>
        <div>
          <Label>Total Amount</Label>
          <Input value={financialData.totalAmount} readOnly />
        </div>
        <div>
          <Label>Payment Terms</Label>
          <Input value={financialData.paymentTerms} readOnly />
        </div>
        <div>
          <Label>Payment Method</Label>
          <Input value={financialData.paymentMethod} readOnly />
        </div>
        <div>
          <Label>Due Date</Label>
          <Input value={financialData.dueDate} readOnly />
        </div>
      </div>
      <div className="mt-4">
        <Button>Edit Financial Details</Button>
      </div>
    </div>
  )
}
