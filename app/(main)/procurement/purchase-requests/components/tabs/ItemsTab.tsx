"use client"

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/context/user-context";
import {
  Eye,
  Edit,
  Ban,
  Plus,
  CheckCircle,
  XCircle,
  RotateCcw,
  Split,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Package,
  MapPin,
  CalendarIcon,
  Building2,
  TrendingUp,
  Truck,
  Info,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Crown,
  Star,
  Clock,
  Trash2,
  MoreHorizontal,
  History,
} from "lucide-react";
import { PurchaseRequestItem, PurchaseRequestItemStatus, ConsolidatedButtonState, ReturnStep } from "@/lib/types";
import type { User } from "./types";
import { ItemDetailsEditForm } from "../item-details-edit-form";
import { samplePRItems } from "../sampleData";
import { NewItemRow } from "./NewItemRow";
import VendorComparison from "../vendor-comparison";
import VendorComparisonView from "../vendor-comparison-view";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ItemsTabProps {
  items: PurchaseRequestItem[];
  currentUser: User;
  onOrderUpdate: (orderId: string, updates: Partial<PurchaseRequestItem>) => void;
  formMode?: "view" | "edit" | "add";
}

export function ItemsTab({ items = samplePRItems, currentUser, onOrderUpdate, formMode = "view" }: ItemsTabProps) {
  // Get user context for price visibility setting
  const { user } = useUser();
  
  // Local state for items to ensure UI updates immediately
  const [localItems, setLocalItems] = useState<PurchaseRequestItem[]>(items);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<PurchaseRequestItem | null>(null);
  const [itemFormMode, setItemFormMode] = useState<"view" | "edit" | "add" | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTableEditMode, setIsTableEditMode] = useState(formMode === "edit");
  const [expandedTableRows, setExpandedTableRows] = useState<Set<string>>(new Set());
  const [editingRows, setEditingRows] = useState<Set<string>>(new Set());
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
  const [isVendorComparisonOpen, setIsVendorComparisonOpen] = useState(false);
  const [isVendorComparisonViewOpen, setIsVendorComparisonViewOpen] = useState(false);
  const [selectedItemForComparison, setSelectedItemForComparison] = useState<PurchaseRequestItem | null>(null);
  const [isOnHandPopupOpen, setIsOnHandPopupOpen] = useState(false);
  const [isOnOrderPopupOpen, setIsOnOrderPopupOpen] = useState(false);
  const [selectedItemForPopup, setSelectedItemForPopup] = useState<PurchaseRequestItem | null>(null);
  const [isReturnStepSelectorOpen, setIsReturnStepSelectorOpen] = useState(false);
  const [isMixedStatusModalOpen, setIsMixedStatusModalOpen] = useState(false);
  const [pendingBulkAction, setPendingBulkAction] = useState<{action: 'approve' | 'reject' | 'return', analysis: any} | null>(null);
  const [isBulkDateModalOpen, setIsBulkDateModalOpen] = useState(false);
  const [bulkRequiredDate, setBulkRequiredDate] = useState<Date | undefined>();
  
  // Local state for checkbox overrides
  const [itemAdjustments, setItemAdjustments] = useState<{[itemId: string]: {tax: boolean, discount: boolean}}>({});

  // Update local items when props change
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  // Update table edit mode when form mode changes
  useEffect(() => {
    setIsTableEditMode(formMode === "edit");
  }, [formMode]);

  // Debug: Log current user role
  console.log('ItemsTab - Current user role:', currentUser.role);

  // Role detection logic - Updated to match actual role names
  const isRequestor = currentUser.role === 'Staff' || currentUser.role === 'Requestor';
  const isApprover = currentUser.role === 'Department Manager' || 
                    currentUser.role === 'Financial Manager' ||
                    currentUser.role === 'Approver';
  const isPurchaser = currentUser.role === 'Purchasing Staff' || 
                     currentUser.role === 'Purchaser';
  
  // Debug: Log role detection results
  console.log('Role detection:', { 
    currentRole: currentUser.role, 
    isRequestor, 
    isApprover, 
    isPurchaser 
  });

  // Unit conversion utility function
  function convertToInventoryUnit(quantity: number, fromUnit: string, toUnit: string, conversionFactor: number = 1): string {
    if (!quantity || fromUnit === toUnit) return '';
    const converted = quantity * conversionFactor;
    return `(≈ ${converted.toLocaleString()} ${toUnit})`;
  }

  const filteredItems = useMemo(() => {
    return localItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [localItems, searchTerm]);

  function handleSelectItem(itemId: string | undefined) {
    if (!itemId) return;
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
    if (mode === 'add' && currentUser.role === 'Staff') {
      setIsAddingNewItem(true);
    } else {
      setSelectedItem(item);
      setItemFormMode(mode);
    }
  }

  function closeItemForm() {
    setSelectedItem(null);
    setItemFormMode(null);
    setIsAddingNewItem(false);
  }

  function handleSaveItem(formData: PurchaseRequestItem) {
    console.log("Saving item:", formData);
    closeItemForm();
  }
  
  function handleAddNewItem(newItem: PurchaseRequestItem) {
    console.log("Adding new item:", newItem);
    // Here you would typically call an API to save the new item
    // For now, we'll just log it and close the form
    closeItemForm();
  }


  // Bulk action handler with mixed status checking
  const handleBulkActionWithMixedCheck = (action: 'approve' | 'reject' | 'return') => {
    const analysis = analyzeSelectedItemsStatus();
    
    // Check if selection has mixed statuses
    const statusCount = [analysis.pending, analysis.approved, analysis.rejected, analysis.review].filter(count => count > 0).length;
    const hasMixedStatus = statusCount > 1;
    
    if (hasMixedStatus) {
      // Mixed status - show modal to choose scope
      setPendingBulkAction({ action, analysis });
      setIsMixedStatusModalOpen(true);
    } else {
      // All same status - proceed directly
      executeBulkAction(action, 'all');
    }
  };

  // Execute the actual bulk action
  const executeBulkAction = (action: 'approve' | 'reject' | 'return', scope: 'pending-only' | 'all') => {
    const analysis = analyzeSelectedItemsStatus();
    
    // Determine which items to apply action to
    let targetItems = selectedItems;
    if (scope === 'pending-only') {
      const pendingItems = analysis.items.filter(item => item.status === 'Pending');
      targetItems = pendingItems.map(item => item.id || '');
    }
    
    switch (action) {
      case 'approve':
        handleBulkApproveItems(targetItems);
        break;
      case 'reject':
        handleBulkRejectItems(targetItems);
        break;
      case 'return':
        if (scope === 'all' || analysis.review > 0) {
          setIsReturnStepSelectorOpen(true);
        } else {
          handleBulkReturnItems(targetItems);
        }
        break;
    }
  };

  const handleReturnWithStep = (step: ReturnStep) => {
    const analysis = analyzeSelectedItemsStatus();
    console.log(`✓ Returning ${analysis.total} items with step: ${step.label}`, {
      step: step,
      items: selectedItems,
      targetStage: step.targetStage
    });
    // Update selected items to 'Review' status with return step info
    // In real implementation, this would call onOrderUpdate for each selected item
    setIsReturnStepSelectorOpen(false);
    setSelectedItems([]); // Clear selection after action
    
    // Show success feedback (in real implementation, this would be a toast)
    console.log(`🎉 Successfully returned ${analysis.total} items to ${step.targetStage}`);
  };

  function handleBulkApproveItems(itemIds: string[]) {
    console.log(`✓ Bulk approving ${itemIds.length} items:`, itemIds);
    
    // Update local state immediately for instant UI feedback
    setLocalItems(prevItems => 
      prevItems.map(item => 
        itemIds.includes(item.id || '') 
          ? { ...item, status: 'Approved' as PurchaseRequestItemStatus }
          : item
      )
    );
    
    // Also call parent onOrderUpdate 
    itemIds.forEach(itemId => {
      onOrderUpdate(itemId, { status: 'Approved' });
    });
    
    setSelectedItems([]); // Clear selection after action
    console.log(`🎉 Successfully approved ${itemIds.length} items`);
  }

  function handleBulkRejectItems(itemIds: string[]) {
    console.log(`✓ Bulk rejecting ${itemIds.length} items:`, itemIds);
    
    // Update local state immediately for instant UI feedback
    setLocalItems(prevItems => 
      prevItems.map(item => 
        itemIds.includes(item.id || '') 
          ? { ...item, status: 'Rejected' as PurchaseRequestItemStatus }
          : item
      )
    );
    
    // Also call parent onOrderUpdate
    itemIds.forEach(itemId => {
      onOrderUpdate(itemId, { status: 'Rejected' });
    });
    
    setSelectedItems([]); // Clear selection after action
    console.log(`🎉 Successfully rejected ${itemIds.length} items`);
  }

  function handleBulkReturnItems(itemIds: string[]) {
    console.log(`✓ Bulk returning ${itemIds.length} items:`, itemIds);
    
    // Update local state immediately for instant UI feedback
    setLocalItems(prevItems => 
      prevItems.map(item => 
        itemIds.includes(item.id || '') 
          ? { ...item, status: 'Review' as PurchaseRequestItemStatus }
          : item
      )
    );
    
    // Also call parent onOrderUpdate
    itemIds.forEach(itemId => {
      onOrderUpdate(itemId, { status: 'Review' });
    });
    
    setSelectedItems([]); // Clear selection after action
    console.log(`🎉 Successfully returned ${itemIds.length} items for review`);
  }

  function handleBulkSplit() {
    console.log("Bulk splitting items:", selectedItems);
    // This would open a modal to split selected items into multiple line items
  }

  function handleBulkSetRequiredDate() {
    console.log("Setting required date for items:", selectedItems);
    setIsBulkDateModalOpen(true);
  }

  function handleBulkDateConfirm() {
    if (!bulkRequiredDate || selectedItems.length === 0) return;
    
    console.log(`✓ Setting required date for ${selectedItems.length} items to:`, bulkRequiredDate);
    
    // Update local state immediately for instant UI feedback
    setLocalItems(prevItems => 
      prevItems.map(item => 
        selectedItems.includes(item.id || '') 
          ? { ...item, deliveryDate: bulkRequiredDate }
          : item
      )
    );
    
    // Also call parent onOrderUpdate for each selected item
    selectedItems.forEach(itemId => {
      onOrderUpdate(itemId, { deliveryDate: bulkRequiredDate });
    });
    
    setIsBulkDateModalOpen(false);
    setBulkRequiredDate(undefined);
    setSelectedItems([]); // Clear selection after action
    console.log(`🎉 Successfully set required date for ${selectedItems.length} items`);
  }

  function handleToggleTableExpand(itemId: string) {
    const newExpanded = new Set(expandedTableRows);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedTableRows(newExpanded);
  }

  function handleToggleRowEdit(itemId: string) {
    const newEditing = new Set(editingRows);
    if (newEditing.has(itemId)) {
      newEditing.delete(itemId);
    } else {
      newEditing.add(itemId);
    }
    setEditingRows(newEditing);
  }

  function handleSaveRowEdit(itemId: string) {
    // Remove from editing state
    const newEditing = new Set(editingRows);
    newEditing.delete(itemId);
    setEditingRows(newEditing);
    console.log(`✓ Saved inline edits for item: ${itemId}`);
  }

  function handleCancelRowEdit(itemId: string) {
    // Remove from editing state and potentially revert changes
    const newEditing = new Set(editingRows);
    newEditing.delete(itemId);
    setEditingRows(newEditing);
    console.log(`✗ Cancelled inline edits for item: ${itemId}`);
  }

  const handleOnHandClick = (item: PurchaseRequestItem) => {
    setSelectedItemForPopup(item);
    setIsOnHandPopupOpen(true);
  };

  const handleOnOrderClick = (item: PurchaseRequestItem) => {
    setSelectedItemForPopup(item);
    setIsOnOrderPopupOpen(true);
  };

  // Action handlers for status changes
  function handleApproveItem(itemId: string) {
    const item = filteredItems.find(i => i.id === itemId);
    console.log(`✓ Approving item: ${item?.name} (${itemId})`);
    
    // Update local state immediately
    setLocalItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, status: 'Approved' as PurchaseRequestItemStatus }
          : item
      )
    );
    
    // Also call parent onOrderUpdate
    onOrderUpdate(itemId, { status: 'Approved' });
    console.log(`🎉 Successfully approved item: ${item?.name}`);
  }

  function handleRejectItem(itemId: string) {
    const item = filteredItems.find(i => i.id === itemId);
    console.log(`✓ Rejecting item: ${item?.name} (${itemId})`);
    
    // Update local state immediately
    setLocalItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, status: 'Rejected' as PurchaseRequestItemStatus }
          : item
      )
    );
    
    // Also call parent onOrderUpdate
    onOrderUpdate(itemId, { status: 'Rejected' });
    console.log(`🎉 Successfully rejected item: ${item?.name}`);
  }

  function handleReviewItem(itemId: string) {
    const item = filteredItems.find(i => i.id === itemId);
    console.log(`✓ Sending item for review: ${item?.name} (${itemId})`);
    
    // Update local state immediately
    setLocalItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, status: 'Review' as PurchaseRequestItemStatus }
          : item
      )
    );
    
    // Also call parent onOrderUpdate
    onOrderUpdate(itemId, { status: 'Review' });
    console.log(`🎉 Successfully sent item for review: ${item?.name}`);
  }

  function handleDeleteItem(itemId: string) {
    console.log("Item deleted:", itemId);
    // onOrderUpdate would be called here in real implementation to remove the item
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Approved': return 'default';
      case 'Review': return 'secondary';
      case 'Rejected': return 'destructive';
      case 'Pending': return 'outline';
      default: return 'outline';
    }
  };

  const handleItemChange = (itemId: string, field: keyof PurchaseRequestItem, value: any) => {
    onOrderUpdate(itemId, { [field]: value });
  };

  // Helper functions for managing adjustment state
  const getItemAdjustments = (itemId: string) => {
    return itemAdjustments[itemId] || { tax: false, discount: false };
  };

  const updateItemAdjustments = (itemId: string, field: 'tax' | 'discount', value: boolean) => {
    const currentAdjustments = getItemAdjustments(itemId);
    const newAdjustments = { ...currentAdjustments, [field]: value };
    
    setItemAdjustments(prev => ({
      ...prev,
      [itemId]: newAdjustments
    }));
    
    // Also update the parent component
    handleItemChange(itemId, 'adjustments', newAdjustments);
    
    console.log(`Updated ${field} for item ${itemId}:`, newAdjustments);
  };

  const mockLocations = useMemo(() => [...new Set(localItems.map(i => i.location))], [localItems]);
  const mockProducts = useMemo(() => [...new Set(localItems.map(i => i.name))], [localItems]);
  const mockUnits = ["pieces", "kg", "g", "bags", "boxes", "units", "liters", "ml", "meters", "cm", "pairs", "sets"];

  // Mock data for on-hand by location
  const mockOnHandByLocation = [
    { location: "Main Kitchen", quantity: 25, unit: "kg", lastUpdated: "2024-01-15" },
    { location: "Storage Room", quantity: 150, unit: "kg", lastUpdated: "2024-01-14" },
    { location: "Cold Room", quantity: 75, unit: "kg", lastUpdated: "2024-01-16" },
    { location: "Dry Storage", quantity: 50, unit: "kg", lastUpdated: "2024-01-13" },
    { location: "Prep Area", quantity: 10, unit: "kg", lastUpdated: "2024-01-16" }
  ];

  // Mock data for purchase orders
  const mockPurchaseOrders = [
    { 
      poNumber: "PO-2024-001", 
      vendor: "Fresh Foods Ltd", 
      orderDate: "2024-01-10", 
      expectedDate: "2024-01-20", 
      quantity: 100, 
      unit: "kg", 
      status: "Pending",
      unitPrice: 12.50,
      totalAmount: 1250.00
    },
    { 
      poNumber: "PO-2024-015", 
      vendor: "Quality Suppliers", 
      orderDate: "2024-01-12", 
      expectedDate: "2024-01-22", 
      quantity: 50, 
      unit: "kg", 
      status: "Confirmed",
      unitPrice: 11.80,
      totalAmount: 590.00
    },
    { 
      poNumber: "PO-2024-028", 
      vendor: "Bulk Foods Inc", 
      orderDate: "2024-01-14", 
      expectedDate: "2024-01-25", 
      quantity: 75, 
      unit: "kg", 
      status: "In Transit",
      unitPrice: 13.20,
      totalAmount: 990.00
    }
  ];

  // Workflow return steps data
  const returnSteps: ReturnStep[] = [
    {
      id: "return-to-requestor",
      label: "Return to Requestor",
      description: "Send back to original requestor for revisions",
      targetStage: "Requestor"
    },
    {
      id: "return-to-department",
      label: "Return to Department Manager",
      description: "Send back to department manager for review",
      targetStage: "Department"
    },
    {
      id: "return-to-previous",
      label: "Return to Previous Approver",
      description: "Send back to previous approval stage",
      targetStage: "Previous"
    },
    {
      id: "return-with-comments",
      label: "Return with Comments",
      description: "Return with specific comments and requirements",
      targetStage: "Custom"
    }
  ];

  // Helper function to analyze selected items status mix
  const analyzeSelectedItemsStatus = () => {
    const selectedItemsData = filteredItems.filter(item => selectedItems.includes(item.id || ""));
    
    const statusCounts = selectedItemsData.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: selectedItemsData.length,
      pending: statusCounts.Pending || 0,
      approved: statusCounts.Approved || 0,
      rejected: statusCounts.Rejected || 0,
      review: statusCounts.Review || 0,
      statuses: Object.keys(statusCounts),
      items: selectedItemsData
    };
  };


  // Get available actions for individual items based on status
  const getAvailableItemActions = (status: string) => {
    switch (status) {
      case "Pending":
        return ["approve", "review", "reject"];
      case "Approved":
        return ["reject", "review"];
      case "Rejected":
        return ["approve", "review"];
      case "Review":
        return ["approve", "reject", "return"];
      default:
        return [];
    }
  };

  // Date picker component
  const DatePickerField = ({ value, onChange, placeholder = "Pick a date" }: {
    value?: Date;
    onChange: (date: Date | undefined) => void;
    placeholder?: string;
  }) => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "dd/MM/yyyy") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  };

  // Delivery point options
  const deliveryPointOptions = [
    { value: "main-kitchen", label: "Main Kitchen" },
    { value: "storage-room", label: "Storage Room" },
    { value: "receiving-dock", label: "Receiving Dock" },
    { value: "cold-storage", label: "Cold Storage" },
    { value: "dry-storage", label: "Dry Storage" },
    { value: "bar-storage", label: "Bar Storage" },
    { value: "housekeeping", label: "Housekeeping" },
    { value: "maintenance", label: "Maintenance" },
    { value: "front-office", label: "Front Office" },
    { value: "spa", label: "Spa" },
    { value: "gym", label: "Gym" },
    { value: "pool-area", label: "Pool Area" },
    { value: "restaurant", label: "Restaurant" },
    { value: "banquet", label: "Banquet Hall" },
    { value: "laundry", label: "Laundry" },
    { value: "other", label: "Other" }
  ];

  // Render detailed pricing information row - compact single row layout
  const renderDetailedPricingRow = (item: PurchaseRequestItem, isRequestor: boolean, isApprover: boolean, isPurchaser: boolean, isItemEditable: boolean) => (
    <div className="py-2 w-full">
      <div className="grid grid-cols-2 md:grid-cols-11 gap-3 items-center w-full">
        {/* Vendor Field - Takes 2 columns */}
        <div className="min-w-0 md:col-span-2">
          <div className="text-[10px] font-medium text-gray-500 uppercase mb-0.5">Vendor</div>
          {isItemEditable && (isApprover || isPurchaser) ? (
            <Input
              value={item.vendor || ""}
              onChange={(e) => item.id && handleItemChange(item.id, 'vendor', e.target.value)}
              placeholder="Vendor"
              className="h-6 text-xs border-gray-300 focus:border-green-500 focus:ring-green-500 focus:ring-1"
            />
          ) : (
            <div className="text-xs font-medium text-gray-800 truncate">
              {item.vendor || <span className="text-gray-400">-</span>}
            </div>
          )}
        </div>

        {/* Currency Field - Takes 1 column */}
        <div className="min-w-0">
          <div className="text-[10px] font-medium text-gray-500 uppercase mb-0.5">Currency</div>
          <div className="text-xs font-medium text-gray-800">
            {item.currency || "USD"}
          </div>
        </div>

        {/* Price per Unit Field - Takes 1 column */}
        <div className="min-w-0">
          <div className="text-[10px] font-medium text-gray-500 uppercase mb-0.5 text-right">Price/Unit</div>
          <div className="text-xs font-medium text-gray-800 text-right">
            {(item.price || 0).toFixed(2)} / {item.unit || 'unit'}
          </div>
        </div>

        {/* Subtotal Before Discount Field - Takes 1 column */}
        <div className="min-w-0">
          <div className="text-[10px] font-medium text-gray-500 uppercase mb-0.5 text-right">Subtotal</div>
          <div className="text-xs font-medium text-gray-800 text-right">
            {((item.price || 0) * (item.quantityApproved || 0)).toFixed(2)}
          </div>
        </div>

        {/* Discount Field - Takes 1 column */}
        <div className="min-w-0">
          <div className="text-[10px] font-medium text-gray-500 uppercase mb-0.5 text-right">Discount</div>
          {isItemEditable && (isApprover || isPurchaser) ? (
            <Input
              type="number"
              value={item.discountRate?.toFixed(2) || ""}
              onChange={(e) => item.id && handleItemChange(item.id, 'discountRate', parseFloat(e.target.value))}
              placeholder="0.00"
              className="h-6 text-xs border-gray-300 focus:border-green-500 focus:ring-green-500 focus:ring-1 text-right"
              step="0.01"
            />
          ) : (
            <div className="text-xs font-medium text-gray-800 text-right">
              {(item.discountRate || 0).toFixed(2)}
            </div>
          )}
        </div>

        {/* Net Amount Field - Takes 1 column */}
        <div className="min-w-0">
          <div className="text-[10px] font-medium text-blue-600 uppercase mb-0.5 text-right">Net Amount</div>
          <div className="text-xs font-semibold text-blue-700 text-right">
            {(() => {
              const subtotal = (item.price || 0) * (item.quantityApproved || 0);
              const discountAmount = getItemAdjustments(item.id || '').discount 
                ? (item.discountAmount || 0)
                : subtotal * (item.discountRate || 0);
              const netAmount = subtotal - discountAmount;
              return netAmount.toFixed(2);
            })()}
          </div>
        </div>

        {/* Tax Field - Takes 1 column */}
        <div className="min-w-0">
          <div className="text-[10px] font-medium text-gray-500 uppercase mb-0.5 text-right">
            Tax ({((item.taxRate || 0) * 100).toFixed(1)}%)
          </div>
          {isItemEditable && (isApprover || isPurchaser) ? (
            <Input
              type="number"
              value={item.taxRate?.toFixed(2) || ""}
              onChange={(e) => item.id && handleItemChange(item.id, 'taxRate', parseFloat(e.target.value))}
              placeholder="0.00"
              className="h-6 text-xs border-gray-300 focus:border-green-500 focus:ring-green-500 focus:ring-1 text-right"
              step="0.01"
            />
          ) : (
            <div className="text-xs font-medium text-gray-800 text-right">
              {(() => {
                const subtotal = (item.price || 0) * (item.quantityApproved || 0);
                const discountAmount = getItemAdjustments(item.id || '').discount 
                  ? (item.discountAmount || 0)
                  : subtotal * (item.discountRate || 0);
                const netAmount = subtotal - discountAmount;
                const taxAmount = getItemAdjustments(item.id || '').tax 
                  ? (item.taxAmount || 0)
                  : netAmount * (item.taxRate || 0);
                return taxAmount.toFixed(2);
              })()}
            </div>
          )}
        </div>

        {/* Total Field - Takes 1 column */}
        <div className="min-w-0">
          <div className="text-[10px] font-medium text-green-600 uppercase mb-0.5 text-right">Total</div>
          <div className="text-sm font-bold text-green-700 text-right">
            {(() => {
              const subtotal = (item.price || 0) * (item.quantityApproved || 0);
              const discountAmount = getItemAdjustments(item.id || '').discount 
                ? (item.discountAmount || 0)
                : subtotal * (item.discountRate || 0);
              const netAmount = subtotal - discountAmount;
              const taxAmount = getItemAdjustments(item.id || '').tax 
                ? (item.taxAmount || 0)
                : netAmount * (item.taxRate || 0);
              const totalAmount = netAmount + taxAmount;
              return totalAmount.toFixed(2);
            })()}
          </div>
        </div>

        {/* Vendor Compare Button - Takes 1 column */}
        <div className="min-w-0">
          <div className="text-[10px] font-medium text-gray-500 uppercase mb-0.5">&nbsp;</div>
          {!isRequestor && (
            <Dialog open={isVendorComparisonViewOpen} onOpenChange={setIsVendorComparisonViewOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-6 text-xs px-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                  onClick={() => setSelectedItemForComparison(item)}
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Compare
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Pricelist Information</DialogTitle>
                </DialogHeader>
                <VendorComparisonView 
                  currentPricelistNumber={selectedItemForComparison?.pricelistNumber}
                  itemName={selectedItemForComparison?.name}
                  itemDescription={selectedItemForComparison?.description}
                  itemUnit={selectedItemForComparison?.unit}
                  itemStatus={selectedItemForComparison?.status}
                  requestedQuantity={selectedItemForComparison?.quantityRequested}
                  approvedQuantity={selectedItemForComparison?.quantityApproved}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );


  // Render expanded item information
  const renderExpandedItemInfo = (item: PurchaseRequestItem, isRequestor: boolean, isApprover: boolean, isPurchaser: boolean, canSeePrices: boolean, isExpanded: boolean) => (
    <div className="space-y-6">
      {/* Expandable Sections - Only show when chevron is expanded */}
      {isExpanded && (
          <>
            

            {/* Business Dimensions (Allocation Fields) */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-purple-600" />
                <h4 className="font-semibold text-sm text-gray-900">Business Dimensions</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">Job Number</label>
                  {isTableEditMode ? (
                    <Select 
                      value={item.jobCode || ""} 
                      onValueChange={(value) => item.id && handleItemChange(item.id, 'jobCode', value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select job number" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JOB001">JOB001 - Office Renovation</SelectItem>
                        <SelectItem value="JOB002">JOB002 - Kitchen Upgrade</SelectItem>
                        <SelectItem value="JOB003">JOB003 - IT Infrastructure</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm font-medium">{item.jobCode || "Not assigned"}</div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">Event</label>
                  {isTableEditMode ? (
                    <Select 
                      value={item.event || ""} 
                      onValueChange={(value) => item.id && handleItemChange(item.id, 'event', value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select event" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CONF2024">Annual Conference 2024</SelectItem>
                        <SelectItem value="LAUNCH">Product Launch Event</SelectItem>
                        <SelectItem value="WORKSHOP">Training Workshop</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm font-medium">{item.event || "Not assigned"}</div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">Project</label>
                  {isTableEditMode ? (
                    <Select 
                      value={item.project || ""} 
                      onValueChange={(value) => item.id && handleItemChange(item.id, 'project', value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PROJ001">Digital Transformation</SelectItem>
                        <SelectItem value="PROJ002">Sustainability Initiative</SelectItem>
                        <SelectItem value="PROJ003">Market Expansion</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm font-medium">{item.project || "Not assigned"}</div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">Market Segment</label>
                  {isTableEditMode ? (
                    <Select 
                      value={item.marketSegment || ""} 
                      onValueChange={(value) => item.id && handleItemChange(item.id, 'marketSegment', value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select market segment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RETAIL">Retail</SelectItem>
                        <SelectItem value="WHOLESALE">Wholesale</SelectItem>
                        <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                        <SelectItem value="GOVERNMENT">Government</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm font-medium">{item.marketSegment || "Not assigned"}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Consolidated Pricing Section - Only visible for purchasers */}
            {canSeePrices && isPurchaser && (
              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-green-600" />
                    <h4 className="font-semibold text-lg text-gray-900">Pricing</h4>
                  </div>
                  {isPurchaser && (
                    <Dialog open={isVendorComparisonOpen} onOpenChange={setIsVendorComparisonOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedItemForComparison(item)}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Vendor Comparison
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Vendor Comparison</DialogTitle>
                        </DialogHeader>
                        <VendorComparison 
                          currentPricelistNumber={selectedItemForComparison?.pricelistNumber} 
                          selectedVendor={selectedItemForComparison?.vendor}
                          itemName={selectedItemForComparison?.name}
                          itemDescription={selectedItemForComparison?.description}
                          itemUnit={selectedItemForComparison?.unit}
                          itemStatus={selectedItemForComparison?.status}
                          requestedQuantity={selectedItemForComparison?.quantityRequested}
                          approvedQuantity={selectedItemForComparison?.quantityApproved}
                          onPricelistSelect={(vendor, pricelistNumber, unitPrice) => {
                            if (selectedItemForComparison?.id) {
                              handleItemChange(selectedItemForComparison.id, 'vendor', vendor);
                              handleItemChange(selectedItemForComparison.id, 'pricelistNumber', pricelistNumber);
                              handleItemChange(selectedItemForComparison.id, 'price', unitPrice);
                            }
                            setIsVendorComparisonOpen(false);
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                {/* Top Row: Vendor, Pricelist, Order Currency, Exchange Rate, Price per Unit */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Vendor</label>
                    {isPurchaser ? (
                      <Input
                        value={item.vendor || ""}
                        onChange={(e) => item.id && handleItemChange(item.id, 'vendor', e.target.value)}
                        placeholder="Enter vendor name"
                        className="h-10"
                      />
                    ) : (
                      <div className="text-base font-medium bg-gray-50 p-2 rounded border">{item.vendor || "Not assigned"}</div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Pricelist Number</label>
                    {isPurchaser ? (
                      <Input
                        value={item.pricelistNumber || ""}
                        onChange={(e) => item.id && handleItemChange(item.id, 'pricelistNumber', e.target.value)}
                        placeholder="Enter pricelist number"
                        className="h-10"
                      />
                    ) : (
                      <div className="text-base font-medium bg-gray-50 p-2 rounded border">{item.pricelistNumber || "Not specified"}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Order Currency</label>
                    {isPurchaser ? (
                      <Select 
                        value={item.currency || "USD"} 
                        onValueChange={(value) => item.id && handleItemChange(item.id, 'currency', value)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="THB">THB</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-base font-medium bg-gray-50 p-2 rounded border">{item.currency || "USD"}</div>
                    )}
                    <div className="text-sm text-muted-foreground">Base Currency: {item.baseCurrency || 'USD'}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Exchange Rate</label>
                    {isPurchaser ? (
                      <Input
                        type="number"
                        step="0.0001"
                        value={item.currencyRate || ""}
                        onChange={(e) => item.id && handleItemChange(item.id, 'currencyRate', parseFloat(e.target.value))}
                        placeholder="Enter exchange rate"
                        className="h-10 text-right"
                      />
                    ) : (
                      <div className="text-base font-medium bg-gray-50 p-2 rounded border text-right">{(item.currencyRate || 1).toFixed(4)}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Price per Unit</label>
                    {isPurchaser ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={item.price || ""}
                        onChange={(e) => item.id && handleItemChange(item.id, 'price', parseFloat(e.target.value))}
                        placeholder="Enter price per unit"
                        className="h-10 text-right"
                      />
                    ) : (
                      <div className="text-base font-medium bg-gray-50 p-2 rounded border text-right">{(item.price || 0).toFixed(2)}</div>
                    )}
                    <div className="text-sm text-muted-foreground text-right">per {item.unit || 'unit'}</div>
                  </div>
                </div>

                {/* Tax and Discount Overrides */}
                {isPurchaser && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    {/* Left Column: Discount and Tax Sections */}
                    <div className="flex flex-col">
                      {/* Discount Section */}
                      <div className="space-y-2 mb-4">
                        <label className="text-sm font-medium text-gray-700">Discount</label>
                        <div className="bg-green-50 p-3 rounded border border-green-200" style={{ minHeight: '80px' }}>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-xs text-green-700 font-medium mb-1 block">Type</label>
                              <Select 
                                value={item.discountType || "Percentage"} 
                                onValueChange={(value) => item.id && handleItemChange(item.id, 'discountType', value)}
                                disabled={!getItemAdjustments(item.id || '').discount}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Percentage">%</SelectItem>
                                  <SelectItem value="Fixed Amount">Fixed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <label className="text-xs text-green-700 font-medium mb-1 block">Rate</label>
                              <div className="text-center bg-white p-1 rounded border h-8 flex items-center justify-center">
                                <span className="text-xs text-green-700 font-medium">
                                  {((item.discountRate || 0) * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <Checkbox 
                                  id={`discount-override-${item.id}`}
                                  checked={getItemAdjustments(item.id || '').discount}
                                  onCheckedChange={(checked) => {
                                    console.log('Discount checkbox clicked:', checked);
                                    if (item.id) {
                                      updateItemAdjustments(item.id, 'discount', Boolean(checked));
                                    }
                                  }}
                                  className="cursor-pointer"
                                />
                                <label 
                                  htmlFor={`discount-override-${item.id}`}
                                  className="text-xs text-green-700 font-medium cursor-pointer"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const currentValue = getItemAdjustments(item.id || '').discount;
                                    const newValue = !currentValue;
                                    console.log('Discount label clicked, new value:', newValue);
                                    if (item.id) {
                                      updateItemAdjustments(item.id, 'discount', newValue);
                                    }
                                  }}
                                >
                                  Amount
                                </label>
                              </div>
                              <Input
                                type="number"
                                step="0.01"
                                value={item.discountAmount || ""}
                                onChange={(e) => item.id && handleItemChange(item.id, 'discountAmount', parseFloat(e.target.value))}
                                placeholder="Enter amount"
                                className="h-8 text-right text-xs"
                                disabled={!getItemAdjustments(item.id || '').discount}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tax Section - Aligned with Total Amount */}
                      <div className="space-y-2" style={{ marginTop: '24px' }}>
                        <label className="text-sm font-medium text-gray-700">Tax</label>
                        <div className="bg-yellow-50 p-3 rounded border border-yellow-200" style={{ minHeight: '80px' }}>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-xs text-orange-700 font-medium mb-1 block">Profile</label>
                              <Select 
                                value={item.taxType || "VAT"} 
                                onValueChange={(value) => item.id && handleItemChange(item.id, 'taxType', value)}
                                disabled={!getItemAdjustments(item.id || '').tax}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="VAT">VAT</SelectItem>
                                  <SelectItem value="GST">GST</SelectItem>
                                  <SelectItem value="SST">SST</SelectItem>
                                  <SelectItem value="None">None</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <label className="text-xs text-orange-700 font-medium mb-1 block">Rate</label>
                              <div className="text-center bg-white p-1 rounded border h-8 flex items-center justify-center">
                                <span className="text-xs text-orange-700 font-medium">
                                  {((item.taxRate || 0.07) * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <Checkbox 
                                  id={`tax-override-${item.id}`}
                                  checked={getItemAdjustments(item.id || '').tax}
                                  onCheckedChange={(checked) => {
                                    console.log('Tax checkbox clicked:', checked);
                                    if (item.id) {
                                      updateItemAdjustments(item.id, 'tax', Boolean(checked));
                                    }
                                  }}
                                  className="cursor-pointer"
                                />
                                <label 
                                  htmlFor={`tax-override-${item.id}`}
                                  className="text-xs text-orange-700 font-medium cursor-pointer"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const currentValue = getItemAdjustments(item.id || '').tax;
                                    const newValue = !currentValue;
                                    console.log('Tax label clicked, new value:', newValue);
                                    if (item.id) {
                                      updateItemAdjustments(item.id, 'tax', newValue);
                                    }
                                  }}
                                >
                                  Amount
                                </label>
                              </div>
                              <Input
                                type="number"
                                step="0.01"
                                value={item.taxAmount || ""}
                                onChange={(e) => item.id && handleItemChange(item.id, 'taxAmount', parseFloat(e.target.value))}
                                placeholder="Enter tax amount"
                                className="h-8 text-right text-xs"
                                disabled={!getItemAdjustments(item.id || '').tax}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground text-right">
                          Base Tax: {item.baseCurrency || 'USD'} {((item.taxAmount || 0) / (item.currencyRate || 1)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Net Amount and Total Amount */}
                    <div className="space-y-4">
                      {/* Net Amount */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Net Total</label>
                        <div className="text-lg font-bold bg-blue-50 p-3 rounded border border-blue-200 text-blue-700 text-right" style={{ minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          {item.currency} {(() => {
                            const subtotal = (item.price || 0) * (item.quantityApproved || item.quantityRequested || 0);
                            const discountAmount = getItemAdjustments(item.id || '').discount 
                              ? (item.discountAmount || 0)
                              : subtotal * (item.discountRate || 0);
                            const netAmount = subtotal - discountAmount;
                            return netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                          })()}
                        </div>
                        <div className="text-sm text-muted-foreground text-right">
                          Base Net Total: {item.baseCurrency || 'USD'} {(() => {
                            const subtotal = (item.price || 0) * (item.quantityApproved || item.quantityRequested || 0);
                            const discountAmount = getItemAdjustments(item.id || '').discount 
                              ? (item.discountAmount || 0)
                              : subtotal * (item.discountRate || 0);
                            const netAmount = subtotal - discountAmount;
                            return (netAmount / (item.currencyRate || 1)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                          })()}
                        </div>
                      </div>

                      {/* Total Amount */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Total Amount</label>
                        <div className="text-xl font-bold bg-green-50 p-3 rounded border border-green-200 text-green-700 text-right" style={{ minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          {item.currency} {(() => {
                            const subtotal = (item.price || 0) * (item.quantityApproved || item.quantityRequested || 0);
                            const discountAmount = getItemAdjustments(item.id || '').discount 
                              ? (item.discountAmount || 0)
                              : subtotal * (item.discountRate || 0);
                            const netAmount = subtotal - discountAmount;
                            const taxAmount = getItemAdjustments(item.id || '').tax 
                              ? (item.taxAmount || 0)
                              : netAmount * (item.taxRate || 0);
                            const totalAmount = netAmount + taxAmount;
                            return totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                          })()}
                        </div>
                        <div className="text-sm text-muted-foreground text-right">
                          Base Total Amount: {item.baseCurrency || 'USD'} {(() => {
                            const subtotal = (item.price || 0) * (item.quantityApproved || item.quantityRequested || 0);
                            const discountAmount = getItemAdjustments(item.id || '').discount 
                              ? (item.discountAmount || 0)
                              : subtotal * (item.discountRate || 0);
                            const netAmount = subtotal - discountAmount;
                            const taxAmount = getItemAdjustments(item.id || '').tax 
                              ? (item.taxAmount || 0)
                              : netAmount * (item.taxRate || 0);
                            const totalAmount = netAmount + taxAmount;
                            return (totalAmount / (item.currencyRate || 1)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

          </>
        )}

    </div>
  );

  const renderMobileCardView = () => (
    <div className="space-y-4">
      {isAddingNewItem && (
        <Card>
          <CardContent className="p-4">
            <NewItemRow
              onSave={handleAddNewItem}
              onCancel={closeItemForm}
              locations={mockLocations}
              products={mockProducts}
              units={mockUnits}
              showPricing={!isRequestor}
            />
          </CardContent>
        </Card>
      )}
      {filteredItems.map((item) => {
        const itemIsRequestor = currentUser.role === 'Staff' || currentUser.role === 'Requestor';
        const itemIsApprover = currentUser.role === 'Department Manager' || 
                              currentUser.role === 'Financial Manager' ||
                              currentUser.role === 'Approver';
        const itemIsPurchaser = currentUser.role === 'Purchasing Staff' || 
                               currentUser.role === 'Purchaser';
        const canSeePrices = (user?.context.showPrices !== false);
        const canSeeVendorPricingPanel = (itemIsApprover || itemIsPurchaser); // Vendor pricing panel: visible for approvers and purchasers
        
        return (
          <Card key={item.id} className={`relative transition-all duration-200 ${isTableEditMode ? 'ring-2 ring-amber-300 bg-amber-50/20 shadow-md' : 'hover:shadow-md'}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedItems.includes(item.id || "")}
                    onCheckedChange={() => handleSelectItem(item.id || "")}
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{item.name}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(item.status)} className="text-xs px-2 py-1">
                  {item.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium text-sm">{item.location}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Quantity</p>
                  <p className="font-medium text-sm">{item.quantityRequested} {item.unit}</p>
                  {item.quantityApproved && (
                    <p className="text-xs text-green-600">Approved: {item.quantityApproved}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Delivery</p>
                  <p className="font-medium text-sm">{item.deliveryDate ? format(item.deliveryDate, "dd/MM") : "TBD"}</p>
                </div>
              </div>


              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openItemForm(item, "view")} className="h-8 px-3">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openItemForm(item, "edit")} className="h-8 px-3">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
                {!itemIsRequestor && (
                  <div className="text-xs text-muted-foreground">
                    Vendor: {item.vendor || "Not assigned"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderTableView = () => (
    <Card>
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
          <TableHeader>
            <TableRow className="bg-muted/50 border-b-2 border-muted">
              <TableHead className="w-[40px] text-center">
                <Checkbox
                  checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                  onCheckedChange={handleSelectAllItems}
                />
              </TableHead>
              <TableHead className="w-[60px] text-center font-semibold">#</TableHead>
              <TableHead className="font-semibold text-left min-w-[140px]">Location & Status</TableHead>
              <TableHead className="font-semibold text-left min-w-[200px]">Product Details</TableHead>
              <TableHead className="font-semibold text-center min-w-[120px]">Requested</TableHead>
              <TableHead className="font-semibold text-center min-w-[120px]">Approved</TableHead>
              {!isRequestor && (
                <TableHead className="font-semibold text-right min-w-[120px]">Pricing</TableHead>
              )}
              <TableHead className="w-[100px] font-semibold text-center">More</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isAddingNewItem && (
              <NewItemRow
                onSave={handleAddNewItem}
                onCancel={closeItemForm}
                locations={mockLocations}
                products={mockProducts}
                units={mockUnits}
                showPricing={!isRequestor}
              />
            )}
            {filteredItems.map((item, index) => {
              const isExpanded = expandedTableRows.has(item.id || "");
              const itemIsRequestor = currentUser.role === 'Staff' || currentUser.role === 'Requestor';
              const itemIsApprover = currentUser.role === 'Department Manager' || 
                                    currentUser.role === 'Financial Manager' ||
                                    currentUser.role === 'Approver';
              const itemIsPurchaser = currentUser.role === 'Purchasing Staff' || 
                                     currentUser.role === 'Purchaser';
              const canSeePrices = (user?.context.showPrices !== false);
        const canSeeVendorPricingPanel = (itemIsApprover || itemIsPurchaser); // Vendor pricing panel: visible for approvers and purchasers
              const isRowEditing = editingRows.has(item.id || "");
              const isItemEditable = isTableEditMode || isRowEditing;
              
              return (
                <React.Fragment key={item.id}>
                  <TableRow className="hover:bg-muted/30 group transition-colors border-b">
                    <TableCell className="text-center py-3" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedItems.includes(item.id || "")}
                        onCheckedChange={() => handleSelectItem(item.id || "")}
                      />
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <div className="text-sm font-medium text-gray-600">
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      {isItemEditable && itemIsRequestor ? (
                        <Select value={item.location || ""} onValueChange={(value) => item.id && handleItemChange(item.id, 'location', value)}>
                          <SelectTrigger className="w-full"><SelectValue placeholder="Select location" /></SelectTrigger>
                          <SelectContent>
                            {mockLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-blue-500/70 flex-shrink-0" />
                            <div className="font-medium text-sm">{item.location}</div>
                          </div>
                          <div>
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                "text-xs px-1.5 py-0.5 font-normal inline-flex items-center gap-1",
                                item.status === 'Approved' && "bg-green-100 text-green-700 border-green-200",
                                item.status === 'Review' && "bg-yellow-100 text-yellow-700 border-yellow-200",
                                item.status === 'Rejected' && "bg-red-100 text-red-700 border-red-200",
                                item.status === 'Pending' && "bg-gray-100 text-gray-600 border-gray-200"
                              )}
                            >
                              {item.status === 'Approved' && <CheckCircle className="h-3 w-3" />}
                              {item.status === 'Review' && <RotateCcw className="h-3 w-3" />}
                              {item.status === 'Rejected' && <XCircle className="h-3 w-3" />}
                              {item.status === 'Pending' && <Clock className="h-3 w-3" />}
                              {item.status}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      {isItemEditable && itemIsRequestor ? (
                        <Select value={item.name || ""} onValueChange={(value) => item.id && handleItemChange(item.id, 'name', value)}>
                          <SelectTrigger className="w-full"><SelectValue placeholder="Select product" /></SelectTrigger>
                          <SelectContent>
                            {mockProducts.map(prod => <SelectItem key={prod} value={prod}>{prod}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-start gap-3">
                          <Package className="h-4 w-4 text-primary/70 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-sm leading-tight">{item.name}</div>
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</div>
                          </div>
                        </div>
                      )}
                    </TableCell>
                    {/* Requested Quantity Column */}
                    <TableCell className="py-3 text-center">
                      <div className="space-y-1">
                        {isItemEditable && itemIsRequestor ? (
                          <div className="flex items-center gap-1 justify-center">
                            <Input type="number" step="0.00001" value={item.quantityRequested?.toFixed(5) || ""} onChange={(e) => item.id && handleItemChange(item.id, 'quantityRequested', parseFloat(e.target.value))} className="h-8 w-20 text-right" />
                            <Select value={item.unit || ""} onValueChange={(value) => item.id && handleItemChange(item.id, 'unit', value)}>
                              <SelectTrigger className="h-8 w-20"><SelectValue placeholder="Unit" /></SelectTrigger>
                              <SelectContent>
                                {mockUnits.map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="text-sm font-medium text-right">{item.quantityRequested?.toFixed(5) || '0.00000'} {item.unit}</div>
                            <div className="text-xs text-muted-foreground">
                              {convertToInventoryUnit(item.quantityRequested, item.unit, 'pieces', 12)}
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    {/* Approved Quantity Column */}
                    <TableCell className="py-3 text-center">
                      <div className="space-y-1">
                        {(itemIsApprover || itemIsPurchaser) ? (
                          <div className="flex items-center gap-1 justify-center">
                            <Input type="number" step="0.00001" value={item.quantityApproved?.toFixed(5) || ""} onChange={(e) => item.id && handleItemChange(item.id, 'quantityApproved', parseFloat(e.target.value))} className="h-8 w-24 text-right" placeholder="0.00000" />
                            <span className="text-xs text-gray-600">{item.unit}</span>
                          </div>
                        ) : (
                          <div className="text-center">
                            {item.quantityApproved ? (
                              <>
                                <div className="text-sm font-medium text-green-700 text-right">{item.quantityApproved?.toFixed(5) || '0.00000'} {item.unit}</div>
                                <div className="text-xs text-muted-foreground">
                                  {convertToInventoryUnit(item.quantityApproved, item.unit, 'pieces', 12)}
                                </div>
                              </>
                            ) : (
                              <div className="text-xs text-gray-400 italic">Pending</div>
                            )}
                          </div>
                        )}
                        {/* FOC field below approved quantity - Hidden for requestors */}
                        {!itemIsRequestor && (
                          <div className="pt-1 border-t border-gray-200 mt-2">
                            {isItemEditable && (itemIsApprover || itemIsPurchaser) ? (
                            <div className="flex items-center gap-1 justify-center">
                              <span className="text-xs text-gray-500">FOC:</span>
                              <Input 
                                type="number" 
                                value={item.foc?.toFixed(5) || ""} 
                                onChange={(e) => item.id && handleItemChange(item.id, 'foc', parseFloat(e.target.value))} 
                                className="h-6 w-20 text-right text-xs" 
                                step="0.00001" 
                                placeholder="0"
                              />
                              <Select value={item.unit || ""} onValueChange={(value) => item.id && handleItemChange(item.id, 'unit', value)}>
                                <SelectTrigger className="h-6 w-20 text-xs"><SelectValue placeholder="Unit" /></SelectTrigger>
                                <SelectContent>
                                  {mockUnits.map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          ) : (
                            <div className="text-xs font-medium text-blue-600 text-right">FOC: {item.foc?.toFixed(5) || '0.00000'} {item.unit}</div>
                          )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    {canSeePrices && (
                      <TableCell className="py-3 text-right">
                        <div className="space-y-1">
                          <div className="font-semibold text-base text-right">{item.currency} {(item.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                          <div className="text-xs text-blue-600 mt-1 text-right">
                            {item.baseCurrency || 'USD'} {((item.totalAmount || 0) * (item.currencyRate || 1)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </TableCell>
                    )}
                    <TableCell onClick={(e) => e.stopPropagation()} className="py-3 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted/60">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {/* Edit Actions - Always visible */}
                          {!editingRows.has(item.id || "") ? (
                            <DropdownMenuItem onClick={() => handleToggleRowEdit(item.id || "")}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Item
                            </DropdownMenuItem>
                          ) : (
                            <>
                              <DropdownMenuItem 
                                onClick={() => handleSaveRowEdit(item.id || "")}
                                className="text-green-600 focus:text-green-600"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Save Changes
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleCancelRowEdit(item.id || "")}
                                className="text-gray-600 focus:text-gray-600"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel Edit
                              </DropdownMenuItem>
                            </>
                          )}
                          
                          {/* Role-based actions */}
                          {(itemIsRequestor || itemIsApprover || itemIsPurchaser) && <DropdownMenuSeparator />}
                          
                          {/* Staff/Requestor Actions */}
                          {itemIsRequestor && (
                            <DropdownMenuItem 
                              onClick={() => handleDeleteItem(item.id || "")}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Item
                            </DropdownMenuItem>
                          )}
                          
                          {/* Status-based Actions for Approvers/Purchasers */}
                          {(itemIsApprover || itemIsPurchaser) && (() => {
                            const availableActions = getAvailableItemActions(item.status);
                            
                            return (
                              <>
                                {availableActions.includes("approve") && (
                                  <DropdownMenuItem 
                                    onClick={() => handleApproveItem(item.id || "")}
                                    className="text-green-600 focus:text-green-600"
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve Item
                                  </DropdownMenuItem>
                                )}
                                {availableActions.includes("reject") && (
                                  <DropdownMenuItem 
                                    onClick={() => handleRejectItem(item.id || "")}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject Item
                                  </DropdownMenuItem>
                                )}
                                {availableActions.includes("review") && (
                                  <DropdownMenuItem 
                                    onClick={() => handleReviewItem(item.id || "")}
                                    className="text-yellow-600 focus:text-yellow-600"
                                  >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Send for Review
                                  </DropdownMenuItem>
                                )}
                                {availableActions.includes("return") && (
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedItems([item.id || ""]);
                                      setIsReturnStepSelectorOpen(true);
                                    }}
                                    className="text-orange-600 focus:text-orange-600"
                                  >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Return Item
                                  </DropdownMenuItem>
                                )}
                              </>
                            );
                          })()}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  
                  {/* Always visible comment row with chevron */}
                  <TableRow className="hover:bg-muted/30 group transition-colors border-b bg-gray-25">
                    <TableCell colSpan={canSeePrices ? 8 : 7} className="py-3">
                      <div className="flex items-start gap-2 px-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 hover:bg-muted/60 mt-1 flex-shrink-0"
                          onClick={() => handleToggleTableExpand(item.id || "")}
                        >
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                        <div className="flex-1 space-y-3">
                          {/* Comment Section */}
                          {item.comment ? (
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                              <p className="text-sm text-blue-800">{item.comment}</p>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400 italic">No comment</div>
                          )}
                          
                          {/* Inventory Information */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <div 
                              className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center cursor-pointer hover:bg-blue-100 transition-colors"
                              onClick={() => handleOnHandClick(item)}
                            >
                              <div className="text-xs font-bold text-blue-700">{item.inventoryInfo?.onHand || 0} {item.inventoryInfo?.inventoryUnit || 'units'}</div>
                              <div className="text-[10px] text-blue-600 font-medium">On Hand</div>
                            </div>
                            <div 
                              className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-center cursor-pointer hover:bg-orange-100 transition-colors"
                              onClick={() => handleOnOrderClick(item)}
                            >
                              <div className="text-xs font-bold text-orange-700">{item.inventoryInfo?.onOrdered || 0} {item.inventoryInfo?.inventoryUnit || 'units'}</div>
                              <div className="text-[10px] text-orange-600 font-medium">On Order</div>
                            </div>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center">
                              <div className="text-xs font-bold text-yellow-700">{item.inventoryInfo?.reorderLevel || 0} {item.inventoryInfo?.inventoryUnit || 'units'}</div>
                              <div className="text-[10px] text-yellow-600 font-medium">Reorder Level</div>
                            </div>
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 text-center">
                              <div className="text-xs font-bold text-purple-700">{item.inventoryInfo?.restockLevel || 0} {item.inventoryInfo?.inventoryUnit || 'units'}</div>
                              <div className="text-[10px] text-purple-600 font-medium">Restock Level</div>
                            </div>
                          </div>
                          
                          {/* Date Required and Delivery Point */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-[10px]">
                              <span className="text-gray-600 font-medium">Date Required:</span>
                              {isItemEditable && itemIsRequestor ? (
                                <DatePickerField
                                  value={item.deliveryDate}
                                  onChange={(date) => item.id && handleItemChange(item.id, 'deliveryDate', date)}
                                  placeholder="Select date"
                                />
                              ) : (
                                <span className="text-gray-900 font-semibold ml-1">
                                  {item.deliveryDate ? format(item.deliveryDate, "dd/MM/yyyy") : "Not specified"}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px]">
                              <span className="text-gray-600 font-medium">Delivery Point:</span>
                              <span className="text-gray-900 font-semibold ml-1">
                                {item.deliveryPoint || "Not specified"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {/* Detailed pricing information row - Show for Approvers and Purchasers only */}
                  {canSeeVendorPricingPanel && (
                    <TableRow className="hover:bg-muted/30 group transition-colors border-b bg-gray-25">
                      <TableCell colSpan={canSeePrices ? 8 : 7} className="py-3">
                        <div className="px-2">
                          {renderDetailedPricingRow(item, itemIsRequestor, itemIsApprover, itemIsPurchaser, isItemEditable)}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {/* Full expanded view - only when chevron is clicked */}
                  {isExpanded && (
                    <TableRow className="hover:bg-muted/30 group transition-colors border-b bg-gray-50">
                      <TableCell colSpan={canSeePrices ? 8 : 7} className="py-3">
                        <div className="px-2">
                          {renderExpandedItemInfo(item, itemIsRequestor, itemIsApprover, itemIsPurchaser, canSeePrices, isExpanded)}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header with action buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Purchase Request Items</h2>
          <Badge variant="secondary" className="px-2 py-1 text-xs">
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Global Edit Toggle */}
          <div className="flex items-center gap-2">
            <Label htmlFor="edit-mode" className="text-sm font-medium">
              {formMode === "edit" ? "Edit Mode (Form)" : "Edit Mode"}
            </Label>
            <Checkbox
              id="edit-mode"
              checked={isTableEditMode}
              onCheckedChange={(checked) => setIsTableEditMode(checked === true)}
              disabled={formMode === "edit"}
            />
            {formMode === "edit" && (
              <span className="text-xs text-blue-600 font-medium">Controlled by form</span>
            )}
          </div>

          {/* Add New Item Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingNewItem(true)}
            disabled={isAddingNewItem}
            className="text-xs"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>

          {/* Allocate Vendor Button - Only visible to purchasers */}
          {isPurchaser && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // TODO: Implement vendor allocation functionality
                console.log("Allocate Vendor clicked");
              }}
              className="text-xs"
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Allocate Vendor
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Item Actions */}
      {selectedItems.length > 0 && (() => {
        const analysis = analyzeSelectedItemsStatus();
        const isApprover = ['Department Manager', 'Financial Manager', 'Purchasing Staff', 'Purchaser'].includes(currentUser.role);
        
        return (
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-dashed">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected:
              </span>
              {analysis.pending > 0 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {analysis.pending} Pending
                </span>
              )}
              {analysis.approved > 0 && (
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                  {analysis.approved} Approved
                </span>
              )}
              {analysis.rejected > 0 && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                  {analysis.rejected} Rejected
                </span>
              )}
              {analysis.review > 0 && (
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                  {analysis.review} In Review
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {isApprover ? (
                <>
                  {/* Approve Selected Button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleBulkActionWithMixedCheck('approve')}
                    className="text-xs font-medium text-green-600 hover:text-green-700 border-green-200"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve Selected
                  </Button>
                  
                  {/* Reject Selected Button - Ensure visibility for purchasers */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleBulkActionWithMixedCheck('reject')}
                    className="text-xs font-medium text-red-600 hover:text-red-700 border-red-200"
                    style={{ display: 'inline-flex' }}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject Selected
                  </Button>
                  
                  {/* Return Selected Button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleBulkActionWithMixedCheck('return')}
                    className="text-xs font-medium text-orange-600 hover:text-orange-700 border-orange-200"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Return Selected
                  </Button>
                </>
              ) : (
                <span className="text-xs text-gray-500 italic">
                  No approval permission (Role: {currentUser.role})
                </span>
              )}
              
              {/* Split Button (always available) */}
              <Button variant="outline" size="sm" onClick={handleBulkSplit} className="text-xs text-blue-600 hover:text-blue-700">
                <Split className="h-4 w-4 mr-1" />
                Split
              </Button>
              
              {/* Set Required Date Button (always available) */}
              <Button variant="outline" size="sm" onClick={handleBulkSetRequiredDate} className="text-xs text-purple-600 hover:text-purple-700">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Set Required Date
              </Button>
            </div>
          </div>
        );
      })()}

      {/* Render current view */}
      {true ? renderTableView() : renderMobileCardView()}

      {/* Item Details Form Modal */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {itemFormMode === "add" ? "Add New Item" : "Item Details"}
              </DialogTitle>
            </DialogHeader>
            <ItemDetailsEditForm
              onSave={handleSaveItem}
              onCancel={closeItemForm}
              onDelete={itemFormMode === "edit" ? () => handleDeleteItem(selectedItem?.id || "") : undefined}
              initialData={selectedItem}
              mode={itemFormMode || "view"}
              onModeChange={setItemFormMode}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Vendor Comparison Modal */}
      <Dialog open={isVendorComparisonOpen} onOpenChange={setIsVendorComparisonOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vendor Comparison</DialogTitle>
          </DialogHeader>
          <VendorComparison 
            currentPricelistNumber={selectedItemForComparison?.pricelistNumber}
            itemName={selectedItemForComparison?.name}
            itemDescription={selectedItemForComparison?.description}
            itemUnit={selectedItemForComparison?.unit}
            itemStatus={selectedItemForComparison?.status}
            requestedQuantity={selectedItemForComparison?.quantityRequested}
            approvedQuantity={selectedItemForComparison?.quantityApproved}
          />
        </DialogContent>
      </Dialog>

      {/* On Hand by Location Modal */}
      <Dialog open={isOnHandPopupOpen} onOpenChange={setIsOnHandPopupOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>On Hand by Location - {selectedItemForPopup?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Current inventory levels across all locations
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-center">Unit</TableHead>
                    <TableHead className="text-center">Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockOnHandByLocation.map((location, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{location.location}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {location.quantity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                      </TableCell>
                      <TableCell className="text-center">{location.unit}</TableCell>
                      <TableCell className="text-center text-sm text-gray-500">{location.lastUpdated}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-blue-50">
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold text-blue-700">
                      {mockOnHandByLocation.reduce((sum, loc) => sum + loc.quantity, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                    </TableCell>
                    <TableCell className="text-center font-semibold">kg</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* On Order (Purchase Orders) Modal */}
      <Dialog open={isOnOrderPopupOpen} onOpenChange={setIsOnOrderPopupOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase Orders - {selectedItemForPopup?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Outstanding purchase orders for this item
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="text-center">Order Date</TableHead>
                    <TableHead className="text-center">Expected Date</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-center">Unit</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPurchaseOrders.map((po, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-blue-600">{po.poNumber}</TableCell>
                      <TableCell>{po.vendor}</TableCell>
                      <TableCell className="text-center text-sm">{po.orderDate}</TableCell>
                      <TableCell className="text-center text-sm">{po.expectedDate}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {po.quantity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                      </TableCell>
                      <TableCell className="text-center">{po.unit}</TableCell>
                      <TableCell className="text-right">
                        ${po.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ${po.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs px-2 py-1",
                            po.status === 'Confirmed' && "bg-green-100 text-green-700 border-green-200",
                            po.status === 'Pending' && "bg-yellow-100 text-yellow-700 border-yellow-200",
                            po.status === 'In Transit' && "bg-blue-100 text-blue-700 border-blue-200"
                          )}
                        >
                          {po.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-orange-50">
                    <TableCell colSpan={4} className="font-bold">Total Ordered</TableCell>
                    <TableCell className="text-right font-bold text-orange-700">
                      {mockPurchaseOrders.reduce((sum, po) => sum + po.quantity, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                    </TableCell>
                    <TableCell className="text-center font-semibold">kg</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right font-bold text-orange-700">
                      ${mockPurchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Return Step Selector Modal */}
      <Dialog open={isReturnStepSelectorOpen} onOpenChange={setIsReturnStepSelectorOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Return Step</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Choose where to return the selected items:
            </div>
            <div className="space-y-2">
              {returnSteps.map((step) => (
                <Button
                  key={step.id}
                  variant="outline"
                  className="w-full justify-start p-4 h-auto"
                  onClick={() => handleReturnWithStep(step)}
                >
                  <div className="text-left">
                    <div className="font-medium">{step.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{step.description}</div>
                  </div>
                </Button>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsReturnStepSelectorOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mixed Status Modal */}
      <Dialog open={isMixedStatusModalOpen} onOpenChange={setIsMixedStatusModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mixed Status Selection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              You have selected items with different statuses. How would you like to apply the <span className="font-semibold">{pendingBulkAction?.action}</span> action?
            </div>
            
            {pendingBulkAction && (
              <div className="bg-gray-50 p-3 rounded text-xs space-y-1">
                <div>Selected items breakdown:</div>
                {pendingBulkAction.analysis.pending > 0 && (
                  <div className="flex justify-between">
                    <span>• Pending items:</span>
                    <span className="font-medium">{pendingBulkAction.analysis.pending}</span>
                  </div>
                )}
                {pendingBulkAction.analysis.approved > 0 && (
                  <div className="flex justify-between">
                    <span>• Approved items:</span>
                    <span className="font-medium">{pendingBulkAction.analysis.approved}</span>
                  </div>
                )}
                {pendingBulkAction.analysis.rejected > 0 && (
                  <div className="flex justify-between">
                    <span>• Rejected items:</span>
                    <span className="font-medium">{pendingBulkAction.analysis.rejected}</span>
                  </div>
                )}
                {pendingBulkAction.analysis.review > 0 && (
                  <div className="flex justify-between">
                    <span>• In Review items:</span>
                    <span className="font-medium">{pendingBulkAction.analysis.review}</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start p-4 h-auto"
                onClick={() => {
                  if (pendingBulkAction) {
                    executeBulkAction(pendingBulkAction.action, 'pending-only');
                    setIsMixedStatusModalOpen(false);
                    setPendingBulkAction(null);
                  }
                }}
                disabled={!pendingBulkAction || pendingBulkAction.analysis.pending === 0}
              >
                <div className="text-left">
                  <div className="font-medium">Apply to Pending Items Only</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Only change the status of pending items ({pendingBulkAction?.analysis.pending || 0} items)
                  </div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start p-4 h-auto"
                onClick={() => {
                  if (pendingBulkAction) {
                    executeBulkAction(pendingBulkAction.action, 'all');
                    setIsMixedStatusModalOpen(false);
                    setPendingBulkAction(null);
                  }
                }}
              >
                <div className="text-left">
                  <div className="font-medium">Apply to All Selected Items</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Change the status of all selected items ({pendingBulkAction?.analysis.total || 0} items)
                  </div>
                </div>
              </Button>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsMixedStatusModalOpen(false);
                  setPendingBulkAction(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Set Required Date Modal */}
      <Dialog open={isBulkDateModalOpen} onOpenChange={setIsBulkDateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Required Date</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Set the required date for {selectedItems.length} selected item{selectedItems.length !== 1 ? 's' : ''}:
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Required Date</label>
              <DatePickerField
                value={bulkRequiredDate}
                onChange={setBulkRequiredDate}
                placeholder="Select required date"
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsBulkDateModalOpen(false);
                  setBulkRequiredDate(undefined);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleBulkDateConfirm}
                disabled={!bulkRequiredDate}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Set Date
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}