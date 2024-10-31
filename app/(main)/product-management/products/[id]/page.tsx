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
import { PencilIcon, TrashIcon, PlusIcon, XIcon } from 'lucide-react'
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Product, UnitConversion } from '@/lib/types';
import { ImageIcon, UploadIcon } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Package, AlertCircle } from 'lucide-react';
import StatusBadge from '@/components/ui/custom-status-badge';
import OrderUnitTab from '@/app/(main)/product-management/products/components/order-unit';
import IngredientUnitTab from '@/app/(main)/product-management/products/components/ingredients';
import StockCountUnitTab from '@/app/(main)/product-management/products/components/stock-count';

const productList: Product[] = [
  {
    id: '1',
    productCode: 'PRD-001',
    name: 'Organic Jasmine Rice',
    description: 'Premium quality organic jasmine rice sourced from certified organic farms. Known for its fragrant aroma and soft, sticky texture when cooked.',
    localDescription: 'ข้าวหอมะลิอินทรีย์',
    categoryId: 'CAT-001',
    categoryName: 'Rice & Grains',
    subCategoryId: 'SCAT-001',
    subCategoryName: 'Rice',
    itemGroupId: 'GRP-001',
    itemGroupName: 'Organic Products',
    primaryInventoryUnitId: 'UNIT-001',
    primaryUnitName: 'EACH',
    size: '1',
    color: 'White',
    barcode: '8851234567890',
    isActive: true,
    basePrice: 35.50,
    currency: 'THB',
    taxType: 'VAT',
    taxRate: 7,
    standardCost: 28.40,
    lastCost: 29.75,
    priceDeviationLimit: 10,
    quantityDeviationLimit: 5,
    minStockLevel: 100,
    maxStockLevel: 1000,
    isForSale: true,
    isIngredient: true,
    weight: 1,
    dimensions: { length: 10, width: 15, height: 20 },
    shelfLife: 365,
    storageInstructions: 'Store in a cool, dry place away from direct sunlight',
    imagesUrl: '/images/products/jasmine-rice.jpg',
    unitConversions: [
      {
        id: 'CONV-001',
        unitId: 'UNIT-001',
        unitName: 'Kilogram',
        conversionFactor: 1,
        fromUnit: 'UNIT-001',
        toUnit: 'UNIT-001',
        unitType: 'INVENTORY'
      },
      {
        id: 'CONV-002',
        unitId: 'UNIT-002',
        unitName: 'Bag (5kg)',
        conversionFactor: 5,
        fromUnit: 'UNIT-002',
        toUnit: 'UNIT-001',
        unitType: 'ORDER'
      },
      {
        id: 'CONV-003',
        unitId: 'UNIT-003',
        unitName: 'Sack (25kg)',
        conversionFactor: 25,
        fromUnit: 'UNIT-003',
        toUnit: 'UNIT-001',
        unitType: 'ORDER'
      }
    ]
  },
  {
    id: '2',
    productCode: 'PRD-002',
    name: 'Palm Sugar',
    description: 'Traditional Thai palm sugar made from coconut palm sap. Natural sweetener with caramel notes.',
    localDescription: 'น้ำตาลมะพร้าว',
    categoryId: 'CAT-002',
    categoryName: 'Sweeteners',
    subCategoryId: 'SCAT-002',
    subCategoryName: 'Natural Sweeteners',
    itemGroupId: 'GRP-002',
    itemGroupName: 'Traditional Products',
    primaryInventoryUnitId: 'UNIT-004',
    primaryUnitName: 'KG',
    size: '500g',
    color: 'Brown',
    barcode: '8851234567891',
    isActive: true,
    basePrice: 85.00,
    currency: 'THB',
    taxType: 'VAT',
    taxRate: 7,
    standardCost: 65.00,
    lastCost: 68.50,
    priceDeviationLimit: 15,
    quantityDeviationLimit: 10,
    minStockLevel: 50,
    maxStockLevel: 500,
    isForSale: true,
    isIngredient: true,
    weight: 0.5,
    dimensions: { length: 8, width: 8, height: 10 },
    shelfLife: 180,
    storageInstructions: 'Keep in airtight container in cool, dry place',
    imagesUrl: '/images/products/palm-sugar.jpg',
    unitConversions: [
      {
        id: 'CONV-004',
        unitId: 'UNIT-004',
        unitName: 'Kilogram',
        conversionFactor: 1,
        fromUnit: 'UNIT-004',
        toUnit: 'UNIT-001', 
        unitType: 'INVENTORY'
      },
      {
        id: 'CONV-005',
        unitId: 'UNIT-005',
        unitName: 'Pack (500g)',
        conversionFactor: 0.5,
        fromUnit: 'UNIT-005',
        toUnit: 'UNIT-004',
        unitType: 'ORDER'
      },
      {
        id: 'CONV-006',
        unitId: 'UNIT-006',
        unitName: 'Box (10kg)',
        conversionFactor: 10,
        fromUnit: 'UNIT-006',
        toUnit: 'UNIT-004',
        unitType: 'ORDER'
      }
    ]
  }
];

const inventoryUnits = [
  { id: 'UNIT-001', name: 'Kilogram', code: 'KG' },
  { id: 'UNIT-002', name: 'Gram', code: 'G' },
  { id: 'UNIT-003', name: 'Liter', code: 'L' },
  { id: 'UNIT-004', name: 'Milliliter', code: 'ML' },
  { id: 'UNIT-005', name: 'Piece', code: 'PC' },
];

const inventoryData = {
  totalStock: {
    onHand: 3300,
    onOrder: 500
  },
  locations: [
    {
      code: 'MK-001',
      name: 'Main Kitchen Storage',
      type: 'Primary',
      onHand: 1500,
      onOrder: 500,
      minimum: 1000,
      maximum: 3000,
      reorderPoint: 1200,
      parLevel: 2000
    },
    {
      code: 'DR-001',
      name: 'Dry Storage Room',
      type: 'Secondary',
      onHand: 1000,
      onOrder: 0,
      minimum: 800,
      maximum: 2000,
      reorderPoint: 1000,
      parLevel: 1500
    },
    {
      code: 'CS-001',
      name: 'Cold Storage',
      type: 'Cold Storage',
      onHand: 500,
      onOrder: 0,
      minimum: 300,
      maximum: 1000,
      reorderPoint: 400,
      parLevel: 800
    },
    {
      code: 'BQ-001',
      name: 'Banquet Kitchen',
      type: 'Kitchen',
      onHand: 200,
      onOrder: 0,
      minimum: 150,
      maximum: 500,
      reorderPoint: 200,
      parLevel: 400
    },
    {
      code: 'PB-001',
      name: 'Pool Bar',
      type: 'Bar',
      onHand: 100,
      onOrder: 0,
      minimum: 50,
      maximum: 200,
      reorderPoint: 75,
      parLevel: 150
    }
  ],
  aggregateSettings: {
    minimum: 2300,
    maximum: 6700,
    reorderPoint: 2875,
    parLevel: 4850
  }
};

function EditableTitle({ 
  value, 
  onChange 
}: { 
  value: string, 
  onChange: (value: string) => void 
}) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-2xl font-bold h-auto px-0 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none bg-transparent hover:bg-muted/50"
    />
  );
}

export default function ProductDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        // const response = await fetch(`/api/products/${params.id}`);
        // if (!response.ok) {
        //   throw new Error('Failed to fetch product');
        // }
        // const data = await response.json();
        const data = productList[0];
        setProduct(data as Product);
      } catch (error) {
        setError('Error fetching product');
        console.error('Error fetching product:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [params.id]);

  useEffect(() => {
    if (product && !editedProduct) {
      setEditedProduct(product);
    }
  }, [product]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProduct(product);
  };

  const handleSave = async () => {
    if (!editedProduct) return;

    try {
      // const response = await fetch(`/api/products/${params.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(editedProduct),
      // });

      // if (!response.ok) throw new Error('Failed to update product');
      
      setProduct(editedProduct);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof Product, value: any) => {
    if (!editedProduct) return;
    setEditedProduct({ ...editedProduct, [field]: value });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      // try {
      //   const response = await fetch(`/api/products/${params.id}`, {
      //     method: 'DELETE',
      //   });

      //   if (!response.ok) {
      //     throw new Error('Failed to delete product');
      //   }

      //   router.push('/products');
      // } catch (error) {
      //   console.error('Error deleting product:', error);
      // }
      alert("delete success");
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

  const handleAddConversion = async (unitType: 'INVENTORY' | 'ORDER' | 'RECIPE' | 'COUNTING') => {
    if (!product) return; // Add this line to handle the case when product is null
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
          unitConversions: [...prev.unitConversions, newConversion],
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
          unitConversions: prev.unitConversions.map(conv =>
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
          unitConversions: prev.unitConversions.filter(conv => conv.id !== conversionId),
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

  //       const response = await fetch(`/api/products/${product?.id}/conversions`, {
  //         method: 'PUT',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify(product?.unitConversions),
  //       });

  //       if (!response.ok) throw new Error('Failed to save conversions');
  //     if (!response.ok) {
  //       console.error('Failed to save conversions')
  //       toast({ title: "Error", description: "Failed to save conversions", variant: "destructive" })
  //       return
  //     }
  //     if (response.ok) toast({ title: "Conversions saved successfully" })
  //   } catch (error) {
  //     console.error('Error saving conversions:', error)
  //     toast({ title: "Error", description: "Failed to save conversions", variant: "destructive" })
  //   }
  // }

  const handleDeleteLocation = (locationCode: string) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      // Here you would make an API call to delete the location
      console.log(`Deleting location: ${locationCode}`);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Product not found</div>;

  const actionButtons = (
    <>
      {isEditing ? (
        <>
          <Button onClick={handleSave} variant="default">Save</Button>
          <Button onClick={handleCancel} variant="outline">Cancel</Button>
        </>
      ) : (
        <>
          <Button onClick={handleEdit}>Edit</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </>
      )}
    </>
  );

  const content = (
    <>
      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="orderUnit">Order Unit</TabsTrigger>
          <TabsTrigger value="ingredientUnit">Ingredient Unit</TabsTrigger>
          <TabsTrigger value="stockCount">Stock Count</TabsTrigger>
        </TabsList>
        <TabsContent value="basic">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Now starts with Product Attributes */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Attributes</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Size</label>
                      <p className="text-sm mt-1">{product.size}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Color</label>
                      <p className="text-sm mt-1">{product.color}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Weight</label>
                      <p className="text-sm mt-1">{product.weight} kg</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Shelf Life</label>
                      <p className="text-sm mt-1">{product.shelfLife} days</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Dimensions (L × W × H)</label>
                    <p className="text-sm mt-1">
                      {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Storage Instructions</label>
                    <p className="text-sm mt-1">{product.storageInstructions}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pricing Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Base Price</label>
                      <p className="text-sm mt-1">{product.basePrice} {product.currency}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Standard Cost</label>
                      <p className="text-sm mt-1">{product.standardCost} {product.currency}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tax Type</label>
                      <p className="text-sm mt-1">{product.taxType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tax Rate</label>
                      <p className="text-sm mt-1">{product.taxRate}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Price Deviation Limit</label>
                      <p className="text-sm mt-1">{product.priceDeviationLimit}%</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Cost</label>
                      <p className="text-sm mt-1">{product.lastCost} {product.currency}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Product Image */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                    {product.imagesUrl ? (
                      <>
                        <Image 
                          src={product.imagesUrl}
                          alt={product.name} 
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                          onClick={handleDelete}
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                          <p className="mt-2 text-sm text-muted-foreground">No image available</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="image-upload" className="w-full">
                        <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground/70">PNG, JPG, GIF up to 10MB</p>
                          </div>
                          <Input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="inventory">
          <div className="space-y-6">
            {/* Total Stock Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-4 border-b pb-4">
                  <Package className="w-5 h-5 text-muted-foreground" />
                  <h2 className="text-sm font-medium">Total Stock Position</h2>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-muted-foreground block text-right">On Hand</label>
                    <div className="mt-1 text-2xl font-semibold tabular-nums text-right">
                      {inventoryData.totalStock.onHand.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block text-right">On Order</label>
                    <div className="mt-1 text-2xl font-semibold tabular-nums text-right">
                      {inventoryData.totalStock.onOrder.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Details */}
            <Card>
              <CardHeader>
                <CardTitle>Stock by Location</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">On Hand</TableHead>
                      <TableHead className="text-right">On Order</TableHead>
                      <TableHead className="text-right">Minimum</TableHead>
                      <TableHead className="text-right">Maximum</TableHead>
                      <TableHead className="text-right">Reorder</TableHead>
                      <TableHead className="text-right">PAR</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryData.locations.map((location) => {
                      const isLow = location.onHand < location.minimum;
                      const isHigh = location.onHand > location.maximum;
                      const needsReorder = location.onHand < location.reorderPoint;
                      
                      return (
                        <TableRow key={location.code}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{location.name}</div>
                              <div className="text-xs text-muted-foreground">{location.code}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {location.onHand.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {location.onOrder.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {location.minimum.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {location.maximum.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {location.reorderPoint.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {location.parLevel.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-center">
                            <StatusBadge status={isLow ? 'below-min' : needsReorder ? 'reorder' : isHigh ? 'over-max' : 'normal'} />
                          </TableCell>
                        </TableRow>
                      )})}
                    {/* Totals Row */}
                    <TableRow className="font-medium bg-muted/50">
                      <TableCell>Total All Locations</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {inventoryData.totalStock.onHand.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {inventoryData.totalStock.onOrder.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {inventoryData.aggregateSettings.minimum.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {inventoryData.aggregateSettings.maximum.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {inventoryData.aggregateSettings.reorderPoint.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {inventoryData.aggregateSettings.parLevel.toLocaleString()}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">Status Indicators</h4>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-destructive rounded-full mr-2" />
                        <span className="text-muted-foreground">Below Minimum Level</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                        <span className="text-muted-foreground">Reorder Point Reached</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                        <span className="text-muted-foreground">Exceeds Maximum Level</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                        <span className="text-muted-foreground">Normal Stock Level</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="orderUnit">
          <OrderUnitTab />
        </TabsContent>
        <TabsContent value="ingredientUnit">
          <IngredientUnitTab />
        </TabsContent>
        <TabsContent value="stockCount">
          <StockCountUnitTab />
        </TabsContent>
      </Tabs>
      <div className="mt-4 space-x-2">
        <Button onClick={saveConversions}>Save Conversions</Button>
        <Button variant="secondary" asChild>
          <Link href="/products">Back to Product List</Link>
        </Button>
      </div>
    </>
  );

  const details = (
    <>
      <div>
        <label className="text-muted-foreground">Description</label>
        <p className="mt-1">{product?.description}</p>
      </div>
      <div>
        <label className="text-muted-foreground">Local Description</label>
        <p className="mt-1">{product?.localDescription}</p>
      </div>
      <div>
        <label className="text-muted-foreground">Category</label>
        <p className="mt-1">{product?.categoryName} / {product?.subCategoryName}</p>
      </div>
      <div>
        <label className="text-muted-foreground">Item Group</label>
        <p className="mt-1">{product?.itemGroupName}</p>
      </div>
      <div>
        <label className="text-muted-foreground">Primary Inventory Unit</label>
        <span className="text-sm font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded mt-1 inline-block">
          {inventoryUnits.find(unit => unit.id === product?.primaryInventoryUnitId)?.code || product?.primaryInventoryUnitId}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <label className="text-muted-foreground">Use for Ingredients</label>
        <Checkbox checked={product?.isIngredient} disabled />
      </div>
    </>
  );

  const editableDetails = editedProduct && (
    <>
      <div>
        <label className="text-muted-foreground">Description</label>
        <Textarea
          className="mt-1"
          value={editedProduct.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
        />
      </div>
      <div>
        <label className="text-muted-foreground">Local Description</label>
        <Textarea
          className="mt-1"
          value={editedProduct.localDescription}
          onChange={(e) => handleInputChange('localDescription', e.target.value)}
        />
      </div>
      <div>
        <label className="text-muted-foreground">Category</label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <Input
            value={editedProduct.categoryName}
            onChange={(e) => handleInputChange('categoryName', e.target.value)}
          />
          <Input
            value={editedProduct.subCategoryName}
            onChange={(e) => handleInputChange('subCategoryName', e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="text-muted-foreground">Item Group</label>
        <Input
          className="mt-1"
          value={editedProduct.itemGroupName}
          onChange={(e) => handleInputChange('itemGroupName', e.target.value)}
        />
      </div>
      <div>
        <label className="text-muted-foreground">Primary Inventory Unit</label>
        <Select
          value={editedProduct.primaryInventoryUnitId}
          onValueChange={(value) => handleInputChange('primaryInventoryUnitId', value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select unit">
              {inventoryUnits.find(unit => unit.id === editedProduct.primaryInventoryUnitId)?.code}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {inventoryUnits.map((unit) => (
              <SelectItem key={unit.id} value={unit.id}>
                {unit.name} ({unit.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <label className="text-muted-foreground">Use for Ingredients</label>
        <Checkbox 
          checked={editedProduct.isIngredient}
          onCheckedChange={(checked) => handleInputChange('isIngredient', checked)}
        />
      </div>
    </>
  );

  return (
    <DetailPageTemplate
      title={
        isEditing ? (
          <EditableTitle 
            value={editedProduct?.name || ''} 
            onChange={(value) => handleInputChange('name', value)} 
          />
        ) : (
          product?.name || ''
        )
      }
      subtitle={isEditing ? editedProduct?.productCode : product?.productCode}
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
      backLink="/products"
    />
  );
}
