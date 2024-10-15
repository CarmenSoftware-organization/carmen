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
import { Eye, Edit, Trash2 } from "lucide-react";
import { GoodsReceiveNoteMode, GoodsReceiveNoteItem } from "@/lib/types";
import { Dialog, DialogContent } from "@/components/ui/custom-dialog";
import ItemDetailForm from "./itemDetailForm";

interface GoodsReceiveNoteItemsProps {
  mode: GoodsReceiveNoteMode;
  items: GoodsReceiveNoteItem[];
  onItemsChange: (items: GoodsReceiveNoteItem[]) => void;
  selectedItems: string[];
  onItemSelect: (itemId: string, isSelected: boolean) => void;
  exchangeRate: number;
  baseCurrency: string;
}

export function GoodsReceiveNoteItems({
  mode,
  items = [],
  onItemsChange,
  selectedItems,
  onItemSelect,
  exchangeRate,
  baseCurrency,
}: GoodsReceiveNoteItemsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GoodsReceiveNoteItem | null>(null);

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
    onItemSelect("", checked);
  };

  const handleCloseItemDetail = () => {
    setIsDialogOpen(false);
  };

  const handleSaveItemDetail = () => {
    setIsDialogOpen(false);
  };

  const handleEditItem = (item: GoodsReceiveNoteItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    onItemsChange(updatedItems);
  };

  const allSelected = items.length > 0 && selectedItems.length === items.length;

  const formatBaseAmount = (amount: number) => {
    return (amount * exchangeRate).toFixed(2);
  };

  if (items.length === 0) {
    return <div>No items available.</div>;
  }

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
            <TableHead>Location</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Ordered Qty</TableHead>
            <TableHead>Received Qty</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Net Price</TableHead>
            <TableHead>Tax</TableHead>
            <TableHead>Total Price</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={(checked) =>
                    onItemSelect(item.id, checked as boolean)
                  }
                  disabled={mode === "view"}
                />
              </TableCell>
              <TableCell>{item.location || "N/A"}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>
                {item.orderedQuantity}
                <div className="text-xs text-muted-foreground">
                  {item.baseQuantity} {item.baseUnit}
                </div>
              </TableCell>
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
                <div className="text-xs text-muted-foreground">
                  {(item.receivedQuantity * item.conversionRate).toFixed(2)} {item.baseUnit}
                </div>
              </TableCell>
              <TableCell>
                {item.unit}
                <div className="text-xs text-muted-foreground">
                  1 {item.unit} = {item.conversionRate} {item.baseUnit}
                </div>
              </TableCell>
              <TableCell>
                {item.unitPrice.toFixed(2)}
                <div className="text-xs text-muted-foreground">
                  {baseCurrency} {formatBaseAmount(item.unitPrice)}
                </div>
              </TableCell>
              <TableCell>
                {(item.unitPrice * item.receivedQuantity).toFixed(2)}
                <div className="text-xs text-muted-foreground">
                  {baseCurrency} {formatBaseAmount(item.unitPrice * item.receivedQuantity)}
                </div>
              </TableCell>
              <TableCell>
                {(item.subTotalAmount - (item.unitPrice * item.receivedQuantity)).toFixed(2)}
                <div className="text-xs text-muted-foreground">
                  {baseCurrency} {formatBaseAmount(item.subTotalAmount - (item.unitPrice * item.receivedQuantity))}
                </div>
              </TableCell>
              <TableCell>
                {item.subTotalAmount.toFixed(2)}
                <div className="text-xs text-muted-foreground">
                  {baseCurrency} {formatBaseAmount(item.subTotalAmount)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenItemDetail(item)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEditItem(item)}
                    disabled={mode === "view"}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteItem(item.id)}
                    disabled={mode === "view"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setSelectedItem(null);
        }
      }}>
        <DialogContent className="max-w-5xl">
          <ItemDetailForm
            item={selectedItem} 
            mode={mode === "view" ? "view" : "edit"}
            onSave={handleSaveItemDetail}
            onClose={handleCloseItemDetail}
            handleItemChange={handleItemChange}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
