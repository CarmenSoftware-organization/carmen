/**
 * Calculation Services - Main Export File
 * 
 * Centralized export for all calculation services and utilities.
 * Provides convenient access to financial, inventory, and vendor calculations.
 */

// Base calculator
export { BaseCalculator, CalculationResult, CalculationContext, CalculationError } from './base-calculator'

// Financial calculations
export { 
  FinancialCalculations,
  type TaxCalculationInput,
  type TaxCalculationResult,
  type DiscountCalculationInput,
  type DiscountCalculationResult,
  type CurrencyConversionInput,
  type CurrencyConversionResult,
  type LineItemCalculationInput,
  type LineItemCalculationResult
} from './financial-calculations'

// Inventory calculations
export {
  InventoryCalculations,
  type StockValuationInput,
  type StockValuationResult,
  type AvailableQuantityInput,
  type AvailableQuantityResult,
  type ReorderPointInput,
  type ReorderPointResult,
  type ABCAnalysisInput,
  type ABCAnalysisResult,
  type InventoryTransactionData
} from './inventory-calculations'

// Vendor metrics
export {
  VendorMetrics,
  type VendorPerformanceInput,
  type VendorPerformanceResult,
  type VendorOrderData,
  type VendorMetricWeights,
  type VendorDeliveryMetrics,
  type VendorQualityMetrics,
  type VendorReliabilityMetrics,
  type VendorFinancialMetrics,
  type PriceComparisonInput,
  type PriceCompetitivenessResult,
  type VendorPriceData
} from './vendor-metrics'

// Global service instances
const financialCalculations = new FinancialCalculations()
const inventoryCalculations = new InventoryCalculations()
const vendorMetrics = new VendorMetrics()

export {
  financialCalculations,
  inventoryCalculations,
  vendorMetrics
}