import Link from "next/link"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, MapPin, Building, DollarSign } from "lucide-react"
import { ArrowLeftIcon, CalendarIcon } from "@radix-ui/react-icons"

export default function PODetailPage({ params }: { params: { id: string } }) {
  const poId = params.id

  // Mock data for PO details
  const poDetails = {
    id: poId,
    vendor: "Fresh Produce Inc.",
    expectedDelivery: "Today, 10:00 AM",
    status: "Open",
    location: "Main Kitchen",
    value: "$1,245.50",
    items: [
      {
        id: "1",
        name: "Tomatoes, Roma",
        sku: "VEG-TOM-001",
        uom: "KG",
        orderedQty: 25,
        outstandingQty: 25,
        price: 3.99,
        tax: 0,
      },
      {
        id: "2",
        name: "Lettuce, Iceberg",
        sku: "VEG-LET-002",
        uom: "EA",
        orderedQty: 15,
        outstandingQty: 15,
        price: 2.49,
        tax: 0,
      },
      {
        id: "3",
        name: "Onions, Yellow",
        sku: "VEG-ONI-003",
        uom: "KG",
        orderedQty: 20,
        outstandingQty: 20,
        price: 1.99,
        tax: 0,
      },
      {
        id: "4",
        name: "Peppers, Bell",
        sku: "VEG-PEP-004",
        uom: "KG",
        orderedQty: 10,
        outstandingQty: 10,
        price: 4.99,
        tax: 0,
      },
      {
        id: "5",
        name: "Cucumbers",
        sku: "VEG-CUC-005",
        uom: "KG",
        orderedQty: 12,
        outstandingQty: 12,
        price: 2.99,
        tax: 0,
      },
    ],
  }

  return (
    <>
      <MobileNav />
      <div className="container max-w-md mx-auto pt-20 pb-20 px-4">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/receiving">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Purchase Order Details</h1>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{poDetails.id}</CardTitle>
              <Badge>{poDetails.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span>{poDetails.vendor}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>{poDetails.expectedDelivery}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>Delivery to: {poDetails.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>Grand Hotel - Main Kitchen</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>Total Value: {poDetails.value}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-lg font-medium mb-3">Line Items</h2>
        <div className="border rounded-md overflow-hidden mb-6">
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 p-3 bg-muted text-sm font-medium">
            <div>Item</div>
            <div className="text-right">Ordered</div>
            <div className="text-right">Outstanding</div>
          </div>

          {poDetails.items.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_auto_auto] gap-2 p-3 border-t text-sm">
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-muted-foreground">
                  {item.sku} | {item.uom}
                </div>
              </div>
              <div className="text-right self-center">{item.orderedQty}</div>
              <div className="text-right self-center">{item.outstandingQty}</div>
            </div>
          ))}
        </div>

        <Link href={`/receiving/${poId}/receive`}>
          <Button className="w-full">Start Receiving</Button>
        </Link>
      </div>
    </>
  )
}
