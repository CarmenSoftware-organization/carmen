
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { PurchaseRequestItem, MockPurchaseRequestItem, PRStatus } from "@/lib/types";
import { Check, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface NewItemRowProps {
  onSave: (newItem: PurchaseRequestItem) => void;
  onCancel: () => void;
  locations: string[];
  products: string[];
  units: string[];
  showPricing?: boolean;
}

export function NewItemRow({ onSave, onCancel, locations, products, units, showPricing = true }: NewItemRowProps) {
  const [newItem, setNewItem] = useState<Partial<MockPurchaseRequestItem>>({
    location: "",
    name: "",
    quantityRequested: 0,
    unit: "",
    price: 0,
    currency: "USD",
    status: PRStatus.Draft,
    comment: "",
    deliveryDate: undefined,
    deliveryPoint: "",
  });
  
  // Mock inventory info for new items (in real app, this would come from API based on selected product)
  const mockInventoryInfo = {
    onHand: 0,
    onOrdered: 0,
    reorderLevel: 10,
    restockLevel: 25,
    inventoryUnit: newItem.unit || 'units',
    averageMonthlyUsage: 5,
    lastPrice: 0,
    lastOrderDate: new Date(),
    lastVendor: 'N/A'
  };

  const handleSave = () => {
    // Basic validation
    if (!newItem.name || !newItem.location || (newItem.quantityRequested && newItem.quantityRequested <= 0)) {
      // You might want to show an error message to the user
      console.error("Validation failed: Please fill in all required fields.");
      return;
    }
    onSave(newItem as PurchaseRequestItem);
  };

  const handleInputChange = (field: keyof MockPurchaseRequestItem, value: any) => {
    setNewItem((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <TableRow className="bg-green-50/50">
        {/* Checkbox column */}
        <TableCell className="text-center">
          {/* Empty for new item */}
        </TableCell>
        {/* Row number column */}
        <TableCell className="text-center">
          <div className="flex items-center justify-center gap-1">
            <div className="h-6 w-6 p-0 rounded-md bg-green-50 border border-green-200 flex items-center justify-center">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
            </div>
            <span className="text-sm font-medium text-green-600 min-w-[24px]">New</span>
          </div>
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
          <div className="flex flex-col items-center justify-center space-y-1">
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
            {/* Prototype conversion display - would show if units differ from inventory */}
            {newItem.quantityRequested && newItem.unit && mockInventoryInfo.inventoryUnit && 
             newItem.unit !== mockInventoryInfo.inventoryUnit && (
              <div className="text-xs text-muted-foreground text-center">
                (≈ {(newItem.quantityRequested * 12).toLocaleString()} {mockInventoryInfo.inventoryUnit})
              </div>
            )}
          </div>
        </TableCell>
        {/* Approved column */}
        <TableCell className="text-center">
          <span className="text-xs text-gray-400 italic">Pending</span>
        </TableCell>
        {/* Date Required column */}
        <TableCell className="text-center">
          <Input
            type="date"
            placeholder="Select date"
            className="w-32 text-center text-xs"
            value={newItem.deliveryDate ? new Date(newItem.deliveryDate).toISOString().split('T')[0] : ""}
            onChange={(e) => handleInputChange("deliveryDate", e.target.value ? new Date(e.target.value) : null)}
          />
        </TableCell>
        {/* Delivery Point column */}
        <TableCell className="text-center">
          <Input
            placeholder="Delivery point"
            className="w-36 text-center text-xs"
            value={newItem.deliveryPoint || ""}
            onChange={(e) => handleInputChange("deliveryPoint", e.target.value)}
          />
        </TableCell>
        {/* Pricing column (only show for non-requestors) */}
        {showPricing && (
          <TableCell className="text-right">
            <div className="flex flex-col items-end justify-center space-y-1">
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-28 text-right"
                value={newItem.price ? newItem.price.toFixed(2) : ""}
                onChange={(e) => handleInputChange("price", parseFloat(e.target.value))}
              />
              {/* Prototype currency conversion display - would show if currency differs from base */}
              {newItem.price && newItem.currency && newItem.currency !== 'USD' && (
                <div className="text-xs text-muted-foreground text-right">
                  USD {(newItem.price * 1.2).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              )}
            </div>
          </TableCell>
        )}
        {/* Comment column */}
        <TableCell>
          <Textarea
            placeholder="Add comment..."
            value={newItem.comment || ""}
            onChange={(e) => handleInputChange("comment", e.target.value)}
            className="min-h-[60px] text-sm resize-none border-gray-200 focus:border-green-400 focus:ring-green-400/20 transition-all duration-200"
          />
        </TableCell>
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
      
      {/* Inventory Information Row for new item - Read Only */}
      <TableRow className="hover:bg-muted/30 group transition-colors border-b bg-green-25">
        <TableCell colSpan={showPricing ? 11 : 10} className="py-3">
          <div className="px-2">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Inventory Status Grid */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-1.5 text-center">
                <div className="text-xs font-bold text-blue-700">{mockInventoryInfo.onHand} {mockInventoryInfo.inventoryUnit}</div>
                <div className="text-[10px] text-blue-600 font-medium">On Hand</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-1.5 text-center">
                <div className="text-xs font-bold text-orange-700">{mockInventoryInfo.onOrdered} {mockInventoryInfo.inventoryUnit}</div>
                <div className="text-[10px] text-orange-600 font-medium">On Order</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-1.5 text-center">
                <div className="text-xs font-bold text-yellow-700">{mockInventoryInfo.reorderLevel} {mockInventoryInfo.inventoryUnit}</div>
                <div className="text-[10px] text-yellow-600 font-medium">Reorder Level</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-1.5 text-center">
                <div className="text-xs font-bold text-purple-700">{mockInventoryInfo.restockLevel} {mockInventoryInfo.inventoryUnit}</div>
                <div className="text-[10px] text-purple-600 font-medium">Restock Level</div>
              </div>
            </div>
            
            {/* Additional Information */}
            <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-2 text-xs text-gray-600">
              <div>Monthly Usage: <span className="font-medium">{mockInventoryInfo.averageMonthlyUsage} {mockInventoryInfo.inventoryUnit}</span></div>
              <div>Last Price: <span className="font-medium">${mockInventoryInfo.lastPrice.toFixed(2)}</span></div>
              <div>Last Vendor: <span className="font-medium">{mockInventoryInfo.lastVendor}</span></div>
            </div>
            
            <div className="mt-2 text-xs text-gray-500 italic">
              * Inventory information shown for reference. Select a product to see actual data.
            </div>
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}
