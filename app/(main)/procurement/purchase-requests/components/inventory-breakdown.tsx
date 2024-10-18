"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/custom-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import StatusBadge from "@/components/ui/custom-status-badge"

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

// Sample item data
const itemData = {
  name: "Organic Quinoa ccc",
  description: "Premium organic white quinoa grains",
  status: "Accepted",
}

export default function InventoryBreakdown() {
  return (
    <>
      <div className="mb-6 bg-muted p-4 rounded-md">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">{itemData.name}</h2>
          <StatusBadge status={itemData.status} />
        </div>
        <p className="text-gray-600">{itemData.description}</p>
      </div>
      <Table className="w-full mx-auto">
        <TableHeader>
          <TableRow className="text-nowrap">
            <TableHead className="w-[180px]">Location</TableHead>
            <TableHead >Quantity On Hand</TableHead>
            <TableHead>Units</TableHead>
            <TableHead >Par</TableHead>
            <TableHead >Reorder Point</TableHead>
            <TableHead >Min Stock</TableHead>
            <TableHead >Max Stock</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventoryData.map((item) => (
            <TableRow className="text-nowrap" key={item.location}>
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