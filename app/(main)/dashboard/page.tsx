'use client'

import { DashboardTemplate } from "@/components/templates/DashboardTemplate"
import {
  DollarSign,
  PackageSearch,
  TrendingUp,
  AlertTriangle,
  Truck,
  Users,
  Clock,
  BarChart3
} from "lucide-react"

const stats = [
  {
    title: "Total Inventory Value",
    value: "$1.2M",
    description: "+12% from last month",
    icon: DollarSign
  },
  {
    title: "Stock Turnover Rate",
    value: "4.5x",
    description: "Annual turnover ratio",
    icon: TrendingUp
  },
  {
    title: "Low Stock Items",
    value: "24",
    description: "Below reorder point",
    icon: AlertTriangle
  },
  {
    title: "Active SKUs",
    value: "1,234",
    description: "Across all categories",
    icon: PackageSearch
  },
  {
    title: "Pending Orders",
    value: "45",
    description: "Awaiting processing",
    icon: Clock
  },
  {
    title: "Active Suppliers",
    value: "86",
    description: "95% performance rate",
    icon: Users
  },
  {
    title: "On-Time Delivery",
    value: "92%",
    description: "Last 30 days",
    icon: Truck
  },
  {
    title: "Cost Savings",
    value: "$45K",
    description: "Through negotiations",
    icon: BarChart3
  }
]

const charts = [
  {
    type: 'bar' as const,
    title: "Purchase Orders by Status",
    data: [
      { name: "Pending", value: 45 },
      { name: "Approved", value: 32 },
      { name: "In Transit", value: 28 },
      { name: "Received", value: 96 },
      { name: "Rejected", value: 8 }
    ]
  },
  {
    type: 'pie' as const,
    title: "Inventory Distribution by Category",
    data: [
      { name: "Raw Materials", value: 35 },
      { name: "Finished Goods", value: 45 },
      { name: "Packaging", value: 15 },
      { name: "Spare Parts", value: 5 }
    ]
  },
  {
    type: 'bar' as const,
    title: "Top Vendors by Spend",
    data: [
      { name: "Vendor A", value: 120000 },
      { name: "Vendor B", value: 90000 },
      { name: "Vendor C", value: 75000 },
      { name: "Vendor D", value: 60000 },
      { name: "Vendor E", value: 45000 }
    ]
  },
  {
    type: 'pie' as const,
    title: "Stock Status Distribution",
    data: [
      { name: "Optimal", value: 65 },
      { name: "Low Stock", value: 15 },
      { name: "Overstock", value: 12 },
      { name: "Out of Stock", value: 8 }
    ]
  }
]

export default function GlobalDashboard() {
  return (
    <DashboardTemplate
      title="Supply Chain Overview"
      description="Real-time overview of supply chain performance and key metrics"
      stats={stats}
      charts={charts}
    />
  )
} 