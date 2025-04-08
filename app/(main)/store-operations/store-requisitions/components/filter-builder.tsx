"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { FilterCondition } from '../types/index'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type FilterField = 'date' | 'refNo' | 'requestTo' | 'storeName' | 'description' | 'status' | 'processStatus'
type FilterOperator = 'equals' | 'contains' | 'greater_than' | 'less_than'

interface FilterBuilderProps {
  filters: FilterCondition[]
  setFilters: React.Dispatch<React.SetStateAction<FilterCondition[]>>
}

export function FilterBuilder({ filters, setFilters }: FilterBuilderProps): React.ReactNode {
  const addFilter = (): void => {
    setFilters([...filters, { field: 'date', operator: 'equals', value: '' }])
  }

  const removeFilter = (index: number): void => {
    setFilters(filters.filter((_, i) => i !== index))
  }

  const updateFilter = (index: number, key: keyof FilterCondition, value: string): void => {
    const newFilters = [...filters]
    if (key === 'field') {
      newFilters[index][key] = value as FilterField
    } else if (key === 'operator') {
      newFilters[index][key] = value as FilterOperator
    } else {
      newFilters[index][key] = value
    }
    setFilters(newFilters)
  }

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>, index: number): void => {
    updateFilter(index, 'value', e.target.value)
  }

  return (
    <div className="space-y-4">
      {filters.map((filter, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Select 
            value={filter.field} 
            onValueChange={(value: string) => updateFilter(index, 'field', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="refNo">Ref #</SelectItem>
              <SelectItem value="requestTo">Request To</SelectItem>
              <SelectItem value="storeName">Store Name</SelectItem>
              <SelectItem value="description">Description</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="processStatus">Process Status</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={filter.operator} 
            onValueChange={(value: string) => updateFilter(index, 'operator', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equals">Equals</SelectItem>
              <SelectItem value="contains">Contains</SelectItem>
              <SelectItem value="greater_than">Greater than</SelectItem>
              <SelectItem value="less_than">Less than</SelectItem>
            </SelectContent>
          </Select>
          <Input 
            type="text" 
            value={filter.value} 
            onChange={(e) => handleValueChange(e, index)}
            placeholder="Enter value"
            className="flex-grow"
          />
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => removeFilter(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button onClick={addFilter}>Add Filter</Button>
    </div>
  )
} 