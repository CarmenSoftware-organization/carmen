'use client'

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"
import { MappingList } from "./components/mapping-list"
import { FilterDialog } from "./components/filter-dialog"
import { useMappingStore } from "./store/mapping-store"
import { mockMappedItems, mockUnmappedItems } from '@/app/data/mock-items'

export default function MappingOperationsPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const {
    unmappedItems,
    mappedItems,
    searchQuery,
    filters,
    setSearchQuery,
    setFilters,
    setUnmappedItems,
    setMappedItems,
    isLoading
  } = useMappingStore()

  // Load mock data on initial mount
  useEffect(() => {
    // Check if data is already loaded perhaps, or just load it
    // This simple version always loads it on mount
    console.log("Loading mock data into store...")
    setUnmappedItems(mockUnmappedItems)
    setMappedItems(mockMappedItems)
    console.log("Mock data loaded.")
    // Optionally set initial filter state if needed
    // setFilters({ status: 'unmapped' })
  }, [setUnmappedItems, setMappedItems])

  // Filter items based on search query and filters
  const filteredUnmappedItems = unmappedItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSaleFrequency = filters.saleFrequency === 'All' ||
      item.saleFrequency === filters.saleFrequency

    // Simple date filtering logic - can be enhanced based on requirements
    const matchesLastSale = filters.lastSale === 'All' ||
      (filters.lastSale === 'Last 7 days' && new Date(item.lastSale) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (filters.lastSale === 'Last 30 days' && new Date(item.lastSale) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
      (filters.lastSale === 'Last 90 days' && new Date(item.lastSale) >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))

    return matchesSearch && matchesSaleFrequency && matchesLastSale
  })

  const filteredMappedItems = mappedItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSaleFrequency = filters.saleFrequency === 'All' ||
      item.saleFrequency === filters.saleFrequency

    // Simple date filtering logic - can be enhanced based on requirements
    const matchesLastSale = filters.lastSale === 'All' ||
      (filters.lastSale === 'Last 7 days' && new Date(item.lastSale) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (filters.lastSale === 'Last 30 days' && new Date(item.lastSale) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
      (filters.lastSale === 'Last 90 days' && new Date(item.lastSale) >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))

    return matchesSearch && matchesSaleFrequency && matchesLastSale
  })

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Recipe Mapping</h1>
        <p className="text-muted-foreground">
          Map your POS items to recipes and manage their components
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsFilterOpen(true)}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Card>
        <Tabs defaultValue="unmapped" className="p-4">
          <TabsList className="mb-4">
            <TabsTrigger value="unmapped">
              Unmapped Items ({filteredUnmappedItems.length})
            </TabsTrigger>
            <TabsTrigger value="mapped">
              Mapped Items ({filteredMappedItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unmapped">
            <MappingList items={filteredUnmappedItems} title="unmapped" isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="mapped">
            <MappingList items={filteredMappedItems} title="mapped" isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Filter Dialog */}
      <FilterDialog
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
      />
    </div>
  )
} 