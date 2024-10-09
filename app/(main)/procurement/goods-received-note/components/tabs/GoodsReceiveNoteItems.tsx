"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Eye } from "lucide-react";
import { GoodsReceiveNoteMode, GoodsReceiveNoteItem } from "@/lib/types";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ItemDetailForm from "./itemDetailForm";

interface GoodsReceiveNoteItemsProps {
  mode: GoodsReceiveNoteMode;
  items: GoodsReceiveNoteItem[];
  onItemsChange: (items: GoodsReceiveNoteItem[]) => void;
  selectedItems: string[];
  onItemSelect: (itemId: string, isSelected: boolean) => void;
}

export function GoodsReceiveNoteItems({
  mode,
  items = [],
  onItemsChange,
  selectedItems,
  onItemSelect,
}: GoodsReceiveNoteItemsProps) {
  // const [expandedItems, setExpandedItems] = useState<string[]>([])

  // const toggleExpand = (id: string) => {
  //   setExpandedItems(prev =>
  //     prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
  //   )

  //   console.log(expandedItems);
  // }

  const handleOpenItemDetail = (item: GoodsReceiveNoteItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  }

  const handleItemChange = (
    id: string,
    field: keyof GoodsReceiveNoteItem,
    value: string | number | boolean
  ) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onItemsChange(updatedItems);
  };

  const handleSelectAll = (checked: boolean) => {
    onItemSelect("", checked); // Use empty string to indicate "select all"
  };

  const allSelected = items.length > 0 && selectedItems.length === items.length;

  if (items.length === 0) {
    return <div>No items available.</div>;
  }

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GoodsReceiveNoteItem | null>(null);

  const handleCloseItemDetail = () => {
    setIsDialogOpen(false);
    // Don't set selectedItem to null here
  };

  const handleSaveItemDetail = () => {
    // Implement save logic here
    // This might involve updating the item in the items array
    // and calling onItemsChange with the updated array
    setIsDialogOpen(false);
    // Don't set selectedItem to null here
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                disabled={mode === "view"}
              />
            </TableHead>
            <TableHead>Item Name</TableHead>
            <TableHead>Ordered Qty</TableHead>
            <TableHead>Received Qty</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Total Price</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <React.Fragment key={item.id}>
              <TableRow>
                <TableCell>
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={(checked) =>
                      onItemSelect(item.id, checked as boolean)
                    }
                    disabled={mode === "view"}
                  />
                </TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.orderedQuantity}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.receivedQuantity}
                    onChange={(e) =>
                      handleItemChange(
                        item.id,
                        "receivedQuantity",
                        parseFloat(e.target.value)
                      )
                    }
                    readOnly={mode === "view"}
                  />
                </TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{item.unitPrice.toFixed(2)}</TableCell>
                <TableCell>{item.subTotalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <Button variant="ghost" onClick={() => handleOpenItemDetail(item)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
              {/* {expandedItems.includes(item.id) && (
              <TableRow>
                <TableCell colSpan={mode !== 'view' ? 9 : 8}>
                  
                </TableCell>
              </TableRow>
            )} */}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setSelectedItem(null); // Only set selectedItem to null when dialog is fully closed
        }
      }}>
        <DialogContent className="sm:max-w-[80vw] max-w-[100vw] p-0 border-none overflow-y-auto [&>button]:hidden ">
          <div className="rounded-lg overflow-y-auto">
            {selectedItem && ( // Only render ItemDetailForm if selectedItem is not null
              <ItemDetailForm
                item={selectedItem}
                mode={mode}
                handleItemChange={handleItemChange}
                onClose={handleCloseItemDetail}
                onSave={handleSaveItemDetail}
              />
            )}
          </div>
        </DialogContent> 
      </Dialog>
    </>
  );
}
