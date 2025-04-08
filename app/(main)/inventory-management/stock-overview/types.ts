
// Consolidated types for inventory management stock overview

// Movement Types
export type MovementType = 
  | "STOCK_IN"
  | "STOCK_OUT"
  | "ADJUSTMENT"
  | "TRANSFER"
  | "RETURN"

// Transaction Types (used in some components)
export type TransactionType = "IN" | "OUT" | "ADJUSTMENT"

// Product Information
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
  // Additional fields used in stock cards list
  currentStock?: number
  value?: number
  averageCost?: number
  lastMovementDate?: string
  locationCount?: number
}

// Location Information
export interface Location {
  id: string
  name: string
  stockOnHand: number
  availableStock: number
  reservedStock: number
}

// Location Stock Information (extended location info)
export interface LocationStock {
  locationId: string
  locationName: string
  quantity: number
  value: number
  lastMovementDate: string
}

// Stock Status Information
export interface StockStatus {
  totalStock: number
  valueOnHand: number
  averageCost: number
  lastPurchaseDate: string
  lastMovementDate: string
}

// Stock Summary Information
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

// Movement Information
export interface Movement {
  id: string
  date: string
  type: MovementType
  quantity: number
  unit: string
  reference: string
  notes?: string
}

// Extended Movement Record
export interface MovementRecord {
  id: string
  date: string
  time: string
  reference: string
  referenceType: string
  locationId: string
  locationName: string
  transactionType: TransactionType
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

// Lot Information
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

// Valuation Record
export interface ValuationRecord {
  date: string
  reference: string
  transactionType: TransactionType
  quantity: number
  unitCost: number
  value: number
  runningQuantity: number
  runningValue: number
  runningAverageCost: number
}

// Filter Criteria
export interface FilterCriteria {
  search: string
  locations: string[]
  itemStatus: string
  stockStatus: string
  dateRange?: {
    from: string
    to: string
  }
}

// Movement Filters
export interface MovementFilters {
  type?: MovementType[]
  dateRange?: {
    start: string
    end: string
  }
  reference?: string
}

// Item Hierarchy
export interface ItemHierarchy {
  id: string
  name: string
  children?: ItemHierarchy[]
}

// Stock Card
export interface StockCard {
  id: string
  itemId: string
  itemCode: string
  itemName: string
  category: string
  uom: string
  currentStock: StockStatus
  minStock: number
  maxStock: number
  locations: Location[]
  movements: Movement[]
}

// Stock Card Data
export interface StockCardData {
  product: Product
  summary: StockSummary
  locationStocks: LocationStock[]
  lotInformation: LotInformation[]
  movements: MovementRecord[]
  valuation: ValuationRecord[]
} 