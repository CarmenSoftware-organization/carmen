import fs from 'fs'
import path from 'path'

export interface Filter<T> {
  field: keyof T
  operator: 'equals' | 'contains' | 'in' | 'between' | 'greaterThan' | 'lessThan'
  value: string | number | string[] | number[] | [number, number]
  logicalOperator?: 'AND' | 'OR'
}

export interface SavedFilter<T> {
  id: number
  name: string
  isStarred: boolean
  filters: Filter<T>[]
}

const FILTERS_FILE = path.join(process.cwd(), 'data', 'saved-filters.json')

// Ensure the data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Initialize filters file if it doesn't exist
const initializeFiltersFile = () => {
  ensureDataDir()
  if (!fs.existsSync(FILTERS_FILE)) {
    fs.writeFileSync(FILTERS_FILE, JSON.stringify([], null, 2))
  }
}

// Read saved filters from file
export const readSavedFilters = <T>(): SavedFilter<T>[] => {
  try {
    initializeFiltersFile()
    const data = fs.readFileSync(FILTERS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading saved filters:', error)
    return []
  }
}

// Write saved filters to file
export const writeSavedFilters = <T>(filters: SavedFilter<T>[]): void => {
  try {
    ensureDataDir()
    fs.writeFileSync(FILTERS_FILE, JSON.stringify(filters, null, 2))
  } catch (error) {
    console.error('Error writing saved filters:', error)
  }
}

// Add a new filter
export const addSavedFilter = <T>(filter: SavedFilter<T>): void => {
  const filters = readSavedFilters<T>()
  filters.push(filter)
  writeSavedFilters(filters)
}

// Update a filter
export const updateSavedFilter = <T>(filter: SavedFilter<T>): void => {
  const filters = readSavedFilters<T>()
  const index = filters.findIndex(f => f.id === filter.id)
  if (index !== -1) {
    filters[index] = filter
    writeSavedFilters(filters)
  }
}

// Delete a filter
export const deleteSavedFilter = <T>(id: number): void => {
  const filters = readSavedFilters<T>()
  const newFilters = filters.filter(f => f.id !== id)
  writeSavedFilters(newFilters)
}

// Toggle star status
export const toggleFilterStar = <T>(id: number): void => {
  const filters = readSavedFilters<T>()
  const index = filters.findIndex(f => f.id === id)
  if (index !== -1) {
    filters[index].isStarred = !filters[index].isStarred
    writeSavedFilters(filters)
  }
} 