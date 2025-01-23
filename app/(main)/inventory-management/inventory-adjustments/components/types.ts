export interface Location {
  type: string
  code: string
  name: string
}

export interface Lot {
  lotNo: string
  quantity: number
  uom: string
}

export interface StockMovementItem {
  id: string
  productName: string
  sku: string
  location: Location
  lots: Lot[]
  uom: string
  unitCost: number
  totalCost: number
}

export interface InventoryAdjustment {
  id: string
  date: string
  type: string
  status: string
  location: string
  locationCode: string
  reason: string
  description?: string
  department: string
  items: StockMovementItem[]
  totals: {
    inQty: number
    outQty: number
    totalCost: number
  }
}

export interface JournalHeader {
  status: string
  journalNo: string
  postingDate: string
  postingPeriod: string
  description: string
  reference: string
  createdBy: string
  createdAt: string
  postedBy: string
  postedAt: string
}

export interface JournalEntry {
  id: string
  account: string
  accountName: string
  debit: number
  credit: number
  department: string
  reference: string
}
