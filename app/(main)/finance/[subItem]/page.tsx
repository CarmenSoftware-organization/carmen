'use client'

import { notFound } from 'next/navigation'

interface PageProps {
  params: {
    subItem: string
  }
}

export default function FinanceSubItemPage({ params }: PageProps) {
  const title = params.subItem.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  
  if (!['account-code-mapping', 'currency-management', 'exchange-rates', 'department-and-cost-center-management', 'budget-planning-and-control'].includes(params.subItem)) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <p>Content for {title} will be added here.</p>
    </div>
  )
}