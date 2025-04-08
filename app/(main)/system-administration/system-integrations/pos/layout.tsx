'use client'

import { ReactNode } from "react"
import { FloatingSettingsButton } from "./components/floating-settings-button"

interface POSIntegrationLayoutProps {
  children: ReactNode
}

export default function POSIntegrationLayout({ children }: POSIntegrationLayoutProps) {
  return (
    <>
      {children}
      <FloatingSettingsButton />
    </>
  )
} 