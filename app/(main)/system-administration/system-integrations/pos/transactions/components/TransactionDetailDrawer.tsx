"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Check,
  X,
  RefreshCcw,
  FileText,
  Package,
  AlertTriangle,
  Clock,
  User,
  MapPin,
} from "lucide-react"

import type {
  PendingTransaction,
  POSTransaction,
  TransactionStatus,
  InventoryImpact,
} from "@/lib/types/pos-integration"

interface TransactionDetailDrawerProps {
  transaction: PendingTransaction | POSTransaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onApprove?: (transactionId: string) => void
  onReject?: (transactionId: string) => void
  onRetry?: (transactionId: string) => void
}

// Status badge component
function StatusBadge({ status }: { status: TransactionStatus }) {
  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case "pending_approval":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "success":
        return "bg-green-100 text-green-800 border-green-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      case "manually_resolved":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusLabel = (status: TransactionStatus) => {
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
      {getStatusLabel(status)}
    </span>
  )
}

// Inventory Impact badge component
function InventoryImpactBadge({ impact }: { impact: InventoryImpact }) {
  const getImpactColor = (impact: InventoryImpact) => {
    switch (impact) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getImpactIcon = (impact: InventoryImpact) => {
    switch (impact) {
      case "low":
        return <Package className="h-3 w-3" />
      case "medium":
        return <Package className="h-3 w-3" />
      case "high":
        return <AlertTriangle className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getImpactColor(impact)}`}>
      {getImpactIcon(impact)}
      {impact.charAt(0).toUpperCase() + impact.slice(1)} Impact
    </span>
  )
}

export function TransactionDetailDrawer({
  transaction,
  open,
  onOpenChange,
  onApprove,
  onReject,
  onRetry,
}: TransactionDetailDrawerProps) {
  // Format date
  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(dateObj)
  }

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  // Check if transaction is pending
  const isPending = (txn: PendingTransaction | POSTransaction | null): txn is PendingTransaction => {
    return txn?.status === 'pending_approval'
  }

  // Check if transaction is failed
  const isFailed = (txn: PendingTransaction | POSTransaction | null): boolean => {
    return txn?.status === 'failed'
  }

  if (!transaction) {
    return null
  }

  const pendingTransaction = isPending(transaction) ? transaction : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Transaction Details</span>
            <StatusBadge status={transaction.status} />
          </SheetTitle>
          <SheetDescription>
            {transaction.transactionId} • {transaction.externalId}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Transaction Header Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Transaction Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{formatDate(transaction.date)}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{transaction.location.name}</p>
                  </div>
                </div>

                {pendingTransaction && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Requester</p>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm">{pendingTransaction.requester.name}</p>
                        <p className="text-xs text-muted-foreground">{pendingTransaction.requester.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">POS System</p>
                  <p className="text-sm">{transaction.posSystem.name}</p>
                  {transaction.posSystem.version && (
                    <p className="text-xs text-muted-foreground">v{transaction.posSystem.version}</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(transaction.totalAmount.amount, transaction.totalAmount.currency)}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Item Count</p>
                  <p className="text-lg font-semibold">{transaction.itemCount} items</p>
                </div>

                {pendingTransaction && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Inventory Impact</p>
                    <InventoryImpactBadge impact={pendingTransaction.inventoryImpact} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          {pendingTransaction && pendingTransaction.lineItems && pendingTransaction.lineItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Line Items</CardTitle>
                <CardDescription>Items in this transaction and their inventory impact</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingTransaction.lineItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{item.posItemName}</h4>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(item.totalPrice.amount, item.totalPrice.currency)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(item.unitPrice.amount, item.unitPrice.currency)} × {item.quantity}
                          </p>
                        </div>
                      </div>

                      {item.mappedRecipe && (
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <p className="text-sm font-medium text-green-900 mb-2">
                            Mapped Recipe: {item.mappedRecipe.name}
                          </p>

                          {item.inventoryDeduction && item.inventoryDeduction.ingredients && (
                            <Accordion type="single" collapsible>
                              <AccordionItem value="ingredients" className="border-0">
                                <AccordionTrigger className="py-2 text-sm text-green-900">
                                  View Inventory Deductions ({item.inventoryDeduction.ingredients.length} ingredients)
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-2 mt-2">
                                    {item.inventoryDeduction.ingredients.map((ing, idx) => (
                                      <div key={idx} className="flex justify-between text-sm">
                                        <div>
                                          <p className="font-medium">{ing.name}</p>
                                          <p className="text-xs text-muted-foreground">{ing.location}</p>
                                        </div>
                                        <div className="text-right">
                                          <p>{ing.quantity} {ing.unit}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {formatCurrency(ing.cost.amount, ing.cost.currency)}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          )}
                        </div>
                      )}

                      {!item.mappedRecipe && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                          <p className="text-sm text-yellow-900">
                            <AlertTriangle className="h-4 w-4 inline mr-1" />
                            No recipe mapping found for this item
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Approval Notes (if any) */}
          {pendingTransaction && pendingTransaction.approvalNotes && pendingTransaction.approvalNotes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Approval Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingTransaction.approvalNotes.map((note, idx) => (
                    <div key={idx} className="border-l-2 border-blue-500 pl-3 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{note.user}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(note.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{note.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Audit Log */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{formatDate(transaction.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created By</span>
                  <span>{transaction.createdBy}</span>
                </div>
                {transaction.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span>{formatDate(transaction.updatedAt)}</span>
                  </div>
                )}
                {transaction.updatedBy && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updated By</span>
                    <span>{transaction.updatedBy}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {isPending(transaction) && onApprove && onReject && (
              <>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => onApprove(transaction.id)}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => onReject(transaction.id)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </>
            )}

            {isFailed(transaction) && onRetry && (
              <Button
                variant="default"
                className="flex-1"
                onClick={() => onRetry(transaction.id)}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Retry Transaction
              </Button>
            )}

            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
