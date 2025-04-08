'use client'

import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { CalendarClock, Target, TrendingUp, FileSpreadsheet } from "lucide-react";

const stats = [
  {
    title: "Active Plans",
    value: "8",
    description: "2 pending review",
    icon: CalendarClock
  },
  {
    title: "Target Achievement",
    value: "92%",
    description: "+3% vs last month",
    icon: Target
  },
  {
    title: "Efficiency Rate",
    value: "87%",
    description: "Above target",
    icon: TrendingUp
  },
  {
    title: "Recipe Plans",
    value: "45",
    description: "12 new this week",
    icon: FileSpreadsheet
  }
];

const charts = [
  {
    type: 'bar' as const,
    title: "Planning Status by Department",
    data: [
      { name: "Kitchen", value: 85 },
      { name: "Service", value: 92 },
      { name: "Inventory", value: 78 },
      { name: "Staffing", value: 88 }
    ]
  },
  {
    type: 'pie' as const,
    title: "Resource Allocation",
    data: [
      { name: "Equipment", value: 30 },
      { name: "Staff", value: 40 },
      { name: "Materials", value: 20 },
      { name: "Other", value: 10 }
    ]
  }
];

export default function OperationalPlanningDashboard() {
  return (
    <DashboardTemplate
      title="Operational Planning Dashboard"
      description="Strategic overview of operational plans and resource allocation"
      stats={stats}
      charts={charts}
    />
  );
} 