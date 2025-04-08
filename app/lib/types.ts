
export interface Address {
  id: string
  addressType: string
  addressLine: string
  subDistrictId: string
  districtId: string
  provinceId: string
  postalCode: string
  isPrimary: boolean
}

export interface Contact {
  id: string
  name: string
  position: string
  phone: string
  email: string
  department: string
  isPrimary: boolean
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