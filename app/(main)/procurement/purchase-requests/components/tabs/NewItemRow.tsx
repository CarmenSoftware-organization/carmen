
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { PurchaseRequestItem } from "@/lib/types";
import { Check, X } from "lucide-react";

interface NewItemRowProps {
  onSave: (newItem: PurchaseRequestItem) => void;
  onCancel: () => void;
  locations: string[];
  products: string[];
  units: string[];
  showPricing?: boolean;
}

export function NewItemRow({ onSave, onCancel, locations, products, units, showPricing = true }: NewItemRowProps) {
  const [newItem, setNewItem] = useState<Partial<PurchaseRequestItem>>({
    location: "",
    name: "",
    quantityRequested: 0,
    unit: "",
    price: 0,
    currency: "USD",
    status: "Pending",
  });

  const handleSave = () => {
    // Basic validation
    if (!newItem.name || !newItem.location || (newItem.quantityRequested && newItem.quantityRequested <= 0)) {
      // You might want to show an error message to the user
      console.error("Validation failed: Please fill in all required fields.");
      return;
    }
    onSave(newItem as PurchaseRequestItem);
  };

  const handleInputChange = (field: keyof PurchaseRequestItem, value: any) => {
    setNewItem((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <TableRow className="bg-green-50/50">
      {/* Checkbox column */}
      <TableCell className="text-center">
        {/* Empty for new item */}
      </TableCell>
      {/* Expand/collapse column */}
      <TableCell className="text-center">
        {/* Empty for new item */}
      </TableCell>
      {/* Row number column */}
      <TableCell className="text-center">
        <span className="text-sm font-medium text-green-600">New</span>
      </TableCell>
      {/* Location & Status column */}
      <TableCell>
        <Select value={newItem.location || ""} onValueChange={(value) => handleInputChange("location", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      {/* Product Details column */}
      <TableCell>
        <Select value={newItem.name || ""} onValueChange={(value) => handleInputChange("name", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((prod) => (
              <SelectItem key={prod} value={prod}>
                {prod}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      {/* Requested column */}
      <TableCell className="text-center">
        <div className="flex items-center gap-2 justify-center">
          <Input
            type="number"
            step="0.00001"
            placeholder="0.00000"
            className="w-24 text-right"
            value={newItem.quantityRequested?.toFixed(5) || ""}
            onChange={(e) => handleInputChange("quantityRequested", parseFloat(e.target.value))}
          />
          <Select value={newItem.unit || ""} onValueChange={(value) => handleInputChange("unit", value)}>
            <SelectTrigger className="w-20">
              <SelectValue placeholder="Unit" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TableCell>
      {/* Approved column */}
      <TableCell className="text-center">
        <span className="text-xs text-gray-400 italic">Pending</span>
      </TableCell>
      {/* Pricing column (only show for non-requestors) */}
      {showPricing && (
        <TableCell className="text-right">
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            className="w-28 text-right"
            value={newItem.price ? newItem.price.toFixed(2) : ""}
            onChange={(e) => handleInputChange("price", parseFloat(e.target.value))}
          />
        </TableCell>
      )}
      {/* More actions column */}
      <TableCell className="text-center">
        <div className="flex items-center gap-1 justify-center">
          <Button variant="ghost" size="sm" onClick={handleSave} className="h-8 w-8 p-0">
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0">
            <X className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
