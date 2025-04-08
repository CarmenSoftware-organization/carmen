'use client'

import { notFound } from 'next/navigation'
import ComingSoon from '@/components/ComingSoon'

interface PageProps {
  params: {
    subItem: string
  }
}

export default function InventoryManagementSubItemPage({ params }: PageProps) {
  const title = params.subItem.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  
  if (!['stock-overview', 'stock-in', 'stock-out', 'transfer-between-locations', 'physical-count', 'stock-take', 'inventory-valuation'].includes(params.subItem)) {
    notFound()
  }

  return <ComingSoon title={title} />
}