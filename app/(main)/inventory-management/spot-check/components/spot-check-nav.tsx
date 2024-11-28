"use client"

import { useRouter } from "next/navigation"
import {
  ListChecks,
  Plus,
  History,
  Settings,
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

interface MenuItem {
  title: string
  description: string
  icon: any
  path: string
}

const menuItems: MenuItem[] = [
  {
    title: "New Count",
    description: "Start a new spot check count",
    icon: Plus,
    path: "/inventory-management/spot-check/new",
  },
  {
    title: "Active Counts",
    description: "View and manage ongoing counts",
    icon: ListChecks,
    path: "/inventory-management/spot-check/active",
  },
  {
    title: "Completed",
    description: "View completed spot checks",
    icon: History,
    path: "/inventory-management/spot-check/completed",
  },
  {
    title: "Settings",
    description: "Configure spot check preferences",
    icon: Settings,
    path: "/inventory-management/spot-check/settings",
  },
]

export function SpotCheckNav() {
  const router = useRouter()

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Spot Check</CardTitle>
        <CardDescription>
          Quick inventory verification and spot checking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="grid gap-4 md:grid-cols-2">
            {menuItems.map((item) => (
              <Button
                key={item.title}
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => handleNavigation(item.path)}
              >
                <div className="flex items-start gap-4">
                  <item.icon className="h-5 w-5 mt-0.5" />
                  <div className="text-left">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
