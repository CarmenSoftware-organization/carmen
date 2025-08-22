/**
 * Mock Vendor Data
 * Centralized vendor mock data for the Carmen ERP application
 */

import { Vendor } from '@/lib/types'

export const mockVendors: Vendor[] = [
  {
    id: 'vendor-001',
    companyName: 'Premium Food Suppliers Ltd',
    contactName: 'John Smith',
    email: 'john@premiumfood.com',
    phone: '+1-555-0101',
    address: '123 Food Street, Culinary District, CD 12345',
    isActive: true,
    category: 'Food & Beverage',
    taxId: 'TAX123456',
    paymentTerms: 'Net 30',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-08-15')
  },
  {
    id: 'vendor-002',
    companyName: 'Fresh Produce Market',
    contactName: 'Maria Garcia',
    email: 'maria@freshproduce.com',
    phone: '+1-555-0102',
    address: '456 Garden Ave, Fresh Valley, FV 67890',
    isActive: true,
    category: 'Produce',
    taxId: 'TAX789012',
    paymentTerms: 'Net 15',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-08-10')
  },
  {
    id: 'vendor-003',
    companyName: 'Kitchen Equipment Co',
    contactName: 'David Chen',
    email: 'david@kitchenequip.com',
    phone: '+1-555-0103',
    address: '789 Equipment Blvd, Industrial Park, IP 11111',
    isActive: true,
    category: 'Equipment',
    taxId: 'TAX345678',
    paymentTerms: 'Net 45',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-07-30')
  }
]