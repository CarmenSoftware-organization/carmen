"use client";

import React, { useState, useMemo } from "react";
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
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  Edit,
  Trash2,
  ArrowUpDown,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import ListPageTemplate from "@/components/templates/ListPageTemplate";
import StatusBadge from "@/components/ui/custom-status-badge";
import { AdvancedFilter } from '@/components/ui/advanced-filter'
import { FilterType } from '@/lib/utils/filter-storage'
import { PurchaseRequest, PRType, DocumentStatus, PRTemplate } from '@/lib/types'
import { TemplateSelectionModal } from './template-selection-modal';
import { mockPurchaseRequests } from '../data/mock-data';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const filterFields: { value: keyof PurchaseRequest; label: string }[] = [
  { value: 'refNumber', label: 'PR Number' },
  { value: 'type', label: 'Type' },
  { value: 'status', label: 'Status' },
  { value: 'department', label: 'Department' },
  { value: 'description', label: 'Description' },
  { value: 'totalAmount', label: 'Amount' }
];

export function PurchaseRequestList() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedType, setSelectedType] = React.useState("All Types");
  const [selectedStatus, setSelectedStatus] = React.useState("All Statuses");
  const [sortField, setSortField] = useState<keyof PurchaseRequest | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const itemsPerPage = 10;
  const [selectedPRs, setSelectedPRs] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<PurchaseRequest[]>(mockPurchaseRequests);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const handleApplyAdvancedFilters = (filters: FilterType<PurchaseRequest>[]) => {
    const filtered = mockPurchaseRequests.filter((pr) => {
      return filters.every((filter) => {
        const fieldValue = pr[filter.field as keyof PurchaseRequest]
        if (fieldValue === undefined) return false

        // Handle different value types
        let compareValue: string | number
        if (fieldValue instanceof Date) {
          compareValue = fieldValue.toISOString()
        } else if (typeof fieldValue === 'object' && fieldValue !== null && 'name' in fieldValue) {
          compareValue = (fieldValue as { name: string }).name
        } else {
          compareValue = fieldValue as string | number
        }

        const filterValue = filter.value
        
        switch (filter.operator) {
          case 'equals':
            return String(compareValue) === String(filterValue)
          case 'contains':
            return String(compareValue).toLowerCase().includes(String(filterValue).toLowerCase())
          case 'greaterThan':
            return typeof compareValue === 'number' && typeof filterValue === 'number' && compareValue > filterValue
          case 'lessThan':
            return typeof compareValue === 'number' && typeof filterValue === 'number' && compareValue < filterValue
          case 'in':
            if (Array.isArray(filterValue)) {
              return filterValue.some(v => String(v) === String(compareValue))
            }
            return false
          case 'between':
            if (Array.isArray(filterValue) && filterValue.length === 2) {
              const min = Number(filterValue[0]); const max = Number(filterValue[1])
              if (typeof compareValue === 'number') {
                return compareValue >= min && compareValue <= max
              }
            }
            return false
          default:
            return false
        }
      })
    })
    setFilteredData(filtered)
  }

  const handleClearAdvancedFilters = () => {
    setFilteredData(mockPurchaseRequests)
  }

  const sortedAndFilteredData = useMemo(() => {
    let result = filteredData;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(pr => 
        pr.refNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pr.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pr.requestor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pr.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (selectedType !== "All Types") {
      result = result.filter(pr => pr.type === selectedType);
    }

    // Apply status filter
    if (selectedStatus !== "All Statuses") {
      result = result.filter(pr => pr.status === selectedStatus);
    }

    // Apply sorting
    if (sortField) {
      result = [...result].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        // Handle undefined values
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;
        
        if (aValue < bValue)
          return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue)
          return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [filteredData, searchTerm, selectedType, selectedStatus, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedAndFilteredData.length / itemsPerPage);

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedAndFilteredData.slice(startIndex, endIndex);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleSort = (field: keyof PurchaseRequest) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleCreateNewPR = () => {
    setIsTemplateModalOpen(true);
  };

  const handleTemplateSelect = (template: PRTemplate | { type: "recent"; pr: Partial<PurchaseRequest> } | null) => {
    setIsTemplateModalOpen(false);
    if (template) {
      if ('type' in template && template.type === "recent") {
        // Navigate with recent PR data
        const prId = template.pr.id || '';
        router.push(`/procurement/purchase-requests/new-pr?mode=add&fromPR=${prId}`);
      } else {
        // Navigate with template data
        const templateId = (template as PRTemplate).id;
        router.push(`/procurement/purchase-requests/new-pr?mode=add&templateId=${templateId}`);
      }
    } else {
      // Navigate to blank form
      router.push("/procurement/purchase-requests/new-pr?mode=add");
    }
  };

  const handleViewPR = (id: string) => {
    router.push(`/procurement/purchase-requests/${id}?mode=view`);
  };

  const handleEditPR = (id: string) => {
    router.push(`/procurement/purchase-requests/${id}?mode=edit`);
  };

  const handleSelectPR = (id: string) => {
    setSelectedPRs((prev) =>
      prev.includes(id) ? prev.filter((prId) => prId !== id) : [...prev, id]
    );
  };

  const handleSelectAllPRs = (checked: boolean) => {
    if (checked) {
      setSelectedPRs(getCurrentPageData().map((pr) => pr.id));
    } else {
      setSelectedPRs([]);
    }
  };

  const bulkActions =
    selectedPRs.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm">Delete Selected</Button>
        <Button variant="outline" size="sm">Approve Selected</Button>
        <Button variant="outline" size="sm">Reject Selected</Button>
      </div>
    ) : null;

  const filters = (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search PRs..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {selectedType}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => handleTypeChange("All Types")}>
                All Types
              </DropdownMenuItem>
              {Object.values(PRType).map((type) => (
                <DropdownMenuItem key={type} onSelect={() => handleTypeChange(type)}>
                  {type}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

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
              {Object.values(DocumentStatus).map((status) => (
                <DropdownMenuItem key={status} onSelect={() => handleStatusChange(status)}>
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex gap-2">
          <AdvancedFilter<PurchaseRequest>
            onApplyFilters={handleApplyAdvancedFilters}
            onClearFilters={handleClearAdvancedFilters}
            filterFields={filterFields}
            moduleName="purchase-request"
          />
        </div>
      </div>
    </div>
  );

  const actionButtons = (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button onClick={handleCreateNewPR}>
        <Plus className="mr-2 h-4 w-4" /> New Purchase Request
      </Button>
      <Button variant="outline">
        <Download className="mr-2 h-4 w-4" /> Export
      </Button>
      <Button variant="outline">
        <Printer className="mr-2 h-4 w-4" /> Print
      </Button>
    </div>
  );

  const content = (
    <div className="space-y-6">
      {/* Description Section */}
      <div className="bg-white px-6 py-4 border rounded-lg">
        <h2 className="text-sm font-semibold text-gray-900">About Purchase Requests</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your purchase requests for goods and services. Create, track, and approve requests from different departments and convert them to purchase orders.
        </p>
      </div>

      <div className="rounded-lg border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/75">
                <TableHead className="w-12 py-3 font-bold text-gray-600">
                  <Checkbox
                    checked={selectedPRs.length === getCurrentPageData().length && getCurrentPageData().length > 0}
                    onCheckedChange={handleSelectAllPRs}
                  />
                </TableHead>
                <TableHead className="py-3 font-bold text-gray-600">
                  <div className="flex items-center gap-2">
                    PR Number
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-0 h-auto"
                      onClick={() => handleSort('refNumber')}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </TableHead>
                <TableHead className="py-3 font-bold text-gray-600">
                  <div className="flex items-center gap-2">
                    Date
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-0 h-auto"
                      onClick={() => handleSort('date')}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </TableHead>
                <TableHead className="py-3 font-bold text-gray-600">Type</TableHead>
                <TableHead className="py-3 font-bold text-gray-600 hidden md:table-cell">Description</TableHead>
                <TableHead className="py-3 font-bold text-gray-600 hidden md:table-cell">Requestor</TableHead>
                <TableHead className="py-3 font-bold text-gray-600 hidden lg:table-cell">Department</TableHead>
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
              {getCurrentPageData().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <p className="text-gray-500 mb-2">No purchase requests found</p>
                      <Button variant="outline" size="sm" onClick={() => {
                        handleCreateNewPR();
                      }}>
                        Create your first purchase request
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                getCurrentPageData().map((pr) => (
                  <TableRow 
                    key={pr.id} 
                    className="group hover:bg-gray-50/50 cursor-pointer border-b last:border-b-0"
                    onClick={() => handleViewPR(pr.id)}
                  >
                    <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedPRs.includes(pr.id)}
                        onCheckedChange={() => handleSelectPR(pr.id)}
                      />
                    </TableCell>
                    <TableCell className="py-4 font-medium">{pr.refNumber}</TableCell>
                    <TableCell className="py-4">{pr.date.toLocaleDateString()}</TableCell>
                    <TableCell className="py-4">{pr.type}</TableCell>
                    <TableCell className="py-4 hidden md:table-cell">{pr.description}</TableCell>
                    <TableCell className="py-4 hidden md:table-cell">{pr.requestor.name}</TableCell>
                    <TableCell className="py-4 hidden lg:table-cell">{pr.department}</TableCell>
                    <TableCell className="py-4 text-right">${pr.totalAmount.toFixed(2)}</TableCell>
                    <TableCell className="py-4">
                      <StatusBadge status={pr.status} />
                    </TableCell>
                    <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleViewPR(pr.id)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View details</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditPR(pr.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit request</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  // Add delete confirmation logic here
                                  console.log('Delete PR:', pr.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete request</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
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
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
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
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Last page</span>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <ListPageTemplate
        title="Purchase Requests"
        actionButtons={actionButtons}
        filters={filters}
        content={content}
        bulkActions={bulkActions}
      />
      {isTemplateModalOpen && (
        <TemplateSelectionModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          onSelectTemplate={handleTemplateSelect}
        />
      )}
    </>
  );
}