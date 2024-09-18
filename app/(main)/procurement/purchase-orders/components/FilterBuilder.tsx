import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PlusCircle, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface FilterCondition {
  field: string;
  operator: string;
  value: string;
}

export interface FilterGroup {
  logic: 'AND' | 'OR';
  conditions: FilterCondition[];
}

interface FilterBuilderProps {
  onSave: (filters: FilterGroup[]) => void;
  initialFilters?: FilterGroup[];
  fields: string[];
  isOpen: boolean;
  onClose: () => void;
}

const operators = ['equal', 'not equal', 'contains', 'more than', 'less than', 'more than equal to', 'less than equal to'];

const dateFields = ['PO Date', 'Delivery Date'];
const numericFields = ['Amount', 'Quantity'];

const getFieldType = (field: string): 'text' | 'date' | 'number' => {
  if (dateFields.includes(field)) return 'date';
  if (numericFields.includes(field)) return 'number';
  return 'text';
};

const getInputType = (field: string, operator: string): 'text' | 'date' | 'number' => {
  const fieldType = getFieldType(field);
  if (fieldType === 'date' && operator !== 'contains') return 'date';
  if (fieldType === 'number' && operator !== 'contains') return 'number';
  return 'text';
};

export function FilterBuilder({ onSave, initialFilters = [], fields, isOpen, onClose }: FilterBuilderProps) {
  // Ensure fields is an array, even if it's not provided
  const safeFields = Array.isArray(fields) ? fields : [];
  const [filters, setFilters] = useState<FilterGroup[]>(initialFilters.length > 0 ? initialFilters : [{ logic: 'AND', conditions: [{ field: '', operator: '', value: '' }] }]);

  const addCondition = (groupIndex: number) => {
    const newFilters = [...filters];
    newFilters[groupIndex].conditions.push({ field: '', operator: '', value: '' });
    setFilters(newFilters);
  };

  const removeCondition = (groupIndex: number, conditionIndex: number) => {
    const newFilters = [...filters];
    newFilters[groupIndex].conditions.splice(conditionIndex, 1);
    if (newFilters[groupIndex].conditions.length === 0) {
      newFilters.splice(groupIndex, 1);
    }
    setFilters(newFilters);
  };

  const updateCondition = (groupIndex: number, conditionIndex: number, field: keyof FilterCondition, value: string) => {
    const newFilters = [...filters];
    newFilters[groupIndex].conditions[conditionIndex][field] = value;
    setFilters(newFilters);
  };

  const addGroup = () => {
    setFilters([...filters, { logic: 'AND', conditions: [{ field: '', operator: '', value: '' }] }]);
  };

  const updateGroupLogic = (groupIndex: number, logic: 'AND' | 'OR') => {
    const newFilters = [...filters];
    newFilters[groupIndex].logic = logic;
    setFilters(newFilters);
  };

  const handleSave = () => {
    onSave(filters);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[640px]">
        <SheetHeader>
          <SheetTitle>Build Filter</SheetTitle>
        </SheetHeader>
        <div className="space-y-4">
      {filters.map((group, groupIndex) => (
        <div key={groupIndex} className="border p-4 rounded-md">
          {groupIndex > 0 && (
            <Select
              value={group.logic}
              onValueChange={(value) => updateGroupLogic(groupIndex, value as 'AND' | 'OR')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select logic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">AND</SelectItem>
                <SelectItem value="OR">OR</SelectItem>
              </SelectContent>
            </Select>
          )}
          {group.conditions.map((condition, conditionIndex) => (
            <div key={conditionIndex} className="flex items-center space-x-2 mt-2">
              <Select
                value={condition.field}
                onValueChange={(value) => updateCondition(groupIndex, conditionIndex, 'field', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {safeFields.map((field) => (
                    <SelectItem key={field} value={field}>{field}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={condition.operator}
                onValueChange={(value) => updateCondition(groupIndex, conditionIndex, 'operator', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((operator) => (
                    <SelectItem key={operator} value={operator}>{operator}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getInputType(condition.field, condition.operator) === 'date' ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      {condition.value ? format(new Date(condition.value), 'PP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={condition.value ? new Date(condition.value) : undefined}
                      onSelect={(date) => updateCondition(groupIndex, conditionIndex, 'value', date ? date.toISOString() : '')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <Input
                  type={getInputType(condition.field, condition.operator)}
                  value={condition.value}
                  onChange={(e) => updateCondition(groupIndex, conditionIndex, 'value', e.target.value)}
                  placeholder="Value"
                />
              )}
              <Button variant="ghost" size="icon" onClick={() => removeCondition(groupIndex, conditionIndex)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => addCondition(groupIndex)} className="mt-2">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Condition
          </Button>
        </div>
      ))}
      <Button variant="outline" onClick={addGroup}>Add Group</Button>
          <Button onClick={handleSave}>Save Filters</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
