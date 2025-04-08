'use client'

import React, { useState } from 'react';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';
import { Dispatch, SetStateAction } from 'react'

const operators = [
  { value: '=', label: 'Equals' },
  { value: '!=', label: 'Not Equals' },
  { value: '>', label: 'Greater Than' },
  { value: '<', label: 'Less Than' },
  { value: '>=', label: 'Greater Than or Equal' },
  { value: '<=', label: 'Less Than or Equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'startsWith', label: 'Starts With' },
  { value: 'endsWith', label: 'Ends With' },
];


interface Filter {
  field: string
  operator: string
  value: string
  conjunction: string
}

interface FilterBuilderProps {
  fields: { value: string, label: string }[]
  onFilterChange: (filters: Filter[]) => void
}

export function FilterBuilder({ fields, onFilterChange }: FilterBuilderProps) {
  const [filters, setFilters]: [Filter[], Dispatch<SetStateAction<Filter[]>>] = useState([{ field: '', operator: '=', value: '', conjunction: 'AND' }])

  const handleFilterChange = (index: number, key: keyof Filter, value: string) => {
    const newFilters = filters.map((filter, i) => 
      i === index ? { ...filter, [key]: value } : filter
    );
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const addFilter = () => {
    setFilters([...filters, { field: '', operator: '=', value: '', conjunction: 'AND' }]);
  };

  const removeFilter = (index: number) => {
    const newFilters = filters.filter((_, i) => i !== index)
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="space-y-4">
      {filters.map((filter, index) => (
        <div key={index} className="flex items-center space-x-2">
          {index > 0 && (
            <Select value={filter.conjunction} onValueChange={(value) => handleFilterChange(index, 'conjunction', value)}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="AND" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">AND</SelectItem>
                <SelectItem value="OR">OR</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Select value={filter.field} onValueChange={(value) => handleFilterChange(index, 'field', value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {fields.map((field) => (
                <SelectItem key={field.value} value={field.value}>{field.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filter.operator} onValueChange={(value) => handleFilterChange(index, 'operator', value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent>
              {operators.map((op) => (
                <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="text"
            value={filter.value}
            onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
            placeholder="Value"
            className="w-[200px]"
          />
          <Button variant="outline" onClick={() => removeFilter(index)}>Remove</Button>
        </div>
      ))}
      <Button onClick={addFilter}>Add Filter</Button>

    </div>


  );
}