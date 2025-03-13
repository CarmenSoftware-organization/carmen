"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Search,
  Filter,
  Plus,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown,
  Mail,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import ListPageTemplate from "@/components/templates/ListPageTemplate";
import StatusBadge from "@/components/ui/custom-status-badge";
import { AdvancedFilter } from '@/components/ui/advanced-filter'
import { FilterType } from '@/lib/utils/filter-storage'
import { PurchaseRequest, PRType, DocumentStatus, WorkflowStatus, WorkflowStage, CurrencyCode } from '@/lib/types'

interface CustomFilterType<T> {
  field: keyof T
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan'
  value: string | number
  logicalOperator?: 'AND' | 'OR'
}

const sampleData: PurchaseRequest[] = [
  {
    id: "1",
    refNumber: "PR001",
    date: new Date("2024-03-20"),
    type: PRType.GeneralPurchase,
    vendor: "Tech Supplies Co.",
    vendorId: 1,
    deliveryDate: new Date("2024-03-25"),
    description: "Office equipment",
    requestorId: "user1",
    requestor: {
      name: "John Doe",
      id: "user1",
      department: "IT"
    },
    status: DocumentStatus.Draft,
    workflowStatus: WorkflowStatus.pending,
    currentWorkflowStage: WorkflowStage.departmentHeadApproval,
    location: "HQ",
    department: "IT",
    jobCode: "IT2024Q1",
    estimatedTotal: 1500,
    currency: CurrencyCode.USD,
    baseCurrencyCode: CurrencyCode.USD,
    baseSubTotalPrice: 1500,
    subTotalPrice: 1500,
    baseNetAmount: 1500,
    netAmount: 1500,
    baseDiscAmount: 0,
    discountAmount: 0,
    baseTaxAmount: 0,
    taxAmount: 0,
    baseTotalAmount: 1500,
    totalAmount: 1500
  }
];

const filterFields: { value: keyof PurchaseRequest; label: string }[] = [
  { value: 'refNumber', label: 'PR Number' },
  { value: 'type', label: 'Type' },
  { value: 'status', label: 'Status' },
  { value: 'department', label: 'Department' },
  { value: 'description', label: 'Description' },
  { value: 'totalAmount', label: 'Amount' }
];

type FieldConfig = {
  label: string
  field: keyof PurchaseRequest | 'requestor.name'
  format?: (value: any) => string
}

export function PurchaseRequestList() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedType, setSelectedType] = React.useState("All Types");
  const [selectedStatus, setSelectedStatus] = React.useState("All Statuses");
  const [sortField, setSortField] = useState<keyof PurchaseRequest | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const itemsPerPage = 7;
  const [selectedPRs, setSelectedPRs] = useState<string[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState<FilterType<PurchaseRequest>[]>([]);
  const [filteredData, setFilteredData] = useState<PurchaseRequest[]>(sampleData);
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | 'All'>('All');

  const handleApplyAdvancedFilters = (filters: FilterType<PurchaseRequest>[]) => {
    setAdvancedFilters(filters)
    const filtered = sampleData.filter((pr) => {
      return filters.every((filter) => {
        const fieldValue = pr[filter.field]
        if (fieldValue === undefined) return false

        // Handle different value types
        let compareValue: string | number
        if (fieldValue instanceof Date) {
          compareValue = fieldValue.toISOString()
        } else if (typeof fieldValue === 'object' && fieldValue !== null && 'name' in fieldValue) {
          compareValue = fieldValue.name
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
              const [min, max] = filterValue
              if (typeof compareValue === 'number' && typeof min === 'number' && typeof max === 'number') {
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
    setAdvancedFilters([])
    setFilteredData(sampleData)
  }

  const sortedAndFilteredData = useMemo(() => {
    let result = filteredData;

    if (sortField) {
      result = [...result].sort((a, b) => {
        if (a[sortField] < b[sortField])
          return sortDirection === "asc" ? -1 : 1;
        if (a[sortField] > b[sortField])
          return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [filteredData, sortField, sortDirection]);

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
    router.push("/procurement/purchase-requests/new-pr?mode=add");
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
        <Button variant="outline">Delete Selected</Button>
        <Button variant="outline">Approve Selected</Button>
        <Button variant="outline">Reject Selected</Button>
      </div>
    ) : null;

  const filters = (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="w-full sm:w-1/2 flex space-x-2">
          <Input
            placeholder="Search PRs..."
            className="w-full"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Button variant="secondary" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {selectedType}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => handleTypeChange("All Types")}>
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => handleTypeChange("General Purchase")}
              >
                General Purchase
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => handleTypeChange("Market List")}
              >
                Market List
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => handleTypeChange("Asset Purchase")}
              >
                Asset Purchase
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {selectedStatus}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => handleStatusChange("All Statuses")}>
                All Statuses
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleStatusChange("Draft")}>
                Draft
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleStatusChange("Submitted")}>
                Submitted
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleStatusChange("Approved")}>
                Approved
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleStatusChange("Rejected")}>
                Rejected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AdvancedFilter<PurchaseRequest>
            onApplyFilters={handleApplyAdvancedFilters}
            onClearFilters={handleClearAdvancedFilters}
            filterFields={filterFields}
          />
        </div>
      </div>
    </>
  );

  const actionButtons = (
    <>
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleCreateNewPR} className="group">
          <Plus className="mr-2 h-4 w-4" /> New Purchase Request
        </Button>
        <Button variant="outline" className="group">
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
        <Button variant="outline" className="group">
          <Printer className="mr-2 h-4 w-4" /> Print
        </Button>
      </div>
    </>
  );

  const fieldConfigs: FieldConfig[] = [
    { 
      label: "Date", 
      field: "date",
      format: (value: Date) => value.toLocaleDateString()
    },
    { 
      label: "Type", 
      field: "type" 
    },
    { 
      label: "Description", 
      field: "description" 
    },
    { 
      label: "Requestor", 
      field: "requestor.name",
      format: (pr: PurchaseRequest) => pr.requestor.name
    },
    { 
      label: "Department", 
      field: "department" 
    },
    { 
      label: "Amount", 
      field: "totalAmount",
      format: (value: number) => `$${value.toFixed(2)}`
    },
    { 
      label: "Workflow Stage", 
      field: "currentWorkflowStage" 
    }
  ]

  const content = (
    <>
      <div className="space-y-2" >
        {getCurrentPageData().map((pr) => (
          <Card key={pr.id} className="overflow-hidden p-2 hover:bg-secondary dark:hover:bg-gray-700 bg-white dark:bg-gray-800">
            <div className="py-2 px-4">
              <div className="flex justify-between items-center mb-0">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedPRs.includes(pr.id)}
                    onCheckedChange={() => handleSelectPR(pr.id)}
                  />
                  <StatusBadge status={pr.status} />
                  <span className="text-lg text-muted-foreground">
                    {pr.id}
                  </span>
                  <h3 className="text-lg md:text-lg font-semibold">
                    {pr.description}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="View purchase request"
                    onClick={() => handleViewPR(pr.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit purchase request"
                    onClick={() => handleEditPR(pr.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete purchase request"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0 md:gap-2">
                {fieldConfigs.map(({ label, field, format }) => (
                  <div key={field}>
                    <p className="font-medium text-muted-foreground text-sm">
                      {label}
                    </p>
                    <p className="text-sm">
                      {format 
                        ? format(field === 'requestor.name' ? pr : pr[field as keyof PurchaseRequest])
                        : String(field === 'requestor.name' ? pr.requestor.name : pr[field as keyof PurchaseRequest])
                      }
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, sortedAndFilteredData.length)}{" "}
          of {sortedAndFilteredData.length} results
        </div>
        <div className="space-x-2">
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
    </>
  );

  return (
    <ListPageTemplate
      title="Purchase Requests"
      actionButtons={actionButtons}
      filters={filters}
      content={content}
      bulkActions={bulkActions}
    />
  );
}