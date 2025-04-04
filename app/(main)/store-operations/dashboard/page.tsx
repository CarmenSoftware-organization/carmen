'use client';

import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { Store, TrendingDown, AlertCircle, Truck } from "lucide-react";

const stats = [
  {
    title: "Active Stores",
    value: "24",
    description: "Across 5 regions",
    icon: Store
  },
  {
    title: "Stock Wastage",
    value: "2.3%",
    description: "-0.5% vs last month",
    icon: TrendingDown
  },
  {
    title: "Pending Requisitions",
    value: "18",
    description: "4 urgent requests",
    icon: AlertCircle
  },
  {
    title: "Deliveries Today",
    value: "12",
    description: "3 in transit",
    icon: Truck
  }
];

const charts = [
  {
    type: 'bar' as const,
    title: "Store Requisition Status",
    data: [
      { name: "Pending", value: 15 },
      { name: "Processing", value: 8 },
      { name: "In Transit", value: 12 },
      { name: "Completed", value: 45 }
    ]
  },
  {
    type: 'pie' as const,
    title: "Wastage by Category",
    data: [
      { name: "Perishables", value: 45 },
      { name: "Prepared Food", value: 30 },
      { name: "Beverages", value: 15 },
      { name: "Other", value: 10 }
    ]
  }
];

export default function StoreOperationsDashboard() {
  return (
    <DashboardTemplate
      title="Store Operations Dashboard"
      description="Overview of store activities and performance metrics"
      stats={stats}
      charts={charts}
    />
  );
} 