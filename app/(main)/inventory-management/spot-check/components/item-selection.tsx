'use client';

import { useState } from 'react';
import { Search, Shuffle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getProductsByDepartment } from '@/lib/mock-data';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ItemSelectionProps {
  formData: {
    selectedItems: string[];
    department: string;
    targetCount: string;
    selectedLocations: string[];
  };
  setFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'food', label: 'Food' },
  { value: 'beverage', label: 'Beverage' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'linens', label: 'Linens' },
];

export function ItemSelection({ formData, setFormData, onNext, onBack }: ItemSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minValue, setMinValue] = useState('');
  const [showHighValueOnly, setShowHighValueOnly] = useState(false);

  const handleItemSelect = (itemId: string) => {
    setFormData((prev: any) => ({
      ...prev,
      selectedItems: prev.selectedItems.includes(itemId)
        ? prev.selectedItems.filter((id: string) => id !== itemId)
        : [...prev.selectedItems, itemId],
    }));
  };

  const handleRandomSelection = () => {
    const targetCount = parseInt(formData.targetCount);
    if (!targetCount || targetCount <= 0) return;

    const availableItems = filteredItems.filter(item => 
      !formData.selectedItems.includes(item.id)
    );

    const remainingCount = targetCount - formData.selectedItems.length;
    if (remainingCount <= 0) return;

    const shuffled = [...availableItems].sort(() => Math.random() - 0.5);
    const randomSelection = shuffled.slice(0, Math.min(remainingCount, shuffled.length));

    setFormData((prev: any) => ({
      ...prev,
      selectedItems: [...prev.selectedItems, ...randomSelection.map(item => item.id)],
    }));
  };

  // Get items for the selected department
  const departmentItems = formData.department 
    ? getProductsByDepartment(formData.department)
    : [];

  console.log('Department:', formData.department);
  console.log('Department Items:', departmentItems);

  const filteredItems = departmentItems.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory;
    const matchesValue = !showHighValueOnly || !minValue || item.value >= parseFloat(minValue);
    return matchesSearch && matchesCategory && matchesValue;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Select Items</h2>
        <p className="text-sm text-muted-foreground">
          Choose the items you want to include in this spot check count.
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
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
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id="highValue"
              checked={showHighValueOnly}
              onCheckedChange={(checked) => setShowHighValueOnly(checked as boolean)}
            />
            <Label htmlFor="highValue">High Value Items Only</Label>
          </div>
          {showHighValueOnly && (
            <div className="flex items-center gap-2">
              <Label htmlFor="minValue">Minimum Value ($)</Label>
              <Input
                id="minValue"
                type="number"
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
                className="w-24"
                placeholder="0.00"
              />
            </div>
          )}
          <Button
            variant="outline"
            className="ml-auto"
            onClick={handleRandomSelection}
            disabled={!filteredItems.length}
          >
            <Shuffle className="mr-2 h-4 w-4" />
            Random Selection
          </Button>
        </div>
      </div>

      {/* Selected Count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {formData.selectedItems.length} items selected
        </div>
        <Badge variant="secondary">
          Target: {formData.targetCount} items
        </Badge>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            className={cn(
              "cursor-pointer transition-colors",
              formData.selectedItems.includes(item.id)
                ? "border-primary bg-primary/5"
                : "hover:border-primary/50"
            )}
            onClick={() => handleItemSelect(item.id)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.code}</p>
                  </div>
                  <Badge>{item.category}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>
                    <span className="text-muted-foreground">Stock:</span>{' '}
                    {item.currentStock} {item.uom}
                  </span>
                  <span>
                    <span className="text-muted-foreground">Value:</span>{' '}
                    ${item.value.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={formData.selectedItems.length === 0}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
