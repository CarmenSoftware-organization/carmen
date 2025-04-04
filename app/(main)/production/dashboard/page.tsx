'use client';

import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { Factory, Clock, CheckCircle2, AlertOctagon } from "lucide-react";

const stats = [
  {
    title: "Active Production",
    value: "12",
    description: "3 high priority",
    icon: Factory
  },
  {
    title: "Avg Production Time",
    value: "2.5h",
    description: "-15min vs target",
    icon: Clock
  },
  {
    title: "Completion Rate",
    value: "94%",
    description: "+2% this week",
    icon: CheckCircle2
  },
  {
    title: "Quality Issues",
    value: "3",
    description: "Under investigation",
    icon: AlertOctagon
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
    <DashboardTemplate
      title="Production Dashboard"
      description="Real-time production metrics and performance indicators"
      stats={stats}
      charts={charts}
    />
  );
} 