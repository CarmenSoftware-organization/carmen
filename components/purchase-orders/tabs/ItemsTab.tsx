import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PurchaseOrderItem, PurchaseOrder, PurchaseRequestItemStatus, PurchaseOrderStatus } from '@/lib/types';


interface ItemsTabProps {
  onUpdateItem?: (itemId: string, field: string, value: string | number | boolean) => void;
  onDeleteItem?: (itemId: string) => void;
  onAddItem?: () => void;
  poData?: PurchaseOrder;
}

// Mock data for when no props are provided
const mockPurchaseOrder: PurchaseOrder = {
  poId: "PO-12345",
  number: "PO-12345-2023",
  vendorId: 1,
  vendorName: "Sample Vendor",
  orderDate: new Date(),
  status: PurchaseOrderStatus.Open,
  currencyCode: "USD",
  exchangeRate: 1,
  email: "vendor@example.com",
  buyer: "John Doe",
  creditTerms: "Net 30",
  description: "Office furniture purchase",
  remarks: "Delivery to main office",
  createdBy: 1,
  baseCurrencyCode: "USD",
  baseSubTotalPrice: 5099.70,
  subTotalPrice: 5099.70,
  baseNetAmount: 5099.70,
  netAmount: 5099.70,
  baseDiscAmount: 0,
  discountAmount: 0,
  baseTaxAmount: 0,
  taxAmount: 0,
  baseTotalAmount: 5099.70,
  totalAmount: 5099.70,
  items: [
    {
      id: "item-1",
      name: "Office Desk",
      description: "Standard office desk",
      convRate: 1,
      orderedQuantity: 10,
      orderUnit: "pcs",
      baseQuantity: 10,
      baseUnit: "pcs",
      baseReceivingQty: 5,
      receivedQuantity: 5,
      remainingQuantity: 5,
      unitPrice: 249.99,
      status: "Pending" as PurchaseRequestItemStatus,
      isFOC: false,
      taxRate: 0,
      discountRate: 0,
      baseSubTotalPrice: 2499.90,
      subTotalPrice: 2499.90,
      baseNetAmount: 2499.90,
      netAmount: 2499.90,
      baseDiscAmount: 0,
      discountAmount: 0,
      baseTaxAmount: 0,
      taxAmount: 0,
      baseTotalAmount: 2499.90,
      totalAmount: 2499.90,
      taxIncluded: false,
      inventoryInfo: {
        onHand: 20,
        onOrdered: 10,
        reorderLevel: 5,
        restockLevel: 25,
        averageMonthlyUsage: 8,
        lastPrice: 245.99,
        lastOrderDate: new Date(2023, 6, 10),
        lastVendor: "Previous Supplier Inc."
      }
    },
    {
      id: "item-2",
      name: "Office Chair",
      description: "Ergonomic office chair",
      convRate: 1,
      orderedQuantity: 20,
      orderUnit: "pcs",
      baseQuantity: 20,
      baseUnit: "pcs",
      baseReceivingQty: 20,
      receivedQuantity: 20,
      remainingQuantity: 0,
      unitPrice: 129.99,
      status: "Accepted" as PurchaseRequestItemStatus,
      isFOC: false,
      taxRate: 0,
      discountRate: 0,
      baseSubTotalPrice: 2599.80,
      subTotalPrice: 2599.80,
      baseNetAmount: 2599.80,
      netAmount: 2599.80,
      baseDiscAmount: 0,
      discountAmount: 0,
      baseTaxAmount: 0,
      taxAmount: 0,
      baseTotalAmount: 2599.80,
      totalAmount: 2599.80,
      taxIncluded: false,
      inventoryInfo: {
        onHand: 15,
        onOrdered: 20,
        reorderLevel: 10,
        restockLevel: 30,
        averageMonthlyUsage: 12,
        lastPrice: 125.99,
        lastOrderDate: new Date(2023, 7, 15),
        lastVendor: "Office Solutions Ltd."
      }
    }
  ]
};

export default function ItemsTab({ poData, onDeleteItem, onAddItem }: ItemsTabProps) {
  const data = poData || mockPurchaseOrder;

  const getStatusColor = (status: PurchaseRequestItemStatus) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500";
      case "Accepted":
        return "bg-green-500";
      case "Rejected":
        return "bg-red-500";
      case "Review":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Purchase Order Items</h2>
        <Button onClick={() => onAddItem?.()}>
          Add Item
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Ordered Qty</TableHead>
            <TableHead>Received Qty</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Total Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>{item.orderedQuantity} {item.orderUnit}</TableCell>
              <TableCell>{item.receivedQuantity} {item.orderUnit}</TableCell>
              <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
              <TableCell>${item.subTotalPrice.toFixed(2)}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(item.status as PurchaseRequestItemStatus)}>
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" onClick={() => onDeleteItem?.(item.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
