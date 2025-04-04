import { Metadata } from 'next'
import { PurchaseOrderList } from './components/PurchaseOrderList'

export const metadata: Metadata = {
  title: 'Purchase Orders',
  description: 'Manage and view all purchase orders',
}

export default function PurchaseOrdersPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <PurchaseOrderList />
    </div>
  )
}
