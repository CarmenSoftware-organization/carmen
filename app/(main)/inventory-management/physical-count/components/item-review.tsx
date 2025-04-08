'use client'

import { useState, useEffect, useCallback } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockProducts, getProductsByLocation, Product } from '@/lib/mock/inventory-data';
import React from 'react';

interface FormData {
  selectedLocations: string[];
  items: Product[];
  department: string;
}

interface ItemReviewProps {
  formData: FormData;
  setFormData: (data: Partial<FormData>) => void;
}

// Get unique categories from mock products
const categories = [
  { value: 'all', label: 'All Categories' },
  ...Array.from(new Set(mockProducts.map(p => p.category))).map(category => ({
    value: category.toLowerCase(),
    label: category
  }))
];

export function ItemReview({ formData, setFormData }: ItemReviewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortField, setSortField] = useState<keyof Product | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = useCallback((field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setSelectedCategory(value);
  }, []);

  // Get all products from selected locations and remove duplicates
  const uniqueProducts = React.useMemo(() => {
    const locationProducts = formData.selectedLocations.flatMap((locationId: string) => 
      getProductsByLocation(locationId)
    );
    return Array.from(new Map(locationProducts.map((item: Product) => [item.id, item])).values());
  }, [formData.selectedLocations]);

  // Update items in formData when unique products change - Fix dependency array
  useEffect(() => {
    if (formData.selectedLocations.length > 0) {
      // Use a deep equality check to prevent unnecessary updates
      const hasChanged = JSON.stringify(formData.items.map(i => i.id).sort()) !== 
                         JSON.stringify(uniqueProducts.map(i => i.id).sort());
      
      if (hasChanged) {
        setFormData({
          items: uniqueProducts
        });
      }
    }
  }, [uniqueProducts, formData.selectedLocations.length, formData.items, setFormData]);

  const filteredItems = React.useMemo(() => {
    return uniqueProducts.filter((item: Product) => {
      const matchesSearch =
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [uniqueProducts, searchQuery, selectedCategory]);

  const sortedItems = React.useMemo(() => {
    if (!sortField) return filteredItems;
    
    return [...filteredItems].sort((a: Product, b: Product) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle dates
      if (sortField === 'lastCountDate') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      
      const modifier = sortDirection === 'asc' ? 1 : -1;
      return (aValue > bValue ? 1 : aValue < bValue ? -1 : 0) * modifier;
    });
  }, [filteredItems, sortField, sortDirection]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Items</CardTitle>
        <CardDescription>
          Review and confirm the items to be counted in the selected locations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search and Filter Bar */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>
          <Select
            value={selectedCategory}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Items Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => handleSort('code')}
                  >
                    Code
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    Name
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>UOM</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="text-right">
                  <div
                    className="flex items-center justify-end gap-1 cursor-pointer"
                    onClick={() => handleSort('lastCountDate')}
                  >
                    Last Count
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No items found
                  </TableCell>
                </TableRow>
              ) : (
                sortedItems.map((item: Product) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.code}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.uom}</TableCell>
                    <TableCell className="text-right">{item.currentStock}</TableCell>
                    <TableCell className="text-right">
                      {item.lastCountDate
                        ? new Date(item.lastCountDate).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {sortedItems.length} of {uniqueProducts.length} items
          </div>
          <div>
            {categories.length - 1} categories | {uniqueProducts.length} total items
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
