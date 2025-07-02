"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ChevronDown, MapPin, Calendar, Hash, Building2, MessageSquare, Save, Ban } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
// Local type definitions
interface User {
  id: string;
  name: string;
  email?: string;
  role: string;
  department?: string;
}

interface OrderItem {
  id: string;
  location: string;
  product: string;
  productDescription: string;
  sku: string;
  orderUnit: string;
  invUnit: string;
  requestQuantity: number;
  onOrderQuantity: number;
  onOrderInvUnit: number;
  approvedQuantity: number;
  onHandQuantity: number;
  onHandInvUnit: number;
  currency: string;
  baseCurrency: string;
  price: number;
  lastPrice: number;
  baseCurrencyPrice: number;
  baseCurrencyLastPrice: number;
  total: number;
  baseCurrencyTotal: number;
  conversionRate: number;
  status: "pending" | "approved" | "rejected" | "Review";
  requestorId: string;
  requestorName: string;
  department: string;
  requestDate: string;
  expectedDeliveryDate?: string;
  vendor: string;
  lastVendor?: string;
  comment?: string;
}

interface EnhancedOrderCardProps {
  order: OrderItem
  currentUser: User
  onOrderUpdate: (orderId: string, updates: Partial<OrderItem>) => void
  isExpanded?: boolean
  onToggleExpand?: () => void
  isEditMode?: boolean
  isSelected?: boolean
  onSelect?: () => void
}

const getStatusConfig = (status: string) => {
  const configs = {
    pending: {
      color: "bg-amber-50 text-amber-700 border-amber-200",
      bgColor: "bg-amber-50",
      borderColor: "border-l-amber-400",
      icon: "⏳",
    },
    Review: {
      color: "bg-purple-50 text-purple-700 border-purple-200",
      bgColor: "bg-purple-50",
      borderColor: "border-l-purple-400",
      icon: "🔍",
    },
    approved: {
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      bgColor: "bg-emerald-50",
      borderColor: "border-l-emerald-400",
      icon: "✅",
    },
    rejected: {
      color: "bg-red-50 text-red-700 border-red-200",
      bgColor: "bg-red-50",
      borderColor: "border-l-red-400",
      icon: "❌",
    },
  }
  return configs[status as keyof typeof configs] || configs.pending
}

const hotelLocations = [
  "Main Hotel Store",
  "Restaurant Store",
  "Housekeeping Store",
  "Bar Store",
  "Front Desk Store",
  "Kitchen Store",
  "Laundry Store",
  "Maintenance Store",
  "Conference Room Store",
  "Spa Store",
]

const orderUnits = [
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

const sampleProducts = [
  {
    name: "Bed Linens Set",
    description: "Premium cotton bed linens with pillowcases",
    sku: "BLS-PREM-001",
    price: 89.99,
    vendor: "Luxury Linens Co.",
  },
  {
    name: "Wine Glasses",
    description: "Crystal wine glasses for fine dining",
    sku: "WG-CRYST-024",
    price: 125.5,
    vendor: "Crystal Glassware Ltd.",
  },
  {
    name: "Vacuum Cleaner",
    description: "Commercial grade vacuum cleaner",
    sku: "VC-COMM-300",
    price: 299.99,
    vendor: "CleanTech Solutions",
  },
  {
    name: "Premium Whiskey",
    description: "Single malt whiskey for hotel bar",
    sku: "WH-SNGL-750",
    price: 89.99,
    vendor: "Premium Spirits Inc.",
  },
  {
    name: "Key Cards",
    description: "RFID hotel key cards with magnetic stripe",
    sku: "KC-RFID-100",
    price: 24.99,
    vendor: "SecureAccess Systems",
  },
  {
    name: "Chef Knives Set",
    description: "Professional chef knife set with storage block",
    sku: "CK-PROF-SET8",
    price: 189.99,
    vendor: "Professional Kitchen Supply",
  },
]

export default function EnhancedOrderCard({
  order,
  currentUser,
  onOrderUpdate,
  isExpanded = false,
  onToggleExpand,
  isEditMode = false,
  isSelected = false,
  onSelect,
}: EnhancedOrderCardProps) {
  const [editedOrder, setEditedOrder] = useState<OrderItem>(order)

  const isFieldEditable = useMemo(
    () =>
      (fieldName: keyof OrderItem): boolean => {
        const { role } = currentUser
        const { status } = order

        if (role === "Requestor" && status === "pending") {
          return ["location", "product", "comment", "requestQuantity", "orderUnit", "requestDate"].includes(fieldName)
        }
        if (role === "Department Manager" && (status === "pending" || status === "Review")) {
          return ["comment", "approvedQuantity"].includes(fieldName)
        }
        if (role === "Purchasing Staff" && status === "approved") {
          return ["comment", "approvedQuantity", "vendor", "price"].includes(fieldName)
        }
        return false
      },
    [currentUser, order],
  )

  const canEditAnything = useMemo(() => {
    const fields: (keyof OrderItem)[] = [
      "location",
      "product",
      "comment",
      "requestQuantity",
      "orderUnit",
      "requestDate",
      "approvedQuantity",
      "vendor",
      "price",
    ]
    return fields.some((field) => isFieldEditable(field))
  }, [isFieldEditable])

  useEffect(() => {
    if (!isEditMode || order.id !== editedOrder.id) {
      setEditedOrder(order)
    }
  }, [isEditMode, order])

  const statusConfig = getStatusConfig(order.status)
  const canSeePrices = currentUser.role !== "Requestor"
  const canSeeVendor = currentUser.role !== "Requestor"

  const conversionFactor = useMemo(() => {
    if (order.onHandQuantity > 0 && order.onHandInvUnit > 0) {
      return order.onHandInvUnit / order.onHandQuantity
    }
    if (order.onOrderQuantity > 0 && order.onOrderInvUnit > 0) {
      return order.onOrderInvUnit / order.onOrderQuantity
    }
    return 1
  }, [order.onHandQuantity, order.onHandInvUnit, order.onOrderQuantity, order.onOrderInvUnit])

  const requestedInInvUnits = (editedOrder.requestQuantity * conversionFactor).toLocaleString()
  const approvedInInvUnits = ((editedOrder.approvedQuantity || 0) * conversionFactor).toLocaleString()

  const handleFieldChange = (updates: Partial<OrderItem>) => {
    setEditedOrder((prev) => ({ ...prev, ...updates }))
  }

  const handleSave = () => {
    onOrderUpdate(order.id, editedOrder)
  }

  const handleCancel = () => {
    setEditedOrder(order)
  }

  const handleProductChange = (productName: string) => {
    const selectedProduct = sampleProducts.find((p) => p.name === productName)
    if (selectedProduct) {
      handleFieldChange({
        product: selectedProduct.name,
        productDescription: selectedProduct.description,
        sku: selectedProduct.sku,
        price: selectedProduct.price,
        lastPrice: selectedProduct.price,
        baseCurrencyPrice: selectedProduct.price,
        baseCurrencyLastPrice: selectedProduct.price,
        vendor: selectedProduct.vendor,
        vendorCode: `${selectedProduct.vendor.split(" ")[0].toUpperCase()}-001`,
        vendorContact: `orders@${selectedProduct.vendor.toLowerCase().replace(/\s+/g, "")}.com`,
      })
    }
  }

  const getStatusDisplayName = (status: string) => {
    return status === "Review" ? "Review" : status.charAt(0).toUpperCase() + status.slice(1)
  }

  const renderField = (fieldName: keyof OrderItem, display: React.ReactNode, editComponent: React.ReactNode) => {
    return isEditMode && isFieldEditable(fieldName) ? editComponent : display
  }

  return (
    <Card
      className={`${statusConfig.borderColor} border-l-4 hover:shadow-lg transition-all duration-200 ${
        isEditMode && canEditAnything ? "ring-2 ring-amber-300 bg-amber-50/20" : ""
      }`}
    >
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              <Checkbox 
                className="mt-1" 
                checked={isSelected}
                onCheckedChange={onSelect}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <MapPin className="h-3 w-3" />
                  {renderField(
                    "location",
                    <span>{editedOrder.location}</span>,
                    <Select
                      value={editedOrder.location}
                      onValueChange={(value) => handleFieldChange({ location: value })}
                    >
                      <SelectTrigger className="w-40 h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {hotelLocations.map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>,
                  )}
                </div>

                <div className="flex items-center gap-3 mb-2">
                  {renderField(
                    "product",
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{editedOrder.product}</h3>,
                    <Select onValueChange={handleProductChange} defaultValue={editedOrder.product}>
                      <SelectTrigger className="text-lg font-semibold h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sampleProducts.map((p) => (
                          <SelectItem key={p.name} value={p.name}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>,
                  )}
                  <Badge className={statusConfig.color} variant="outline">
                    <span className="mr-1">{statusConfig.icon}</span>
                    {getStatusDisplayName(order.status)}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{editedOrder.productDescription}</p>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Hash className="h-3 w-3" /> {editedOrder.sku}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {renderField(
                      "requestDate",
                      <span>Req. Date: {editedOrder.requestDate}</span>,
                      <Input
                        type="date"
                        value={editedOrder.requestDate}
                        onChange={(e) => handleFieldChange({ requestDate: e.target.value })}
                        className="h-6 text-xs w-32"
                      />,
                    )}
                  </span>
                  {canSeeVendor && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {renderField(
                        "vendor",
                        <span>{editedOrder.vendor}</span>,
                        <Input
                          value={editedOrder.vendor}
                          onChange={(e) => handleFieldChange({ vendor: e.target.value })}
                          className="h-6 text-xs w-32"
                        />,
                      )}
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  {renderField(
                    "comment",
                    editedOrder.comment ? (
                      <div className="flex items-start gap-2 rounded-md border bg-amber-50 p-3 text-sm text-amber-900">
                        <MessageSquare className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <p>
                          <span className="font-semibold">Comment:</span> {editedOrder.comment}
                        </p>
                      </div>
                    ) : null,
                    <Textarea
                      value={editedOrder.comment || ""}
                      onChange={(e) => handleFieldChange({ comment: e.target.value })}
                      placeholder="Add or edit comment..."
                      className="text-sm"
                    />,
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 ml-4">
              {isEditMode && canEditAnything && (
                <div className="flex gap-2">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSave}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <Ban className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {onToggleExpand && (
                <Button variant="ghost" size="sm" onClick={onToggleExpand}>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Requested</div>
              <div className="flex items-center gap-2">
                {renderField(
                  "requestQuantity",
                  <div className="text-2xl font-bold text-gray-900">{editedOrder.requestQuantity}</div>,
                  <Input
                    type="number"
                    value={editedOrder.requestQuantity}
                    onChange={(e) => handleFieldChange({ requestQuantity: Number(e.target.value) })}
                    className="w-20 text-lg font-bold"
                  />,
                )}
                {renderField(
                  "orderUnit",
                  <div className="text-sm text-gray-600">{editedOrder.orderUnit}</div>,
                  <Select
                    value={editedOrder.orderUnit}
                    onValueChange={(value) => handleFieldChange({ orderUnit: value })}
                  >
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {orderUnits.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>,
                )}
              </div>
            </div>

            <div className="bg-emerald-50 rounded-lg p-4">
              <div className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-2">Approved</div>
              <div className="flex items-center gap-2">
                {renderField(
                  "approvedQuantity",
                  <div className="text-2xl font-bold text-gray-900">{editedOrder.approvedQuantity || "-"}</div>,
                  <Input
                    type="number"
                    value={editedOrder.approvedQuantity || ""}
                    onChange={(e) => handleFieldChange({ approvedQuantity: Number(e.target.value) })}
                    className="w-20 text-lg font-bold"
                  />,
                )}
                <div className="text-sm text-gray-600">{editedOrder.approvedQuantity ? editedOrder.orderUnit : ""}</div>
              </div>
            </div>
          </div>
        </div>

        {isExpanded && (
          <>
            <Separator />
            <div className="p-6 bg-gray-50/70">
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Additional Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {/* Inventory Details */}
                <div className="col-span-2">
                  <span className="text-gray-500">Inventory Details (in {order.invUnit})</span>
                  <div className="mt-1 font-medium bg-gray-100 p-3 rounded-md space-y-1 border">
                    <div className="flex justify-between items-center">
                      <span>Requested:</span>
                      <span className="font-semibold">{requestedInInvUnits}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Approved:</span>
                      <span className="font-semibold">{approvedInInvUnits}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>On Hand:</span>
                      <span className="font-semibold">{order.onHandInvUnit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>On Order:</span>
                      <span className="font-semibold">{order.onOrderInvUnit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing Details */}
                {canSeePrices && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Pricing Details</span>
                    <div className="mt-1 font-medium bg-gray-100 p-3 rounded-md space-y-1 border">
                      <div className="flex justify-between items-center">
                        <span>Price ({editedOrder.currency}):</span>
                        <span className="font-semibold">${editedOrder.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Base Price ({editedOrder.baseCurrency}):</span>
                        <span className="font-semibold">${editedOrder.baseCurrencyPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Total ({editedOrder.currency}):</span>
                        <span className="font-bold text-gray-800">${editedOrder.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Base Total ({editedOrder.baseCurrency}):</span>
                        <span className="font-bold text-gray-800">${editedOrder.baseCurrencyTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* History */}
                {editedOrder.approvedBy && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Approved by</span>
                    <div className="mt-1 font-medium">
                      {editedOrder.approvedBy} on {editedOrder.approvalDate}
                    </div>
                  </div>
                )}
                {editedOrder.lastVendor && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Last Vendor</span>
                    <div className="mt-1 font-medium">{editedOrder.lastVendor}</div>
                  </div>
                )}
                {canSeePrices && (
                  <div className="col-span-2">
                    <div className="grid grid-cols-2 gap-x-4">
                      <div>
                        <span className="text-gray-500">Last Price ({editedOrder.currency})</span>
                        <div className="mt-1 font-medium">${editedOrder.lastPrice.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Base Last Price ({editedOrder.baseCurrency})</span>
                        <div className="mt-1 font-medium">${editedOrder.baseCurrencyLastPrice.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
