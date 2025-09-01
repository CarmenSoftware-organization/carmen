'use client'

import { WorkflowProvider } from '@/lib/context/workflow-context'
import { SidebarLayout } from '@/components/Sidebar'
import Header from '@/components/header'
import { AuthGuard } from '@/components/auth/auth-guard'

export default function MainLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <WorkflowProvider>
        <SidebarLayout>
          <div className="flex flex-col">
            <Header />
            <div className="flex-1">
              {children}
            </div>
          </div>
        </SidebarLayout>
      </WorkflowProvider>
    </AuthGuard>
  )
} 