'use client'

import { notFound } from 'next/navigation'
import ComingSoon from '@/components/ComingSoon'

interface PageProps {
  params: {
    subItem: string
  }
}

export default function OperationalPlanningSubItemPage({ params }: PageProps) {
  const title = params.subItem.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  
  if (!['dashboard', 'recipes-management', 'menu-engineering', 'demand-forecasting', 'inventory-planning'].includes(params.subItem)) {
    notFound()
  }

  return <ComingSoon title={title} />
}