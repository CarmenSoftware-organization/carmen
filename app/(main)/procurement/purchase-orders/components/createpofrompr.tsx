"use client";

import React, { useState, useMemo } from "react";
import { CurrencyCode } from "@/types/types";
import { PurchaseRequest } from "@/types/types"; // Add this import
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
import { ArrowUpDown } from 'lucide-react';
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
const purchaseRequests: PurchaseRequest[] = [
  { id: "1", refNumber: 'PR001', date: '2023-07-01', description: 'Office Supplies', deliveryDate: '2023-07-15', vendor: 'OfficeMax' },
  { id: "2", refNumber: 'PR002', date: '2023-07-02', description: 'IT Equipment', deliveryDate: '2023-07-20', vendor: 'Dell' },
  { id: "3", refNumber: 'PR003', date: '2023-07-03', description: 'Furniture', deliveryDate: '2023-07-15', vendor: 'IKEA' },
  { id: "4", refNumber: 'PR004', date: '2023-07-04', description: 'Marketing Materials', deliveryDate: '2023-07-18', vendor: 'PrintCo' },
  { id: "5", refNumber: 'PR005', date: '2023-07-05', description: 'Cleaning Supplies', deliveryDate: '2023-07-12', vendor: 'CleanAll' },
  { id: "6", refNumber: 'PR006', date: '2023-07-06', description: 'Software Licenses', deliveryDate: '2023-07-20', vendor: 'Microsoft' },
  { id: "7", refNumber: 'PR007', date: '2023-07-07', description: 'Office Snacks', deliveryDate: '2023-07-14', vendor: 'Costco' },
  { id: "8", refNumber: 'PR008', date: '2023-07-08', description: 'Training Materials', deliveryDate: '2023-07-22', vendor: 'LearnCo' },
  { id: "9", refNumber: 'PR009', date: '2023-07-09', description: 'Safety Equipment', deliveryDate: '2023-07-16', vendor: 'SafetyFirst' },
  { id: "10", refNumber: 'PR010', date: '2023-07-10', description: 'Vehicle Maintenance', deliveryDate: '2023-07-28', vendor: 'AutoShop' },
  { id: "11", refNumber: 'PR011', date: '2023-07-11', description: 'Office Furniture', deliveryDate: '2023-07-15', vendor: 'IKEA' },
  { id: "12", refNumber: 'PR012', date: '2023-07-12', description: 'Networking Equipment', deliveryDate: '2023-07-29', vendor: 'Cisco' },
  { id: "13", refNumber: 'PR013', date: '2023-07-13', description: 'Employee Uniforms', deliveryDate: '2023-07-23', vendor: 'UniformCo' },
  { id: "14", refNumber: 'PR014', date: '2023-07-14', description: 'Lab Supplies', deliveryDate: '2023-07-21', vendor: 'LabEquip' },
  { id: "15", refNumber: 'PR015', date: '2023-07-15', description: 'Office Plants', deliveryDate: '2023-07-19', vendor: 'GreenThumb' },
  { id: "16", refNumber: 'PR016', date: '2023-07-16', description: 'Catering Services', deliveryDate: '2023-07-20', vendor: 'FoodForAll' },
  { id: "17", refNumber: 'PR017', date: '2023-07-17', description: 'Security Cameras', deliveryDate: '2023-07-27', vendor: 'SecureTech' },
  { id: "18", refNumber: 'PR018', date: '2023-07-18', description: 'First Aid Kits', deliveryDate: '2023-07-24', vendor: 'MedSupplies' },
  { id: "19", refNumber: 'PR019', date: '2023-07-19', description: 'Printer Ink', deliveryDate: '2023-07-13', vendor: 'IKEA' },
  { id: "20", refNumber: 'PR020', date: '2023-07-20', description: 'Employee Awards', deliveryDate: '2023-07-17', vendor: 'TrophyShop' }
];

type SortConfig = {
  key: keyof PurchaseRequest;
  direction: 'asc' | 'desc';
};

interface CreatePOFromPRProps {
  onSelectPRs: (selectedPRs: PurchaseRequest[]) => void;
}

export default function CreatePOFromPR({ onSelectPRs }: CreatePOFromPRProps) {
  const [selectedPRIds, setSelectedPRIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'asc' });

  const filteredAndSortedPurchaseRequests = useMemo(() => {
    return purchaseRequests
      .filter(pr =>
        pr.refNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pr.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pr.vendor.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [purchaseRequests, searchTerm, sortConfig]);

  const handleSelectPR = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPRIds([...selectedPRIds, id]);
    } else {
      setSelectedPRIds(selectedPRIds.filter(prId => prId !== id));
    }
    updateSelectedPRs([...selectedPRIds, id]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPRIds(filteredAndSortedPurchaseRequests.map(pr => pr.id));
    } else {
      setSelectedPRIds([]);
    }
    updateSelectedPRs(checked ? filteredAndSortedPurchaseRequests.map(pr => pr.id) : []);
  };

  const updateSelectedPRs = (selectedIds: string[]) => {
    const selectedPRs = purchaseRequests.filter(pr => selectedIds.includes(pr.id));
    onSelectPRs(selectedPRs);
  };

  const handleSort = (key: keyof PurchaseRequest) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
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
                  checked={selectedPRIds.length === filteredAndSortedPurchaseRequests.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('refNumber')}>
                  Ref# <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('date')}>
                  Date <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('vendor')}>
                  Vendor <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('description')}>
                  Description <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('deliveryDate')}>
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
                    onCheckedChange={(checked) => handleSelectPR(pr.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>{pr.refNumber}</TableCell>
                <TableCell>{pr.date}</TableCell>
                <TableCell>{pr.vendor}</TableCell>
                <TableCell>{pr.description}</TableCell>
                <TableCell>{pr.deliveryDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </>
  );
}