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
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Eye,
  Edit,
  MessageSquare,
  Split,
  X,
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

export default function ItemsTab({ poData, onUpdateItem, onAddItem }: ItemsTabProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState<Partial<PurchaseOrderItem>>({
    name: "",
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
            isOpen={!!viewingItem}
            initialData={viewingItem}
          />
        )}

        {selectedItems.length > 0 && (
          <div className="flex space-x-2 mb-4">
            <Button onClick={() => handleBulkAction("setFullyReceived")}>
              Set Fully Received
            </Button>
            <Button onClick={() => handleBulkAction("delete")}>
              Delete Selected
            </Button>
          </div>
        )}

        <div className="w-full overflow-auto">
          {poData.items.length > 0 ? (
            <div className="overflow-x-auto">
              <Table className="w-full min-w-[1400px]">
                <TableHeader>
                  <TableRow className="h-8">
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedItems.length === poData.items.length}
                        // onCheckedChange={toggleAllSelection}
                      />
                    </TableHead>
                    <TableHead className="min-w-[200px]">Product Name</TableHead>
                    <TableHead className="min-w-[120px]">Order Qty</TableHead>
                    <TableHead className="min-w-[120px]">Received Qty</TableHead>
                    <TableHead className="min-w-[120px]">Remaining Qty</TableHead>
                    <TableHead className="min-w-[80px]">Unit</TableHead>
                    <TableHead className="min-w-[100px]">Price</TableHead>
                    <TableHead className="min-w-[120px]">Net Amount</TableHead>
                    <TableHead className="min-w-[120px]">Tax Amount</TableHead>
                    <TableHead className="min-w-[120px]">Total Amount</TableHead>
                    <TableHead className="min-w-[150px]">Receiving Status</TableHead>
                    <TableHead className="min-w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {poData.items.map((item) => (
                    <TableRow key={item.id} className="h-10">
                      <TableCell className="py-1">
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => toggleItemSelection(item.id)}
                        />
                      </TableCell>
                      <TableCell className="py-1">
                        <div className="flex items-center">
                          <div>
                            <div>{item.name}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                          {item.isFOC && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Gift
                                  className="inline-block ml-2 text-blue-500"
                                  size={14}
                                />
                              </TooltipTrigger>
                              <TooltipContent>Free of Charge</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-1 text-right">
                        <div className="text-sm">
                          {item.orderedQuantity.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.baseQuantity.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className="py-1 text-right">
                        <div className="text-sm">
                          {item.receivedQuantity.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.baseReceivingQty.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className="py-1 text-right">
                        <div className="text-sm">
                          {item.remainingQuantity.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {(item.remainingQuantity * (item.baseQuantity / item.orderedQuantity)).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className="py-1 text-right">
                        <div className="text-sm">{item.orderUnit}</div>
                        <div className="text-xs text-gray-500">{item.baseUnit}</div>
                      </TableCell>
                      <TableCell className="py-1 text-right">
                        <div className="text-sm">
                          ${item.unitPrice.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${(item.unitPrice * (item.baseQuantity / item.orderedQuantity)).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className="py-1 text-right">
                        <div className="text-sm">
                          ${(item.subTotalPrice - item.taxAmount).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${((item.subTotalPrice - item.taxAmount) * (item.baseQuantity / item.orderedQuantity)).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className="py-1 text-right">
                        <div className="text-sm">
                          ${item.taxAmount.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${(item.taxAmount * (item.baseQuantity / item.orderedQuantity)).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className="py-1 text-right">
                        <div className="text-sm">
                          ${item.subTotalPrice.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${(item.subTotalPrice * (item.baseQuantity / item.orderedQuantity)).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className="py-1">
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className="py-1">
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(item)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditItem(item)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelItem(item)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p>No items available.</p>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

function onAddItem(newItem: PurchaseOrderItem) {
  throw new Error("Function not implemented.");
}

function setEditingItem(arg0: null) {
  throw new Error("Function not implemented.");
}