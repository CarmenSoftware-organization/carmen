import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PurchaseOrderItem, PurchaseOrder } from '@/lib/types';

interface ItemsTabProps {
  onUpdateItem: (updatedItem: PurchaseOrderItem) => void;
  onDeleteItem: (itemId: string) => void;
  onAddItem: (newItem: PurchaseOrderItem) => void;
  poData: PurchaseOrder;
}

export default function ItemsTab({ onUpdateItem, onDeleteItem, onAddItem, poData }: ItemsTabProps) {
   console.log("Items received in ItemsTab:", poData.items);

  if (!poData.items || poData.items.length === 0) {
    return <p>No items found for this purchase order.</p>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Not Received': return 'bg-red-100 text-red-800';
      case 'Partially Received': return 'bg-yellow-100 text-yellow-800';
      case 'Fully Received': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Purchase Order Items</h2>
        <Button onClick={() => onAddItem({ id: 'new', name: 'New Item' } as PurchaseOrderItem)}>
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {poData.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>{item.orderedQuantity} {item.orderUnit}</TableCell>
              <TableCell>{item.receivedQuantity} {item.orderUnit}</TableCell>
              <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
              <TableCell>${item.totalPrice.toFixed(2)}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
