// Extended interfaces for pricelist editing with price input capabilities
// Based on ProductSelectionComponent but focused on price entry

import { ProductInstance, Certification } from '../../types'
import { PricelistItem, MOQPricing } from '../../types'

// Extended MOQ tier with price information
export interface PricelistMOQTier {
  id: string
  instanceId: string
  moq: number
  unit: string
  unitPrice: number      // NEW: Price for this MOQ tier
  leadTime: number       // NEW: Lead time in days
  notes?: string
  validFrom?: Date
  validTo?: Date
}

// Product instance with pricing information
export interface PricelistProductInstance extends ProductInstance {
  pricing: PricelistMOQTier[]
  notes?: string
  status: 'pending' | 'completed' | 'draft'
  qualityScore?: number
  lastModified: Date
}

// Props for the PricelistProductEditingComponent
export interface PricelistProductEditingProps {
  preSelectedProducts?: ProductInstance[]    // Products from template (optional)
  existingPriceData?: PricelistItem[]       // For editing existing pricelist
  currency: string                          // Currency from header (read-only)
  onPriceDataChange: (priceData: PricelistItem[]) => void
  onValidationChange?: (isValid: boolean) => void
  readonly?: boolean                        // For view mode
  allowProductSelection?: boolean           // Enable product selection tab
}

// Validation result for price input
export interface PriceValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

// Product with completion status
export interface PricelistProductWithStatus {
  product: any // From mockProducts
  instance: ProductInstance
  pricing: PricelistMOQTier[]
  completionStatus: 'not_started' | 'partial' | 'completed'
  validationResult: PriceValidationResult
  notes?: string
  certifications?: string[]
}

// Progress tracking
export interface PricelistEditingProgress {
  totalProducts: number
  completedProducts: number
  partialProducts: number
  completionPercentage: number
  hasErrors: boolean
  canSubmit: boolean
}
