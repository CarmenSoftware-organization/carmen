'use client'

import { ReactNode } from 'react'

interface ReportsLayoutProps {
  children: ReactNode
}

export default function ReportsLayout({ children }: ReportsLayoutProps) {
  return (
    <div className="container mx-auto py-6">
      {children}
    </div>
  )
} 