import Link from "next/link"
import { MobileNav } from "@/components/mobile-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart2 } from "lucide-react"
import { ArrowRightIcon } from "@radix-ui/react-icons"

export default function StockTakePage() {
  // Mock data for stock take sessions
  const stockTakeSessions = [
    {
      id: "ST-2023-001",
      name: "Weekly Stock Take - Main Kitchen",
      outlet: "Main Kitchen",
      status: "Assigned",
      date: "May 11, 2025",
      items: 120,
    },
    {
      id: "ST-2023-002",
      name: "Weekly Stock Take - Restaurant",
      outlet: "Restaurant",
      status: "In Progress",
      date: "May 11, 2025",
      items: 85,
      progress: 45,
    },
    {
      id: "ST-2023-003",
      name: "Monthly Beverage Stock Take",
      outlet: "Bar",
      status: "Completed",
      date: "May 10, 2025",
      items: 65,
    },
    {
      id: "ST-2023-004",
      name: "Quarterly Dry Goods Stock Take",
      outlet: "Main Kitchen",
      status: "Completed",
      date: "May 5, 2025",
      items: 210,
    },
  ]

  return (
    <>
      <MobileNav />
      <div className="container max-w-md mx-auto pt-20 pb-20 px-4">
        <h1 className="text-2xl font-bold mb-4">Stock Take</h1>
        <h2 className="text-lg font-medium text-muted-foreground mb-6">Physical Inventory Count</h2>

        <div className="grid gap-3 mt-6">
          {stockTakeSessions.map((session) => (
            <Card key={session.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{session.name}</div>
                    <Badge
                      variant={
                        session.status === "Completed"
                          ? "outline"
                          : session.status === "In Progress"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {session.status}
                    </Badge>
                  </div>
                  <div className="text-sm mb-2">
                    <span className="font-medium">Outlet:</span> {session.outlet}
                  </div>
                  <div className="text-sm mb-2">
                    <span className="font-medium">Date:</span> {session.date}
                  </div>
                  <div className="text-sm mb-2">
                    <span className="font-medium">Items:</span> {session.items}
                  </div>

                  {session.status === "In Progress" && (
                    <div className="mt-2">
                      <div className="text-xs text-muted-foreground mb-1">
                        Progress: {session.progress} of {session.items} items
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(session.progress! / session.items) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t p-3 bg-muted/50">
                  <Link
                    href={
                      session.status === "Completed" ? `/stock-take/${session.id}/review` : `/stock-take/${session.id}`
                    }
                  >
                    <Button variant="ghost" className="w-full justify-between">
                      {session.status === "Assigned"
                        ? "Start Stock Take"
                        : session.status === "In Progress"
                          ? "Continue Stock Take"
                          : "View Results"}
                      <ArrowRightIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <BarChart2 className="h-12 w-12 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">
            Stock takes help ensure inventory accuracy and identify discrepancies.
          </p>
        </div>
      </div>
    </>
  )
}
