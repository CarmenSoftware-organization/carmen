"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Printer, FileDown, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import StatusBadge from "@/components/ui/custom-status-badge"
import { PurchaseOrder } from "@/lib/types"

interface PurchaseOrderCardViewProps {
  data: PurchaseOrder[]
  selectedIds: string[]
  onSelectionChange: (id: string, selected: boolean) => void
}

export function PurchaseOrderCardView({ 
  data, 
  selectedIds, 
  onSelectionChange 
}: PurchaseOrderCardViewProps) {
  const router = useRouter()

  const handleCardClick = (po: PurchaseOrder) => {
    router.push(`/procurement/purchase-orders/${po.poId}`)
  }

  if (data.length === 0) {
    return (
      <div className="col-span-full h-48 flex flex-col items-center justify-center text-muted-foreground">
        <div className="text-center">
          <h3 className="text-sm font-semibold">No purchase orders found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search or filter criteria
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((po) => (
        <Card 
          key={po.poId} 
          className="group overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer border-border/50 hover:border-border"
          onClick={() => handleCardClick(po)}
        >
          <CardHeader className="pb-3 bg-muted/30 border-b">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <Checkbox 
                  checked={selectedIds.includes(po.poId)} 
                  onCheckedChange={(checked) => {
                    onSelectionChange(po.poId, checked as boolean)
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <Link 
                    href={`/procurement/purchase-orders/${po.poId}`}
                    className="text-sm font-semibold text-primary hover:text-primary/80 hover:underline block truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {po.number}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1">
                    {po.orderDate.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={po.status} />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-4 pb-3">
            <div className="space-y-4">
              {/* Vendor Information */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Vendor
                </p>
                <p className="font-medium text-xs">{po.vendorName}</p>
              </div>
              
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Delivery Date
                  </p>
                  <p className="text-xs font-medium">
                    {po.DeliveryDate ? po.DeliveryDate.toLocaleDateString() : "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Currency
                  </p>
                  <p className="text-xs font-medium">{po.currencyCode}</p>
                </div>
              </div>
              
              {/* Financial Information */}
              <div className="pt-3 border-t border-border/50">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Net Amount
                    </p>
                    <p className="text-xs font-medium">
                      {po.netAmount.toLocaleString(undefined, { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2 
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Tax Amount
                    </p>
                    <p className="text-xs font-medium">
                      {po.taxAmount.toLocaleString(undefined, { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2 
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Total Amount
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {po.totalAmount.toLocaleString(undefined, { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2 
                      })}
                    </p>
                  </div>
                  
                  {/* Actions */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Printer className="mr-2 h-3 w-3" />
                          <span className="text-xs">Print</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileDown className="mr-2 h-3 w-3" />
                          <span className="text-xs">Download PDF</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-3 w-3" />
                          <span className="text-xs">Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}