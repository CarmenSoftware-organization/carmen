export interface Address {
  id: string
  addressType: string
  addressLine: string
  subDistrictId: string
  districtId: string
  provinceId: string
  postalCode: string
  isPrimary: boolean
  street: string
  city: string
  state: string
  country: string
  type: 'BILLING' | 'SHIPPING'
}

export interface Contact {
  id: string
  name: string
  position: string
  phone: string
  email: string
  department: string
  isPrimary: boolean
  role: string
}

export interface EnvironmentalImpact {
  carbonFootprint: number
  energyEfficiencyRating: string
  wasteReduction: number
  certification: string
  renewableEnergy: number
}

export interface Certification {
  id: string
  name: string
  issuer: string
  validUntil: string
  status: 'active' | 'expired' | 'pending'
}

export interface Vendor {
  id: string
  name: string
  code: string
  companyName: string
  businessRegistrationNumber: string
  taxId: string
  establishmentDate: string
  businessTypeId: string
  isActive: boolean
  addresses: Address[]
  contacts: Contact[]
  rating: number
  environmentalImpact: EnvironmentalImpact
  certifications: Certification[]
}

export interface InventoryInfo {
  onHand: number
  onOrdered: number
  lastPrice: number
  lastOrderDate: Date
  lastVendor: string
  reorderLevel: number
  restockLevel: number
  averageMonthlyUsage: number
  inventoryUnit: string
}

export interface PurchaseRequestItem {
  id?: string
  location: string
  name: string
  description: string
  unit: string
  quantityRequested: number
  quantityApproved: number
  inventoryInfo: InventoryInfo
  currency: string
  baseCurrency?: string
  price: number
  totalAmount: number
  status?: string
  taxRate: number
  taxAmount: number
  discountRate: number
  discountAmount: number
  netAmount: number
  deliveryDate: Date
  deliveryPoint: string
  jobCode: string
  createdDate: Date
  updatedDate: Date
  createdBy: string
  updatedBy: string
  itemCategory: string
  itemSubcategory: string
  vendor: string
  pricelistNumber: string
  comment: string
  adjustments: {
    discount: boolean
    tax: boolean
  }
  taxIncluded: boolean
  currencyRate: number
  foc: number
  accountCode: string
  baseSubTotalPrice: number
  subTotalPrice: number
  baseNetAmount: number
  baseDiscAmount: number
  baseTaxAmount: number
  baseTotalAmount: number
}

export interface Money {
  amount: number
  currency: Currency
}

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY'

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'

export type TaxType = 'STANDARD' | 'REDUCED' | 'ZERO' | 'EXEMPT'

export type UnitType = 'PIECE' | 'WEIGHT' | 'VOLUME' | 'LENGTH'

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'

export interface InventoryUnit {
  id: string
  name: string
  code: string
  type: UnitType
}

export interface UnitConversion {
  fromUnit: InventoryUnit
  toUnit: InventoryUnit
  factor: number
}

export interface Product {
  id: string
  productCode: string
  name: string
  localName?: string
  description?: string
  categoryId: string
  itemGroupId: string
  basePrice: Money
  standardCost?: Money
  lastCost?: Money
  priceDeviationLimit?: number
  quantityDeviationLimit?: number
  minStockLevel?: number
  maxStockLevel?: number
  weight?: number
  shelfLife?: number
  storageInstructions?: string
  status: ProductStatus
  taxType: TaxType
  unitType: UnitType
  stockStatus: StockStatus
  inventoryUnits: InventoryUnit[]
  unitConversions: UnitConversion[]
  vendors: Vendor[]
  carbonFootprint?: number
  waterUsage?: number
  packagingRecyclability?: number
  biodegradabilityMonths?: number
  energyEfficiencyRating?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  sustainableCertification?: 'NONE' | 'FSC' | 'PEFC' | 'RSPO' | 'FAIRTRADE' | 'ORGANIC' | 'OTHER'
}