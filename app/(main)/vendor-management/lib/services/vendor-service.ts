// Comprehensive Vendor Service - Phase 1 Task 2
// Implements full CRUD operations with validation and business rules

import { 
  Vendor, 
  VendorMetrics, 
  VendorFilters, 
  ValidationResult,
  ValidationError,
  ApiResponse,
  PaginatedResponse,
  AuditLog
} from '../../types'
import { vendorApi } from '../api'

// Vendor validation schemas and business rules
export interface VendorValidationRules {
  companyName: {
    required: boolean
    minLength: number
    maxLength: number
    pattern?: RegExp
  }
  contactEmail: {
    required: boolean
    pattern: RegExp
  }
  contactPhone: {
    required: boolean
    pattern: RegExp
  }
  address: {
    required: boolean
    fields: {
      street: { required: boolean; minLength: number }
      city: { required: boolean; minLength: number }
      state: { required: boolean; minLength: number }
      postalCode: { required: boolean; pattern: RegExp }
      country: { required: boolean; minLength: number }
    }
  }
  status: {
    allowedValues: ('active' | 'inactive' | 'suspended')[]
  }
  preferredCurrency: {
    required: boolean
    allowedValues: string[]
  }
}

// Default validation rules
const DEFAULT_VALIDATION_RULES: VendorValidationRules = {
  companyName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-\.\,\&]+$/
  },
  contactEmail: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  contactPhone: {
    required: true,
    pattern: /^\+?[\d\s\-\(\)]+$/
  },
  address: {
    required: true,
    fields: {
      street: { required: true, minLength: 5 },
      city: { required: true, minLength: 2 },
      state: { required: true, minLength: 2 },
      postalCode: { required: true, pattern: /^[\d\-\s]+$/ },
      country: { required: true, minLength: 2 }
    }
  },
  status: {
    allowedValues: ['active', 'inactive', 'suspended']
  },
  preferredCurrency: {
    required: true,
    allowedValues: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY']
  }
}

// Business rules for vendor operations
export interface VendorBusinessRules {
  allowDuplicateNames: boolean
  requireUniqueEmail: boolean
  requireUniquePhone: boolean
  autoActivateNewVendors: boolean
  requireApprovalForStatusChange: boolean
  maxVendorsPerUser: number
  requiredDocuments: string[]
  autoGenerateVendorCode: boolean
}

const DEFAULT_BUSINESS_RULES: VendorBusinessRules = {
  allowDuplicateNames: false,
  requireUniqueEmail: true,
  requireUniquePhone: true,
  autoActivateNewVendors: true,
  requireApprovalForStatusChange: false,
  maxVendorsPerUser: 1000,
  requiredDocuments: ['businessLicense', 'taxCertificate'],
  autoGenerateVendorCode: true
}

// Vendor service class with comprehensive CRUD operations
export class VendorService {
  private validationRules: VendorValidationRules
  private businessRules: VendorBusinessRules
  private auditEnabled: boolean = true

  constructor(
    validationRules: VendorValidationRules = DEFAULT_VALIDATION_RULES,
    businessRules: VendorBusinessRules = DEFAULT_BUSINESS_RULES
  ) {
    this.validationRules = validationRules
    this.businessRules = businessRules
  }

  // Create new vendor with validation
  async createVendor(
    vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt' | 'performanceMetrics'>,
    userId: string
  ): Promise<ApiResponse<Vendor>> {
    try {
      // Validate vendor data
      const validation = await this.validateVendor(vendorData)
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Vendor validation failed',
            details: { errors: validation.errors }
          }
        }
      }

      // Apply business rules
      const businessRuleCheck = await this.applyBusinessRules(vendorData, 'create')
      if (!businessRuleCheck.isValid) {
        return {
          success: false,
          error: {
            code: 'BUSINESS_RULE_ERROR',
            message: 'Business rule validation failed',
            details: { errors: businessRuleCheck.errors }
          }
        }
      }

      // Initialize performance metrics
      const initialMetrics: VendorMetrics = {
        responseRate: 0,
        averageResponseTime: 0,
        qualityScore: 0,
        onTimeDeliveryRate: 0,
        totalCampaigns: 0,
        completedSubmissions: 0,
        averageCompletionTime: 0
      }

      // Prepare vendor data for creation
      const newVendor = {
        ...vendorData,
        status: this.businessRules.autoActivateNewVendors ? 'active' as const : 'inactive' as const,
        performanceMetrics: initialMetrics,
        createdBy: userId
      }

      // Create vendor via API
      const result = await vendorApi.create(newVendor)

      // Log audit trail
      if (result.success && result.data && this.auditEnabled) {
        await this.logAuditEvent(
          userId,
          'CREATE_VENDOR',
          'vendor',
          result.data.id,
          undefined,
          newVendor,
          'Vendor created successfully'
        )
      }

      return result
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: { operation: 'createVendor', vendorData }
        }
      }
    }
  }

  // Get vendor by ID with error handling
  async getVendor(id: string): Promise<ApiResponse<Vendor>> {
    try {
      if (!id || typeof id !== 'string') {
        return {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Valid vendor ID is required',
            details: { id }
          }
        }
      }

      return await vendorApi.getById(id)
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: { operation: 'getVendor', id }
        }
      }
    }
  }

  // Update vendor with validation and business rules
  async updateVendor(
    id: string,
    updates: Partial<Vendor>,
    userId: string
  ): Promise<ApiResponse<Vendor>> {
    try {
      // Get current vendor data
      const currentResult = await this.getVendor(id)
      if (!currentResult.success || !currentResult.data) {
        return currentResult
      }

      const currentVendor = currentResult.data

      // Merge updates with current data for validation
      const updatedVendor = { ...currentVendor, ...updates }

      // Validate updated vendor data
      const validation = await this.validateVendor(updatedVendor)
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Vendor validation failed',
            details: { errors: validation.errors }
          }
        }
      }

      // Apply business rules for update
      const businessRuleCheck = await this.applyBusinessRules(updatedVendor, 'update', currentVendor)
      if (!businessRuleCheck.isValid) {
        return {
          success: false,
          error: {
            code: 'BUSINESS_RULE_ERROR',
            message: 'Business rule validation failed',
            details: { errors: businessRuleCheck.errors }
          }
        }
      }

      // Update vendor via API
      const result = await vendorApi.update(id, updates)

      // Log audit trail
      if (result.success && this.auditEnabled) {
        await this.logAuditEvent(
          userId,
          'UPDATE_VENDOR',
          'vendor',
          id,
          currentVendor,
          updates,
          'Vendor updated successfully'
        )
      }

      return result
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: { operation: 'updateVendor', id, updates }
        }
      }
    }
  }

  // Delete vendor with business rule validation
  async deleteVendor(id: string, userId: string): Promise<ApiResponse<void>> {
    try {
      // Get current vendor data for audit
      const currentResult = await this.getVendor(id)
      if (!currentResult.success || !currentResult.data) {
        return {
          success: false,
          error: {
            code: 'VENDOR_NOT_FOUND',
            message: 'Vendor not found',
            details: { id }
          }
        }
      }

      const currentVendor = currentResult.data

      // Check if vendor can be deleted (business rules)
      const canDelete = await this.canDeleteVendor(id)
      if (!canDelete.allowed) {
        return {
          success: false,
          error: {
            code: 'DELETE_NOT_ALLOWED',
            message: canDelete.reason || 'Vendor cannot be deleted',
            details: { id, reason: canDelete.reason }
          }
        }
      }

      // Delete vendor via API
      const result = await vendorApi.delete(id)

      // Log audit trail
      if (result.success && this.auditEnabled) {
        await this.logAuditEvent(
          userId,
          'DELETE_VENDOR',
          'vendor',
          id,
          currentVendor,
          undefined,
          'Vendor deleted successfully'
        )
      }

      return result
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: { operation: 'deleteVendor', id }
        }
      }
    }
  }

  // List vendors with advanced filtering and pagination
  async listVendors(
    filters: VendorFilters = {},
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'name',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<ApiResponse<PaginatedResponse<Vendor>>> {
    try {
      // Validate pagination parameters
      if (page < 1) page = 1
      if (limit < 1 || limit > 100) limit = 20

      // Sanitize filters
      const sanitizedFilters = this.sanitizeFilters(filters)

      // Get vendors from API
      const result = await vendorApi.list(sanitizedFilters, page, limit)

      // Apply client-side sorting if needed
      if (result.success && result.data) {
        result.data.items = this.sortVendors(result.data.items, sortBy, sortOrder)
      }

      return result
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: { operation: 'listVendors', filters, page, limit }
        }
      }
    }
  }

  // Search vendors with advanced text search
  async searchVendors(
    query: string,
    filters: VendorFilters = {},
    limit: number = 20
  ): Promise<ApiResponse<Vendor[]>> {
    try {
      if (!query || query.trim().length < 2) {
        return {
          success: false,
          error: {
            code: 'INVALID_SEARCH_QUERY',
            message: 'Search query must be at least 2 characters long',
            details: { query }
          }
        }
      }

      // Sanitize search query
      const sanitizedQuery = query.trim().toLowerCase()

      // Apply search via API
      const result = await vendorApi.search(sanitizedQuery, limit)

      // Apply additional filters if provided
      if (result.success && result.data && Object.keys(filters).length > 0) {
        result.data = this.applyClientFilters(result.data, filters)
      }

      return result
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: { operation: 'searchVendors', query, filters }
        }
      }
    }
  }

  // Update vendor status with business rules
  async updateVendorStatus(
    id: string,
    newStatus: 'active' | 'inactive' | 'suspended',
    userId: string,
    reason?: string
  ): Promise<ApiResponse<Vendor>> {
    try {
      // Get current vendor
      const currentResult = await this.getVendor(id)
      if (!currentResult.success || !currentResult.data) {
        return currentResult
      }

      const currentVendor = currentResult.data

      // Check if status change is allowed
      const canChangeStatus = await this.canChangeVendorStatus(
        currentVendor.status,
        newStatus,
        userId
      )

      if (!canChangeStatus.allowed) {
        return {
          success: false,
          error: {
            code: 'STATUS_CHANGE_NOT_ALLOWED',
            message: canChangeStatus.reason || 'Status change not allowed',
            details: { currentStatus: currentVendor.status, newStatus, reason: canChangeStatus.reason }
          }
        }
      }

      // Update status via API
      const result = await vendorApi.updateStatus(id, newStatus)

      // Log audit trail
      if (result.success && this.auditEnabled) {
        await this.logAuditEvent(
          userId,
          'UPDATE_VENDOR_STATUS',
          'vendor',
          id,
          { status: currentVendor.status },
          { status: newStatus, reason },
          `Vendor status changed from ${currentVendor.status} to ${newStatus}`
        )
      }

      return result
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: { operation: 'updateVendorStatus', id, newStatus, reason }
        }
      }
    }
  }

  // Bulk operations for vendors
  async bulkUpdateVendors(
    updates: { id: string; changes: Partial<Vendor> }[],
    userId: string
  ): Promise<ApiResponse<{ successful: string[]; failed: { id: string; error: string }[] }>> {
    try {
      const successful: string[] = []
      const failed: { id: string; error: string }[] = []

      // Process each update
      for (const update of updates) {
        const result = await this.updateVendor(update.id, update.changes, userId)
        if (result.success) {
          successful.push(update.id)
        } else {
          failed.push({
            id: update.id,
            error: result.error?.message || 'Unknown error'
          })
        }
      }

      return {
        success: true,
        data: { successful, failed }
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: { operation: 'bulkUpdateVendors', updates }
        }
      }
    }
  }

  // Get vendor performance metrics
  async getVendorMetrics(id: string): Promise<ApiResponse<VendorMetrics>> {
    try {
      const result = await vendorApi.getMetrics(id)
      return result
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: { operation: 'getVendorMetrics', id }
        }
      }
    }
  }

  // Private helper methods

  // Validate vendor data against rules
  private async validateVendor(vendor: Partial<Vendor>): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []

    // Company name validation
    if (this.validationRules.companyName.required && !vendor.name) {
      errors.push({
        field: 'name',
        code: 'REQUIRED',
        message: 'Company name is required',
        severity: 'error'
      })
    } else if (vendor.name) {
      if (vendor.name.length < this.validationRules.companyName.minLength) {
        errors.push({
          field: 'name',
          code: 'TOO_SHORT',
          message: `Company name must be at least ${this.validationRules.companyName.minLength} characters`,
          severity: 'error'
        })
      }
      if (vendor.name.length > this.validationRules.companyName.maxLength) {
        errors.push({
          field: 'name',
          code: 'TOO_LONG',
          message: `Company name must be no more than ${this.validationRules.companyName.maxLength} characters`,
          severity: 'error'
        })
      }
      if (this.validationRules.companyName.pattern && !this.validationRules.companyName.pattern.test(vendor.name)) {
        errors.push({
          field: 'name',
          code: 'INVALID_FORMAT',
          message: 'Company name contains invalid characters',
          severity: 'error'
        })
      }
    }

    // Email validation
    if (this.validationRules.contactEmail.required && !vendor.contactEmail) {
      errors.push({
        field: 'contactEmail',
        code: 'REQUIRED',
        message: 'Contact email is required',
        severity: 'error'
      })
    } else if (vendor.contactEmail && !this.validationRules.contactEmail.pattern.test(vendor.contactEmail)) {
      errors.push({
        field: 'contactEmail',
        code: 'INVALID_FORMAT',
        message: 'Invalid email format',
        severity: 'error'
      })
    }

    // Phone validation
    if (this.validationRules.contactPhone.required && !vendor.contactPhone) {
      errors.push({
        field: 'contactPhone',
        code: 'REQUIRED',
        message: 'Contact phone is required',
        severity: 'error'
      })
    } else if (vendor.contactPhone && !this.validationRules.contactPhone.pattern.test(vendor.contactPhone)) {
      errors.push({
        field: 'contactPhone',
        code: 'INVALID_FORMAT',
        message: 'Invalid phone number format',
        severity: 'error'
      })
    }

    // Address validation
    if (this.validationRules.address.required && !vendor.address) {
      errors.push({
        field: 'address',
        code: 'REQUIRED',
        message: 'Address is required',
        severity: 'error'
      })
    } else if (vendor.address) {
      const addressRules = this.validationRules.address.fields
      
      if (addressRules.street.required && !vendor.address.street) {
        errors.push({
          field: 'address.street',
          code: 'REQUIRED',
          message: 'Street address is required',
          severity: 'error'
        })
      }
      
      if (addressRules.city.required && !vendor.address.city) {
        errors.push({
          field: 'address.city',
          code: 'REQUIRED',
          message: 'City is required',
          severity: 'error'
        })
      }
      
      if (addressRules.state.required && !vendor.address.state) {
        errors.push({
          field: 'address.state',
          code: 'REQUIRED',
          message: 'State is required',
          severity: 'error'
        })
      }
      
      if (addressRules.postalCode.required && !vendor.address.postalCode) {
        errors.push({
          field: 'address.postalCode',
          code: 'REQUIRED',
          message: 'Postal code is required',
          severity: 'error'
        })
      } else if (vendor.address.postalCode && !addressRules.postalCode.pattern.test(vendor.address.postalCode)) {
        errors.push({
          field: 'address.postalCode',
          code: 'INVALID_FORMAT',
          message: 'Invalid postal code format',
          severity: 'error'
        })
      }
      
      if (addressRules.country.required && !vendor.address.country) {
        errors.push({
          field: 'address.country',
          code: 'REQUIRED',
          message: 'Country is required',
          severity: 'error'
        })
      }
    }

    // Status validation
    if (vendor.status && !this.validationRules.status.allowedValues.includes(vendor.status)) {
      errors.push({
        field: 'status',
        code: 'INVALID_VALUE',
        message: `Invalid status. Allowed values: ${this.validationRules.status.allowedValues.join(', ')}`,
        severity: 'error'
      })
    }

    // Currency validation
    if (this.validationRules.preferredCurrency.required && !vendor.preferredCurrency) {
      errors.push({
        field: 'preferredCurrency',
        code: 'REQUIRED',
        message: 'Preferred currency is required',
        severity: 'error'
      })
    } else if (vendor.preferredCurrency && !this.validationRules.preferredCurrency.allowedValues.includes(vendor.preferredCurrency)) {
      errors.push({
        field: 'preferredCurrency',
        code: 'INVALID_VALUE',
        message: `Invalid currency. Allowed values: ${this.validationRules.preferredCurrency.allowedValues.join(', ')}`,
        severity: 'error'
      })
    }

    // Calculate quality score
    const qualityScore = Math.max(0, 100 - (errors.length * 10) - (warnings.length * 5))

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      qualityScore,
      validatedFields: Object.keys(vendor),
      timestamp: new Date()
    }
  }

  // Apply business rules
  private async applyBusinessRules(
    vendor: Partial<Vendor>,
    operation: 'create' | 'update',
    currentVendor?: Vendor
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []

    // Check for duplicate name
    if (!this.businessRules.allowDuplicateNames && vendor.name) {
      // This would require an API call to check for duplicates
      // For now, we'll assume it's handled at the API level
    }

    // Check for unique email
    if (this.businessRules.requireUniqueEmail && vendor.contactEmail) {
      // This would require an API call to check for duplicates
      // For now, we'll assume it's handled at the API level
    }

    // Check for unique phone
    if (this.businessRules.requireUniquePhone && vendor.contactPhone) {
      // This would require an API call to check for duplicates
      // For now, we'll assume it's handled at the API level
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      qualityScore: Math.max(0, 100 - (errors.length * 10) - (warnings.length * 5)),
      validatedFields: Object.keys(vendor),
      timestamp: new Date()
    }
  }

  // Check if vendor can be deleted
  private async canDeleteVendor(id: string): Promise<{ allowed: boolean; reason?: string }> {
    // Check if vendor has active campaigns or pricelists
    // This would require API calls to check dependencies
    // For now, we'll assume it's allowed
    return { allowed: true }
  }

  // Check if vendor status can be changed
  private async canChangeVendorStatus(
    currentStatus: string,
    newStatus: string,
    userId: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Implement business rules for status changes
    // For now, we'll allow all status changes
    return { allowed: true }
  }

  // Sanitize filters
  private sanitizeFilters(filters: VendorFilters): VendorFilters {
    const sanitized: VendorFilters = {}

    if (filters.status) {
      sanitized.status = filters.status.filter(status => 
        this.validationRules.status.allowedValues.includes(status)
      )
    }

    if (filters.currency) {
      sanitized.currency = filters.currency.filter(currency => 
        this.validationRules.preferredCurrency.allowedValues.includes(currency)
      )
    }

    if (filters.search) {
      sanitized.search = filters.search.trim().substring(0, 100)
    }

    if (filters.performanceMin !== undefined) {
      sanitized.performanceMin = Math.max(0, Math.min(100, filters.performanceMin))
    }

    if (filters.performanceMax !== undefined) {
      sanitized.performanceMax = Math.max(0, Math.min(100, filters.performanceMax))
    }

    if (filters.responseRateMin !== undefined) {
      sanitized.responseRateMin = Math.max(0, Math.min(100, filters.responseRateMin))
    }

    if (filters.lastSubmissionAfter) {
      sanitized.lastSubmissionAfter = filters.lastSubmissionAfter
    }

    if (filters.lastSubmissionBefore) {
      sanitized.lastSubmissionBefore = filters.lastSubmissionBefore
    }

    return sanitized
  }

  // Sort vendors
  private sortVendors(vendors: Vendor[], sortBy: string, sortOrder: 'asc' | 'desc'): Vendor[] {
    return vendors.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'performanceScore':
          comparison = a.performanceMetrics.qualityScore - b.performanceMetrics.qualityScore
          break
        default:
          comparison = a.name.localeCompare(b.name)
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })
  }

  // Apply client-side filters
  private applyClientFilters(vendors: Vendor[], filters: VendorFilters): Vendor[] {
    return vendors.filter(vendor => {
      if (filters.status && !filters.status.includes(vendor.status)) {
        return false
      }

      if (filters.currency && !filters.currency.includes(vendor.preferredCurrency)) {
        return false
      }

      if (filters.performanceMin !== undefined && vendor.performanceMetrics.qualityScore < filters.performanceMin) {
        return false
      }

      if (filters.performanceMax !== undefined && vendor.performanceMetrics.qualityScore > filters.performanceMax) {
        return false
      }

      if (filters.responseRateMin !== undefined && vendor.performanceMetrics.responseRate < filters.responseRateMin) {
        return false
      }

      if (filters.lastSubmissionAfter && vendor.performanceMetrics.lastSubmissionDate) {
        if (new Date(vendor.performanceMetrics.lastSubmissionDate) < filters.lastSubmissionAfter) {
          return false
        }
      }

      if (filters.lastSubmissionBefore && vendor.performanceMetrics.lastSubmissionDate) {
        if (new Date(vendor.performanceMetrics.lastSubmissionDate) > filters.lastSubmissionBefore) {
          return false
        }
      }

      return true
    })
  }

  // Log audit events
  private async logAuditEvent(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    oldValues?: any,
    newValues?: any,
    context?: string
  ): Promise<void> {
    try {
      // This would log to the audit system
      // For now, we'll just console.log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Audit Event:', {
          userId,
          action,
          entityType,
          entityId,
          oldValues,
          newValues,
          context,
          timestamp: new Date()
        })
      }
    } catch (error) {
      // Audit logging should not fail the main operation
      console.error('Failed to log audit event:', error)
    }
  }
}

// Export singleton instance
export const vendorService = new VendorService()
export default vendorService