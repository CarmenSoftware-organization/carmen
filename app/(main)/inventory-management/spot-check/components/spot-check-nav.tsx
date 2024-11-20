"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ListChecks,
  Building2,
  Package,
  FileText,
  PlayCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface MenuItem {
  title: string
  icon: any
  path?: string
  items?: {
    title: string
    description: string
    icon: any
    path: string
  }[]
}

const menuItems: MenuItem[] = [
  {
    title: "Active Counts",
    icon: PlayCircle,
    path: "/inventory-management/spot-check/active",
  },
  {
    title: "New Count",
    icon: ListChecks,
    items: [
      {
        title: "Zone Selection",
        description: "Select zones for inventory count: Kitchen, Housekeeping, Storage",
        icon: Building2,
        path: "/inventory-management/spot-check/new/zones",
      },
      {
        title: "Item Selection",
        description: "Search and select multiple items for counting",
        icon: Package,
        path: "/inventory-management/spot-check/new/items",
      },
      {
        title: "Count Details",
        description: "Enter counter details and notes",
        icon: FileText,
        path: "/inventory-management/spot-check/new/details",
      },
    ],
  },
]

export function SpotCheckNav() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const handleMenuClick = (section: MenuItem) => {
    if (section.path) {
      router.push(section.path)
    } else {
      setActiveSection(activeSection === section.title ? null : section.title)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Spot Check</CardTitle>
        <CardDescription>
          Inventory spot check management and tracking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {menuItems.map((section) => (
              <div key={section.title}>
                <Button
                  variant={section.path ? "default" : "ghost"}
                  className="w-full justify-start gap-2 h-auto py-2"
                  onClick={() => handleMenuClick(section)}
                >
                  <section.icon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">{section.title}</div>
                  </div>
                </Button>
                
                {activeSection === section.title && section.items && (
                  <div className="mt-2 ml-7 space-y-2">
                    {section.items.map((item) => (
                      <Button
                        key={item.title}
                        variant="ghost"
                        className="w-full justify-start gap-2 h-auto py-2"
                        onClick={() => router.push(item.path)}
                      >
                        <item.icon className="h-4 w-4" />
                        <div className="text-left">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.description}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
                <Separator className="my-4" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
