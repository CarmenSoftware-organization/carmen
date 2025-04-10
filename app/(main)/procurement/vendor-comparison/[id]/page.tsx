"use client"

import React from "react"
import { VendorComparisonTable } from "../components/vendor-comparison-table"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface VendorComparisonDetailPageProps {
  params: {
    id: string
  }
}

export default function VendorComparisonDetailPage({ params }: VendorComparisonDetailPageProps) {
  const router = useRouter()
  const { id } = params
  
  const handleBack = () => {
    router.back()
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          className="p-0 mr-4"
          onClick={handleBack}
        >
          ← Back to Purchase Requests
        </Button>
      </div>
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Vendor Comparison: PR-{id}
        </h1>
      </div>
      
      <VendorComparisonTable prId={id} />
    </div>
  )
} 