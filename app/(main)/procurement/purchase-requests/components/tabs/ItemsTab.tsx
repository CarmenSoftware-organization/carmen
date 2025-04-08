"use client"

import React, { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Eye, 
  Edit, 
  X,
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
  PlusCircle,
  MoreVertical 
} from "lucide-react"
import { ItemDetailsEditForm } from "../item-details-edit-form"
import { PurchaseRequestItem } from "@/lib/types"
import StatusBadge from "@/components/ui/custom-status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/custom-dialog"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

interface ItemsTabProps {
  items: PurchaseRequestItem[]
  mode: "view" | "edit"
  onAddItem?: () => void
  onEditItem?: (item: PurchaseRequestItem) => void
  onDeleteItem?: (item: PurchaseRequestItem) => void
}

export function ItemsTab({
  items,
  mode,
  onAddItem,
  onEditItem,
  onDeleteItem,
}: ItemsTabProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [localItems, setLocalItems] = useState<PurchaseRequestItem[]>(items)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<PurchaseRequestItem | null>(null)
  const [formMode, setFormMode] = useState<"view" | "edit" | "add">("view")
  const [filterText, setFilterText] = useState("")

  const filteredItems = localItems.filter(item => 
    item.name.toLowerCase().includes(filterText.toLowerCase()) ||
    item.description.toLowerCase().includes(filterText.toLowerCase())
  )

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
    setIsFormOpen(true);
  }

  function closeItemForm() {
    setSelectedItem(null);
    setIsFormOpen(false);
    setFormMode("view");
  }

  function handleSave(formData: PurchaseRequestItem) {
    console.log("Saving item:", formData);
    closeItemForm();
    setLocalItems(prevItems => {
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
    const updatedItems = localItems.map((item) =>
      selectedItems.includes(item.id ?? "") ? { ...item, status: action } : item
    );
    setLocalItems(updatedItems);
    setSelectedItems([]);
  }

  function handleSplitItems() {
    // Implement split items logic here
    console.log("Splitting items:", selectedItems);
    // You would typically open a dialog or form to handle the split operation
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search items..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-[300px]"
          />
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Requested Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.quantityRequested}</TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}