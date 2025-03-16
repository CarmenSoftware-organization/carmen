export interface Product {
  id: string
  name: string
  code: string
  category: string
  unit: string
  status: "Active" | "Inactive"
  description: string
  lastUpdated: string
  createdAt: string
  createdBy: string
  barcode?: string
  alternateUnit?: string
  conversionFactor?: number
  minimumStock?: number
  maximumStock?: number
  reorderPoint?: number
  reorderQuantity?: number
  leadTime?: number
  shelfLife?: number
  storageRequirements?: string
  tags?: string[]
}

export interface StockSummary {
  currentStock: number
  currentValue: number
  averageCost: number
  lastMovementDate: string
  lastMovementType: string
  locationCount: number
  primaryLocation: string
  totalIn: number
  totalOut: number
  netChange: number
}

export interface LocationStock {
  locationId: string
  locationName: string
  quantity: number
  value: number
  lastMovementDate: string
}

export interface LotInformation {
  lotNumber: string
  expiryDate: string
  receivedDate: string
  quantity: number
  unitCost: number
  value: number
  locationId: string
  locationName: string
  status: "Available" | "Reserved" | "Expired" | "Quarantine"
}

export interface MovementRecord {
  id: string
  date: string
  time: string
  reference: string
  referenceType: string
  locationId: string
  locationName: string
  transactionType: "IN" | "OUT" | "ADJUSTMENT"
  reason: string
  lotNumber?: string
  quantityBefore: number
  quantityAfter: number
  quantityChange: number
  unitCost: number
  valueBefore: number
  valueAfter: number
  valueChange: number
  username: string
}

export interface ValuationRecord {
  date: string
  reference: string
  transactionType: "IN" | "OUT" | "ADJUSTMENT"
  quantity: number
  unitCost: number
  value: number
  runningQuantity: number
  runningValue: number
  runningAverageCost: number
}

export interface StockCardData {
  product: Product
  summary: StockSummary
  locationStocks: LocationStock[]
  lotInformation: LotInformation[]
  movements: MovementRecord[]
  valuation: ValuationRecord[]
} 