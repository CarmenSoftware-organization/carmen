"use client"

import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList,
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FileUp, FileDown, Plus, Search } from "lucide-react"
import ProductCategoryTree from "./components/category-list"
import { useState, useRef } from "react"
import { AdvancedFilter } from "./components/advanced-filter"

interface FilterType {
  field: string
  operator: string
  value: string | number | boolean | Date | null
  logicalOperator?: 'AND' | 'OR'
}

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([])
  const treeRef = useRef<{ handleAddTopLevel: () => void }>(null)

  const handleAddCategory = () => {
    treeRef.current?.handleAddTopLevel()
  }

  const handleFilterChange = (filters: FilterType[]) => {
    setActiveFilters(filters)
    // TODO: Apply filters to the tree component
  }

  return (
    <div className="container mx-auto py-6 px-9">
      <div className="space-y-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/product-management">Product Management</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink isCurrentPage>
                Categories
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header Section */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Product Categories</h1>
              <p className="text-muted-foreground mt-1">
                Manage your product categories, subcategories, and item groups
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleAddCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
              <Button variant="outline">
                <FileUp className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline">
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex justify-between items-center">
            <div className="relative w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <AdvancedFilter onFilterChange={handleFilterChange} />
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardContent className="p-6">
            <ProductCategoryTree 
              ref={treeRef}
              searchQuery={searchQuery} 
              filters={activeFilters}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 