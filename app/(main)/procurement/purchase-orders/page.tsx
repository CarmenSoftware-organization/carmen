import { Metadata } from 'next'
import PurchaseOrderList from '@/components/purchase-orders/PurchaseOrderList'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PlusCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Purchase Orders',
  description: 'Manage and view all purchase orders',
}

export default function PurchaseOrdersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
      </div>
      <PurchaseOrderList />
    </div>
  )
}
