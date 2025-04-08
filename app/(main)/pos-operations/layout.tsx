'use client'

import { ReactNode } from "react"

interface LayoutProps {
  children: ReactNode
}

export default function POSOperationsLayout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 space-y-4 px-4 py-8 pt-6">
        {children}
      </div>
    </div>
  )
} 