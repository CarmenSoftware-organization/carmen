'use client'

// VendorSearchBar Component - Phase 1 Task 2
// Advanced search bar with autocomplete and suggestions

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Search, 
  X, 
  Clock, 
  Building, 
  MapPin, 
  Tag, 
  Filter,
  Star,
  History,
  Bookmark,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Vendor, VendorFilters } from '../types'
import { vendorSearchService } from '../lib/services/vendor-search'

interface SearchSuggestion {
  id: string
  text: string
  type: 'company' | 'location' | 'businessType' | 'recent' | 'saved'
  icon: React.ReactNode
  description?: string
  vendor?: Vendor
}

interface VendorSearchBarProps {
  onSearch: (query: string) => void
  onFilterChange?: (filters: VendorFilters) => void
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void
  placeholder?: string
  className?: string
  showRecentSearches?: boolean
  showSavedSearches?: boolean
  showSuggestions?: boolean
  maxSuggestions?: number
  searchDelay?: number
}

export default function VendorSearchBar({
  onSearch,
  onFilterChange,
  onSuggestionSelect,
  placeholder = "Search vendors...",
  className,
  showRecentSearches = true,
  showSavedSearches = true,
  showSuggestions = true,
  maxSuggestions = 10,
  searchDelay = 300
}: VendorSearchBarProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [savedSearches, setSavedSearches] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [activeFilters, setActiveFilters] = useState<VendorFilters>({})
  
  const inputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([])

  // Load saved data on component mount
  useEffect(() => {
    loadRecentSearches()
    loadSavedSearches()
  }, [])

  // Handle search delay
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (query.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(query)
      }, searchDelay)
    } else {
      setSuggestions([])
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query, searchDelay])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, -1))
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            handleSuggestionClick(suggestions[selectedIndex])
          } else if (query.trim()) {
            handleSearch(query)
          }
          break
        case 'Escape':
          setIsOpen(false)
          setSelectedIndex(-1)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, suggestions, query])

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }
  }, [selectedIndex])

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('vendor-recent-searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading recent searches:', error)
      }
    }
  }

  const loadSavedSearches = async () => {
    try {
      // In a real app, this would get the current user ID
      const userId = 'current-user-id'
      const result = await vendorSearchService.getSavedSearches(userId)
      if (result.success && result.data) {
        setSavedSearches(result.data)
      }
    } catch (error) {
      console.error('Error loading saved searches:', error)
    }
  }

  const saveRecentSearch = (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim()
    if (!trimmedQuery) return

    const updated = [
      trimmedQuery,
      ...recentSearches.filter(s => s !== trimmedQuery)
    ].slice(0, 10) // Keep only last 10 searches

    setRecentSearches(updated)
    localStorage.setItem('vendor-recent-searches', JSON.stringify(updated))
  }

  const fetchSuggestions = async (searchQuery: string) => {
    if (!showSuggestions) return

    setIsLoading(true)
    try {
      const result = await vendorSearchService.getSearchSuggestions(searchQuery, maxSuggestions)
      
      if (result.success && result.data) {
        const newSuggestions: SearchSuggestion[] = []

        // Add company suggestions
        result.data.categories.companies?.forEach(company => {
          newSuggestions.push({
            id: `company-${company}`,
            text: company,
            type: 'company',
            icon: <Building className="h-4 w-4" />,
            description: 'Company'
          })
        })

        // Add location suggestions
        result.data.categories.locations?.forEach(location => {
          newSuggestions.push({
            id: `location-${location}`,
            text: location,
            type: 'location',
            icon: <MapPin className="h-4 w-4" />,
            description: 'Location'
          })
        })

        // Add business type suggestions
        result.data.categories.businessTypes?.forEach(businessType => {
          newSuggestions.push({
            id: `businessType-${businessType}`,
            text: businessType,
            type: 'businessType',
            icon: <Tag className="h-4 w-4" />,
            description: 'Business Type'
          })
        })

        setSuggestions(newSuggestions.slice(0, maxSuggestions))
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim()
    if (!trimmedQuery) return

    saveRecentSearch(trimmedQuery)
    onSearch(trimmedQuery)
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text)
    onSuggestionSelect?.(suggestion)
    handleSearch(suggestion.text)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)
    
    if (value.length >= 2) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }

  const handleInputFocus = () => {
    if (query.length >= 2 || showRecentSearches || showSavedSearches) {
      setIsOpen(true)
    }
  }

  const handleInputBlur = () => {
    // Delay closing to allow for suggestion clicks
    setTimeout(() => {
      setIsOpen(false)
      setSelectedIndex(-1)
    }, 200)
  }

  const clearSearch = () => {
    setQuery('')
    setSuggestions([])
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  const removeRecentSearch = (searchQuery: string) => {
    const updated = recentSearches.filter(s => s !== searchQuery)
    setRecentSearches(updated)
    localStorage.setItem('vendor-recent-searches', JSON.stringify(updated))
  }

  const clearAllRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('vendor-recent-searches')
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'company':
        return <Building className="h-4 w-4" />
      case 'location':
        return <MapPin className="h-4 w-4" />
      case 'businessType':
        return <Tag className="h-4 w-4" />
      case 'recent':
        return <Clock className="h-4 w-4" />
      case 'saved':
        return <Bookmark className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const renderSuggestions = () => {
    const allSuggestions: SearchSuggestion[] = []

    // Add current suggestions
    if (suggestions.length > 0) {
      allSuggestions.push(...suggestions)
    }

    // Add recent searches if no query or short query
    if (showRecentSearches && query.length < 2 && recentSearches.length > 0) {
      recentSearches.slice(0, 5).forEach(search => {
        allSuggestions.push({
          id: `recent-${search}`,
          text: search,
          type: 'recent',
          icon: <Clock className="h-4 w-4" />,
          description: 'Recent search'
        })
      })
    }

    // Add saved searches if no query or short query
    if (showSavedSearches && query.length < 2 && savedSearches.length > 0) {
      savedSearches.slice(0, 3).forEach(search => {
        allSuggestions.push({
          id: `saved-${search.id}`,
          text: search.name,
          type: 'saved',
          icon: <Bookmark className="h-4 w-4" />,
          description: search.description || 'Saved search'
        })
      })
    }

    return allSuggestions
  }

  const allSuggestions = renderSuggestions()

  return (
    <div className={cn("relative", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              className="pl-10 pr-10"
              autoComplete="off"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </PopoverTrigger>
        
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandList>
              {isLoading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Loading suggestions...
                </div>
              )}
              
              {!isLoading && allSuggestions.length === 0 && (
                <CommandEmpty>
                  {query.length >= 2 ? 'No suggestions found' : 'Start typing to search vendors'}
                </CommandEmpty>
              )}

              {!isLoading && allSuggestions.length > 0 && (
                <>
                  {suggestions.length > 0 && (
                    <CommandGroup heading="Suggestions">
                      {suggestions.map((suggestion, index) => (
                        <CommandItem
                          key={suggestion.id}
                          ref={el => { suggestionRefs.current[index] = el; }}
                          className={cn(
                            "flex items-center space-x-2 cursor-pointer",
                            selectedIndex === index && "bg-accent"
                          )}
                          onSelect={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion.icon}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{suggestion.text}</div>
                            {suggestion.description && (
                              <div className="text-xs text-muted-foreground truncate">
                                {suggestion.description}
                              </div>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {suggestion.type}
                          </Badge>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {showRecentSearches && query.length < 2 && recentSearches.length > 0 && (
                    <CommandGroup heading="Recent Searches">
                      <div className="flex items-center justify-between px-2 py-1">
                        <span className="text-xs text-muted-foreground">Recent</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllRecentSearches}
                          className="h-6 text-xs"
                        >
                          Clear all
                        </Button>
                      </div>
                      {recentSearches.slice(0, 5).map((search, index) => (
                        <CommandItem
                          key={`recent-${search}`}
                          className="flex items-center space-x-2 cursor-pointer"
                          onSelect={() => handleSuggestionClick({
                            id: `recent-${search}`,
                            text: search,
                            type: 'recent',
                            icon: <Clock className="h-4 w-4" />
                          })}
                        >
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{search}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeRecentSearch(search)
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {showSavedSearches && query.length < 2 && savedSearches.length > 0 && (
                    <CommandGroup heading="Saved Searches">
                      {savedSearches.slice(0, 3).map((search) => (
                        <CommandItem
                          key={`saved-${search.id}`}
                          className="flex items-center space-x-2 cursor-pointer"
                          onSelect={() => handleSuggestionClick({
                            id: `saved-${search.id}`,
                            text: search.name,
                            type: 'saved',
                            icon: <Bookmark className="h-4 w-4" />
                          })}
                        >
                          <Bookmark className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{search.name}</div>
                            {search.description && (
                              <div className="text-xs text-muted-foreground truncate">
                                {search.description}
                              </div>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {search.isPublic ? 'Public' : 'Private'}
                          </Badge>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Active Filters */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value) return null
            
            const filterValue = Array.isArray(value) ? value.join(', ') : String(value)
            return (
              <Badge
                key={key}
                variant="secondary"
                className="flex items-center space-x-1"
              >
                <Filter className="h-3 w-3" />
                <span>{key}: {filterValue}</span>
                <button
                  onClick={() => {
                    const newFilters = { ...activeFilters }
                    delete newFilters[key as keyof VendorFilters]
                    setActiveFilters(newFilters)
                    onFilterChange?.(newFilters)
                  }}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
          {Object.keys(activeFilters).length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActiveFilters({})
                onFilterChange?.({})
              }}
              className="h-6 text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  )
}