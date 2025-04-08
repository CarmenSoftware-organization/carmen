"use client"

import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { Factory, Clock, CheckCircle2, AlertOctagon } from "lucide-react";

const stats = [
  {
    title: "Active Production",
    value: "12",
    icon: Factory,
    description: "Production runs in progress",
    trend: "+2.5%",
    trendDirection: "up"
  },
  {
    title: "Scheduled",
    value: "8",
    icon: Clock,
    description: "Upcoming production runs",
    trend: "+1.2%",
    trendDirection: "up"
  },
  {
    title: "Completed Today",
    value: "15",
    icon: CheckCircle2,
    description: "Successfully completed runs",
    trend: "+4.3%",
    trendDirection: "up"
  },
  {
    title: "Issues",
    value: "3",
    icon: AlertOctagon,
    description: "Production issues reported",
    trend: "-1.8%",
    trendDirection: "down"
  }
];

const charts = [
  {
    type: 'bar' as const,
    title: "Production Output by Line",
    data: [
      { name: "Line A", value: 450 },
      { name: "Line B", value: 380 },
      { name: "Line C", value: 320 },
      { name: "Line D", value: 290 }
    ]
  },
  {
    type: 'pie' as const,
    title: "Production Status Distribution",
    data: [
      { name: "In Progress", value: 40 },
      { name: "Completed", value: 35 },
      { name: "Scheduled", value: 20 },
      { name: "Delayed", value: 5 }
    ]
  }
];

export default function ProductionDashboard() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-semibold mb-6">Production Dashboard</h1>
      <DashboardTemplate
        title="Production Dashboard"
        description="Real-time production metrics and performance indicators"
        stats={stats}
        charts={charts}
      />
    </div>
  );
} 