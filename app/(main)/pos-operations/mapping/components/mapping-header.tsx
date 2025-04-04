"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface MappingHeaderProps {
  title: string
  addButtonLabel: string
  searchPlaceholder: string
  addRoute: string
  onSearch: (query: string) => void
}

export function MappingHeader({
  title,
  addButtonLabel,
  searchPlaceholder,
  addRoute,
  onSearch,
}: MappingHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    onSearch(value)
  }

  const clearSearch = () => {
    setSearchQuery("")
    onSearch("")
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      
      <div className="flex w-full sm:w-auto gap-2 items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            className="pl-8 pr-8"
            value={searchQuery}
            onChange={handleSearch}
          />
          {searchQuery && (
            <button
              className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </button>
          )}
        </div>
        
        <Button asChild size="sm" className="w-full sm:w-auto">
          <Link href={addRoute}>
            <Plus className="h-4 w-4 mr-1" />
            {addButtonLabel}
          </Link>
        </Button>
      </div>
    </div>
  )
} 