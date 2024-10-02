"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { useEffect } from "react";
import StatusBadge from "@/components/ui/custom-status-badge";
import { DialogFooter } from "@/components/ui/dialog";

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
];

// Sample item data
const itemData = {
  name: "Organic Quinoa",
  description: "Premium organic white quinoa grains",
  status: "Accepted",
  requestedQuantity: 500,
  approvedQuantity: 450,
  unit: "Kg",
};

export function PendingPurchaseOrdersComponent() {
  const totalOnOrder = poData.reduce((total, po) => total + po.qtyToReceive, 0);

  useEffect(() => {
    console.log("poData", poData);
  }, [poData]);

  const handleClose = () => {
    // Implement close functionality here
    console.log("Close button clicked");
  };

  return (
    <>
      <div className="flex flex-col bg-muted p-4 rounded-md">
        <div className="flex justify-between items-center mb-2 ">
          <h2 className="text-xl font-bold">{itemData.name}</h2>
          <StatusBadge status={itemData.status} />
        </div>
        <p className="text-gray-600 mb-2">{itemData.description}</p>
        <div className="flex justify-between text-sm text-gray-500">
          <span>
            Requested: {itemData.requestedQuantity} {itemData.unit}
          </span>
          <span>
            Approved: {itemData.approvedQuantity} {itemData.unit}
          </span>
        </div>
      </div>
      {/* <div className="flex justify-between text-sm text-gray-500">
          <span>Requested: {itemData.requestedQuantity} {itemData.unit}</span>
          <span>Approved: {itemData.approvedQuantity} {itemData.unit}</span>
        </div> */}

      <div>
        <ScrollArea className="max-h-auto w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">PO #</TableHead>
                <TableHead className="min-w-[150px]">Vendor</TableHead>
                <TableHead className="min-w-[120px]">Delivery Date</TableHead>
                <TableHead className="min-w-[120px]">Qty to Receive</TableHead>
                <TableHead className="min-w-[80px]">Units</TableHead>
                <TableHead className="min-w-[200px]">
                  Locations Ordered
                </TableHead>
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
        <DialogFooter>
          <div className="mt-4 flex items-center space-x-2">
            <span className="font-semibold text-sm text-muted-foreground">
              Total on Order:
            </span>
            <span className="font-bold text-lg">{totalOnOrder}</span>
          </div>
        </DialogFooter>
      </div>
    </>
  );
}
