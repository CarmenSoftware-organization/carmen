import { Metadata } from 'next'
import { ModernPurchaseRequestList } from './components/ModernPurchaseRequestList'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Purchase Requests',
  description: 'Manage and view all purchase requests',
}

export default function PurchaseRequestsPage() {
  return <ModernPurchaseRequestList />
}
