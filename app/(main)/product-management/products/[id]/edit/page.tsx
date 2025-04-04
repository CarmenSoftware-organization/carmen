"use client"

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronLeft, Save } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

// Mock data (replace with actual data fetching)
const productList = [
  {
    id: 'PRD001',
    name: 'Sample Product',
    productCode: 'PRD001',
    description: 'A sample product description',
    category: 'General',
    isActive: true,
  }
]

interface Product {
  id: string
  name: string
  productCode: string
  description: string
  category: string
  isActive: boolean
  image?: string
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulating API call
    const fetchedProduct = productList.find(p => p.id === params.id)
    if (fetchedProduct) {
      setProduct(fetchedProduct)
    }
    setIsLoading(false)
  }, [params.id])

  const handleSave = () => {
    try {
      // Save logic here
      toast({
        title: "Changes saved",
        description: "Your changes have been saved successfully."
      })
      router.push(`/product-management/products/${params.id}`)
    } catch (err) {
      console.error('Save error:', err)
      toast({
        title: "Error",
        description: "Could not save changes. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleBack = () => {
    if (window.confirm('Are you sure you want to leave? Any unsaved changes will be lost.')) {
      router.push(`/product-management/products/${params.id}`)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-9">
        <div className="text-red-500">Error: {error}</div>
        <Button onClick={handleBack}>Back</Button>
      </div>
    )
  }

  if (!product) {
    return <div>Product not found</div>
  }

  return (
    <div className="container mx-auto py-6 px-9 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-start pb-6 border-b">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto hover:bg-transparent"
              onClick={handleBack}
            >
              <ChevronLeft className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">Edit: {product.name}</h1>
              <p className="text-sm text-muted-foreground">Product Code: {product.productCode}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleBack}>Cancel</Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-transparent border-b h-12 p-0 space-x-8">
          <TabsTrigger
            value="general"
            className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="inventory"
            className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Inventory
          </TabsTrigger>
          <TabsTrigger
            value="pricing"
            className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Pricing
          </TabsTrigger>
          <TabsTrigger
            value="units"
            className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Units
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-8 mt-6">
          <Card className="px-3 py-6">
            <CardHeader className="pb-3">
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Form fields will go here */}
              <p className="text-sm text-muted-foreground">Form fields for editing will be added here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 