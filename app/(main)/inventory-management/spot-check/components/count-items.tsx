'use client'

import { useState } from 'react';
import { Search, ChevronRight, Pencil } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProductsByDepartment } from '@/lib/mock/inventory-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { CountItem } from '../types';

interface CountItemsProps {
  items: CountItem[];
  selectedItem: string | null;
  setSelectedItem: (id: string | null) => void;
  onCountChange: (id: string, count: number) => void;
}

export function CountItems({
  items,
  selectedItem,
  setSelectedItem,
  onCountChange,
}: CountItemsProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Get products and convert them to CountItems
  const allProductsRaw = getProductsByDepartment(items[0]?.department || '');
  // Convert raw products to CountItem format
  const allProducts = allProductsRaw.map(product => ({
    id: product.id,
    name: product.name,
    description: product.name, // Using name as description since Product doesn't have description
    expectedCount: product.currentStock || 0, // Using currentStock as expectedCount
    actualCount: 0,
    department: items[0]?.department || '',
    code: product.code,
    category: product.category,
    currentStock: product.currentStock
  }));
  
  // Filter to only show selected items
  const selectedProducts = allProducts.filter(product => 
    items.some(item => item.id === product.id)
  );

  const filteredProducts = selectedProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCountChange = (id: string, value: string) => {
    const count = parseInt(value, 10) || 0;
    onCountChange(id, count);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Count Selected Items</h2>
        <p className="text-sm text-muted-foreground">
          Enter the count for each selected item. Use the + and - buttons to adjust the quantities.
        </p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="grid gap-4">
          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  {searchQuery ? "No matching items found." : "No items selected for counting."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Expected Count</TableHead>
                      <TableHead className="text-right">Actual Count</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id} className={selectedItem === product.id ? 'bg-muted/50' : ''}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.description}</TableCell>
                        <TableCell>{product.expectedCount}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={product.actualCount.toString()}
                            onChange={(e) => handleCountChange(product.id, e.target.value)}
                            className="w-24 ml-auto"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedItem(product.id === selectedItem ? null : product.id)}
                          >
                            {selectedItem === product.id ? <Pencil className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
