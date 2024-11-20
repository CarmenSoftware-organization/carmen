'use client';

import { useState } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { mockProducts, getProductsByLocation, Product } from '@/lib/mock/inventory-data';

interface ItemReviewProps {
  formData: {
    selectedLocations: string[];
    items: any[];
  };
  setFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

// Get unique categories from mock products
const categories = [
  { value: 'all', label: 'All Categories' },
  ...Array.from(new Set(mockProducts.map(p => p.category))).map(category => ({
    value: category.toLowerCase(),
    label: category
  }))
];

export function ItemReview({ formData, onNext }: ItemReviewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get all products from selected locations
  const locationProducts = formData.selectedLocations.flatMap(locationId => 
    getProductsByLocation(locationId)
  );

  // Remove duplicates (in case a product exists in multiple locations)
  const uniqueProducts = Array.from(new Map(locationProducts.map(item => [item.id, item])).values());

  const filteredItems = uniqueProducts.filter((item) => {
    const matchesSearch =
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue = a[sortField as keyof Product];
    let bValue = b[sortField as keyof Product];
    
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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
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
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('code')}
                    className="flex items-center gap-1 font-medium"
                  >
                    Code
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 font-medium"
                  >
                    Description
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('currentStock')}
                    className="flex items-center gap-1 font-medium"
                  >
                    Current Qty
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('lastCountDate')}
                    className="flex items-center gap-1 font-medium"
                  >
                    Last Count
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.code}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.brand} - {item.packSize} {item.uom}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{item.currentStock}</TableCell>
                  <TableCell>
                    {item.lastCountDate 
                      ? new Date(item.lastCountDate).toLocaleDateString()
                      : 'Never'}
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={item.currentStock <= item.reorderPoint ? 'destructive' : 'default'}
                    >
                      {item.currentStock <= item.reorderPoint ? 'Low Stock' : 'Normal'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {sortedItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No items found matching your criteria.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
