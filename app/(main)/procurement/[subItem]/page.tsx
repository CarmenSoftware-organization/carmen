'use client'

import { notFound } from 'next/navigation'
import ComingSoon from '@/components/ComingSoon'

interface PageProps {
  params: {
    subItem: string
  }
}

export default function ProcurementSubItemPage({ params }: PageProps) {
  const title = params.subItem.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  
  if (!['my-approvals','purchase-requests','purchase-orders', 'goods-received-note', 'credit-notes', 'vendor-management', 'purchase-request-templates'].includes(params.subItem)) {
    notFound()
  }

  return <ComingSoon title={title} />
}