/**
 * Vendor Service Tests
 * 
 * Test suite for the vendor database service to ensure proper integration
 * with database operations and calculation services.
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { VendorService, type CreateVendorInput, type VendorFilters } from '../vendor-service'
import { type VendorStatus, type VendorBusinessType } from '@/lib/types/vendor'

// Mock Prisma client
const mockPrisma = {
  vendors: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn()
  },
  vendor_metrics: {
    findUnique: vi.fn(),
    create: vi.fn(),
    upsert: vi.fn(),
    aggregate: vi.fn()
  }
}

// Mock vendor data
const mockDbVendor = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test Vendor Ltd',
  contact_email: 'test@vendor.com',
  contact_phone: '+1-555-0101',
  address_street: '123 Test Street',
  address_city: 'Test City',
  address_state: 'Test State',
  address_postal_code: '12345',
  address_country: 'Test Country',
  status: 'active',
  preferred_currency: 'USD',
  payment_terms: 'Net 30',
  company_registration: 'REG123456',
  tax_id: 'TAX123456',
  website: 'https://vendor.com',
  business_type: 'distributor',
  certifications: ['ISO9001'],
  languages: ['en'],
  notes: 'Test notes',
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
  created_by: 'user-123',
  vendor_metrics: {
    vendor_id: '123e4567-e89b-12d3-a456-426614174000',
    response_rate: 95.5,
    average_response_time: 2.5,
    quality_score: 85.0,
    on_time_delivery_rate: 92.0,
    total_campaigns: 5,
    completed_submissions: 4,
    average_completion_time: 24.0,
    last_submission_date: new Date('2024-08-01'),
    updated_at: new Date('2024-08-01')
  }
}

const createVendorInput: CreateVendorInput = {
  name: 'New Vendor Ltd',
  contactEmail: 'new@vendor.com',
  contactPhone: '+1-555-0102',
  address: {
    street: '456 New Street',
    city: 'New City',
    state: 'New State',
    postalCode: '67890',
    country: 'New Country'
  },
  status: 'active' as VendorStatus,
  preferredCurrency: 'USD',
  paymentTerms: 'Net 15',
  companyRegistration: 'NEWREG123',
  taxId: 'NEWTAX123',
  website: 'https://newvendor.com',
  businessType: 'manufacturer' as VendorBusinessType,
  certifications: ['ISO14001'],
  languages: ['en', 'es'],
  notes: 'New vendor notes',
  createdBy: 'user-456'
}

describe('VendorService', () => {
  let vendorService: VendorService

  beforeEach(() => {
    vi.clearAllMocks()
    vendorService = new VendorService(mockPrisma as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getVendors', () => {
    test('should fetch vendors with default pagination', async () => {
      const mockVendors = [mockDbVendor]
      mockPrisma.vendors.findMany.mockResolvedValue(mockVendors)
      mockPrisma.vendors.count.mockResolvedValue(1)

      const result = await vendorService.getVendors()

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.metadata).toEqual({
        total: 1,
        page: 1,
        limit: 50,
        totalPages: 1
      })

      expect(mockPrisma.vendors.findMany).toHaveBeenCalledWith({
        where: {},
        include: { vendor_metrics: false },
        orderBy: { name: 'asc' },
        skip: 0,
        take: 50
      })
    })

    test('should apply filters correctly', async () => {
      const filters: VendorFilters = {
        status: ['active', 'inactive'],
        businessType: ['manufacturer'],
        search: 'test vendor',
        preferredCurrency: ['USD', 'EUR'],
        hasMetrics: true,
        createdAfter: new Date('2024-01-01'),
        createdBefore: new Date('2024-12-31')
      }

      mockPrisma.vendors.findMany.mockResolvedValue([])
      mockPrisma.vendors.count.mockResolvedValue(0)

      await vendorService.getVendors(filters)

      expect(mockPrisma.vendors.findMany).toHaveBeenCalledWith({
        where: {
          status: { in: ['active', 'inactive'] },
          business_type: { in: ['manufacturer'] },
          preferred_currency: { in: ['USD', 'EUR'] },
          OR: [
            { name: { contains: 'test vendor', mode: 'insensitive' } },
            { contact_email: { contains: 'test vendor', mode: 'insensitive' } },
            { company_registration: { contains: 'test vendor', mode: 'insensitive' } }
          ],
          created_at: {
            gte: filters.createdAfter,
            lte: filters.createdBefore
          }
        },
        include: { vendor_metrics: true },
        orderBy: { name: 'asc' },
        skip: 0,
        take: 50
      })
    })

    test('should handle pagination correctly', async () => {
      const pagination = {
        page: 2,
        limit: 10,
        sortBy: 'created_at' as const,
        sortOrder: 'desc' as const
      }

      mockPrisma.vendors.findMany.mockResolvedValue([])
      mockPrisma.vendors.count.mockResolvedValue(25)

      const result = await vendorService.getVendors({}, pagination)

      expect(mockPrisma.vendors.findMany).toHaveBeenCalledWith({
        where: {},
        include: { vendor_metrics: false },
        orderBy: { created_at: 'desc' },
        skip: 10, // (page 2 - 1) * limit 10
        take: 10
      })

      expect(result.metadata).toEqual({
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3
      })
    })

    test('should handle database errors gracefully', async () => {
      mockPrisma.vendors.findMany.mockRejectedValue(new Error('Database connection failed'))

      const result = await vendorService.getVendors()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to fetch vendors: Database connection failed')
    })
  })

  describe('getVendorById', () => {
    test('should fetch vendor by ID with metrics', async () => {
      mockPrisma.vendors.findUnique.mockResolvedValue(mockDbVendor)

      const result = await vendorService.getVendorById(mockDbVendor.id)

      expect(result.success).toBe(true)
      expect(result.data?.id).toBe(mockDbVendor.id)
      expect(result.data?.companyName).toBe(mockDbVendor.name)
      expect(result.data?.addresses).toHaveLength(1)
      expect(result.data?.contacts).toHaveLength(1)

      expect(mockPrisma.vendors.findUnique).toHaveBeenCalledWith({
        where: { id: mockDbVendor.id },
        include: { vendor_metrics: true }
      })
    })

    test('should return error for non-existent vendor', async () => {
      mockPrisma.vendors.findUnique.mockResolvedValue(null)

      const result = await vendorService.getVendorById('non-existent-id')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Vendor not found')
    })

    test('should handle database errors', async () => {
      mockPrisma.vendors.findUnique.mockRejectedValue(new Error('Database error'))

      const result = await vendorService.getVendorById('test-id')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to fetch vendor: Database error')
    })
  })

  describe('createVendor', () => {
    test('should create vendor successfully', async () => {
      const newVendor = {
        ...mockDbVendor,
        id: 'new-vendor-id',
        name: createVendorInput.name,
        contact_email: createVendorInput.contactEmail
      }

      mockPrisma.vendors.findFirst.mockResolvedValue(null) // No existing vendor
      mockPrisma.vendors.create.mockResolvedValue(newVendor)
      mockPrisma.vendor_metrics.create.mockResolvedValue({ vendor_id: newVendor.id })

      const result = await vendorService.createVendor(createVendorInput)

      expect(result.success).toBe(true)
      expect(result.data?.companyName).toBe(createVendorInput.name)

      expect(mockPrisma.vendors.create).toHaveBeenCalledWith({
        data: {
          name: createVendorInput.name,
          contact_email: createVendorInput.contactEmail,
          contact_phone: createVendorInput.contactPhone,
          address_street: createVendorInput.address?.street,
          address_city: createVendorInput.address?.city,
          address_state: createVendorInput.address?.state,
          address_postal_code: createVendorInput.address?.postalCode,
          address_country: createVendorInput.address?.country,
          status: createVendorInput.status,
          preferred_currency: createVendorInput.preferredCurrency,
          payment_terms: createVendorInput.paymentTerms,
          company_registration: createVendorInput.companyRegistration,
          tax_id: createVendorInput.taxId,
          website: createVendorInput.website,
          business_type: createVendorInput.businessType,
          certifications: createVendorInput.certifications,
          languages: createVendorInput.languages,
          notes: createVendorInput.notes,
          created_by: createVendorInput.createdBy
        }
      })

      expect(mockPrisma.vendor_metrics.create).toHaveBeenCalledWith({
        data: { vendor_id: newVendor.id }
      })
    })

    test('should reject duplicate email', async () => {
      mockPrisma.vendors.findFirst.mockResolvedValue(mockDbVendor) // Existing vendor found

      const result = await vendorService.createVendor(createVendorInput)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Vendor with this email already exists')
    })

    test('should handle creation errors', async () => {
      mockPrisma.vendors.findFirst.mockResolvedValue(null)
      mockPrisma.vendors.create.mockRejectedValue(new Error('Creation failed'))

      const result = await vendorService.createVendor(createVendorInput)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to create vendor: Creation failed')
    })
  })

  describe('updateVendor', () => {
    const updateData = {
      name: 'Updated Vendor Name',
      contactEmail: 'updated@vendor.com',
      status: 'inactive' as VendorStatus
    }

    test('should update vendor successfully', async () => {
      const updatedVendor = { ...mockDbVendor, ...updateData, contact_email: updateData.contactEmail }
      
      mockPrisma.vendors.findUnique.mockResolvedValue(mockDbVendor)
      mockPrisma.vendors.findFirst.mockResolvedValue(null) // No email conflict
      mockPrisma.vendors.update.mockResolvedValue(updatedVendor)

      const result = await vendorService.updateVendor(mockDbVendor.id, updateData)

      expect(result.success).toBe(true)
      expect(result.data?.companyName).toBe(updateData.name)

      expect(mockPrisma.vendors.update).toHaveBeenCalledWith({
        where: { id: mockDbVendor.id },
        data: {
          name: updateData.name,
          contact_email: updateData.contactEmail,
          status: updateData.status
        },
        include: { vendor_metrics: true }
      })
    })

    test('should return error for non-existent vendor', async () => {
      mockPrisma.vendors.findUnique.mockResolvedValue(null)

      const result = await vendorService.updateVendor('non-existent', updateData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Vendor not found')
    })

    test('should detect email conflicts', async () => {
      const conflictingVendor = { ...mockDbVendor, id: 'different-id' }
      
      mockPrisma.vendors.findUnique.mockResolvedValue(mockDbVendor)
      mockPrisma.vendors.findFirst.mockResolvedValue(conflictingVendor)

      const result = await vendorService.updateVendor(mockDbVendor.id, updateData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Another vendor with this email already exists')
    })
  })

  describe('deleteVendor', () => {
    test('should soft delete vendor', async () => {
      mockPrisma.vendors.findUnique.mockResolvedValue(mockDbVendor)
      mockPrisma.vendors.update.mockResolvedValue({ ...mockDbVendor, status: 'inactive' })

      const result = await vendorService.deleteVendor(mockDbVendor.id)

      expect(result.success).toBe(true)
      expect(result.data).toBe(true)

      expect(mockPrisma.vendors.update).toHaveBeenCalledWith({
        where: { id: mockDbVendor.id },
        data: { status: 'inactive' }
      })
    })

    test('should return error for non-existent vendor', async () => {
      mockPrisma.vendors.findUnique.mockResolvedValue(null)

      const result = await vendorService.deleteVendor('non-existent')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Vendor not found')
    })
  })

  describe('getVendorStatistics', () => {
    test('should return vendor statistics', async () => {
      const mockStatusCounts = [
        { status: 'active', _count: { status: 10 } },
        { status: 'inactive', _count: { status: 3 } },
        { status: 'suspended', _count: { status: 1 } }
      ]

      const mockBusinessTypeCounts = [
        { business_type: 'manufacturer', _count: { business_type: 5 } },
        { business_type: 'distributor', _count: { business_type: 8 } },
        { business_type: null, _count: { business_type: 1 } }
      ]

      mockPrisma.vendors.count.mockResolvedValue(14)
      mockPrisma.vendors.groupBy.mockResolvedValueOnce(mockStatusCounts)
      mockPrisma.vendors.groupBy.mockResolvedValueOnce(mockBusinessTypeCounts)
      mockPrisma.vendor_metrics.aggregate.mockResolvedValue({ _avg: { quality_score: 78.5 } })

      const result = await vendorService.getVendorStatistics()

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        total: 14,
        active: 10,
        inactive: 3,
        suspended: 1,
        byBusinessType: {
          manufacturer: 5,
          distributor: 8,
          unknown: 1
        },
        averageRating: 78.5
      })
    })
  })
})