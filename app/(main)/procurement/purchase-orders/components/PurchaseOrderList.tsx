'use client'

import React, { useState, useMemo } from "react";
import { PurchaseOrder, PurchaseOrderStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import ListPageTemplate from "@/components/templates/ListPageTemplate";
import StatusBadge from "@/components/ui/custom-status-badge";
import { AdvancedFilter } from './advanced-filter'
import { CreatePOModal } from "./create-po-modal";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { FilterType } from "@/lib/utils/filter-storage";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Search,
  FileText,
  Trash2,
  FileDown,
  Printer,
  Edit,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

type SortableFields = keyof Pick<PurchaseOrder, 
  'number' | 
  'vendorName' | 
  'orderDate' | 
  'totalAmount'
>;

const purchaseOrders: PurchaseOrder[] = [
  {
    poId: "1",
    number: "PO-001",
    vendorId: 1,
    vendorName: "Vendor A",
    orderDate: new Date("2024-03-20"),
    DeliveryDate: new Date("2024-03-25"),
    status: PurchaseOrderStatus.Draft,
    currencyCode: "USD",
    exchangeRate: 1,
    notes: "Sample order A",
    createdBy: 1,
    email: "vendor.a@example.com",
    buyer: "John Doe",
    creditTerms: "Net 30",
    description: "Sample order A",
    remarks: "",
    items: [],
    baseCurrencyCode: "USD",
    baseSubTotalPrice: 1500.00,
    subTotalPrice: 1500.00,
    baseNetAmount: 1500.00,
    netAmount: 1500.00,
    baseDiscAmount: 0,
    discountAmount: 0,
    baseTaxAmount: 0,
    taxAmount: 0,
    baseTotalAmount: 1500.00,
    totalAmount: 1500.00
  },
  {
    poId: "2",
    number: "PO-002",
    vendorId: 2,
    vendorName: "Vendor B",
    orderDate: new Date("2024-03-19"),
    DeliveryDate: new Date("2024-03-24"),
    status: PurchaseOrderStatus.Sent,
    currencyCode: "USD",
    exchangeRate: 1,
    notes: "Sample order B",
    createdBy: 1,
    email: "vendor.b@example.com",
    buyer: "Jane Smith",
    creditTerms: "Net 30",
    description: "Sample order B",
    remarks: "",
    items: [],
    baseCurrencyCode: "USD",
    baseSubTotalPrice: 2300.00,
    subTotalPrice: 2300.00,
    baseNetAmount: 2300.00,
    netAmount: 2300.00,
    baseDiscAmount: 0,
    discountAmount: 0,
    baseTaxAmount: 0,
    taxAmount: 0,
    baseTotalAmount: 2300.00,
    totalAmount: 2300.00
  }
];

interface AdvancedFilterProps {
  onApplyFilters: (filters: FilterType<PurchaseOrder>[]) => void;
  onClearFilters: () => void;
}

export function PurchaseOrderList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedPOs, setSelectedPOs] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortableFields | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const itemsPerPage = 10;
  
  const handleSelectPO = (poId: string, checked: boolean) => {
    if (checked) {
      setSelectedPOs([...selectedPOs, poId]);
    } else {
      setSelectedPOs(selectedPOs.filter((id) => id !== poId));
    }
  };

  const handleSort = (field: SortableFields) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleApplyAdvancedFilters = (filters: FilterType<PurchaseOrder>[]) => {
    if (filters && filters.length > 0) {
      const statusFilter = filters.find(f => f.field === 'status');
      if (statusFilter) {
        setSelectedStatus(statusFilter.value as string);
      }
      
      const searchFilter = filters.find(f => 
        f.field === 'number' || 
        f.field === 'vendorName' || 
        f.field === 'description'
      );
      if (searchFilter) {
        setSearchTerm(searchFilter.value as string);
      }
    }
    
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("All Statuses");
    setCurrentPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const handleSelectAllPOs = (checked: boolean) => {
    if (checked) {
      setSelectedPOs(paginatedPOs.map(po => po.poId));
    } else {
      setSelectedPOs([]);
    }
  };

  // Apply filters and sorting
  const sortedAndFilteredData = useMemo(() => {
    let result = purchaseOrders;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(po => 
        po.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedStatus !== "All Statuses") {
      result = result.filter(po => po.status === selectedStatus);
    }

    // Apply sorting
    if (sortField) {
      result = [...result].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        // Handle null or undefined values
        if (aValue === null && bValue === null) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        // Safe comparison after null checks
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === "asc" 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        // For numbers, dates, and other comparable types
        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [searchTerm, selectedStatus, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedAndFilteredData.length / itemsPerPage);
  const paginatedPOs = sortedAndFilteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const bulkActions = selectedPOs.length > 0 ? (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm">Delete Selected</Button>
      <Button variant="outline" size="sm">Approve Selected</Button>
      <Button variant="outline" size="sm">Print Selected</Button>
    </div>
  ) : null;

  const actionButtons = (
    <div className="flex flex-col sm:flex-row gap-2">
      <CreatePOModal />
      <Button variant="outline">
        <FileDown className="mr-2 h-4 w-4" />
        Export
      </Button>
      <Button variant="outline">
        <Printer className="mr-2 h-4 w-4" />
        Print
      </Button>
    </div>
  );

  const content = (
    <div className="space-y-6">
      {/* Description Section */}
      <div className="bg-white px-6 py-4 border rounded-lg">
        <h2 className="text-sm font-semibold text-gray-900">About Purchase Orders</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your purchase orders to vendors. Track order status, delivery dates, and payment terms for all your procurement activities.
        </p>
      </div>
      
      {/* Status Summary Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Object.values(PurchaseOrderStatus).map(status => {
          const count = sortedAndFilteredData.filter(po => po.status === status).length;
          const total = sortedAndFilteredData
            .filter(po => po.status === status)
            .reduce((sum, po) => sum + po.totalAmount, 0);
            
          return (
            <div 
              key={status}
              className="bg-white p-4 rounded-lg border cursor-pointer hover:border-primary"
              onClick={() => setSelectedStatus(status)}
            >
              <StatusBadge status={status} className="mb-2" />
              <div className="mt-2 font-semibold">{count} Orders</div>
              <div className="text-sm text-muted-foreground">${total.toLocaleString()}</div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border bg-white overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex items-center max-w-md w-full">
            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by PO number, vendor, or description..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex">
                  {selectedStatus}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleStatusChange("All Statuses")}>
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {Object.values(PurchaseOrderStatus).map((status) => (
                  <DropdownMenuItem key={status} onClick={() => handleStatusChange(status)}>
                    <StatusBadge status={status} className="mr-2" />
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <AdvancedFilter
              onApplyFilters={handleApplyAdvancedFilters}
              onClearFilters={handleClearFilters}
            />
          </div>
        </div>

        {bulkActions && (
          <div className="px-4 py-2 bg-muted flex items-center justify-between">
            <div className="text-sm font-medium">
              {selectedPOs.length} Purchase Orders selected
            </div>
            {bulkActions}
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="w-[40px] pl-4">
                  <Checkbox
                    checked={
                      paginatedPOs.length > 0 &&
                      selectedPOs.length === paginatedPOs.length
                    }
                    onCheckedChange={handleSelectAllPOs}
                  />
                </TableCell>
                <TableCell
                  className="cursor-pointer"
                  onClick={() => handleSort("number")}
                >
                  <div className="flex items-center">
                    PO Number
                    {sortField === "number" && (
                      <ArrowUpDown
                        className={cn(
                          "ml-2 h-4 w-4",
                          sortOrder === "desc" ? "transform rotate-180" : ""
                        )}
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell
                  className="cursor-pointer hidden md:table-cell"
                  onClick={() => handleSort("vendorName")}
                >
                  <div className="flex items-center">
                    Vendor
                    {sortField === "vendorName" && (
                      <ArrowUpDown
                        className={cn(
                          "ml-2 h-4 w-4",
                          sortOrder === "desc" ? "transform rotate-180" : ""
                        )}
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell
                  className="cursor-pointer"
                  onClick={() => handleSort("orderDate")}
                >
                  <div className="flex items-center">
                    Date
                    {sortField === "orderDate" && (
                      <ArrowUpDown
                        className={cn(
                          "ml-2 h-4 w-4",
                          sortOrder === "desc" ? "transform rotate-180" : ""
                        )}
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">Delivery Date</TableCell>
                <TableCell className="hidden lg:table-cell">Currency</TableCell>
                <TableCell className="hidden md:table-cell">Net Amount</TableCell>
                <TableCell className="hidden md:table-cell">Tax Amount</TableCell>
                <TableCell
                  className="cursor-pointer text-right"
                  onClick={() => handleSort("totalAmount")}
                >
                  <div className="flex items-center justify-end">
                    Total
                    {sortField === "totalAmount" && (
                      <ArrowUpDown
                        className={cn(
                          "ml-2 h-4 w-4",
                          sortOrder === "desc" ? "transform rotate-180" : ""
                        )}
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell className="hidden md:table-cell">Receiving</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPOs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FileText className="h-8 w-8 mb-2" />
                      <p>No purchase orders found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPOs.map((po) => (
                  <TableRow 
                    key={po.poId} 
                    className="group hover:bg-gray-50/50 cursor-pointer border-b last:border-b-0"
                    onClick={() => {
                      window.location.href = `/procurement/purchase-orders/${po.poId}`;
                    }}
                  >
                    <TableCell className="py-4 pl-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedPOs.includes(po.poId)}
                        onCheckedChange={(checked) => handleSelectPO(po.poId, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="py-4 font-medium">{po.number}</TableCell>
                    <TableCell className="py-4 hidden md:table-cell">{po.vendorName}</TableCell>
                    <TableCell className="py-4">{po.orderDate.toLocaleDateString()}</TableCell>
                    <TableCell className="py-4 hidden lg:table-cell">
                      {po.DeliveryDate ? po.DeliveryDate.toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell className="py-4 hidden lg:table-cell">{po.currencyCode}</TableCell>
                    <TableCell className="py-4 hidden md:table-cell text-right">${po.netAmount.toFixed(2)}</TableCell>
                    <TableCell className="py-4 hidden md:table-cell text-right">${po.taxAmount.toFixed(2)}</TableCell>
                    <TableCell className="py-4 text-right">${po.totalAmount.toFixed(2)}</TableCell>
                    <TableCell className="py-4">
                      <StatusBadge status={po.status} />
                    </TableCell>
                    <TableCell className="py-4 hidden md:table-cell">
                      {/* Show receiving status as a fraction */}
                      {po.items.length > 0 ? (
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2 max-w-24">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                po.status === PurchaseOrderStatus.FullyReceived 
                                  ? "bg-green-500" 
                                  : po.status === PurchaseOrderStatus.Partial
                                    ? "bg-orange-500"
                                    : "bg-primary"
                              )}
                              style={{
                                width: `${
                                  po.items.length === 0
                                    ? 0
                                    : (po.items.reduce((total, item) => total + (item.receivedQuantity || 0), 0) /
                                      po.items.reduce((total, item) => total + item.orderedQuantity, 0)) * 100
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-xs">
                            {po.items.reduce((total, item) => total + (item.receivedQuantity || 0), 0)}/
                            {po.items.reduce((total, item) => total + item.orderedQuantity, 0)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">No items</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-2 flex items-center justify-between border-t">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, sortedAndFilteredData.length)} of{" "}
              {sortedAndFilteredData.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {/* Page Numbers */}
              <div className="flex items-center text-sm space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={i}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      className={cn(
                        "h-8 w-8",
                        pageNum === currentPage
                          ? "bg-primary text-primary-foreground"
                          : ""
                      )}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <ListPageTemplate
        title="Purchase Orders"
        description="Manage all purchase orders"
        actionButtons={actionButtons}
        content={content}
      />
    </>
  );
}

export default PurchaseOrderList;
