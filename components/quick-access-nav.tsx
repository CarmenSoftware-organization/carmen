"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, ShoppingCart, FileText, Users, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface QuickLink {
  name: string
  path: string
  icon: React.ElementType
  description?: string
}

const quickLinks: QuickLink[] = [
  {
    name: "POS Transactions",
    path: "/system-administration/system-integrations/pos/transactions",
    icon: FileText,
    description: "View and manage POS transactions"
  },
  {
    name: "User Management",
    path: "/system-administration/user-management",
    icon: Users,
    description: "Manage user accounts and permissions"
  },
  {
    name: "System Settings",
    path: "/system-administration",
    icon: Settings,
    description: "Configure system settings"
  },
  {
    name: "POS Integration",
    path: "/system-administration/system-integrations/pos",
    icon: ShoppingCart,
    description: "Configure POS system integrations"
  },
]

export function QuickAccessNav() {
  const pathname = usePathname()
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-2 text-foreground dark:text-gray-100 dark:border-gray-600"
        >
          <Menu className="h-4 w-4 mr-1" />
          Quick Access
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-[240px] bg-background dark:bg-gray-800 border dark:border-gray-700"
      >
        <DropdownMenuLabel className="text-foreground dark:text-gray-100">
          Navigation Shortcuts
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="dark:border-gray-700" />
        {quickLinks.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.path
          
          return (
            <DropdownMenuItem 
              key={link.path} 
              asChild 
              className={cn(
                "cursor-pointer",
                isActive ? "bg-accent dark:bg-gray-700" : "",
                "text-foreground dark:text-gray-100",
                "focus:bg-accent dark:focus:bg-gray-700",
                "hover:bg-accent dark:hover:bg-gray-700"
              )}
            >
              <Link href={link.path} className="flex items-start gap-2">
                <Icon className="h-4 w-4 mt-0.5" />
                <div>
                  <div className="font-medium">{link.name}</div>
                  {link.description && (
                    <div className="text-xs text-muted-foreground dark:text-gray-400">
                      {link.description}
                    </div>
                  )}
                </div>
              </Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 