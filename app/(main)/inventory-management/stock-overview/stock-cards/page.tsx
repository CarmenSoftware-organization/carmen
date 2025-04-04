"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ArrowUpDown, 
  Download, 
  FileDown, 
  Filter, 
  Search, 
  SlidersHorizontal 
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatCurrency, formatNumber } from "../inventory-balance/utils"
import { Product } from "../types"

// Generate mock data
const generateMockProducts = (): Product[] => {
  const products: Product[] = []
  const categories = ["Raw Materials", "Packaging", "Finished Goods", "Ingredients", "Supplies"]
  const units = ["kg", "pcs", "box", "liter", "pack"]
  const statuses: ("Active" | "Inactive")[] = ["Active", "Active", "Active", "Active", "Inactive"]
  
  for (let i = 1; i <= 50; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)]
    const unit = units[Math.floor(Math.random() * units.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const currentStock = Math.floor(Math.random() * 1000)
    const minimumStock = Math.floor(Math.random() * 100)
    const maximumStock = minimumStock + Math.floor(Math.random() * 500)
    const averageCost = Math.random() * 100 + 5
    const value = currentStock * averageCost
    
    // Generate a random date within the last 30 days
    const now = new Date()
    const randomDays = Math.floor(Math.random() * 30)
    const lastMovementDate = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]
    
    products.push({
      id: `prod${i}`,
      code: `P-${1000 + i}`,
      name: `Product ${i}`,
      category,
      unit,
      status,
      description: `Description for Product ${i}`,
      lastUpdated: new Date().toISOString().split('T')[0],
      createdAt: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0],
      createdBy: "system",
      currentStock,
      minimumStock,
      maximumStock,
      value,
      averageCost,
      lastMovementDate,
      locationCount: Math.floor(Math.random() * 5) + 1
    })
  }
  
  return products
}

export default function StockCardListPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [sortField, setSortField] = useState("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  
  // Load mock data
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      const data = generateMockProducts()
      setProducts(data)
      setIsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      // Search filter
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !product.code.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // Category filter
      if (categoryFilter !== "all" && product.category !== categoryFilter) {
        return false
      }
      
      // Status filter
      if (statusFilter !== "all" && product.status !== statusFilter) {
        return false
      }
      
      // Stock level filter
      if (stockFilter === "low" && product.currentStock! > product.minimumStock!) {
        return false
      }
      if (stockFilter === "high" && product.currentStock! < product.maximumStock!) {
        return false
      }
      if (stockFilter === "normal" && (product.currentStock! <= product.minimumStock! || product.currentStock! >= product.maximumStock!)) {
        return false
      }
      
      return true
    })
    .sort((a, b) => {
      // Sort by selected field
      let comparison = 0
      
      switch (sortField) {
        case "code":
          comparison = a.code.localeCompare(b.code)
          break
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "category":
          comparison = a.category.localeCompare(b.category)
          break
        case "stock":
          comparison = (a.currentStock || 0) - (b.currentStock || 0)
          break
        case "value":
          comparison = (a.value || 0) - (b.value || 0)
          break
        default:
          comparison = a.name.localeCompare(b.name)
      }
      
      return sortDirection === "asc" ? comparison : -comparison
    })
  
  // Get unique categories for filter
  const categories = Array.from(new Set(products.map(p => p.category)))
  
  // Handle sort change
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }
  
  // Handle row click to navigate to stock card
  const handleRowClick = (productId: string) => {
    router.push(`/inventory-management/stock-overview/stock-card?productId=${productId}`)
  }
  
  // Render stock level badge
  const renderStockLevelBadge = (product: Product) => {
    const currentStock = product.currentStock || 0;
    const minimumStock = product.minimumStock || 0;
    const maximumStock = product.maximumStock || 0;
    
    if (currentStock <= minimumStock) {
      return <Badge variant="destructive">Low</Badge>
    } else if (currentStock >= maximumStock) {
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">High</Badge>
    } else {
      return <Badge variant="outline" className="bg-green-100 text-green-800">Normal</Badge>
    }
  }
  
  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-1" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-10 w-[300px]" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-[120px]" />
                  <Skeleton className="h-10 w-[120px]" />
                </div>
              </div>
              
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock Cards</h1>
          <p className="text-sm text-muted-foreground">
            View and manage inventory items
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 self-end md:self-auto">
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name or code..."
                  className="pl-8 w-full md:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Stock Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="low">Low Stock</SelectItem>
                    <SelectItem value="normal">Normal Stock</SelectItem>
                    <SelectItem value="high">High Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Products Table */}
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/75">
                      <TableHead 
                        className="py-3 font-medium text-gray-600 cursor-pointer"
                        onClick={() => handleSort("code")}
                      >
                        <div className="flex items-center">
                          Code
                          {sortField === "code" && (
                            <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="py-3 font-medium text-gray-600 cursor-pointer"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center">
                          Name
                          {sortField === "name" && (
                            <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="py-3 font-medium text-gray-600 cursor-pointer"
                        onClick={() => handleSort("category")}
                      >
                        <div className="flex items-center">
                          Category
                          {sortField === "category" && (
                            <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="py-3 font-medium text-gray-600">Status</TableHead>
                      <TableHead 
                        className="py-3 font-medium text-gray-600 text-right cursor-pointer"
                        onClick={() => handleSort("stock")}
                      >
                        <div className="flex items-center justify-end">
                          Current Stock
                          {sortField === "stock" && (
                            <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="py-3 font-medium text-gray-600 text-right">Stock Level</TableHead>
                      <TableHead 
                        className="py-3 font-medium text-gray-600 text-right cursor-pointer"
                        onClick={() => handleSort("value")}
                      >
                        <div className="flex items-center justify-end">
                          Value
                          {sortField === "value" && (
                            <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                          )}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No products found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product) => (
                        <TableRow 
                          key={product.id} 
                          className="hover:bg-gray-50/50 cursor-pointer"
                          onClick={() => handleRowClick(product.id)}
                        >
                          <TableCell>{product.code}</TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={product.status === "Active" ? "outline" : "secondary"}
                              className={product.status === "Active" 
                                ? "bg-green-50 text-green-700 border-green-200" 
                                : "bg-gray-100 text-gray-700"
                              }
                            >
                              {product.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(product.currentStock || 0)} {product.unit}
                          </TableCell>
                          <TableCell className="text-right">
                            {renderStockLevelBadge(product)}
                            <div className="mt-1 text-xs text-muted-foreground">
                              {formatNumber(product.minimumStock || 0)} / {formatNumber(product.maximumStock || 0)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(product.value || 0)}
                            <div className="mt-1 text-xs text-muted-foreground">
                              {formatCurrency(product.averageCost || 0)} / {product.unit}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            {/* Summary */}
            <div className="flex justify-between text-sm text-muted-foreground">
              <div>
                Showing {filteredProducts.length} of {products.length} products
              </div>
              <div>
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 