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
import { PencilIcon, TrashIcon, PlusIcon } from 'lucide-react'
import { Input } from '@/components/ui/input';

interface Product {
  id: string;
  productCode: string;
  name: string;
  description: string;
  localDescription: string;
  categoryId: string;
  subCategoryId: string;
  itemGroupId: string;
  primaryInventoryUnitId: string;
  size: string;
  color: string;
  barcode: string;
  isActive: boolean;
  basePrice: number;
  currency: string;
  taxType: string;
  taxRate: number;
  standardCost: number;
  lastCost: number;
  priceDeviationLimit: number;
  quantityDeviationLimit: number;
  minStockLevel: number;
  maxStockLevel: number;
  isForSale: boolean;
  isIngredient: boolean;
  weight: number;
  dimensions: { length: number; width: number; height: number };
  shelfLife: number;
  storageInstructions: string;
  unitConversions: UnitConversion[];
}

interface UnitConversion {
  id: string;
  unitId: string;
  unitName: string;
  conversionFactor: number;
  unitType: 'INVENTORY' | 'ORDER' | 'RECIPE' | 'COUNTING';
}

const productList = [
  {
    id: '1',
    productCode: '123456',
    name: 'Product 1',
    description: 'Description 1',
    localDescription: 'Local Description 1',
    categoryId: '1',
    subCategoryId: '1',
    itemGroupId: '1',
    primaryInventoryUnitId: '1',
    size: '1',
    color: '1',
    barcode: '1',
    isActive: true,
    basePrice: 1,
    currency: '1',
    taxType: '1',
    taxRate: 1,
    standardCost: 1,
    lastCost: 1,
    priceDeviationLimit: 1,
    quantityDeviationLimit: 1,
    minStockLevel: 1,
    maxStockLevel: 1,
    isForSale: true,
    isIngredient: true,
    weight: 1,
    dimensions: { length: 1, width: 1, height: 1 },
    shelfLife: 1,
    storageInstructions: '1',
    unitConversions: [
      {
        id: '1',
        unitId: '1',
        unitName: '1',
        conversionFactor: 1,
        unitType: 'INVENTORY'
      }
    ]
  },
  {
    id: '2',
    productCode: '123456',
    name: 'Product 2',
    description: 'Description 2',
    localDescription: 'Local Description 2',
    categoryId: '2',
    subCategoryId: '2',
    itemGroupId: '2',
    primaryInventoryUnitId: '2',
    size: '2',
    color: '2',
    barcode: '2',
    isActive: false,
    basePrice: 2,
    currency: '2',
    taxType: '2',
    taxRate: 2,
    standardCost: 2,
    lastCost: 2,
    priceDeviationLimit: 2,
    quantityDeviationLimit: 2,
    minStockLevel: 2,
    maxStockLevel: 2,
    isForSale: false,
    isIngredient: false,
    weight: 2,
    dimensions: { length: 2, width: 2, height: 2 },
    shelfLife: 2,
    storageInstructions: '2',
    unitConversions: [
      {
        id: '2',
        unitId: '2',
        unitName: '2',
        conversionFactor: 2,
        unitType: 'INVENTORY',
        type: 'ORDER'
      }
    ]
  }
]

export default function ProductDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleEdit = () => {
    router.push(`/product-management/products/${params.id}/edit`);
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
      if (!response.ok) throw new Error('Failed to add conversion');
      const newConversion = await response.json();
      setProduct(prev => ({
        ...prev,
        unitConversions: [...prev.unitConversions, newConversion],
      }));
    } catch (error) {
      console.error('Error adding conversion:', error);
      toast({ title: "Error", description: "Failed to add conversion", variant: "destructive" });
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
      setProduct(prev => ({
        ...prev,
        unitConversions: prev.unitConversions.map(conv =>
          conv.id === conversionId ? { ...conv, [field]: value } : conv
        ),
      }));
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
      setProduct(prev => ({
        ...prev,
        unitConversions: prev.unitConversions.filter(conv => conv.id !== conversionId),
      }));
    } catch (error) {
      console.error('Error deleting conversion:', error);
      toast({ title: "Error", description: "Failed to delete conversion", variant: "destructive" });
    }
  };

  const saveConversions = async () => {
    try {
      const response = await fetch(`/api/products/${product.id}/conversions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product.unitConversions),
      });

      if (!response.ok) throw new Error('Failed to save conversions');

      toast({ title: "Conversions saved successfully" });
    } catch (error) {
      console.error('Error saving conversions:', error);
      toast({ title: "Error", description: "Failed to save conversions", variant: "destructive" });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Product not found</div>;

  const actionButtons = (
    <>
      <Button onClick={handleEdit}>Edit</Button>
      <Button variant="destructive" onClick={handleDelete}>Delete</Button>
    </>
  );

  const content = (
    <>
      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="categorization">Categorization</TabsTrigger>
          <TabsTrigger value="pricing">Pricing & Costs</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="conversions">Inventory Conversions</TabsTrigger>
          <TabsTrigger value="orderConversions">Order Conversions</TabsTrigger>
          <TabsTrigger value="recipeConversions">Recipe Conversions</TabsTrigger>
          <TabsTrigger value="countingConversions">Counting Conversions</TabsTrigger>
        </TabsList>
        <TabsContent value="basic">
          <h2 className="text-xl font-semibold mb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Name:</strong> {product.name}</p>
              <p><strong>Product Code:</strong> {product.productCode}</p>
              <p><strong>Description:</strong> {product.description}</p>
              <p><strong>Local Description:</strong> {product.localDescription}</p>
              <p><strong>Barcode:</strong>
                {product.barcode}
              </p>
              <p><strong>Status:</strong> <Badge variant={product.isActive ? "success" : "destructive"}>{product.isActive ? 'Active' : 'Inactive'}</Badge></p>
            </div>
            <div>
              <div className="relative">
                {product.imageUrl ? (
                  <>
                    <Image src={product.imageUrl} alt={product.name} width={300} height={300} className="w-full h-auto object-cover rounded-lg" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => handleImageDelete()}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
                    <p>No image available</p>
                  </div>
                )}
              </div>
              <div className="mt-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="categorization">
          <h2 className="text-xl font-semibold mb-2">Categorization</h2>
          <p><strong>Category ID:</strong> {product.categoryId}</p>
          <p><strong>Subcategory ID:</strong> {product.subCategoryId}</p>
          <p><strong>Item Group ID:</strong> {product.itemGroupId}</p>
        </TabsContent>
        <TabsContent value="pricing">
          <h2 className="text-xl font-semibold mb-2">Pricing and Costs</h2>
          <p><strong>Base Price:</strong> {product.basePrice} {product.currency}</p>
          <p><strong>Tax Type:</strong> {product.taxType}</p>
          <p><strong>Tax Rate:</strong> {product.taxRate}%</p>
          <p><strong>Standard Cost:</strong> {product.standardCost} {product.currency}</p>
          <p><strong>Last Cost:</strong> {product.lastCost} {product.currency}</p>
          <p><strong>Prefer Vendor:</strong> {product.preferVendor}</p>
          <p><strong>Price Deviation Limit:</strong> {product.priceDeviationLimit}%</p>
          <p><strong>Quantity Deviation Limit:</strong> {product.quantityDeviationLimit}%</p>
        </TabsContent>
        <TabsContent value="inventory">
          <h2 className="text-xl font-semibold mb-2">Inventory Management</h2>
          <p><strong>Primary Inventory Unit:</strong> {product.primaryInventoryUnitId}</p>
          <p><strong>Min Stock Level:</strong> {product.minStockLevel}</p>
          <p><strong>Max Stock Level:</strong> {product.maxStockLevel}</p>
          
          <h3 className="text-lg font-semibold mt-4 mb-2">Unit Conversions</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From Unit</TableHead>
                <TableHead>To Unit</TableHead>
                <TableHead>Conversion Factor</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.unitConversions.map((conversion) => (
                <TableRow key={conversion.id}>
                  <TableCell>{conversion.fromUnit}</TableCell>
                  <TableCell>{conversion.toUnit}</TableCell>
                  <TableCell>{conversion.conversionFactor}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleEditConversion(conversion.id)}>
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteConversion(conversion.id)}>
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button className="mt-2" onClick={handleAddConversion}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Conversion
          </Button>
        </TabsContent>
        <TabsContent value="attributes">
          <h2 className="text-xl font-semibold mb-2">Product Attributes</h2>
          <p><strong>Size:</strong> {product.size}</p>
          <p><strong>Color:</strong> {product.color}</p>
          <p><strong>Weight:</strong> {product.weight}</p>
          <p><strong>Dimensions:</strong> {product.dimensions.length} x {product.dimensions.width} x {product.dimensions.height}</p>
          <p><strong>Shelf Life:</strong> {product.shelfLife} days</p>
          <p><strong>Storage Instructions:</strong> {product.storageInstructions}</p>
        </TabsContent>
        <TabsContent value="usage">
          <h2 className="text-xl font-semibold mb-2">Usage</h2>
          <p><strong>For Sale:</strong> {product.isForSale ? 'Yes' : 'No'}</p>
          <p><strong>Is Ingredient:</strong> {product.isIngredient ? 'Yes' : 'No'}</p>
        </TabsContent>
        <TabsContent value="conversions">
          <h2 className="text-xl font-semibold mb-2">Unit Conversions</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit</TableHead>
                <TableHead>Conversion Factor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.unitConversions.map((conversion) => (
                <TableRow key={conversion.id}>
                  <TableCell>
                    <Input 
                      value={conversion.unitName} 
                      onChange={(e) => handleEditConversion(conversion.id, 'unitName', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number"
                      value={conversion.conversionFactor} 
                      onChange={(e) => handleEditConversion(conversion.id, 'conversionFactor', parseFloat(e.target.value))}
                    />
                  </TableCell>
                  <TableCell>{conversion.unitType}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteConversion(conversion.id)}>
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-2 space-x-2">
            <Button onClick={() => handleAddConversion('INVENTORY')}>Add Inventory Unit</Button>
            <Button onClick={() => handleAddConversion('ORDER')}>Add Order Unit</Button>
            <Button onClick={() => handleAddConversion('RECIPE')}>Add Recipe Unit</Button>
            <Button onClick={() => handleAddConversion('COUNTING')}>Add Counting Unit</Button>
          </div>
        </TabsContent>
        <TabsContent value="orderConversions">
          <h2 className="text-xl font-semibold mb-2">Order Unit Conversions</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From Unit</TableHead>
                <TableHead>To Unit</TableHead>
                <TableHead>Conversion Factor</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.unitConversions.filter(conv => conv.type === 'ORDER').map((conversion) => (
                <TableRow key={conversion.id}>
                  <TableCell>
                    <Input 
                      value={conversion.fromUnit} 
                      onChange={(e) => handleEditConversion(conversion.id, 'fromUnit', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      value={conversion.toUnit} 
                      onChange={(e) => handleEditConversion(conversion.id, 'toUnit', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number"
                      value={conversion.conversionFactor} 
                      onChange={(e) => handleEditConversion(conversion.id, 'conversionFactor', parseFloat(e.target.value))}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteConversion(conversion.id)}>
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button className="mt-2" onClick={() => handleAddConversion('ORDER')}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Order Conversion
          </Button>
        </TabsContent>
        <TabsContent value="recipeConversions">
          <h2 className="text-xl font-semibold mb-2">Recipe Unit Conversions</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From Unit</TableHead>
                <TableHead>To Unit</TableHead>
                <TableHead>Conversion Factor</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.unitConversions.filter(conv => conv.type === 'RECIPE').map((conversion) => (
                <TableRow key={conversion.id}>
                  <TableCell>
                    <Input 
                      value={conversion.fromUnit} 
                      onChange={(e) => handleEditConversion(conversion.id, 'fromUnit', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      value={conversion.toUnit} 
                      onChange={(e) => handleEditConversion(conversion.id, 'toUnit', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number"
                      value={conversion.conversionFactor} 
                      onChange={(e) => handleEditConversion(conversion.id, 'conversionFactor', parseFloat(e.target.value))}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteConversion(conversion.id)}>
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button className="mt-2" onClick={() => handleAddConversion('RECIPE')}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Recipe Conversion
          </Button>
        </TabsContent>
        <TabsContent value="countingConversions">
          <h2 className="text-xl font-semibold mb-2">Counting Unit Conversions</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From Unit</TableHead>
                <TableHead>To Unit</TableHead>
                <TableHead>Conversion Factor</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.unitConversions.filter(conv => conv.type === 'COUNTING').map((conversion) => (
                <TableRow key={conversion.id}>
                  <TableCell>
                    <Input 
                      value={conversion.fromUnit} 
                      onChange={(e) => handleEditConversion(conversion.id, 'fromUnit', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      value={conversion.toUnit} 
                      onChange={(e) => handleEditConversion(conversion.id, 'toUnit', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number"
                      value={conversion.conversionFactor} 
                      onChange={(e) => handleEditConversion(conversion.id, 'conversionFactor', parseFloat(e.target.value))}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteConversion(conversion.id)}>
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button className="mt-2" onClick={() => handleAddConversion('COUNTING')}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Counting Conversion
          </Button>
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

  return (
    <DetailPageTemplate
      title={`Product: ${product.name}`}
      actionButtons={actionButtons}
      content={content}
    />
  );
}
