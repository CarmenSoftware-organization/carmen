'use client'

import React, { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IconButton } from "@/components/ui/icon-button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip-provider"
import { Eye, Edit, CheckCircle, XCircle, CornerUpLeft, Trash2, List, MoreHorizontal } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
 import { DocumentStatus, WorkflowStage, WorkflowStatus,PRType } from '@/lib/types/types';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

interface PurchaseRequest {
  id: string;
  refNumber: string;
  date: string;
  type: PRType;
  description: string;
  requestorId: string;
  requestor: {
    name: string;
    id: string;
    department: string;
  };
  totalAmount: number;
  currency: string;
  status: DocumentStatus;
  workflowStatus: WorkflowStatus;
  currentWorkflowStage: WorkflowStage;
  location: string;
}

// Extend the existing props to include disabl

export default function PurchaseRequestListPage() {
  const router = useRouter();
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [sortColumn, setSortColumn] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedPRs, setSelectedPRs] = useState<string[]>([]);

  useEffect(() => {
    // Sample data
    const sampleData: PurchaseRequest[] = [
      {
        id: '1',
        refNumber: 'PR001',
        date: '2023-08-01',
        type: PRType.GENERAL_PURCHASE,
        description: 'Office supplies',
        requestorId: 'EMP001',
        requestor: {
          name: 'John Doe',
          id: 'EMP001',
          department: 'IT'
        },
        totalAmount: 500,
        currency: 'USD',
        status: DocumentStatus.SUBMITTED,
        workflowStatus: WorkflowStatus.REJECTED,
        currentWorkflowStage: WorkflowStage.DEPARTMENT_HEAD_APPROVAL,
        location: 'Bangkok Office'
      },
      {
        id: '2',
        refNumber: 'PR002',
        date: '2023-08-02',
        type: PRType.MARKET_LIST,
        description: 'Monthly groceries',
        requestorId: 'EMP002',
        requestor: {
          name: 'Jane Smith',
          id: 'EMP002',
          department: 'HR'
        },
        totalAmount: 1000,
        currency: 'USD',
        status: DocumentStatus.IN_PROGRESS,
        workflowStatus: WorkflowStatus.APPROVED,
        currentWorkflowStage: WorkflowStage.GENERAL_MANAGER_APPROVAL,
        location: 'New York Office'
      },
      {
        id: '3',
        refNumber: 'PR003',
        date: '2023-08-03',
        type: PRType.ASSET_PURCHASE,
        description: 'New laptops',
        requestorId: 'EMP003',
        requestor: {
          name: 'Bob Johnson',
          id: 'EMP003',
          department: 'Sales'
        },
        totalAmount: 5000,
        currency: 'USD',
        status: DocumentStatus.IN_PROGRESS,
        workflowStatus: WorkflowStatus.APPROVED,
        currentWorkflowStage: WorkflowStage.FINANCE_MANAGER_APPROVAL,
        location: 'London Office'
      }
    ];

    setPurchaseRequests(sampleData);
  }, []);

  // Remove or comment out the API call
  // const fetchPurchaseRequests = async () => {
  //   try {
  //     const response = await fetch('/api/purchase-requests');
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch purchase requests');
  //     }
  //     const data = await response.json();
  //     setPurchaseRequests(data);
  //   } catch (error) {
  //     console.error('Error fetching purchase requests:', error);
  //     // Handle error (e.g., show error message to user)
  //   }
  // };

  // useEffect(() => {
  //   fetchPurchaseRequests();
  // }, []);

  const handleCreateNew = () => {
    router.push('/purchase-requests/new');
  };

  const handleView = (pr: PurchaseRequest) => {
    router.push(`/purchase-requests/${pr.id}/view?initialData=${encodeURIComponent(JSON.stringify(pr))}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/purchase-requests/${id}/edit`);
  };

  const handleApprove = (id: string) => {
    console.log('Approve', id);
  };

  const handleReject = (id: string) => {
    console.log('Reject', id);
  };

  const handleSendBack = (id: string) => {
    console.log('Send Back', id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete', id);
  };

  const handleSort = (column: string) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} for PRs:`, selectedPRs);
  };

  const filteredPRs = purchaseRequests
    .filter(pr => 
      (pr.refNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (pr.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    )
    .filter(pr => filterType === 'ALL' || pr.status === filterType)
    .sort((a, b) => {
      const getValue = (obj: any, path: string) => path.split('.').reduce((o, k) => (o || {})[k], obj);
      const aValue = getValue(a, sortColumn);
      const bValue = getValue(b, sortColumn);
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const paginatedPRs = filteredPRs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages = Math.ceil(filteredPRs.length / itemsPerPage);

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Purchase Requests</h1>
        <Button onClick={() => router.push('/purchase-requests/new')}>Create Purchase Request</Button>
      </div>

      <div className="mb-4 space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Search PR number or description"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select
            value={filterType}
            onValueChange={setFilterType}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All PRs</SelectItem>
              {Object.values(DocumentStatus).map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => setItemsPerPage(Number(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Items per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => handleBulkAction('approve')}>Approve Selected</Button>
          <Button onClick={() => handleBulkAction('export')}>Export Selected</Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedPRs.length === paginatedPRs.length}
                  onCheckedChange={(checked) => {
                    setSelectedPRs(checked ? paginatedPRs.map(pr => pr.id) : []);
                  }}
                />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('refNumber')}>PR Number</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('location')}>Location</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>Date</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>Type</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('description')}>Description</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('requestor.name')}>Requestor</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('requestor.department')}>Department</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('totalAmount')}>Total Amount</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>Status</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('currentApprovalStage')}>Current Approval Stage</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPRs.map((pr) => (
              <TableRow key={pr.id}>
                <TableCell className="align-top">
                  <Checkbox
                    checked={selectedPRs.includes(pr.id)}
                    onCheckedChange={(checked) => {
                      setSelectedPRs(checked
                        ? [...selectedPRs, pr.id]
                        : selectedPRs.filter(id => id !== pr.id)
                      );
                    }}
                  />
                </TableCell>
                <TableCell className="font-medium align-top">
                  <a href="#" onClick={() => handleView(pr)} className="text-blue-600 hover:underline">
                    {pr.refNumber}
                  </a>
                </TableCell>
                <TableCell className="align-top">{pr.location}</TableCell>
                <TableCell className="align-top">{new Date(pr.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</TableCell>
                <TableCell className="align-top">{pr.type}</TableCell>
                <TableCell className="align-top">
                  <span title={pr.description}>
                    {pr.description.length > 50 ? pr.description.substring(0, 50) + '...' : pr.description}
                  </span>
                </TableCell>
                <TableCell className="align-top">{pr.requestor.name}</TableCell>
                <TableCell className="align-top">{pr.requestor.department}</TableCell>
                <TableCell className="align-top">{`${pr.currency} ${pr.totalAmount.toFixed(2)}`}</TableCell>
                <TableCell className="align-top">
                  <Badge variant={pr.status === DocumentStatus.COMPLETED ? 'default' : pr.status === DocumentStatus.REJECTED ? 'destructive' : 'default'}>
                    {pr.status}
                  </Badge>
                </TableCell>
                <TableCell className="align-top">
                  {pr.currentWorkflowStage ? pr.currentWorkflowStage.replace(/_/g, ' ') : '-'}
                </TableCell>
                <TableCell className="align-top">
                  <div className="flex space-x-2">
                    <IconButton 
                      onClick={() => handleView(pr)}
                      icon={<Eye className="h-4 w-4" />}
                      tooltip="View Purchase Request Details"
                    />
                    <IconButton 
                      onClick={() => router.push(`/purchase-requests/${pr.id}/edit`)}
                      icon={<Edit className="h-4 w-4" />}
                      tooltip="Edit Purchase Request"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <IconButton 
                            onClick={() => handleDelete(pr.id)} 
                            icon={<Trash2 className="h-4 w-4" />} 
                            tooltip="Delete Purchase Request"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete Purchase Request: Permanently remove this request from the system</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div>
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPRs.length)} of {filteredPRs.length} entries
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(currentPage - 1)} 
                isActive={currentPage === 1} 
              />
            </PaginationItem>
            {/* Add page numbers here if needed */}
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
                isActive={currentPage === totalPages}
              >
                Next
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      </div>
    </TooltipProvider>
  );
}
