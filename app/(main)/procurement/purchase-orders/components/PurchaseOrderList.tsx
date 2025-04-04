"use client";

import React, { useState, useMemo } from "react";
import { PurchaseOrder, PurchaseOrderStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ListPageTemplate from "@/components/templates/ListPageTemplate";
import StatusBadge from "@/components/ui/custom-status-badge";
import { AdvancedFilter } from './advanced-filter'
import { Filter as FilterType } from '@/lib/utils/filter-storage'
import { CreatePOModal } from "./create-po-modal";
import Link from "next/link";
import { mockPurchaseOrders } from '../data/mock-data';

export function PurchaseOrderList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedPOs, setSelectedPOs] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof PurchaseOrder | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const itemsPerPage = 10;
  
  const handleSelectPO = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPOs([...selectedPOs, id]);
    } else {
      setSelectedPOs(selectedPOs.filter((poId) => poId !== id));
    }
  };

  const handleSort = (field: keyof PurchaseOrder) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleApplyAdvancedFilters = (filters: FilterType<PurchaseOrder>[]) => {
    // This function now directly affects the sortedAndFilteredData through its dependencies
    // No need to set filteredPOs state
    if (filters && filters.length > 0) {
      // We'll update the search term and status to match the filters
      // This will trigger the useMemo to recalculate
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

  const handleClearAdvancedFilters = () => {
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
    let result = mockPurchaseOrders;

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

  const filters = (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search POs..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {selectedStatus}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => handleStatusChange("All Statuses")}>
                All Statuses
              </DropdownMenuItem>
              {Object.values(PurchaseOrderStatus).map((status) => (
                <DropdownMenuItem key={status} onSelect={() => handleStatusChange(status)}>
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex gap-2">
          <AdvancedFilter 
            onApplyFilters={handleApplyAdvancedFilters}
            onClearFilters={handleClearAdvancedFilters}
          />
        </div>
      </div>
    </div>
  );

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

      <div className="rounded-lg border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/75">
                <TableHead className="w-12 py-3 font-bold text-gray-600">
                  <Checkbox
                    checked={selectedPOs.length === paginatedPOs.length && paginatedPOs.length > 0}
                    onCheckedChange={handleSelectAllPOs}
                  />
                </TableHead>
                <TableHead className="py-3 font-bold text-gray-600">
                  <div className="flex items-center gap-2">
                    PO Number
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-0 h-auto"
                      onClick={() => handleSort('number')}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </TableHead>
                <TableHead className="py-3 font-bold text-gray-600">
                  <div className="flex items-center gap-2">
                    Vendor
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-0 h-auto"
                      onClick={() => handleSort('vendorName')}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </TableHead>
                <TableHead className="py-3 font-bold text-gray-600 hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    Date
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-0 h-auto"
                      onClick={() => handleSort('orderDate')}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </TableHead>
                <TableHead className="py-3 font-bold text-gray-600 hidden lg:table-cell">Delivery Date</TableHead>
                <TableHead className="py-3 font-bold text-gray-600 hidden md:table-cell">Description</TableHead>
                <TableHead className="py-3 font-bold text-gray-600 hidden lg:table-cell">Buyer</TableHead>
                <TableHead className="py-3 font-bold text-gray-600 text-right">
                  <div className="flex items-center justify-end gap-2">
                    Amount
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-0 h-auto"
                      onClick={() => handleSort('totalAmount')}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </TableHead>
                <TableHead className="py-3 font-bold text-gray-600">Status</TableHead>
                <TableHead className="py-3 font-bold text-gray-600 w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPOs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <p className="text-gray-500 mb-2">No purchase orders found</p>
                      <Button variant="outline" size="sm" onClick={() => {
                        const createButton = document.querySelector('.create-po-button') as HTMLElement;
                        if (createButton) createButton.click();
                      }}>
                        Create your first purchase order
                      </Button>
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
                    <TableCell className="py-4">{po.vendorName}</TableCell>
                    <TableCell className="py-4 hidden md:table-cell">{po.orderDate.toLocaleDateString()}</TableCell>
                    <TableCell className="py-4 hidden lg:table-cell">{po.DeliveryDate ? po.DeliveryDate.toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell className="py-4 hidden md:table-cell">{po.description}</TableCell>
                    <TableCell className="py-4 hidden lg:table-cell">{po.buyer}</TableCell>
                    <TableCell className="py-4 text-right">${po.totalAmount.toFixed(2)}</TableCell>
                    <TableCell className="py-4">
                      <StatusBadge status={po.status} />
                    </TableCell>
                    <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <Link href={`/procurement/purchase-orders/${po.poId}`}>
                            <FileText className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <Link href={`/procurement/purchase-orders/${po.poId}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            // Handle delete action
                            console.log('Delete PO:', po.poId);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, sortedAndFilteredData.length)}{" "}
          of {sortedAndFilteredData.length} results
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">First page</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <ListPageTemplate
      title="Purchase Orders"
      actionButtons={actionButtons}
      filters={filters}
      content={content}
      bulkActions={bulkActions}
    />
  );
}

export default PurchaseOrderList;
