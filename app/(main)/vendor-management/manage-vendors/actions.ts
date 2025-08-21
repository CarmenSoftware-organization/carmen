'use server'

import { Vendor } from '../types'
import { vendorService } from '../lib/services/vendor-service'

export async function createVendor(vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt' | 'performanceMetrics'>) {
  try {
    const result = await vendorService.createVendor(vendorData, 'current-user-id')
    
    if (result.success) {
      return { success: true, data: result.data, error: null }
    } else {
      return { success: false, data: null, error: result.error }
    }
  } catch (error) {
    return { 
      success: false,
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to create vendor' 
    }
  }
}

export async function updateVendor(vendor: Vendor) {
  try {
    const result = await vendorService.updateVendor(vendor.id, vendor, 'current-user-id')
    
    if (result.success) {
      return { success: true, data: result.data, error: null }
    } else {
      return { success: false, data: null, error: result.error }
    }
  } catch (error) {
    return { 
      success: false,
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to update vendor' 
    }
  }
}

export async function deleteVendor(vendorId: string) {
  try {
    const result = await vendorService.deleteVendor(vendorId, 'current-user-id')
    
    if (result.success) {
      return { success: true, data: result.data, error: null }
    } else {
      return { success: false, data: null, error: result.error }
    }
  } catch (error) {
    return { 
      success: false,
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to delete vendor' 
    }
  }
}

export async function getVendor(vendorId: string) {
  try {
    const result = await vendorService.getVendor(vendorId)
    
    if (result.success) {
      return { success: true, data: result.data, error: null }
    } else {
      return { success: false, data: null, error: result.error }
    }
  } catch (error) {
    return { 
      success: false,
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to get vendor' 
    }
  }
}

export async function getVendors(filters?: any) {
  try {
    const result = await vendorService.getVendor('all') // Using getVendor as placeholder since getVendors doesn't exist
    
    if (result.success) {
      return { success: true, data: result.data, error: null }
    } else {
      return { success: false, data: null, error: result.error }
    }
  } catch (error) {
    return { 
      success: false,
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to get vendors' 
    }
  }
} 