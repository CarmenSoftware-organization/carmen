import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  CurrencyCode,
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseRequestItem,
} from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Gift,
  MoreHorizontal,
  Plus,
  FileText,
  Edit,
  MessageSquare,
  Split,
  Trash2,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { ScrollBar, ScrollArea } from "@/components/ui/scroll-area";
import { ItemDetailsComponent } from "./item-details";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/custom-dialog";
import StatusBadge from "@/components/ui/custom-status-badge";

interface ItemsTabProps {
  onUpdateItem: (updatedItem: PurchaseOrderItem) => void;
  onDeleteItem: (itemId: string) => void;
  onAddItem: (newItem: PurchaseOrderItem) => void;
  poData: PurchaseOrder;
}

export default function ItemsTab({ poData, onUpdateItem, onAddItem, onDeleteItem }: ItemsTabProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState<Partial<PurchaseOrderItem>>({
    itemName: "",
    description: "",
    orderedQuantity: 0,
    orderUnit: "",
    baseQuantity: 0,
    baseUnit: "",
    baseReceivingQty: 0,
    unitPrice: 0,
    isFOC: false,
    taxIncluded: false,
    adjustments: {
      discount: false,
      tax: false,
    },
    taxRate: 0.07,
    taxAmount: 0.0,
    discountRate: 0.0,
    discountAmount: 0.0,
  });

  const [editingItem, setEditingItem] = useState<PurchaseOrderItem | null>(
    null
  );
  const [viewingItem, setViewingItem] = useState<PurchaseOrderItem | null>(
    null
  );
  const [isAddItemFormOpen, setIsAddItemFormOpen] = useState(false);

  const handleExport = () => {
    // if (!poData) {
    //   console.error('No purchase order data available for export.');
    //   return
    // }
    // console.log('Exporting PO data:', poData);
  };

  const selectedItemsCount = useMemo(
    () => selectedItems.length,
    [selectedItems]
  );
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // const toggleAllSelection = () => {
  //   if (selectedItems.length === poData.items.length) setSelectedItems([])
  //   else setSelectedItems(poData.items.map((item: PurchaseOrderItem) => item.id))
  // }
  // };

  // const toggleItemExpansion = (itemId: string) => {
  //   setExpandedItems(prev =>
  //     prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
  //   );

  // const getStatusColor = (status: Item['status']) => {
  //   switch (status) {
  //     case 'Not Received': return 'bg-red-500';
  //     case 'Partially Received': return 'bg-yellow-500';
  //     case 'Fully Received': return 'bg-green-500';
  //   }
  // };

  const handleBulkAction = (action: string) => {
    switch (action) {
      case "setFullyReceived":
        // updateItemsStatus('Fully Received');
        break;
      case "delete":
        // console.log('Bulk cancel items:', selectedItems);
        break;
      default:
        console.log(`Unknown bulk action: ${action}`);
    }
  };

  // const updateItemsStatus = (newStatus: PurchaseOrderItem['status']) => {
  //   const updatedItems = poData.items.map(item =>
  //     selectedItems.includes(item.id)
  //       ? { ...item, status: newStatus }
  //       : item
  //   );
  //   updatedItems.forEach(item => {
  //     if (selectedItems.includes(item.id)) {
  //       onUpdateItem(item);
  //     }
  //   });
  //   setSelectedItems([]);
  // };

  const handleViewDetails = (item: PurchaseOrderItem) => {
    setViewingItem(item);
  };

  const handleEditItem = (item: PurchaseOrderItem) => {
    setEditingItem(item);
  };

  const handleAddNote = (item: PurchaseOrderItem) => {
    // Implement add note logic
    console.log("Add note to item:", item);
  };

  const handleSplitLine = (item: PurchaseOrderItem) => {
    // Implement split line logic
    console.log("Split line for item:", item);
  };

  const handleCancelItem = (item: PurchaseOrderItem) => {
    // Implement cancel item logic
    console.log("Cancel item:", item);
  };

  interface Props {
    poData: { items: PurchaseOrderItem[] };
    onUpdateItem: (item: PurchaseOrderItem) => void;
  }

  function handleUnitChange(
    { poData, onUpdateItem }: Props,
    itemId: string,
    newUnit: string
  ) {
    const updatedItem = poData.items.find((item) => item.id === itemId);
    if (!updatedItem) return;

    updatedItem.orderUnit = newUnit;
    onUpdateItem(updatedItem);
  }

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
            onClose={() => setEditingItem(null)}
            onSubmit={handleItemUpdate}
            isOpen={!!editingItem}
            initialData={editingItem}
          />
        )}

        {viewingItem && (
          <ItemDetailsComponent
            initialMode="view"
            onClose={() => setViewingItem(null)}
            onSubmit={() => {}}
            isOpen={!!viewingItem}
            initialData={viewingItem}
          />
        )}

        {selectedItemsCount > 0 && (
          <div className="bg-secondary/10 p-3 rounded-md mb-4 flex justify-between items-center">
            <span className="text-sm font-medium">
              {selectedItemsCount} item{selectedItemsCount !== 1 ? "s" : ""}{" "}
              selected
            </span>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction("accept")}
              >
                Accept All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction("reject")}
              >
                Reject All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction("review")}
              >
                Review All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction("split")}
              >
                Split All
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={
                      selectedItems.length === poData.items.length &&
                      poData.items.length > 0
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedItems(
                          poData.items.map((item) => item.id)
                        );
                      } else {
                        setSelectedItems([]);
                      }
                    }}
                    aria-label="Select all items"
                  />
                </TableHead>
                <TableHead className="w-[100px]">PO Item</TableHead>
                <TableHead className="w-[200px]">Item Name</TableHead>
                <TableHead className="w-[200px]">Description</TableHead>
                <TableHead className="w-[100px] text-right">Order Qty</TableHead>
                <TableHead className="w-[100px]">Unit</TableHead>
                <TableHead className="w-[120px] text-right">Unit Price</TableHead>
                <TableHead className="w-[120px] text-right">Tax</TableHead>
                <TableHead className="w-[120px] text-right">Discount</TableHead>
                <TableHead className="w-[120px] text-right">Amount</TableHead>
                <TableHead className="w-[120px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {poData?.items.map((item, index) => (
                <TableRow
                  key={item.id}
                  className={
                    selectedItems.includes(item.id) ? "bg-secondary/10" : ""
                  }
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => toggleItemSelection(item.id)}
                    />
                  </TableCell>
                  <TableCell>{item.id.substring(0, 6)}</TableCell>
                  <TableCell>{item.itemName}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {item.description}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.orderedQuantity}
                  </TableCell>
                  <TableCell>{item.orderUnit}</TableCell>
                  <TableCell className="text-right">
                    {item.unitPrice?.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.taxAmount?.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.discountAmount?.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {(
                      item.orderedQuantity * item.unitPrice -
                      (item.discountAmount || 0) +
                      (item.taxAmount || 0)
                    ).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(item)}
                        className="h-8 w-8 rounded-full"
                      >
                        <span className="sr-only">View details</span>
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditItem(item)}
                        className="h-8 w-8 rounded-full"
                      >
                        <span className="sr-only">Edit item</span>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCancelItem(item)}
                        className="h-8 w-8 rounded-full"
                      >
                        <span className="sr-only">Delete item</span>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAddNote(item)}
                        className="h-8 w-8 rounded-full"
                      >
                        <span className="sr-only">Add note</span>
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  );
}