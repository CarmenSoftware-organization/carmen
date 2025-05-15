// File: tabs/ItemsTab.tsx
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Edit2Icon,
  Trash2Icon,
  InfoIcon,
  ImageIcon,
  MessageSquareIcon,
  Split,
  Plus,
  CheckCircle,
  XCircle,
  RotateCcw,
  ArrowUpDown,
  Download,
  Printer,
  XIcon,
  Filter,
  Search,
  SlidersHorizontal,
  ChevronLeft,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

import { FileText, Edit, X } from "lucide-react";
import { ItemDetailsEditForm } from "../item-details-edit-form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/custom-dialog";
import { PurchaseRequestItem } from "@/lib/types";
import StatusBadge from "@/components/ui/custom-status-badge";
import { Card, CardContent } from "@/components/ui/card";

const itemDetails: PurchaseRequestItem[] = [
  {
    id: "1",
    location: "Warehouse A",
    name: "Office Chair",
    description: "Ergonomic office chair with lumbar support",
    unit: "Piece",
    quantityRequested: 10,
    quantityApproved: 8,
    inventoryInfo: {
      onHand: 5,
      onOrdered: 15,
      lastPrice: 199.99,
      lastOrderDate: new Date("2023-05-15"),
      lastVendor: "Office Supplies Co.",
      reorderLevel: 10,
      restockLevel: 20,
      averageMonthlyUsage: 7,
      inventoryUnit: "Piece",
    },
    currency: "USD",
    price: 199.99,
    totalAmount: 1599.92,
    status: "Accepted",
    taxRate: 0.08,
    taxAmount: 127.99,
    discountRate: 0.05,
    discountAmount: 79.99,
    netAmount: 1647.92,
    deliveryDate: new Date("2023-07-01"),
    deliveryPoint: "Main Office",
    jobCode: "OFF-2023",
    createdDate: new Date("2023-06-01"),
    updatedDate: new Date("2023-06-10"),
    createdBy: "John Doe",
    updatedBy: "Jane Smith",
    itemCategory: "Furniture",
    itemSubcategory: "Seating",
    vendor: "Office Supplies Co.",
    pricelistNumber: "PL-2023-06",
    comment: "Urgent requirement for new hires",
    adjustments : {
      discount : false,
      tax : false,
    },
    taxIncluded : false,
    currencyRate: 1,
    foc: 0,
    accountCode: "FURN-1001",
    baseSubTotalPrice: 1999.9,
    subTotalPrice: 1999.9,
    baseNetAmount: 1647.92,
    baseDiscAmount: 79.99,
    baseTaxAmount: 127.99,
    baseTotalAmount: 1599.92,
  },
  {
    id: "2",
    location: "Warehouse B",
    name: "Laptop",
    description: "High-performance laptop for developers",
    unit: "Piece",
    quantityRequested: 5,
    quantityApproved: 4,
    inventoryInfo: {
      onHand: 2,
      onOrdered: 10,
      lastPrice: 1299.99,
      lastOrderDate: new Date("2023-04-20"),
      lastVendor: "Tech Solutions Inc.",
      reorderLevel: 5,
      restockLevel: 15,
      averageMonthlyUsage: 3,
      inventoryUnit: "Piece",
    },
    currency: "USD",
    price: 1299.99,
    totalAmount: 5199.96,
    status: "Review",
    taxRate: 0.08,
    taxAmount: 415.99,
    discountRate: 0.1,
    discountAmount: 519.99,
    netAmount: 5095.96,
    deliveryDate: new Date("2023-07-15"),
    deliveryPoint: "IT Department",
    jobCode: "IT-2023",
    createdDate: new Date("2023-06-05"),
    updatedDate: new Date("2023-06-12"),
    createdBy: "Alice Johnson",
    updatedBy: "Bob Williams",
    itemCategory: "Electronics",
    itemSubcategory: "Computers",
    vendor: "Tech Solutions Inc.",
    pricelistNumber: "PL-2023-06-TECH",
    comment: "Needed for new development team",
    adjustments : {
      discount : false,
      tax : true,
    },
    taxIncluded : true,
    currencyRate: 1,
    foc: 0,
    accountCode: "TECH-2001",
    baseSubTotalPrice: 5199.96,
    subTotalPrice: 5199.96,
    baseNetAmount: 5095.96,
    baseDiscAmount: 519.99,
    baseTaxAmount: 415.99,
    baseTotalAmount: 5199.96,
  },
  {
    id: "3",
    location: "Warehouse C",
    name: "Printer",
    description: "High-speed color laser printer",
    unit: "Piece",
    quantityRequested: 2,
    quantityApproved: 2,
    inventoryInfo: {
      onHand: 1,
      onOrdered: 3,
      lastPrice: 599.99,
      lastOrderDate: new Date("2023-05-01"),
      lastVendor: "Office Tech Ltd.",
      reorderLevel: 2,
      restockLevel: 5,
      averageMonthlyUsage: 1,
      inventoryUnit: "Piece",
    },
    currency: "USD",
    price: 599.99,
    totalAmount: 1199.98,
    status: "Accepted",
    taxRate: 0.08,
    taxAmount: 95.99,
    discountRate: 0,
    discountAmount: 0,
    netAmount: 1295.97,
    deliveryDate: new Date("2023-07-10"),
    deliveryPoint: "Admin Office",
    jobCode: "ADMIN-2023",
    createdDate: new Date("2023-06-07"),
    updatedDate: new Date("2023-06-14"),
    createdBy: "Emma Davis",
    updatedBy: "Michael Brown",
    itemCategory: "Electronics",
    itemSubcategory: "Printers",
    vendor: "Office Tech Ltd.",
    pricelistNumber: "PL-2023-06-OT",
    comment: "Replacement for old printer",
    currencyRate: 1,
    foc: 0,
    accountCode: "TECH-3001",
    baseSubTotalPrice: 1199.98,
    subTotalPrice: 1199.98,
    baseNetAmount: 1295.97,
    baseDiscAmount: 0,
    baseTaxAmount: 95.99,
    baseTotalAmount: 1199.98,
    adjustments : {
      discount : true,
      tax : true,
    },
    taxIncluded : true,
  },
];

export function ItemsTab() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [items, setItems] = useState<PurchaseRequestItem[]>(itemDetails);
  const [selectedItem, setSelectedItem] = useState<PurchaseRequestItem | null>(
    null
  );
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"view" | "edit" | "add">("view");
  const [searchTerm, setSearchTerm] = useState("");

  function handleSelectItem(itemId: string) {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  }

  function handleSelectAllItems() {
    setSelectedItems((prev) =>
      prev.length === items.length ? [] : items.map((item) => item.id ?? "")
    );
  }

  function openItemForm(
    item: PurchaseRequestItem | null,
    mode: "view" | "edit" | "add"
  ) {
    setSelectedItem(item);
    setFormMode(mode);
    setIsEditFormOpen(true);
  }

  function closeItemForm() {
    setSelectedItem(null);
    setIsEditFormOpen(false);
    setFormMode("view");
  }

  function handleSave(formData: PurchaseRequestItem) {
    console.log("Saving item:", formData);
    closeItemForm();
    setItems(prevItems => {
      if (formData.id) {
        // Update existing item
        return prevItems.map(item => item.id === formData.id ? formData : item);
      } else {
        // Add new item
        return [...prevItems, { ...formData, id: Date.now().toString() }];
      }
    });
  }

  function handleModeChange(newMode: "view" | "edit" | "add") {
    setFormMode(newMode);
  }

  function handleBulkAction(action: "Accepted" | "Rejected" | "Review") {
    console.log(`Bulk ${action} for items:`, selectedItems);
    const updatedItems = items.map((item) =>
      selectedItems.includes(item.id ?? "") ? { ...item, status: action } : item
    );
    setItems(updatedItems);
    setSelectedItems([]);
  }

  function handleSplitItems() {
    // Implement split items logic here
    console.log("Splitting items:", selectedItems);
    // You would typically open a dialog or form to handle the split operation
  }

  // Filter items based on search term
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card className="bg-white dark:bg-gray-900 shadow-sm border-0">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-6">
            {/* Header with actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold mb-1">Item Details</h2>
                <p className="text-sm text-muted-foreground">Manage purchase request items</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-[250px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search items..."
                    className="pl-9 h-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm" className="h-9 px-2.5">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button 
                  onClick={() => openItemForm(null, "add")}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </div>

            {/* Bulk actions */}
            {selectedItems.length > 0 && (
              <div className="flex items-center p-2 bg-muted/50 rounded-md">
                <span className="text-sm font-medium mr-3">
                  {selectedItems.length} items selected
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button variant="default" size="sm" onClick={() => handleBulkAction("Accepted")}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Accept
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("Rejected")}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("Review")}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Review
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSplitItems}>
                    <Split className="mr-2 h-4 w-4" />
                    Split
                  </Button>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-[40px] h-fit align-center">
                        <Checkbox
                          checked={selectedItems.length === items.length}
                          onCheckedChange={handleSelectAllItems}
                        />
                      </TableHead>
                      <TableHead className="align-center font-semibold">Location</TableHead>
                      <TableHead className="align-center font-semibold">Product</TableHead>
                      <TableHead className="text-xs font-semibold text-center">
                        Order Unit / Inv. Unit
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-center">
                        Request / On Order
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-center">
                        Approve / On Hand
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-center">
                        Currency / Base
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-center">
                        Price / Last Price
                      </TableHead>
                      <TableHead className="font-semibold text-center">Total</TableHead>
                      <TableHead className="font-semibold text-center">Status</TableHead>
                      <TableHead className="text-right align-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Search className="h-8 w-8 mb-2 opacity-50" />
                            <p>No items match your search</p>
                            {searchTerm && (
                              <Button 
                                variant="link" 
                                onClick={() => setSearchTerm("")}
                                className="mt-2"
                              >
                                Clear search
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item) => (
                        <TableRow 
                          key={item.id}
                          className="hover:bg-muted/20 group transition-colors"
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.includes(item.id ?? "")}
                              onCheckedChange={() => handleSelectItem(item.id ?? "")}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{item.location}</TableCell>
                          <TableCell>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
                              {item.description}
                            </div>
                          </TableCell>
                          <TableCell className="text-center align-top">
                            <div className="font-medium">{item.unit}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.inventoryInfo?.inventoryUnit || item.unit}
                            </div>
                          </TableCell>
                          <TableCell className="text-center align-top">
                            <div className="font-medium">{item.quantityRequested.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.inventoryInfo.onOrdered.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-center align-top">
                            <div className="font-medium">{item.quantityApproved.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.inventoryInfo.onHand.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-center align-top">
                            <div className="font-medium">{item.currency}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.currency || "THB"}
                            </div>
                          </TableCell>
                          <TableCell className="text-center align-top">
                            <div className="font-medium">{item.price.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.inventoryInfo.lastPrice.toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell className="text-center align-top">
                            <div className="font-medium">
                              {item.totalAmount.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.baseTotalAmount.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center">
                              <StatusBadge status={item.status ?? ""} />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end space-x-1 opacity-70 group-hover:opacity-100 transition-opacity">
                              {formMode === 'edit' && selectedItem?.id === item.id ? (
                                <>
                                  <Button
                                    variant="default"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => {
                                      if (selectedItem) handleSave(selectedItem)
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={closeItemForm}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => openItemForm(item, "view")}
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => openItemForm(item, "edit")}
                                  >
                                    <Edit2Icon className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 rounded-full text-destructive hover:text-destructive"
                                  >
                                    <Trash2Icon className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
        <DialogContent className="sm:max-w-[80vw] max-w-[80vw] p-0 border-none overflow-y-auto [&>button]:hidden">
          <div className="rounded-lg overflow-y-auto">
            <ItemDetailsEditForm
              onSave={handleSave}
              onCancel={closeItemForm}
              initialData={selectedItem || undefined}
              mode={formMode}
              onModeChange={handleModeChange}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}