"use client"

import { useState } from "react"
import type { User, OrderItem } from "./types/roles"
import RoleSelector from "./components/role-selector"
import EnhancedOrderTable from "./components/enhanced-order-table"

const mockOrders: OrderItem[] = [
  {
    id: "1",
    location: "Main Hotel Store",
    product: "Bed Linens Set",
    productDescription: "Premium cotton bed linens with pillowcases",
    sku: "BLS-PREM-001",
    orderUnit: "Set",
    invUnit: "Set",
    requestQuantity: 25,
    onOrderQuantity: 50,
    onOrderInvUnit: 50,
    approvedQuantity: 20,
    onHandQuantity: 15,
    onHandInvUnit: 15,
    currency: "USD",
    baseCurrency: "USD",
    price: 89.99,
    lastPrice: 85.99,
    baseCurrencyPrice: 89.99,
    baseCurrencyLastPrice: 85.99,
    total: 2249.75,
    baseCurrencyTotal: 2249.75,
    conversionRate: 1.0,
    status: "pending",
    requestorId: "1",
    requestorName: "John Smith",
    department: "Housekeeping",
    requestDate: "2024-01-15",
    expectedDeliveryDate: "2024-01-22",
    vendor: "Luxury Linens Co.",
    lastVendor: "Linens & Things",
    vendorCode: "LLC-001",
    vendorContact: "sales@luxurylinens.com",
    comment: "Urgent request for VIP suite turnover. Please expedite.",
  },
  {
    id: "2",
    location: "Restaurant Store",
    product: "Wine Glasses",
    productDescription: "Crystal wine glasses for fine dining",
    sku: "WG-CRYST-024",
    orderUnit: "Box",
    invUnit: "Each",
    requestQuantity: 5,
    onOrderQuantity: 10,
    onOrderInvUnit: 120,
    approvedQuantity: 5,
    onHandQuantity: 3,
    onHandInvUnit: 36,
    currency: "EUR",
    baseCurrency: "USD",
    price: 125.5,
    lastPrice: 120.0,
    baseCurrencyPrice: 137.0,
    baseCurrencyLastPrice: 131.04,
    total: 627.5,
    baseCurrencyTotal: 685.0,
    conversionRate: 1.092,
    status: "Review",
    requestorId: "2",
    requestorName: "Sarah Johnson",
    department: "Food & Beverage",
    requestDate: "2024-01-14",
    expectedDeliveryDate: "2024-01-21",
    reviewDate: "2024-01-16",
    reviewedBy: "Lisa Brown",
    vendor: "Crystal Glassware Ltd.",
    lastVendor: "Crystal Glassware Ltd.",
    vendorCode: "CGL-002",
    vendorContact: "orders@crystalware.eu",
  },
  {
    id: "3",
    location: "Housekeeping Store",
    product: "Vacuum Cleaner",
    productDescription: "Commercial grade vacuum cleaner",
    sku: "VC-COMM-300",
    orderUnit: "Piece",
    invUnit: "Piece",
    requestQuantity: 2,
    onOrderQuantity: 3,
    onOrderInvUnit: 3,
    approvedQuantity: 2,
    onHandQuantity: 1,
    onHandInvUnit: 1,
    currency: "USD",
    baseCurrency: "USD",
    price: 299.99,
    lastPrice: 310.0,
    baseCurrencyPrice: 299.99,
    baseCurrencyLastPrice: 310.0,
    total: 599.98,
    baseCurrencyTotal: 599.98,
    conversionRate: 1.0,
    status: "approved",
    requestorId: "1",
    requestorName: "John Smith",
    department: "Housekeeping",
    requestDate: "2024-01-13",
    expectedDeliveryDate: "2024-01-20",
    approvalDate: "2024-01-15",
    approvedBy: "Mike Wilson",
    vendor: "CleanTech Solutions",
    lastVendor: "Vacuums R Us",
    vendorCode: "CTS-003",
    vendorContact: "support@cleantech.com",
  },
  {
    id: "4",
    location: "Bar Store",
    product: "Premium Whiskey",
    productDescription: "Single malt whiskey for hotel bar",
    sku: "WH-SNGL-750",
    orderUnit: "Bottle",
    invUnit: "Bottle",
    requestQuantity: 12,
    onOrderQuantity: 24,
    onOrderInvUnit: 24,
    approvedQuantity: 0,
    onHandQuantity: 8,
    onHandInvUnit: 8,
    currency: "CAD",
    baseCurrency: "USD",
    price: 89.99,
    lastPrice: 89.99,
    baseCurrencyPrice: 66.5,
    baseCurrencyLastPrice: 66.5,
    total: 1079.88,
    baseCurrencyTotal: 798.0,
    conversionRate: 0.739,
    status: "rejected",
    requestorId: "2",
    requestorName: "Sarah Johnson",
    department: "Food & Beverage",
    requestDate: "2024-01-12",
    expectedDeliveryDate: "2024-01-19",
    comment: "Rejected due to budget constraints for this quarter.",
    vendor: "Premium Spirits Inc.",
    lastVendor: "Premium Spirits Inc.",
    vendorCode: "PSI-004",
    vendorContact: "orders@premiumspirits.ca",
  },
  {
    id: "5",
    location: "Front Desk Store",
    product: "Key Cards",
    productDescription: "RFID hotel key cards with magnetic stripe",
    sku: "KC-RFID-100",
    orderUnit: "Pack",
    invUnit: "Each",
    requestQuantity: 10,
    onOrderQuantity: 15,
    onOrderInvUnit: 1500,
    approvedQuantity: 8,
    onHandQuantity: 5,
    onHandInvUnit: 500,
    currency: "USD",
    baseCurrency: "USD",
    price: 24.99,
    lastPrice: 25.5,
    baseCurrencyPrice: 24.99,
    baseCurrencyLastPrice: 25.5,
    total: 249.9,
    baseCurrencyTotal: 249.9,
    conversionRate: 1.0,
    status: "approved",
    requestorId: "1",
    requestorName: "John Smith",
    department: "Housekeeping",
    requestDate: "2024-01-11",
    expectedDeliveryDate: "2024-01-18",
    approvalDate: "2024-01-13",
    approvedBy: "Mike Wilson",
    vendorAllocationDate: "2024-01-14",
    vendorAllocatedBy: "David Chen",
    vendor: "SecureAccess Systems",
    lastVendor: "CardTech",
    vendorCode: "SAS-005",
    vendorContact: "sales@secureaccess.com",
  },
]

export default function RoleBasedOrderSystem() {
  const [currentUser, setCurrentUser] = useState<User>({
    id: "1",
    name: "John Smith",
    role: "requestor",
    department: "Housekeeping",
  })

  const [orders, setOrders] = useState<OrderItem[]>(mockOrders)

  const handleOrderUpdate = (orderId: string, updates: Partial<OrderItem>) => {
    setOrders((prevOrders) => prevOrders.map((order) => (order.id === orderId ? { ...order, ...updates } : order)))
  }

  const handleAddItem = (newItem: Omit<OrderItem, "id">) => {
    const newOrder: OrderItem = {
      ...newItem,
      id: `${Date.now()}`, // Simple ID generation for demo
    }
    setOrders((prevOrders) => [newOrder, ...prevOrders])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Hotel Procurement System</h1>

        <RoleSelector currentUser={currentUser} onUserChange={setCurrentUser} />

        <EnhancedOrderTable
          currentUser={currentUser}
          orders={orders}
          onOrderUpdate={handleOrderUpdate}
          onAddItem={handleAddItem}
        />
      </div>
    </div>
  )
}
