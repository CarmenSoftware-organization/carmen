"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Plus, 
  Download, 
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  FileText
} from "lucide-react";
import { PurchaseOrderItem } from "@/lib/types";
import { EnhancedPOItemRow } from "./item-details";
import { ItemDetailsComponent } from "./item-details";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EnhancedItemsTabProps {
  poData: {
    items: PurchaseOrderItem[];
    currencyCode?: string;
    baseCurrencyCode?: string;
    exchangeRate?: number;
  };
  onUpdateItem: (item: PurchaseOrderItem) => void;
  onAddItem: (item: PurchaseOrderItem) => void;
  onDeleteItem: (itemId: string) => void;
  onGoodsReceived?: (item: PurchaseOrderItem) => void;
  onSplitLine?: (item: PurchaseOrderItem) => void;
  onCancelItem?: (item: PurchaseOrderItem) => void;
  editable?: boolean;
  showCheckboxes?: boolean;
}

export default function EnhancedItemsTab({
  poData,
  onUpdateItem,
  onAddItem,
  onDeleteItem,
  onGoodsReceived,
  onSplitLine,
  onCancelItem,
  editable = true,
  showCheckboxes = true,
}: EnhancedItemsTabProps) {
  // State management
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editingItems, setEditingItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingItem, setViewingItem] = useState<PurchaseOrderItem | null>(null);
  const [isAddItemFormOpen, setIsAddItemFormOpen] = useState(false);

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    return poData.items.filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    });
  }, [poData.items, searchTerm]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalItems = filteredItems.length;
    const totalValue = filteredItems.reduce((sum, item) => {
      const lineTotal = (item.orderedQuantity || 0) * (item.unitPrice || 0);
      const taxAmount = lineTotal * (item.taxRate || 0);
      const discountAmount = lineTotal * (item.discountRate || 0);
      return sum + (lineTotal + taxAmount - discountAmount);
    }, 0);
    const statusCounts = filteredItems.reduce((acc, item) => {
      const status = item.status || 'Not Received';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalItems,
      totalValue,
      statusCounts,
      selectedCount: selectedItems.length,
    };
  }, [filteredItems, selectedItems]);

  // Event handlers
  const handleToggleExpand = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleToggleEdit = (itemId: string) => {
    const newEditing = new Set(editingItems);
    if (newEditing.has(itemId)) {
      newEditing.delete(itemId);
    } else {
      newEditing.add(itemId);
    }
    setEditingItems(newEditing);
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(prev => 
      prev.length === filteredItems.length 
        ? [] 
        : filteredItems.map(item => item.id)
    );
  };

  const handleUpdateItem = (updatedItem: PurchaseOrderItem) => {
    onUpdateItem(updatedItem);
    // Remove from editing state after update
    setEditingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(updatedItem.id);
      return newSet;
    });
  };

  const handleViewDetails = (item: PurchaseOrderItem) => {
    setViewingItem(item);
  };

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'edit':
        // Enable edit mode for all selected items
        setEditingItems(new Set(selectedItems));
        break;
      case 'delete':
        // Delete selected items
        selectedItems.forEach(itemId => onDeleteItem(itemId));
        setSelectedItems([]);
        break;
      case 'expand':
        // Expand all selected items
        setExpandedItems(new Set([...expandedItems, ...selectedItems]));
        break;
      case 'collapse':
        // Collapse all selected items
        setExpandedItems(prev => {
          const newSet = new Set(prev);
          selectedItems.forEach(id => newSet.delete(id));
          return newSet;
        });
        break;
      default:
        console.log(`Unknown bulk action: ${action}`);
    }
  };

  const handleExport = () => {
    // Export functionality - could export to CSV, Excel, PDF
    console.log('Exporting items:', filteredItems);
  };

  return (
    <div className="space-y-4 w-full bg-white dark:bg-gray-800">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          {showCheckboxes && (
            <Checkbox
              checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
              onCheckedChange={handleSelectAll}
              aria-label="Select all items"
              className="data-[state=checked]:bg-blue-600"
            />
          )}
          <div>
            <h2 className="text-lg font-semibold">Purchase Order Items</h2>
            <p className="text-sm text-gray-500">
              {summaryStats.totalItems} items • Total Value: ${summaryStats.totalValue.toFixed(2)}
              {selectedItems.length > 0 && (
                <span className="ml-2 text-blue-600 font-medium">
                  • {selectedItems.length} selected
                </span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {editable && (
            <Button 
              onClick={() => setIsAddItemFormOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          )}
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>


      {/* Bulk Actions Bar */}
      {selectedItems.length > 0 && (
        <Card className="p-3 bg-white border-gray-200">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected:
            </span>
            
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleBulkAction('edit')}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleBulkAction('expand')}
              >
                Expand All
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleBulkAction('collapse')}
              >
                Collapse All
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleBulkAction('export')}
              >
                <FileText className="h-4 w-4 mr-1" />
                Export Selected
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleBulkAction('delete')}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Selected
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No items found</h3>
              <p className="text-sm">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first item.'}
              </p>
              {editable && !searchTerm && (
                <Button 
                  className="mt-4"
                  onClick={() => setIsAddItemFormOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Item
                </Button>
              )}
            </div>
          </Card>
        ) : (
          filteredItems.map((item) => (
            <EnhancedPOItemRow
              key={item.id}
              item={item}
              currencyCode={poData.currencyCode || 'USD'}
              baseCurrencyCode={poData.baseCurrencyCode || 'THB'}
              exchangeRate={poData.exchangeRate || 35}
              isExpanded={expandedItems.has(item.id)}
              isEditMode={editingItems.has(item.id)}
              isSelected={selectedItems.includes(item.id)}
              onToggleExpand={handleToggleExpand}
              onToggleEdit={handleToggleEdit}
              onSelect={handleSelectItem}
              onUpdateItem={handleUpdateItem}
              onViewDetails={handleViewDetails}
              onGoodsReceived={onGoodsReceived}
              onSplitLine={onSplitLine}
              onCancelItem={onCancelItem}
              showCheckbox={showCheckboxes}
              className="transition-all duration-200"
            />
          ))
        )}
      </div>

      {/* Summary Footer */}
      {filteredItems.length > 0 && (
        <Card className="p-4 bg-gray-50">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <div>
                <span className="text-gray-500">Total Items:</span>
                <span className="font-medium ml-2">{summaryStats.totalItems}</span>
              </div>
              <div>
                <span className="text-gray-500">Total Value:</span>
                <span className="font-semibold text-blue-600 ml-2">
                  ${summaryStats.totalValue.toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {Object.entries(summaryStats.statusCounts).map(([status, count]) => (
                <div key={status} className="text-xs">
                  <span className="text-gray-500">{status}:</span>
                  <span className="font-medium ml-1">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Item Details Modal */}
      {viewingItem && (
        <ItemDetailsComponent
          initialMode="view"
          isOpen={!!viewingItem}
          onClose={() => setViewingItem(null)}
          initialData={viewingItem}
          onSubmit={handleUpdateItem}
        />
      )}

      {/* Add Item Modal */}
      {isAddItemFormOpen && (
        <ItemDetailsComponent
          initialMode="add"
          isOpen={isAddItemFormOpen}
          onClose={() => setIsAddItemFormOpen(false)}
          onSubmit={(newItem) => {
            onAddItem(newItem);
            setIsAddItemFormOpen(false);
          }}
        />
      )}
    </div>
  );
}