"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ListPageTemplate from '@/components/templates/ListPageTemplate';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ArrowUpDown, Plus, FileText, CheckCircle, XCircle, Download, Trash2, Upload, Edit, Filter } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import StatusBadge from '@/components/ui/custom-status-badge';
import { AdvancedFilter } from '@/components/ui/advanced-filter'
import { FilterType } from '@/lib/utils/filter-storage'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MoreVertical } from 'lucide-react'

interface Product {
  id: string;
  productCode: string;
  name: string;
  description: string;
  localDescription?: string;
  categoryId: string;
  categoryName?: string;
  subCategoryId: string;
  subCategoryName?: string;
  itemGroupId?: string;
  itemGroupName?: string;
  itemGroup?: string;
  primaryInventoryUnitId: string;
  primaryUnitName?: string;
  size?: string;
  color?: string;
  barcode?: string;
  isActive: boolean;
  basePrice: number;
  currency: string;
  taxType?: string;
  taxRate?: number;
  standardCost?: number;
  lastCost?: number;
  priceDeviationLimit?: number;
  quantityDeviationLimit?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  isForSale?: boolean;
  isIngredient?: boolean;
  weight?: number;
  shelfLife?: number;
  storageInstructions?: string;
  unitConversions?: UnitConversion[];
  imagesUrl?: string;
}

interface UnitConversion {
  id: string;
  unitId: string;
  fromUnit: string;
  toUnit: string;
  unitName: string;
  conversionFactor: number;
  unitType: "INVENTORY" | "ORDER" | "RECIPE";
}

// Mock data
const productList = {
    total: 8,
    products: [
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
        size: '1',
        color: 'White',
        barcode: '8851234567890',
        isActive: true,
        basePrice: 35.50,
        currency: 'THB',
        taxType: 'VAT',
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
        imagesUrl: '/images/products/jasmine-rice.jpg'
      },
      {
        id: 'PRD002',
        productCode: 'PRD-002',
        name: 'Palm Sugar',
        description: 'Traditional palm sugar made from coconut palm sap. Natural sweetener with rich caramel notes.',
        localDescription: 'น้ำตาลมะพร้าว',
        categoryId: 'CAT-002',
        categoryName: 'Sweeteners',
        subCategoryId: 'SCAT-002',
        subCategoryName: 'Natural Sweeteners',
        itemGroupId: 'GRP-002',
        itemGroupName: 'Traditional Products',
        primaryInventoryUnitId: 'UNIT-001',
        primaryUnitName: 'KG',
        size: '1',
        color: 'Brown',
        barcode: '8851234567891',
        isActive: true,
        basePrice: 45.00,
        currency: 'THB',
        taxType: 'VAT',
        taxRate: 7,
        standardCost: 36.00,
        lastCost: 37.50,
        priceDeviationLimit: 10,
        quantityDeviationLimit: 5,
        minStockLevel: 50,
        maxStockLevel: 500,
        isForSale: true,
        isIngredient: true,
        weight: 1,
        shelfLife: 180,
        storageInstructions: 'Store in airtight container',
        imagesUrl: '/images/products/palm-sugar.jpg'
      },
      {
        id: 'PRD003',
        productCode: 'PRD-003',
        name: 'Fish Sauce Premium Grade',
        description: 'Premium fish sauce made from anchovies, featuring a rich umami flavor perfect for Thai cuisine.',
        localDescription: 'น้ำปลาชั้นดี',
        categoryId: 'CAT-003',
        categoryName: 'Sauces & Condiments',
        subCategoryId: 'SCAT-003',
        subCategoryName: 'Fish Sauce',
        itemGroupId: 'GRP-003',
        itemGroupName: 'Premium Products',
        primaryInventoryUnitId: 'UNIT-002',
        primaryUnitName: 'L',
        size: '1',
        color: 'Amber',
        barcode: '8851234567892',
        isActive: true,
        basePrice: 65.00,
        currency: 'THB',
        taxType: 'VAT',
        taxRate: 7,
        standardCost: 52.00,
        lastCost: 54.00,
        priceDeviationLimit: 10,
        quantityDeviationLimit: 5,
        minStockLevel: 100,
        maxStockLevel: 800,
        isForSale: true,
        isIngredient: true,
        weight: 1,
        shelfLife: 730,
        storageInstructions: 'Store in a cool, dark place',
        imagesUrl: '/images/products/fish-sauce.jpg'
      },
      {
        id: 'PRD004',
        productCode: 'ELEC-002',
        name: 'Dell UltraSharp Monitor',
        description: 'A high-resolution monitor with a 4K display',
        categoryId: 'Electronics',
        subCategoryId: 'Monitors',
        itemGroup: 'Computing Devices',
        basePrice: 499.99,
        currency: 'USD',
        isActive: true,
        primaryInventoryUnitId: 'UNIT004'
      },
      {
        id: 'PRD005',
        productCode: 'OFF-002',
        name: 'Standing Desk',
        description: 'A standing desk to promote better posture',
        categoryId: 'Office Furniture',
        subCategoryId: 'Desks',
        itemGroup: 'Furniture',
        basePrice: 699.99,
        currency: 'USD',
        isActive: false,
        primaryInventoryUnitId: 'UNIT005'
      },
      {
        id: 'PRD006',
        productCode: 'TECH-001',
        name: 'Wireless Mouse',
        description: 'A wireless mouse for easy navigation',
        categoryId: 'Electronics',
        subCategoryId: 'Accessories',
        itemGroup: 'Computing Devices',
        basePrice: 79.99,
        currency: 'USD',
        isActive: true,
        primaryInventoryUnitId: 'UNIT006'
      },
      {
        id: 'PRD007',
        productCode: 'STAT-002',
        name: 'Filing Cabinet',
        description: 'A large filing cabinet for storage',
        categoryId: 'Office Furniture',
        subCategoryId: 'Storage',
        itemGroup: 'Office Supplies',
        basePrice: 199.99,
        currency: 'USD',
        isActive: true,
        primaryInventoryUnitId: 'UNIT007'
      },
      {
        id: 'PRD008',
        productCode: 'TECH-002',
        name: 'Mechanical Keyboard',
        description: 'A mechanical keyboard for typing',
        categoryId: 'Electronics',
        subCategoryId: 'Accessories',
        itemGroup: 'Computing Devices',
        basePrice: 149.99,
        currency: 'USD',
        isActive: false,
        primaryInventoryUnitId: 'UNIT008'
      }
    ]
  };

export default function ProductList(): JSX.Element {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [sortField, setSortField] = useState<keyof Product | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeFilters, setActiveFilters] = useState<FilterType<Product>[]>([]);

  useEffect(() => {
    try {
      setProducts(productList.products);
      setIsLoading(false);
    } catch (error) {
      setError('Failed to load products');
      setIsLoading(false);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when search query changes
  };

  const handleAddProduct = () => {
    router.push('/product-management/products/new');
  };

  const handleImport = () => {
    router.push('/product-management/products/import');
  };

  const handleGenerateReport = () => {
    router.push('/product-management/reports/products');
  };

  const handleEditProduct = (id: string) => {
    console.log('Navigating to edit page:', id);
    router.push(`/product-management/products/${id}?edit`);
  };

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getCurrentPageData = () => {
    return filteredProducts.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = getCurrentPageData().map(product => product.id);
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(item => item !== id));
    }
  };

  const handleBulkDelete = () => {
    // Implement bulk delete logic
    console.log('Bulk delete:', selectedItems);
  };

  const handleBulkExport = () => {
    // Implement bulk export logic
    console.log('Bulk export:', selectedItems);
  };

  const handleDelete = (id: string) => {
    // Implement delete logic
    console.log('Deleting product:', id);
    setProducts(products.filter(product => product.id !== id));
    toast.success("Product deleted successfully");
  };

  const handleBulkStatusUpdate = (status: boolean) => {
    // Implement bulk status update logic
    console.log('Bulk status update:', selectedItems, status);
  };

  const handleApplyFilters = (filters: FilterType<Product>[]) => {
    try {
      setActiveFilters(filters);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error applying filters:', error);
      toast.error("There was a problem applying the filters");
    }
  };

  const handleClearFilters = () => {
    try {
      setActiveFilters([]);
    } catch (error) {
      console.error('Error clearing filters:', error);
      toast.error("There was a problem clearing the filters");
    }
  };

  // Update useEffect for filtering and sorting
  useEffect(() => {
    let filtered = [...products];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.productCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply advanced filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter(product => {
        return activeFilters.every(filter => {
          const field = filter.field;
          const value = filter.value;
          const operator = filter.operator;

          // Handle nested fields like businessType.name
          let fieldValue: unknown;
          if (field.toString().includes('.')) {
            const [parentField, childField] = field.toString().split('.');
            const parentValue = product[parentField as keyof Product];
            
            // Handle nested objects
            if (parentValue && typeof parentValue === 'object' && !Array.isArray(parentValue)) {
              fieldValue = (parentValue as Record<string, unknown>)[childField];
            } else {
              fieldValue = undefined;
            }
          } else {
            fieldValue = product[field as keyof Product];
          }

          // Handle undefined or null values
          if (fieldValue === undefined || fieldValue === null) {
            return false;
          }

          // Convert to string for comparison if not already a string
          const stringFieldValue = String(fieldValue).toLowerCase();
          const stringValue = String(value).toLowerCase();

          switch (operator) {
            case 'equals':
              return stringFieldValue === stringValue;
            case 'contains':
              return stringFieldValue.includes(stringValue);
            case 'startsWith':
              return stringFieldValue.startsWith(stringValue);
            case 'endsWith':
              return stringFieldValue.endsWith(stringValue);
            case 'greaterThan':
              return Number(fieldValue) > Number(value);
            case 'lessThan':
              return Number(fieldValue) < Number(value);
            default:
              return true;
          }
        });
      });
    }

    // Apply sorting if a sort field is selected
    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        // Handle undefined values
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;

        // Handle boolean values
        if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
          return sortDirection === 'asc' 
            ? (aValue === bValue ? 0 : aValue ? -1 : 1)
            : (aValue === bValue ? 0 : aValue ? 1 : -1);
        }

        // Handle string, number and other comparable types
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    setFilteredProducts(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
  }, [products, searchQuery, pageSize, sortField, sortDirection, activeFilters]);

  // Define filter fields for the advanced filter
  const filterFields = [
    { value: 'productCode' as keyof Product, label: 'Product Code' },
    { value: 'name' as keyof Product, label: 'Name' },
    { value: 'categoryName' as keyof Product, label: 'Category' },
    { value: 'subCategoryName' as keyof Product, label: 'Sub Category' },
    { value: 'itemGroupName' as keyof Product, label: 'Item Group' },
    { value: 'isActive' as keyof Product, label: 'Status' },
  ];

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ListPageTemplate
      title="Products"
      actionButtons={
        <div className="flex gap-2">
          <Button onClick={handleAddProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
          <Button onClick={handleImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={handleGenerateReport}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      }
      filters={
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-[300px]"
            />
          </div>
          <AdvancedFilter<Product>
            moduleName="product-list"
            filterFields={filterFields}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />
        </div>
      }
      content={
        isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.length === getCurrentPageData().length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead onClick={() => handleSort('productCode')} className="cursor-pointer">
                    Product Code
                    <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead onClick={() => handleSort('categoryName')} className="cursor-pointer">
                    Category
                    <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead onClick={() => handleSort('isActive')} className="cursor-pointer">
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getCurrentPageData().map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(product.id)}
                        onCheckedChange={(checked) => handleSelectItem(product.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>{product.productCode}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.categoryName}</TableCell>
                    <TableCell>
                      <StatusBadge status={product.isActive ? 'active' : 'inactive'} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )
      }
      bulkActions={
        selectedItems.length > 0 && (
          <div className="flex gap-2">
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
            <Button onClick={handleBulkExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Selected
            </Button>
            <Button onClick={() => handleBulkStatusUpdate(true)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Set Active
            </Button>
            <Button onClick={() => handleBulkStatusUpdate(false)}>
              <XCircle className="h-4 w-4 mr-2" />
              Set Inactive
            </Button>
          </div>
        )
      }
    />
  );
}
