"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CurrencyCode, PurchaseOrder, PurchaseRequest, PurchaseOrderStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
  ChevronRight
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import ListPageTemplate from "@/components/templates/ListPageTemplate";
import { Mock_purchaseOrders } from "@/lib/mock/mock_purchaseOrder";  
import StatusBadge from "@/components/ui/custom-status-badge";
import { randomUUID } from "crypto";

const PurchaseOrderList: React.FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredPOs, setFilteredPOs] = useState(Mock_purchaseOrders);
  const [selectedPOs, setSelectedPOs] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof PurchaseOrder | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  useEffect(() => {
    let filtered = Mock_purchaseOrders.filter(
      (po) =>
        (po.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          po.vendorName.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === "" || po.status === statusFilter)
    );

    if (sortField) {
      filtered = filtered.sort((a, b) => {
        const aValue = a[sortField]
        const bValue = b[sortField]
        if (aValue == null || bValue == null) return 0
        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
        return 0
      });
    }

    setFilteredPOs(filtered);
    setSelectedPOs([]);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortField, sortOrder]);

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

  const totalPages = Math.ceil(filteredPOs.length / itemsPerPage);
  const paginatedPOs = filteredPOs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filters = (
    <div className="flex items-center justify-between ">
      <div className="flex-grow mr-4">
        <Input
          type="text"
          placeholder="Search purchase orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-1/2"
        />
      </div>
      <div className="flex items-center space-x-2 flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
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
        <Button 
          variant="outline" 
          onClick={() => setShowMoreFilters(!showMoreFilters)}
          className="flex items-center"
        >
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </Button>
      </div>
    </div>
  );

  const content = (
    <>
      <div className="space-y-2">
        {paginatedPOs.map((po) => (
          <Card key={po.poId} className="hover:bg-accent">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={selectedPOs.includes(po.poId)}
                    onCheckedChange={(checked) => handleSelectPO(po.poId, checked as boolean)}
                  />
                  <StatusBadge status={po.status} />
                  <div>
                    <h3 className="text-lg font-semibold">
                    <span className="font-normal text-muted-foreground"> {po.number} </span><span className=""> {po.vendorName}</span>
                    </h3>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/procurement/purchase-orders/${po.poId}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/procurement/purchase-orders/${po.poId}/edit`}>
                            <Edit2Icon className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-4 text-sm">
                <div className="text-left">
                  <Label className="text-sm text-muted-foreground">Date</Label>
                  <p>{po.orderDate.toLocaleDateString()}</p>
                </div>
                <div className="text-Left">
                  <Label className="text-sm text-muted-foreground">Delivery Date</Label>
                  <p>{po.DeliveryDate ? po.DeliveryDate.toLocaleDateString() : "N/A"}</p>
                </div>
                <div className="">
                  <Label className="text-sm text-muted-foreground">Currency</Label>
                  <p>{po.currencyCode}</p>
                </div>
                <div className="text-right">
                  <Label className="text-sm text-muted-foreground">Net Amount</Label>
                  <p>{po.netAmount.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <Label className="text-sm text-muted-foreground">Tax Amount</Label>
                  <p>{po.taxAmount.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <Label className="text-sm text-muted-foreground">Amount</Label>
                  <p>{po.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPOs.length)} of {filteredPOs.length} results
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <span className="sr-only">First page</span>
            «
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Previous page</span>
            ‹
          </Button>
          <span className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Next page</span>
            ›
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Last page</span>
            »
          </Button>
        </div>
      </div>
    </>
  );

  const actionButtons = (
    <>
      <Button className="group">
        <Plus className="mr-2 h-4 w-4" /> New Purchase Order
      </Button>
      <Button variant="outline" className="group">
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
    <ListPageTemplate
      title="Purchase Orders"
      actionButtons={actionButtons}
      filters={filters}
      content={content}
    />
  );
};

export default PurchaseOrderList;
