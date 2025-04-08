'use client'

import { notFound } from 'next/navigation'
import ComingSoon from '@/components/ComingSoon'

interface PageProps {
  params: {
    subItem: string
  }
}

export default function HelpSupportSubItemPage({ params }: PageProps) {
  const title = params.subItem.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  
  if (!['user-manuals', 'video-tutorials', 'faqs', 'support-ticket-system', 'system-updates-and-release-notes'].includes(params.subItem)) {
    notFound()
  }

  return <ComingSoon title={title} />
}