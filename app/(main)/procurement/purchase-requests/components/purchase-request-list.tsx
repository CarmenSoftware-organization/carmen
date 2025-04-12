"use client";

import React, { useState, useMemo, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
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
  MoreHorizontal,
  MoreVertical,
  FileText,
  LayoutGrid,
  List,
} from "lucide-react";
import { useRouter } from "next/navigation";
import ListPageTemplate from "@/components/templates/ListPageTemplate";
import StatusBadge from "@/components/ui/custom-status-badge";
import { AdvancedFilter } from '@/components/ui/advanced-filter'
import { FilterType } from '@/lib/utils/filter-storage'
import { PurchaseRequest, PRType, DocumentStatus, WorkflowStatus, WorkflowStage, CurrencyCode } from '@/lib/types'
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface FieldConfig {
  label: string;
  field: keyof PurchaseRequest | 'requestor.name';
  format?: (value: any) => string;
}

interface CustomFilterType<T> {
  field: keyof T
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan'
  value: string | number
  logicalOperator?: 'AND' | 'OR'
}

interface TableHeader {
  key: keyof PurchaseRequest
  label: string
  className?: string
}

interface SortConfig {
  field: keyof PurchaseRequest
  direction: "asc" | "desc"
}

const sampleData: PurchaseRequest[] = [
  {
    id: 'sample-pr-001',
    refNumber: 'PR-2023-001',
    date: new Date('2023-01-01'),
    type: PRType.GeneralPurchase,
    description: 'Sample purchase request for office supplies',
    requestorId: 'user-001',
    requestor: {
      name: 'John Doe',
      id: 'user-001',
      department: 'Administration'
    },
    status: DocumentStatus.Draft,
    workflowStatus: WorkflowStatus.pending,
    currentWorkflowStage: WorkflowStage.requester,
    location: 'Head Office',
    department: 'Administration',
    jobCode: 'JOB-001',
    estimatedTotal: 1500,
    vendor: 'Office Supplies Co.',
    vendorId: 1,
    deliveryDate: new Date('2023-01-15'),
    currency: 'USD',
    baseCurrencyCode: 'USD',
    baseSubTotalPrice: 1000,
    subTotalPrice: 1000,
    baseNetAmount: 1000,
    netAmount: 1000,
    baseDiscAmount: 0,
    discountAmount: 0,
    baseTaxAmount: 100,
    taxAmount: 100,
    baseTotalAmount: 1100,
    totalAmount: 1100
  },
  {
    id: 'sample-pr-002',
    refNumber: 'PR-2023-002',
    date: new Date('2023-01-02'),
    type: PRType.GeneralPurchase,
    description: 'IT Equipment and Supplies',
    requestorId: 'user-002',
    requestor: {
      name: 'Jane Smith',
      id: 'user-002',
      department: 'IT'
    },
    status: DocumentStatus.InProgress,
    workflowStatus: WorkflowStatus.pending,
    currentWorkflowStage: WorkflowStage.departmentHeadApproval,
    location: 'Branch Office',
    department: 'IT',
    jobCode: 'JOB-002',
    estimatedTotal: 2500,
    vendor: 'Tech Solutions Inc.',
    vendorId: 2,
    deliveryDate: new Date('2023-01-20'),
    currency: 'USD',
    baseCurrencyCode: 'USD',
    baseSubTotalPrice: 2000,
    subTotalPrice: 2000,
    baseNetAmount: 2000,
    netAmount: 2000,
    baseDiscAmount: 100,
    discountAmount: 100,
    baseTaxAmount: 150,
    taxAmount: 150,
    baseTotalAmount: 2050,
    totalAmount: 2050
  },
  {
    id: 'sample-pr-003',
    refNumber: 'PR-2023-003',
    date: new Date('2023-01-03'),
    type: PRType.GeneralPurchase,
    description: 'Marketing Materials',
    requestorId: 'user-003',
    requestor: {
      name: 'Bob Wilson',
      id: 'user-003',
      department: 'Marketing'
    },
    status: DocumentStatus.InProgress,
    workflowStatus: WorkflowStatus.approved,
    currentWorkflowStage: WorkflowStage.completed,
    location: 'Main Office',
    department: 'Marketing',
    jobCode: 'JOB-003',
    estimatedTotal: 3000,
    vendor: 'Marketing Pro Ltd.',
    vendorId: 3,
    deliveryDate: new Date('2023-01-25'),
    currency: 'USD',
    baseCurrencyCode: 'USD',
    baseSubTotalPrice: 2800,
    subTotalPrice: 2800,
    baseNetAmount: 2800,
    netAmount: 2800,
    baseDiscAmount: 140,
    discountAmount: 140,
    baseTaxAmount: 200,
    taxAmount: 200,
    baseTotalAmount: 2860,
    totalAmount: 2860
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

interface Row {
  getValue: (key: string) => any;
  original: PurchaseRequest;
  getIsSelected: () => boolean;
  toggleSelected: (value: boolean) => void;
}

interface Table {
  getIsAllPageRowsSelected: () => boolean;
  toggleAllPageRowsSelected: (value: boolean) => void;
}

interface ColumnDef {
  id?: string;
  accessorKey?: keyof PurchaseRequest | 'requestor.name';
  header: string | ((props: { table: Table }) => React.ReactNode);
  cell?: (props: { row: Row }) => React.ReactNode;
  enableSorting?: boolean;
  enableHiding?: boolean;
}

const columns = (router: ReturnType<typeof useRouter>): ColumnDef[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "refNumber",
    header: "PR Number",
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => format(row.getValue("date"), "dd/MM/yyyy"),
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge status={row.getValue("status")} />
    ),
  },
  {
    accessorKey: "requestor.name",
    header: "Requestor",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "totalAmount",
    header: "Amount",
    cell: ({ row }) => (
      <div className="text-right">
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: row.original.currency,
        }).format(row.getValue("totalAmount"))}
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const pr = row.original;

      return (
        <TableCell className="text-right">
          <div className="flex justify-end space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/procurement/purchase-requests/${pr.id}?mode=view`)}
              className="h-8 w-8"
            >
              <span className="sr-only">View</span>
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/procurement/purchase-requests/${pr.id}?mode=edit`)}
              className="h-8 w-8"
            >
              <span className="sr-only">Edit</span>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {/* Implement delete functionality */}}
              className="h-8 w-8"
            >
              <span className="sr-only">Delete</span>
              <Trash2 className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <span className="sr-only">More options</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {/* Implement additional actions */}}>
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {/* Implement additional actions */}}>
                  Reject
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {/* Implement additional actions */}}>
                  Send Email
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      );
    },
  },
];

export function PurchaseRequestList() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedType, setSelectedType] = React.useState("All Types");
  const [selectedStatus, setSelectedStatus] = React.useState("All Statuses");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "date",
    direction: "desc",
  });
  const [itemsPerPage = 7, setItemsPerPage] = React.useState(7);
  const [selectedPRs, setSelectedPRs] = useState<string[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState<FilterType<PurchaseRequest>[]>([]);
  const [filteredData, setFilteredData] = useState<PurchaseRequest[]>(sampleData);
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | 'All'>('All');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'table' | 'card'>('table');
  
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleApplyAdvancedFilters = (filters: FilterType<PurchaseRequest>[]) => {
    setAdvancedFilters(filters);
    const filtered = sampleData.filter((pr) => {
      return filters.every((filter) => {
        const fieldValue = pr[filter.field];
        if (fieldValue === undefined) return false;

        let compareValue: string | number;
        if (fieldValue instanceof Date) {
          compareValue = fieldValue.toISOString();
        } else if (typeof fieldValue === 'object' && fieldValue !== null && 'name' in fieldValue) {
          compareValue = fieldValue.name;
        } else {
          compareValue = fieldValue as string | number;
        }

        const filterValue = filter.value;
        
        switch (filter.operator) {
          case 'equals':
            return String(compareValue) === String(filterValue);
          case 'contains':
            return String(compareValue).toLowerCase().includes(String(filterValue).toLowerCase());
          case 'greaterThan':
            return typeof compareValue === 'number' && typeof filterValue === 'number' && compareValue > filterValue;
          case 'lessThan':
            return typeof compareValue === 'number' && typeof filterValue === 'number' && compareValue < filterValue;
          case 'in':
            if (Array.isArray(filterValue)) {
              return filterValue.some(v => String(v) === String(compareValue));
            }
            return false;
          case 'between':
            if (Array.isArray(filterValue) && filterValue.length === 2) {
              const [min, max] = filterValue;
              if (typeof compareValue === 'number' && typeof min === 'number' && typeof max === 'number') {
                return compareValue >= min && compareValue <= max;
              }
            }
            return false;
          default:
            return false;
        }
      });
    });
    setFilteredData(filtered);
  };

  const handleClearAdvancedFilters = () => {
    setAdvancedFilters([]);
    setFilteredData(sampleData);
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
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
    setSortConfig((prevConfig) => ({
      field,
      direction:
        prevConfig.field === field && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
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

  const sortedAndFilteredData = useMemo(() => {
    let result = filteredData;

    if (sortConfig.field) {
      result = [...result].sort((a, b) => {
        const aValue = a[sortConfig.field];
        const bValue = b[sortConfig.field];

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedAndFilteredData.length / itemsPerPage);

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedAndFilteredData.slice(startIndex, endIndex);
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
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center justify-between">
        <Input
          placeholder="Search purchase requests..."
          value={searchTerm}
          onChange={handleSearch}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-[70px]">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.values(DocumentStatus).map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={filterStatus === status}
                  onCheckedChange={() => setFilterStatus(status)}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <AdvancedFilter<PurchaseRequest>
            filterFields={filterFields}
            onApplyFilters={handleApplyAdvancedFilters}
            onClearFilters={handleClearAdvancedFilters}
          />
          
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
    </div>
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleExport = () => {
    // Implement export functionality
    console.log("Export")
  }

  const handlePrint = () => {
    // Implement print functionality
    console.log("Print")
  }

  const handleDeletePR = (id: string) => {
    // Implement delete functionality
    console.log("Delete PR:", id)
  }

  const cardView = (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {getCurrentPageData().map((pr) => (
          <Card key={pr.id} className="overflow-hidden hover:bg-secondary/10 transition-colors h-full shadow-sm">
            <div className="flex flex-col h-full">
              <div className="p-5 pb-3 bg-muted/30 border-b">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedPRs.includes(pr.id)}
                      onCheckedChange={() => handleSelectPR(pr.id)}
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-primary">{pr.refNumber}</h3>
                      <p className="text-sm text-muted-foreground">{isMounted ? format(pr.date, "dd MMM yyyy") : pr.date.toISOString().split('T')[0]}</p>
                    </div>
                  </div>
                  <StatusBadge status={pr.status} />
                </div>
              </div>
              
              <div className="p-5 flex-grow">
                <div className="mb-3">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm line-clamp-2">{pr.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Type</p>
                    <p className="text-sm font-medium">{pr.type}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Department</p>
                    <p className="text-sm font-medium">{pr.department}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Requestor</p>
                    <p className="text-sm font-medium">{pr.requestor.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Location</p>
                    <p className="text-sm font-medium">{pr.location}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-border/50">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Amount</p>
                    <p className="text-base font-semibold">
                      {isMounted 
                        ? new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: pr.currency,
                          }).format(pr.totalAmount)
                        : `${pr.currency} ${pr.totalAmount.toFixed(2)}`
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Workflow Stage</p>
                    <p className="text-sm font-medium">{pr.currentWorkflowStage}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end px-4 py-3 bg-muted/20 border-t space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleViewPR(pr.id)}
                  className="h-8 w-8 rounded-full"
                >
                  <span className="sr-only">View</span>
                  <FileText className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditPR(pr.id)}
                  className="h-8 w-8 rounded-full"
                >
                  <span className="sr-only">Edit</span>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeletePR(pr.id)}
                  className="h-8 w-8 rounded-full"
                >
                  <span className="sr-only">Delete</span>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <span className="sr-only">More options</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => console.log("Approve", pr.id)}>
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log("Reject", pr.id)}>
                      Reject
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log("Send Email", pr.id)}>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const content = (
    <div className="space-y-4">
      {viewMode === 'table' ? (
        <div className="rounded-md border shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-muted/30">
                <TableHead className="w-[40px] h-10 font-medium">
                  <Checkbox
                    checked={selectedPRs.length === getCurrentPageData().length}
                    onCheckedChange={handleSelectAllPRs}
                  />
                </TableHead>
                <TableHead className="w-[120px] font-medium">PR Number</TableHead>
                <TableHead className="font-medium">Date</TableHead>
                <TableHead className="font-medium">Type</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="font-medium">Requestor</TableHead>
                <TableHead className="font-medium">Department</TableHead>
                <TableHead className="text-right font-medium">Amount</TableHead>
                <TableHead className="w-[170px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getCurrentPageData().map((pr) => (
                <TableRow 
                  key={pr.id} 
                  className="hover:bg-muted/10 transition-colors border-b cursor-pointer"
                  onClick={() => handleViewPR(pr.id)}
                >
                  <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedPRs.includes(pr.id)}
                      onCheckedChange={() => handleSelectPR(pr.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-primary">
                    {pr.refNumber}
                  </TableCell>
                  <TableCell>
                    {isMounted ? format(pr.date, "dd MMM yyyy") : pr.date.toISOString().split('T')[0]}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center text-sm">
                      {pr.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={pr.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{pr.requestor.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center text-sm">
                      {pr.department}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {isMounted 
                      ? new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: pr.currency,
                        }).format(pr.totalAmount)
                      : `${pr.currency} ${pr.totalAmount.toFixed(2)}`
                    }
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewPR(pr.id);
                        }}
                        className="h-8 w-8 rounded-full"
                      >
                        <span className="sr-only">View</span>
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPR(pr.id);
                        }}
                        className="h-8 w-8 rounded-full"
                      >
                        <span className="sr-only">Edit</span>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePR(pr.id);
                        }}
                        className="h-8 w-8 rounded-full"
                      >
                        <span className="sr-only">Delete</span>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="sr-only">More options</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("Approve", pr.id);
                            }}
                          >
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("Reject", pr.id);
                            }}
                          >
                            Reject
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("Send Email", pr.id);
                            }}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        cardView
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {isMounted ? (
            <>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, sortedAndFilteredData.length)} of{" "}
              {sortedAndFilteredData.length} entries
            </>
          ) : (
            "Loading results..."
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            {isMounted ? (
              <>Page {currentPage} of {totalPages}</>
            ) : (
              "Loading pagination..."
            )}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
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