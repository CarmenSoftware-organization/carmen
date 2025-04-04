'use client';

import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { ShoppingCart, TrendingUp, AlertCircle, Clock } from "lucide-react";

// Sample data - replace with real data in production
const stats = [
  {
    title: "Total Purchase Requests",
    value: "156",
    description: "+12% from last month",
    icon: ShoppingCart
  },
  {
    title: "Pending Approvals",
    value: "23",
    description: "5 urgent requests",
    icon: Clock
  },
  {
    title: "Total Spend",
    value: "$45,231",
    description: "Last 30 days",
    icon: TrendingUp
  },
  {
    title: "Critical Items",
    value: "8",
    description: "Require attention",
    icon: AlertCircle
  }
];

const charts = [
  {
    type: 'bar' as const,
    title: "Purchase Orders by Status",
    data: [
      { name: "Draft", value: 20 },
      { name: "Pending", value: 15 },
      { name: "Approved", value: 45 },
      { name: "Completed", value: 30 }
    ]
  },
  {
    type: 'pie' as const,
    title: "Spend by Category",
    data: [
      { name: "Food", value: 35 },
      { name: "Beverages", value: 25 },
      { name: "Equipment", value: 20 },
      { name: "Supplies", value: 20 }
    ]
  }
];

export default function ProcurementDashboard() {
  return (
    <DashboardTemplate
      title="Procurement Dashboard"
      description="Overview of procurement activities and metrics"
      stats={stats}
      charts={charts}
    />
  );
} 