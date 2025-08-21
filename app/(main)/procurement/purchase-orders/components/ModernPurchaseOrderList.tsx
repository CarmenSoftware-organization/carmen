"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, ChevronDown, FileDown, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import ListPageTemplate from "@/components/templates/ListPageTemplate"
import { Mock_purchaseOrders } from "@/lib/mock/mock_purchaseOrder"
import { PurchaseOrder, PurchaseRequest } from "@/lib/types"
import CreatePOFromPR from "./createpofrompr"
import { purchaseOrderColumns } from "./purchase-orders-columns"
import { PurchaseOrdersDataTable } from "./purchase-orders-data-table"
import { PurchaseOrderCardView } from "./purchase-orders-card-view"

export function ModernPurchaseOrderList() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"table" | "card">("table")
  const [selectedPOs, setSelectedPOs] = useState<string[]>([])
  const [showCreateFromPRDialog, setShowCreateFromPRDialog] = useState(false)

  // Filter the data based on table state
  const data = useMemo(() => Mock_purchaseOrders, [])

  const handleSelectPO = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPOs([...selectedPOs, id])
    } else {
      setSelectedPOs(selectedPOs.filter((poId) => poId !== id))
    }
  }

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

  // Action buttons
  const actionButtons = (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
            <Plus className="mr-2 h-4 w-4" /> New Purchase Order
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push("/procurement/purchase-orders/create")}>
            Create Blank PO
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowCreateFromPRDialog(true)}>
            Create from Purchase Requests
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="outline">
        <FileDown className="mr-2 h-4 w-4" />
        Export
      </Button>
      <Button variant="outline">
        <Printer className="mr-2 h-4 w-4" />
        Print
      </Button>
    </>
  )

  // Bulk Actions component
  const bulkActions = selectedPOs.length > 0 ? (
    <div className="flex items-center p-3 bg-muted/50 rounded-lg border">
      <span className="text-sm font-medium mr-4">
        {selectedPOs.length} purchase order{selectedPOs.length === 1 ? '' : 's'} selected
      </span>
      <div className="flex flex-wrap gap-2">
        <Button variant="default" size="sm">
          Send Selected
        </Button>
        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
          Delete Selected
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setSelectedPOs([])}
        >
          Clear Selection
        </Button>
      </div>
    </div>
  ) : null

  // Render card view for data table
  const renderCardView = () => (
    <PurchaseOrderCardView
      data={data}
      selectedIds={selectedPOs}
      onSelectionChange={handleSelectPO}
    />
  )

  // Main content with data table
  const content = (
    <PurchaseOrdersDataTable
      columns={purchaseOrderColumns}
      data={data}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
    />
  )

  return (
    <>
      <ListPageTemplate
        title="Purchase Orders"
        actionButtons={actionButtons}
        bulkActions={bulkActions}
        content={content}
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
    </>
  )
}