"use client";

import React, { useState, useMemo } from "react";
import { CurrencyCode } from "@/types/types";
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
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

// Updated mock data for Purchase Requests
const purchaseRequests = [
  {
    id: 1,
    refNumber: "PR-001",
    date: "2023-08-01",
    description: "Bed Linens",
    deliveryDate: "2023-08-15",
    status: "Approved",
    items: [
      { id: 1, name: "King Sheet Set", quantity: 50, price: 89.99, vendor: "Vendor A" },
      { id: 2, name: "Queen Duvet Cover", quantity: 30, price: 79.99, vendor: "Vendor B" },
    ],
  },
  {
    id: 2,
    refNumber: "PR-002",
    date: "2023-08-02",
    description: "Toiletries",
    deliveryDate: "2023-08-20",
    status: "Approved",
    items: [
      { id: 3, name: "Shampoo Bottles", quantity: 500, price: 2.50, vendor: "Vendor C" },
      { id: 4, name: "Bath Soap Bars", quantity: 1000, price: 1.25, vendor: "Vendor D" },
    ],
  },
  {
    id: 3,
    refNumber: "PR-003",
    date: "2023-08-03",
    description: "Room Furniture",
    deliveryDate: "2023-08-25",
    status: "Approved",
    items: [
      { id: 5, name: "Bedside Table", quantity: 100, price: 129.99, vendor: "Vendor E" },
      { id: 6, name: "Desk Chair", quantity: 50, price: 199.99, vendor: "Vendor F" },
    ],
  },
  {
    id: 4,
    refNumber: "PR-004",
    date: "2023-08-04",
    description: "Cleaning Supplies",
    deliveryDate: "2023-08-18",
    status: "Approved",
    items: [
      { id: 7, name: "All-Purpose Cleaner", quantity: 200, price: 5.99, vendor: "Vendor G" },
      { id: 8, name: "Microfiber Cloths", quantity: 500, price: 1.99, vendor: "Vendor H" },
    ],
  },
  {
    id: 5,
    refNumber: "PR-005",
    date: "2023-08-05",
    description: "Restaurant Equipment",
    deliveryDate: "2023-08-30",
    status: "Approved",
    items: [
      { id: 9, name: "Commercial Blender", quantity: 5, price: 299.99, vendor: "Vendor I" },
      { id: 10, name: "Stainless Steel Pots", quantity: 20, price: 89.99, vendor: "Vendor J" },
    ],
  },
];

export default function CreatePOFromPR() {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(CurrencyCode.USD);
  const [selectedPRs, setSelectedPRs] = useState<number[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const groupedPurchaseRequests = useMemo(() => {
    const grouped = purchaseRequests.reduce((acc, pr) => {
      pr.items.forEach(item => {
        const deliveryDateKey = pr.deliveryDate;
        const vendorKey = item.vendor;
        const currencyKey = selectedCurrency;

        if (!acc[deliveryDateKey]) acc[deliveryDateKey] = {};
        if (!acc[deliveryDateKey][vendorKey]) acc[deliveryDateKey][vendorKey] = {};
        if (!acc[deliveryDateKey][vendorKey][currencyKey]) acc[deliveryDateKey][vendorKey][currencyKey] = [];

        if (!acc[deliveryDateKey][vendorKey][currencyKey].includes(pr)) {
          acc[deliveryDateKey][vendorKey][currencyKey].push(pr);
        }
      });
      return acc;
    }, {} as Record<string, Record<string, Record<string, typeof purchaseRequests>>>);

    return grouped;
  }, [purchaseRequests, selectedCurrency]);

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupKey)
        ? prev.filter(key => key !== groupKey)
        : [...prev, groupKey]
    );
  };

  const handleSelectPR = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedPRs([...selectedPRs, id]);
    } else {
      setSelectedPRs(selectedPRs.filter(prId => prId !== id));
    }
  };

  const handleSelectAllInGroup = (prs: typeof purchaseRequests, checked: boolean) => {
    if (checked) {
      const newSelectedPRs = [...new Set([...selectedPRs, ...prs.map(pr => pr.id)])];
      setSelectedPRs(newSelectedPRs);
    } else {
      const prIdsInGroup = prs.map(pr => pr.id);
      setSelectedPRs(selectedPRs.filter(id => !prIdsInGroup.includes(id)));
    }
  };

  const renderGroup = (group: any, level: number = 0, path: string[] = []) => {
    if (Array.isArray(group)) {
      const allSelected = group.every(pr => selectedPRs.includes(pr.id));
      const someSelected = group.some(pr => selectedPRs.includes(pr.id));

      return (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Select</TableHead>
                <TableHead>Ref#</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {group.map((pr) => (
                <TableRow key={pr.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedPRs.includes(pr.id)}
                      onCheckedChange={(checked) => handleSelectPR(pr.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>{pr.refNumber}</TableCell>
                  <TableCell>{pr.date}</TableCell>
                  <TableCell>{pr.description}</TableCell>
                  <TableCell>{pr.deliveryDate}</TableCell>
                  <TableCell>{pr.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    return Object.entries(group).map(([key, value]) => {
      const currentPath = [...path, key];
      const groupKey = currentPath.join('-');
      const isExpanded = expandedGroups.includes(groupKey);

      const allPRs = getAllPRs(value);
      const allSelected = allPRs.every(pr => selectedPRs.includes(pr.id));
      const someSelected = allPRs.some(pr => selectedPRs.includes(pr.id));

      return (
        <div key={groupKey} className="mb-4" style={{ marginLeft: `${level * 20}px` }}>
          <div className="flex items-center space-x-2">
            
          <Checkbox
              checked={allSelected}
              onCheckedChange={(checked) => handleSelectAllInGroup(allPRs, checked as boolean)}
            />
            
            <Button
              variant="outline"
              className="flex-grow justify-start"
              onClick={() => toggleGroup(groupKey)}
            >
              {isExpanded ? <ChevronDown className="mr-2 h-4 w-4" /> : <ChevronRight className="mr-2 h-4 w-4" />}
              {level === 0 ? 'Delivery Date: ' : level === 1 ? 'Vendor: ' : 'Currency: '}{key}
            </Button>
          </div>
          {isExpanded && (
            <div className="mt-2">
              {renderGroup(value, level + 1, currentPath)}
            </div>
          )}
        </div>
      );
    });
  };

  const getAllPRs = (group: any): typeof purchaseRequests => {
    if (Array.isArray(group)) {
      return group;
    }
    return Object.values(group).flatMap(getAllPRs);
  };

  return (
    <>
      <ScrollArea className="h-[400px]">
        {renderGroup(groupedPurchaseRequests)}
      </ScrollArea>
    </>
  );
}