'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, ArrowUpDown, DollarSign, Filter, Package2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface VendorItem {
  name: string;
  category: string;
  subCategory: string;
  price: number;
  unit: string;
  minOrder: number;
  lastUpdated: string;
  inStock: boolean;
  certification: string[];
}

interface Vendor {
  id: number;
  name: string;
  rating: number;
  deliveryTime: string;
  items: VendorItem[];
}

interface ComparisonItem extends VendorItem {
  vendorName: string;
  vendorRating: number;
  deliveryTime: string;
}

// Sample hospitality-focused data
const initialVendors: Vendor[] = [
  {
    id: 1,
    name: 'Global Foods Supply',
    rating: 4.8,
    deliveryTime: '1-2 days',
    items: [
      { 
        name: 'Premium Coffee Beans',
        category: 'Beverages',
        subCategory: 'Coffee',
        price: 89.99,
        unit: 'per 5kg',
        minOrder: 5,
        lastUpdated: '2025-03-15',
        inStock: true,
        certification: ['Organic', 'Fair Trade']
      },
      { 
        name: 'Fresh Seafood Mix',
        category: 'Fresh Produce',
        subCategory: 'Seafood',
        price: 199.99,
        unit: 'per 10kg',
        minOrder: 2,
        lastUpdated: '2025-03-20',
        inStock: true,
        certification: ['Sustainable Fishing']
      },
      { 
        name: 'Premium Olive Oil',
        category: 'Cooking Essentials',
        subCategory: 'Oils',
        price: 149.99,
        unit: 'per 5L',
        minOrder: 3,
        lastUpdated: '2025-03-18',
        inStock: true,
        certification: ['Extra Virgin']
      }
    ]
  },
  {
    id: 2,
    name: 'Restaurant Depot',
    rating: 4.6,
    deliveryTime: '2-3 days',
    items: [
      { 
        name: 'Premium Coffee Beans',
        category: 'Beverages',
        subCategory: 'Coffee',
        price: 92.99,
        unit: 'per 5kg',
        minOrder: 4,
        lastUpdated: '2025-03-16',
        inStock: true,
        certification: ['Organic']
      },
      { 
        name: 'Fresh Seafood Mix',
        category: 'Fresh Produce',
        subCategory: 'Seafood',
        price: 189.99,
        unit: 'per 10kg',
        minOrder: 3,
        lastUpdated: '2025-03-19',
        inStock: false,
        certification: ['Sustainable Fishing']
      },
      { 
        name: 'Premium Olive Oil',
        category: 'Cooking Essentials',
        subCategory: 'Oils',
        price: 159.99,
        unit: 'per 5L',
        minOrder: 2,
        lastUpdated: '2025-03-17',
        inStock: true,
        certification: ['Extra Virgin']
      }
    ]
  }
];

export default function VendorPriceComparison() {
  const [vendors] = useState<Vendor[]>(initialVendors);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [selectedItem, setSelectedItem] = useState('Premium Coffee Beans');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [stockFilter, setStockFilter] = useState('all');

  // Get unique categories and subcategories
  const categories = ['All', ...Array.from(new Set(vendors.flatMap(vendor => 
    vendor.items.map(item => item.category)
  )))];

  const subCategories = ['All', ...Array.from(new Set(vendors.flatMap(vendor => 
    vendor.items.map(item => item.subCategory)
  )))];

  const itemNames = Array.from(new Set(vendors.flatMap(vendor => 
    vendor.items.map(item => item.name)
  )));

  // Filter and sort vendors based on selected filters
  const getItemComparison = (): ComparisonItem[] => {
    return vendors
      .map(vendor => {
        const item = vendor.items.find(item => item.name === selectedItem);
        if (!item) return null;
        
        return {
          vendorName: vendor.name,
          vendorRating: vendor.rating,
          deliveryTime: vendor.deliveryTime,
          ...item
        };
      })
      .filter((item): item is ComparisonItem => item !== null)
      .filter(item => {
        if (stockFilter === 'inStock') return item.inStock;
        if (stockFilter === 'outOfStock') return !item.inStock;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price') return a.price - b.price;
        if (sortBy === 'name') return a.vendorName.localeCompare(b.vendorName);
        if (sortBy === 'rating') return b.vendorRating - a.vendorRating;
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      });
  };

  const comparison = getItemComparison();
  const bestPrice = comparison.length > 0 ? Math.min(...comparison.map(item => item.price)) : 0;

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-8">
        {/* Header Section - Following UI Guide */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Vendor Price Comparison</h1>
            <p className="text-muted-foreground mt-2">
              Compare prices and terms across different vendors
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="space-y-4">
          {/* Search and Filters Section */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
              <Input
                placeholder="Search vendors or products..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card className="border bg-muted/50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedSubCategory} onValueChange={setSelectedSubCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Sub-Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {subCategories.map(subCategory => (
                        <SelectItem key={subCategory} value={subCategory}>{subCategory}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={stockFilter} onValueChange={setStockFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Stock Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stock</SelectItem>
                      <SelectItem value="inStock">In Stock</SelectItem>
                      <SelectItem value="outOfStock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedItem} onValueChange={setSelectedItem}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Item" />
                    </SelectTrigger>
                    <SelectContent>
                      {itemNames.map(name => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product Details */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Package2 className="h-8 w-8 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">{selectedItem}</h3>
                  {comparison[0] && (
                    <p className="text-sm text-muted-foreground">
                      {comparison[0].category} • {comparison[0].subCategory}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table Section - Following UI Guide */}
          <div className="rounded-lg border bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/75">
                    <th className="py-3 px-4 font-medium text-gray-600">
                      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSortBy('name')}>
                        Vendor
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </th>
                    <th className="py-3 px-4 font-medium text-gray-600">
                      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSortBy('rating')}>
                        Rating
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </th>
                    <th className="py-3 px-4 font-medium text-gray-600">
                      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSortBy('price')}>
                        Price
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </th>
                    <th className="py-3 px-4 font-medium text-gray-600">Unit</th>
                    <th className="py-3 px-4 font-medium text-gray-600">Min. Order</th>
                    <th className="py-3 px-4 font-medium text-gray-600">Delivery Time</th>
                    <th className="py-3 px-4 font-medium text-gray-600">Stock Status</th>
                    <th className="py-3 px-4 font-medium text-gray-600">Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison
                    .filter(item => 
                      item.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((item, index) => (
                      <tr key={index} className="group hover:bg-gray-50/50 cursor-pointer border-b">
                        <td className="p-4">
                          <div>
                            {item.vendorName}
                            <div className="text-sm text-muted-foreground">
                              {item.certification.join(', ')}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            {item.vendorRating}
                            <span className="text-yellow-400 ml-1">★</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {item.price.toFixed(2)}
                          </div>
                        </td>
                        <td className="p-4">{item.unit}</td>
                        <td className="p-4">{item.minOrder} units</td>
                        <td className="p-4">{item.deliveryTime}</td>
                        <td className="p-4">
                          <Badge variant={item.inStock ? "success" : "destructive"}>
                            {item.inStock ? 'In Stock' : 'Out of Stock'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {item.price === bestPrice ? (
                            <Badge variant="success">Best Price!</Badge>
                          ) : (
                            <span className="text-destructive">
                              +${(item.price - bestPrice).toFixed(2)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 