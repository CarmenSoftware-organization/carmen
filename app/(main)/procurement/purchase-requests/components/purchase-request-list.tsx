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
import { AdvancedFilter } from './advanced-filter'

interface PurchaseRequest {
  id: string
  type: string
  description: string
  requestor: string
  department: string
  date: string
  status: string
  amount: number
  currentStage: string
}

type FilterField = keyof PurchaseRequest
type FilterOperator = 'equals' | 'contains' | 'in' | 'between' | 'greaterThan' | 'lessThan'
type FilterValue = 
  | string 
  | number 
  | string[] // For 'in' operator with string values
  | number[] // For 'in' operator with number values
  | [number, number] // For 'between' operator

interface Filter {
  field: FilterField
  operator: FilterOperator
  value: FilterValue
}

const sampleData: PurchaseRequest[] = [
  {
    id: "PR-001",
    type: "General Purchase",
    description: "Office Supplies",
    requestor: "John Doe",
    department: "Administration",
    date: "2023-06-15",
    status: "Submitted",
    amount: 500,
    currentStage: "Initial Review",
  },
  {
    id: "PR-002",
    type: "Market List",
    description: "Weekly Groceries",
    requestor: "Jane Smith",
    department: "Catering",
    date: "2023-06-14",
    status: "Approved",
    amount: 750,
    currentStage: "Procurement",
  },
  {
    id: "PR-003",
    type: "Asset Purchase",
    description: "Laptop Computers",
    requestor: "Mike Johnson",
    department: "IT",
    date: "2023-06-13",
    status: "Rejected",
    amount: 3000,
    currentStage: "Final Review",
  },
  {
    id: "PR-004",
    type: "General Purchase",
    description: "Office Furniture",
    requestor: "Emily Brown",
    department: "HR",
    date: "2023-06-12",
    status: "Draft",
    amount: 1200,
    currentStage: "Draft",
  },
  {
    id: "PR-005",
    type: "Market List",
    description: "Monthly Supplies",
    requestor: "David Lee",
    department: "Facilities",
    date: "2023-06-11",
    status: "Submitted",
    amount: 900,
    currentStage: "Department Approval",
  },
  {
    id: "PR-006",
    type: "Asset Purchase",
    description: "Server Equipment",
    requestor: "Sarah Connor",
    department: "IT",
    date: "2023-06-10",
    status: "Approved",
    amount: 5000,
    currentStage: "Procurement",
  },
  {
    id: "PR-007",
    type: "General Purchase",
    description: "Marketing Materials",
    requestor: "Tom Wilson",
    department: "Marketing",
    date: "2023-06-09",
    status: "Submitted",
    amount: 800,
    currentStage: "Financial Review",
  },
  {
    id: "PR-008",
    type: "Market List",
    description: "Event Catering",
    requestor: "Alice Johnson",
    department: "Events",
    date: "2023-06-08",
    status: "Approved",
    amount: 1500,
    currentStage: "Procurement",
  },
  {
    id: "PR-009",
    type: "Asset Purchase",
    description: "Company Vehicles",
    requestor: "Robert Davis",
    department: "Operations",
    date: "2023-06-07",
    status: "Rejected",
    amount: 50000,
    currentStage: "Final Review",
  },
  {
    id: "PR-010",
    type: "General Purchase",
    description: "Training Materials",
    requestor: "Emma White",
    department: "HR",
    date: "2023-06-06",
    status: "Draft",
    amount: 300,
    currentStage: "Draft",
  },
];

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
  const [advancedFilters, setAdvancedFilters] = useState<Filter[]>([]);
  const [filteredData, setFilteredData] = useState<PurchaseRequest[]>(sampleData);

  const handleApplyAdvancedFilters = (filters: Filter[]) => {
    setAdvancedFilters(filters)
    const filtered = sampleData.filter((pr) => {
      return filters.every((filter) => {
        const fieldValue = pr[filter.field]
        
        switch (filter.operator) {
          case 'equals':
            return fieldValue === filter.value
          case 'contains':
            if (typeof fieldValue === 'string' && typeof filter.value === 'string') {
              return fieldValue.toLowerCase().includes(filter.value.toLowerCase())
            }
            return false
          case 'in':
            if (Array.isArray(filter.value)) {
              // Type guard for string arrays
              if (filter.value.every(item => typeof item === 'string')) {
                return (filter.value as string[]).includes(fieldValue as string)
              }
              // Type guard for number arrays
              if (filter.value.every(item => typeof item === 'number')) {
                return (filter.value as number[]).includes(fieldValue as number)
              }
            }
            return false
          case 'between':
            if (Array.isArray(filter.value) && 
                filter.value.length === 2 && 
                typeof fieldValue === 'number' &&
                typeof filter.value[0] === 'number' &&
                typeof filter.value[1] === 'number') {
              return fieldValue >= filter.value[0] && fieldValue <= filter.value[1]
            }
            return false
          case 'greaterThan':
            if (typeof fieldValue === 'number' && typeof filter.value === 'number') {
              return fieldValue > filter.value
            }
            return false
          case 'lessThan':
            if (typeof fieldValue === 'number' && typeof filter.value === 'number') {
              return fieldValue < filter.value
            }
            return false
          default:
            return true
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
    router.push("/procurement/purchase-requests/new?mode=add");
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

          <AdvancedFilter 
            onApplyFilters={handleApplyAdvancedFilters}
            onClearFilters={handleClearAdvancedFilters}
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
                {[
                  { label: "Date", field: "date" },
                  { label: "Type", field: "type" },
                  { label: "Requestor", field: "requestor" },
                  { label: "Department", field: "department" },
                  { label: "Amount", field: "amount" },
                  { label: "Workflow Stage", field: "currentStage" },
                ].map(({ label, field }) => (
                  <div key={field}>
                    <p className="font-medium text-muted-foreground text-sm">
                      {label}
                    </p>
                    {field === 'currentStage' ? (
                      <div className="text-sm">
                        <StatusBadge status={pr[field as keyof typeof pr] as string}/>
                      </div>
                    ) : (
                      <p className="text-sm">{pr[field as keyof typeof pr]}</p>
                    )}
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