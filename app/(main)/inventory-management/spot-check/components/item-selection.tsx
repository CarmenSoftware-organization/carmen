'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProductsByDepartment } from '@/lib/mock/inventory-data';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from '@/components/ui/scroll-area';

interface ItemSelectionProps {
  formData: {
    department: string;
    selectedItems: string[];
    targetCount: string;
  };
  setFormData: (data: FormData) => void;
  onNext: () => void;
  onBack: () => void;
}

interface FormData {
  department: string;
  selectedItems: string[];
  targetCount: string;
  [key: string]: string | string[] | number | Record<string, unknown>;
}

export function ItemSelection({ formData, setFormData, onNext, onBack }: ItemSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Get all products for the department
  const products = getProductsByDepartment(formData.department);
  
  // Filter products based on search query
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleItemSelect = (productId: string) => {
    const isSelected = formData.selectedItems.includes(productId);
    const newSelectedItems = isSelected
      ? formData.selectedItems.filter(id => id !== productId)
      : [...formData.selectedItems, productId];
    
    setFormData({
      ...formData,
      selectedItems: newSelectedItems
    });
  };

  const handleSelectAll = () => {
    setFormData({
      ...formData,
      selectedItems: formData.selectedItems.length === filteredProducts.length
        ? [] // Deselect all
        : filteredProducts.map(product => product.id) // Select all
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Items to Count</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search items..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="selectAll" 
                checked={formData.selectedItems.length === filteredProducts.length && filteredProducts.length > 0}
                onCheckedChange={handleSelectAll} 
              />
              <Label htmlFor="selectAll">Select All</Label>
            </div>
            
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={product.id}
                      checked={formData.selectedItems.includes(product.id)}
                      onCheckedChange={() => handleItemSelect(product.id)}
                    />
                    <Label htmlFor={product.id} className="flex-1 cursor-pointer">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">SKU: {product.code}</div>
                    </Label>
                  </div>
                ))}
                
                {filteredProducts.length === 0 && (
                  <div className="py-4 text-center text-muted-foreground">
                    No items match your search
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={onBack}>Back</Button>
              <div className="text-sm">
                {formData.selectedItems.length} items selected
              </div>
              <Button onClick={onNext} disabled={formData.selectedItems.length === 0}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
