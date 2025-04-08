import React from 'react'
import { PurchaseOrder } from '@/lib/types'


interface VendorInfoTabProps {
  poData: PurchaseOrder;
}

export default function VendorInfoTab({ poData }: VendorInfoTabProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Vendor Information</h2>
      {/* Add vendor information fields here */}
      <p>Vendor: {poData.vendorName}</p>
      <p>Email: {poData.email}</p>
      {/* Add more vendor details as needed */}
    </div>
  )
}
