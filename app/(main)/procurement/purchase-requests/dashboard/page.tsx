"use client"

import { DashboardApproval } from "../components/dashboard-approval"

export default function PurchaseRequestDashboard() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-semibold mb-6">Purchase Request Dashboard</h1>
      <DashboardApproval />
    </div>
  )
} 