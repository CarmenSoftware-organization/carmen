"use client"

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  EyeOff,
  Edit,
  Ban,
  Plus,
  CheckCircle,
  XCircle,
  RotateCcw,
  Split,
  Filter,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/custom-dialog";
import { PurchaseRequestItem } from "@/lib/types";
import EnhancedOrderCard from "./enhanced-order-card";
import type { User, OrderItem } from "./types";
import { ItemDetailsEditForm } from "../item-details-edit-form";
import { samplePRItems } from "../sampleData";

// Transform PurchaseRequestItem to OrderItem for the EnhancedOrderCard
const transformToOrderItem = (item: PurchaseRequestItem): OrderItem => ({
  id: item.id || "",
  location: item.location,
  product: item.name,
  productDescription: item.description,
  sku: item.id || "", // Using ID as SKU since we don't have a separate SKU field
  orderUnit: item.unit,
  invUnit: item.inventoryInfo?.inventoryUnit || item.unit,
  requestQuantity: item.quantityRequested,
  onOrderQuantity: item.inventoryInfo?.onOrdered || 0,
  onOrderInvUnit: item.inventoryInfo?.onOrdered || 0,
  approvedQuantity: item.quantityApproved,
  onHandQuantity: item.inventoryInfo?.onHand || 0,
  onHandInvUnit: item.inventoryInfo?.onHand || 0,
  currency: item.currency,
  baseCurrency: "USD",
  price: item.price,
  lastPrice: item.inventoryInfo?.lastPrice || item.price,
  baseCurrencyPrice: item.price * (item.currencyRate || 1),
  baseCurrencyLastPrice: (item.inventoryInfo?.lastPrice || item.price) * (item.currencyRate || 1),
  total: item.totalAmount,
  baseCurrencyTotal: item.baseTotalAmount || item.totalAmount,
  conversionRate: item.currencyRate || 1,
  status: item.status === "Accepted" ? "approved" : 
          item.status === "Review" ? "Review" : 
          item.status === "Rejected" ? "rejected" : "pending",
  requestorId: item.createdBy || "",
  requestorName: item.createdBy || "",
  department: item.itemCategory || "",
  requestDate: item.createdDate?.toISOString() || new Date().toISOString(),
  expectedDeliveryDate: item.deliveryDate?.toISOString(),
  vendor: item.vendor || "",
  lastVendor: item.inventoryInfo?.lastVendor,
  comment: item.comment,
});

interface ItemsTabProps {
  items: PurchaseRequestItem[];
  currentUser: User;
  onOrderUpdate: (orderId: string, updates: Partial<PurchaseRequestItem>) => void;
}

export function ItemsTab({ items = samplePRItems, currentUser, onOrderUpdate }: ItemsTabProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<PurchaseRequestItem | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"view" | "edit" | "add">("view");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Filter items based on search term and user permissions
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Add role-based filtering if needed
      return matchesSearch;
    });
  }, [items, searchTerm]);

  function handleSelectItem(itemId: string) {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  }

  function handleSelectAllItems() {
    setSelectedItems((prev) =>
      prev.length === filteredItems.length ? [] : filteredItems.map((item) => item.id ?? "")
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
  }

  function handleModeChange(newMode: "view" | "edit" | "add") {
    setFormMode(newMode);
  }

  function handleToggleAllDetails() {
    const newShowAll = !showAllDetails;
    setShowAllDetails(newShowAll);

    if (newShowAll) {
      setExpandedRows(new Set(filteredItems.map((item) => item.id || "")));
    } else {
      setExpandedRows(new Set());
    }
  }

  function handleToggleEditMode() {
    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);
    if (newEditMode) {
      setExpandedRows(new Set(filteredItems.map((item) => item.id || "")));
      setShowAllDetails(true);
    }
  }

  function handleToggleExpand(itemId: string) {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedRows(newExpanded);
  }

  function getStatusCounts() {
    const counts = filteredItems.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    return counts;
  }

  function handleBulkAction(action: "Approved" | "Rejected" | "Review") {
    console.log(`Bulk ${action} for items:`, selectedItems);
    // Reset selection after action
    setSelectedItems([]);
  }

  function handleSplitItems() {
    console.log("Splitting items:", selectedItems);
    setSelectedItems([]);
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Purchase Request Items
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and review purchase request items
              </p>

              {/* Status Summary */}
              <div className="flex items-center gap-4 mt-3">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <Badge key={status} variant="secondary" className="px-3 py-1">
                    {status}: {count}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
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
                variant="outline"
                size="sm"
                onClick={handleToggleAllDetails}
                className="flex items-center gap-2 bg-transparent"
              >
                {showAllDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showAllDetails ? "Hide Details" : "Show Details"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleEditMode}
                className="flex items-center gap-2 bg-transparent"
              >
                {isEditMode ? <Ban className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                {isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}
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
        </CardHeader>
      </Card>

      {/* Bulk actions */}
      {selectedItems.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedItems.length} items selected
              </span>
              <div className="flex flex-wrap gap-2">
                <Button variant="default" size="sm" onClick={() => handleBulkAction("Accepted")}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
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
          </CardContent>
        </Card>
      )}

      {/* Items List */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <EnhancedOrderCard
            key={item.id}
            order={transformToOrderItem(item)}
            currentUser={currentUser}
            onOrderUpdate={(orderId, updates) => onOrderUpdate(orderId, updates as Partial<PurchaseRequestItem>)}
            isExpanded={expandedRows.has(item.id || "")}
            onToggleExpand={() => handleToggleExpand(item.id || "")}
            onViewDetails={() => openItemForm(item, "view")}
            isEditMode={isEditMode}
            isSelected={selectedItems.includes(item.id || "")}
            onSelect={() => handleSelectItem(item.id || "")}
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-gray-500">
              <div className="text-lg font-medium mb-2">No items found</div>
              <div className="text-sm mb-4">
                {searchTerm ? "No items match your search criteria" : "No items available in this purchase request"}
              </div>
              <Button 
                onClick={() => openItemForm(null, "add")}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Item
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
    </div>
  );
}