"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FileText, Edit, Trash2, Check, X, ShoppingCart, Package } from "lucide-react"
import { useState } from "react"
import type { User, OrderItem } from "../types/roles"

interface OrderManagementTableProps {
  currentUser: User
  orders: OrderItem[]
  onOrderUpdate: (orderId: string, updates: Partial<OrderItem>) => void
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "approved":
      return "bg-green-100 text-green-800"
    case "rejected":
      return "bg-red-100 text-red-800"
    case "ordered":
      return "bg-blue-100 text-blue-800"
    case "received":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function OrderManagementTable({ currentUser, orders, onOrderUpdate }: OrderManagementTableProps) {
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null)

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

  const handleApprove = (orderId: string) => {
    onOrderUpdate(orderId, {
      status: "approved",
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

  const filteredOrders = orders.filter((order) => {
    if (currentUser.role === "requestor") {
      return order.requestorId === currentUser.id
    }
    if (currentUser.role === "department-manager") {
      return order.department === currentUser.department
    }
    return true // Purchasing staff can see all orders
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            Order Management -{" "}
            {currentUser.role === "requestor"
              ? "My Requests"
              : currentUser.role === "department-manager"
                ? `${currentUser.department} Department`
                : "All Orders"}
          </span>
          <Badge variant="outline">{filteredOrders.length} orders</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-600">
                  <Checkbox />
                </th>
                <th className="text-left p-4 font-medium text-gray-600">Location</th>
                <th className="text-left p-4 font-medium text-gray-600">Product</th>
                <th className="text-center p-4 font-medium text-gray-600">
                  Order Unit /<br />
                  Inv. Unit
                </th>
                <th className="text-center p-4 font-medium text-gray-600">
                  Request / On
                  <br />
                  Order
                </th>
                <th className="text-center p-4 font-medium text-gray-600">
                  Approve / On
                  <br />
                  Hand
                </th>
                <th className="text-center p-4 font-medium text-gray-600">
                  Currency /<br />
                  Base
                </th>
                <th className="text-center p-4 font-medium text-gray-600">
                  Price / Last
                  <br />
                  Price
                </th>
                <th className="text-center p-4 font-medium text-gray-600">Total</th>
                <th className="text-center p-4 font-medium text-gray-600">Status</th>
                <th className="text-center p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <Checkbox />
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{order.location}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{order.product}</div>
                    <div className="text-sm text-gray-500">{order.productDescription}</div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="font-medium">{order.orderUnit}</div>
                    <div className="text-sm text-gray-500">{order.invUnit}</div>
                  </td>
                  <td className="p-4 text-center">
                    {canEdit(order) && editingQuantity === order.id ? (
                      <Input
                        type="number"
                        value={order.requestQuantity}
                        onChange={(e) => onOrderUpdate(order.id, { requestQuantity: Number(e.target.value) })}
                        onBlur={() => setEditingQuantity(null)}
                        onKeyDown={(e) => e.key === "Enter" && setEditingQuantity(null)}
                        className="w-16 mx-auto text-center mb-1"
                        min="1"
                        autoFocus
                      />
                    ) : (
                      <div
                        className={`font-medium ${canEdit(order) ? "cursor-pointer hover:bg-gray-100 rounded px-2 py-1" : ""}`}
                        onClick={() => canEdit(order) && setEditingQuantity(order.id)}
                      >
                        {order.requestQuantity}
                      </div>
                    )}
                    <div className="text-sm text-gray-500">{order.onOrderQuantity}</div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="font-medium">{order.approvedQuantity || "-"}</div>
                    <div className="text-sm text-gray-500">{order.onHandQuantity}</div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="font-medium">{order.currency}</div>
                    <div className="text-sm text-gray-500">{order.currency}</div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="font-medium">${order.price}</div>
                    <div className="text-sm text-gray-500">${order.lastPrice}</div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="font-medium">${(order.requestQuantity * order.price).toFixed(2)}</div>
                    <div className="text-sm text-gray-500">${order.total.toFixed(2)}</div>
                  </td>
                  <td className="p-4 text-center">
                    <Badge className={getStatusBadgeColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <FileText className="h-4 w-4" />
                      </Button>

                      {canApprove(order) && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                            onClick={() => handleApprove(order.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            onClick={() => handleReject(order.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      {canOrder(order) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                          onClick={() => handleOrder(order.id)}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      )}

                      {currentUser.role === "purchasing-staff" && (order.status as any) === "ordered" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700"
                          onClick={() => handleReceive(order.id)}
                        >
                          <Package className="h-4 w-4" />
                        </Button>
                      )}

                      {canEdit(order) && (
                        <>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
