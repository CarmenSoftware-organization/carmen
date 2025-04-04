"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PencilIcon, ChevronLeft, Save, ImageIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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

// Status Badge Component
function StatusBadge({ status }: { status: 'active' | 'inactive' }) {
  return (
    <Badge variant={status === 'active' ? 'default' : 'secondary'}>
      {status === 'active' ? 'Active' : 'Inactive'}
    </Badge>
  )
}

interface Product {
  id: string
  name: string
  productCode: string
  description: string
  category: string
  isActive: boolean
  image?: string
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('edit') === ''
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulating API call
    const fetchedProduct = productList.find(p => p.id === params.id)
    if (fetchedProduct) {
      setProduct(fetchedProduct)
    }
    setIsLoading(false)
  }, [params.id])

  const handleEdit = () => {
    router.push(`/product-management/products/${params.id}?edit`)
  }

  const handleBack = () => {
    if (isEditMode && window.confirm('Are you sure you want to leave? Any unsaved changes will be lost.')) {
      router.push(`/product-management/products/${params.id}`)
    } else if (!isEditMode) {
      router.push('/product-management/products')
    }
  }

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

  if (isLoading) {
    return <div>Loading...</div>
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
              <h1 className="text-2xl font-semibold tracking-tight">
                {isEditMode ? `Edit: ${product.name}` : product.name}
              </h1>
              <p className="text-sm text-muted-foreground">Product Code: {product.productCode}</p>
            </div>
            {!isEditMode && <StatusBadge status={product.isActive ? "active" : "inactive"} />}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditMode ? (
            <>
              <Button variant="outline" onClick={handleBack}>Cancel</Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit}>
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
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
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{product.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">{product.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{product.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="px-3 py-6">
            <CardHeader className="pb-3">
              <CardTitle>Product Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative flex h-40 w-40 items-center justify-center rounded-lg border">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="160px"
                      className="rounded-lg object-cover"
                      priority={false}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-sm">No image available</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-8 mt-6">
          {/* Inventory tab content */}
          <Card className="px-3 py-6">
            <CardHeader className="pb-3">
              <CardTitle>Inventory Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Minimum Stock Level</p>
                  <p className="font-medium">50</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Maximum Stock Level</p>
                  <p className="font-medium">200</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Shelf Life</p>
                  <p className="font-medium">365 days</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Storage Instructions</p>
                  <p className="font-medium">Store in a cool, dry place</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-8 mt-6">
          {/* Pricing tab content */}
          <Card className="px-3 py-6">
            <CardHeader className="pb-3">
              <CardTitle>Pricing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Base Price</p>
                  <p className="font-medium">$100.00</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Currency</p>
                  <p className="font-medium">USD</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Standard Cost</p>
                  <p className="font-medium">$80.00</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Cost</p>
                  <p className="font-medium">$75.00</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="units" className="space-y-8 mt-6">
          {/* Units tab content */}
          <Card className="px-3 py-6">
            <CardHeader className="pb-3">
              <CardTitle>Unit Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-medium">From Unit</TableHead>
                    <TableHead className="font-medium">To Unit</TableHead>
                    <TableHead className="font-medium">Conversion Factor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Box</TableCell>
                    <TableCell>Piece</TableCell>
                    <TableCell>12</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Case</TableCell>
                    <TableCell>Box</TableCell>
                    <TableCell>24</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
