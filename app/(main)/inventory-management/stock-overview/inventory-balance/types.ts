export interface LotBalance {
  lotNumber: string
  expiryDate?: string
  quantity: number
  unitCost: number
  value: number
}

export interface ProductBalance {
  id: string
  code: string
  name: string
  unit: string
  tracking: {
    batch: boolean
  }
  thresholds: {
    minimum: number
    maximum: number
  }
  totals: {
    quantity: number
    averageCost: number
    value: number
  }
  lots: LotBalance[]
}

export interface CategoryBalance {
  id: string
  code: string
  name: string
  products: ProductBalance[]
  totals: {
    quantity: number
    value: number
  }
}

export interface LocationBalance {
  id: string
  code: string
  name: string
  categories: CategoryBalance[]
  totals: {
    quantity: number
    value: number
  }
}

export interface BalanceReport {
  locations: LocationBalance[]
  totals: {
    quantity: number
    value: number
  }
}

export interface BalanceReportParams {
  asOfDate: string // YYYY-MM-DD
  locationRange: {
    from: string
    to: string
  }
  categoryRange: {
    from: string
    to: string
  }
  productRange: {
    from: string
    to: string
  }
  viewType: 'CATEGORY' | 'PRODUCT' | 'LOT'
  valuationMethod: 'FIFO' | 'WEIGHTED_AVERAGE'
  showLots: boolean
}