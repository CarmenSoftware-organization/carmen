'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Header from '@/components/header'
import Sidebar from '@/components/Sidebar'

export default function MainLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLargeScreen, setIsLargeScreen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const pathname = usePathname()

  const handleSidebarToggle = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  const handleSidebarCollapseToggle = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed)
  }

  useEffect(() => {
    const handleResize = () => {
      const largeScreen = window.innerWidth >= 1024
      setIsLargeScreen(largeScreen)
      setIsSidebarOpen(largeScreen)
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!isLargeScreen) {
      setIsSidebarOpen(false)
    }
  }, [pathname, isLargeScreen])

  // Calculate dynamic padding based on sidebar state
  const getContentPadding = () => {
    if (!isLargeScreen) return "" // No padding on mobile
    return isSidebarCollapsed ? "sm:pl-[60px]" : "sm:pl-[280px]"
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen || isLargeScreen} 
        onClose={() => setIsSidebarOpen(false)}
        onCollapseToggle={handleSidebarCollapseToggle}
      />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${getContentPadding()}`}>
        <Header onSidebarToggle={handleSidebarToggle} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 pt-16">
          {children}
        </main>
      </div>
    </div>
  )
} 