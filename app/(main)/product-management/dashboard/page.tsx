"use client"

import { Package, Tags, Archive, AlertTriangle } from "lucide-react"
import { DashboardTemplate } from "@/components/templates/DashboardTemplate"

const stats = [
  {
    title: "Total Products",
    value: "1,234",
    icon: Package,
    description: "Active products in catalog",
    trend: "+12.3%",
    trendDirection: "up"
  },
  {
    title: "Categories",
    value: "56",
    icon: Tags,
    description: "Product categories",
    trend: "+2.4%",
    trendDirection: "up"
  },
  {
    title: "Low Stock",
    value: "23",
    icon: Archive,
    description: "Items below threshold",
    trend: "-5.2%",
    trendDirection: "down"
  },
  {
    title: "Out of Stock",
    value: "8",
    icon: AlertTriangle,
    description: "Items needing restock",
    trend: "-3.1%",
    trendDirection: "down"
  }
]

export default function ProductManagementDashboard() {
  return (
    <div className="container mx-auto py-6">
      <DashboardTemplate 
        title="Product Management Dashboard"
        stats={stats}
      />
    </div>
  )
} 