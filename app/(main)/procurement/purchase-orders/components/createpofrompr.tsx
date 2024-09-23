"use client";

import React, { useState, useMemo } from "react";
import {
  CurrencyCode,
  DocumentStatus,
  PurchaseRequest_3,
  WorkflowStage,
  WorkflowStatus,
} from "@/lib/types";
import { PRType } from "@/lib/types";
import { PurchaseRequest } from "@/lib/types"; // Add this import
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

// Updated mock data for Purchase Requests
const purchaseRequests: PurchaseRequest_3[] = [
  {
    id: "1",
    refNumber: "PR001",
    date: new Date("2023-01-01"),
    type: PRType.MarketList,
    vendor: "Vendor A",
    vendorId: 1,
    deliveryDate: new Date("2023-01-10"),
    description: "Market list for fresh produce",
    requestorId: "user1",
    requestor: {
      name: "John Doe",
      id: "user1",
      department: "IT",
    },
    status: DocumentStatus.Submitted,
    workflowStatus: WorkflowStatus.approved,
    currentWorkflowStage: WorkflowStage.departmentHeadApproval,
    location: "Warehouse 1",
    department: "IT",
    jobCode: "JOB001",
    estimatedTotal: 1000,
    currency: CurrencyCode.USD,
    items: [],
    attachments: [],
    comments: [],
    budget: {
      totalBudget: 100,
      availableBudget: 100,
      allocatedBudget: 100,
    },
    approvalHistory: [],
  },
];

type SortConfig = {
  key: keyof PurchaseRequest;
  direction: "asc" | "desc";
};

interface CreatePOFromPRProps {
  onSelectPRs: (selectedPRs: PurchaseRequest_3[]) => void;
}

export default function CreatePOFromPR({ onSelectPRs }: CreatePOFromPRProps) {
  const [selectedPRIds, setSelectedPRIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "date",
    direction: "asc",
  });

  const filteredAndSortedPurchaseRequests = useMemo(() => {
    return purchaseRequests
      .filter(
        (pr) =>
          pr.refNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pr.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pr.vendor.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
  }, [purchaseRequests, searchTerm, sortConfig]);

  const handleSelectPR = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPRIds([...selectedPRIds, id]);
    } else {
      setSelectedPRIds(selectedPRIds.filter((prId) => prId !== id));
    }
    updateSelectedPRs([...selectedPRIds, id]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPRIds(filteredAndSortedPurchaseRequests.map((pr) => pr.id));
    } else {
      setSelectedPRIds([]);
    }
    updateSelectedPRs(
      checked ? filteredAndSortedPurchaseRequests.map((pr) => pr.id) : []
    );
  };

  const updateSelectedPRs = (selectedIds: string[]) => {
    const selectedPRs = purchaseRequests.filter((pr) =>
      selectedIds.includes(pr.id)
    );
    onSelectPRs(selectedPRs);
  };

  const handleSort = (key: keyof PurchaseRequest) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  return (
    <>
      <div className="mb-4">
        <Input
          placeholder="Search PRs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    selectedPRIds.length ===
                    filteredAndSortedPurchaseRequests.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("refNumber")}>
                  Ref# <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("date")}>
                  Date <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("vendor")}>
                  Vendor <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("description")}
                >
                  Description <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("deliveryDate")}
                >
                  Delivery Date <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedPurchaseRequests.map((pr) => (
              <TableRow key={pr.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedPRIds.includes(pr.id)}
                    onCheckedChange={(checked) =>
                      handleSelectPR(pr.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell>{pr.refNumber}</TableCell>
                <TableCell>{pr.date.toLocaleDateString()}</TableCell>
                <TableCell>{pr.vendor}</TableCell>
                <TableCell>{pr.description}</TableCell>
                <TableCell>{pr.deliveryDate.toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </>
  );
}
