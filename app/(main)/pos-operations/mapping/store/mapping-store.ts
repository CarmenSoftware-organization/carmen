import { create } from 'zustand'
import { mockRecipes } from '@/app/data/mock-recipes'
import { RowSelectionState } from '@tanstack/react-table'
import { mockUnmappedItems, mockMappedItems } from '@/app/data/mock-items'
import { produce } from 'immer'

export interface RecipeComponent {
  id: string
  name: string
  sku: string
  unit: string
  costPerUnit: number
  quantity: number
}

export interface MappingItem {
  id: string
  name: string
  sku: string
  lastSale: string
  saleFrequency: 'High' | 'Medium' | 'Low' | 'Unknown'
  status: 'mapped' | 'unmapped'
  lastUpdated?: string
  components?: RecipeComponent[]
}

interface MappingFilters {
  status: 'all' | 'mapped' | 'unmapped'
  saleFrequency: 'All' | 'High' | 'Medium' | 'Low'
  lastSale: 'All' | 'Last 7 days' | 'Last 30 days' | 'Last 90 days'
}

interface MappingStore {
  // State
  unmappedItems: MappingItem[]
  mappedItems: MappingItem[]
  filteredUnmappedItems: MappingItem[]
  filteredMappedItems: MappingItem[]
  searchQuery: string
  filters: MappingFilters
  isLoading: boolean
  error: string | null
  rowSelection: RowSelectionState

  // Actions
  setSearchQuery: (query: string) => void
  setFilters: (newFilters: Partial<MappingFilters>) => void
  addMapping: (mapping: MappingItem) => void
  updateMapping: (id: string, mapping: Partial<MappingItem>) => void
  deleteMapping: (id: string) => void
  removeItemsByIds: (idsToRemove: string[]) => void
  setError: (error: string | null) => void
  setLoading: (isLoading: boolean) => void
  setRowSelection: (updater: RowSelectionState | ((prevState: RowSelectionState) => RowSelectionState)) => void
  setUnmappedItems: (items: MappingItem[]) => void
  setMappedItems: (items: MappingItem[]) => void

  // Selectors/Getters (derived state)
  getSelectedUnmappedIds: () => string[]
}

export const useMappingStore = create<MappingStore>()(
  (set, get) => ({
    // Initial state
    unmappedItems: [],
    mappedItems: [],
    filteredUnmappedItems: [],
    filteredMappedItems: [],
    searchQuery: '',
    filters: {
      status: 'unmapped',
      saleFrequency: 'All',
      lastSale: 'All'
    },
    isLoading: false,
    error: null,
    rowSelection: {},

    // Actions
    setSearchQuery: (query) => set(produce((state: MappingStore) => {
      state.searchQuery = query
      applyFiltersAndSearch(state)
    })),
    
    setFilters: (newFilters) => set(produce((state: MappingStore) => {
      state.filters = { ...state.filters, ...newFilters }
      applyFiltersAndSearch(state)
    })),
    
    addMapping: (mapping) => set(produce((state: MappingStore) => {
      if (mapping.status === 'mapped') {
        state.mappedItems.push(mapping)
        state.unmappedItems = state.unmappedItems.filter(item => item.id !== mapping.id)
      } else {
        state.unmappedItems.push(mapping)
        state.mappedItems = state.mappedItems.filter(item => item.id !== mapping.id)
      }
      applyFiltersAndSearch(state)
    })),

    updateMapping: (id, mapping) => set(produce((state: MappingStore) => {
      let itemUpdated = false
      state.mappedItems = state.mappedItems.map(item => {
        if (item.id === id) {
          itemUpdated = true
          return { ...item, ...mapping }
        }
        return item
      })
      state.unmappedItems = state.unmappedItems.map(item => {
        if (item.id === id) {
          itemUpdated = true
          return { ...item, ...mapping }
        }
        return item
      })
      if (itemUpdated) applyFiltersAndSearch(state)
    })),

    deleteMapping: (id) => set(produce((state: MappingStore) => {
      state.mappedItems = state.mappedItems.filter(item => item.id !== id)
      state.unmappedItems = state.unmappedItems.filter(item => item.id !== id)
      applyFiltersAndSearch(state)
    })),

    removeItemsByIds: (idsToRemove: string[]) => set(produce((state: MappingStore) => {
      const idSet = new Set(idsToRemove)
      state.unmappedItems = state.unmappedItems.filter(item => !idSet.has(item.id))
      state.mappedItems = state.mappedItems.filter(item => !idSet.has(item.id))
      applyFiltersAndSearch(state)
    })),

    setError: (error) => set({ error }),
    
    setLoading: (isLoading) => set({ isLoading }),

    setRowSelection: (updater) => set(produce((state: MappingStore) => {
      state.rowSelection = typeof updater === 'function' ? updater(state.rowSelection) : updater
    })),

    setUnmappedItems: (items) => set(produce((state: MappingStore) => {
      state.unmappedItems = items
      applyFiltersAndSearch(state)
    })),

    setMappedItems: (items) => set(produce((state: MappingStore) => {
      state.mappedItems = items
      applyFiltersAndSearch(state)
    })),

    // Selectors implemented directly in the state object
    getSelectedUnmappedIds: () => {
      const { rowSelection, filteredUnmappedItems } = get()
      const selectedIndices = Object.keys(rowSelection).map(Number)
      
      const selectedIds = selectedIndices
        .map(index => filteredUnmappedItems[index]?.id)
        .filter((id): id is string => !!id)
      
      return selectedIds
    },
  })
)

function applyFiltersAndSearch(state: MappingStore) {
  const { unmappedItems, mappedItems, searchQuery, filters } = state
  const query = searchQuery.toLowerCase()

  state.filteredUnmappedItems = unmappedItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query)
    const matchesStatus = filters.status === 'all' || filters.status === 'unmapped'
    const matchesSaleFrequency = filters.saleFrequency === 'All' || filters.saleFrequency === item.saleFrequency
    const matchesLastSale = filters.lastSale === 'All' || filters.lastSale === item.lastSale
    return matchesSearch && matchesStatus && matchesSaleFrequency && matchesLastSale
  })

  state.filteredMappedItems = mappedItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query)
    const matchesStatus = filters.status === 'all' || filters.status === 'mapped'
    const matchesSaleFrequency = filters.saleFrequency === 'All' || filters.saleFrequency === item.saleFrequency
    const matchesLastSale = filters.lastSale === 'All' || filters.lastSale === item.lastSale
    return matchesSearch && matchesStatus && matchesSaleFrequency && matchesLastSale
  })
  
  state.rowSelection = {}
} 