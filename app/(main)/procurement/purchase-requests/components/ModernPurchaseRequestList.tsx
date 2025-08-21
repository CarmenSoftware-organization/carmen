"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { PurchaseRequestsDataTable } from "./purchase-requests-data-table"
import { PurchaseRequestsCardView } from "./purchase-requests-card-view"
import { purchaseRequestColumns } from "./purchase-requests-columns"
import { mockPRListData } from "./mockPRListData"
import { PurchaseRequest } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Plus, Download, Printer } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModernPurchaseRequestList() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Use the existing mock data
  const data = useMemo(() => mockPRListData, [])

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    setSelectedItems(prev =>
      prev.length === data.length ? [] : data.map(item => item.id)
    )
  }

  const handleView = (pr: PurchaseRequest) => {
    router.push(`/procurement/purchase-requests/${pr.id}?id=${pr.id}&mode=view`)
  }

  const handleEdit = (pr: PurchaseRequest) => {
    router.push(`/procurement/purchase-requests/${pr.id}?id=${pr.id}&mode=edit`)
  }

  const handleApprove = (pr: PurchaseRequest) => {
    console.log("Approve PR:", pr.id)
    // Implement approve functionality
  }

  const handleReject = (pr: PurchaseRequest) => {
    console.log("Reject PR:", pr.id)
    // Implement reject functionality
  }

  const handleDelete = (pr: PurchaseRequest) => {
    console.log("Delete PR:", pr.id)
    // Implement delete functionality
  }

  const cardView = (
    <PurchaseRequestsCardView
      data={data}
      selectedItems={selectedItems}
      onSelectItem={handleSelectItem}
      onSelectAll={handleSelectAll}
      onView={handleView}
      onEdit={handleEdit}
      onApprove={handleApprove}
      onReject={handleReject}
      onDelete={handleDelete}
    />
  )

  return (
    <div className="container mx-auto py-6 px-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Purchase Requests</h1>
          <p className="text-muted-foreground">
            Manage and track all purchase requests across your organization.
          </p>
        </div>
        
        {/* Action Buttons - Top aligned with title */}
        <div className="flex items-center space-x-2 md:mt-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Purchase Request
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                Create Blank PR
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>PR Templates</DropdownMenuLabel>
              <DropdownMenuItem>Office Supplies</DropdownMenuItem>
              <DropdownMenuItem>IT Equipment</DropdownMenuItem>
              <DropdownMenuItem>Kitchen Supplies</DropdownMenuItem>
              <DropdownMenuItem>Maintenance</DropdownMenuItem>
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

      <PurchaseRequestsDataTable
        columns={purchaseRequestColumns}
        data={data}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        cardView={cardView}
      />
    </div>
  )
}