'use client'

import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { ShoppingCart, TrendingUp, AlertCircle, Clock } from "lucide-react";

// Sample data - replace with real data in production
const dashboardData = {
  metrics: [
    {
      title: "Total Purchase Orders",
      value: "156",
      change: "+12%",
      trend: "up",
      icon: ShoppingCart,
    },
    {
      title: "Pending Approvals",
      value: "8",
      change: "-25%",
      trend: "down",
      icon: Clock,
    },
    {
      title: "Budget Utilization",
      value: "75%",
      change: "+5%",
      trend: "up",
      icon: TrendingUp,
    },
    {
      title: "Critical Items",
      value: "3",
      change: "-2",
      trend: "down",
      icon: AlertCircle,
    },
  ],
};

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
      stats={dashboardData.metrics}
      charts={charts}
    />
  );
} 