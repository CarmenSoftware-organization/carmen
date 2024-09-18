 "use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Sample data for inventory locations
const inventoryData = [
  {
    location: "Warehouse A",
    quantityOnHand: 500,
    units: "pcs",
    par: 600,
    reorderPoint: 400,
    minStock: 300,
    maxStock: 800,
  },
  {
    location: "Store B",
    quantityOnHand: 150,
    units: "pcs",
    par: 200,
    reorderPoint: 100,
    minStock: 50,
    maxStock: 250,
  },
  {
    location: "Distribution Center C",
    quantityOnHand: 1000,
    units: "pcs",
    par: 1200,
    reorderPoint: 800,
    minStock: 600,
    maxStock: 1500,
  },
]

export default function InventoryBreakdown() {

  return (
    <>
          <Table className="w-full mx-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Location</TableHead>
                <TableHead>Quantity On Hand</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Par</TableHead>
                <TableHead>Reorder Point</TableHead>
                <TableHead>Min Stock</TableHead>
                <TableHead>Max Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryData.map((item) => (
                <TableRow key={item.location}>
                  <TableCell className="font-medium">{item.location}</TableCell>
                  <TableCell>{item.quantityOnHand}</TableCell>
                  <TableCell>{item.units}</TableCell>
                  <TableCell>{item.par}</TableCell>
                  <TableCell>{item.reorderPoint}</TableCell>
                  <TableCell>{item.minStock}</TableCell>
                  <TableCell>{item.maxStock}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
    </>
  )
}