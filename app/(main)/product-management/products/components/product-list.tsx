'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ListPageTemplate from '@/components/templates/ListPageTemplate';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Filter, ArrowUpDown, Pencil, MoreVertical, Eye, Plus, Printer, Upload } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import StatusBadge from '@/components/ui/custom-status-badge';

interface Product {
  id: string;
  productCode: string;
  name: string;
  description?: string;
  categoryId: string;
  subCategoryId: string;
  itemGroup: string;
  basePrice: number;
  currency: string;
  isActive: boolean;
  primaryInventoryUnitId: string;
}

interface ProductListProps {
  onBack: () => void;
}

export default function ProductList({ onBack }: ProductListProps): JSX.Element {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

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

  const productList = {
    total: 8,
    products: [
      {
        id: 'PRD001',
        productCode: 'ELEC-001',
        name: 'MacBook Pro 16"',
        description: 'Latest M2 Pro chip, 16GB RAM, 512GB SSD',
        categoryId: 'Electronics',
        subCategoryId: 'Laptops',
        itemGroup: 'Computing Devices',
        basePrice: 2499.99,
        currency: 'USD',
        isActive: true,
        primaryInventoryUnitId: 'UNIT001'
      },
      {
        id: 'PRD002',
        productCode: 'OFF-001',
        name: 'Ergonomic Office Chair',
        description: 'Adjustable height and lumbar support, mesh back',
        categoryId: 'Office Furniture',
        subCategoryId: 'Chairs',
        itemGroup: 'Furniture',
        basePrice: 299.99,
        currency: 'USD',
        isActive: true,
        primaryInventoryUnitId: 'UNIT002'
      },
      {
        id: 'PRD003',
        productCode: 'STAT-001',
        name: 'Premium Notebook Set',
        description: 'A set of high-quality notebooks for all your writing needs',
        categoryId: 'Stationery',
        subCategoryId: 'Writing Materials',
        itemGroup: 'Office Supplies',
        basePrice: 24.99,
        currency: 'USD',
        isActive: true,
        primaryInventoryUnitId: 'UNIT003'
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

  useEffect(() => {
    async function fetchProducts() {
      try {
        // const response = await fetch(`/api/products?page=${currentPage}&pageSize=${pageSize}&search=${searchQuery}`);
        // if (!response.ok) {
        //   throw new Error('Failed to fetch products');
        // }
        // const data = await response.json();

        const data = productList;

        setProducts(data.products);
        setTotalPages(Math.ceil(data.total / pageSize));
      } catch (err) {
        setError('Error fetching products');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [currentPage, searchQuery]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const actionButtons = (
    <>
      <Button onClick={handleAddProduct}>
        <Plus className="h-4 w-4" /> Add Product
      </Button>
      <Button variant="secondary" onClick={handleImport}>
        <Upload className="h-4 w-4" /> Import
      </Button>
      <Button variant="outline" onClick={handleGenerateReport}>
        <Printer className="h-4 w-4" /> Print
      </Button>
    </>
  );

  const content = (
    <div className="space-y-4">
      {/* Search and Filters Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            More Filters
          </Button>
          <Button variant="outline" className="gap-2">
            <ArrowUpDown className="h-4 w-4" />
            Sort
          </Button>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/75">
                <TableHead className="w-12 py-3">
                  <Checkbox className="ml-3" />
                </TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Name</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Category</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Subcategory</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Item Group</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Status</TableHead>
                <TableHead className="py-3 text-right font-medium text-gray-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow 
                  key={product.id}
                  className="group hover:bg-gray-50/50 cursor-pointer border-b last:border-b-0"
                >
                  <TableCell className="py-4 pl-4">
                    <Checkbox />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{product.name}</span>
                        <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs">
                          {product.productCode}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500 mt-0.5">
                        {product.description || 'No description available'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-gray-600">{product.categoryId}</TableCell>
                  <TableCell className="py-4 text-gray-600">{product.subCategoryId}</TableCell>
                  <TableCell className="py-4 text-gray-600">{product.itemGroup}</TableCell>
                  <TableCell className="py-4">
                    <StatusBadge 
                      status={product.isActive ? 'Active' : 'Inactive'}
                    />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                        asChild
                      >
                        <Link href={`/product-management/products/${product.id}`}>
                          <span className="sr-only">View</span>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                        asChild
                      >
                        <Link href={`/product-management/products/${product.id}/edit`}>
                          <span className="sr-only">Edit</span>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10 border rounded-lg bg-gray-50">
          <p className="text-gray-600 mb-4">No products found</p>
          <Button onClick={handleAddProduct}>Add Your First Product</Button>
        </div>
      )}

      {/* Pagination */}
      {products.length > 0 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
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
      title="Product List"
      actionButtons={actionButtons}
      content={content}
    />
  );
}
