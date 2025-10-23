/**
 * Utility Services - Main Export File
 * 
 * Centralized export for all utility services including caching,
 * exchange rates, and price calculations.
 */

// Cache manager
export { 
  CacheManager, 
  globalCacheManager, 
  Cacheable,
  type CacheStats,
  type CacheConfig 
} from './cache-manager'

// Exchange rate converter
export {
  ExchangeRateConverter,
  exchangeRateConverter,
  type ExchangeRateProvider,
  type ExchangeRateData,
  type ConversionRequest,
  type ConversionResponse
} from './exchange-rate-converter'

// Price calculator - import for local use
import { PriceCalculator } from './price-calculator'

// Re-export all price calculator types and class
export {
  PriceCalculator,
  type PricingTier,
  type BulkDiscountConfig,
  type PromotionalRule,
  type PromotionalConditions,
  type PromotionalDiscount,
  type PriceCalculationInput,
  type PriceCalculationResult,
  type AppliedDiscount,
  type PriceComparisonInput,
  type PriceComparisonResult
} from './price-calculator'

// Global utility instances
const priceCalculator = new PriceCalculator()

export {
  priceCalculator
}