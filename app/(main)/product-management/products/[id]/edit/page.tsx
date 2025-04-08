"use client"

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronLeft, Save } from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
  status: string
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    // Mock data fetch
    const mockProduct = {
      id: params.id,
      name: "Sample Product",
      description: "A sample product description",
      category: "General",
      price: 99.99,
      status: "active"
    }
    setProduct(mockProduct)
  }, [params.id])

  const handleSave = () => {
    toast.success("Product updated successfully")
    router.push(`/product-management/products/${params.id}`)
  }

  if (!product) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold">Edit Product: {product.name}</h1>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              Details content
            </TabsContent>
            <TabsContent value="pricing">
              Pricing content
            </TabsContent>
            <TabsContent value="inventory">
              Inventory content
            </TabsContent>
            <TabsContent value="media">
              Media content
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 