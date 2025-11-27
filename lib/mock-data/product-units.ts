// Mock data for product units management

// Base Product Configuration
export interface BaseProductUnit {
  baseInventoryUnit: string
  baseInventoryUnitLabel: string
}

export const mockBaseProduct: BaseProductUnit = {
  baseInventoryUnit: "kg",
  baseInventoryUnitLabel: "Kilogram (KG)"
}

// Stock Count Units
export interface StockCountUnit {
  countUnit: string
  factor: number
  description: string
  isDefault: boolean
  isInverse: boolean
}

export const mockStockCountUnits: StockCountUnit[] = [
  {
    countUnit: "BOX",
    factor: 12.5,
    description: "Standard Box",
    isDefault: true,
    isInverse: false
  },
  {
    countUnit: "CASE",
    factor: 75,
    description: "Full Case",
    isDefault: false,
    isInverse: false
  }
]

// Order Units
export interface OrderUnit {
  unit: string
  conversionRate: number // Conversion rate to baseInventoryUnit
  isDefault: boolean
  description?: string
  isInverse: boolean
}

export interface OrderUnitRules {
  minimumOrderQuantity: number
  orderMultiple: number
  enforceOrderMultiple: boolean
  allowPartialOrders: boolean
}

export interface OrderUnitConfig {
  baseUnit: string // This should match product's baseInventoryUnit
  units: OrderUnit[]
  rules: OrderUnitRules
}

export const mockOrderUnits: OrderUnitConfig = {
  baseUnit: mockBaseProduct.baseInventoryUnit,
  units: [
    {
      unit: "BOX",
      conversionRate: 12.50000,
      isDefault: true,
      description: "Standard Box",
      isInverse: false
    },
    {
      unit: "CASE",
      conversionRate: 75.00000,
      isDefault: false,
      description: "Full Case",
      isInverse: false
    },
    {
      unit: "PALLET",
      conversionRate: 900.00000,
      isDefault: false,
      description: "Standard Pallet",
      isInverse: false
    }
  ],
  rules: {
    minimumOrderQuantity: 12.5,
    orderMultiple: 12.5,
    enforceOrderMultiple: true,
    allowPartialOrders: false
  }
}

// Combined product units configuration
export interface ProductUnitsConfig {
  baseProduct: BaseProductUnit
  orderUnits: OrderUnitConfig
  stockCountUnits: StockCountUnit[]
}

export const mockProductUnits: ProductUnitsConfig = {
  baseProduct: mockBaseProduct,
  orderUnits: mockOrderUnits,
  stockCountUnits: mockStockCountUnits
}

// Example usage:
// import { mockProductUnits } from './mock-product-units'
// const { baseProduct, orderUnits, stockCountUnits } = mockProductUnits
