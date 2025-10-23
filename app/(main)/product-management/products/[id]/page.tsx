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
import { Edit, TrashIcon, PlusIcon, XIcon, ImageIcon, ChevronLeft } from 'lucide-react'
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Product } from '@/lib/types';
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
import { Label } from "@/components/ui/label"

const inventoryUnits = [
  { id: 'UNIT-001', name: 'Kilogram', code: 'KG' },
  { id: 'UNIT-002', name: 'Gram', code: 'G' },
  { id: 'UNIT-003', name: 'Liter', code: 'L' },
  { id: 'UNIT-004', name: 'Milliliter', code: 'ML' },
  { id: 'UNIT-005', name: 'Piece', code: 'PC' },
  { id: 'UNIT-006', name: 'Bag', code: 'BAG' },
  { id: 'UNIT-007', name: 'Case', code: 'CS' },
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

// Mock data - Replace with actual API calls
const mockCategories = [
  {
    id: 'CAT-001',
    name: 'Rice & Grains',
    subCategories: [
      { id: 'SCAT-001', name: 'Rice' },
      { id: 'SCAT-002', name: 'Noodles' }
    ]
  },
  {
    id: 'CAT-002',
    name: 'Condiments',
    subCategories: [
      { id: 'SCAT-003', name: 'Sauces' },
      { id: 'SCAT-004', name: 'Spices' }
    ]
  },
  {
    id: 'CAT-003',
    name: 'Sauces & Condiments',
    subCategories: [
      { id: 'SCAT-005', name: 'Fish Sauce' },
      { id: 'SCAT-006', name: 'Soy Sauce' }
    ]
  },
  {
    id: 'CAT-004',
    name: 'Electronics',
    subCategories: [
      { id: 'SCAT-007', name: 'Monitors' },
      { id: 'SCAT-008', name: 'Accessories' }
    ]
  },
  {
    id: 'CAT-005',
    name: 'Office Furniture',
    subCategories: [
      { id: 'SCAT-009', name: 'Desks' },
      { id: 'SCAT-010', name: 'Storage' }
    ]
  }
]

const mockItemGroups = [
  { id: 'GRP-001', name: 'Organic Products' },
  { id: 'GRP-002', name: 'Thai Essentials' },
  { id: 'GRP-003', name: 'Premium Products' },
  { id: 'GRP-004', name: 'Computing Devices' },
  { id: 'GRP-005', name: 'Furniture' },
  { id: 'GRP-006', name: 'Office Supplies' }
]

const mockStores = [
  { id: 'STR-001', code: 'BKK-001', name: 'Bangkok Central' },
  { id: 'STR-002', code: 'BKK-002', name: 'Bangkok North' },
  { id: 'STR-003', code: 'CNX-001', name: 'Chiang Mai Central' }
]

const mockUsers = [
  { id: 'USR-001', name: 'John Doe' },
  { id: 'USR-002', name: 'Jane Smith' }
]

const mockUnits = [
  { id: 'UNIT-001', name: 'Kilogram (kg)' },
  { id: 'UNIT-002', name: 'Gram (g)' },
  { id: 'UNIT-003', name: 'Liter (L)' },
  { id: 'UNIT-004', name: 'Milliliter (ml)' },
  { id: 'UNIT-005', name: 'Each (ea)' },
  { id: 'UNIT-006', name: 'Box' },
  { id: 'UNIT-007', name: 'Case' }
]

const mockTaxTypes = [
  { id: 'ADDED', name: 'Added Tax' },
  { id: 'INCLUDED', name: 'Include Tax' },
  { id: 'NONE', name: 'None' }
]

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

interface LocationAssignment {
  id: string
  locationId: string
  locationName: string
  locationCode: string
  minQuantity: number
  maxQuantity: number
  reorderPoint: number
  parLevel: number
}

interface ProductDetailProps {
  params: { id: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}

// Define product list as a named constant to avoid linter errors
const mockProductList = [
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
    primaryUnitName: 'KG',
    size: '1 kg',
    color: 'White',
    barcode: '8851234567890',
    isActive: true,
    basePrice: 35.50,
    currency: 'THB',
    taxType: 'ADDED',
    taxRate: 7,
    standardCost: 28.40,
    lastCost: 29.15,
    priceDeviationLimit: 10,
    quantityDeviationLimit: 5,
    minStockLevel: 100,
    maxStockLevel: 1000,
    isForSale: true,
    isIngredient: true,
    weight: 1,
    shelfLife: 365,
    storageInstructions: 'Store in a cool, dry place',
    imagesUrl: '/images/products/jasmine-rice.jpg',
    unitConversions: [
      {
        id: 'CONV-001',
        unitId: 'UNIT-001',
        fromUnit: 'KG',
        toUnit: 'G',
        unitName: 'Gram',
        conversionFactor: 1000,
        unitType: "INVENTORY" as const
      },
      {
        id: 'CONV-002',
        unitId: 'UNIT-006',
        fromUnit: 'KG',
        toUnit: 'BAG',
        unitName: 'Bag',
        conversionFactor: 0.2,
        unitType: "ORDER" as const
      }
    ],
    // Environmental Impact Fields
    carbonFootprint: 2.5,
    waterUsage: 2500,
    packagingRecyclability: 85,
    biodegradabilityMonths: 6,
    energyEfficiencyRating: 'A',
    sustainableCertification: 'ORGANIC'
  },
  {
    id: 'PRD002',
    productCode: 'PRD-002',
    name: 'Palm Sugar',
    description: 'Traditional palm sugar made from coconut palm sap. Natural sweetener with rich caramel notes.',
    localDescription: 'น้ำตาลมะพร้าว',
    categoryId: 'CAT-002',
    categoryName: 'Condiments',
    subCategoryId: 'SCAT-004',
    subCategoryName: 'Spices',
    itemGroupId: 'GRP-002',
    itemGroupName: 'Thai Essentials',
    primaryInventoryUnitId: 'UNIT-001',
    primaryUnitName: 'KG',
    size: '500g',
    color: 'Brown',
    barcode: '8851234567891',
    isActive: true,
    basePrice: 45.00,
    currency: 'THB',
    taxType: 'INCLUDED',
    taxRate: 7,
    standardCost: 36.00,
    lastCost: 37.50,
    priceDeviationLimit: 10,
    quantityDeviationLimit: 5,
    minStockLevel: 50,
    maxStockLevel: 500,
    isForSale: true,
    isIngredient: true,
    weight: 0.5,
    shelfLife: 180,
    storageInstructions: 'Store in airtight container',
    imagesUrl: '/images/products/palm-sugar.jpg',
    unitConversions: [
      {
        id: 'CONV-003',
        unitId: 'UNIT-001',
        fromUnit: 'KG',
        toUnit: 'G',
        unitName: 'Gram',
        conversionFactor: 1000,
        unitType: "INVENTORY" as const
      },
      {
        id: 'CONV-004',
        unitId: 'UNIT-007',
        fromUnit: 'KG',
        toUnit: 'CS',
        unitName: 'Case',
        conversionFactor: 0.1,
        unitType: "ORDER" as const
      }
    ],
    // Environmental Impact Fields
    carbonFootprint: 1.8,
    waterUsage: 1200,
    packagingRecyclability: 70,
    biodegradabilityMonths: 4,
    energyEfficiencyRating: 'B',
    sustainableCertification: 'FAIRTRADE'
  },
  {
    id: 'PRD003',
    productCode: 'PRD-003',
    name: 'Fish Sauce Premium Grade',
    description: 'Premium fish sauce made from anchovies, featuring a rich umami flavor perfect for Thai cuisine.',
    localDescription: 'น้ำปลาชั้นดี',
    categoryId: 'CAT-003',
    categoryName: 'Sauces & Condiments',
    subCategoryId: 'SCAT-005',
    subCategoryName: 'Fish Sauce',
    itemGroupId: 'GRP-003',
    itemGroupName: 'Premium Products',
    primaryInventoryUnitId: 'UNIT-003',
    primaryUnitName: 'L',
    size: '700ml',
    color: 'Amber',
    barcode: '8851234567892',
    isActive: true,
    basePrice: 65.00,
    currency: 'THB',
    taxType: 'ADDED',
    taxRate: 7,
    standardCost: 52.00,
    lastCost: 54.00,
    priceDeviationLimit: 10,
    quantityDeviationLimit: 5,
    minStockLevel: 100,
    maxStockLevel: 800,
    isForSale: true,
    isIngredient: true,
    weight: 0.7,
    shelfLife: 730,
    storageInstructions: 'Store in a cool, dark place',
    imagesUrl: '/images/products/fish-sauce.jpg',
    unitConversions: [
      {
        id: 'CONV-005',
        unitId: 'UNIT-003',
        fromUnit: 'L',
        toUnit: 'ML',
        unitName: 'Milliliter',
        conversionFactor: 1000,
        unitType: "INVENTORY" as const
      },
      {
        id: 'CONV-006',
        unitId: 'UNIT-005',
        fromUnit: 'L',
        toUnit: 'BTL',
        unitName: 'Bottle',
        conversionFactor: 1,
        unitType: "ORDER" as const
      }
    ],
    // Environmental Impact Fields
    carbonFootprint: 3.2,
    waterUsage: 1800,
    packagingRecyclability: 90,
    biodegradabilityMonths: 8,
    energyEfficiencyRating: 'A',
    sustainableCertification: 'MSC'
  },
  {
    id: 'PRD004',
    productCode: 'ELEC-002',
    name: 'Dell UltraSharp Monitor',
    description: 'A high-resolution monitor with a 4K display for professional use.',
    localDescription: 'จอมอนิเตอร์ Dell UltraSharp ความละเอียดสูง',
    categoryId: 'CAT-004',
    categoryName: 'Electronics',
    subCategoryId: 'SCAT-007',
    subCategoryName: 'Monitors',
    itemGroupId: 'GRP-004',
    itemGroupName: 'Computing Devices',
    primaryInventoryUnitId: 'UNIT-005',
    primaryUnitName: 'PC',
    size: '27 inch',
    color: 'Black',
    barcode: '5901234123457',
    isActive: true,
    basePrice: 499.99,
    currency: 'USD',
    taxType: 'ADDED',
    taxRate: 7,
    standardCost: 420.00,
    lastCost: 425.50,
    priceDeviationLimit: 5,
    quantityDeviationLimit: 2,
    minStockLevel: 5,
    maxStockLevel: 20,
    isForSale: true,
    isIngredient: false,
    weight: 6.5,
    shelfLife: 0,
    storageInstructions: 'Store in dry area, avoid direct sunlight',
    imagesUrl: '/images/products/monitor.jpg',
    unitConversions: [],
    // Environmental Impact Fields
    carbonFootprint: 85.5,
    waterUsage: 3500,
    packagingRecyclability: 80,
    biodegradabilityMonths: 0,
    energyEfficiencyRating: 'B',
    sustainableCertification: 'NONE'
  }
] as Product[];

export default function ProductDetail({ params, searchParams }: ProductDetailProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [editedProduct, setEditedProduct] = useState<Product | null>(null)
  const [isEditing, setIsEditing] = useState(Boolean(searchParams?.edit))
  const isAddMode = params.id === 'new'
  const [showPurchaseHistory, setShowPurchaseHistory] = useState(false)
  const [locationAssignments, setLocationAssignments] = useState<LocationAssignment[]>([])

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
          taxRate: 0,
          standardCost: 0,
          lastCost: 0,
          priceDeviationLimit: 0,
          quantityDeviationLimit: 0,
          minStockLevel: 0,
          maxStockLevel: 0,
          isForSale: false,
          isIngredient: false,
          weight: 0,
          shelfLife: 0,
          storageInstructions: '',
          imagesUrl: '',
          unitConversions: [],
          // Environmental Impact Fields
          carbonFootprint: 0,
          waterUsage: 0,
          packagingRecyclability: 0,
          biodegradabilityMonths: 0,
          energyEfficiencyRating: 'A',
          sustainableCertification: 'NONE'
        }
        setProduct(emptyProduct)
        setEditedProduct(emptyProduct)
        setIsLoading(false)
        return
      }

      try {
        // In a real app, fetch from API
        const fetchedProduct = mockProductList.find((p: Product) => p.id === params.id)
        if (!fetchedProduct) throw new Error('Product not found')
        
        setProduct(fetchedProduct)
        setEditedProduct(fetchedProduct)
        setIsLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product')
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [params.id, isAddMode])

  const handleInputChange = (field: keyof Product, value: any) => {
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
    const originalProduct = mockProductList.find((p: Product) => p.id === params.id) || null
    setProduct(originalProduct)
    setEditedProduct(originalProduct)
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

  const handleDeleteLocation = (locationCode: string) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      // Here you would make an API call to delete the location
      console.log(`Deleting location: ${locationCode}`);
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
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="order-units">Order Units</TabsTrigger>
          <TabsTrigger value="ingredient-units">Ingredient Units</TabsTrigger>
          <TabsTrigger value="locations">Location Assignment</TabsTrigger>
          <TabsTrigger value="environmental-impact">Environmental Impact</TabsTrigger>
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
                    <Input type="number" placeholder="Enter base price" />
                    </div>
                    <div className="space-y-2">
                    <Label>Tax Type</Label>
                    <Select 
                      defaultValue={product?.taxType}
                      disabled={!isEditing}
                      onValueChange={(value) => handleInputChange('taxType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tax type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADDED">Added Tax</SelectItem>
                        <SelectItem value="INCLUDED">Include Tax</SelectItem>
                        <SelectItem value="NONE">None</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Select how tax should be applied to this product
                    </p>
                    </div>
                    <div className="space-y-2">
                    <Label>Tax Rate (%)</Label>
                    <Input type="number" placeholder="Enter tax rate" />
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
                    <Input type="number" placeholder="Enter standard cost" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Cost</Label>
                    <Input type="number" placeholder="Enter last cost" disabled />
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
                    />
                    <p className="text-sm text-muted-foreground">
                      Maximum allowed deviation from ordered quantity
                    </p>
                    </div>
                    <div className="space-y-2">
                    <Label>Minimum Stock Level</Label>
                    <Input type="number" placeholder="Enter minimum level" />
                    </div>
                    <div className="space-y-2">
                    <Label>Maximum Stock Level</Label>
                    <Input type="number" placeholder="Enter maximum level" />
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
                    <Label>Shelf Life</Label>
                    <Input 
                      type="number" 
                      placeholder="Enter shelf life in days"
                      defaultValue={product?.shelfLife || 0}
                      disabled={!isEditing}
                      onChange={(e) => handleInputChange('shelfLife', Number(e.target.value))}
                    />
                  </div>
                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label>Storage Instructions</Label>
                    <Textarea 
                      placeholder="Enter storage instructions"
                      defaultValue={product?.storageInstructions || ''}
                      disabled={!isEditing}
                      onChange={(e) => handleInputChange('storageInstructions', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label>Barcode</Label>
                    <Input 
                      type="text" 
                      placeholder="Enter barcode"
                      defaultValue={product?.barcode || ''}
                      disabled={!isEditing}
                      onChange={(e) => handleInputChange('barcode', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label>Size</Label>
                    <Input 
                      type="text" 
                      placeholder="Enter size"
                      defaultValue={product?.size || ''}
                      disabled={!isEditing}
                      onChange={(e) => handleInputChange('size', e.target.value)}
                    />
                  </div>
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

        <TabsContent value="environmental-impact">
          <div className="space-y-6">
            <Card>
                <CardHeader>
                <CardTitle>Environmental Impact Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Carbon Footprint (kg CO2e)</Label>
                    <Input 
                      type="number" 
                      placeholder="Enter CO2 equivalent"
                      defaultValue={product.carbonFootprint}
                        disabled={!isEditing}
                      />
                    <p className="text-sm text-muted-foreground">
                      Carbon emissions per unit produced
                    </p>
                    </div>
                  <div className="space-y-2">
                    <Label>Water Usage (Liters)</Label>
                    <Input 
                      type="number" 
                      placeholder="Enter water usage"
                      defaultValue={product.waterUsage}
                        disabled={!isEditing}
                      />
                    <p className="text-sm text-muted-foreground">
                      Water consumption per unit
                    </p>
                    </div>
                  <div className="space-y-2">
                    <Label>Packaging Recyclability (%)</Label>
                    <Input 
                      type="number" 
                      placeholder="Enter recyclability percentage"
                      min={0}
                      max={100}
                      defaultValue={product.packagingRecyclability}
                        disabled={!isEditing}
                      />
                    <p className="text-sm text-muted-foreground">
                      Percentage of packaging that can be recycled
                    </p>
                    </div>
                  <div className="space-y-2">
                    <Label>Biodegradability (Months)</Label>
                    <Input 
                      type="number" 
                      placeholder="Enter months to biodegrade"
                      defaultValue={product.biodegradabilityMonths}
                      disabled={!isEditing}
                    />
                    <p className="text-sm text-muted-foreground">
                      Time taken for natural decomposition
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Energy Efficiency Rating</Label>
                    <Select 
                      defaultValue={product.energyEfficiencyRating}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A (Most Efficient)</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                        <SelectItem value="E">E</SelectItem>
                        <SelectItem value="F">F (Least Efficient)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Product energy efficiency classification
                    </p>
            </div>
                  <div className="space-y-2">
                    <Label>Sustainable Certification</Label>
                    <Select 
                      defaultValue={product.sustainableCertification}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select certification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">None</SelectItem>
                        <SelectItem value="ORGANIC">Organic Certified</SelectItem>
                        <SelectItem value="FAIRTRADE">Fair Trade</SelectItem>
                        <SelectItem value="RAINFOREST">Rainforest Alliance</SelectItem>
                        <SelectItem value="MSC">Marine Stewardship Council</SelectItem>
                        <SelectItem value="FSC">Forest Stewardship Council</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Environmental or sustainability certifications
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Environmental Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Additional Environmental Information</Label>
                  <Textarea 
                    placeholder="Enter any additional environmental impact information"
                    className="min-h-[100px]"
                    disabled={!isEditing}
                  />
                            </div>
              </CardContent>
            </Card>
          </div>
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
          {(isEditing || isAddMode) ? (
            <>
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => router.push('/product-management/products')}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Button>
                <EditableTitle 
                  value={editedProduct?.name || ''} 
                  code={editedProduct?.productCode || ''}
                  onNameChange={(value) => handleInputChange('name', value)}
                  onCodeChange={(value) => handleInputChange('productCode', value)} 
                />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.push('/product-management/products')}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
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
