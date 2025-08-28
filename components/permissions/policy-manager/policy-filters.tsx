'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Plus, 
  Save, 
  Settings,
  ChevronDown,
  Tag
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

import { EffectType } from '@/lib/types/permissions';
import { ResourceType } from '@/lib/types/permission-resources';

export interface PolicyFilters {
  search: string;
  effect: EffectType | 'all';
  status: 'enabled' | 'disabled' | 'all';
  categories: string[];
  resourceTypes: ResourceType[];
  priorityRange: {
    min: number;
    max: number;
  };
  createdDateRange: {
    from: string;
    to: string;
  };
}

interface PolicyFiltersProps {
  filters: PolicyFilters;
  onFiltersChange: (filters: PolicyFilters) => void;
  onSavePreset?: (name: string, filters: PolicyFilters) => void;
  onLoadPreset?: (filters: PolicyFilters) => void;
  savedPresets?: Array<{ name: string; filters: PolicyFilters }>;
}

export function PolicyFiltersComponent({ 
  filters, 
  onFiltersChange, 
  onSavePreset,
  onLoadPreset,
  savedPresets = []
}: PolicyFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [presetName, setPresetName] = useState('');

  // Resource types for filtering
  // Resource types for filtering - organized by category
  const resourceTypeOptions = [
    // Procurement
    { value: ResourceType.PURCHASE_REQUEST, label: 'Purchase Requests', category: 'Procurement' },
    { value: ResourceType.PURCHASE_ORDER, label: 'Purchase Orders', category: 'Procurement' },
    { value: ResourceType.GOODS_RECEIPT_NOTE, label: 'Goods Receipt Notes', category: 'Procurement' },
    { value: ResourceType.CREDIT_NOTE, label: 'Credit Notes', category: 'Procurement' },
    
    // Inventory
    { value: ResourceType.INVENTORY_ITEM, label: 'Inventory Items', category: 'Inventory' },
    { value: ResourceType.STOCK_COUNT, label: 'Stock Counts', category: 'Inventory' },
    { value: ResourceType.STOCK_ADJUSTMENT, label: 'Stock Adjustments', category: 'Inventory' },
    { value: ResourceType.WASTAGE_REPORT, label: 'Wastage Reports', category: 'Inventory' },
    
    // Vendor Management
    { value: ResourceType.VENDOR, label: 'Vendors', category: 'Vendor' },
    { value: ResourceType.VENDOR_PRICE_LIST, label: 'Vendor Price Lists', category: 'Vendor' },
    { value: ResourceType.VENDOR_CONTRACT, label: 'Vendor Contracts', category: 'Vendor' },
    
    // Product & Recipe
    { value: ResourceType.PRODUCT, label: 'Products', category: 'Product' },
    { value: ResourceType.RECIPE, label: 'Recipes', category: 'Recipe' },
    { value: ResourceType.MENU_ITEM, label: 'Menu Items', category: 'Recipe' },
    
    // Financial
    { value: ResourceType.INVOICE, label: 'Invoices', category: 'Financial' },
    { value: ResourceType.PAYMENT, label: 'Payments', category: 'Financial' },
    { value: ResourceType.BUDGET, label: 'Budgets', category: 'Financial' },
    
    // System
    { value: ResourceType.USER, label: 'Users', category: 'System' },
    { value: ResourceType.ROLE, label: 'Roles', category: 'System' },
    { value: ResourceType.POLICY, label: 'Policies', category: 'System' },
    { value: ResourceType.SYSTEM_CONFIGURATION, label: 'System Configuration', category: 'System' }
  ];

  const updateFilters = (updates: Partial<PolicyFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const handleResourceTypeToggle = (resourceType: ResourceType) => {
    const currentTypes = filters.resourceTypes;
    const newTypes = currentTypes.includes(resourceType)
      ? currentTypes.filter(type => type !== resourceType)
      : [...currentTypes, resourceType];
    
    updateFilters({ resourceTypes: newTypes });
  };

  const handleCategoryToggle = (category: string) => {
    const currentCategories = filters.categories;
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(cat => cat !== category)
      : [...currentCategories, category];
    
    updateFilters({ categories: newCategories });
  };

  // Get available categories from policies
  const availableCategories = ['procurement', 'inventory', 'vendor', 'recipe', 'financial', 'system'];

  const clearAllFilters = () => {
    updateFilters({
      search: '',
      effect: 'all',
      status: 'all',
      categories: [],
      resourceTypes: [],
      priorityRange: { min: 0, max: 1000 },
      createdDateRange: { from: '', to: '' }
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.search !== '' ||
      filters.effect !== 'all' ||
      filters.status !== 'all' ||
      filters.categories.length > 0 ||
      filters.resourceTypes.length > 0 ||
      filters.priorityRange.min !== 0 ||
      filters.priorityRange.max !== 1000 ||
      filters.createdDateRange.from !== '' ||
      filters.createdDateRange.to !== ''
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search !== '') count++;
    if (filters.effect !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.categories.length > 0) count++;
    if (filters.resourceTypes.length > 0) count++;
    if (filters.priorityRange.min !== 0 || filters.priorityRange.max !== 1000) count++;
    if (filters.createdDateRange.from !== '' || filters.createdDateRange.to !== '') count++;
    return count;
  };

  const handleSavePreset = () => {
    if (presetName.trim() && onSavePreset) {
      onSavePreset(presetName.trim(), filters);
      setPresetName('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Policies
            {hasActiveFilters() && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount()} active
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Saved Presets */}
            {savedPresets.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Presets
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Saved Filters</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {savedPresets.map((preset, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => onLoadPreset?.(preset.filters)}
                    >
                      <Tag className="mr-2 h-4 w-4" />
                      {preset.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {hasActiveFilters() && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Basic Search */}
        <div className="space-y-2">
          <Label>Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name or description..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Effect</Label>
            <Select 
              value={filters.effect} 
              onValueChange={(value: EffectType | 'all') => updateFilters({ effect: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Effects</SelectItem>
                <SelectItem value="permit">Permit</SelectItem>
                <SelectItem value="deny">Deny</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select 
              value={filters.status} 
              onValueChange={(value: 'enabled' | 'disabled' | 'all') => updateFilters({ status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="enabled">Enabled Only</SelectItem>
                <SelectItem value="disabled">Disabled Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select 
              value={filters.categories.length > 0 ? filters.categories[0] : 'all'} 
              onValueChange={(value: string) => {
                if (value === 'all') {
                  updateFilters({ categories: [] });
                } else {
                  updateFilters({ categories: [value] });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {availableCategories.map(category => (
                  <SelectItem key={category} value={category} className="capitalize">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Priority Range</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.priorityRange.min}
                onChange={(e) => updateFilters({
                  priorityRange: { 
                    ...filters.priorityRange, 
                    min: parseInt(e.target.value) || 0 
                  }
                })}
                className="w-20"
                min="0"
                max="1000"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.priorityRange.max}
                onChange={(e) => updateFilters({
                  priorityRange: { 
                    ...filters.priorityRange, 
                    max: parseInt(e.target.value) || 1000 
                  }
                })}
                className="w-20"
                min="0"
                max="1000"
              />
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Advanced Filters
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 pt-4">
            {/* Created Date Range Filter */}
            <div className="space-y-3">
              <Label>Created Date Range</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  placeholder="From Date"
                  value={filters.createdDateRange.from}
                  onChange={(e) => updateFilters({
                    createdDateRange: { 
                      ...filters.createdDateRange, 
                      from: e.target.value 
                    }
                  })}
                  className="flex-1"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="date"
                  placeholder="To Date"
                  value={filters.createdDateRange.to}
                  onChange={(e) => updateFilters({
                    createdDateRange: { 
                      ...filters.createdDateRange, 
                      to: e.target.value 
                    }
                  })}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Resource Types Filter */}
            <div className="space-y-3">
              <Label>Resource Types</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {resourceTypeOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={filters.resourceTypes.includes(option.value)}
                      onCheckedChange={() => handleResourceTypeToggle(option.value)}
                    />
                    <Label
                      htmlFor={option.value}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
              
              {filters.resourceTypes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {filters.resourceTypes.map((type) => {
                    const option = resourceTypeOptions.find(opt => opt.value === type);
                    return (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {option?.label}
                        <X 
                          className="h-3 w-3 ml-1 cursor-pointer" 
                          onClick={() => handleResourceTypeToggle(type)}
                        />
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Save Preset */}
            <div className="space-y-2 pt-4 border-t">
              <Label>Save Current Filters as Preset</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Preset name..."
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSavePreset}
                  disabled={!presetName.trim() || !hasActiveFilters()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}