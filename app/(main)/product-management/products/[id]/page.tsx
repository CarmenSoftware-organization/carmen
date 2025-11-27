'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import DetailPageTemplate from '@/components/templates/DetailPageTemplate';
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ChevronLeft,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ArrowUpDown,
  Edit,
  Trash,
  Save,
  X,
  Check,
  MapPin,
  History,
  BarChart3,
  Package,
  AlertTriangle,
  FileText,
  Tag,
  Scale,
  ShoppingCart,
  DollarSign,
  AlignLeft,
  ImageIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Product, ProductUnit } from '@/lib/types';
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import StatusBadge from '@/components/ui/custom-status-badge';
import { OrderUnitTab } from '../components/order-unit';
import { IngredientUnitTab } from '../components/ingredients';
import { LocationsTab } from '../components/locations-tab';
import { ProductForm } from './components/ProductForm'
import { ActivityLog } from './components/ActivityLog'
import { StoreAssignment } from './components/StoreAssignment'
import { ProductInformation } from './components/ProductInformation'
import { LatestPurchaseDialog } from './components/LatestPurchaseDialog'
import InventoryTab from '../components/inventory'
import { mockProducts } from '@/lib/mock-data/products';
import { mockProductCategories } from '@/lib/mock-data/product-categories';

// ViewModel to bridge centralized Product type with component expectations
interface ViewModelUnitConversion extends Omit<ProductUnit, 'unitType'> {
  unitType: 'INVENTORY' | 'ORDER' | 'RECIPE';
}

interface ProductDetailViewModel extends Omit<Product, 'standardCost' | 'lastPurchaseCost' | 'unitConversions'> {
  // Override Money types with number for UI inputs
  standardCost: number;
  lastCost: number;

  // Add fields expected by the UI but missing in Product type
  basePrice: number;
  taxRate: number;
  priceDeviationLimit: number;
  quantityDeviationLimit: number;
  minStockLevel: number;
  maxStockLevel: number;
  quantityDecimals: number;

  // Override unitConversions to include unitType
  unitConversions: ViewModelUnitConversion[];
}

const mapToViewModel = (product: Product): ProductDetailViewModel => {
  return {
    ...product,
    standardCost: product.standardCost?.amount || 0,
    lastCost: product.lastPurchaseCost?.amount || 0,
    basePrice: 0, // Default value
    taxRate: 0, // Default value
    priceDeviationLimit: 0, // Default value
    quantityDeviationLimit: 0, // Default value
    minStockLevel: 0, // Default value
    maxStockLevel: 0, // Default value
    quantityDecimals: 2, // Default value
    unitConversions: (product.unitConversions || []).map(u => ({
      ...u,
      unitType: u.isInventoryUnit ? 'INVENTORY' : u.isPurchaseUnit ? 'ORDER' : 'RECIPE'
    }))
  };
};

interface ProductDetailProps {
  params: { id: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}

interface LocationAssignment {
  id: string
  locationId: string
  locationName: string
  locationCode: string
  shelfId: string
  shelfName: string
  minQuantity: number
  maxQuantity: number
  reorderPoint: number
  parLevel: number
}

export default function ProductDetail({ params, searchParams }: ProductDetailProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [product, setProduct] = useState<ProductDetailViewModel | null>(null)
  const [editedProduct, setEditedProduct] = useState<ProductDetailViewModel | null>(null)
  const [isEditing, setIsEditing] = useState(Boolean(searchParams?.edit))
  const isAddMode = params.id === 'new'
  const [showPurchaseHistory, setShowPurchaseHistory] = useState(false)

  const [locationAssignments, setLocationAssignments] = useState<LocationAssignment[]>([
    {
      id: '1',
      locationId: 'LOC1',
      locationName: 'Main Kitchen',
      locationCode: 'MK-001',
      shelfId: 'SH1-1',
      shelfName: 'Shelf A1',
      minQuantity: 10,
      maxQuantity: 50,
      reorderPoint: 15,
      parLevel: 40
    },
    {
      id: '2',
      locationId: 'LOC4',
      locationName: 'Bar Storage',
      locationCode: 'BS-001',
      shelfId: 'SH4-2',
      shelfName: 'Middle Shelf',
      minQuantity: 5,
      maxQuantity: 20,
      reorderPoint: 8,
      parLevel: 15
    }
  ])

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  async function fetchProduct() {
    if (isAddMode) {
      // Initialize empty product for add mode
      const emptyProduct: ProductDetailViewModel = {
        id: '',
        productCode: '',
        productName: '',
        displayName: '',
        description: '',
        shortDescription: '',
        productType: 'raw_material',
        status: 'draft',
        categoryId: '',
        subcategoryId: '',
        brandId: '',
        manufacturerId: '',
        specifications: [],
        baseUnit: '',
        alternativeUnits: [],
        isInventoried: true,
        isSerialTrackingRequired: false,
        isBatchTrackingRequired: false,
        shelfLifeDays: undefined,
        storageConditions: '',
        handlingInstructions: '',
        isPurchasable: true,
        isSellable: false,
        defaultVendorId: '',
        minimumOrderQuantity: 0,
        maximumOrderQuantity: 0,
        standardOrderQuantity: 0,
        leadTimeDays: 0,
        standardCost: 0,
        lastCost: 0,
        averageCost: { amount: 0, currency: 'USD' },
        weight: 0,
        weightUnit: 'kg',
        dimensions: { length: 0, width: 0, height: 0, unit: 'cm' },
        color: '',
        material: '',
        hazardousClassification: '',
        regulatoryApprovals: [],
        safetyDataSheetUrl: '',
        images: [],
        documents: [],
        relatedProducts: [],
        substitutes: [],
        accessories: [],
        keywords: [],
        tags: [],
        notes: '',
        isActive: true,
        basePrice: 0,
        taxRate: 0,
        priceDeviationLimit: 0,
        quantityDeviationLimit: 0,
        minStockLevel: 0,
        maxStockLevel: 0,
        quantityDecimals: 2,
        unitConversions: []
      }
      setProduct(emptyProduct)
      setEditedProduct(emptyProduct)
      setIsLoading(false)
      return
    }

    try {
      // In a real app, fetch from API
      const foundProduct = mockProducts.find((p) => p.id === params.id || p.productCode === params.id)

      if (!foundProduct) throw new Error('Product not found')

      const viewModel = mapToViewModel(foundProduct)
      setProduct(viewModel)
      setEditedProduct(viewModel)
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product')
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof ProductDetailViewModel, value: any) => {
    setEditedProduct(prev => {
      if (!prev) return prev
      return {
        ...prev,
        [field]: value
      }
    })
  }

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async (formData: any) => {
    try {
      // Save changes to API
      setProduct(prev => {
        if (!prev) return prev
        return {
          ...prev,
          ...formData
        }
      })
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Product updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      })
    }
  };

  const handleCancel = () => {
    setIsEditing(false)
    // Reset changes
    const originalProduct = mockProducts.find((p) => p.id === params.id || p.productCode === params.id)
    if (originalProduct) {
      const viewModel = mapToViewModel(originalProduct)
      setProduct(viewModel)
      setEditedProduct(viewModel)
    }
  };

  const handleDelete = async () => {
    try {
      // Delete product via API
      router.push('/product-management/products')
      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      })
    }
  };

  // Add these handlers for location management
  const handleAddLocation = (location: LocationAssignment) => {
    setLocationAssignments(prev => [...prev, location])
    toast({
      title: "Success",
      description: "Location assigned successfully",
    })
  }

  const handleUpdateLocation = (id: string, updates: Partial<LocationAssignment>) => {
    setLocationAssignments(prev =>
      prev.map(loc => loc.id === id ? { ...loc, ...updates } : loc)
    )
  }

  const handleRemoveLocation = (id: string) => {
    setLocationAssignments(prev => prev.filter(loc => loc.id !== id))
    toast({
      title: "Success",
      description: "Location removed successfully",
    })
  }

  const handleDeleteLocation = (locationCode: string) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      // Here you would make an API call to delete the location
      console.log(`Deleting location: ${locationCode}`);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch(`/api/products/${params.id}/image`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Failed to upload image');

        const updatedProduct = await response.json();
        setProduct(updatedProduct);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  const handleAddConversion = async (unitType: 'INVENTORY' | 'ORDER' | 'RECIPE') => {
    if (!product) return;
    try {
      const response = await fetch('/api/product-units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, unitType }),
      });
      if (!response.ok) {
        console.error('Failed to add conversion')
        toast({ title: "Error", description: "Failed to add conversion", variant: "destructive" })
        return
      }
      const newConversion = await response.json()
      setProduct(prev => {
        if (!prev) return null
        return {
          ...prev,
          unitConversions: [...(prev.unitConversions || []), newConversion],
        }
      })
    } catch (error) {
      console.error('Error adding conversion:', error)
      toast({ title: "Error", description: "Failed to add conversion", variant: "destructive" })
    }
  };

  const handleEditConversion = async (conversionId: string, field: string, value: string | number) => {
    try {
      const response = await fetch(`/api/product-units/${conversionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      if (!response.ok) throw new Error('Failed to update conversion');
      setProduct(prev => {
        if (!prev) return null
        return {
          ...prev,
          unitConversions: (prev.unitConversions || []).map(conv =>
            conv.id === conversionId ? { ...conv, [field]: value } : conv
          ),
        }
      });
    } catch (error) {
      console.error('Error updating conversion:', error);
      toast({ title: "Error", description: "Failed to update conversion", variant: "destructive" });
    }
  };

  const handleDeleteConversion = async (conversionId: string) => {
    try {
      const response = await fetch(`/api/product-units/${conversionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete conversion');
      setProduct(prev => {
        if (!prev) return null
        return {
          ...prev,
          unitConversions: (prev.unitConversions || []).filter(conv => conv.id !== conversionId),
        }
      });
    } catch (error) {
      console.error('Error deleting conversion:', error);
      toast({ title: "Error", description: "Failed to delete conversion", variant: "destructive" });
    }
  };

  const saveConversions = async () => {
    if (!product) {
      console.error('Product is null')
      toast({ title: "Error", description: "Product not found", variant: "destructive" })
      return
    }

    try {
      const response = await fetch(`/api/products/${product.id}/conversions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product.unitConversions),
      })

      if (!response.ok) throw new Error('Failed to save conversions')

      toast({ title: "Conversions saved successfully" })
    } catch (error) {
      console.error('Error saving conversions:', error)
      toast({ title: "Error", description: "Failed to save conversions", variant: "destructive" })
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!product && !isAddMode) return <div>Product not found</div>

  const actionButtons = (
    <div className="flex gap-2">
      {isEditing ? (
        <>
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={() => handleSave(editedProduct)}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </>
      ) : (
        <>
          <Button variant="outline" onClick={handleDelete} className="text-destructive hover:text-destructive">
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Product
          </Button>
        </>
      )}
    </div>
  );

  const details = product && (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-4">
        <div className="space-y-1">
          <Label className="text-sm text-muted-foreground flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Description
          </Label>
          <p className="text-sm font-medium">{product.description}</p>
        </div>
        <div className="space-y-1">
          <Label className="text-sm text-muted-foreground flex items-center gap-1">
            <AlignLeft className="h-4 w-4" />
            Short Description
          </Label>
          <p className="text-sm font-medium">{product.shortDescription || '-'}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <Label className="text-sm text-muted-foreground flex items-center gap-1">
            <Tag className="h-4 w-4" />
            Category
          </Label>
          <div className="flex gap-2">
            <Badge variant="outline">{mockProductCategories.find(c => c.id === product.categoryId)?.name || product.categoryId}</Badge>
            {product.subcategoryId && (
              <Badge variant="secondary">{mockProductCategories.find(c => c.id === product.categoryId)?.subcategories?.find(s => s.id === product.subcategoryId)?.name || product.subcategoryId}</Badge>
            )}
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-sm text-muted-foreground flex items-center gap-1">
            <Scale className="h-4 w-4" />
            Base Unit
          </Label>
          <p className="text-sm font-medium">{product.baseUnit}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <Label className="text-sm text-muted-foreground flex items-center gap-1">
            <ShoppingCart className="h-4 w-4" />
            Purchasable
          </Label>
          <div className="flex items-center h-6">
            <Checkbox checked={product.isPurchasable} disabled />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-sm text-muted-foreground flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            Sellable
          </Label>
          <div className="flex items-center h-6">
            <Checkbox checked={product.isSellable} disabled />
          </div>
        </div>
      </div>
    </div>
  );

  const editableDetails = editedProduct && (
    <>
      <div>
        <label className="text-muted-foreground">Description</label>
        <Textarea
          className="mt-1"
          value={editedProduct.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
        />
      </div>
      <div>
        <label className="text-muted-foreground">Short Description</label>
        <Textarea
          className="mt-1"
          value={editedProduct.shortDescription || ''}
          onChange={(e) => handleInputChange('shortDescription', e.target.value)}
        />
      </div>
      <div>
        <label className="text-muted-foreground">Category ID</label>
        <Input
          className="mt-1"
          value={editedProduct.categoryId}
          onChange={(e) => handleInputChange('categoryId', e.target.value)}
        />
      </div>
      <div>
        <label className="text-muted-foreground">Subcategory ID</label>
        <Input
          className="mt-1"
          value={editedProduct.subcategoryId || ''}
          onChange={(e) => handleInputChange('subcategoryId', e.target.value)}
        />
      </div>
      <div>
        <label className="text-muted-foreground">Base Unit</label>
        <Input
          className="mt-1"
          value={editedProduct.baseUnit}
          onChange={(e) => handleInputChange('baseUnit', e.target.value)}
        />
      </div>
      <div className="flex items-center space-x-2">
        <label className="text-muted-foreground">Purchasable</label>
        <Checkbox
          checked={editedProduct.isPurchasable}
          onCheckedChange={(checked) => handleInputChange('isPurchasable', checked)}
        />
      </div>
      <div className="flex items-center space-x-2">
        <label className="text-muted-foreground">Sellable</label>
        <Checkbox
          checked={editedProduct.isSellable}
          onCheckedChange={(checked) => handleInputChange('isSellable', checked)}
        />
      </div>
    </>
  );

  const content = (
    <>
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="order-units">Order Units</TabsTrigger>
          <TabsTrigger value="ingredient-units">Ingredient Units</TabsTrigger>
          <TabsTrigger value="locations">Location Assignment</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Tax</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Base Price</Label>
                    <Input
                      type="number"
                      placeholder="Enter base price"
                      value={product?.basePrice || ''}
                      onChange={(e) => handleInputChange('basePrice', Number(e.target.value))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tax Rate (%)</Label>
                    <Input
                      type="number"
                      placeholder="Enter tax rate"
                      value={product?.taxRate || ''}
                      onChange={(e) => handleInputChange('taxRate', Number(e.target.value))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Standard Cost</Label>
                    <Input
                      type="number"
                      placeholder="Enter standard cost"
                      value={product?.standardCost || ''}
                      onChange={(e) => handleInputChange('standardCost', Number(e.target.value))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Cost</Label>
                    <Input
                      type="number"
                      placeholder="Enter last cost"
                      value={product?.lastCost || ''}
                      disabled
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deviations & Thresholds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Price Deviation Limit (%)</Label>
                    <Input
                      type="number"
                      placeholder="Enter limit"
                      min={0}
                      max={100}
                      value={product?.priceDeviationLimit || ''}
                      onChange={(e) => handleInputChange('priceDeviationLimit', Number(e.target.value))}
                      disabled={!isEditing}
                    />
                    <p className="text-sm text-muted-foreground">
                      Maximum allowed deviation from standard price
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity Deviation Limit (%)</Label>
                    <Input
                      type="number"
                      placeholder="Enter limit"
                      min={0}
                      max={100}
                      value={product?.quantityDeviationLimit || ''}
                      onChange={(e) => handleInputChange('quantityDeviationLimit', Number(e.target.value))}
                      disabled={!isEditing}
                    />
                    <p className="text-sm text-muted-foreground">
                      Maximum allowed deviation from ordered quantity
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity Decimals</Label>
                    <Input
                      type="number"
                      placeholder="Enter decimal places"
                      min={0}
                      max={6}
                      value={product?.quantityDecimals ?? 2}
                      onChange={(e) => handleInputChange('quantityDecimals', Number(e.target.value))}
                      disabled={!isEditing}
                    />
                    <p className="text-sm text-muted-foreground">
                      Number of decimal places for quantity values
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Stock Level</Label>
                    <Input
                      type="number"
                      placeholder="Enter minimum level"
                      value={product?.minStockLevel || ''}
                      onChange={(e) => handleInputChange('minStockLevel', Number(e.target.value))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum Stock Level</Label>
                    <Input
                      type="number"
                      placeholder="Enter maximum level"
                      value={product?.maxStockLevel || ''}
                      onChange={(e) => handleInputChange('maxStockLevel', Number(e.target.value))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Attribute(s)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label>Weight</Label>
                    <Input
                      type="number"
                      placeholder="Enter weight in kg"
                      defaultValue={product?.weight || 0}
                      disabled={!isEditing}
                      onChange={(e) => handleInputChange('weight', Number(e.target.value))}
                    />
                  </div>
                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label>Shelf Life (Days)</Label>
                    <Input
                      type="number"
                      placeholder="Enter shelf life in days"
                      defaultValue={product?.shelfLifeDays || 0}
                      disabled={!isEditing}
                      onChange={(e) => handleInputChange('shelfLifeDays', Number(e.target.value))}
                    />
                  </div>
                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label>Storage Conditions</Label>
                    <Textarea
                      placeholder="Enter storage conditions"
                      defaultValue={product?.storageConditions || ''}
                      disabled={!isEditing}
                      onChange={(e) => handleInputChange('storageConditions', e.target.value)}
                    />
                  </div>
                  {/* Size property not available in Product interface - needs to be added as ProductSpecification */}
                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label>Color</Label>
                    <Input
                      type="text"
                      placeholder="Enter color"
                      defaultValue={product?.color || ''}
                      disabled={!isEditing}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryTab isEditing={isEditing} />
        </TabsContent>

        <TabsContent value="order-units">
          <OrderUnitTab isEditing={isEditing} />
        </TabsContent>

        <TabsContent value="ingredient-units">
          <IngredientUnitTab isEditing={isEditing} />
        </TabsContent>

        <TabsContent value="locations">
          <LocationsTab
            isEditing={isEditing}
            locations={locationAssignments}
            onAddLocation={handleAddLocation}
            onUpdateLocation={handleUpdateLocation}
            onRemoveLocation={handleRemoveLocation}
          />
        </TabsContent>

      </Tabs>
      <div className="mt-4 space-x-2">
      </div>
    </>
  );

  return (
    <DetailPageTemplate
      title={
        (isEditing || isAddMode) ? (
          <EditableTitle
            value={editedProduct?.productName || ''}
            code={editedProduct?.productCode || ''}
            onNameChange={(value) => handleInputChange('productName', value)}
            onCodeChange={(value) => handleInputChange('productCode', value)}
          />
        ) : (
          product?.productName
        )
      }
      subtitle={isEditing ? undefined : product?.productCode}
      status={
        <Badge variant={product?.isActive ? "default" : "destructive"}>
          {product?.isActive ? 'Active' : 'Inactive'}
        </Badge>
      }
      details={details}
      editableDetails={editableDetails}
      isEditing={isEditing}
      actionButtons={actionButtons}
      content={content}
      backLink="/product-management/products"
    />
  );
}

interface EditableTitleProps {
  value: string
  code: string
  onNameChange: (value: string) => void
  onCodeChange: (value: string) => void
}

function EditableTitle({ value, code, onNameChange, onCodeChange }: EditableTitleProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Product Code</label>
          <Input
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            className="text-lg font-semibold h-auto"
            placeholder="Enter product code"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Product Name</label>
          <Input
            value={value}
            onChange={(e) => onNameChange(e.target.value)}
            className="text-lg font-semibold h-auto"
            placeholder="Enter product name"
          />
        </div>
      </div>
    </div>
  )
}

interface ProductImageProps {
  src: string
  alt: string
}

function ProductImage({ src, alt }: ProductImageProps) {
  const [error, setError] = useState(false)

  return (
    <div className="relative w-full aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors overflow-hidden">
      {src && !error ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover rounded-lg"
          onError={() => setError(true)}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/10">
          <ImageIcon className="h-12 w-12 text-muted-foreground/25" />
          <span className="mt-2 text-sm text-muted-foreground">No image available</span>
        </div>
      )}
    </div>
  )
}

// Toast utility (mock)
const toast = (props: any) => {
  console.log('Toast:', props)
}
