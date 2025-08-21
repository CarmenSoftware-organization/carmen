// API Service Layer for Vendor Pricelist Management System
// Based on requirements from .kiro/specs/vendor-pricelist-management/

import { 
  Vendor, 
  VendorPricelist, 
  PricelistTemplate, 
  RequestForPricing, 
  VendorInvitation,
  PortalSession,
  PricelistItem,
  MOQPricing,
  ValidationResult,
  ApiResponse,
  PaginatedResponse,
  VendorFilters,
  RequestForPricingFilters,
  PricelistFilters,
  AuditLog,
  BusinessRule,
  EmailTemplate,
  NotificationSettings,
  SystemConfiguration
} from '../types'
import { 
  mockVendors, 
  mockCampaigns, 
  mockTemplates, 
  mockPricelists, 
  simulateApiDelay, 
  createPaginatedResponse, 
  filterVendors 
} from './mock-data'

const API_BASE_URL = '/api/price-management'

// Generic API utility functions
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      data,
      metadata: response.headers.get('X-Pagination') 
        ? JSON.parse(response.headers.get('X-Pagination') || '{}')
        : undefined
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'API_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: { endpoint, options }
      }
    }
  }
}

// Vendor Management API
const vendorApi = {
  // List vendors with filtering and pagination
  async list(
    filters: VendorFilters = {},
    page = 1,
    limit = 20
  ): Promise<ApiResponse<PaginatedResponse<Vendor>>> {
    await simulateApiDelay()
    
    const filteredVendors = filterVendors(mockVendors, filters)
    const paginatedResponse = createPaginatedResponse(filteredVendors, page, limit)
    
    return {
      success: true,
      data: paginatedResponse
    }
  },

  // Get vendor by ID
  async getById(id: string): Promise<ApiResponse<Vendor>> {
    await simulateApiDelay()
    
    const vendor = mockVendors.find(v => v.id === id)
    if (!vendor) {
      return {
        success: false,
        error: {
          code: 'VENDOR_NOT_FOUND',
          message: `Vendor with ID ${id} not found`
        }
      }
    }
    
    return {
      success: true,
      data: vendor
    }
  },

  // Create new vendor
  async create(vendor: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Vendor>> {
    return apiRequest<Vendor>('/vendors', {
      method: 'POST',
      body: JSON.stringify(vendor),
    })
  },

  // Update vendor
  async update(id: string, vendor: Partial<Vendor>): Promise<ApiResponse<Vendor>> {
    return apiRequest<Vendor>(`/vendors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vendor),
    })
  },

  // Delete vendor
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/vendors/${id}`, {
      method: 'DELETE',
    })
  },

  // Get vendor performance metrics
  async getMetrics(id: string): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/vendors/${id}/metrics`)
  },

  // Get vendor pricelist history
  async getPricelistHistory(id: string): Promise<ApiResponse<VendorPricelist[]>> {
    return apiRequest<VendorPricelist[]>(`/vendors/${id}/pricelists`)
  },

  // Update vendor status
  async updateStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<ApiResponse<Vendor>> {
    return apiRequest<Vendor>(`/vendors/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },

  // Bulk operations
  async bulkUpdate(updates: { id: string; changes: Partial<Vendor> }[]): Promise<ApiResponse<Vendor[]>> {
    return apiRequest<Vendor[]>('/vendors/bulk', {
      method: 'PATCH',
      body: JSON.stringify({ updates }),
    })
  },

  // Search vendors
  async search(query: string, limit = 10): Promise<ApiResponse<Vendor[]>> {
    await simulateApiDelay()
    
    const searchTerm = query.toLowerCase()
    const filteredVendors = mockVendors.filter(vendor => 
      vendor.name.toLowerCase().includes(searchTerm) ||
      vendor.contactEmail.toLowerCase().includes(searchTerm) ||
      vendor.businessType?.toLowerCase().includes(searchTerm) ||
      vendor.address.city.toLowerCase().includes(searchTerm) ||
      vendor.address.state.toLowerCase().includes(searchTerm)
    ).slice(0, limit)
    
    return {
      success: true,
      data: filteredVendors
    }
  }
}

// Pricelist Template API
const templateApi = {
  // List templates
  async list(page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<PricelistTemplate>>> {
    return apiRequest<PaginatedResponse<PricelistTemplate>>(`/templates?page=${page}&limit=${limit}`)
  },

  // Get template by ID
  async getById(id: string): Promise<ApiResponse<PricelistTemplate>> {
    return apiRequest<PricelistTemplate>(`/templates/${id}`)
  },

  // Create new template
  async create(template: Omit<PricelistTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<PricelistTemplate>> {
    return apiRequest<PricelistTemplate>('/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    })
  },

  // Update template
  async update(id: string, template: Partial<PricelistTemplate>): Promise<ApiResponse<PricelistTemplate>> {
    return apiRequest<PricelistTemplate>(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(template),
    })
  },

  // Delete template
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/templates/${id}`, {
      method: 'DELETE',
    })
  },

  // Generate Excel template
  async generateExcel(id: string): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiRequest<{ downloadUrl: string }>(`/templates/${id}/excel`)
  },

  // Generate collection links
  async generateLinks(id: string, vendorIds: string[]): Promise<ApiResponse<{ links: { vendorId: string; url: string; pricelistId: string }[] }>> {
    return apiRequest<{ links: { vendorId: string; url: string; pricelistId: string }[] }>(`/templates/${id}/links`, {
      method: 'POST',
      body: JSON.stringify({ vendorIds }),
    })
  },

  // Send invitations
  async sendInvitations(
    id: string, 
    vendorIds: string[], 
    settings: {
      subject?: string
      message?: string
      deadline?: Date
      reminderDays?: number[]
    }
  ): Promise<ApiResponse<VendorInvitation[]>> {
    return apiRequest<VendorInvitation[]>(`/templates/${id}/invitations`, {
      method: 'POST',
      body: JSON.stringify({ vendorIds, settings }),
    })
  },

  // Duplicate template
  async duplicate(id: string, name: string): Promise<ApiResponse<PricelistTemplate>> {
    return apiRequest<PricelistTemplate>(`/templates/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  },

  // Get template usage analytics
  async getUsage(id: string): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/templates/${id}/usage`)
  }
}

// Campaign Management API
const campaignApi = {
  // List campaigns
  async list(
    filters: RequestForPricingFilters = {},
    page = 1,
    limit = 20
  ): Promise<ApiResponse<PaginatedResponse<RequestForPricing>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            acc[key] = value.join(',')
          } else if (value instanceof Date) {
            acc[key] = value.toISOString()
          } else {
            acc[key] = value.toString()
          }
        }
        return acc
      }, {} as Record<string, string>)
    })

    return apiRequest<PaginatedResponse<RequestForPricing>>(`/campaigns?${params}`)
  },

  // Get campaign by ID
  async getById(id: string): Promise<ApiResponse<RequestForPricing>> {
    return apiRequest<RequestForPricing>(`/campaigns/${id}`)
  },

  // Create new campaign
  async create(campaign: Omit<RequestForPricing, 'id' | 'createdAt' | 'updatedAt' | 'invitations' | 'analytics'>): Promise<ApiResponse<RequestForPricing>> {
    return apiRequest<RequestForPricing>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaign),
    })
  },

  // Update campaign
  async update(id: string, campaign: Partial<RequestForPricing>): Promise<ApiResponse<RequestForPricing>> {
    return apiRequest<RequestForPricing>(`/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(campaign),
    })
  },

  // Delete campaign
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/campaigns/${id}`, {
      method: 'DELETE',
    })
  },

  // Update campaign status
  async updateStatus(id: string, status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'): Promise<ApiResponse<RequestForPricing>> {
    return apiRequest<RequestForPricing>(`/campaigns/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },

  // Get campaign analytics
  async getAnalytics(id: string): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/campaigns/${id}/analytics`)
  },

  // Get campaign invitations
  async getInvitations(id: string): Promise<ApiResponse<VendorInvitation[]>> {
    return apiRequest<VendorInvitation[]>(`/campaigns/${id}/invitations`)
  },

  // Send reminders
  async sendReminders(id: string, vendorIds?: string[]): Promise<ApiResponse<{ sent: number; failed: number }>> {
    return apiRequest<{ sent: number; failed: number }>(`/campaigns/${id}/reminders`, {
      method: 'POST',
      body: JSON.stringify({ vendorIds }),
    })
  },

  // Export campaign results
  async exportResults(id: string, format: 'excel' | 'csv' | 'pdf'): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiRequest<{ downloadUrl: string }>(`/campaigns/${id}/export?format=${format}`)
  }
}

// Pricelist Management API
const pricelistApi = {
  // List pricelists
  async list(
    filters: PricelistFilters = {},
    page = 1,
    limit = 20
  ): Promise<ApiResponse<PaginatedResponse<VendorPricelist>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            acc[key] = value.join(',')
          } else if (value instanceof Date) {
            acc[key] = value.toISOString()
          } else {
            acc[key] = value.toString()
          }
        }
        return acc
      }, {} as Record<string, string>)
    })

    return apiRequest<PaginatedResponse<VendorPricelist>>(`/pricelists?${params}`)
  },

  // Get pricelist by ID
  async getById(id: string): Promise<ApiResponse<VendorPricelist>> {
    return apiRequest<VendorPricelist>(`/pricelists/${id}`)
  },

  // Update pricelist
  async update(id: string, pricelist: Partial<VendorPricelist>): Promise<ApiResponse<VendorPricelist>> {
    return apiRequest<VendorPricelist>(`/pricelists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pricelist),
    })
  },

  // Delete pricelist
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/pricelists/${id}`, {
      method: 'DELETE',
    })
  },

  // Update pricelist status
  async updateStatus(id: string, status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'expired'): Promise<ApiResponse<VendorPricelist>> {
    return apiRequest<VendorPricelist>(`/pricelists/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },

  // Get pricelist items
  async getItems(id: string): Promise<ApiResponse<PricelistItem[]>> {
    return apiRequest<PricelistItem[]>(`/pricelists/${id}/items`)
  },

  // Add item to pricelist
  async addItem(id: string, item: Omit<PricelistItem, 'id' | 'createdAt' | 'lastModified'>): Promise<ApiResponse<PricelistItem>> {
    return apiRequest<PricelistItem>(`/pricelists/${id}/items`, {
      method: 'POST',
      body: JSON.stringify(item),
    })
  },

  // Update item
  async updateItem(pricelistId: string, itemId: string, item: Partial<PricelistItem>): Promise<ApiResponse<PricelistItem>> {
    return apiRequest<PricelistItem>(`/pricelists/${pricelistId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    })
  },

  // Delete item
  async deleteItem(pricelistId: string, itemId: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/pricelists/${pricelistId}/items/${itemId}`, {
      method: 'DELETE',
    })
  },

  // Bulk update items
  async bulkUpdateItems(id: string, updates: { itemId: string; changes: Partial<PricelistItem> }[]): Promise<ApiResponse<PricelistItem[]>> {
    return apiRequest<PricelistItem[]>(`/pricelists/${id}/items/bulk`, {
      method: 'PATCH',
      body: JSON.stringify({ updates }),
    })
  },

  // Validate pricelist
  async validate(id: string): Promise<ApiResponse<ValidationResult>> {
    return apiRequest<ValidationResult>(`/pricelists/${id}/validate`)
  },

  // Export pricelist
  async export(id: string, format: 'excel' | 'csv' | 'pdf'): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiRequest<{ downloadUrl: string }>(`/pricelists/${id}/export?format=${format}`)
  },

  // Get pricelist history
  async getHistory(id: string): Promise<ApiResponse<AuditLog[]>> {
    return apiRequest<AuditLog[]>(`/pricelists/${id}/history`)
  }
}

// Vendor Portal API
const portalApi = {
  // Authenticate with token
  async authenticate(token: string): Promise<ApiResponse<{ session: PortalSession; pricelist: VendorPricelist }>> {
    return apiRequest<{ session: PortalSession; pricelist: VendorPricelist }>('/portal/authenticate', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
  },

  // Get portal session
  async getSession(token: string): Promise<ApiResponse<PortalSession>> {
    return apiRequest<PortalSession>(`/portal/session/${token}`)
  },

  // Extend session
  async extendSession(token: string): Promise<ApiResponse<PortalSession>> {
    return apiRequest<PortalSession>(`/portal/session/${token}/extend`, {
      method: 'POST',
    })
  },

  // Auto-save pricelist data
  async autoSave(token: string, data: Partial<VendorPricelist>): Promise<ApiResponse<VendorPricelist>> {
    return apiRequest<VendorPricelist>(`/portal/autosave/${token}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Submit pricelist
  async submitPricelist(token: string, data: VendorPricelist): Promise<ApiResponse<VendorPricelist>> {
    return apiRequest<VendorPricelist>(`/portal/submit/${token}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Upload Excel file
  async uploadExcel(token: string, file: File): Promise<ApiResponse<{ items: PricelistItem[]; errors: any[] }>> {
    const formData = new FormData()
    formData.append('file', file)

    return apiRequest<{ items: PricelistItem[]; errors: any[] }>(`/portal/upload/${token}`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    })
  },

  // Get upload template
  async getTemplate(token: string): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiRequest<{ downloadUrl: string }>(`/portal/template/${token}`)
  },

  // Log activity
  async logActivity(token: string, activity: { action: string; details?: any }): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/portal/activity/${token}`, {
      method: 'POST',
      body: JSON.stringify(activity),
    })
  },

  // Get progress
  async getProgress(token: string): Promise<ApiResponse<{ completionPercentage: number; totalItems: number; completedItems: number }>> {
    return apiRequest<{ completionPercentage: number; totalItems: number; completedItems: number }>(`/portal/progress/${token}`)
  }
}

// MOQ Pricing API
const moqApi = {
  // Get MOQ pricing for item
  async getByItem(itemId: string): Promise<ApiResponse<MOQPricing[]>> {
    return apiRequest<MOQPricing[]>(`/moq/item/${itemId}`)
  },

  // Add MOQ pricing
  async create(moq: Omit<MOQPricing, 'id' | 'createdAt'>): Promise<ApiResponse<MOQPricing>> {
    return apiRequest<MOQPricing>('/moq', {
      method: 'POST',
      body: JSON.stringify(moq),
    })
  },

  // Update MOQ pricing
  async update(id: string, moq: Partial<MOQPricing>): Promise<ApiResponse<MOQPricing>> {
    return apiRequest<MOQPricing>(`/moq/${id}`, {
      method: 'PUT',
      body: JSON.stringify(moq),
    })
  },

  // Delete MOQ pricing
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/moq/${id}`, {
      method: 'DELETE',
    })
  },

  // Bulk update MOQ pricing
  async bulkUpdate(itemId: string, moqs: MOQPricing[]): Promise<ApiResponse<MOQPricing[]>> {
    return apiRequest<MOQPricing[]>(`/moq/item/${itemId}/bulk`, {
      method: 'PUT',
      body: JSON.stringify({ moqs }),
    })
  }
}

// System Administration API
const adminApi = {
  // Business rules
  rules: {
    async list(): Promise<ApiResponse<BusinessRule[]>> {
      return apiRequest<BusinessRule[]>('/admin/rules')
    },
    
    async create(rule: Omit<BusinessRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<BusinessRule>> {
      return apiRequest<BusinessRule>('/admin/rules', {
        method: 'POST',
        body: JSON.stringify(rule),
      })
    },
    
    async update(id: string, rule: Partial<BusinessRule>): Promise<ApiResponse<BusinessRule>> {
      return apiRequest<BusinessRule>(`/admin/rules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(rule),
      })
    },
    
    async delete(id: string): Promise<ApiResponse<void>> {
      return apiRequest<void>(`/admin/rules/${id}`, {
        method: 'DELETE',
      })
    }
  },

  // Email templates
  templates: {
    async list(): Promise<ApiResponse<EmailTemplate[]>> {
      return apiRequest<EmailTemplate[]>('/admin/email-templates')
    },
    
    async create(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<EmailTemplate>> {
      return apiRequest<EmailTemplate>('/admin/email-templates', {
        method: 'POST',
        body: JSON.stringify(template),
      })
    },
    
    async update(id: string, template: Partial<EmailTemplate>): Promise<ApiResponse<EmailTemplate>> {
      return apiRequest<EmailTemplate>(`/admin/email-templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(template),
      })
    },
    
    async delete(id: string): Promise<ApiResponse<void>> {
      return apiRequest<void>(`/admin/email-templates/${id}`, {
        method: 'DELETE',
      })
    }
  },

  // System configuration
  config: {
    async list(): Promise<ApiResponse<SystemConfiguration[]>> {
      return apiRequest<SystemConfiguration[]>('/admin/config')
    },
    
    async get(key: string): Promise<ApiResponse<SystemConfiguration>> {
      return apiRequest<SystemConfiguration>(`/admin/config/${key}`)
    },
    
    async update(key: string, value: any): Promise<ApiResponse<SystemConfiguration>> {
      return apiRequest<SystemConfiguration>(`/admin/config/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value }),
      })
    }
  },

  // Audit logs
  audit: {
    async list(
      filters: {
        userId?: string
        entityType?: string
        entityId?: string
        action?: string
        startDate?: Date
        endDate?: Date
      } = {},
      page = 1,
      limit = 50
    ): Promise<ApiResponse<PaginatedResponse<AuditLog>>> {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            if (value instanceof Date) {
              acc[key] = value.toISOString()
            } else {
              acc[key] = value.toString()
            }
          }
          return acc
        }, {} as Record<string, string>)
      })

      return apiRequest<PaginatedResponse<AuditLog>>(`/admin/audit?${params}`)
    }
  },

  // System health
  health: {
    async check(): Promise<ApiResponse<{ status: string; checks: Record<string, any> }>> {
      return apiRequest<{ status: string; checks: Record<string, any> }>('/admin/health')
    }
  }
}

// Export all API modules
export {
  vendorApi,
  templateApi,
  campaignApi,
  pricelistApi,
  portalApi,
  moqApi,
  adminApi
}