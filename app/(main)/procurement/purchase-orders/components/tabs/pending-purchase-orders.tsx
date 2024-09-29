'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"
import { useEffect } from "react"
import StatusBadge from "@/components/ui/custom-status-badge"

// Mock data for demonstration
const poData = [
  {
    poNumber: "PO-001",
    vendor: "Acme Supplies",
    deliveryDate: "2023-07-15",
    qtyToReceive: 100,
    units: "pcs",
    locationsOrdered: ["Warehouse A", "Store B"],
  },
  {
    poNumber: "PO-002",
    vendor: "Global Goods",
    deliveryDate: "2023-07-20",
    qtyToReceive: 50,
    units: "boxes",
    locationsOrdered: ["Store C"],
  },
  {
    poNumber: "PO-003",
    vendor: "Tech Solutions",
    deliveryDate: "2023-07-25",
    qtyToReceive: 200,
    units: "units",
    locationsOrdered: ["Warehouse B", "Store A", "Store D"],
  },
]

// Sample item data
const itemData = {
  name: "Organic Quinoa",
  description: "Premium organic white quinoa grains",
  status: "Accepted",
  requestedQuantity: 500,
  approvedQuantity: 450,
  unit: "Kg"
}

export function PendingPurchaseOrdersComponent() {
  const totalOnOrder = poData.reduce((total, po) => total + po.qtyToReceive, 0)

  useEffect(() => {
    console.log("poData", poData);
  }, [poData]);

  const handleClose = () => {
    // Implement close functionality here
    console.log("Close button clicked")
  }

  return (
    <>
      
        
      <Card className="w-full mx-auto relative">
        <CardHeader className="bg-muted">
          <CardTitle>{itemData.name}</CardTitle>
          <CardDescription>{itemData.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[50vh] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">PO #</TableHead>
                  <TableHead className="min-w-[150px]">Vendor</TableHead>
                  <TableHead className="min-w-[120px]">Delivery Date</TableHead>
                  <TableHead className="min-w-[120px]">Qty to Receive</TableHead>
                  <TableHead className="min-w-[80px]">Units</TableHead>
                  <TableHead className="min-w-[200px]">Locations Ordered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {poData.map((po) => (
                  <TableRow key={po.poNumber}>
                    <TableCell className="font-medium">{po.poNumber}</TableCell>
                    <TableCell>{po.vendor}</TableCell>
                    <TableCell>{po.deliveryDate}</TableCell>
                    <TableCell>{po.qtyToReceive}</TableCell>
                    <TableCell>{po.units}</TableCell>
                    <TableCell>{po.locationsOrdered.join(", ")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          <div className="mt-4 flex items-center space-x-2">
            <span className="font-semibold text-sm text-muted-foreground">Total on Order:</span>
            <span className="font-bold text-lg">{totalOnOrder}</span>
          </div>
        </CardContent>
      </Card>
    </>
  )
}