'use client';

import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { Package, Tags, Archive, AlertTriangle } from "lucide-react";

const stats = [
  {
    title: "Total Products",
    value: "1,234",
    description: "+5 new this week",
    icon: Package
  },
  {
    title: "Categories",
    value: "45",
    description: "Across 8 departments",
    icon: Tags
  },
  {
    title: "Active SKUs",
    value: "892",
    description: "78% of total products",
    icon: Archive
  },
  {
    title: "Low Stock Items",
    value: "12",
    description: "Below reorder point",
    icon: AlertTriangle
  }
];

const charts = [
  {
    type: 'bar' as const,
    title: "Products by Category",
    data: [
      { name: "Food", value: 450 },
      { name: "Beverages", value: 320 },
      { name: "Equipment", value: 180 },
      { name: "Supplies", value: 284 }
    ]
  },
  {
    type: 'pie' as const,
    title: "Product Status Distribution",
    data: [
      { name: "Active", value: 75 },
      { name: "Inactive", value: 15 },
      { name: "Discontinued", value: 5 },
      { name: "New", value: 5 }
    ]
  }
];

export default function ProductManagementDashboard() {
  return (
    <DashboardTemplate
      title="Product Management Dashboard"
      description="Overview of product catalog and inventory status"
      stats={stats}
      charts={charts}
    />
  );
} 