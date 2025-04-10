import React from "react"
import { EligiblePRList } from "./components/eligible-pr-list"

export default function VendorComparisonPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Vendor Comparison</h1>
      </div>
      
      <div className="mt-6">
        <EligiblePRList />
      </div>
    </div>
  )
}