'use client';

import { useState } from 'react';
import { Search, Plus, Minus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getProductsByDepartment } from '@/lib/mock-data';
import type { Product } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CountItemsProps {
  formData: {
    selectedItems: string[];
    department: string;
    targetCount: string;
    selectedLocations: string[];
    counts?: Record<string, number>;
  };
  setFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function CountItems({ formData, setFormData, onNext, onBack }: CountItemsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [counts, setCounts] = useState<Record<string, number>>(formData.counts || {});

  // Get all products for the department
  const allProducts = getProductsByDepartment(formData.department);
  
  // Filter to only show selected items
  const selectedProducts = allProducts.filter(product => 
    formData.selectedItems.includes(product.id)
  );

  const filteredProducts = selectedProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCountChange = (itemId: string, delta: number) => {
    const currentCount = counts[itemId] || 0;
    const newCount = Math.max(0, currentCount + delta);
    
    const newCounts = {
      ...counts,
      [itemId]: newCount
    };
    
    setCounts(newCounts);
    setFormData((prev: any) => ({
      ...prev,
      counts: newCounts
    }));
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
            filteredProducts.map((product) => (
              <Card key={product.id}>
                <CardHeader className="p-4">
                  <CardTitle className="text-base font-medium">
                    {product.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">SKU: {product.code}</p>
                      <p className="text-sm text-muted-foreground">Category: {product.category}</p>
                      <p className="text-sm text-muted-foreground">Current Stock: {product.currentStock}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCountChange(product.id, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="w-12 text-center">
                        <Label>{counts[product.id] || 0}</Label>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCountChange(product.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
