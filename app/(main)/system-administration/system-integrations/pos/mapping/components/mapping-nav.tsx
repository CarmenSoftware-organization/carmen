"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { MapIcon, Utensils, Ruler } from "lucide-react"

interface MappingNavItem {
  title: string
  href: string
  icon: React.ReactNode
}

export function MappingNav() {
  const pathname = usePathname()

  const navItems: MappingNavItem[] = [
    {
      title: "Locations",
      href: "/system-administration/system-integrations/pos/mapping/locations",
      icon: <MapIcon className="h-4 w-4" />,
    },
    {
      title: "Recipes",
      href: "/system-administration/system-integrations/pos/mapping/recipes",
      icon: <Utensils className="h-4 w-4" />,
    },
    {
      title: "Units",
      href: "/system-administration/system-integrations/pos/mapping/units",
      icon: <Ruler className="h-4 w-4" />,
    },
  ]

  return (
    <div className="flex border-b space-x-1 mb-6">
      {navItems.map((item) => (
        <Link 
          key={item.href}
          href={item.href}
          className={cn(
            "px-3 py-2 flex items-center text-sm font-medium border-b-2 transition-colors",
            pathname === item.href
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="mr-2">{item.icon}</span>
          {item.title}
        </Link>
      ))}
    </div>
  )
} 