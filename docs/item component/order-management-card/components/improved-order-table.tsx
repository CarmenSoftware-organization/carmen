"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  FileText,
  Edit,
  Trash2,
  Check,
  X,
  ShoppingCart,
  Package,
  ChevronDown,
  Eye,
  EyeOff,
  Building2,
  Search,
  Star,
} from "lucide-react"
import { useState, useMemo } from "react"
import type { User, OrderItem } from "../types/roles"

interface ImprovedOrderTableProps {
  currentUser: User
  orders: OrderItem[]
  onOrderUpdate: (orderId: string, updates: Partial<OrderItem>) => void
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800 border-amber-200"
    case "approved":
      return "bg-emerald-100 text-emerald-800 border-emerald-200"
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200"
    case "ordered":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "received":
      return "bg-gray-100 text-gray-800 border-gray-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getPriorityColor = (status: string) => {
  switch (status) {
    case "pending":
      return "border-l-amber-400"
    case "approved":
      return "border-l-emerald-400"
    case "rejected":
      return "border-l-red-400"
    case "ordered":
      return "border-l-blue-400"
    case "received":
      return "border-l-gray-400"
    default:
      return "border-l-gray-300"
  }
}

// Available units for hotel procurement
const availableUnits = [
  "Piece",
  "Set",
  "Box",
  "Pack",
  "Bottle",
  "Case",
  "Roll",
  "Bag",
  "Carton",
  "Dozen",
  "Each",
  "Gallon",
  "Liter",
  "Pound",
  "Kilogram",
]

export default function ImprovedOrderTable({ currentUser, orders, onOrderUpdate }: ImprovedOrderTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null)
  const [editingUnit, setEditingUnit] = useState<string | null>(null)
  const [showAdvancedColumns, setShowAdvancedColumns] = useState(false)

  // Check if current user can see prices and vendor info
  const canSeePrices = currentUser.role !== "requestor"
  const canSeeVendor = currentUser.role !== "requestor"

  // Memoize filtered orders to prevent unnecessary re-renders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (currentUser.role === "requestor") {
        return order.requestorId === currentUser.id
      }
      if (currentUser.role === "department-manager") {
        return order.department === currentUser.department
      }
      return true
    })
  }, [orders, currentUser.role, currentUser.id, currentUser.department])

  const canEdit = (order: OrderItem) => {
    if (currentUser.role === "requestor") {
      return order.requestorId === currentUser.id && order.status === "pending"
    }
    return currentUser.role === "department-manager" || currentUser.role === "purchasing-staff"
  }

  const canApprove = (order: OrderItem) => {
    return (
      currentUser.role === "department-manager" &&
      order.department === currentUser.department &&
      order.status === "pending"
    )
  }

  const canOrder = (order: OrderItem) => {
    return currentUser.role === "purchasing-staff" && order.status === "approved"
  }

  const canReview = (order: OrderItem) => {
    return (order.status as any) === "received"
  }

  const handleApprove = (orderId: string) => {
    onOrderUpdate(orderId, {
      status: "approved" as any,
      approvalDate: new Date().toISOString().split("T")[0],
      approvedBy: currentUser.name,
    })
  }

  const handleReject = (orderId: string) => {
    onOrderUpdate(orderId, { status: "rejected" as any })
  }

  const handleOrder = (orderId: string) => {
    onOrderUpdate(orderId, { status: "ordered" as any })
  }

  const handleReceive = (orderId: string) => {
    onOrderUpdate(orderId, { status: "received" as any })
  }

  const handleReview = (orderId: string) => {
    // In a real app, this would open a review modal or navigate to a review page
    alert(`Opening review form for order ${orderId}`)
  }

  // Handle show/hide details toggle
  const handleToggleDetails = () => {
    const newShowAdvanced = !showAdvancedColumns
    setShowAdvancedColumns(newShowAdvanced)

    if (newShowAdvanced) {
      // Expand all cards
      const allOrderIds = new Set(filteredOrders.map((order) => order.id))
      setExpandedRows(allOrderIds)
    } else {
      // Collapse all cards
      setExpandedRows(new Set())
    }
  }

  const toggleRowExpansion = (orderId: string) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(orderId)) {
      newExpandedRows.delete(orderId)
    } else {
      newExpandedRows.add(orderId)
    }
    setExpandedRows(newExpandedRows)
  }

  const handleUnitChange = (orderId: string, newUnit: string) => {
    onOrderUpdate(orderId, { orderUnit: newUnit })
    setEditingUnit(null)
  }

  const getPrimaryAction = (order: OrderItem) => {
    if (canApprove(order)) {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => handleApprove(order.id)}
          >
            <Check className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50 bg-transparent"
            onClick={() => handleReject(order.id)}
          >
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </div>
      )
    }

    if (canOrder(order)) {
      return (
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleOrder(order.id)}>
          <ShoppingCart className="h-4 w-4 mr-1" />
          Order Now
        </Button>
      )
    }

    if (currentUser.role === "purchasing-staff" && (order.status as any) === "ordered") {
      return (
        <Button
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white"
          onClick={() => handleReceive(order.id)}
        >
          <Package className="h-4 w-4 mr-1" />
          Mark Received
        </Button>
      )
    }

    if (canReview(order)) {
      return (
        <Button
          size="sm"
          className="bg-orange-600 hover:bg-orange-700 text-white"
          onClick={() => handleReview(order.id)}
        >
          <Star className="h-4 w-4 mr-1" />
          Review
        </Button>
      )
    }

    return null
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">
              {currentUser.role === "requestor"
                ? "My Requests"
                : currentUser.role === "department-manager"
                  ? `${currentUser.department} Department Orders`
                  : "All Orders"}
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1">
                {filteredOrders.length} orders
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleDetails}
                className="flex items-center gap-2 bg-transparent"
              >
                {showAdvancedColumns ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showAdvancedColumns ? "Hide Details" : "Show Details"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.map((order) => (
          <Card
            key={order.id}
            className={`border-l-4 ${getPriorityColor(order.status)} hover:shadow-md transition-shadow`}
          >
            <CardContent className="p-6">
              {/* Main Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Checkbox />

                  {/* Product Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{order.product}</h3>
                      <Badge className={getStatusBadgeColor(order.status)} variant="outline">
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{order.productDescription}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>📍 {order.location}</span>
                      <span>📅 {order.requestDate}</span>
                      <span className="flex items-center gap-1">
                        <Search className="h-3 w-3" />
                        SKU: {order.sku}
                      </span>
                      {/* Show vendor for non-requestors */}
                      {canSeeVendor && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {order.vendor}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="flex items-center gap-6">
                  {/* Quantity with Editable Unit */}
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Requested</div>
                    <div className="flex items-center gap-1">
                      {canEdit(order) && editingQuantity === order.id ? (
                        <Input
                          type="number"
                          value={order.requestQuantity}
                          onChange={(e) => onOrderUpdate(order.id, { requestQuantity: Number(e.target.value) })}
                          onBlur={() => setEditingQuantity(null)}
                          onKeyDown={(e) => e.key === "Enter" && setEditingQuantity(null)}
                          className="w-16 text-center"
                          min="1"
                          autoFocus
                        />
                      ) : (
                        <div
                          className={`text-lg font-semibold ${canEdit(order) ? "cursor-pointer hover:bg-gray-100 rounded px-2 py-1" : ""}`}
                          onClick={() => canEdit(order) && setEditingQuantity(order.id)}
                        >
                          {order.requestQuantity}
                        </div>
                      )}

                      {/* Editable Unit */}
                      {canEdit(order) && editingUnit === order.id ? (
                        <Select
                          value={order.orderUnit}
                          onValueChange={(value) => handleUnitChange(order.id, value)}
                          onOpenChange={(open) => !open && setEditingUnit(null)}
                        >
                          <SelectTrigger className="w-20 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableUnits.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span
                          className={`text-sm text-gray-500 ml-1 ${canEdit(order) ? "cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5" : ""}`}
                          onClick={() => canEdit(order) && setEditingUnit(order.id)}
                        >
                          {order.orderUnit}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price - Only show for non-requestors */}
                  {canSeePrices && (
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Unit Price</div>
                      <div className="text-lg font-semibold">${order.price}</div>
                    </div>
                  )}

                  {/* Total - Only show for non-requestors */}
                  {canSeePrices && (
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Total</div>
                      <div className="text-lg font-bold text-gray-900">
                        ${(order.requestQuantity * order.price).toFixed(2)}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {getPrimaryAction(order)}

                    <Button variant="ghost" size="sm" onClick={() => toggleRowExpansion(order.id)}>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${expandedRows.has(order.id) ? "rotate-180" : ""}`}
                      />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedRows.has(order.id) && (
                <>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">SKU:</span>
                      <div className="font-medium font-mono text-blue-600">{order.sku}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Inventory Unit:</span>
                      <div className="font-medium">{order.invUnit}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">On Order:</span>
                      <div className="font-medium">{order.onOrderQuantity}</div>
                      <div className="text-xs text-gray-400">
                        ({order.onOrderInvUnit} {order.invUnit})
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">On Hand:</span>
                      <div className="font-medium">{order.onHandQuantity}</div>
                      <div className="text-xs text-gray-400">
                        ({order.onHandInvUnit} {order.invUnit})
                      </div>
                    </div>

                    {/* Vendor details - Only show for non-requestors */}
                    {canSeeVendor && (
                      <div>
                        <span className="text-gray-500">Vendor:</span>
                        <div className="font-medium">{order.vendor}</div>
                        {order.vendorCode && <div className="text-xs text-gray-400">Code: {order.vendorCode}</div>}
                      </div>
                    )}

                    {/* Currency info - Only show for non-requestors */}
                    {canSeePrices && (
                      <div>
                        <span className="text-gray-500">Currency / Base:</span>
                        <div className="font-medium">
                          {order.currency} / {order.baseCurrency}
                        </div>
                      </div>
                    )}

                    {/* Price details - Only show for non-requestors */}
                    {canSeePrices && (
                      <>
                        <div>
                          <span className="text-gray-500">Price ({order.currency}):</span>
                          <div className="font-medium">${order.price}</div>
                          <div className="text-xs text-gray-400">Last: ${order.lastPrice}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Price ({order.baseCurrency}):</span>
                          <div className="font-medium">${order.baseCurrencyPrice}</div>
                          <div className="text-xs text-gray-400">Last: ${order.baseCurrencyLastPrice}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Total ({order.currency}):</span>
                          <div className="font-medium">${(order.requestQuantity * order.price).toFixed(2)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Total ({order.baseCurrency}):</span>
                          <div className="font-medium">
                            ${(order.requestQuantity * order.baseCurrencyPrice).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400">Rate: {order.conversionRate}</div>
                        </div>
                      </>
                    )}

                    {/* Vendor contact - Only show for non-requestors */}
                    {canSeeVendor && order.vendorContact && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Vendor Contact:</span>
                        <div className="font-medium">{order.vendorContact}</div>
                      </div>
                    )}

                    {order.approvedBy && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Approved by:</span>
                        <div className="font-medium">{order.approvedBy}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    {canEdit(order) && (
                      <>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
