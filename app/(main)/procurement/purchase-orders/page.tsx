"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, ChevronDown, Download, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Mock_purchaseOrders } from "@/lib/mock/mock_purchaseOrder"
import { PurchaseRequest } from "@/lib/types"
import CreatePOFromPR from "./components/createpofrompr"
import { purchaseOrderColumns } from "./components/purchase-orders-columns"
import { PurchaseOrdersDataTable } from "./components/purchase-orders-data-table"
import { PurchaseOrderCardView } from "./components/purchase-orders-card-view"

export default function PurchaseOrdersPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"table" | "card">("table")
  const [selectedPOs, setSelectedPOs] = useState<string[]>([])
  const [showCreateFromPRDialog, setShowCreateFromPRDialog] = useState(false)

  const handleSelectPRs = (selectedPRs: PurchaseRequest[]) => {
    setShowCreateFromPRDialog(false)
    
    if (selectedPRs.length > 0) {
      // Group PRs by vendor and currency - each group becomes a separate PO
      const groupedPRs = selectedPRs.reduce((groups, pr) => {
        const key = `${pr.vendor}-${pr.currency}`
        if (!groups[key]) {
          groups[key] = {
            vendor: pr.vendor,
            vendorId: pr.vendorId,
            currency: pr.currency,
            prs: [],
            totalAmount: 0
          }
        }
        groups[key].prs.push(pr)
        groups[key].totalAmount += pr.totalAmount
        return groups
      }, {} as Record<string, { 
        vendor: string
        vendorId: number
        currency: string
        prs: PurchaseRequest[]
        totalAmount: number 
      }>)

      // Store grouped PRs for PO creation
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('groupedPurchaseRequests', JSON.stringify(groupedPRs))
          localStorage.setItem('selectedPurchaseRequests', JSON.stringify(selectedPRs))
        }
      } catch (error) {
        console.error('Error storing grouped PRs:', error)
      }
      
      // Navigate to PO creation page with grouped data
      const groupCount = Object.keys(groupedPRs).length
      if (groupCount === 1) {
        router.push('/procurement/purchase-orders/create?mode=fromPR&grouped=true')
      } else {
        router.push('/procurement/purchase-orders/create?mode=fromPR&grouped=true&bulk=true')
      }
    }
  }

  return (
    <div className="container mx-auto py-6 px-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all purchase orders from creation to fulfillment
          </p>
        </div>
        
        {/* Action Buttons - Top aligned with title */}
        <div className="flex items-center space-x-2 md:mt-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Purchase Order
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push("/procurement/purchase-orders/create")}>
                Create Blank PO
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>PO Templates</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setShowCreateFromPRDialog(true)}>
                Create from Purchase Requests
              </DropdownMenuItem>
              <DropdownMenuItem>Create from Template</DropdownMenuItem>
              <DropdownMenuItem>Create Recurring PO</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Data Table with integrated filtering */}
      <PurchaseOrdersDataTable
        columns={purchaseOrderColumns}
        data={Mock_purchaseOrders}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        cardView={<PurchaseOrderCardView data={Mock_purchaseOrders} selectedIds={selectedPOs} onSelectionChange={() => {}} />}
      />
      
      <Dialog 
        open={showCreateFromPRDialog} 
        onOpenChange={(open) => {
          if (!open) setShowCreateFromPRDialog(false)
        }}
      >
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Create PO from Purchase Requests</DialogTitle>
          </DialogHeader>
          <div className="py-4 flex-1 min-h-0 overflow-auto">
            <CreatePOFromPR onSelectPRs={handleSelectPRs} />
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateFromPRDialog(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
