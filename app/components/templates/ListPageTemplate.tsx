import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Download, Printer, Search } from 'lucide-react'
import { Card } from '@/components/ui/card'

'use client'


interface ListPageTemplateProps {
  title: string
  onCreateNew?: () => void
  onExport?: () => void
  onPrint?: () => void
  onSearch?: (term: string) => void
  renderFilters?: () => React.ReactNode
  renderBulkActions?: (selectedItems: string[]) => React.ReactNode
  children: React.ReactNode
  createButtonText?: string
  searchPlaceholder?: string
  hideCreate?: boolean
  hideExport?: boolean
  hidePrint?: boolean
  hideSearch?: boolean
  selectedItems?: string[]
}

export function ListPageTemplate({
  title,
  onCreateNew,
  onExport,
  onPrint,
  onSearch,
  renderFilters,
  renderBulkActions,
  children,
  createButtonText = "Create New",
  searchPlaceholder = "Search...",
  hideCreate = false,
  hideExport = false,
  hidePrint = false,
  hideSearch = false,
  selectedItems = [],
}: ListPageTemplateProps) {
  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <div className="flex gap-2">
            {!hideCreate && onCreateNew && (
              <Button onClick={onCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                {createButtonText}
              </Button>
            )}
            {!hideExport && onExport && (
              <Button variant="outline" onClick={onExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            )}
            {!hidePrint && onPrint && (
              <Button variant="outline" onClick={onPrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        {(!hideSearch || renderFilters || renderBulkActions) && (
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1 flex items-center gap-2">
              {!hideSearch && onSearch && (
                <div className="max-w-sm flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={searchPlaceholder}
                      onChange={(e) => onSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              )}
              {renderFilters && renderFilters()}
            </div>
            {renderBulkActions && renderBulkActions(selectedItems)}
          </div>
        )}

        {/* Content */}
        <Card>
          <div className="rounded-lg border bg-white">
            {children}
          </div>
        </Card>
      </div>
    </div>
  )
} 