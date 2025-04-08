'use client'

import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { Package2, AlertTriangle, TrendingUp, History } from "lucide-react";

const stats = [
  {
    title: "Total Stock Value",
    value: "$1.2M",
    description: "+5% vs last month",
    icon: Package2
  },
  {
    title: "Low Stock Items",
    value: "23",
    description: "Below reorder point",
    icon: AlertTriangle
  },
  {
    title: "Stock Turnover",
    value: "4.5x",
    description: "Last 30 days",
    icon: TrendingUp
  },
  {
    title: "Pending Counts",
    value: "8",
    description: "3 physical counts",
    icon: History
  }
];

const charts = [
  {
    type: 'bar' as const,
    title: "Stock Movement by Category",
    data: [
      { name: "Raw Materials", value: 450 },
      { name: "Packaging", value: 280 },
      { name: "Finished Goods", value: 320 },
      { name: "Supplies", value: 150 }
    ]
  },
  {
    type: 'pie' as const,
    title: "Inventory Value Distribution",
    data: [
      { name: "Raw Materials", value: 40 },
      { name: "Packaging", value: 20 },
      { name: "Finished Goods", value: 30 },
      { name: "Supplies", value: 10 }
    ]
  }
];

export default function InventoryManagementDashboard() {
  return (
    <DashboardTemplate
      title="Inventory Management Dashboard"
      description="Real-time overview of inventory status and movements"
      stats={stats}
      charts={charts}
    />
  );
} 