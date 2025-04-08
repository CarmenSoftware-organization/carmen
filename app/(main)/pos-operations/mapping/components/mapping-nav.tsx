'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { MapIcon, Utensils, Ruler } from "lucide-react"

interface MappingNavItem {
  title: string
  href: string
  icon: React.ReactNode
}

const items: MappingNavItem[] = [
  {
    title: "Locations",
    href: "/pos-operations/mapping/locations",
    icon: <MapIcon className="h-4 w-4" />,
  },
  {
    title: "Recipes",
    href: "/pos-operations/mapping/recipes",
    icon: <Utensils className="h-4 w-4" />,
  },
  {
    title: "Units",
    href: "/pos-operations/mapping/units",
    icon: <Ruler className="h-4 w-4" />,
  },
]

export function MappingNav() {
  const pathname = usePathname()

  return (
    <nav className="flex space-x-2">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === item.href
              ? "bg-accent text-accent-foreground"
              : "transparent"
          )}
        >
          {item.icon}
          <span className="ml-2">{item.title}</span>
        </Link>
      ))}
    </nav>
  )
} 