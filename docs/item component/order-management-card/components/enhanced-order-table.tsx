"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Edit, Ban } from "lucide-react"
import { useState, useMemo } from "react"
import type { User, OrderItem } from "../types/roles"
import EnhancedOrderCard from "./enhanced-order-card"
import AddItemModal from "./add-item-modal"

interface EnhancedOrderTableProps {
  currentUser: User
  orders: OrderItem[]
  onOrderUpdate: (orderId: string, updates: Partial<OrderItem>) => void
  onAddItem: (item: Omit<OrderItem, "id">) => void
}

export default function EnhancedOrderTable({ currentUser, orders, onOrderUpdate, onAddItem }: EnhancedOrderTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [showAllDetails, setShowAllDetails] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

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

  const handleToggleAllDetails = () => {
    const newShowAll = !showAllDetails
    setShowAllDetails(newShowAll)

    if (newShowAll) {
      setExpandedRows(new Set(filteredOrders.map((order) => order.id)))
    } else {
      setExpandedRows(new Set())
    }
  }

  const handleToggleEditMode = () => {
    const newEditMode = !isEditMode
    setIsEditMode(newEditMode)
    if (newEditMode) {
      // When entering edit mode, expand all rows to show all fields
      setExpandedRows(new Set(filteredOrders.map((order) => order.id)))
      setShowAllDetails(true)
    }
  }

  const handleToggleExpand = (orderId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
    }
    setExpandedRows(newExpanded)
  }

  const getStatusCounts = () => {
    const counts = filteredOrders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    return counts
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {currentUser.role === "requestor"
                  ? "My Requests"
                  : currentUser.role === "department-manager"
                    ? `${currentUser.department} Department Orders`
                    : "All Orders"}
              </CardTitle>

              {/* Status Summary */}
              <div className="flex items-center gap-4 mt-3">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <Badge key={status} variant="secondary" className="px-3 py-1">
                    {status}: {count}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Add Item Button - Only for requestors and department managers */}
              {(currentUser.role === "requestor" || currentUser.role === "department-manager") && (
                <AddItemModal currentUser={currentUser} onAddItem={onAddItem} />
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleAllDetails}
                className="flex items-center gap-2 bg-transparent"
              >
                {showAllDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showAllDetails ? "Hide Details" : "Show Details"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleEditMode}
                className="flex items-center gap-2 bg-transparent"
              >
                {isEditMode ? <Ban className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                {isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <EnhancedOrderCard
            key={order.id}
            order={order}
            currentUser={currentUser}
            onOrderUpdate={onOrderUpdate}
            isExpanded={expandedRows.has(order.id)}
            onToggleExpand={() => handleToggleExpand(order.id)}
            isEditMode={isEditMode}
          />
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-gray-500">
              <div className="text-lg font-medium mb-2">No orders found</div>
              <div className="text-sm mb-4">
                {currentUser.role === "requestor" || currentUser.role === "department-manager"
                  ? "Create your first order request to get started"
                  : "No orders match your current filters"}
              </div>
              {(currentUser.role === "requestor" || currentUser.role === "department-manager") && (
                <AddItemModal currentUser={currentUser} onAddItem={onAddItem} />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
