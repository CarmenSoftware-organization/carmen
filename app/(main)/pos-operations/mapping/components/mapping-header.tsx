'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface MappingHeaderProps {
  title: string
  onSearch?: (query: string) => void
  onAdd?: () => void
}

export function MappingHeader({
  title,
  onSearch,
  onAdd,
}: MappingHeaderProps) {
  return (
    <div className="flex items-center justify-between space-x-2">
      <div className="flex items-center space-x-2">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      </div>
      <div className="flex items-center space-x-2">
        {onSearch && (
          <Input
            placeholder="Search..."
            className="h-8 w-[150px] lg:w-[250px]"
            onChange={(e) => onSearch(e.target.value)}
          />
        )}
        {onAdd && (
          <Button onClick={onAdd} size="sm">
            Add New
          </Button>
        )}
      </div>
    </div>
  )
} 