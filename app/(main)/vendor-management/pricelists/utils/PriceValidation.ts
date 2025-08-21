// Price validation utilities for pricelist editing

import { PricelistMOQTier, PriceValidationResult, PricelistProductWithStatus } from '../types/PricelistEditingTypes'

// Validate a single MOQ tier
export const validateMOQTier = (tier: PricelistMOQTier): PriceValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []

  // Required field validation
  if (!tier.moq || tier.moq <= 0) {
    errors.push('MOQ must be greater than 0')
  }

  if (!tier.unitPrice || tier.unitPrice <= 0) {
    errors.push('Unit price must be greater than 0')
  }

  if (!tier.leadTime || tier.leadTime <= 0) {
    errors.push('Lead time must be at least 1 day')
  }

  if (!tier.unit || tier.unit.trim() === '') {
    errors.push('Unit is required')
  }

  // Business logic validation
  if (tier.unitPrice && tier.unitPrice > 10000) {
    warnings?.push('Unit price seems unusually high - please verify')
  }

  if (tier.leadTime && tier.leadTime > 365) {
    warnings?.push('Lead time over 1 year - please verify')
  }

  // MOQ validation based on unit type
  if (tier.unit && tier.moq) {
    if (['g', 'ml', 'oz'].includes(tier.unit) && tier.moq < 10) {
      warnings?.push('MOQ seems low for this unit type')
    }
    if (['kg', 'L', 'lb'].includes(tier.unit) && tier.moq > 1000) {
      warnings?.push('MOQ seems high for this unit type')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Validate all MOQ tiers for a product
export const validateProductPricing = (pricing: PricelistMOQTier[]): PriceValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []

  if (pricing.length === 0) {
    errors.push('At least one price tier is required')
    return { isValid: false, errors, warnings }
  }

  // Validate each tier, but handle first tier specially
  pricing.forEach((tier, index) => {
    if (index === 0) {
      // For first tier, validate everything except MOQ (since it shows "> 0")
      if (!tier.unitPrice || tier.unitPrice <= 0) {
        errors.push(`Tier ${index + 1}: Unit price must be greater than 0`)
      }
      if (!tier.leadTime || tier.leadTime <= 0) {
        errors.push(`Tier ${index + 1}: Lead time must be at least 1 day`)
      }
      if (!tier.unit || tier.unit.trim() === '') {
        errors.push(`Tier ${index + 1}: Unit is required`)
      }
      
      // Business logic validation for first tier
      if (tier.unitPrice && tier.unitPrice > 10000) {
        warnings?.push(`Tier ${index + 1}: Unit price seems unusually high - please verify`)
      }
      if (tier.leadTime && tier.leadTime > 365) {
        warnings?.push(`Tier ${index + 1}: Lead time over 1 year - please verify`)
      }
    } else {
      // For subsequent tiers, validate normally
      const tierValidation = validateMOQTier(tier)
      if (!tierValidation.isValid) {
        errors.push(`Tier ${index + 1}: ${tierValidation.errors.join(', ')}`)
      }
      if (tierValidation.warnings) {
        warnings.push(...tierValidation.warnings.map(w => `Tier ${index + 1}: ${w}`))
      }
    }
  })

  // Validate tier relationships (MOQ should increase, price should decrease or stay same)
  // Skip relationship validation if there's only the first tier
  if (pricing.length > 1) {
    for (let i = 1; i < pricing.length; i++) {
      const prevTier = pricing[i - 1]
      const currentTier = pricing[i]
      
      // For the first comparison (tier 2 vs tier 1), treat tier 1 MOQ as minimal
      const prevMOQ = i === 1 ? 0.001 : prevTier.moq
      
      if (currentTier.moq <= prevMOQ) {
        errors.push('MOQ values should increase with each tier')
      }
      
      if (currentTier.unitPrice > prevTier.unitPrice) {
        warnings?.push('Unit price typically decreases with higher MOQ')
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Calculate completion status for a product
export const calculateProductCompletionStatus = (pricing: PricelistMOQTier[]): 'not_started' | 'partial' | 'completed' => {
  if (pricing.length === 0) {
    return 'not_started'
  }

  const completeTiers = pricing.filter((tier, index) => {
    if (index === 0) {
      // For first tier, don't check MOQ (since it shows "> 0")
      return tier.unitPrice > 0 && tier.leadTime > 0 && tier.unit.trim() !== ''
    } else {
      // For subsequent tiers, check all fields including MOQ
      return tier.unitPrice > 0 && tier.moq > 0 && tier.leadTime > 0 && tier.unit.trim() !== ''
    }
  })

  if (completeTiers.length === 0) {
    return 'not_started'
  } else if (completeTiers.length === pricing.length) {
    return 'completed'
  } else {
    return 'partial'
  }
}

// Validate entire pricelist
export const validatePricelist = (products: PricelistProductWithStatus[]): PriceValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []

  if (products.length === 0) {
    errors.push('No products found to price')
    return { isValid: false, errors, warnings }
  }

  let hasValidProducts = false
  products.forEach((productStatus, index) => {
    const productValidation = validateProductPricing(productStatus.pricing)
    if (productValidation.isValid) {
      hasValidProducts = true
    } else {
      errors.push(`Product "${productStatus.product.name}": ${productValidation.errors.join(', ')}`)
    }
    
    if (productValidation.warnings) {
      warnings.push(...productValidation.warnings.map(w => `Product "${productStatus.product.name}": ${w}`))
    }
  })

  if (!hasValidProducts) {
    errors.push('At least one product must have complete pricing')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Helper to get smart MOQ defaults based on unit type
export const getSmartMOQDefault = (unit: string, existingMOQ?: number): number => {
  // If there's an existing MOQ, increment intelligently
  if (existingMOQ && existingMOQ > 0) {
    if (existingMOQ < 1) return Math.round((existingMOQ + 0.01) * 1000) / 1000   // For fractional quantities, increment by 0.01
    if (existingMOQ < 10) return existingMOQ + 1
    if (existingMOQ < 100) return existingMOQ + 10
    return existingMOQ + 100
  }

  // Set smart defaults based on unit type - allowing fractional quantities
  if (['g', 'ml', 'oz'].includes(unit)) return 100     // Smaller units need higher quantities
  if (['kg', 'L', 'lb'].includes(unit)) return 0.5     // Larger units can start with fractional amounts
  if (['piece', 'box', 'pack'].includes(unit)) return 1 // Count-based units typically whole numbers
  return 0.001  // Default fallback allows very small fractional quantities
}

// Helper to get smart lead time defaults
export const getSmartLeadTimeDefault = (unit: string): number => {
  // Different lead times based on unit complexity
  if (['piece', 'box', 'pack'].includes(unit)) return 3    // Manufactured items
  if (['kg', 'L', 'lb', 'g', 'ml', 'oz'].includes(unit)) return 7    // Raw materials
  return 5  // Default
}

// Format price for display
export const formatPrice = (price: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

// Format MOQ for display
export const formatMOQ = (moq: number, unit: string): string => {
  return `${moq.toLocaleString()} ${unit}${moq !== 1 ? 's' : ''}`
}