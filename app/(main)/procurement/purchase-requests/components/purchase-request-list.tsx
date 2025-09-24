"use client";

import React, { useState, useMemo, ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { PRRBACService } from "../services/rbac-service";
import { useSimpleUser } from "@/lib/context/simple-user-context";
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
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import ListPageTemplate from "@/components/templates/ListPageTemplate";
import StatusBadge from "@/components/ui/custom-status-badge";
import { AdvancedFilter } from '@/components/ui/advanced-filter'
import { FilterType } from '@/lib/utils/filter-storage'
import { PurchaseRequest, PRType, DocumentStatus, WorkflowStatus, WorkflowStage, CurrencyCode } from '@/lib/types'
import { mockPRListData } from './mockPRListData'
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

// Use mockup data from our comprehensive PR list
const sampleData: PurchaseRequest[] = mockPRListData;

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
    accessorKey: "currentWorkflowStage",
    header: "Stage",
    cell: ({ row }) => {
      const stage = String(row.getValue("currentWorkflowStage"));
      let color = "bg-gray-200 text-gray-800";
      if (stage === "requester") color = "bg-blue-100 text-blue-800";
      else if (stage === "departmentHeadApproval") color = "bg-yellow-100 text-yellow-800";
      else if (stage === "completed") color = "bg-green-100 text-green-800";
      else if (stage === "financeApproval") color = "bg-purple-100 text-purple-800";
      else if (stage === "rejected") color = "bg-red-100 text-red-800";
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${color}`}>
          {stage.replace(/([A-Z])/g, ' $1').trim()}
        </span>
      );
    },
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
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(row.getValue("totalAmount"))}
      </div>
    ),
  },
  {
    accessorKey: "currency",
    header: "Currency",
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.currency}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <span className="sr-only">More options</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => {/* Implement approve functionality */}}
                  className="text-green-600 focus:text-green-600"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {/* Implement reject functionality */}}
                  className="text-red-600 focus:text-red-600"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => {/* Implement delete functionality */}}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
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
  const [toggleMode, setToggleMode] = useState<'myPending' | 'allDocument'>('allDocument');
  const [selectedRequestor, setSelectedRequestor] = React.useState<string>('');
  const [selectedWorkflowStage, setSelectedWorkflowStage] = useState('all');
  const { user } = useSimpleUser(); // Get current user from context
  const currentUserId = user?.id || 'demo-user'; // Use actual user ID from context
  
  // RBAC state
  const [availableWidgets, setAvailableWidgets] = useState<string[]>([]);
  const [roleConfig, setRoleConfig] = useState<any>(null);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Load RBAC configuration and available widgets
  useEffect(() => {
    if (user) {
      // Get role configuration from RBAC service
      const config = PRRBACService.getRoleConfiguration(user.role);
      setRoleConfig(config);
      
      // Determine available widgets based on role configuration
      const widgets = [];
      // Always add myPending for all users
      widgets.push('myPending');
      
      // Add allDocument for admins, managers, or users with elevated access
      if (user.role === 'System Administrator' || 
          user.role === 'Department Manager' || 
          user.role === 'Purchasing Staff' ||
          config.visibilitySetting === 'full') {
        widgets.push('allDocument');
      }
      
      setAvailableWidgets(widgets);
      
      // Set default toggle to first available widget
      if (widgets.length > 0 && !widgets.includes(toggleMode)) {
        setToggleMode(widgets[0] as any);
      }
    }
  }, [user, toggleMode]);

  // Get unique requestors for dropdown
  const requestorOptions = useMemo(() => {
    const unique = new Set<string>();
    sampleData.forEach(pr => {
      if (pr.requestorId && pr.requestorId.trim() !== '') {
        unique.add(pr.requestorId);
      }
    });
    return Array.from(unique).map(id => {
      const pr = sampleData.find(pr => pr.requestorId === id);
      return { value: id, label: pr ? pr.requestor.name : id };
    });
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
    router.push("/procurement/purchase-requests/new-pr?mode=blank");
  };

  const handleViewPR = (id: string) => {
    router.push(`/procurement/purchase-requests/${id}?id=${id}&mode=view`);
  };

  const handleEditPR = (id: string) => {
    router.push(`/procurement/purchase-requests/${id}?id=${id}&mode=edit`);
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
    let result = sampleData;
    
    // Apply widget-specific filters based on RBAC
    switch (toggleMode) {
      case 'myPending':
        // Show combined pending items for current user:
        // 1. All PRs created by user that are not yet approved
        // 2. All PRs pending user's approval at assigned workflow stages
        // 3. For demo purposes, also include pending/in-progress items
        const userAssignedStages = user?.assignedWorkflowStages || [];
        result = result.filter(pr => {
          // PRs created by user that are not completed yet
          const myUncompletedPRs = pr.requestorId === currentUserId && 
            pr.status !== DocumentStatus.Completed;
          
          // PRs pending my approval (if user has assigned stages)
          const pendingMyApproval = userAssignedStages.length > 0 ? 
            userAssignedStages.includes(pr.currentWorkflowStage) && 
            [DocumentStatus.Submitted, DocumentStatus.InProgress].includes(pr.status) : false;
          
          // For demo purposes: if no user context, show all non-completed items
          const demoMode = !user?.id && [DocumentStatus.Draft, DocumentStatus.Submitted, DocumentStatus.InProgress].includes(pr.status);
          
          return myUncompletedPRs || pendingMyApproval || demoMode;
        });
        break;
        
      case 'allDocument':
        // No filtering - show all documents (already the default)
        break;
    }
    
    // Apply secondary filters based on toggle mode
    if (selectedWorkflowStage && selectedWorkflowStage !== 'all') {
      switch (toggleMode) {
        case 'myPending':
          // Filter by workflow stage for My Pending
          result = result.filter(pr => pr.currentWorkflowStage === selectedWorkflowStage);
          break;
        case 'allDocument':
          // Filter by status for All Documents
          result = result.filter(pr => pr.status === selectedWorkflowStage);
          break;
      }
    }
    
    // Apply sorting
    if (sortConfig.field) {
      result = [...result].sort((a, b) => {
        const aValue = a[sortConfig.field];
        const bValue = b[sortConfig.field];
        
        // Handle undefined values - put them at the end
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    
    return result;
  }, [toggleMode, sampleData, currentUserId, selectedWorkflowStage, sortConfig, user?.assignedWorkflowStages]);

  const totalPages = Math.ceil(sortedAndFilteredData.length / itemsPerPage);

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedAndFilteredData.slice(startIndex, endIndex);
  };

  const bulkActions =
    selectedPRs.length > 0 ? (
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-muted-foreground">
          {selectedPRs.length} item{selectedPRs.length !== 1 ? 's' : ''} selected
        </span>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700">
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve Selected
          </Button>
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
            <XCircle className="mr-2 h-4 w-4" />
            Reject Selected
          </Button>
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      </div>
    ) : null;

  // Define secondary filters based on selected widget and available data
  const getSecondaryFilters = useMemo(() => {
    // Get base filtered data (before workflow stage filtering)
    let baseData = sampleData;
    
    // Apply widget-specific filters first
    switch (toggleMode) {
      case 'myPending':
        const userAssignedStages = user?.assignedWorkflowStages || [];
        baseData = baseData.filter(pr => {
          const myUncompletedPRs = pr.requestorId === currentUserId && 
            pr.status !== DocumentStatus.Completed;
          const pendingMyApproval = userAssignedStages.length > 0 ? 
            userAssignedStages.includes(pr.currentWorkflowStage) && 
            [DocumentStatus.Submitted, DocumentStatus.InProgress].includes(pr.status) : false;
          const demoMode = !user?.id && [DocumentStatus.Draft, DocumentStatus.Submitted, DocumentStatus.InProgress].includes(pr.status);
          return myUncompletedPRs || pendingMyApproval || demoMode;
        });
        break;
      case 'allDocument':
        // No additional filtering for all documents
        break;
    }
    
    // Get unique workflow stages and statuses from the filtered data
    const uniqueStages = [...new Set(baseData.map(pr => pr.currentWorkflowStage).filter(Boolean))];
    const uniqueStatuses = [...new Set(baseData.map(pr => pr.status).filter(Boolean))];
    
    // Create filter options based on toggle mode
    switch (toggleMode) {
      case 'myPending':
        const stageFilters = [
          { value: 'all', label: 'All Stages' }
        ];
        
        // Add available workflow stages
        uniqueStages.forEach(stage => {
          stageFilters.push({
            value: stage,
            label: stage.replace(/([A-Z])/g, ' $1').trim()
          });
        });
        
        return stageFilters;
      
      case 'allDocument':
      default:
        const statusFilters = [
          { value: 'all', label: 'All Status' }
        ];
        
        // Add all DocumentStatus enum values
        Object.values(DocumentStatus).forEach(status => {
          statusFilters.push({
            value: status,
            label: status.replace(/([A-Z])/g, ' $1').trim()
          });
        });
        
        return statusFilters;
    }
  }, [toggleMode, sampleData, currentUserId, user?.assignedWorkflowStages]);


  const filters = (
    <div>
      <div className="flex flex-1 items-center justify-between gap-2">
        <Input
          type="search"
          placeholder="Search purchase requests..."
          value={searchTerm}
          onChange={handleSearch}
          className="h-8 w-[220px] text-xs"
        />
        {/* RBAC-controlled widget toggles */}
        <div className="inline-flex rounded-md shadow-sm border">
          {/* Only show widgets the user has access to */}
          {availableWidgets.includes('myPending') && (
            <Button
              variant={toggleMode === 'myPending' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none h-8 px-4"
              onClick={() => {
                setToggleMode('myPending');
                setSelectedWorkflowStage('all');
              }}
            >
              My Pending
            </Button>
          )}
          
          <Button
            variant={toggleMode === 'allDocument' ? 'default' : 'ghost'}
            size="sm"
            className="rounded-none h-8 px-4"
            onClick={() => {
              setToggleMode('allDocument');
              setSelectedWorkflowStage('all');
            }}
          >
            All Documents
          </Button>
        </div>
        <div className="flex w-full justify-center my-2">
          <Select
            value={selectedWorkflowStage}
            onValueChange={value => setSelectedWorkflowStage(value)}
          >
            <SelectTrigger className="rounded h-8 px-3 w-[180px] text-xs">
              <SelectValue placeholder="Select filter" />
            </SelectTrigger>
            <SelectContent>
              {/* Dynamic secondary filters based on selected widget */}
              {getSecondaryFilters.map(filter => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
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
      <div className="w-full bg-muted px-2 py-0.5 rounded text-[10px] font-normal flex items-center mt-2">
        <span>
          Filter: {toggleMode === 'myPending' ? 'My Pending' : 'All Documents'}
          {' '}(
          {toggleMode === 'myPending'
            ? (selectedWorkflowStage === 'draft' ? 'Draft' : selectedWorkflowStage === 'inProgress' ? 'In Progress' : selectedWorkflowStage)
            : (selectedWorkflowStage === 'all' ? 'All Status' : selectedWorkflowStage === 'inProgress' ? 'In Progress' : selectedWorkflowStage === 'complete' ? 'Complete' : selectedWorkflowStage === 'reject' ? 'Reject' : selectedWorkflowStage)
          }
          )
        </span>
        <Button size="icon" variant="ghost" onClick={() => {
          setToggleMode('myPending');
          setSelectedWorkflowStage('all');
        }}>×</Button>
      </div>
    </div>
  );

  const actionButtons = (
    <>
      <div className="flex flex-wrap gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="group">
              <Plus className="mr-2 h-4 w-4" /> New Purchase Request
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push("/procurement/purchase-requests/new-pr?mode=blank")}>
              Create Blank PR
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>PR Templates</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push("/procurement/purchase-requests/new-pr?mode=template&id=office-supplies")}>
              Office Supplies
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/procurement/purchase-requests/new-pr?mode=template&id=it-equipment")}>
              IT Equipment
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/procurement/purchase-requests/new-pr?mode=template&id=kitchen-supplies")}>
              Kitchen Supplies
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/procurement/purchase-requests/new-pr?mode=template&id=maintenance")}>
              Maintenance
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
      format: (value: number) => value.toFixed(2)
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
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(pr.totalAmount)
                        : pr.totalAmount.toFixed(2)
                      } {pr.currency}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Workflow Stage</p>
                    <p className="text-sm font-medium">{pr.currentWorkflowStage}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end px-4 py-3 bg-muted/20 border-t space-x-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <span className="sr-only">More options</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => console.log("Approve", pr.id)}
                      className="text-green-600 focus:text-green-600"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => console.log("Reject", pr.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeletePR(pr.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
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
                <TableHead className="font-medium">Stage</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="font-medium">Requestor</TableHead>
                <TableHead className="font-medium">Department</TableHead>
                <TableHead className="text-right font-medium">Amount</TableHead>
                <TableHead className="text-center font-medium">Currency</TableHead>
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
                    <span className="inline-flex items-center text-sm">
                      {pr.currentWorkflowStage}
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
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(pr.totalAmount)
                      : pr.totalAmount.toFixed(2)
                    }
                  </TableCell>
                  <TableCell className="text-center">
                    {pr.currency}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end space-x-1">
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
                            className="text-green-600 focus:text-green-600"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("Reject", pr.id);
                            }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePR(pr.id);
                            }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
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