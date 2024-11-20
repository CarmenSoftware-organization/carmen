export interface InventoryAdjustment {
  id: string
  date: string
  type: 'IN' | 'OUT'
  status: 'Draft' | 'Posted'
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

export interface StockMovementItem {
  id: string
  location: {
    type: 'INV'
    code: string
    name: string
  }
  productName: string
  sku: string
  lots: {
    lotNo: string
    quantity: number
    uom: string
  }[]
  uom: string
  unitCost: number
  totalCost: number
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
  accountCode: string
  department: string
  description: string
  debit: number
  credit: number
}
