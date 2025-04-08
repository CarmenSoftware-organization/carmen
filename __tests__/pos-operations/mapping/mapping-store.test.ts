import { renderHook, act } from '@testing-library/react'
import { useMappingStore } from '@/app/(main)/pos-operations/mapping/store/mapping-store'
import type { MappingItem } from '@/app/(main)/pos-operations/mapping/store/mapping-store'

describe('MappingStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useMappingStore())
    act(() => {
      result.current.setSearchQuery('')
      result.current.setFilters({
        saleFrequency: 'All',
        lastSale: 'All'
      })
      result.current.setLoading(false)
      result.current.setError(null)
    })
  })

  describe('Search and Filter Operations', () => {
    it('should update search query', () => {
      const { result } = renderHook(() => useMappingStore())
      const newQuery = 'test query'

      act(() => {
        result.current.setSearchQuery(newQuery)
      })

      expect(result.current.searchQuery).toBe(newQuery)
    })

    it('should update filters', () => {
      const { result } = renderHook(() => useMappingStore())
      const newFilters = {
        saleFrequency: 'High' as const,
        lastSale: 'Last 7 days' as const
      }

      act(() => {
        result.current.setFilters(newFilters)
      })

      expect(result.current.filters).toEqual(newFilters)
    })
  })

  describe('Mapping Operations', () => {
    const mockMapping: MappingItem = {
      id: '1',
      name: 'Test Recipe',
      sku: 'TEST-001',
      lastSale: '2024-03-14',
      saleFrequency: 'High',
      status: 'mapped',
      lastUpdated: '2024-03-10',
      components: [
        {
          id: 'component-1',
          name: 'Component 1',
          sku: 'COMP-001',
          quantity: 100,
          unit: 'g',
          costPerUnit: 1.5
        }
      ]
    }

    it('should add new mapping', () => {
      const { result } = renderHook(() => useMappingStore())
      const initialCount = result.current.mappedItems.length

      act(() => {
        result.current.addMapping(mockMapping)
      })

      expect(result.current.mappedItems).toHaveLength(initialCount + 1)
      expect(result.current.mappedItems).toContainEqual(mockMapping)
    })

    it('should update existing mapping', () => {
      const { result } = renderHook(() => useMappingStore())
      const updatedName = 'Updated Recipe'

      act(() => {
        result.current.addMapping(mockMapping)
        result.current.updateMapping(mockMapping.id, { name: updatedName })
      })

      expect(result.current.mappedItems.find(item => item.id === mockMapping.id)?.name).toBe(updatedName)
    })

    it('should delete mapping', () => {
      const { result } = renderHook(() => useMappingStore())

      act(() => {
        result.current.addMapping(mockMapping)
        result.current.deleteMapping(mockMapping.id)
      })

      expect(result.current.mappedItems).not.toContainEqual(mockMapping)
    })
  })

  describe('Loading and Error States', () => {
    it('should handle loading state', () => {
      const { result } = renderHook(() => useMappingStore())

      act(() => {
        result.current.setLoading(true)
      })

      expect(result.current.isLoading).toBe(true)
    })

    it('should handle error state', () => {
      const { result } = renderHook(() => useMappingStore())
      const error = 'Test error'

      act(() => {
        result.current.setError(error)
      })

      expect(result.current.error).toBe(error)
    })
  })
}) 