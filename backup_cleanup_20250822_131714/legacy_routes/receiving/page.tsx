import Link from "next/link"
import { MobileNav } from "@/components/mobile-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter } from "lucide-react"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"

export default function ReceivingPage() {
  // Mock data for POs
  const purchaseOrders = [
    {
      id: "PO-2023-001",
      vendor: "Fresh Produce Inc.",
      expectedDelivery: "Today, 10:00 AM",
      status: "Open",
      location: "Main Kitchen",
      value: "$1,245.50",
    },
    {
      id: "PO-2023-002",
      vendor: "Seafood Suppliers",
      expectedDelivery: "Today, 11:30 AM",
      status: "Open",
      location: "Main Kitchen",
      value: "$876.25",
    },
    {
      id: "PO-2023-003",
      vendor: "Meat Masters",
      expectedDelivery: "Today, 2:00 PM",
      status: "Open",
      location: "Restaurant",
      value: "$1,532.75",
    },
    {
      id: "PO-2023-004",
      vendor: "Bakery Goods",
      expectedDelivery: "Today, 3:30 PM",
      status: "Open",
      location: "Main Kitchen",
      value: "$435.60",
    },
    {
      id: "PO-2023-005",
      vendor: "Dairy Delights",
      expectedDelivery: "Tomorrow, 9:00 AM",
      status: "Scheduled",
      location: "Main Kitchen",
      value: "$678.90",
    },
    {
      id: "PO-2023-006",
      vendor: "Fresh Produce Inc.",
      expectedDelivery: "Today, 9:00 AM",
      status: "Partially Received",
      location: "Restaurant",
      value: "$945.30",
    },
  ]

  return (
    <>
      <MobileNav />
      <div className="container max-w-md mx-auto pt-20 pb-20 px-4">
        <h1 className="text-2xl font-bold mb-4">Receiving</h1>
        <h2 className="text-lg font-medium text-muted-foreground mb-6">Today&apos;s Deliveries</h2>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search PO or vendor..." className="pl-8" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[130px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vendors</SelectItem>
              <SelectItem value="fresh-produce">Fresh Produce</SelectItem>
              <SelectItem value="seafood">Seafood</SelectItem>
              <SelectItem value="meat">Meat</SelectItem>
              <SelectItem value="bakery">Bakery</SelectItem>
              <SelectItem value="dairy">Dairy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-3 mt-6">
          {purchaseOrders.map((po) => (
            <Link href={`/receiving/${po.id}`} key={po.id}>
              <Card className="hover:bg-accent transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{po.id}</div>
                    <Badge
                      variant={
                        po.status === "Partially Received"
                          ? "outline"
                          : po.status === "Scheduled"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {po.status}
                    </Badge>
                  </div>
                  <div className="text-sm mb-2">{po.vendor}</div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <div>{po.expectedDelivery}</div>
                    <div>{po.value}</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Location: {po.location}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
