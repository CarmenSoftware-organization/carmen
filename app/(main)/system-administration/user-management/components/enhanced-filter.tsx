"use client"

import React, { useState, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, Plus, Save, X, Filter, Star, History, Code, Check } from 'lucide-react';

// Define types for our filter system
export type FilterOperator = 'equals' | 'contains' | 'notEquals' | 'in' | 'between' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty';
export type LogicalOperator = 'AND' | 'OR';

export interface FilterCondition {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string | string[];
  logicalOperator?: LogicalOperator;
}

export interface SavedFilter {
  id: string;
  name: string;
  conditions: FilterCondition[];
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EnhancedFilterProps {
  filterConditions: FilterCondition[];
  onFilterChange: (conditions: FilterCondition[]) => void;
  savedFilters: SavedFilter[];
  onSaveFilter: (filter: SavedFilter) => void;
  onDeleteSavedFilter: (id: string) => void;
  onToggleDefaultFilter: (id: string) => void;
}

export function EnhancedFilter({
  filterConditions,
  onFilterChange,
  savedFilters,
  onSaveFilter,
  onDeleteSavedFilter,
  onToggleDefaultFilter
}: EnhancedFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('build');
  const [filterName, setFilterName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const filterFields = [
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'businessUnit', label: 'Business Unit' },
    { value: 'department', label: 'Department' },
    { value: 'roles', label: 'Roles' },
    { value: 'hodStatus', label: 'HOD Status' },
    { value: 'inviteStatus', label: 'Invite Status' },
    { value: 'accountStatus', label: 'Account Status' },
    { value: 'lastLogin', label: 'Last Login' },
  ];

  const removeFilter = (id: string) => {
    onFilterChange(filterConditions.filter(condition => condition.id !== id));
  };

  const clearAllFilters = () => {
    onFilterChange([]);
  };

  const addFilter = () => {
    const newCondition: FilterCondition = {
      id: Math.random().toString(36).substring(2, 9),
      field: filterFields[0].value,
      operator: 'equals',
      value: '',
      logicalOperator: filterConditions.length > 0 ? 'AND' : undefined
    };
    onFilterChange([...filterConditions, newCondition]);
  };

  const handleLogicalOperatorChange = (id: string, value: LogicalOperator) => {
    const newFilters = filterConditions.map(condition => 
      condition.id === id ? { ...condition, logicalOperator: value } : condition
    );
    onFilterChange(newFilters);
  };

  const handleFieldChange = (id: string, value: string) => {
    const newFilters = filterConditions.map(condition => 
      condition.id === id ? { ...condition, field: value } : condition
    );
    onFilterChange(newFilters);
  };

  const handleOperatorChange = (id: string, value: FilterOperator) => {
    const newFilters = filterConditions.map(condition => 
      condition.id === id ? { ...condition, operator: value } : condition
    );
    onFilterChange(newFilters);
  };

  const handleValueChange = (id: string, value: string) => {
    const newFilters = filterConditions.map(condition => 
      condition.id === id ? { ...condition, value } : condition
    );
    onFilterChange(newFilters);
  };

  const handleSaveFilter = () => {
    if (!filterName.trim()) return;
    
    const now = new Date().toISOString();
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName,
      conditions: filterConditions,
      isDefault: false,
      createdAt: now,
      updatedAt: now
    };
    
    onSaveFilter(newFilter);
    setFilterName('');
    setShowSaveDialog(false);
  };

  const applyFilter = (filter: SavedFilter) => {
    onFilterChange(filter.conditions);
    setIsOpen(false);
  };

  // Generate a display string for a filter
  const getFilterDisplay = (filter: FilterCondition): string => {
    const field = filterFields?.find(f => f.value === filter.field)?.label || filter.field;
    
    let operatorText = '';
    switch (filter.operator) {
      case 'equals': operatorText = 'is'; break;
      case 'contains': operatorText = 'contains'; break;
      case 'notEquals': operatorText = 'is not'; break;
      case 'in': operatorText = 'is one of'; break;
      case 'between': operatorText = 'is between'; break;
      case 'greaterThan': operatorText = 'is greater than'; break;
      case 'lessThan': operatorText = 'is less than'; break;
      case 'isEmpty': operatorText = 'is empty'; break;
      case 'isNotEmpty': operatorText = 'is not empty'; break;
      default: operatorText = filter.operator;
    }
    
    let valueText = '';
    if (['isEmpty', 'isNotEmpty'].includes(filter.operator)) {
      valueText = '';
    } else if (Array.isArray(filter.value)) {
      valueText = filter.value.join(', ');
    } else {
      valueText = filter.value;
    }
    
    return `${field} ${operatorText}${valueText ? ' ' + valueText : ''}`;
  };

  const getJsonView = () => {
    return JSON.stringify({
      conditions: filterConditions.map(filter => ({
        id: filter.id,
        field: filter.field,
        operator: filter.operator,
        value: filter.value,
        logicalOperator: filter.logicalOperator
      }))
    }, null, 2);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {filterConditions.length > 0 && (
          <Badge 
            variant="secondary" 
            className="bg-primary/10 hover:bg-primary/20 cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            {filterConditions.length} {filterConditions.length === 1 ? 'filter' : 'filters'} active
          </Badge>
        )}
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-2 lg:px-3">
              <span>Saved Filters</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <div className="space-y-2">
              <h3 className="font-medium">Saved Filters</h3>
              <div className="space-y-1">
                {savedFilters.length === 0 && (
                  <p className="text-sm text-muted-foreground">No saved filters yet</p>
                )}
                {savedFilters.map((filter) => (
                  <div key={filter.id} className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-gray-100">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleDefaultFilter(filter.id)}
                        className="h-6 w-6"
                      >
                        <Star className={`h-4 w-4 ${filter.isDefault ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      </Button>
                      <span className="text-sm">{filter.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => applyFilter(filter)}
                        className="h-6 w-6"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteSavedFilter(filter.id)}
                        className="h-6 w-6 text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant={filterConditions.length > 0 ? "default" : "outline"} size="sm">
              <Filter className="mr-2 h-4 w-4" />
              <span>Advanced Filter</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Advanced Filter</SheetTitle>
              <SheetDescription>
                Create complex filters to find exactly what you need.
              </SheetDescription>
            </SheetHeader>
            
            <Tabs defaultValue="build" className="mt-4" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="build">Build</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
              </TabsList>
              
              <TabsContent value="build" className="space-y-4 py-4">
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {filterConditions.map((filter, index) => (
                      <div key={filter.id} className="space-y-2">
                        {index > 0 && (
                          <Select
                            value={filter.logicalOperator || 'AND'}
                            onValueChange={(value) => handleLogicalOperatorChange(filter.id, value as LogicalOperator)}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AND">AND</SelectItem>
                              <SelectItem value="OR">OR</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-5">
                            <Select
                              value={filter.field}
                              onValueChange={(value) => handleFieldChange(filter.id, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select field" />
                              </SelectTrigger>
                              <SelectContent>
                                {filterFields.map((field) => (
                                  <SelectItem key={field.value} value={field.value}>
                                    {field.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="col-span-3">
                            <Select
                              value={filter.operator}
                              onValueChange={(value) => handleOperatorChange(filter.id, value as FilterOperator)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Operator" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="equals">Equals</SelectItem>
                                <SelectItem value="contains">Contains</SelectItem>
                                <SelectItem value="notEquals">Not equals</SelectItem>
                                <SelectItem value="in">In</SelectItem>
                                <SelectItem value="between">Between</SelectItem>
                                <SelectItem value="greaterThan">Greater than</SelectItem>
                                <SelectItem value="lessThan">Less than</SelectItem>
                                <SelectItem value="isEmpty">Is empty</SelectItem>
                                <SelectItem value="isNotEmpty">Is not empty</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="col-span-3">
                            {!['isEmpty', 'isNotEmpty'].includes(filter.operator) && (
                              <Input
                                placeholder="Value"
                                value={typeof filter.value === 'string' ? filter.value : Array.isArray(filter.value) ? filter.value.join(', ') : filter.value}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleValueChange(filter.id, e.target.value)}
                              />
                            )}
                          </div>
                          
                          <div className="col-span-1 flex items-center justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFilter(filter.id)}
                              className="h-8 w-8 text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Button variant="outline" size="sm" onClick={addFilter}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Condition
                    </Button>
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="json" className="py-4">
                <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-auto max-h-[300px]">
                  {getJsonView()}
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 flex justify-between items-center">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <History className="h-4 w-4 mr-1" />
                  History
                </Button>
                <Button size="sm" variant="outline">
                  <Code className="h-4 w-4 mr-1" />
                  Test
                </Button>
              </div>
              <div className="space-x-2">
                {filterConditions.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearAllFilters}>
                    Clear All
                  </Button>
                )}
                <Button onClick={() => setIsOpen(false)}>Apply</Button>
              </div>
            </div>
            
            <div className="mt-4 border-t pt-4">
              {showSaveDialog ? (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Save this filter</h3>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Filter name" 
                      value={filterName} 
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setFilterName(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleSaveFilter} disabled={!filterName.trim()}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowSaveDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Save this filter for later use</h3>
                  <Button size="sm" variant="outline" onClick={() => setShowSaveDialog(true)}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Active filters display */}
      {filterConditions.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center mt-2">
          {filterConditions.map((filter, index) => (
            <React.Fragment key={filter.id}>
              {index > 0 && (
                <Badge variant="outline" className="bg-muted/50 hover:bg-muted">
                  {filter.logicalOperator}
                </Badge>
              )}
              <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
                {getFilterDisplay(filter)}
                <button 
                  onClick={() => removeFilter(filter.id)} 
                  className="ml-1 rounded-full hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </React.Fragment>
          ))}
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={clearAllFilters}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
} 