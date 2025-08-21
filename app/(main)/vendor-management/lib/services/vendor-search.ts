// Vendor Search and Filtering Service - Phase 1 Task 2
// Implements advanced search and filtering capabilities for vendors

import { 
  Vendor, 
  VendorFilters, 
  VendorMetrics,
  ApiResponse,
  PaginatedResponse
} from '../../types'
import { vendorApi } from '../api'

// Search configuration interface
export interface SearchConfig {
  fuzzySearch: boolean
  maxResults: number
  searchTimeout: number
  cacheResults: boolean
  highlightMatches: boolean
  searchFields: string[]
  weights: Record<string, number>
  minSearchLength: number
}

// Advanced filter options
export interface AdvancedFilterOptions {
  dateRange?: {
    field: 'createdAt' | 'updatedAt'
    start: Date
    end: Date
  }
  performanceMetrics?: {
    responseRate?: { min?: number; max?: number }
    qualityScore?: { min?: number; max?: number }
    deliveryRate?: { min?: number; max?: number }
    totalCampaigns?: { min?: number; max?: number }
  }
  customFields?: Record<string, any>
  tags?: string[]
  location?: {
    country?: string
    state?: string
    city?: string
    radius?: number
    coordinates?: { lat: number; lng: number }
  }
  businessType?: string[]
  certifications?: string[]
  languages?: string[]
}

// Search result interface
export interface SearchResult<T = Vendor> {
  item: T
  score: number
  highlights: Record<string, string[]>
  matchedFields: string[]
  rank: number
}

// Saved search interface
export interface SavedSearch {
  id: string
  name: string
  description?: string
  query: string
  filters: VendorFilters
  advancedFilters: AdvancedFilterOptions
  sortBy: string
  sortOrder: 'asc' | 'desc'
  createdAt: Date
  updatedAt: Date
  createdBy: string
  isDefault: boolean
  isPublic: boolean
}

// Filter preset interface
export interface FilterPreset {
  id: string
  name: string
  description: string
  filters: VendorFilters
  advancedFilters: AdvancedFilterOptions
  category: 'performance' | 'location' | 'business' | 'custom'
  isDefault: boolean
  icon?: string
  color?: string
}

// Default search configuration
const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  fuzzySearch: true,
  maxResults: 50,
  searchTimeout: 5000,
  cacheResults: true,
  highlightMatches: true,
  searchFields: ['name', 'contactEmail', 'address.city', 'address.country', 'businessType'],
  weights: {
    name: 2.0,
    contactEmail: 1.5,
    businessType: 1.0,
    'address.city': 0.8,
    'address.country': 0.6
  },
  minSearchLength: 2
}

// Predefined filter presets
const DEFAULT_FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'active-vendors',
    name: 'Active Vendors',
    description: 'All active vendors',
    filters: { status: ['active'] },
    advancedFilters: {},
    category: 'performance',
    isDefault: true,
    icon: 'CheckCircle',
    color: 'green'
  },
  {
    id: 'high-performers',
    name: 'High Performers',
    description: 'Vendors with high performance metrics',
    filters: { status: ['active'] },
    advancedFilters: {
      performanceMetrics: {
        responseRate: { min: 80 },
        qualityScore: { min: 85 },
        deliveryRate: { min: 90 }
      }
    },
    category: 'performance',
    isDefault: true,
    icon: 'Star',
    color: 'blue'
  },
  {
    id: 'new-vendors',
    name: 'New Vendors',
    description: 'Vendors created in the last 30 days',
    filters: { status: ['active'] },
    advancedFilters: {
      dateRange: {
        field: 'createdAt',
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      }
    },
    category: 'business',
    isDefault: true,
    icon: 'Plus',
    color: 'purple'
  },
  {
    id: 'us-vendors',
    name: 'US Vendors',
    description: 'Vendors located in the United States',
    filters: { status: ['active'] },
    advancedFilters: {
      location: { country: 'United States' }
    },
    category: 'location',
    isDefault: true,
    icon: 'MapPin',
    color: 'red'
  }
]

// Main search service class
export class VendorSearchService {
  private config: SearchConfig
  private searchCache: Map<string, { results: SearchResult[]; timestamp: number }> = new Map()
  private filterPresets: FilterPreset[] = DEFAULT_FILTER_PRESETS
  private savedSearches: SavedSearch[] = []

  constructor(config: Partial<SearchConfig> = {}) {
    this.config = { ...DEFAULT_SEARCH_CONFIG, ...config }
  }

  // Full-text search with advanced options
  async searchVendors(
    query: string,
    filters: VendorFilters = {},
    advancedFilters: AdvancedFilterOptions = {},
    options: {
      page?: number
      limit?: number
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
      includeInactive?: boolean
    } = {}
  ): Promise<ApiResponse<{ results: SearchResult[]; total: number; page: number }>> {
    try {
      // Validate search query
      if (!query || query.trim().length < this.config.minSearchLength) {
        return {
          success: false,
          error: {
            code: 'INVALID_SEARCH_QUERY',
            message: `Search query must be at least ${this.config.minSearchLength} characters long`,
            details: { query, minLength: this.config.minSearchLength }
          }
        }
      }

      const sanitizedQuery = query.trim()
      
      // Check cache first
      const cacheKey = this.generateCacheKey(sanitizedQuery, filters, advancedFilters, options)
      if (this.config.cacheResults && this.searchCache.has(cacheKey)) {
        const cached = this.searchCache.get(cacheKey)!
        if (Date.now() - cached.timestamp < 300000) { // 5 minutes cache
          return {
            success: true,
            data: {
              results: cached.results,
              total: cached.results.length,
              page: options.page || 1
            }
          }
        }
      }

      // Perform search
      const searchResults = await this.performSearch(sanitizedQuery, filters, advancedFilters, options)
      
      // Cache results
      if (this.config.cacheResults && searchResults.success && searchResults.data) {
        this.searchCache.set(cacheKey, {
          results: searchResults.data.results,
          timestamp: Date.now()
        })
      }

      return searchResults
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: error instanceof Error ? error.message : 'Search failed',
          details: { query, filters, advancedFilters, options }
        }
      }
    }
  }

  // Apply filters to vendor list
  async filterVendors(
    filters: VendorFilters,
    advancedFilters: AdvancedFilterOptions = {},
    options: {
      page?: number
      limit?: number
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    } = {}
  ): Promise<ApiResponse<PaginatedResponse<Vendor>>> {
    try {
      const { page = 1, limit = 20, sortBy = 'name', sortOrder = 'asc' } = options

      // Get filtered vendors from API
      const apiResult = await vendorApi.list(filters, page, limit)
      
      if (!apiResult.success || !apiResult.data) {
        return apiResult
      }

      // Apply advanced filters
      let filteredVendors = apiResult.data.items
      if (Object.keys(advancedFilters).length > 0) {
        filteredVendors = this.applyAdvancedFilters(filteredVendors, advancedFilters)
      }

      // Apply sorting
      filteredVendors = this.sortVendors(filteredVendors, sortBy, sortOrder)

      return {
        success: true,
        data: {
          items: filteredVendors,
          total: filteredVendors.length,
          page,
          limit,
          hasMore: filteredVendors.length === limit
        }
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FILTER_ERROR',
          message: error instanceof Error ? error.message : 'Filtering failed',
          details: { filters, advancedFilters, options }
        }
      }
    }
  }

  // Get suggestions for search autocomplete
  async getSearchSuggestions(
    query: string,
    limit: number = 10
  ): Promise<ApiResponse<{ suggestions: string[]; categories: Record<string, string[]> }>> {
    try {
      if (!query || query.length < 2) {
        return {
          success: true,
          data: { suggestions: [], categories: {} }
        }
      }

      // Get vendors matching the query
      const searchResult = await vendorApi.search(query, limit * 2)
      
      if (!searchResult.success || !searchResult.data) {
        return {
          success: true,
          data: { suggestions: [], categories: {} }
        }
      }

      const suggestions: string[] = []
      const categories: Record<string, string[]> = {
        companies: [],
        locations: [],
        businessTypes: []
      }

      // Extract suggestions from search results
      for (const vendor of searchResult.data.slice(0, limit)) {
        // Company names
        if (vendor.name.toLowerCase().includes(query.toLowerCase())) {
          suggestions.push(vendor.name)
          categories.companies.push(vendor.name)
        }

        // Locations
        if (vendor.address) {
          const city = vendor.address.city
          const country = vendor.address.country
          
          if (city.toLowerCase().includes(query.toLowerCase())) {
            suggestions.push(city)
            categories.locations.push(city)
          }
          
          if (country.toLowerCase().includes(query.toLowerCase())) {
            suggestions.push(country)
            categories.locations.push(country)
          }
        }

        // Business types
        if (vendor.businessType && vendor.businessType.toLowerCase().includes(query.toLowerCase())) {
          suggestions.push(vendor.businessType)
          categories.businessTypes.push(vendor.businessType)
        }
      }

      // Remove duplicates and limit results
      const uniqueSuggestions = [...new Set(suggestions)].slice(0, limit)
      
      // Remove duplicates from categories
      Object.keys(categories).forEach(key => {
        categories[key] = [...new Set(categories[key])].slice(0, 5)
      })

      return {
        success: true,
        data: {
          suggestions: uniqueSuggestions,
          categories
        }
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SUGGESTION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get suggestions',
          details: { query, limit }
        }
      }
    }
  }

  // Save search for future use
  async saveSearch(
    name: string,
    query: string,
    filters: VendorFilters,
    advancedFilters: AdvancedFilterOptions,
    options: {
      description?: string
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
      isDefault?: boolean
      isPublic?: boolean
    } = {},
    userId: string
  ): Promise<ApiResponse<SavedSearch>> {
    try {
      const savedSearch: SavedSearch = {
        id: this.generateId(),
        name,
        description: options.description,
        query,
        filters,
        advancedFilters,
        sortBy: options.sortBy || 'name',
        sortOrder: options.sortOrder || 'asc',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
        isDefault: options.isDefault || false,
        isPublic: options.isPublic || false
      }

      this.savedSearches.push(savedSearch)

      return {
        success: true,
        data: savedSearch
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SAVE_SEARCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to save search',
          details: { name, query, filters, advancedFilters, options }
        }
      }
    }
  }

  // Get saved searches
  async getSavedSearches(userId: string): Promise<ApiResponse<SavedSearch[]>> {
    try {
      const userSearches = this.savedSearches.filter(search => 
        search.createdBy === userId || search.isPublic
      )

      return {
        success: true,
        data: userSearches
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_SAVED_SEARCHES_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get saved searches',
          details: { userId }
        }
      }
    }
  }

  // Delete saved search
  async deleteSavedSearch(id: string, userId: string): Promise<ApiResponse<void>> {
    try {
      const index = this.savedSearches.findIndex(search => 
        search.id === id && search.createdBy === userId
      )

      if (index === -1) {
        return {
          success: false,
          error: {
            code: 'SEARCH_NOT_FOUND',
            message: 'Saved search not found or access denied',
            details: { id, userId }
          }
        }
      }

      this.savedSearches.splice(index, 1)

      return {
        success: true,
        data: undefined
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DELETE_SEARCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete saved search',
          details: { id, userId }
        }
      }
    }
  }

  // Get filter presets
  getFilterPresets(): FilterPreset[] {
    return this.filterPresets
  }

  // Add custom filter preset
  addFilterPreset(preset: Omit<FilterPreset, 'id'>): FilterPreset {
    const newPreset: FilterPreset = {
      id: this.generateId(),
      ...preset
    }

    this.filterPresets.push(newPreset)
    return newPreset
  }

  // Apply filter preset
  async applyFilterPreset(
    presetId: string,
    options: {
      page?: number
      limit?: number
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    } = {}
  ): Promise<ApiResponse<PaginatedResponse<Vendor>>> {
    try {
      const preset = this.filterPresets.find(p => p.id === presetId)
      if (!preset) {
        return {
          success: false,
          error: {
            code: 'PRESET_NOT_FOUND',
            message: 'Filter preset not found',
            details: { presetId }
          }
        }
      }

      return await this.filterVendors(preset.filters, preset.advancedFilters, options)
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'APPLY_PRESET_ERROR',
          message: error instanceof Error ? error.message : 'Failed to apply filter preset',
          details: { presetId, options }
        }
      }
    }
  }

  // Private helper methods

  // Perform the actual search operation
  private async performSearch(
    query: string,
    filters: VendorFilters,
    advancedFilters: AdvancedFilterOptions,
    options: any
  ): Promise<ApiResponse<{ results: SearchResult[]; total: number; page: number }>> {
    // Get vendors from API
    const apiResult = await vendorApi.search(query, this.config.maxResults)
    
    if (!apiResult.success || !apiResult.data) {
      return apiResult as any
    }

    // Apply advanced filters
    let filteredVendors = apiResult.data
    if (Object.keys(advancedFilters).length > 0) {
      filteredVendors = this.applyAdvancedFilters(filteredVendors, advancedFilters)
    }

    // Score and rank results
    const searchResults = this.scoreSearchResults(filteredVendors, query)

    // Sort by relevance score
    searchResults.sort((a, b) => b.score - a.score)

    // Add ranking
    searchResults.forEach((result, index) => {
      result.rank = index + 1
    })

    return {
      success: true,
      data: {
        results: searchResults,
        total: searchResults.length,
        page: options.page || 1
      }
    }
  }

  // Score search results based on relevance
  private scoreSearchResults(vendors: Vendor[], query: string): SearchResult[] {
    const queryLower = query.toLowerCase()
    
    return vendors.map(vendor => {
      let score = 0
      const highlights: Record<string, string[]> = {}
      const matchedFields: string[] = []

      // Score name matches
      if (vendor.name.toLowerCase().includes(queryLower)) {
        const nameScore = this.calculateFieldScore(vendor.name, query, 'name')
        score += nameScore * this.config.weights.name
        matchedFields.push('name')
        highlights.name = this.highlightMatches(vendor.name, query)
      }

      // Score email matches
      if (vendor.contactEmail.toLowerCase().includes(queryLower)) {
        const emailScore = this.calculateFieldScore(vendor.contactEmail, query, 'contactEmail')
        score += emailScore * this.config.weights.contactEmail
        matchedFields.push('contactEmail')
        highlights.contactEmail = this.highlightMatches(vendor.contactEmail, query)
      }

      // Score address matches
      if (vendor.address) {
        const addressFields = ['city', 'country', 'state']
        for (const field of addressFields) {
          const fieldValue = vendor.address[field as keyof typeof vendor.address]
          if (fieldValue && fieldValue.toLowerCase().includes(queryLower)) {
            const fieldScore = this.calculateFieldScore(fieldValue, query, `address.${field}`)
            score += fieldScore * (this.config.weights[`address.${field}`] || 0.5)
            matchedFields.push(`address.${field}`)
            highlights[`address.${field}`] = this.highlightMatches(fieldValue, query)
          }
        }
      }

      // Score business type matches
      if (vendor.businessType && vendor.businessType.toLowerCase().includes(queryLower)) {
        const businessTypeScore = this.calculateFieldScore(vendor.businessType, query, 'businessType')
        score += businessTypeScore * this.config.weights.businessType
        matchedFields.push('businessType')
        highlights.businessType = this.highlightMatches(vendor.businessType, query)
      }

      return {
        item: vendor,
        score,
        highlights,
        matchedFields,
        rank: 0 // Will be set later
      }
    })
  }

  // Calculate field-specific score
  private calculateFieldScore(fieldValue: string, query: string, fieldName: string): number {
    const valueLower = fieldValue.toLowerCase()
    const queryLower = query.toLowerCase()

    // Exact match gets highest score
    if (valueLower === queryLower) {
      return 100
    }

    // Starts with query gets high score
    if (valueLower.startsWith(queryLower)) {
      return 80
    }

    // Contains query gets medium score
    if (valueLower.includes(queryLower)) {
      return 60
    }

    // Fuzzy match gets lower score
    if (this.config.fuzzySearch) {
      const fuzzyScore = this.calculateFuzzyScore(valueLower, queryLower)
      return fuzzyScore * 40
    }

    return 0
  }

  // Calculate fuzzy matching score
  private calculateFuzzyScore(str1: string, str2: string): number {
    if (str1.length === 0) return str2.length === 0 ? 1 : 0
    if (str2.length === 0) return 0

    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[j][i] = matrix[j - 1][i - 1]
        } else {
          matrix[j][i] = Math.min(
            matrix[j - 1][i] + 1,
            matrix[j][i - 1] + 1,
            matrix[j - 1][i - 1] + 1
          )
        }
      }
    }

    const distance = matrix[str2.length][str1.length]
    const maxLength = Math.max(str1.length, str2.length)
    return 1 - (distance / maxLength)
  }

  // Highlight matches in text
  private highlightMatches(text: string, query: string): string[] {
    if (!this.config.highlightMatches) {
      return [text]
    }

    const queryLower = query.toLowerCase()
    const textLower = text.toLowerCase()
    const highlights: string[] = []

    let lastIndex = 0
    let index = textLower.indexOf(queryLower, lastIndex)

    while (index !== -1) {
      if (index > lastIndex) {
        highlights.push(text.substring(lastIndex, index))
      }
      highlights.push(`<mark>${text.substring(index, index + query.length)}</mark>`)
      lastIndex = index + query.length
      index = textLower.indexOf(queryLower, lastIndex)
    }

    if (lastIndex < text.length) {
      highlights.push(text.substring(lastIndex))
    }

    return highlights
  }

  // Apply advanced filters
  private applyAdvancedFilters(vendors: Vendor[], filters: AdvancedFilterOptions): Vendor[] {
    return vendors.filter(vendor => {
      // Date range filter
      if (filters.dateRange) {
        const fieldValue = vendor[filters.dateRange.field]
        if (fieldValue) {
          const date = new Date(fieldValue)
          if (date < filters.dateRange.start || date > filters.dateRange.end) {
            return false
          }
        }
      }

      // Performance metrics filter
      if (filters.performanceMetrics) {
        const metrics = vendor.performanceMetrics
        
        if (filters.performanceMetrics.responseRate) {
          const { min, max } = filters.performanceMetrics.responseRate
          if (min !== undefined && metrics.responseRate < min) return false
          if (max !== undefined && metrics.responseRate > max) return false
        }

        if (filters.performanceMetrics.qualityScore) {
          const { min, max } = filters.performanceMetrics.qualityScore
          if (min !== undefined && metrics.qualityScore < min) return false
          if (max !== undefined && metrics.qualityScore > max) return false
        }

        if (filters.performanceMetrics.deliveryRate) {
          const { min, max } = filters.performanceMetrics.deliveryRate
          if (min !== undefined && metrics.onTimeDeliveryRate < min) return false
          if (max !== undefined && metrics.onTimeDeliveryRate > max) return false
        }

        if (filters.performanceMetrics.totalCampaigns) {
          const { min, max } = filters.performanceMetrics.totalCampaigns
          if (min !== undefined && metrics.totalCampaigns < min) return false
          if (max !== undefined && metrics.totalCampaigns > max) return false
        }
      }

      // Location filter
      if (filters.location) {
        const address = vendor.address
        if (!address) return false

        if (filters.location.country && address.country !== filters.location.country) {
          return false
        }

        if (filters.location.state && address.state !== filters.location.state) {
          return false
        }

        if (filters.location.city && address.city !== filters.location.city) {
          return false
        }
      }

      // Business type filter
      if (filters.businessType && filters.businessType.length > 0) {
        if (!vendor.businessType || !filters.businessType.includes(vendor.businessType)) {
          return false
        }
      }

      // Certifications filter
      if (filters.certifications && filters.certifications.length > 0) {
        if (!vendor.certifications || !filters.certifications.some(cert => 
          vendor.certifications!.includes(cert)
        )) {
          return false
        }
      }

      // Languages filter
      if (filters.languages && filters.languages.length > 0) {
        if (!vendor.languages || !filters.languages.some(lang => 
          vendor.languages!.includes(lang)
        )) {
          return false
        }
      }

      return true
    })
  }

  // Sort vendors
  private sortVendors(vendors: Vendor[], sortBy: string, sortOrder: 'asc' | 'desc'): Vendor[] {
    return vendors.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
        case 'responseRate':
          comparison = a.performanceMetrics.responseRate - b.performanceMetrics.responseRate
          break
        case 'qualityScore':
          comparison = a.performanceMetrics.qualityScore - b.performanceMetrics.qualityScore
          break
        case 'deliveryRate':
          comparison = a.performanceMetrics.onTimeDeliveryRate - b.performanceMetrics.onTimeDeliveryRate
          break
        default:
          comparison = a.name.localeCompare(b.name)
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })
  }

  // Generate cache key
  private generateCacheKey(
    query: string,
    filters: VendorFilters,
    advancedFilters: AdvancedFilterOptions,
    options: any
  ): string {
    return btoa(JSON.stringify({ query, filters, advancedFilters, options }))
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  }

  // Clear search cache
  clearCache(): void {
    this.searchCache.clear()
  }

  // Update search configuration
  updateConfig(config: Partial<SearchConfig>): void {
    this.config = { ...this.config, ...config }
  }

  // Get search statistics
  getSearchStats(): {
    cacheSize: number
    savedSearches: number
    filterPresets: number
    config: SearchConfig
  } {
    return {
      cacheSize: this.searchCache.size,
      savedSearches: this.savedSearches.length,
      filterPresets: this.filterPresets.length,
      config: this.config
    }
  }
}

// Export singleton instance
export const vendorSearchService = new VendorSearchService()
export default vendorSearchService