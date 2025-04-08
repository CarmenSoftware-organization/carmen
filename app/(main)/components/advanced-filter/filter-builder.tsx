'use client'

import React, { ChangeEvent } from 'react';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check, ChevronsUpDown, GripVertical, Plus, X } from "lucide-react";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Button,
  Checkbox,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui";

// Types
export type FilterFieldType = 'text' | 'number' | 'date' | 'boolean' | 'dropdown' | 'lookup' | 'enum';

export type FilterValue = string | number | boolean | Date | null;

export type FilterOperator = 
  | 'equals' 
  | 'notEquals'
  | 'contains' 
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'between'
  | 'in'
  | 'notIn'
  | 'isNull'
  | 'isNotNull';

export interface FilterOption {
  label: string;
  value: FilterValue;
}

export interface FilterFieldConfig {
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  dateFormat?: string;
}

export interface FilterCondition {
  id: string;
  fieldName: string;
  fieldType: FilterFieldType;
  operator: FilterOperator;
  value: FilterValue;
  group?: string;
  logicalOperator?: 'AND' | 'OR';
}

interface FilterBuilderProps {
  conditions: FilterCondition[];
  fields: Array<{
    name: string;
    label: string;
    type: FilterFieldType;
    config?: FilterFieldConfig;
  }>;
  onChange: (conditions: FilterCondition[]) => void;
  onAddCondition: () => void;
  className?: string;
}

// Dynamic Value Field Component
const ValueField: React.FC<{
  fieldType: FilterFieldType;
  value: FilterValue;
  config?: FilterFieldConfig;
  onChange: (value: FilterValue) => void;
}> = ({ fieldType, value, config, onChange }) => {
  switch (fieldType) {
    case 'date':
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !value && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value instanceof Date ? format(value, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value instanceof Date ? value : undefined}
              onSelect={(day: Date | undefined) => {
                onChange(day || null);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      );

    case 'boolean':
      return (
        <Checkbox
          checked={typeof value === 'boolean' ? value : false}
          onCheckedChange={onChange}
        />
      );

    case 'enum':
    case 'dropdown':
      return (
        <Select 
          value={value?.toString() || ''} 
          onValueChange={(val: string) => onChange(val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            {config?.options?.map((option) => (
              <SelectItem key={option.value?.toString()} value={option.value?.toString() || ''}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 'lookup':
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between"
            >
              {value
                ? config?.options?.find((option) => option.value === value)?.label
                : "Select option..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search options..." />
              <CommandEmpty>No option found.</CommandEmpty>
              <CommandGroup>
                {config?.options?.map((option) => (
                  <CommandItem
                    key={option.value?.toString()}
                    onSelect={() => onChange(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      );

    case 'number':
      return (
        <Input
          type="number"
          value={typeof value === 'number' ? value : ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value === '' ? null : parseFloat(e.target.value);
            onChange(val);
          }}
          className="w-full"
          min={config?.min}
          max={config?.max}
          step={config?.step}
        />
      );

    default:
      return (
        <Input
          type="text"
          value={typeof value === 'string' ? value : ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          className="w-full"
          placeholder={config?.placeholder}
        />
      );
  }
};

// Operator options based on field type
const getOperatorOptions = (fieldType: FilterFieldType) => {
  switch (fieldType) {
    case 'text':
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'contains', label: 'Contains' },
        { value: 'startsWith', label: 'Starts with' },
        { value: 'endsWith', label: 'Ends with' },
      ];
    case 'number':
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'greaterThan', label: 'Greater than' },
        { value: 'lessThan', label: 'Less than' },
        { value: 'between', label: 'Between' },
      ];
    case 'date':
      return [
        { value: 'equals', label: 'On' },
        { value: 'greaterThan', label: 'After' },
        { value: 'lessThan', label: 'Before' },
        { value: 'between', label: 'Between' },
      ];
    case 'boolean':
      return [
        { value: 'equals', label: 'Is' },
      ];
    default:
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'notEquals', label: 'Not equals' },
      ];
  }
};

export const FilterBuilder: React.FC<FilterBuilderProps> = ({
  conditions,
  fields,
  onChange,
  onAddCondition,
  className,
}) => {
  const handleDragEnd = (result: DropResult): void => {
    if (!result.destination) return;

    const items = Array.from(conditions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange(items);
  };

  const handleFieldChange = (index: number, fieldName: string): void => {
    const field = fields.find(f => f.name === fieldName);
    if (!field) return;

    const newConditions = [...conditions];
    newConditions[index] = {
      ...newConditions[index],
      fieldName,
      fieldType: field.type,
      operator: getOperatorOptions(field.type)[0].value as FilterOperator,
      value: null,
    };
    onChange(newConditions);
  };

  const handleOperatorChange = (index: number, operator: FilterOperator): void => {
    const newConditions = [...conditions];
    newConditions[index] = {
      ...newConditions[index],
      operator,
    };
    onChange(newConditions);
  };

  const handleValueChange = (index: number, value: FilterValue): void => {
    const newConditions = [...conditions];
    newConditions[index] = {
      ...newConditions[index],
      value,
    };
    onChange(newConditions);
  };

  const handleRemoveCondition = (index: number): void => {
    const newConditions = conditions.filter((_, i) => i !== index);
    onChange(newConditions);
  };

  const handleLogicalOperatorChange = (index: number, value: 'AND' | 'OR'): void => {
    const newConditions = [...conditions];
    newConditions[index] = {
      ...newConditions[index],
      logicalOperator: value,
    };
    onChange(newConditions);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="filter-conditions">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {conditions.map((condition, index) => (
                <Draggable
                  key={condition.id}
                  draggableId={condition.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center gap-2 bg-white p-2 rounded-lg border"
                    >
                      <div {...provided.dragHandleProps}>
                        <GripVertical className="h-5 w-5 text-gray-400" />
                      </div>

                      {index > 0 && (
                        <Select
                          value={condition.logicalOperator || 'AND'}
                          onValueChange={(value: 'AND' | 'OR') => 
                            handleLogicalOperatorChange(index, value)
                          }
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

                      <Select
                        value={condition.fieldName}
                        onValueChange={(value: string) => handleFieldChange(index, value)}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {fields.map((field) => (
                            <SelectItem key={field.name} value={field.name}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={condition.operator}
                        onValueChange={(value: FilterOperator) => 
                          handleOperatorChange(index, value)
                        }
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Select operator" />
                        </SelectTrigger>
                        <SelectContent>
                          {getOperatorOptions(condition.fieldType).map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex-1">
                        <ValueField
                          fieldType={condition.fieldType}
                          value={condition.value}
                          config={fields.find(f => f.name === condition.fieldName)?.config}
                          onChange={(value) => handleValueChange(index, value)}
                        />
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCondition(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Button
        variant="outline"
        size="sm"
        onClick={onAddCondition}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Condition
      </Button>
    </div>
  );
};

export default FilterBuilder; 