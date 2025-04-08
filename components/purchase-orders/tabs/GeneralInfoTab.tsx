import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"


interface PurchaseOrderGeneralData {
  id: string
  date: string
  deliveryDate: string
  status: string
  description: string
  buyer: string
  vendor: string
  currency: string
  creditTerms: string
  remarks: string
}

interface GeneralInfoTabProps {
  poData?: PurchaseOrderGeneralData
}

// Mock data for when no data is provided
const mockGeneralData: PurchaseOrderGeneralData = {
  id: "PO-12345",
  date: "2023-07-15",
  deliveryDate: "2023-08-15",
  status: "Open",
  description: "Office supplies order",
  buyer: "John Smith",
  vendor: "Office Supplies Inc.",
  currency: "USD",
  creditTerms: "Net 30",
  remarks: "Please deliver to front desk"
};

export default function GeneralInfoTab({ poData }: GeneralInfoTabProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  
  // Use provided data or fallback to mock data
  const generalData = poData || mockGeneralData;

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    // Implement save functionality
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">General Information</h2>
      <form className="grid grid-cols-4 gap-4">
        <div>
          <Label htmlFor="poNumber">PO Reference Number</Label>
          <Input id="poNumber" value={generalData.id} readOnly={!isEditing} />
        </div>
        <div>
          <Label htmlFor="poDate">PO Date</Label>
          <Input id="poDate" type="date" value={generalData.date} readOnly={!isEditing} />
        </div>
        <div>
          <Label htmlFor="deliveryDate">Delivery Date</Label>
          <Input id="deliveryDate" type="date" value={generalData.deliveryDate} readOnly={!isEditing} />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Input id="status" value={generalData.status} readOnly />
        </div>
        <div className="col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={generalData.description} readOnly={!isEditing} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="buyer">Buyer Information</Label>
          <Input id="buyer" value={generalData.buyer} readOnly={!isEditing} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="vendor">Vendor Information</Label>
          <Input id="vendor" value={generalData.vendor} readOnly={!isEditing} />
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" value={generalData.currency} readOnly={!isEditing} />
        </div>
        <div>
          <Label htmlFor="creditTerms">Credit Terms</Label>
          <Input id="creditTerms" value={generalData.creditTerms} readOnly={!isEditing} />
        </div>
        <div className="col-span-4">
          <Label htmlFor="remarks">Remarks</Label>
          <Textarea id="remarks" value={generalData.remarks} readOnly={!isEditing} />
        </div>
      </form>
      {isEditing ? (
        <div className="mt-4 space-x-2">
          <Button onClick={handleSave}>Save</Button>
          <Button onClick={handleCancel} variant="outline">Cancel</Button>
        </div>
      ) : (
        <Button onClick={handleEdit} className="mt-4">Edit</Button>
      )}
    </div>
  )
}
