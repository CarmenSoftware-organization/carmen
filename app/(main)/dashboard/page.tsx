import React from 'react'
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { DashboardHeader } from "./components/dashboard-header"
import { DashboardCards } from "./components/dashboard-cards"
import { DashboardChart } from "./components/dashboard-chart"
import { DashboardDataTable } from "./components/dashboard-data-table"

export default function DashboardPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <DashboardCards />
              </div>
              <div className="px-4 lg:px-6">
                <DashboardChart />
              </div>
              <div className="px-4 lg:px-6">
                <DashboardDataTable />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}