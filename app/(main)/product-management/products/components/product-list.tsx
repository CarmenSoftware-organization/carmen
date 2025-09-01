'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ListPageTemplate from '@/components/templates/ListPageTemplate';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, ArrowUpDown, Edit, Eye, Plus, Printer, Upload, ChevronLeft, FileText, CheckCircle, XCircle, Download, Trash2, Filter, LayoutGrid, List, MoreVertical, ImageIcon } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import StatusBadge from '@/components/ui/custom-status-badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { AdvancedFilter } from './advanced-filter'
import { FilterType } from '@/lib/utils/filter-storage'
import { toast } from '@/components/ui/use-toast'
import { Card } from "@/components/ui/card"
import Image from 'next/image';

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
  imagesUrl?: string; // URL to the product image
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

interface ProductListProps {
  onBack: () => void;
}

export default function ProductList({ onBack }: ProductListProps): JSX.Element {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const [sortField, setSortField] = useState<keyof Product | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeFilters, setActiveFilters] = useState<FilterType<Product>[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

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
    router.push(`/product-management/products/${id}?edit`);
  };

  const handleViewProduct = (id: string) => {
    router.push(`/product-management/products/${id}`);
  };

  const handleDeleteProduct = (id: string) => {
    // Show confirmation dialog
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        // Delete product logic would go here (API call)
        console.log("Deleting product:", id);
        
        // Show toast notification
        toast({
          title: "Product deleted",
          description: "The product has been successfully deleted.",
          variant: "default"
        });
        
        // Refresh products list
        // Since fetchProducts is inside a useEffect, we need to trigger a re-render
        // We can do this by setting isLoading to true which will trigger the useEffect
        setIsLoading(true);
      } catch (error) {
        console.error("Error deleting product:", error);
        toast({
          title: "Error",
          description: "There was a problem deleting the product.",
          variant: "destructive"
        });
      }
    }
  };

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
        categoryId: 'CAT-004',
        categoryName: 'Electronics',
        subCategoryId: 'SCAT-004',
        subCategoryName: 'Monitors',
        itemGroupId: 'GRP-004',
        itemGroupName: 'Computing Devices',
        basePrice: 499.99,
        currency: 'USD',
        isActive: true,
        primaryInventoryUnitId: 'UNIT-005',
        primaryUnitName: 'PC',
        imagesUrl: '/images/products/monitor.jpg'
      },
      {
        id: 'PRD005',
        productCode: 'OFF-002',
        name: 'Standing Desk',
        description: 'A standing desk to promote better posture',
        categoryId: 'CAT-005',
        categoryName: 'Office Furniture',
        subCategoryId: 'SCAT-005',
        subCategoryName: 'Desks',
        itemGroupId: 'GRP-005',
        itemGroupName: 'Furniture',
        basePrice: 699.99,
        currency: 'USD',
        isActive: false,
        primaryInventoryUnitId: 'UNIT-005',
        primaryUnitName: 'PC',
        imagesUrl: '/images/products/standing-desk.jpg'
      },
      {
        id: 'PRD006',
        productCode: 'TECH-001',
        name: 'Wireless Mouse',
        description: 'A wireless mouse for easy navigation',
        categoryId: 'CAT-004',
        categoryName: 'Electronics',
        subCategoryId: 'SCAT-006',
        subCategoryName: 'Accessories',
        itemGroupId: 'GRP-004',
        itemGroupName: 'Computing Devices',
        basePrice: 79.99,
        currency: 'USD',
        isActive: true,
        primaryInventoryUnitId: 'UNIT-005',
        primaryUnitName: 'PC',
        imagesUrl: '/images/products/wireless-mouse.jpg'
      },
      {
        id: 'PRD007',
        productCode: 'STAT-002',
        name: 'Filing Cabinet',
        description: 'A large filing cabinet for storage',
        categoryId: 'CAT-005',
        categoryName: 'Office Furniture',
        subCategoryId: 'SCAT-007',
        subCategoryName: 'Storage',
        itemGroupId: 'GRP-006',
        itemGroupName: 'Office Supplies',
        basePrice: 199.99,
        currency: 'USD',
        isActive: true,
        primaryInventoryUnitId: 'UNIT-005',
        primaryUnitName: 'PC',
        imagesUrl: '/images/products/filing-cabinet.jpg'
      },
      {
        id: 'PRD008',
        productCode: 'TECH-002',
        name: 'Mechanical Keyboard',
        description: 'A mechanical keyboard for typing',
        categoryId: 'CAT-004',
        categoryName: 'Electronics',
        subCategoryId: 'SCAT-006',
        subCategoryName: 'Accessories',
        itemGroupId: 'GRP-004',
        itemGroupName: 'Computing Devices',
        basePrice: 149.99,
        currency: 'USD',
        isActive: false,
        primaryInventoryUnitId: 'UNIT-005',
        primaryUnitName: 'PC',
        imagesUrl: '/images/products/mechanical-keyboard.jpg'
      }
    ]
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = productList;
        setProducts(data.products);
      } catch (err) {
        setError('Error fetching products');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
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
          let fieldValue: any;
          if (field.toString().includes('.')) {
            const [parentField, childField] = field.toString().split('.');
            const parentValue = product[parentField as keyof Product];
            
            // Handle nested objects
            if (parentValue && typeof parentValue === 'object' && !Array.isArray(parentValue)) {
              fieldValue = (parentValue as any)[childField];
            } else {
              fieldValue = undefined;
            }
          } else {
            fieldValue = product[field];
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
      toast({
        title: "Error",
        description: "There was a problem applying the filters.",
        variant: "destructive"
      });
    }
  };

  const handleClearFilters = () => {
    try {
      setActiveFilters([]);
    } catch (error) {
      console.error('Error clearing filters:', error);
      toast({
        title: "Error",
        description: "There was a problem clearing the filters.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const actionButtons = (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" className="h-8 px-3 text-xs" onClick={handleImport}>
        <Upload className="h-3 w-3 mr-1" />
        Import
      </Button>
      <Button variant="outline" className="h-8 px-3 text-xs" onClick={handleGenerateReport}>
        <FileText className="h-3 w-3 mr-1" />
        Report
      </Button>
      <Button className="h-8 px-3 text-xs font-medium" onClick={handleAddProduct}>
        <Plus className="h-3 w-3 mr-1" />
        Add Product
      </Button>
    </div>
  );

  const filters = (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
      <div className="relative flex-1 sm:flex-initial sm:w-80">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          className="pl-7 h-8 text-xs"
          onChange={handleSearchChange}
          value={searchQuery}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <AdvancedFilter 
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />
        
        <div className="flex items-center border rounded-md ml-auto">
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 px-2 rounded-r-none border-0"
            onClick={() => setViewMode('table')}
          >
            <List className="h-3 w-3" />
          </Button>
          <Button
            variant={viewMode === 'card' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 px-2 rounded-l-none border-0"
            onClick={() => setViewMode('card')}
          >
            <LayoutGrid className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderTableView = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="font-semibold text-xs py-2">
              <Checkbox 
                checked={
                  getCurrentPageData().length > 0 &&
                  getCurrentPageData().every(product => 
                    selectedItems.includes(product.id)
                  )
                }
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead 
              className="font-semibold text-xs py-2 cursor-pointer"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center gap-1">
                Name
                {sortField === 'name' && (
                  <ArrowUpDown className="h-3 w-3" />
                )}
              </div>
            </TableHead>
            <TableHead 
              className="font-semibold text-xs py-2 cursor-pointer"
              onClick={() => handleSort('categoryName')}
            >
              <div className="flex items-center gap-1">
                Category
                {sortField === 'categoryName' && (
                  <ArrowUpDown className="h-3 w-3" />
                )}
              </div>
            </TableHead>
            <TableHead 
              className="font-semibold text-xs py-2 cursor-pointer"
              onClick={() => handleSort('subCategoryName')}
            >
              <div className="flex items-center gap-1">
                Subcategory
                {sortField === 'subCategoryName' && (
                  <ArrowUpDown className="h-3 w-3" />
                )}
              </div>
            </TableHead>
            <TableHead 
              className="font-semibold text-xs py-2 cursor-pointer"
              onClick={() => handleSort('itemGroupName')}
            >
              <div className="flex items-center gap-1">
                Item Group
                {sortField === 'itemGroupName' && (
                  <ArrowUpDown className="h-3 w-3" />
                )}
              </div>
            </TableHead>
            <TableHead 
              className="font-semibold text-xs py-2 cursor-pointer"
              onClick={() => handleSort('primaryUnitName')}
            >
              <div className="flex items-center gap-1">
                Inventory Unit
                {sortField === 'primaryUnitName' && (
                  <ArrowUpDown className="h-3 w-3" />
                )}
              </div>
            </TableHead>
            <TableHead 
              className="font-semibold text-xs py-2 cursor-pointer"
              onClick={() => handleSort('basePrice')}
            >
              <div className="flex items-center gap-1">
                Base Price
                {sortField === 'basePrice' && (
                  <ArrowUpDown className="h-3 w-3" />
                )}
              </div>
            </TableHead>
            <TableHead 
              className="font-semibold text-xs py-2 cursor-pointer"
              onClick={() => handleSort('isActive')}
            >
              <div className="flex items-center gap-1">
                Status
                {sortField === 'isActive' && (
                  <ArrowUpDown className="h-3 w-3" />
                )}
              </div>
            </TableHead>
            <TableHead className="font-semibold text-xs py-2 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {getCurrentPageData().map((product) => (
            <TableRow 
              key={product.id}
              className="hover:bg-muted/30 transition-colors"
            >
              <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                <Checkbox 
                  checked={selectedItems.includes(product.id)}
                  onCheckedChange={(checked) => handleSelectItem(product.id, checked as boolean)}
                />
              </TableCell>
              <TableCell className="py-2 text-xs">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{product.name}</span>
                    <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs">
                      {product.productCode}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {product.description || 'No description available'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-2 text-xs">{product.categoryName || product.categoryId}</TableCell>
              <TableCell className="py-2 text-xs">{product.subCategoryName || product.subCategoryId}</TableCell>
              <TableCell className="py-2 text-xs">{product.itemGroupName || product.itemGroupId}</TableCell>
              <TableCell className="py-2 text-xs">{product.primaryUnitName || '-'}</TableCell>
              <TableCell className="py-2 text-xs">
                {product.basePrice ? `${product.basePrice} ${product.currency || ''}` : '-'}
              </TableCell>
              <TableCell className="py-2">
                <StatusBadge 
                  status={product.isActive ? 'Active' : 'Inactive'}
                />
              </TableCell>
              <TableCell className="py-2 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleViewProduct(product.id)}
                  title="View Product"
                >
                  <FileText className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleEditProduct(product.id)}
                  title="Edit Product"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleDeleteProduct(product.id)}
                  title="Delete Product"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {getCurrentPageData().map((product) => (
        <Card 
          key={product.id} 
          className="overflow-hidden hover:bg-secondary/10 transition-colors h-full shadow-sm"
        >
          <div className="flex flex-col h-full">
            {/* Image Area */}
            <div className="relative w-full h-48 bg-muted/30">
              {product.imagesUrl ? (
                <div className="relative w-full h-full">
                  <img
                    src={product.imagesUrl}
                    alt={product.name}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder-product.svg';
                      target.onerror = null; // Prevent infinite loop if placeholder also fails
                    }}
                  />
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src="/images/placeholder-product.svg"
                    alt="No product image"
                    className="object-contain w-full h-full"
                  />
                </div>
              )}
            </div>

            {/* Card Header */}
            <div className="p-4 pb-3 bg-muted/30 border-b">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedItems.includes(product.id)}
                    onCheckedChange={(checked) => handleSelectItem(product.id, checked as boolean)}
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-primary">{product.name}</h3>
                    <Badge variant="secondary" className="mt-1 text-xs px-2 py-0.5">
                      {product.productCode}
                    </Badge>
                  </div>
                </div>
                <StatusBadge status={product.isActive ? 'Active' : 'Inactive'} />
              </div>
            </div>
            
            {/* Card Content */}
            <div className="p-4 flex-grow">
              <div className="mb-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                <p className="text-xs line-clamp-2">{product.description || 'No description available'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Category</p>
                  <p className="text-xs font-medium">{product.categoryName || product.categoryId}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Subcategory</p>
                  <p className="text-xs font-medium">{product.subCategoryName || product.subCategoryId}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Item Group</p>
                  <p className="text-xs font-medium">{product.itemGroupName || product.itemGroupId}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Inventory Unit</p>
                  <p className="text-xs font-medium">{product.primaryUnitName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Base Price</p>
                  <p className="text-xs font-medium">{product.basePrice ? `${product.basePrice} ${product.currency || ''}` : '-'}</p>
                </div>
                {product.taxType && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Tax Type</p>
                  <p className="text-xs font-medium">{product.taxType}</p>
                </div>
                )}
                {product.barcode && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Barcode</p>
                  <p className="text-xs font-medium">{product.barcode}</p>
                </div>
                )}
              </div>
            </div>
            
            {/* Card Actions */}
            <div className="flex justify-end px-4 py-3 bg-muted/20 border-t gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewProduct(product.id)}
                className="h-6 w-6 p-0"
              >
                <FileText className="h-3 w-3" />
                <span className="sr-only">View</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditProduct(product.id)}
                className="h-6 w-6 p-0"
              >
                <Edit className="h-3 w-3" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteProduct(product.id)}
                className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const content = (
    <div className="flex-1 space-y-4">
      {selectedItems.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            {selectedItems.length} items selected
          </p>
          <div className="flex-1" />
          <Button variant="outline" className="h-8 px-2 text-xs" onClick={handleBulkExport}>
            <Download className="h-3 w-3 mr-1" />
            Export Selected
          </Button>
          <Button variant="outline" className="h-8 px-2 text-xs" onClick={() => handleBulkStatusUpdate(true)}>
            <CheckCircle className="h-3 w-3 mr-1" />
            Set Active
          </Button>
          <Button variant="outline" className="h-8 px-2 text-xs" onClick={() => handleBulkStatusUpdate(false)}>
            <XCircle className="h-3 w-3 mr-1" />
            Set Inactive
          </Button>
          <Button variant="destructive" className="h-8 px-2 text-xs" onClick={handleBulkDelete}>
            <Trash2 className="h-3 w-3 mr-1" />
            Delete Selected
          </Button>
        </div>
      )}

      {getCurrentPageData().length > 0 ? (
        viewMode === 'table' ? renderTableView() : renderCardView()
      ) : (
        <div className="text-center py-10 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground text-xs mb-4">No products found</p>
          <Button className="h-8 px-3 text-xs font-medium" onClick={handleAddProduct}>
            <Plus className="h-3 w-3 mr-1" />
            Add Your First Product
          </Button>
        </div>
      )}

      {/* Pagination */}
      {getCurrentPageData().length > 0 && (
        <div className="flex items-center justify-between border-t pt-4 pb-4 px-2">
          <p className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                className="h-8 px-2 text-xs"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <ListPageTemplate
      title="Products"
      actionButtons={actionButtons}
      filters={filters}
      content={content}
    />
  );
}
