'use client'

import Link from "next/link"
import { ShoppingCart, FileText, ClipboardList, Store, Users, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface QuickAccessItem {
  icon: typeof ShoppingCart
  label: string
  href: string
}

const quickAccessItems: QuickAccessItem[] = [
  {
    icon: ShoppingCart,
    label: "Purchase Requests",
    href: "/procurement/purchase-requests",
  },
  {
    icon: ShoppingBag,
    label: "Purchase Orders",
    href: "/procurement/purchase-orders",
  },
  {
    icon: ClipboardList,
    label: "Store Requisitions",
    href: "/store-operations/store-requisitions",
  },
  {
    icon: FileText,
    label: "Goods Received Note",
    href: "/procurement/goods-received-note",
  },
  {
    icon: Store,
    label: "Inventory",
    href: "/inventory-management",
  },
  {
    icon: Users,
    label: "Vendors",
    href: "/vendor-management/manage-vendors",
  },
]

export function QuickAccessNav() {
  return (
    <div className="flex items-center space-x-2">
      {quickAccessItems.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8",
            "hover:bg-accent hover:text-accent-foreground"
          )}
          asChild
        >
          <Link href={item.href}>
            <item.icon className="h-4 w-4" />
            <span className="sr-only">{item.label}</span>
          </Link>
        </Button>
      ))}
    </div>
  )
} 