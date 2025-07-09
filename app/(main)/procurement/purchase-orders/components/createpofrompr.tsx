"use client";

import React, { useState, useMemo } from "react";
import {
  CurrencyCode,
  DocumentStatus,
  PurchaseRequest,
  WorkflowStage,
  WorkflowStatus,
} from "@/lib/types";
import { PRType } from "@/lib/types";
import { mockPRListData } from "@/app/(main)/procurement/purchase-requests/components/mockPRListData";
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
import { Badge } from "@/components/ui/badge";
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


type SortConfig = {
  key: keyof PurchaseRequest;
  direction: "asc" | "desc";
};

interface CreatePOFromPRProps {
  onSelectPRs: (selectedPRs: PurchaseRequest[]) => void;
}

export default function CreatePOFromPR({ onSelectPRs }: CreatePOFromPRProps) {
  const [selectedPRIds, setSelectedPRIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "date",
    direction: "asc",
  });

  const filteredAndSortedPurchaseRequests = useMemo(() => {
    return mockPRListData
      .filter((pr) => {
        // Only show approved and completed PRs
        const isApproved = pr.workflowStatus === WorkflowStatus.approved && 
                          pr.currentWorkflowStage === WorkflowStage.completed;
        
        const matchesSearch = pr.refNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             pr.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             pr.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             pr.requestor.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        return isApproved && matchesSearch;
      })
      .sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        // Handle undefined values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        
        if (aValue < bValue)
          return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue)
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
  }, [searchTerm, sortConfig]);

  const handleSelectPR = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPRIds([...selectedPRIds, id]);
    } else {
      setSelectedPRIds(selectedPRIds.filter((prId) => prId !== id));
    }
    // Removed problematic updateSelectedPRs call that was closing the dialog
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPRIds(filteredAndSortedPurchaseRequests.map((pr) => pr.id));
    } else {
      setSelectedPRIds([]);
    }
    // Removed problematic updateSelectedPRs call that was closing the dialog
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
    <div className="flex flex-col h-full min-h-0">
      <div className="mb-4 space-y-3">
        <Input
          placeholder="Search PRs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
          <p className="font-medium mb-2">🎯 Grouping Logic:</p>
          <p>Items with the same <strong>vendor</strong>, <strong>currency</strong>, and <strong>date required</strong> will be grouped into one PO. Multiple POs may be created from a single PR if it contains items from different vendors or required dates.</p>
        </div>
      </div>
      <ScrollArea className="flex-1 min-h-0">
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
                <Button variant="ghost" onClick={() => handleSort("department")}>
                  Department <ArrowUpDown className="ml-2 h-4 w-4" />
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
                  onClick={() => handleSort("requestor")}
                >
                  Requestor <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("totalAmount")}
                >
                  Amount <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Currency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedPurchaseRequests.map((pr, index) => {
              // Create a visual grouping by vendor+currency
              const vendorCurrencyKey = `${pr.vendor}-${pr.currency}`;
              const isSelected = selectedPRIds.includes(pr.id);
              const groupColor = vendorCurrencyKey.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % 5;
              const groupStyles = [
                'border-l-4 border-l-blue-200 bg-blue-50/30',
                'border-l-4 border-l-green-200 bg-green-50/30',
                'border-l-4 border-l-purple-200 bg-purple-50/30',
                'border-l-4 border-l-orange-200 bg-orange-50/30',
                'border-l-4 border-l-pink-200 bg-pink-50/30'
              ];
              
              return (
                <TableRow 
                  key={pr.id} 
                  className={`${groupStyles[groupColor]} ${isSelected ? 'bg-primary/5' : ''} hover:bg-muted/20`}
                >
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
                  <TableCell>{pr.department}</TableCell>
                  <TableCell>{pr.description}</TableCell>
                  <TableCell>{pr.requestor.name}</TableCell>
                  <TableCell className="text-right font-medium">
                    {pr.currency} {pr.totalAmount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">{pr.currency}</Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">
          {selectedPRIds.length > 0 && (
            <div>
              <p className="font-medium">Selected items will be grouped by vendor, currency, and date required:</p>
              {(() => {
                const selectedPRs = filteredAndSortedPurchaseRequests.filter(pr => selectedPRIds.includes(pr.id));
                
                // Extract all items from selected PRs
                const allItems = selectedPRs.flatMap(pr => 
                  pr.items?.map(item => ({
                    ...item,
                    sourcePR: pr,
                    prId: pr.id,
                    prNumber: pr.refNumber
                  })) || []
                );
                
                // Group items by vendor + currency + deliveryDate
                const groupedItems = allItems.reduce((groups, item) => {
                  const key = `${item.vendor}-${item.currency}-${item.deliveryDate}`;
                  if (!groups[key]) {
                    groups[key] = {
                      vendor: item.vendor,
                      currency: item.currency,
                      deliveryDate: item.deliveryDate,
                      items: [],
                      totalAmount: 0,
                      sourcePRs: new Set()
                    };
                  }
                  groups[key].items.push(item);
                  groups[key].totalAmount += item.totalAmount || 0;
                  groups[key].sourcePRs.add(item.prNumber);
                  return groups;
                }, {} as Record<string, { 
                  vendor: string; 
                  currency: string; 
                  deliveryDate: Date; 
                  items: any[]; 
                  totalAmount: number; 
                  sourcePRs: Set<string> 
                }>);
                
                return (
                  <ul className="mt-2 space-y-1">
                    {Object.values(groupedItems).map((group, index) => (
                      <li key={index} className="text-xs">
                        • <strong>{group.vendor}</strong> ({group.currency}) - {group.deliveryDate.toLocaleDateString()} - {group.items.length} item{group.items.length > 1 ? 's' : ''} from {group.sourcePRs.size} PR{group.sourcePRs.size > 1 ? 's' : ''} - Total: {group.currency} {group.totalAmount.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </div>
          )}
        </div>
        <Button
          type="button"
          onClick={() => {
            const selectedPRs = filteredAndSortedPurchaseRequests.filter(pr => selectedPRIds.includes(pr.id));
            onSelectPRs(selectedPRs);
          }}
          disabled={selectedPRIds.length === 0}
        >
          Create PO{selectedPRIds.length > 0 ? `s (${(() => {
            const selectedPRs = filteredAndSortedPurchaseRequests.filter(pr => selectedPRIds.includes(pr.id));
            
            // Extract all items from selected PRs
            const allItems = selectedPRs.flatMap(pr => 
              pr.items?.map(item => ({
                ...item,
                sourcePR: pr,
                prId: pr.id,
                prNumber: pr.refNumber
              })) || []
            );
            
            // Group items by vendor + currency + deliveryDate
            const groupedItems = allItems.reduce((groups, item) => {
              const key = `${item.vendor}-${item.currency}-${item.deliveryDate}`;
              if (!groups[key]) {
                groups[key] = true;
              }
              return groups;
            }, {} as Record<string, boolean>);
            
            return Object.keys(groupedItems).length;
          })()})` : ''}
        </Button>
      </div>
    </div>
  );
}
