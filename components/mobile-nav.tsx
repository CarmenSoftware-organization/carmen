"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Home, Package, ClipboardCheck, BarChart2, Menu, LogOut, Building } from "lucide-react"
import { MagnifyingGlassIcon, PersonIcon } from "@radix-ui/react-icons"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      href: "/receiving",
      label: "Receiving",
      icon: <Package className="h-5 w-5" />,
    },
    {
      href: "/pr-approval",
      label: "PR Approval",
      icon: <ClipboardCheck className="h-5 w-5" />,
    },
    {
      href: "/stock-take",
      label: "Stock Take",
      icon: <BarChart2 className="h-5 w-5" />,
    },
    {
      href: "/spot-check",
      label: "Spot Check",
      icon: <MagnifyingGlassIcon className="h-5 w-5" />,
    },
    {
      href: "/profile",
      label: "Profile",
      icon: <PersonIcon className="h-5 w-5" />,
    },
  ]

  return (
    <>
      <div className="fixed bottom-0 left-0 z-40 w-full h-16 bg-background border-t">
        <div className="grid h-full grid-cols-5 mx-auto">
          {routes.slice(0, 5).map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`inline-flex flex-col items-center justify-center px-5 group ${
                pathname === route.href ? "text-primary" : "text-muted-foreground hover:text-primary"
              }`}
            >
              {route.icon}
              <span className="text-xs mt-1">{route.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="fixed top-0 left-0 z-40 w-full h-14 bg-background border-b flex items-center justify-between px-4">
        <div className="flex items-center">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 pt-10">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 px-2">
                  <Building className="h-5 w-5 text-primary" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Grand Hotel - Main Kitchen</span>
                    <span className="text-xs text-muted-foreground">New York</span>
                  </div>
                </div>
                <div className="space-y-1 mt-4">
                  {routes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-2 py-3 text-sm rounded-md ${
                        pathname === route.href
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      {route.icon}
                      {route.label}
                    </Link>
                  ))}
                </div>
                <div className="mt-auto pt-4 border-t">
                  <Link
                    href="/"
                    className="flex items-center gap-3 px-2 py-3 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div className="ml-4">
            <img src="/avatars/placeholder.svg?height=24&width=80" alt="Carmen Siftware" className="h-6" />
          </div>
        </div>
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="rounded-full">
            <PersonIcon className="h-5 w-5" />
            <span className="sr-only">Profile</span>
          </Button>
        </Link>
      </div>
    </>
  )
}
