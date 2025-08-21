'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X } from 'lucide-react'
import { FilterCondition } from '../types/index'

interface FilterBuilderProps {
  filters: FilterCondition[]
  setFilters: React.Dispatch<React.SetStateAction<FilterCondition[]>>
}

export function FilterBuilder({ filters, setFilters }: FilterBuilderProps) {
  const addFilter = () => {
    setFilters([...filters, { field: 'date', operator: 'equals', value: '' }])
  }

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index))
  }

  const updateFilter = (index: number, key: keyof FilterCondition, value: string) => {
    const newFilters = [...filters]
    newFilters[index][key] = value
    setFilters(newFilters)
  }

  return (
    <div className="space-y-4">
      {filters.map((filter, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Select value={filter.field} onValueChange={(value) => updateFilter(index, 'field', value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="refNo">Requisition</SelectItem>
              <SelectItem value="requestTo">Request To</SelectItem>
              <SelectItem value="storeName">Store Name</SelectItem>
              <SelectItem value="description">Description</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="processStatus">Process Status</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filter.operator} onValueChange={(value) => updateFilter(index, 'operator', value)}>
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
            onChange={(e) => updateFilter(index, 'value', e.target.value)}
            placeholder="Enter value"
            className="flex-grow"
          />
          <Button variant="outline" size="icon" onClick={() => removeFilter(index)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button onClick={addFilter}>Add Filter</Button>
    </div>
  )
} 