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
  field: keyof T
  operator: FilterOperator
  value: any
  logicalOperator?: LogicalOperator
}

export interface SavedFilter<T> {
  id: string
  name: string
  filters: FilterType<T>[]
  isDefault?: boolean
  createdAt: string
  updatedAt: string
}

// Storage key for saved filters
const STORAGE_KEY = 'savedFilters'

// Helper to check if we're in a browser environment
const isBrowser = () => typeof window !== 'undefined'

// Get saved filters from storage
export const getSavedFilters = <T>(): SavedFilter<T>[] => {
  if (!isBrowser()) return []
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : [] as SavedFilter<T>[]
  } catch (error) {
    console.error('Error getting saved filters:', error)
    return []
  }
}

// Save a new filter
export const saveFilter = async <T>(filter: SavedFilter<T>): Promise<void> => {
  if (!isBrowser()) return
  try {
    const now = new Date().toISOString()
    const filterWithTimestamps = {
      ...filter,
      updatedAt: now,
      createdAt: filter.createdAt || now
    }

    const filters = getSavedFilters<T>()
    const existingIndex = filters.findIndex(f => f.id === filter.id)
    
    if (existingIndex >= 0) {
      filters[existingIndex] = filterWithTimestamps
    } else {
      filters.push(filterWithTimestamps)
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
  } catch (error) {
    console.error('Error saving filter:', error)
  }
}

// Delete a filter
export const deleteFilter = async <T>(filterId: string): Promise<void> => {
  if (!isBrowser()) return
  try {
    const filters = getSavedFilters<T>()
    const updatedFilters = filters.filter(f => f.id !== filterId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFilters))
  } catch (error) {
    console.error('Error deleting filter:', error)
  }
}

// Toggle filter star/default status
export const toggleStar = async <T>(filter: SavedFilter<T>): Promise<SavedFilter<T>> => {
  if (!isBrowser()) return filter
  try {
    const filters = getSavedFilters<T>()
    const updatedFilter = { ...filter, isDefault: !filter.isDefault }
    
    // If we're setting this filter as default, unset any other defaults
    if (updatedFilter.isDefault) {
      filters.forEach(f => {
        if (f.id !== filter.id && f.isDefault) {
          f.isDefault = false
        }
      })
    }
    
    await saveFilter(updatedFilter)
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
