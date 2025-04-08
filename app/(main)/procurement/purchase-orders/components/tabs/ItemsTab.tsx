"use client"
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ItemDetailsComponent } from "./item-details";
import StatusBadge, { BadgeStatus } from "@/components/ui/custom-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  PurchaseOrder,
  PurchaseOrderItem,
} from "@/lib/types";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Plus,
  Eye,
  Edit,
  X,
} from "lucide-react";

interface ItemsTabProps {
  onUpdateItem: (updatedItem: PurchaseOrderItem) => void;
  onAddItem: (newItem: PurchaseOrderItem) => void;
  onDeleteItem: (itemId: string) => void;
  poData: PurchaseOrder;
}

export default function ItemsTab({ onUpdateItem, onAddItem, onDeleteItem, poData }: ItemsTabProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewingItem, setViewingItem] = useState<PurchaseOrderItem | null>(
    null
  );

  console.log("ItemsTab received poData:", poData);
  console.log("ItemsTab received poData.items:", poData.items);

  // Ensure items is always an array
  const items = Array.isArray(poData.items) ? poData.items : [];
  console.log("ItemsTab processed items array:", items);

  const [editingItem, setEditingItem] = useState<PurchaseOrderItem | null>(
    null
  );

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleViewDetails = (item: PurchaseOrderItem) => {
    setViewingItem(item);
  };

  const handleEditItem = (item: PurchaseOrderItem) => {
    setEditingItem(item);
  };

  const handleCancelItem = (item: PurchaseOrderItem) => {
    // Implement cancel item logic
    console.log("Cancel item:", item);
    // Call the onDeleteItem prop with the item ID
    onDeleteItem(item.id);
  };

  const [isAddItemFormOpen, setIsAddItemFormOpen] = useState(false);

  const handleAddNewItem = (newItem: PurchaseOrderItem) => {
    onAddItem(newItem);
    setIsAddItemFormOpen(false);
  };

  const handleItemUpdate = (updatedItem: PurchaseOrderItem) => {
    onUpdateItem(updatedItem);
    setEditingItem(null);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4 w-full bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center w-full mb-4">
          <h2 className="text-lg font-semibold">Item Details</h2>
          <Button 
            onClick={() => setIsAddItemFormOpen(true)} 
            className="bg-primary text-white dark:bg-gray-700 dark:text-gray-100"
          >
            <Plus className="mr-2 h-4 w-4"/> Add Item
          </Button>
        </div>

        {isAddItemFormOpen && (
          <ItemDetailsComponent
            initialMode="add"
            onClose={() => setIsAddItemFormOpen(false)}
            onSubmit={handleAddNewItem}
            isOpen={isAddItemFormOpen}
          />
        )}

        {editingItem && (
          <ItemDetailsComponent
            initialMode="edit"
            initialData={editingItem}
            onClose={() => setEditingItem(null)}
            onSubmit={handleItemUpdate}
            isOpen={!!editingItem}
          />
        )}

        {viewingItem && (
          <ItemDetailsComponent
            initialMode="view"
            initialData={viewingItem}
            onClose={() => setViewingItem(null)}
            onSubmit={() => {}}
            isOpen={!!viewingItem}
          />
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={
                      items.length > 0 &&
                      selectedItems.length === items.length
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedItems(
                          items.map((item: PurchaseOrderItem) => item.id)
                        );
                      } else {
                        setSelectedItems([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No items found.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item: PurchaseOrderItem) => (
                  <TableRow key={item.id} className="group">
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => toggleItemSelection(item.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">
                      {item.orderedQuantity} {item.orderUnit}
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.unitPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${(item.orderedQuantity * item.unitPrice).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(item)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Details</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditItem(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit Item</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCancelItem(item)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete Item</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  );
}