'use server'

import { Vendor } from './[id]/types'

export async function updateVendor(vendor: Vendor) {
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return { data: vendor, error: null }
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to update vendor' 
    }
  }
} 