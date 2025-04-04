'use client';

import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { Users, Star, DollarSign, Clock } from "lucide-react";

const stats = [
  {
    title: "Active Vendors",
    value: "86",
    description: "+3 this month",
    icon: Users
  },
  {
    title: "Top Performers",
    value: "12",
    description: "95%+ rating",
    icon: Star
  },
  {
    title: "Total Spend",
    value: "$234,567",
    description: "Last 30 days",
    icon: DollarSign
  },
  {
    title: "Pending Reviews",
    value: "15",
    description: "Due this week",
    icon: Clock
  }
];

const charts = [
  {
    type: 'bar' as const,
    title: "Vendor Performance Ratings",
    data: [
      { name: "Excellent", value: 25 },
      { name: "Good", value: 40 },
      { name: "Average", value: 15 },
      { name: "Poor", value: 6 }
    ]
  },
  {
    type: 'pie' as const,
    title: "Spend by Vendor Category",
    data: [
      { name: "Food Suppliers", value: 40 },
      { name: "Equipment", value: 25 },
      { name: "Beverages", value: 20 },
      { name: "Services", value: 15 }
    ]
  }
];

export default function VendorManagementDashboard() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-8">
        <DashboardTemplate
          title="Vendor Management Dashboard"
          description="Overview of vendor performance and relationships"
          stats={stats}
          charts={charts}
        />
      </div>
    </div>
  );
} 