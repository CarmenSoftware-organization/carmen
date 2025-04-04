'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect } from "react"

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
  name: "Organic Quinoa xcx",
  description: "Premium organic white quinoa grains",
  status: "Accepted",
  requestedQuantity: 500,
  approvedQuantity: 450,
  unit: "Kg"
}

export function PendingPurchaseOrdersComponent() {
  const totalOnOrder = poData.reduce((total, po) => total + po.qtyToReceive, 0)

  useEffect(() => {
    console.log("poData", poData)
  }, [])

  return (
    <>
      <div className="w-full mx-auto p-4">
        <div className="bg-muted p-4 mb-4">
          <h2 className="text-xl font-bold">{itemData.name}</h2>
          <p className="text-sm text-muted-foreground">{itemData.description}</p>
        </div>
        <ScrollArea className="max-h-[50vh] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">PO #</TableHead>
                <TableHead className="min-w-[150px]">Vendor</TableHead>
                <TableHead className="min-w-[120px]">Delivery Date</TableHead>
                <TableHead className="min-w-[120px]">Remaining Qty</TableHead>
                <TableHead className="min-w-[80px]">Inventory Units</TableHead>
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
      </div>
    </>
  )
}