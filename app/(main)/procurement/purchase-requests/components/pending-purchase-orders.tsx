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
import { DialogFooter } from "@/components/ui/custom-dialog";

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
    <div className="space-y-4">
      <Card className="bg-muted">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
            <h2 className="text-xl font-bold mb-2 sm:mb-0">{itemData.name}</h2>
            <StatusBadge status={itemData.status} />
          </div>
          <p className="text-gray-600 mb-2">{itemData.description}</p>
          <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-500">
            <span className="mb-1 sm:mb-0">
              Requested: {itemData.requestedQuantity} {itemData.unit}
            </span>
            <span>
              Approved: {itemData.approvedQuantity} {itemData.unit}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[80px]">PO #</TableHead>
                  <TableHead className="min-w-[150px]">Vendor</TableHead>
                  <TableHead className="min-w-[120px]">Delivery Date</TableHead>
                  <TableHead className="min-w-[80px]">Remaining Qty</TableHead>
                  <TableHead className="min-w-[80px]">Inventory Units</TableHead>
                  <TableHead className="min-w-[120px]">
                    Location
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
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm text-muted-foreground">
              Total on Order:
            </span>
            <span className="font-bold text-lg">{totalOnOrder}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
