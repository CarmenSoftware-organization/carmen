import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Purchase Orders',
  description: 'Manage and view all purchase orders',
}

export default function PurchaseOrdersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 