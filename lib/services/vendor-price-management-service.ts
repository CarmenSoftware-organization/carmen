/**
 * Vendor Price Management Service
 * 
 * Service for managing vendor price management data
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  VendorPriceManagement,
  VendorFilters,
  SortConfig,
  PaginationConfig,
  ApiResponse
} from '../types/vendor-price-management';
import { validateVendorPriceManagement, formatValidationErrors } from '../utils/vendor-validation';

// Mock data for development - will be replaced with actual database calls
import vendorsData from '../mock/price-management/vendors.json';
const vendors = vendorsData.vendors;

/**
 * Vendor Price Management Service
 */
export class VendorPriceManagementService {
  /**
   * Get all vendors with optional filtering, sorting, and pagination
   */
  async getVendors(
    filters?: VendorFilters,
    sort?: SortConfig,
    pagination?: PaginationConfig
  ): Promise<ApiResponse<VendorPriceManagement[]>> {
    try {
      // Start with all vendors
      let filteredVendors = [...vendors];
      
      // Apply filters if provided
      if (filters) {
        if (filters.status && filters.status.length > 0) {
          filteredVendors = filteredVendors.filter(vendor => 
            filters.status!.includes(vendor.status as any)
          );
        }
        
        if (filters.categories && filters.categories.length > 0) {
          filteredVendors = filteredVendors.filter(vendor => 
            vendor.assignedCategories.some(category => 
              filters.categories!.includes(category)
            )
          );
        }
        
        if (filters.performanceRange) {
          const { field, min, max } = filters.performanceRange;
          filteredVendors = filteredVendors.filter(vendor => {
            const value = field === 'responseRate' 
              ? vendor.performanceMetrics.responseRate 
              : vendor.performanceMetrics.dataQualityScore;
            
            return value >= min && value <= max;
          });
        }
        
        if (filters.lastSubmissionRange) {
          const { startDate, endDate } = filters.lastSubmissionRange;
          filteredVendors = filteredVendors.filter(vendor => {
            if (!vendor.performanceMetrics.lastSubmissionDate) return false;
            
            const submissionDate = new Date(vendor.performanceMetrics.lastSubmissionDate);
            return submissionDate >= new Date(startDate) && 
                   submissionDate <= new Date(endDate);
          });
        }
      }
      
      // Apply sorting if provided
      if (sort) {
        filteredVendors.sort((a, b) => {
          let valueA: any;
          let valueB: any;
          
          // Handle nested properties
          if (sort.field.includes('.')) {
            const parts = sort.field.split('.');
            valueA = parts.reduce((obj: any, key) => obj?.[key], a);
            valueB = parts.reduce((obj: any, key) => obj?.[key], b);
          } else {
            valueA = a[sort.field as keyof VendorPriceManagement];
            valueB = b[sort.field as keyof VendorPriceManagement];
          }
          
          // Handle string comparison
          if (typeof valueA === 'string' && typeof valueB === 'string') {
            return sort.direction === 'asc' 
              ? valueA.localeCompare(valueB) 
              : valueB.localeCompare(valueA);
          }
          
          // Handle number/date comparison
          return sort.direction === 'asc' 
            ? (valueA > valueB ? 1 : -1) 
            : (valueA < valueB ? 1 : -1);
        });
      }
      
      // Calculate total for pagination
      const total = filteredVendors.length;
      
      // Apply pagination if provided
      if (pagination) {
        const { page, limit } = pagination;
        const startIndex = (page - 1) * limit;
        filteredVendors = filteredVendors.slice(startIndex, startIndex + limit);
      }
      
      return {
        success: true,
        data: filteredVendors as VendorPriceManagement[],
        pagination: pagination ? { ...pagination, total } : undefined
      };
    } catch (error) {
      console.error('Error getting vendors:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to retrieve vendors'
      };
    }
  }
  
  /**
   * Get a vendor by ID
   */
  async getVendorById(id: string): Promise<ApiResponse<VendorPriceManagement>> {
    try {
      const vendor = vendors.find(v => v.id === id);
      
      if (!vendor) {
        return {
          success: false,
          data: {} as VendorPriceManagement,
          message: `Vendor with ID ${id} not found`
        };
      }
      
      return {
        success: true,
        data: vendor as VendorPriceManagement
      };
    } catch (error) {
      console.error(`Error getting vendor ${id}:`, error);
      return {
        success: false,
        data: {} as VendorPriceManagement,
        message: 'Failed to retrieve vendor'
      };
    }
  }
  
  /**
   * Create a new vendor
   */
  async createVendor(vendorData: Omit<VendorPriceManagement, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<VendorPriceManagement>> {
    try {
      // Validate vendor data
      const validation = validateVendorPriceManagement({
        ...vendorData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      if (!validation.success || !validation.data) {
        return {
          success: false,
          data: {} as VendorPriceManagement,
          message: 'Validation failed',
          errors: validation.errors ? formatValidationErrors(validation.errors) as unknown as string[] : undefined
        };
      }
      
      // Check if vendor with same baseVendorId already exists
      const existingVendor = vendors.find(v => v.baseVendorId === vendorData.baseVendorId);
      if (existingVendor) {
        return {
          success: false,
          data: {} as VendorPriceManagement,
          message: `Vendor with base vendor ID ${vendorData.baseVendorId} already exists`
        };
      }
      
      // Create new vendor
      const newVendor: VendorPriceManagement = validation.data;
      
      // In a real implementation, we would save to database here
      // For now, we'll just return the new vendor
      
      return {
        success: true,
        data: newVendor,
        message: 'Vendor created successfully'
      };
    } catch (error) {
      console.error('Error creating vendor:', error);
      return {
        success: false,
        data: {} as VendorPriceManagement,
        message: 'Failed to create vendor'
      };
    }
  }
  
  /**
   * Update an existing vendor
   */
  async updateVendor(id: string, vendorData: Partial<VendorPriceManagement>): Promise<ApiResponse<VendorPriceManagement>> {
    try {
      // Find existing vendor
      const existingVendorIndex = vendors.findIndex(v => v.id === id);
      
      if (existingVendorIndex === -1) {
        return {
          success: false,
          data: {} as VendorPriceManagement,
          message: `Vendor with ID ${id} not found`
        };
      }
      
      const existingVendor = vendors[existingVendorIndex];
      
      // Merge existing vendor with updates
      const updatedVendor = {
        ...existingVendor,
        ...vendorData,
        id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString()
      };
      
      // Validate updated vendor
      const validation = validateVendorPriceManagement(updatedVendor);
      
      if (!validation.success || !validation.data) {
        return {
          success: false,
          data: {} as VendorPriceManagement,
          message: 'Validation failed',
          errors: validation.errors ? formatValidationErrors(validation.errors) as unknown as string[] : undefined
        };
      }
      
      // In a real implementation, we would update the database here
      // For now, we'll just return the updated vendor
      
      return {
        success: true,
        data: updatedVendor as VendorPriceManagement,
        message: 'Vendor updated successfully'
      };
    } catch (error) {
      console.error(`Error updating vendor ${id}:`, error);
      return {
        success: false,
        data: {} as VendorPriceManagement,
        message: 'Failed to update vendor'
      };
    }
  }
  
  /**
   * Delete a vendor
   */
  async deleteVendor(id: string): Promise<ApiResponse<{ id: string }>> {
    try {
      // Check if vendor exists
      const existingVendor = vendors.find(v => v.id === id);
      
      if (!existingVendor) {
        return {
          success: false,
          data: { id },
          message: `Vendor with ID ${id} not found`
        };
      }
      
      // In a real implementation, we would delete from database here
      // We would also check for dependencies before deletion
      
      return {
        success: true,
        data: { id },
        message: 'Vendor deleted successfully'
      };
    } catch (error) {
      console.error(`Error deleting vendor ${id}:`, error);
      return {
        success: false,
        data: { id },
        message: 'Failed to delete vendor'
      };
    }
  }
  
  /**
   * Update vendor status
   */
  async updateVendorStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<ApiResponse<VendorPriceManagement>> {
    try {
      // Find existing vendor
      const existingVendor = vendors.find(v => v.id === id);
      
      if (!existingVendor) {
        return {
          success: false,
          data: {} as VendorPriceManagement,
          message: `Vendor with ID ${id} not found`
        };
      }
      
      // Update status
      const updatedVendor = {
        ...existingVendor,
        status,
        updatedAt: new Date().toISOString()
      };
      
      // In a real implementation, we would update the database here
      
      return {
        success: true,
        data: updatedVendor as VendorPriceManagement,
        message: `Vendor status updated to ${status}`
      };
    } catch (error) {
      console.error(`Error updating vendor status ${id}:`, error);
      return {
        success: false,
        data: {} as VendorPriceManagement,
        message: 'Failed to update vendor status'
      };
    }
  }
  
  /**
   * Update vendor assigned categories
   */
  async updateVendorCategories(id: string, categories: string[]): Promise<ApiResponse<VendorPriceManagement>> {
    try {
      // Find existing vendor
      const existingVendor = vendors.find(v => v.id === id);
      
      if (!existingVendor) {
        return {
          success: false,
          data: {} as VendorPriceManagement,
          message: `Vendor with ID ${id} not found`
        };
      }
      
      // Update categories
      const updatedVendor = {
        ...existingVendor,
        assignedCategories: categories,
        updatedAt: new Date().toISOString()
      };
      
      // In a real implementation, we would update the database here
      
      return {
        success: true,
        data: updatedVendor as VendorPriceManagement,
        message: 'Vendor categories updated successfully'
      };
    } catch (error) {
      console.error(`Error updating vendor categories ${id}:`, error);
      return {
        success: false,
        data: {} as VendorPriceManagement,
        message: 'Failed to update vendor categories'
      };
    }
  }
  
  /**
   * Search vendors by name or ID
   */
  async searchVendors(query: string): Promise<ApiResponse<VendorPriceManagement[]>> {
    try {
      if (!query || query.trim() === '') {
        return this.getVendors();
      }
      
      const normalizedQuery = query.toLowerCase().trim();
      
      // Search by ID or name
      const results = vendors.filter(vendor => 
        vendor.id.toLowerCase().includes(normalizedQuery) ||
        vendor.baseVendorId.toLowerCase().includes(normalizedQuery)
      );
      
      return {
        success: true,
        data: results as VendorPriceManagement[]
      };
    } catch (error) {
      console.error('Error searching vendors:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to search vendors'
      };
    }
  }
  
  /**
   * Get vendor performance metrics
   */
  async getVendorPerformanceMetrics(id: string): Promise<ApiResponse<VendorPriceManagement['performanceMetrics']>> {
    try {
      // Find existing vendor
      const existingVendor = vendors.find(v => v.id === id);
      
      if (!existingVendor) {
        return {
          success: false,
          data: {} as VendorPriceManagement['performanceMetrics'],
          message: `Vendor with ID ${id} not found`
        };
      }
      
      return {
        success: true,
        data: existingVendor.performanceMetrics
      };
    } catch (error) {
      console.error(`Error getting vendor metrics ${id}:`, error);
      return {
        success: false,
        data: {} as VendorPriceManagement['performanceMetrics'],
        message: 'Failed to retrieve vendor metrics'
      };
    }
  }
  
  /**
   * Check if vendor exists
   */
  async vendorExists(id: string): Promise<boolean> {
    try {
      return vendors.some(v => v.id === id);
    } catch (error) {
      console.error(`Error checking vendor existence ${id}:`, error);
      return false;
    }
  }
}