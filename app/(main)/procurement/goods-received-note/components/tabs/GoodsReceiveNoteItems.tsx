"use client";
import React, { useState, useEffect } from "react";
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
import { FileText, Edit, Trash2, Plus } from "lucide-react";
import { GoodsReceiveNoteMode, GoodsReceiveNoteItem, Product, UnitConversion, LocationInfo } from "@/lib/types";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/custom-dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
  TooltipProvider 
} from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ItemDetailForm from "./itemDetailForm";
import { formatCurrency } from "@/lib/utils";

// --- Hypothetical Data Fetching Service --- 
// Assume these functions exist elsewhere and fetch data from your API
// You would import these from your actual service/API layer

// Example function signature for fetching product details
async function getProductDetails(grnItemId: string): Promise<Product | null> {
  console.log(`[API CALL] Fetching product details for GRN Item ID: ${grnItemId}`);

  // --- TEMPORARY MOCK WORKAROUND --- 
  // Map known mock GRN Item IDs to mock Product IDs
  // Replace this with fetching using the actual productId when available
  let productId = grnItemId; // Default assumption (will likely fail)
  if (grnItemId === 'ITEM011') {
      productId = 'PROD-123'; // Map mock GRN Item ID to mock Product ID
      console.log(`[Mock Map] Mapped GRN Item ID ${grnItemId} to Product ID ${productId}`);
  } else if (grnItemId === 'ITEM012') {
      productId = 'PROD-456'; // Map mock GRN Item ID to mock Product ID
      console.log(`[Mock Map] Mapped GRN Item ID ${grnItemId} to Product ID ${productId}`);
  } else {
      console.warn(`[Mock Map] Unknown GRN Item ID ${grnItemId}, attempting fetch with this ID.`);
  }
  // --- END TEMPORARY MOCK WORKAROUND ---

  // Replace with your actual API call using the correct productId
  // Example: const response = await fetch(`/api/products/${productId}`);
  // if (!response.ok) return null;
  // const product: Product = await response.json();
  // return product;
  
  // Using the placeholder logic with the (potentially mapped) productId
  await new Promise(resolve => setTimeout(resolve, 300));
  // IMPORTANT: Uses productId derived from the temporary mapping above
  if (productId === 'PROD-123') { // Check against mapped Product ID
    const mockConcreteProduct: Product = {
        id: "PROD-123", productCode: "CONC-ALPHA", name: "Concrete Mix - Project Alpha", description: "Standard Portland cement mix", localDescription: "ปูนซีเมนต์ผสมมาตรฐาน", categoryId: "PROJECT_MATERIAL", subCategoryId: "SCAT-BULK", itemGroupId: "GRP-CONSTRUCTION", primaryInventoryUnitId: "KG", size: "25kg Bag Equivalent", color: "Grey", barcode: "9876543210123", isActive: true, basePrice: 5, currency: "USD", taxType: "Standard", taxRate: 7, standardCost: 4.5, lastCost: 4.6, priceDeviationLimit: 10, quantityDeviationLimit: 5, minStockLevel: 500, maxStockLevel: 10000, isForSale: false, isIngredient: false, weight: 25000, shelfLife: 180, storageInstructions: "Store in a dry place, away from moisture.",
        unitConversions: [ { id: "uc1", unitId: "BAG", fromUnit: "Bag", toUnit: "Kg", unitName: "Bag (25kg)", conversionFactor: 25, unitType: "ORDER" }, { id: "uc2", unitId: "KG", fromUnit: "Kg", toUnit: "Kg", unitName: "Kilogram", conversionFactor: 1, unitType: "INVENTORY" }, ], 
        imagesUrl: "/images/placeholder-concrete.jpg", carbonFootprint: 50,
    };
    return mockConcreteProduct;
  } else if (productId === 'PROD-456') { // Check against mapped Product ID
    const mockAppleProduct: Product = {
        id: "PROD-456", productCode: "FRUIT-APP-ORG", name: "Organic Apples", description: "Fresh organic Gala apples", localDescription: "แอปเปิ้ลออร์แกนิคสด", categoryId: "FOOD", subCategoryId: "SCAT-FRESHFRUIT", itemGroupId: "GRP-PRODUCE", primaryInventoryUnitId: "KG", size: "Medium", color: "Red", barcode: "1234567890123", isActive: true, basePrice: 3, currency: "USD", taxType: "Exempt", taxRate: 0, standardCost: 2.5, lastCost: 2.6, priceDeviationLimit: 15, quantityDeviationLimit: 10, minStockLevel: 50, maxStockLevel: 500, isForSale: true, isIngredient: true, weight: 150, shelfLife: 14, storageInstructions: "Refrigerate after opening.",
        unitConversions: [ { id: "uc3", unitId: "BOX", fromUnit: "Box", toUnit: "Kg", unitName: "Box (10kg)", conversionFactor: 10, unitType: "ORDER" }, { id: "uc4", unitId: "KG", fromUnit: "Kg", toUnit: "Kg", unitName: "Kilogram", conversionFactor: 1, unitType: "INVENTORY" }, ], 
        imagesUrl: "/images/placeholder-apples.jpg", sustainableCertification: 'ORGANIC',
    };
    return mockAppleProduct;
  }
   return null;
}

// Example function signature for fetching location details
async function getLocationDetails(locationIdentifier: string): Promise<LocationInfo | null> {
    console.log(`[API CALL] Fetching location details for: ${locationIdentifier}`);
    // Replace with your actual API call (might fetch by name or ID)
    // Example: const response = await fetch(`/api/locations?name=${encodeURIComponent(locationIdentifier)}`);
    // ... handle response ...
    
    // Using previous placeholder logic
    await new Promise(resolve => setTimeout(resolve, 200));
    if (locationIdentifier === 'Main Warehouse') {
        return { code: 'WH-MAIN', name: 'Main Warehouse', type: 'INV', displayType: 'Inventory' };
    } else if (locationIdentifier === 'Kitchen Storage') { // Match screenshot example
         return { code: 'KITCH-S', name: 'Kitchen Storage', type: 'DIR', displayType: 'Direct' };
    }
    return null;
}
// --- End Hypothetical Service ---

interface GoodsReceiveNoteItemsProps {
  mode: GoodsReceiveNoteMode;
  items: GoodsReceiveNoteItem[];
  onItemsChange: (items: GoodsReceiveNoteItem[]) => void;
  selectedItems: string[];
  onItemSelect: (itemId: string, isSelected: boolean) => void;
  exchangeRate: number;
  baseCurrency: string;
  currency: string;
}

export function GoodsReceiveNoteItems({
  mode,
  items = [],
  onItemsChange,
  selectedItems,
  onItemSelect,
  exchangeRate,
  baseCurrency,
  currency,
}: GoodsReceiveNoteItemsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<GoodsReceiveNoteMode | 'add'>('view');
  const [selectedItem, setSelectedItem] = useState<GoodsReceiveNoteItem | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [itemUnits, setItemUnits] = useState<Record<string, string>>({});
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [selectedProductData, setSelectedProductData] = useState<Product | null>(null);
  const [selectedLocationInfo, setSelectedLocationInfo] = useState<LocationInfo | null>(null);

  useEffect(() => {
    const initialUnits: Record<string, string> = {};
    items.forEach(item => {
      initialUnits[item.id] = item.unit;
    });
    setItemUnits(initialUnits);
  }, [items]);

  useEffect(() => {
    if (selectedItem?.id) {
      setIsLoadingDetails(true);
      // Use the hypothetical API functions
      Promise.all([
        getProductDetails(selectedItem.id), // Pass GRN Item ID (assuming it maps to product ID for now)
        getLocationDetails(selectedItem.location) // Pass location name/string
      ]).then(([productData, locationData]) => {
        setSelectedProductData(productData);
        setSelectedLocationInfo(locationData);
        setIsLoadingDetails(false);
      }).catch(error => {
          console.error("Error fetching item details:", error);
          setIsLoadingDetails(false);
          setSelectedProductData(null);
          setSelectedLocationInfo(null);
      });
    } else {
      setSelectedProductData(null);
      setSelectedLocationInfo(null);
    }
  }, [selectedItem]);

  const handleOpenItemDetail = (item: GoodsReceiveNoteItem) => {
    setDialogMode('view');
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

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

  const handleUnitChange = (itemId: string, newUnit: string) => {
    setItemUnits(prev => ({ ...prev, [itemId]: newUnit }));
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, unit: newUnit } : item
    );
    onItemsChange(updatedItems);
    console.log(`Changed unit for GRN item ${itemId} to ${newUnit}. Base Qty recalculation may be needed.`);
  };

  const handleSelectAll = (checked: boolean) => {
    onItemSelect("", checked);
  };

  const handleCloseItemDetail = () => {
    setIsDialogOpen(false);
    setSelectedItem(null);
  };

  const handleSaveItemDetail = (updatedItem: GoodsReceiveNoteItem) => {
    const updatedItems = items.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    onItemsChange(updatedItems);
    setIsDialogOpen(false);
    setSelectedItem(null);
  };

  const handleEditItem = (item: GoodsReceiveNoteItem) => {
    setDialogMode('edit');
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    onItemsChange(updatedItems);
  };

  const handleAddItem = (newItem: GoodsReceiveNoteItem) => {
    onItemsChange([...items, newItem]);
    setIsAddDialogOpen(false);
  };

  const allSelected = items.length > 0 && selectedItems.length === items.length;

  // Format amount without currency symbol
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Format base amount without currency symbol
  const formatBaseAmount = (amount: number) => {
    return (amount * exchangeRate).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const calculateNetAmount = (item: GoodsReceiveNoteItem) => {
    const subtotal = item.unitPrice * item.receivedQuantity;
    return subtotal - (subtotal * (item.discountRate || 0) / 100);
  };

  const calculateTaxAmount = (item: GoodsReceiveNoteItem) => {
    const netAmount = calculateNetAmount(item);
    return netAmount * (item.taxRate || 0) / 100;
  };

  const numberCellClass = "text-right";

  // Placeholder unit options
  const unitOptions = ["Kg", "Pcs", "Box", "Pack", "L", "mL"];

  // --- Add New Record Handler (Placeholder) ---
  const handleAddNewRecord = (fieldType: 'projectCode' | 'jobCode' | 'marketSegment') => {
      // In a real application, this would likely:
      // 1. Open a new dialog specific to creating a Project/Job/Market Segment.
      // 2. Navigate to a dedicated creation page.
      // 3. After successful creation, potentially refresh the list of options
      //    and maybe even select the newly created item in the dropdown.
      alert(`Placeholder: Trigger UI to add a new ${fieldType}.`);
      console.log(`Placeholder: Trigger UI to add a new ${fieldType}.`);
      // Example: You might set state to open a specific creation dialog
      // if (fieldType === 'projectCode') setOpenProjectDialog(true);
  };

  const handleRequestEditFromDialog = () => {
      console.log("Request to switch dialog from view to edit mode received.");
      setDialogMode('edit'); // Update the parent's dialog mode state
  };

  if (items.length === 0) {
    return <div>No items available.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Item Details</h3>
        {mode !== 'view' && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl">
              <ItemDetailForm
                mode="add"
                item={null}
                onSave={handleAddItem}
                onClose={() => setIsAddDialogOpen(false)}
                onAddNewRecord={handleAddNewRecord}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Table>
        <TableHeader>
          {/* Single Header Row */}
          <TableRow>
            {/* Checkbox */}
            <TableHead className="w-[50px]"> 
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                disabled={mode === "view"}
              />
            </TableHead>
            {/* Headers matching the image */}
            <TableHead>Location</TableHead> 
            <TableHead>Product Name</TableHead> 
            <TableHead className={numberCellClass}>Ordered Qty</TableHead> 
            <TableHead>Ordered Unit</TableHead>
            <TableHead className={numberCellClass}>Received Qty</TableHead> 
            <TableHead>Unit</TableHead>
            <TableHead className={numberCellClass}>FOC Qty</TableHead> 
            <TableHead>FOC Unit</TableHead>
            <TableHead className={numberCellClass}>Price</TableHead> 
            <TableHead className={numberCellClass}>Discount</TableHead>
            <TableHead className={numberCellClass}>Net Amount</TableHead>
            <TableHead className={numberCellClass}>Tax Amount</TableHead>
            <TableHead className={numberCellClass}>Total Amount</TableHead>
            <TableHead>Actions</TableHead> 
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {items.map((item) => {
            console.log('[GoodsReceiveNoteItems] Received mode prop:', mode);
            return (
              <TableRow key={item.id}>
                 {/* Checkbox Cell */} 
                 <TableCell>
                   <Checkbox
                     checked={selectedItems.includes(item.id)}
                     onCheckedChange={(checked) =>
                       onItemSelect(item.id, checked as boolean)
                     }
                     disabled={mode === "view"}
                   />
                 </TableCell>
                 {/* Location Cell */} 
                 <TableCell>{item.location || "N/A"}</TableCell>
                 {/* Product Name Cell */} 
                 <TableCell>
                   <div className="flex items-center space-x-2">
                     <div>
                       {item.name}
                       <div className="text-xs text-muted-foreground">
                         {item.description || "No description available"}
                       </div>
                     </div>
                     {item.isConsignment && (
                       <Badge variant="outline">Consignment</Badge>
                     )}
                     {item.isTaxInclusive && (
                       <Badge variant="outline">Tax Inclusive</Badge>
                     )}
                   </div>
                 </TableCell>
                 
                 {/* Ordered Qty Cell (Add Base info back) */}
                 <TableCell className={numberCellClass}> 
                   {item.orderedQuantity}
                   <div className="text-xs text-muted-foreground"> 
                    Base: {(item.orderedQuantity * item.conversionRate).toFixed(2)} {item.baseUnit || 'N/A'}
                   </div>
                 </TableCell>
                 {/* Ordered Unit Cell */} 
                 <TableCell>{item.orderUnit}</TableCell>
                 
                 {/* Received Qty Cell (Add Base info back) */} 
                 <TableCell className={numberCellClass}> 
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
                       className="text-right"
                    />
                    <div className="text-xs text-muted-foreground"> 
                     Base: {(item.receivedQuantity * item.conversionRate).toFixed(2)} {item.baseUnit || 'N/A'}
                    </div>
                 </TableCell>
                 {/* Received Unit Cell */} 
                 <TableCell> 
                    <Select 
                      value={itemUnits[item.id] || item.unit}
                      onValueChange={(value) => handleUnitChange(item.id, value)}
                      disabled={mode === "view"}
                     > 
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {!unitOptions.includes(item.unit) && <SelectItem value={item.unit}>{item.unit}</SelectItem>}
                        {unitOptions.map((unit) => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-muted-foreground mt-1"> 
                       1 {itemUnits[item.id] || item.unit} = {item.conversionRate} {item.baseUnit} 
                    </div>
                 </TableCell>

                 {/* FOC Qty Cell (Add Base info back) */} 
                 <TableCell className={numberCellClass}> 
                    <Input 
                       type="number"
                       value={item.focQuantity || 0}
                       onChange={(e) =>
                         handleItemChange(
                           item.id,
                           "focQuantity",
                           parseFloat(e.target.value)
                         )
                       }
                       readOnly={mode === "view"}
                       className="text-right"
                    />
                    <div className="text-xs text-muted-foreground">
                     Base: {((item.focQuantity || 0) * (item.focConversionRate || item.conversionRate)).toFixed(2)} {item.baseUnit || 'N/A'}
                    </div>
                 </TableCell>
                 {/* FOC Unit Cell */} 
                 <TableCell> 
                    <select 
                      value={item.focUnit || item.unit}
                      onChange={(e) =>
                        handleItemChange(
                          item.id,
                          "focUnit",
                          e.target.value
                        )
                      }
                      disabled={mode === "view"}
                      className="w-full border rounded h-9 px-2 text-sm"
                     >
                      <option value={item.unit}>{item.unit}</option>
                      <option value={item.baseUnit}>{item.baseUnit}</option>
                      {unitOptions.map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                 </TableCell>
                 
                 {/* Price Cell */}
                 <TableCell className={numberCellClass}>
                   {formatAmount(item.unitPrice)}
                 </TableCell>
                 
                 {/* Discount Cell */}
                 <TableCell className={numberCellClass}>
                   {item.discountRate ? `${item.discountRate}%` : '-'}
                 </TableCell>
                 
                 {/* Net Amount Cell */}
                 <TableCell className={numberCellClass}>
                   {formatAmount(calculateNetAmount(item))}
                 </TableCell>
                 
                 {/* Tax Amount Cell */}
                 <TableCell className={numberCellClass}>
                   {formatAmount(calculateTaxAmount(item))}
                 </TableCell>
                 
                 {/* Total Amount Cell */}
                 <TableCell className={numberCellClass}>
                   {formatAmount(calculateNetAmount(item) + calculateTaxAmount(item))}
                 </TableCell>
                 
                 {/* Actions Cell */} 
                 <TableCell>
                   <div className="flex space-x-2">
                     <Button variant="ghost" size="sm" onClick={() => handleOpenItemDetail(item)}>
                       <FileText className="h-4 w-4" />
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
             );
          })}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          handleCloseItemDetail();
        } else {
           setIsDialogOpen(true);
        }
      }}>
        <DialogContent className="max-w-5xl">
          {isLoadingDetails ? (
            <div>Loading item details...</div>
          ) : selectedItem ? (
            <ItemDetailForm
              mode={dialogMode}
              item={selectedItem}
              categoryId={selectedProductData?.categoryId}
              productCode={selectedProductData?.productCode}
              locationCode={selectedLocationInfo?.code}
              unitConversions={selectedProductData?.unitConversions}
              onSave={handleSaveItemDetail}
              onClose={handleCloseItemDetail}
              onAddNewRecord={handleAddNewRecord}
              onRequestEdit={handleRequestEditFromDialog}
            />
          ) : (
            <div>Error: No item selected or details failed to load.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
