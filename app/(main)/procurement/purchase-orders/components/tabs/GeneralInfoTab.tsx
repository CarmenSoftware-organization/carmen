import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PurchaseOrder } from '@/lib/types'

interface GeneralInfoTabProps {
  poData: PurchaseOrder;
}

export default function GeneralInfoTab({ poData }: GeneralInfoTabProps) {
  const [isEditing, setIsEditing] = React.useState(false)

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
          <Input id="poNumber" value={poData.poId} readOnly={!isEditing} />
        </div>
        <div>
          <Label htmlFor="poDate">PO Date</Label>
          <Input 
            id="poDate" 
            type="date" 
            value={poData.orderDate ? poData.orderDate.toISOString().substring(0, 10) : ''} 
            readOnly={!isEditing} 
          />
        </div>
        <div>
          <Label htmlFor="deliveryDate">Delivery Date</Label>
          <Input 
            id="deliveryDate" 
            type="date" 
            value={poData.DeliveryDate ? poData.DeliveryDate.toISOString().substring(0, 10) : ''} 
            readOnly={!isEditing} 
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Input id="status" value={poData.status} readOnly />
        </div>
        <div className="col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={poData.description} readOnly={!isEditing} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="buyer">Buyer Information</Label>
          <Input id="buyer" value={poData.buyer} readOnly={!isEditing} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="vendor">Vendor Information</Label>
          <Input id="vendor" value={poData.vendorName} readOnly={!isEditing} />
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" value={poData.currencyCode} readOnly={!isEditing} />
        </div>
        <div>
          <Label htmlFor="creditTerms">Credit Terms</Label>
          <Input id="creditTerms" value={poData.creditTerms} readOnly={!isEditing} />
        </div>
        <div className="col-span-4">
          <Label htmlFor="remarks">Remarks</Label>
          <Textarea id="remarks" value={poData.remarks} readOnly={!isEditing} />
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
