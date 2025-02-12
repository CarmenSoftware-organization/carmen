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
import { OrderUnitTab } from '@/app/(main)/product-management/products/components/order-unit';
import { IngredientUnitTab } from '@/app/(main)/product-management/products/components/ingredients';
import { StockCountTab } from '@/app/(main)/product-management/products/components/stock-count';

const productList: Product[] = [
  {
    id: 'PRD001',
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
    id: 'PRD002',
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
  },
  {
    id: 'PRD003',
    productCode: 'PRD-003',
    name: 'Fish Sauce Premium Grade',
    description: 'High-quality fish sauce made from premium anchovies. Essential Thai cooking ingredient with rich umami flavor.',
    localDescription: 'น้ำปลาชั้นเยี่ยม',
    categoryId: 'CAT-003',
    categoryName: 'Condiments',
    subCategoryId: 'SCAT-003',
    subCategoryName: 'Sauces',
    itemGroupId: 'GRP-003',
    itemGroupName: 'Thai Essentials',
    primaryInventoryUnitId: 'UNIT-003',
    primaryUnitName: 'L',
    size: '700ml',
    color: 'Amber',
    barcode: '8851234567892',
    isActive: true,
    basePrice: 95.00,
    currency: 'THB',
    taxType: 'VAT',
    taxRate: 7,
    standardCost: 75.00,
    lastCost: 78.50,
    priceDeviationLimit: 12,
    quantityDeviationLimit: 8,
    minStockLevel: 75,
    maxStockLevel: 750,
    isForSale: true,
    isIngredient: true,
    weight: 0.7,
    shelfLife: 730,
    storageInstructions: 'Store at room temperature. Keep bottle tightly sealed.',
    imagesUrl: '/images/products/fish-sauce.jpg',
    unitConversions: [
      {
        id: 'CONV-007',
        unitId: 'UNIT-007',
        unitName: 'Liter',
        conversionFactor: 1,
        fromUnit: 'UNIT-007',
        toUnit: 'UNIT-003',
        unitType: 'INVENTORY'
      },
      {
        id: 'CONV-008',
        unitId: 'UNIT-008',
        unitName: 'Bottle (700ml)',
        conversionFactor: 0.7,
        fromUnit: 'UNIT-008',
        toUnit: 'UNIT-003',
        unitType: 'ORDER'
      },
      {
        id: 'CONV-009',
        unitId: 'UNIT-009',
        unitName: 'Case (12x700ml)',
        conversionFactor: 8.4,
        fromUnit: 'UNIT-009',
        toUnit: 'UNIT-003',
        unitType: 'ORDER'
      }
    ]
  },
  {
    id: 'PRD004',
    productCode: 'PRD-004',
    name: 'Coconut Cream',
    description: 'Rich and creamy first-pressed coconut cream. Perfect for curries, desserts, and traditional Thai dishes.',
    localDescription: 'หัวกะทิ',
    categoryId: 'CAT-004',
    categoryName: 'Dairy & Alternatives',
    subCategoryId: 'SCAT-004',
    subCategoryName: 'Coconut Products',
    itemGroupId: 'GRP-004',
    itemGroupName: 'Thai Ingredients',
    primaryInventoryUnitId: 'UNIT-003',
    primaryUnitName: 'L',
    size: '1L',
    color: 'White',
    barcode: '8851234567893',
    isActive: true,
    basePrice: 125.00,
    currency: 'THB',
    taxType: 'VAT',
    taxRate: 7,
    standardCost: 95.00,
    lastCost: 98.50,
    priceDeviationLimit: 10,
    quantityDeviationLimit: 5,
    minStockLevel: 100,
    maxStockLevel: 1000,
    isForSale: true,
    isIngredient: true,
    weight: 1.05,
    shelfLife: 365,
    storageInstructions: 'Store in refrigerator after opening. Use within 5 days.',
    imagesUrl: '/images/products/coconut-cream.jpg',
    unitConversions: [
      {
        id: 'CONV-010',
        unitId: 'UNIT-010',
        unitName: 'Liter',
        conversionFactor: 1,
        fromUnit: 'UNIT-010',
        toUnit: 'UNIT-003',
        unitType: 'INVENTORY'
      },
      {
        id: 'CONV-011',
        unitId: 'UNIT-011',
        unitName: 'Can (1L)',
        conversionFactor: 1,
        fromUnit: 'UNIT-011',
        toUnit: 'UNIT-003',
        unitType: 'ORDER'
      },
      {
        id: 'CONV-012',
        unitId: 'UNIT-012',
        unitName: 'Case (12x1L)',
        conversionFactor: 12,
        fromUnit: 'UNIT-012',
        toUnit: 'UNIT-003',
        unitType: 'ORDER'
      }
    ]
  },
  {
    id: 'PRD005',
    productCode: 'PRD-005',
    name: 'Kaffir Lime Leaves',
    description: 'Fresh kaffir lime leaves, essential for authentic Thai curries and soups. Adds distinctive citrus aroma.',
    localDescription: 'ใบมะกรูด',
    categoryId: 'CAT-005',
    categoryName: 'Fresh Produce',
    subCategoryId: 'SCAT-005',
    subCategoryName: 'Herbs',
    itemGroupId: 'GRP-005',
    itemGroupName: 'Fresh Herbs',
    primaryInventoryUnitId: 'UNIT-001',
    primaryUnitName: 'KG',
    size: '100g',
    color: 'Green',
    barcode: '8851234567894',
    isActive: true,
    basePrice: 180.00,
    currency: 'THB',
    taxType: 'NON_VAT',
    taxRate: 0,
    standardCost: 150.00,
    lastCost: 155.00,
    priceDeviationLimit: 20,
    quantityDeviationLimit: 15,
    minStockLevel: 2,
    maxStockLevel: 10,
    isForSale: true,
    isIngredient: true,
    weight: 0.1,
    shelfLife: 7,
    storageInstructions: 'Keep refrigerated in sealed container. Best used fresh.',
    imagesUrl: '/images/products/kaffir-leaves.jpg',
    unitConversions: [
      {
        id: 'CONV-013',
        unitId: 'UNIT-013',
        unitName: 'Kilogram',
        conversionFactor: 1,
        fromUnit: 'UNIT-013',
        toUnit: 'UNIT-001',
        unitType: 'INVENTORY'
      },
      {
        id: 'CONV-014',
        unitId: 'UNIT-014',
        unitName: 'Pack (100g)',
        conversionFactor: 0.1,
        fromUnit: 'UNIT-014',
        toUnit: 'UNIT-001',
        unitType: 'ORDER'
      },
      {
        id: 'CONV-015',
        unitId: 'UNIT-015',
        unitName: 'Box (1kg)',
        conversionFactor: 1,
        fromUnit: 'UNIT-015',
        toUnit: 'UNIT-001',
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
  code,
  onNameChange,
  onCodeChange 
}: { 
  value: string,
  code: string,
  onNameChange: (value: string) => void,
  onCodeChange: (value: string) => void 
}) {
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
  );
}

export default function ProductDetail({ 
  params,
  searchParams
}: { 
  params: { id: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [editedProduct, setEditedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(Boolean(searchParams?.edit));
  const isAddMode = params.id === 'new';

  useEffect(() => {
    async function fetchProduct() {
      if (isAddMode) {
        // Initialize empty product for add mode
        const emptyProduct: Product = {
          id: '',
          productCode: '',
          name: '',
          description: '',
          localDescription: '',
          categoryId: '',
          categoryName: '',
          subCategoryId: '',
          subCategoryName: '',
          itemGroupId: '',
          itemGroupName: '',
          primaryInventoryUnitId: '',
          primaryUnitName: '',
          size: '',
          color: '',
          barcode: '',
          isActive: true,
          basePrice: 0,
          currency: 'THB',
          taxType: 'VAT',
          taxRate: 7,
          standardCost: 0,
          lastCost: 0,
          priceDeviationLimit: 0,
          quantityDeviationLimit: 0,
          minStockLevel: 0,
          maxStockLevel: 0,
          isForSale: true,
          isIngredient: false,
          weight: 0,
          shelfLife: 0,
          storageInstructions: '',
          imagesUrl: '',
          unitConversions: []
        };
        setProduct(emptyProduct);
        setEditedProduct(emptyProduct);
        setIsEditing(true);
        setIsLoading(false);
        return;
      }

      try {
        // Case-insensitive product lookup
        const data = productList.find(p => p.id.toLowerCase() === params.id.toLowerCase());
        if (!data) throw new Error('Product not found');
        
        setProduct(data);
        setEditedProduct(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [params.id, isAddMode]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedProduct) return;

    try {
      if (isAddMode) {
        // Create new product
        // const response = await fetch('/api/products', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(editedProduct),
        // });
        
        // if (!response.ok) throw new Error('Failed to create product');
        // const newProduct = await response.json();
        
        toast({
          title: "Success",
          description: "Product created successfully",
        });
        router.push('/product-management/products');
      } else {
        // Update existing product
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
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: isAddMode ? "Failed to create product" : "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    if (isAddMode) {
      router.push('/product-management/products');
    } else {
      setEditedProduct(product);
      setIsEditing(false);
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
      {isEditing || isAddMode ? (
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
          <TabsTrigger value="order-unit">Order Unit</TabsTrigger>
          <TabsTrigger value="ingredient-unit">Ingredient Unit</TabsTrigger>
          <TabsTrigger value="stock-count">Stock Count</TabsTrigger>
        </TabsList>
        <TabsContent value="basic">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Product Attributes */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Attributes</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Size</label>
                      {isEditing ? (
                        <Input
                          value={editedProduct?.size || ''}
                          onChange={(e) => handleInputChange('size', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm mt-1">{product.size}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Color</label>
                      {isEditing ? (
                        <Input
                          value={editedProduct?.color || ''}
                          onChange={(e) => handleInputChange('color', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm mt-1">{product.color}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Weight</label>
                      {isEditing ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="number"
                            value={editedProduct?.weight || 0}
                            onChange={(e) => handleInputChange('weight', parseFloat(e.target.value))}
                            className="flex-1"
                            min={0}
                            step={0.1}
                          />
                          <span className="text-sm text-muted-foreground">kg</span>
                        </div>
                      ) : (
                        <p className="text-sm mt-1">{product.weight} kg</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Shelf Life</label>
                      {isEditing ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="number"
                            value={editedProduct?.shelfLife || 0}
                            onChange={(e) => handleInputChange('shelfLife', parseInt(e.target.value))}
                            className="flex-1"
                            min={0}
                          />
                          <span className="text-sm text-muted-foreground">days</span>
                        </div>
                      ) : (
                        <p className="text-sm mt-1">{product.shelfLife} days</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Storage Instructions</label>
                    {isEditing ? (
                      <Textarea
                        value={editedProduct?.storageInstructions || ''}
                        onChange={(e) => handleInputChange('storageInstructions', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm mt-1">{product.storageInstructions}</p>
                    )}
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
                      {isEditing ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="number"
                            value={editedProduct?.basePrice || 0}
                            onChange={(e) => handleInputChange('basePrice', parseFloat(e.target.value))}
                            className="flex-1"
                            min={0}
                            step={0.01}
                          />
                          <span className="text-sm text-muted-foreground">{product.currency}</span>
                        </div>
                      ) : (
                        <p className="text-sm mt-1">{product.basePrice} {product.currency}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Standard Cost</label>
                      {isEditing ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="number"
                            value={editedProduct?.standardCost || 0}
                            onChange={(e) => handleInputChange('standardCost', parseFloat(e.target.value))}
                            className="flex-1"
                            min={0}
                            step={0.01}
                          />
                          <span className="text-sm text-muted-foreground">{product.currency}</span>
                        </div>
                      ) : (
                        <p className="text-sm mt-1">{product.standardCost} {product.currency}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tax Type</label>
                      {isEditing ? (
                        <Select
                          value={editedProduct?.taxType || ''}
                          onValueChange={(value) => handleInputChange('taxType', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select tax type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="VAT">VAT</SelectItem>
                            <SelectItem value="NON_VAT">Non-VAT</SelectItem>
                            <SelectItem value="EXEMPT">Tax Exempt</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm mt-1">{product.taxType}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tax Rate</label>
                      {isEditing ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="number"
                            value={editedProduct?.taxRate || 0}
                            onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value))}
                            className="flex-1"
                            min={0}
                            max={100}
                            step={0.1}
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      ) : (
                        <p className="text-sm mt-1">{product.taxRate}%</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Price Deviation Limit</label>
                      {isEditing ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="number"
                            value={editedProduct?.priceDeviationLimit || 0}
                            onChange={(e) => handleInputChange('priceDeviationLimit', parseFloat(e.target.value))}
                            className="flex-1"
                            min={0}
                            max={100}
                            step={1}
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      ) : (
                        <p className="text-sm mt-1">{product.priceDeviationLimit}%</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Cost</label>
                      {isEditing ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="number"
                            value={editedProduct?.lastCost || 0}
                            onChange={(e) => handleInputChange('lastCost', parseFloat(e.target.value))}
                            className="flex-1"
                            min={0}
                            step={0.01}
                          />
                          <span className="text-sm text-muted-foreground">{product.currency}</span>
                        </div>
                      ) : (
                        <p className="text-sm mt-1">{product.lastCost} {product.currency}</p>
                      )}
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
        <TabsContent value="order-unit">
          <OrderUnitTab isEditing={isEditing} />
        </TabsContent>
        <TabsContent value="ingredient-unit">
          <IngredientUnitTab isEditing={isEditing} />
        </TabsContent>
        <TabsContent value="stock-count">
          <StockCountTab isEditing={isEditing} />
        </TabsContent>
      </Tabs>
      <div className="mt-4 space-x-2">
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
        <>
          <div className="flex items-center gap-2">
            <Link 
              href="/product-management/products" 
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to Product Lists
            </Link>
          </div>
          {(isEditing || isAddMode) ? (
            <EditableTitle 
              value={editedProduct?.name || ''} 
              code={editedProduct?.productCode || ''}
              onNameChange={(value) => handleInputChange('name', value)}
              onCodeChange={(value) => handleInputChange('productCode', value)} 
            />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Product Code</div>
                <div className="text-lg font-semibold">{product?.productCode}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Product Name</div>
                <div className="text-lg font-semibold">{product?.name}</div>
              </div>
            </div>
          )}
        </>
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
