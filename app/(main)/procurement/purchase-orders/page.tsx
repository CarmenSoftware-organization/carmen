import { Metadata } from 'next'
import PurchaseOrderList from './components/PurchaseOrderList'
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
      <PurchaseOrderList />
  )
}
