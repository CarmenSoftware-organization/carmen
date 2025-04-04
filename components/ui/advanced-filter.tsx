"use client"

import { useState, useEffect, useCallback } from 'react'
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { FilterType, SavedFilter, saveFilter, getSavedFilters } from '@/lib/utils/filter-storage'

interface AdvancedFilterProps<T> {
  moduleName: string;
  onApplyFilters: (filters: FilterType<T>[]) => void;
  onClearFilters: () => void;
  filterFields?: { value: keyof T; label: string }[];
}

export function AdvancedFilter<T>({ moduleName }: AdvancedFilterProps<T>) {
  const [activeFilters] = useState<FilterType<T>[]>([])
  const [savedFilters, setSavedFilters] = useState<SavedFilter<T>[]>([])

  const loadSavedFilters = useCallback(async () => {
    try {
      const filters = await getSavedFilters<T>(moduleName)
      setSavedFilters(filters)
    } catch (error) {
      console.error('Error loading filters:', error)
      toast({
        title: "Error loading filters",
        description: "There was a problem loading your saved filters.",
        variant: "destructive"
      })
    }
  }, [moduleName])

  // Load saved filters on mount
  useEffect(() => {
    loadSavedFilters()
  }, [loadSavedFilters])

  const handleSaveFilter = async () => {
    try {
      const name = prompt('Enter a name for this filter:')
      if (!name) return

      const now = new Date().toISOString()
      const newFilter: SavedFilter<T> = {
        id: Date.now().toString(),
        name,
        filters: activeFilters,
        createdAt: now,
        updatedAt: now,
        isDefault: false
      }
      
      await saveFilter(moduleName, newFilter)
      setSavedFilters([...savedFilters, newFilter])
      
      toast({
        title: "Filter saved",
        description: "Your filter has been saved successfully."
      })
    } catch (error) {
      console.error('Error saving filter:', error)
      toast({
        title: "Error saving filter",
        description: "There was a problem saving your filter.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Button onClick={handleSaveFilter} className="h-8">
        <Filter className="mr-2 h-4 w-4" />
        <span>Filter</span>
      </Button>
    </div>
  )
}
