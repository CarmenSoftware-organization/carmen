import React from 'react'

interface VendorInfoTabProps {
  poData: any; // Replace 'any' with your PurchaseOrder type
}

export default function VendorInfoTab({ poData }: VendorInfoTabProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Vendor Information</h2>
      {/* Add vendor information fields here */}
      <p>Vendor: {poData.vendor}</p>
      <p>Email: {poData.email}</p>
      {/* Add more vendor details as needed */}
    </div>
  )
}