export type FilterOperator = 
  | 'equals' 
  | 'contains' 
  | 'startsWith' 
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'between'
  | 'in'
  | 'notIn'
  | 'isNull'
  | 'isNotNull'

export type LogicalOperator = 'AND' | 'OR'

export interface FilterType<T> {
  field: keyof T | string
  operator: FilterOperator
  value: string | string[]
  logicalOperator?: LogicalOperator
}

export interface SavedFilter<T> {
  id: string
  name: string
  filters: FilterType<T>[]
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

// Storage key for saved filters
const STORAGE_KEY = 'savedFilters'

// Helper to check if we're in a browser environment
const isBrowser = () => typeof window !== 'undefined'

// Get saved filters from storage
export const getSavedFilters = <T>(key: string): SavedFilter<T>[] => {
  if (!isBrowser()) return []
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch (error) {
    console.error('Error loading filters:', error)
    return []
  }
}

// Save a new filter
export const saveFilter = async <T>(key: string, filter: SavedFilter<T>): Promise<void> => {
  if (!isBrowser()) return
  try {
    const filters = getSavedFilters<T>(key)
    const updatedFilters = filters.filter((f: SavedFilter<T>) => f.id !== filter.id)
    updatedFilters.push(filter)
    localStorage.setItem(key, JSON.stringify(updatedFilters))
  } catch (error) {
    console.error('Error saving filter:', error)
  }
}

// Delete a filter
export const deleteFilter = async <T>(key: string, filterId: string): Promise<void> => {
  if (!isBrowser()) return
  try {
    const filters = getSavedFilters<T>(key)
    const updatedFilters = filters.filter((f: SavedFilter<T>) => f.id !== filterId)
    localStorage.setItem(key, JSON.stringify(updatedFilters))
  } catch (error) {
    console.error('Error deleting filter:', error)
  }
}

// Toggle filter star/default status
export const toggleStar = async <T>(key: string, filter: SavedFilter<T>): Promise<SavedFilter<T>> => {
  if (!isBrowser()) return filter
  try {
    const filters = getSavedFilters<T>(key)
    const updatedFilter = { ...filter, isDefault: !filter.isDefault }
    
    // If we're setting this filter as default, unset any other defaults
    if (updatedFilter.isDefault) {
      filters.forEach(f => {
        if (f.id !== filter.id && f.isDefault) {
          f.isDefault = false
        }
      })
    }
    
    await saveFilter(key, updatedFilter)
    return updatedFilter
  } catch (error) {
    console.error('Error toggling star:', error)
    return filter
  }
}

// Export aliases for backward compatibility
export const readSavedFilters = getSavedFilters
export const addSavedFilter = saveFilter
export const deleteSavedFilter = deleteFilter
export const toggleFilterStar = toggleStar

// Type aliases for backward compatibility
export type Filter<T> = FilterType<T>
export type BaseFilter<T> = FilterType<T>
