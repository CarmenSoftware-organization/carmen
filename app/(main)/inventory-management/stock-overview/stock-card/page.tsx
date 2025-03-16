"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Calendar, 
  Edit, 
  FileDown, 
  History, 
  Printer, 
  RefreshCw, 
  Truck 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency, formatDate, formatNumber } from "../inventory-balance/utils"
import { 
  StockCardGeneralInfo,
  StockCardMovementHistory,
  StockCardLotInformation,
  StockCardValuation
} from "./components/index"
import { generateMockStockCardData, StockCardData } from "./index"

export default function StockCardPage() {
  const searchParams = useSearchParams()
  const productId = searchParams.get("productId") || "unknown"
  const [isLoading, setIsLoading] = useState(true)
  const [stockCardData, setStockCardData] = useState<StockCardData | null>(null)

  // Load mock data
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      const data = generateMockStockCardData(productId)
      setStockCardData(data)
      setIsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [productId])

  // Render loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        
        {/* Summary cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Tabs skeleton */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-[400px] w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stockCardData) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Product Not Found</h2>
            <p className="text-muted-foreground">
              The requested product could not be found or has been removed.
            </p>
            <Button asChild>
              <a href="/inventory-management/stock-overview/stock-cards">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Stock Cards
              </a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const { product, summary } = stockCardData

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="p-0">
              <a href="/inventory-management/stock-overview/stock-cards">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Stock Cards
              </a>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
            <Badge 
              variant="outline" 
              className={cn(
                product.status === "Active" 
                  ? "bg-green-50 text-green-700 border-green-200" 
                  : "bg-red-50 text-red-700 border-red-200"
              )}
            >
              {product.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {product.code} • {product.category} • Last updated: {formatDate(product.lastUpdated)}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 self-end md:self-auto">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Current Stock</p>
              <p className="text-2xl font-bold">{formatNumber(summary.currentStock)}</p>
              <p className="text-xs text-muted-foreground">{product.unit}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Current Value</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.currentValue)}</p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(summary.averageCost)} / {product.unit}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Last Movement</p>
              <p className="text-2xl font-bold">{summary.lastMovementDate}</p>
              <div className="flex items-center text-xs text-muted-foreground">
                <History className="h-3 w-3 mr-1" />
                {summary.lastMovementType}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Locations</p>
              <p className="text-2xl font-bold">{summary.locationCount}</p>
              <div className="flex items-center text-xs text-muted-foreground">
                <Truck className="h-3 w-3 mr-1" />
                {summary.primaryLocation}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="general">General Information</TabsTrigger>
              <TabsTrigger value="movement">Movement History</TabsTrigger>
              <TabsTrigger value="lots">Lot Information</TabsTrigger>
              <TabsTrigger value="valuation">Valuation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <StockCardGeneralInfo data={stockCardData} />
            </TabsContent>
            
            <TabsContent value="movement">
              <StockCardMovementHistory data={stockCardData} />
            </TabsContent>
            
            <TabsContent value="lots">
              <StockCardLotInformation data={stockCardData} />
            </TabsContent>
            
            <TabsContent value="valuation">
              <StockCardValuation data={stockCardData} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 