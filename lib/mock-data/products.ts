/**
 * Mock Product Data
 * Centralized product mock data for the Carmen ERP application
 */

import { Product } from '@/lib/types'

export const mockProducts: Product[] = [
  {
    id: 'product-001',
    name: 'Premium Olive Oil',
    sku: 'OIL-OLIVE-001',
    description: 'Extra virgin olive oil from Italy',
    category: 'Oils & Vinegars',
    unit: 'bottle',
    unitSize: '500ml',
    isActive: true,
    costPrice: 8.50,
    sellingPrice: 12.75,
    reorderLevel: 20,
    maxStockLevel: 200,
    supplier: 'Premium Food Suppliers Ltd',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-08-15')
  },
  {
    id: 'product-002',
    name: 'Organic Tomatoes',
    sku: 'VEG-TOM-002',
    description: 'Fresh organic roma tomatoes',
    category: 'Vegetables',
    unit: 'kg',
    unitSize: '1kg',
    isActive: true,
    costPrice: 3.25,
    sellingPrice: 4.50,
    reorderLevel: 50,
    maxStockLevel: 300,
    supplier: 'Fresh Produce Market',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-08-10')
  },
  {
    id: 'product-003',
    name: 'All-Purpose Flour',
    sku: 'DRY-FLR-003',
    description: 'High-quality all-purpose flour',
    category: 'Dry Goods',
    unit: 'kg',
    unitSize: '5kg',
    isActive: true,
    costPrice: 2.10,
    sellingPrice: 3.20,
    reorderLevel: 30,
    maxStockLevel: 150,
    supplier: 'Premium Food Suppliers Ltd',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-07-30')
  },
  {
    id: 'product-004',
    name: 'Fresh Basil',
    sku: 'HRB-BAS-004',
    description: 'Fresh organic basil leaves',
    category: 'Herbs',
    unit: 'bunch',
    unitSize: '100g',
    isActive: true,
    costPrice: 1.80,
    sellingPrice: 2.95,
    reorderLevel: 25,
    maxStockLevel: 100,
    supplier: 'Fresh Produce Market',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-08-05')
  }
]