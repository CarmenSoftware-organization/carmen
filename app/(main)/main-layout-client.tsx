'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Header from '@/components/header'
import Sidebar from '@/components/Sidebar'

export default function MainLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Start with closed sidebar
  const [businessUnit, setBusinessUnit] = useState('unit1') // Default value
  const pathname = usePathname()

  // Use useCallback to create stable function references
  const handleSidebarToggle = useCallback(() => {
    setIsSidebarOpen(prev => !prev)
  }, [])

  const handleSidebarClose = useCallback(() => {
    setIsSidebarOpen(false)
  }, [])

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onSidebarToggle={handleSidebarToggle} 
        businessUnit={businessUnit}
        setBusinessUnit={setBusinessUnit}
      />
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
        <main className="flex-1 overflow-y-auto bg-background lg:pl-[280px]">
          <div className="mx-auto py-0 px-0 md:px-9">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 