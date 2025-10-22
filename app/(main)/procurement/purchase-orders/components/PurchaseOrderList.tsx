"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Currency, PurchaseOrder, PurchaseRequest, PurchaseOrderStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Eye,
  Trash2,
  Plus,
  X,
  CheckSquare,
  FileDown,
  Mail,
  Printer,
  Edit2Icon,
  ImageIcon,
  MessageSquareIcon,
  Filter,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  MoreVertical,
  List,
  LayoutGrid,
  Edit,
  Trash,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ListPageTemplate from "@/components/templates/ListPageTemplate";
import { mockPurchaseOrders } from "@/lib/mock-data";  
import StatusBadge from "@/components/ui/custom-status-badge";
import CreatePOFromPR from "./createpofrompr";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { randomUUID } from "crypto";
import { AdvancedFilter } from './advanced-filter'
import { Filter as FilterType } from '@/lib/utils/filter-storage'
import { format } from "date-fns";

type FilterField = keyof PurchaseOrder
type FilterOperator = 'equals' | 'contains' | 'in' | 'between' | 'greaterThan' | 'lessThan'
type LogicalOperator = 'AND' | 'OR'
type FilterValue = string | number | string[] | number[] | [number, number]

interface Filter {
  field: FilterField
  operator: FilterOperator
  value: FilterValue
  logicalOperator?: LogicalOperator
}

interface SortConfig {
  field: keyof PurchaseOrder | null;
  direction: "asc" | "desc";
}

export function PurchaseOrderList() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [selectedPOs, setSelectedPOs] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: null,
    direction: "asc"
  });
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const itemsPerPage = 7;
  const [advancedFilters, setAdvancedFilters] = useState<FilterType<PurchaseOrder>[]>([]);

  // Memoize the filtered and sorted data
  const filteredPOs = useMemo(() => {
    // First apply search and status filters
    let result = mockPurchaseOrders.filter(
      (po) =>
        (((po as any).number || po.orderNumber)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          po.vendorName.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === "" || po.status === statusFilter)
    );

    // Apply advanced filters if they exist
    if (advancedFilters.length > 0) {
      result = result.filter((po) => {
        return advancedFilters.reduce((matches, filter, index) => {
          const fieldValue = po[filter.field as keyof PurchaseOrder];
          let fieldMatches = false;
          
          switch (filter.operator) {
            case 'equals':
              fieldMatches = fieldValue === filter.value;
              break;
            case 'contains':
              if (typeof fieldValue === 'string' && typeof filter.value === 'string') {
                fieldMatches = fieldValue.toLowerCase().includes(filter.value.toLowerCase());
              }
              break;
            case 'in':
              if (Array.isArray(filter.value)) {
                if (filter.value.every((item: unknown): item is string => typeof item === 'string')) {
                  fieldMatches = (filter.value as string[]).includes(fieldValue as string);
                }
                if (filter.value.every((item: unknown): item is number => typeof item === 'number')) {
                  fieldMatches = (filter.value as number[]).includes(fieldValue as number);
                }
              }
              break;
            case 'between':
              if (Array.isArray(filter.value) && 
                  filter.value.length === 2 && 
                  typeof fieldValue === 'number' &&
                  typeof filter.value[0] === 'number' &&
                  typeof filter.value[1] === 'number') {
                fieldMatches = fieldValue >= filter.value[0] && fieldValue <= filter.value[1];
              }
              break;
            case 'greaterThan':
              if (typeof fieldValue === 'number' && typeof filter.value === 'number') {
                fieldMatches = fieldValue > filter.value;
              }
              break;
            case 'lessThan':
              if (typeof fieldValue === 'number' && typeof filter.value === 'number') {
                fieldMatches = fieldValue < filter.value;
              }
              break;
            default:
              fieldMatches = true;
          }

          // Apply logical operator
          return index === 0 
            ? fieldMatches 
            : filter.logicalOperator === 'AND'
              ? matches && fieldMatches
              : matches || fieldMatches;
        }, true);
      });
    }

    // Apply sorting if a sort field is set
    if (sortConfig.field) {
      result = [...result].sort((a, b) => {
        const aValue = a[sortConfig.field!];
        const bValue = b[sortConfig.field!];
        if (aValue == null || bValue == null) return 0;
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [searchTerm, statusFilter, sortConfig, advancedFilters]);

  // Get current page items
  const paginatedPOs = useMemo(() => {
    return filteredPOs.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredPOs, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredPOs.length / itemsPerPage);

  const handleSelectPO = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPOs([...selectedPOs, id]);
    } else {
      setSelectedPOs(selectedPOs.filter((poId) => poId !== id));
    }
  };

  const handleSelectAllPOs = (checked: boolean) => {
    if (checked) {
      setSelectedPOs(paginatedPOs.map(po => (po as any).poId || po.id));
    } else {
      setSelectedPOs([]);
    }
  };

  const handleSort = (field: keyof PurchaseOrder) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleApplyAdvancedFilters = (filters: FilterType<PurchaseOrder>[]) => {
    setAdvancedFilters(filters);
    setCurrentPage(1);
  };

  const handleClearAdvancedFilters = () => {
    setAdvancedFilters([]);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCreateNew = () => {
    router.push("/procurement/purchase-orders/create");
  };

  const filters = (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex flex-1 items-center">
        <div className="relative w-full max-w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search POs..."
            className="pl-9 h-9"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              {statusFilter || "All Statuses"}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setStatusFilter("")}>All Statuses</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setStatusFilter("Open")}>Open</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setStatusFilter("Sent")}>Sent</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setStatusFilter("Partial Received")}>Partial Received</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setStatusFilter("Closed")}>Closed</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <AdvancedFilter 
          onApplyFilters={handleApplyAdvancedFilters}
          onClearFilters={handleClearAdvancedFilters}
        />

        {/* View Mode Toggle */}
        <div className="flex border rounded-md overflow-hidden">
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="rounded-none h-8 px-2"
          >
            <List className="h-4 w-4" />
            <span className="sr-only">Table View</span>
          </Button>
          <Button
            variant={viewMode === 'card' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('card')}
            className="rounded-none h-8 px-2"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="sr-only">Card View</span>
          </Button>
        </div>
      </div>
    </div>
  );

  // Bulk Actions component
  const bulkActions = selectedPOs.length > 0 ? (
    <div className="flex items-center p-2 bg-muted/50 rounded-md">
      <span className="text-sm font-medium mr-3">
        {selectedPOs.length} POs selected
      </span>
      <div className="flex flex-wrap gap-2">
        <Button variant="default" size="sm">
          <Mail className="mr-2 h-4 w-4" />
          Send Selected
        </Button>
        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Selected
        </Button>
        <Button variant="outline" size="sm">
          <X className="mr-2 h-4 w-4" />
          Cancel Selected
        </Button>
      </div>
    </div>
  ) : null;

  // Table View
  const tableView = (
    <div className="rounded-md border overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[40px] h-10">
                <Checkbox 
                  checked={paginatedPOs.length > 0 && selectedPOs.length === paginatedPOs.length}
                  onCheckedChange={handleSelectAllPOs}
                />
              </TableHead>
              <TableHead className="font-medium">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort('orderNumber')}
                >
                  PO Number
                  {sortConfig.field === 'orderNumber' && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="font-medium">
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort('vendorName')}
                >
                  Vendor
                  {sortConfig.field === 'vendorName' && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="font-medium">
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort('orderDate')}
                >
                  Date
                  {sortConfig.field === 'orderDate' && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="font-medium">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort('expectedDeliveryDate')}
                >
                  Delivery Date
                  {sortConfig.field === 'expectedDeliveryDate' && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium text-right">
                <div 
                  className="flex items-center justify-end cursor-pointer"
                  onClick={() => handleSort('totalAmount')}
                >
                  Amount
                  {sortConfig.field === 'totalAmount' && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="font-medium">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort('currency')}
                >
                  Currency
                  {sortConfig.field === 'currency' && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPOs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Search className="h-8 w-8 mb-2 opacity-50" />
                    <p>No purchase orders found</p>
                    {(searchTerm || statusFilter || advancedFilters.length > 0) && (
                      <Button 
                        variant="link" 
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("");
                          setAdvancedFilters([]);
                        }}
                        className="mt-2"
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedPOs.map((po) => (
                <TableRow
                  key={(po as any).poId || po.id}
                  className="hover:bg-muted/10 transition-colors cursor-pointer"
                  onClick={() => router.push(`/procurement/purchase-orders/${(po as any).poId || po.id}`)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedPOs.includes((po as any).poId || po.id)}
                      onCheckedChange={(checked) => handleSelectPO((po as any).poId || po.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link
                      href={`/procurement/purchase-orders/${(po as any).poId || po.id}`}
                      className="text-primary hover:text-primary/80 hover:underline font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {(po as any).number || po.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{po.vendorName}</TableCell>
                  <TableCell>{po.orderDate.toLocaleDateString()}</TableCell>
                  <TableCell>{((po as any).DeliveryDate || po.expectedDeliveryDate) ? ((po as any).DeliveryDate || po.expectedDeliveryDate).toLocaleDateString() : "N/A"}</TableCell>
                  <TableCell>
                    <StatusBadge status={po.status} />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {(typeof (po as any).totalAmount === 'number' ? (po as any).totalAmount : (po as any).totalAmount?.amount || 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {(po as any).currencyCode || po.currency}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end space-x-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <span className="sr-only">More options</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <FileDown className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  // Card View
  const cardView = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {paginatedPOs.length === 0 ? (
        <div className="col-span-full h-48 flex flex-col items-center justify-center text-muted-foreground">
          <Search className="h-8 w-8 mb-2 opacity-50" />
          <p>No purchase orders found</p>
          {(searchTerm || statusFilter || advancedFilters.length > 0) && (
            <Button 
              variant="link" 
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setAdvancedFilters([]);
              }}
              className="mt-2"
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        paginatedPOs.map((po) => (
          <Card
            key={(po as any).poId || po.id}
            className="overflow-hidden hover:bg-secondary/10 transition-colors h-full shadow-sm cursor-pointer"
            onClick={() => router.push(`/procurement/purchase-orders/${(po as any).poId || po.id}`)}
          >
            <div className="flex flex-col h-full">
              {/* Card Header */}
              <div className="p-5 pb-3 bg-muted/30 border-b">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedPOs.includes((po as any).poId || po.id)}
                      onCheckedChange={(checked) => {
                        handleSelectPO((po as any).poId || po.id, checked as boolean);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <Link
                        href={`/procurement/purchase-orders/${(po as any).poId || po.id}`}
                        className="text-lg font-semibold text-primary hover:text-primary/80 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {(po as any).number || po.orderNumber}
                      </Link>
                      <p className="text-sm text-muted-foreground">{po.orderDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <StatusBadge status={po.status} />
                </div>
              </div>
              
              {/* Card Content */}
              <div className="p-5 flex-grow">
                <div className="mb-3">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Vendor</p>
                  <p className="text-sm font-medium">{po.vendorName}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Delivery Date</p>
                    <p className="text-sm font-medium">{((po as any).DeliveryDate || po.expectedDeliveryDate) ? ((po as any).DeliveryDate || po.expectedDeliveryDate).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Tax Amount</p>
                    <p className="text-sm font-medium">{(typeof (po as any).taxAmount === 'number' ? (po as any).taxAmount : (po as any).taxAmount?.amount || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Net Amount</p>
                    <p className="text-sm font-medium">{(typeof (po as any).netAmount === 'number' ? (po as any).netAmount : (po as any).netAmount?.amount || 0).toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-border/50">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Total Amount</p>
                    <p className="text-base font-semibold">{(typeof (po as any).totalAmount === 'number' ? (po as any).totalAmount : (po as any).totalAmount?.amount || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Currency</p>
                    <p className="text-sm font-medium">{(po as any).currencyCode || po.currency}</p>
                  </div>
                </div>
              </div>
              
              {/* Card Actions */}
              <div className="flex justify-end px-4 py-3 bg-muted/20 border-t space-x-1" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <span className="sr-only">More options</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileDown className="mr-2 h-4 w-4" />
                      Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  // Pagination
  const pagination = (
    <div className="flex items-center justify-between space-x-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        Showing {filteredPOs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredPOs.length)} of {filteredPOs.length} results
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // Main content
  const content = (
    <div className="space-y-4">
      {viewMode === "table" ? tableView : cardView}
      {pagination}
    </div>
  );

  const [showCreateFromPRDialog, setShowCreateFromPRDialog] = useState(false);
  
  const handleSelectPRs = (selectedPRs: PurchaseRequest[]) => {
    setShowCreateFromPRDialog(false);
    
    if (selectedPRs.length > 0) {
      // Group PRs by vendor and currency - each group becomes a separate PO
      const groupedPRs = selectedPRs.reduce((groups, pr) => {
        const prAny = pr as any;
        const key = `${prAny.vendor || 'Unknown'}-${prAny.currency || 'USD'}`;
        if (!groups[key]) {
          groups[key] = {
            vendor: prAny.vendor || 'Unknown',
            vendorId: prAny.vendorId || 0,
            currency: prAny.currency || 'USD',
            prs: [],
            totalAmount: 0
          };
        }
        groups[key].prs.push(pr);
        groups[key].totalAmount += (typeof prAny.totalAmount === 'number' ? prAny.totalAmount : prAny.totalAmount?.amount || 0);
        return groups;
      }, {} as Record<string, {
        vendor: string;
        vendorId: number;
        currency: string;
        prs: PurchaseRequest[];
        totalAmount: number
      }>);

      // Store grouped PRs for PO creation
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('groupedPurchaseRequests', JSON.stringify(groupedPRs));
          localStorage.setItem('selectedPurchaseRequests', JSON.stringify(selectedPRs)); // Keep for compatibility
        }
      } catch (error) {
        console.error('Error storing grouped PRs:', error);
      }
      
      // Navigate to PO creation page with grouped data
      const groupCount = Object.keys(groupedPRs).length;
      if (groupCount === 1) {
        // Single PO - go directly to creation page
        router.push('/procurement/purchase-orders/create?mode=fromPR&grouped=true');
      } else {
        // Multiple POs - go to bulk creation page or show summary
        router.push('/procurement/purchase-orders/create?mode=fromPR&grouped=true&bulk=true');
      }
    }
  };

  // Action buttons
  const actionButtons = (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
            <Plus className="mr-2 h-4 w-4" /> New Purchase Order
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push("/procurement/purchase-orders/create")}>
            Create Blank PO
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowCreateFromPRDialog(true)}>
            Create from Purchase Requests
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="outline">
        <FileDown className="mr-2 h-4 w-4" />
        Export
      </Button>
      <Button variant="outline">
        <Printer className="mr-2 h-4 w-4" />
        Print
      </Button>
    </>
  );

  return (
    <>
      <ListPageTemplate
        title="Purchase Orders"
        actionButtons={actionButtons}
        filters={filters}
        bulkActions={bulkActions}
        content={content}
      />
      <Dialog 
        open={showCreateFromPRDialog} 
        onOpenChange={(open) => {
          if (!open) setShowCreateFromPRDialog(false);
        }}
      >
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Create PO from Purchase Requests</DialogTitle>
          </DialogHeader>
          <div className="py-4 flex-1 min-h-0 overflow-auto">
            <CreatePOFromPR onSelectPRs={handleSelectPRs} />
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateFromPRDialog(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default PurchaseOrderList;
