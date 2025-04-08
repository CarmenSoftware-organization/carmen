
export type MovementType = 
  | "STOCK_IN"
  | "STOCK_OUT"
  | "ADJUSTMENT"
  | "TRANSFER"
  | "RETURN"

export interface Location {
  id: string
  name: string
  stockOnHand: number
  availableStock: number
  reservedStock: number
}

export interface Movement {
  id: string
  date: string
  type: MovementType
  quantity: number
  unit: string
  reference: string
  notes?: string
}

export interface StockStatus {
  totalStock: number
  valueOnHand: number
  averageCost: number
  lastPurchaseDate: string
  lastMovementDate: string
}

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

export interface FilterCriteria {
  search?: string
  category?: string[]
  locations?: string[]
  stockStatus?: "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK" | "EXCESS_STOCK"
  itemStatus?: "ACTIVE" | "INACTIVE"
  dateRange?: {
    start: string
    end: string
  }
}

export interface ItemHierarchy {
  id: string
  name: string
  children?: ItemHierarchy[]
}

export interface MovementFilters {
  type?: MovementType[]
  dateRange?: {
    start: string
    end: string
  }
  reference?: string
} 