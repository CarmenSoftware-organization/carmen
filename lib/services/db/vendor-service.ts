/**
 * Vendor Database Service
 * 
 * Complete vendor service layer that integrates database operations 
 * with calculation services for comprehensive vendor management.
 */

import { prisma } from '@/lib/db'
import type { PrismaClient } from '@prisma/client'
import { VendorMetrics, type VendorPerformanceInput, type VendorOrderData } from '../calculations/vendor-metrics'
import type { Vendor, VendorAddress, VendorContact, VendorPerformanceMetrics, VendorBusinessType, VendorStatus } from '@/lib/types/vendor'
import type { Money, AuditTimestamp } from '@/lib/types/common'
import { AddressType } from '@/lib/types/common'

/**
 * Database vendor representation (matching schema)
 */
export interface DbVendor {
  id: string
  name: string
  contact_email: string
  contact_phone?: string | null
  address_street?: string | null
  address_city?: string | null
  address_state?: string | null
  address_postal_code?: string | null
  address_country?: string | null
  status: 'active' | 'inactive' | 'suspended'
  preferred_currency: string
  payment_terms?: string | null
  company_registration?: string | null
  tax_id?: string | null
  website?: string | null
  business_type?: string | null
  certifications?: string[] | null
  languages?: string[] | null
  notes?: string | null
  created_at: Date
  updated_at: Date
  created_by: string
}

/**
 * Database vendor metrics representation
 */
export interface DbVendorMetrics {
  vendor_id: string
  response_rate: number
  average_response_time: number
  quality_score: number
  on_time_delivery_rate: number
  total_campaigns: number
  completed_submissions: number
  average_completion_time: number
  last_submission_date?: Date | null
  updated_at: Date
}

/**
 * Vendor creation input
 */
export interface CreateVendorInput {
  name: string
  contactEmail: string
  contactPhone?: string
  address?: {
    street?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  status?: VendorStatus
  preferredCurrency?: string
  paymentTerms?: string
  companyRegistration?: string
  taxId?: string
  website?: string
  businessType?: VendorBusinessType
  certifications?: string[]
  languages?: string[]
  notes?: string
  createdBy: string
}

/**
 * Vendor update input
 */
export interface UpdateVendorInput {
  name?: string
  contactEmail?: string
  contactPhone?: string
  address?: {
    street?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  status?: VendorStatus
  preferredCurrency?: string
  paymentTerms?: string
  companyRegistration?: string
  taxId?: string
  website?: string
  businessType?: VendorBusinessType
  certifications?: string[]
  languages?: string[]
  notes?: string
}

/**
 * Vendor query filters
 */
export interface VendorFilters {
  status?: VendorStatus[]
  businessType?: VendorBusinessType[]
  search?: string // Search in name, email, or company registration
  preferredCurrency?: string[]
  hasMetrics?: boolean
  createdAfter?: Date
  createdBefore?: Date
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: 'name' | 'created_at' | 'updated_at' | 'status'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Service result wrapper
 */
export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: string
  metadata?: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }
}

export class VendorService {
  private db: any
  private vendorMetrics: VendorMetrics

  constructor(prismaClient?: PrismaClient) {
    this.db = prismaClient || prisma
    this.vendorMetrics = new VendorMetrics()
  }

  /**
   * Get all vendors with optional filtering and pagination
   */
  async getVendors(
    filters: VendorFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<ServiceResult<Vendor[]>> {
    try {
      const {
        page = 1,
        limit = 50,
        sortBy = 'name',
        sortOrder = 'asc'
      } = pagination

      const offset = (page - 1) * limit

      // Build where clause
      const whereClause: any = {}

      if (filters.status && filters.status.length > 0) {
        whereClause.status = {
          in: filters.status
        }
      }

      if (filters.businessType && filters.businessType.length > 0) {
        whereClause.business_type = {
          in: filters.businessType
        }
      }

      if (filters.preferredCurrency && filters.preferredCurrency.length > 0) {
        whereClause.preferred_currency = {
          in: filters.preferredCurrency
        }
      }

      if (filters.search) {
        whereClause.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { contact_email: { contains: filters.search, mode: 'insensitive' } },
          { company_registration: { contains: filters.search, mode: 'insensitive' } }
        ]
      }

      if (filters.createdAfter) {
        whereClause.created_at = { gte: filters.createdAfter }
      }

      if (filters.createdBefore) {
        whereClause.created_at = {
          ...whereClause.created_at,
          lte: filters.createdBefore
        }
      }

      // Execute queries
      const [vendors, total] = await Promise.all([
        (this.db as any).vendors.findMany({
          where: whereClause,
          include: {
            vendor_metrics: filters.hasMetrics ? true : false
          },
          orderBy: {
            [sortBy === 'name' ? 'name' : sortBy]: sortOrder
          },
          skip: offset,
          take: limit
        }),
        (this.db as any).vendors.count({
          where: whereClause
        })
      ])

      // Transform to application format
      const transformedVendors = await Promise.all(
        vendors.map(async (dbVendor: any) => await this.transformDbVendorToVendor(dbVendor))
      )

      return {
        success: true,
        data: transformedVendors,
        metadata: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch vendors: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Get vendor by ID with calculated metrics
   */
  async getVendorById(id: string): Promise<ServiceResult<Vendor>> {
    try {
      const dbVendor = await (this.db as any).vendors.findUnique({
        where: { id },
        include: {
          vendor_metrics: true
        }
      })

      if (!dbVendor) {
        return {
          success: false,
          error: 'Vendor not found'
        }
      }

      const vendor = await this.transformDbVendorToVendor(dbVendor)

      // Calculate enhanced performance metrics
      const performanceMetrics = await this.calculateVendorPerformanceMetrics(id)
      if (performanceMetrics.success && performanceMetrics.data) {
        vendor.onTimeDeliveryRate = performanceMetrics.data.onTimeDeliveryRate
        vendor.qualityRating = performanceMetrics.data.qualityRating
        // Note: priceCompetitiveness is not part of VendorPerformanceMetrics, using priceRating instead
        vendor.priceCompetitiveness = performanceMetrics.data.priceRating
      }

      return {
        success: true,
        data: vendor
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch vendor: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Create new vendor
   */
  async createVendor(input: CreateVendorInput): Promise<ServiceResult<Vendor>> {
    try {
      // Check for existing vendor with same email
      const existingVendor = await (this.db as any).vendors.findFirst({
        where: { contact_email: input.contactEmail }
      })

      if (existingVendor) {
        return {
          success: false,
          error: 'Vendor with this email already exists'
        }
      }

      const dbVendor = await (this.db as any).vendors.create({
        data: {
          name: input.name,
          contact_email: input.contactEmail,
          contact_phone: input.contactPhone,
          address_street: input.address?.street,
          address_city: input.address?.city,
          address_state: input.address?.state,
          address_postal_code: input.address?.postalCode,
          address_country: input.address?.country,
          status: input.status || 'active',
          preferred_currency: input.preferredCurrency || 'USD',
          payment_terms: input.paymentTerms,
          company_registration: input.companyRegistration,
          tax_id: input.taxId,
          website: input.website,
          business_type: input.businessType,
          certifications: input.certifications,
          languages: input.languages,
          notes: input.notes,
          created_by: input.createdBy
        }
      })

      // Initialize vendor metrics
      await (this.db as any).vendor_metrics.create({
        data: {
          vendor_id: dbVendor.id
        }
      })

      const vendor = await this.transformDbVendorToVendor(dbVendor)

      return {
        success: true,
        data: vendor
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to create vendor: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Update vendor
   */
  async updateVendor(id: string, input: UpdateVendorInput): Promise<ServiceResult<Vendor>> {
    try {
      // Check if vendor exists
      const existingVendor = await (this.db as any).vendors.findUnique({
        where: { id }
      })

      if (!existingVendor) {
        return {
          success: false,
          error: 'Vendor not found'
        }
      }

      // Check for email conflicts if email is being updated
      if (input.contactEmail && input.contactEmail !== existingVendor.contact_email) {
        const emailExists = await (this.db as any).vendors.findFirst({
          where: { 
            contact_email: input.contactEmail,
            id: { not: id }
          }
        })

        if (emailExists) {
          return {
            success: false,
            error: 'Another vendor with this email already exists'
          }
        }
      }

      const updateData: any = {}

      if (input.name) updateData.name = input.name
      if (input.contactEmail) updateData.contact_email = input.contactEmail
      if (input.contactPhone !== undefined) updateData.contact_phone = input.contactPhone
      if (input.address?.street !== undefined) updateData.address_street = input.address.street
      if (input.address?.city !== undefined) updateData.address_city = input.address.city
      if (input.address?.state !== undefined) updateData.address_state = input.address.state
      if (input.address?.postalCode !== undefined) updateData.address_postal_code = input.address.postalCode
      if (input.address?.country !== undefined) updateData.address_country = input.address.country
      if (input.status) updateData.status = input.status
      if (input.preferredCurrency) updateData.preferred_currency = input.preferredCurrency
      if (input.paymentTerms !== undefined) updateData.payment_terms = input.paymentTerms
      if (input.companyRegistration !== undefined) updateData.company_registration = input.companyRegistration
      if (input.taxId !== undefined) updateData.tax_id = input.taxId
      if (input.website !== undefined) updateData.website = input.website
      if (input.businessType !== undefined) updateData.business_type = input.businessType
      if (input.certifications !== undefined) updateData.certifications = input.certifications
      if (input.languages !== undefined) updateData.languages = input.languages
      if (input.notes !== undefined) updateData.notes = input.notes

      const dbVendor = await (this.db as any).vendors.update({
        where: { id },
        data: updateData,
        include: {
          vendor_metrics: true
        }
      })

      const vendor = await this.transformDbVendorToVendor(dbVendor)

      return {
        success: true,
        data: vendor
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to update vendor: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Soft delete vendor (mark as inactive)
   */
  async deleteVendor(id: string): Promise<ServiceResult<boolean>> {
    try {
      const existingVendor = await (this.db as any).vendors.findUnique({
        where: { id }
      })

      if (!existingVendor) {
        return {
          success: false,
          error: 'Vendor not found'
        }
      }

      await (this.db as any).vendors.update({
        where: { id },
        data: { status: 'inactive' }
      })

      return {
        success: true,
        data: true
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete vendor: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Calculate comprehensive vendor performance metrics
   */
  async calculateVendorPerformanceMetrics(vendorId: string): Promise<ServiceResult<VendorPerformanceMetrics>> {
    try {
      // This would typically fetch from purchase orders and delivery data
      // For now, we'll use the database metrics and supplement with calculations

      const dbMetrics = await (this.db as any).vendor_metrics.findUnique({
        where: { vendor_id: vendorId }
      })

      if (!dbMetrics) {
        return {
          success: false,
          error: 'Vendor metrics not found'
        }
      }

      // In a real implementation, this would fetch actual order data
      // For demonstration, we'll create mock order data
      const mockOrderData: VendorOrderData[] = [
        {
          orderId: 'order-1',
          orderDate: new Date('2024-01-15'),
          expectedDeliveryDate: new Date('2024-01-20'),
          actualDeliveryDate: new Date('2024-01-19'),
          orderValue: { amount: 1500, currency: 'USD' },
          isDelivered: true,
          qualityScore: 4.2,
          defectRate: 0.02,
          isOnTime: true,
          daysLate: 0,
          itemsOrdered: 50,
          itemsReceived: 50,
          itemsAccepted: 49,
          itemsRejected: 1
        }
      ]

      const performanceInput: VendorPerformanceInput = {
        vendorId,
        orders: mockOrderData,
        timeframeDays: 365
      }

      const calculationResult = await this.vendorMetrics.calculateVendorPerformance(performanceInput)

      if (!calculationResult.value) {
        return {
          success: false,
          error: 'Failed to calculate vendor performance metrics'
        }
      }

      const metrics = calculationResult.value

      const performanceMetrics: VendorPerformanceMetrics = {
        vendorId,
        period: {
          startDate: metrics.calculationPeriod.startDate,
          endDate: metrics.calculationPeriod.endDate
        },
        totalOrders: metrics.calculationPeriod.orderCount,
        totalValue: metrics.financialMetrics.totalOrderValue,
        averageOrderValue: metrics.financialMetrics.averageOrderValue,
        onTimeDeliveries: Math.floor(metrics.deliveryMetrics.onTimeDeliveryRate * metrics.calculationPeriod.orderCount / 100),
        lateDeliveries: metrics.calculationPeriod.orderCount - Math.floor(metrics.deliveryMetrics.onTimeDeliveryRate * metrics.calculationPeriod.orderCount / 100),
        onTimeDeliveryRate: metrics.deliveryMetrics.onTimeDeliveryRate,
        averageDeliveryTime: metrics.deliveryMetrics.averageDaysLate,
        qualityAcceptanceRate: 100 - metrics.qualityMetrics.rejectionRate,
        defectRate: metrics.qualityMetrics.defectRate,
        returnRate: metrics.qualityMetrics.rejectionRate,
        invoiceAccuracyRate: metrics.financialMetrics.paymentTermsCompliance,
        qualityRating: metrics.qualityMetrics.qualityRating,
        serviceRating: metrics.reliabilityMetrics.communicationScore,
        priceRating: metrics.financialMetrics.priceCompetitiveness,
        overallRating: metrics.overallRating,
        lastUpdated: new Date()
      }

      return {
        success: true,
        data: performanceMetrics
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to calculate vendor performance: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Update vendor metrics from external data sources
   */
  async updateVendorMetrics(vendorId: string, metrics: Partial<DbVendorMetrics>): Promise<ServiceResult<boolean>> {
    try {
      await (this.db as any).vendor_metrics.upsert({
        where: { vendor_id: vendorId },
        update: {
          ...metrics,
          updated_at: new Date()
        },
        create: {
          vendor_id: vendorId,
          response_rate: metrics.response_rate || 0,
          average_response_time: metrics.average_response_time || 0,
          quality_score: metrics.quality_score || 0,
          on_time_delivery_rate: metrics.on_time_delivery_rate || 0,
          total_campaigns: metrics.total_campaigns || 0,
          completed_submissions: metrics.completed_submissions || 0,
          average_completion_time: metrics.average_completion_time || 0,
          last_submission_date: metrics.last_submission_date
        }
      })

      return {
        success: true,
        data: true
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to update vendor metrics: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Transform database vendor to application vendor format
   */
  private async transformDbVendorToVendor(dbVendor: any): Promise<Vendor> {
    const addresses: VendorAddress[] = []
    const contacts: VendorContact[] = []

    // Create primary address if address data exists
    if (dbVendor.address_street || dbVendor.address_city) {
      const addressLine = [
        dbVendor.address_street,
        dbVendor.address_city,
        dbVendor.address_state
      ].filter(Boolean).join(', ')

      addresses.push({
        id: `addr-${dbVendor.id}`,
        vendorId: dbVendor.id,
        addressLine,
        postalCode: dbVendor.address_postal_code || undefined,
        country: dbVendor.address_country || undefined,
        addressType: AddressType.MAIN,
        isPrimary: true,
        isHeadOffice: true,
        isWarehouse: false
      })
    }

    // Create primary contact from vendor data
    if (dbVendor.contact_email) {
      contacts.push({
        id: `contact-${dbVendor.id}`,
        vendorId: dbVendor.id,
        name: dbVendor.name,
        email: dbVendor.contact_email,
        phone: dbVendor.contact_phone || undefined,
        isPrimary: true,
        canReceiveOrders: true,
        canReceiveInvoices: true,
        canReceivePayments: true
      })
    }

    const vendor: Vendor = {
      id: dbVendor.id,
      vendorCode: dbVendor.company_registration || `V-${dbVendor.id.slice(-8)}`,
      companyName: dbVendor.name,
      displayName: dbVendor.name,
      businessRegistrationNumber: dbVendor.company_registration || '',
      taxId: dbVendor.tax_id || '',
      vatNumber: undefined,
      establishmentDate: dbVendor.created_at.toISOString(),
      businessType: (dbVendor.business_type as VendorBusinessType) || 'distributor',
      industryCategory: undefined,
      status: this.mapDbStatusToVendorStatus(dbVendor.status),
      rating: dbVendor.vendor_metrics?.quality_score || 0,
      isActive: dbVendor.status === 'active',
      addresses,
      contacts,
      certifications: [],
      bankAccounts: [],
      preferredCurrency: dbVendor.preferred_currency,
      preferredPaymentTerms: dbVendor.payment_terms || '',
      creditLimit: undefined,
      creditDays: undefined,
      onTimeDeliveryRate: dbVendor.vendor_metrics?.on_time_delivery_rate,
      qualityRating: dbVendor.vendor_metrics?.quality_score,
      priceCompetitiveness: undefined,
      approvedBy: undefined,
      approvedAt: undefined,
      lastReviewDate: undefined,
      nextReviewDate: undefined,
      createdAt: dbVendor.created_at,
      updatedAt: dbVendor.updated_at,
      createdBy: dbVendor.created_by,
      updatedBy: undefined
    }

    return vendor
  }

  /**
   * Map database status to vendor status
   */
  private mapDbStatusToVendorStatus(dbStatus: string): VendorStatus {
    switch (dbStatus) {
      case 'active': return 'active'
      case 'inactive': return 'inactive'
      case 'suspended': return 'suspended'
      default: return 'under_review'
    }
  }

  /**
   * Get vendor statistics for dashboard
   */
  async getVendorStatistics(): Promise<ServiceResult<{
    total: number
    active: number
    inactive: number
    suspended: number
    byBusinessType: Record<string, number>
    averageRating: number
  }>> {
    try {
      const [total, statusCounts, businessTypeCounts, avgMetrics] = await Promise.all([
        (this.db as any).vendors.count(),
        (this.db as any).vendors.groupBy({
          by: ['status'],
          _count: { status: true }
        }),
        (this.db as any).vendors.groupBy({
          by: ['business_type'],
          _count: { business_type: true }
        }),
        (this.db as any).vendor_metrics.aggregate({
          _avg: { quality_score: true }
        })
      ])

      const stats = {
        total,
        active: statusCounts.find(s => s.status === 'active')?._count.status || 0,
        inactive: statusCounts.find(s => s.status === 'inactive')?._count.status || 0,
        suspended: statusCounts.find(s => s.status === 'suspended')?._count.status || 0,
        byBusinessType: businessTypeCounts.reduce((acc, item) => {
          acc[item.business_type || 'unknown'] = item._count.business_type
          return acc
        }, {} as Record<string, number>),
        averageRating: avgMetrics._avg.quality_score || 0
      }

      return {
        success: true,
        data: stats
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to get vendor statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
}

// Export singleton instance
export const vendorService = new VendorService()