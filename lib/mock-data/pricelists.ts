/**
 * Mock Pricelist Data
 * Centralized pricelist mock data for the Carmen ERP application
 */

import { VendorPricelist, PricelistItem } from '@/lib/types'

export const mockPricelists: VendorPricelist[] = [
  {
    id: 'pricelist-001',
    pricelistNumber: 'PL-2024-001',
    vendorId: 'vendor-001',
    campaignId: 'campaign-001',
    templateId: 'template-001',
    invitationId: 'invite-001',
    currency: 'USD',
    status: 'active',
    items: [],
    validFrom: new Date('2024-04-01'),
    validTo: new Date('2024-06-30'),
    submittedAt: new Date('2024-04-15'),
    approvedAt: new Date('2024-04-20'),
    approvedBy: 'john.doe@carmen.com',
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-05-15'),
    completionPercentage: 100,
    qualityScore: 95,
    totalItems: 245,
    completedItems: 245,
    lastAutoSave: new Date('2024-05-15'),
    submissionNotes: 'All items submitted with competitive pricing',
    version: 1
  },
  {
    id: 'pricelist-002',
    pricelistNumber: 'PL-2024-002',
    vendorId: 'vendor-002',
    campaignId: 'campaign-002',
    templateId: 'template-002',
    invitationId: 'invite-002',
    currency: 'USD',
    status: 'active',
    items: [],
    validFrom: new Date('2024-08-01'),
    validTo: new Date('2024-08-31'),
    submittedAt: new Date('2024-08-05'),
    approvedAt: new Date('2024-08-06'),
    approvedBy: 'maria.garcia@carmen.com',
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-08-22'),
    completionPercentage: 100,
    qualityScore: 98,
    totalItems: 156,
    completedItems: 156,
    lastAutoSave: new Date('2024-08-22'),
    submissionNotes: 'Weekly fresh produce pricing submitted on time',
    version: 3
  },
  {
    id: 'pricelist-003',
    pricelistNumber: 'PL-2024-003',
    vendorId: 'vendor-003',
    campaignId: 'campaign-003',
    templateId: 'template-003',
    invitationId: 'invite-003',
    currency: 'USD',
    status: 'draft',
    items: [],
    validFrom: new Date('2024-09-01'),
    validTo: new Date('2024-09-30'),
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-08-22'),
    completionPercentage: 0,
    qualityScore: 0,
    totalItems: 0,
    completedItems: 0,
    lastAutoSave: new Date('2024-08-22'),
    version: 1
  },
  {
    id: 'pricelist-004',
    pricelistNumber: 'PL-2024-004',
    vendorId: 'vendor-001',
    campaignId: 'campaign-004',
    templateId: 'template-001',
    invitationId: 'invite-004',
    currency: 'USD',
    status: 'submitted',
    items: [],
    validFrom: new Date('2024-07-01'),
    validTo: new Date('2024-07-31'),
    submittedAt: new Date('2024-07-20'),
    createdAt: new Date('2024-07-01'),
    updatedAt: new Date('2024-07-31'),
    completionPercentage: 100,
    qualityScore: 92,
    totalItems: 89,
    completedItems: 89,
    lastAutoSave: new Date('2024-07-31'),
    submissionNotes: 'Holiday catering items submitted with seasonal pricing',
    version: 1
  }
]

export const mockPricelistItems: PricelistItem[] = [
  {
    id: 'item-001',
    productId: 'prod-001',
    productCode: 'BE-001',
    productName: 'Beach Umbrella - Large',
    productDescription: 'Professional grade large beach umbrella with UV protection',
    category: 'Beach Equipment',
    subcategory: 'Shade',
    pricing: [
      {
        id: 'pricing-001',
        moq: 1,
        unit: 'Each',
        unitPrice: 45.00,
        leadTime: 7,
        notes: 'Standard lead time'
      },
      {
        id: 'pricing-002', 
        moq: 10,
        unit: 'Each',
        unitPrice: 42.50,
        leadTime: 7,
        notes: '5% bulk discount'
      },
      {
        id: 'pricing-003',
        moq: 25,
        unit: 'Each', 
        unitPrice: 40.00,
        leadTime: 10,
        notes: '10% bulk discount, extended lead time'
      }
    ],
    currency: 'USD',
    leadTime: 7,
    notes: 'High quality UV resistant material',
    status: 'approved',
    qualityScore: 95,
    lastModified: new Date('2024-05-15'),
    certifications: ['UV Protection Certified']
  },
  {
    id: 'item-002',
    productId: 'prod-002',
    productCode: 'FU-012',
    productName: 'Poolside Lounge Chair',
    productDescription: 'Comfortable poolside lounge chair with adjustable back',
    category: 'Furniture',
    subcategory: 'Seating',
    pricing: [
      {
        id: 'pricing-004',
        moq: 1,
        unit: 'Each',
        unitPrice: 180.00,
        leadTime: 14,
        notes: 'Individual order'
      },
      {
        id: 'pricing-005',
        moq: 5,
        unit: 'Each',
        unitPrice: 175.00,
        leadTime: 14,
        notes: 'Small bulk order'
      },
      {
        id: 'pricing-006',
        moq: 12,
        unit: 'Each',
        unitPrice: 170.00,
        leadTime: 18,
        notes: 'Large bulk order, extended lead time'
      }
    ],
    currency: 'USD',
    leadTime: 14,
    notes: 'Weather resistant aluminum frame',
    status: 'approved',
    qualityScore: 88,
    lastModified: new Date('2024-05-14'),
    certifications: ['Weather Resistant']
  }
]