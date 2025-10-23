import { Location, Money } from '../types'
import { mockLocations, mockProducts } from './index'

export interface LocationStockData {
  locationId: string
  locationName: string
  metrics: {
    totalItems: number
    totalValue: Money
    lowStockCount: number
    expiringCount: number
    turnoverRate: number
    lastCountDate: Date
  }
  categories: CategoryStock[]
  recentMovements: StockMovement[]
}

export interface CategoryStock {
  categoryId: string
  categoryName: string
  quantity: number
  value: Money
  lowStockItems: number
}

export interface StockMovement {
  id: string
  itemCode: string
  itemName: string
  fromLocation: string
  toLocation: string
  quantity: number
  reason: string
  performedBy: string
  timestamp: Date
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled'
}

export interface LocationComparison {
  locationId: string
  locationName: string
  performance: 'excellent' | 'good' | 'average' | 'poor'
  metrics: {
    stockEfficiency: number  // 0-100
    turnoverRate: number
    wastePercentage: number
    fillRate: number  // % of optimal stock level
  }
}

// Generate stock data for a specific location
export const generateLocationStock = (locationId: string): LocationStockData => {
  const location = mockLocations.find(l => l.id === locationId)
  if (!location) throw new Error(`Location ${locationId} not found`)

  // Simulate different stock levels based on location type
  const stockMultipliers = {
    'loc-001': 1.2, // Main Hotel - highest stock
    'loc-002': 0.8, // Restaurant Kitchen - medium stock
    'loc-003': 0.4, // Pool Bar - lowest stock
    'loc-004': 0.6, // Conference Center - medium-low
    'loc-005': 0.3, // Spa & Wellness - specialized items
    'loc-006': 0.5  // Beach Club - seasonal variations
  }

  const multiplier = stockMultipliers[locationId as keyof typeof stockMultipliers] || 0.7

  const categories: CategoryStock[] = [
    {
      categoryId: 'food',
      categoryName: 'Food',
      quantity: Math.floor(150 * multiplier),
      value: { amount: Math.floor(25000 * multiplier), currency: 'USD' },
      lowStockItems: Math.floor(8 * multiplier)
    },
    {
      categoryId: 'beverages',
      categoryName: 'Beverages',
      quantity: Math.floor(80 * multiplier),
      value: { amount: Math.floor(12000 * multiplier), currency: 'USD' },
      lowStockItems: Math.floor(3 * multiplier)
    },
    {
      categoryId: 'cleaning',
      categoryName: 'Cleaning Supplies',
      quantity: Math.floor(40 * multiplier),
      value: { amount: Math.floor(3000 * multiplier), currency: 'USD' },
      lowStockItems: Math.floor(2 * multiplier)
    },
    {
      categoryId: 'linen',
      categoryName: 'Linen & Textiles',
      quantity: Math.floor(200 * multiplier),
      value: { amount: Math.floor(8000 * multiplier), currency: 'USD' },
      lowStockItems: Math.floor(5 * multiplier)
    }
  ]

  const totalItems = categories.reduce((sum, cat) => sum + cat.quantity, 0)
  const totalValue = categories.reduce((sum, cat) => sum + cat.value.amount, 0)
  const lowStockCount = categories.reduce((sum, cat) => sum + cat.lowStockItems, 0)

  return {
    locationId,
    locationName: location.name,
    metrics: {
      totalItems,
      totalValue: { amount: totalValue, currency: 'USD' },
      lowStockCount,
      expiringCount: Math.floor(Math.random() * 15 * multiplier),
      turnoverRate: Math.random() * 8 + 2, // 2-10 times per year
      lastCountDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Within last 30 days
    },
    categories,
    recentMovements: generateRecentMovements(locationId, 5)
  }
}

// Generate recent stock movements for a location
export const generateRecentMovements = (locationId: string, count: number): StockMovement[] => {
  const movements: StockMovement[] = []
  const otherLocations = mockLocations.filter(l => l.id !== locationId)
  const sampleItems = mockProducts.slice(0, 10)

  for (let i = 0; i < count; i++) {
    const isIncoming = Math.random() > 0.5
    const otherLocation = otherLocations[Math.floor(Math.random() * otherLocations.length)]
    const item = sampleItems[Math.floor(Math.random() * sampleItems.length)]

    movements.push({
      id: `mov-${locationId}-${i}`,
      itemCode: item.productCode,
      itemName: item.productName,
      fromLocation: isIncoming ? otherLocation.name : mockLocations.find(l => l.id === locationId)!.name,
      toLocation: isIncoming ? mockLocations.find(l => l.id === locationId)!.name : otherLocation.name,
      quantity: Math.floor(Math.random() * 50) + 1,
      reason: isIncoming ? 'Stock replenishment' : 'Transfer request',
      performedBy: 'Maria Rodriguez',
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      status: Math.random() > 0.8 ? 'pending' : 'completed'
    })
  }

  return movements.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

// Get stock data for all locations
export const getAllLocationStock = (): LocationStockData[] => {
  return mockLocations.map(location => generateLocationStock(location.id))
}

// Generate location performance comparison
export const generateLocationComparison = (): LocationComparison[] => {
  return mockLocations.map(location => ({
    locationId: location.id,
    locationName: location.name,
    performance: ['excellent', 'good', 'average', 'poor'][Math.floor(Math.random() * 4)] as any,
    metrics: {
      stockEfficiency: Math.floor(Math.random() * 30) + 70, // 70-100
      turnoverRate: Math.random() * 6 + 2, // 2-8 times per year
      wastePercentage: Math.random() * 8 + 1, // 1-9%
      fillRate: Math.floor(Math.random() * 40) + 60 // 60-100%
    }
  }))
}

// Mock aggregate metrics across all locations
export const getAggregateMetrics = () => {
  const allLocationData = getAllLocationStock()

  return {
    totalLocations: allLocationData.length,
    totalItems: allLocationData.reduce((sum, loc) => sum + loc.metrics.totalItems, 0),
    totalValue: {
      amount: allLocationData.reduce((sum, loc) => sum + loc.metrics.totalValue.amount, 0),
      currency: 'USD' as const
    },
    totalLowStock: allLocationData.reduce((sum, loc) => sum + loc.metrics.lowStockCount, 0),
    totalExpiring: allLocationData.reduce((sum, loc) => sum + loc.metrics.expiringCount, 0),
    averageTurnover: allLocationData.reduce((sum, loc) => sum + loc.metrics.turnoverRate, 0) / allLocationData.length,
    locationsNeedingAttention: allLocationData.filter(loc =>
      loc.metrics.lowStockCount > 10 || loc.metrics.expiringCount > 8
    ).length
  }
}

// Slow Moving Inventory Types
export interface SlowMovingItem {
  id: string
  productId: string
  productCode: string
  productName: string
  category: string
  unit: string
  locationId: string
  locationName: string
  lastMovementDate: Date
  daysSinceMovement: number
  currentStock: number
  value: number
  averageCost: number
  turnoverRate: number // movements per month
  suggestedAction: 'transfer' | 'promote' | 'writeoff' | 'hold'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

export interface SlowMovingGroup {
  locationId: string
  locationName: string
  items: SlowMovingItem[]
  subtotals: {
    totalItems: number
    totalQuantity: number
    totalValue: number
    averageDaysSinceMovement: number
    criticalItems: number
  }
  isExpanded: boolean
}

// Inventory Aging Types
export interface AgingItem {
  id: string
  productId: string
  productCode: string
  productName: string
  category: string
  unit: string
  locationId: string
  locationName: string
  lotNumber?: string
  receivedDate: Date
  expiryDate?: Date
  ageInDays: number
  ageBucket: '0-30' | '31-60' | '61-90' | '90+'
  quantity: number
  value: number
  unitCost: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  daysToExpiry?: number
  isExpired: boolean
  writeOffValue?: number
}

export interface AgingBucketSummary {
  bucket: '0-30' | '31-60' | '61-90' | '90+'
  quantity: number
  value: number
  itemCount: number
  percentage: number
  criticalCount: number
}

export interface LocationAgingGroup {
  locationId: string
  locationName: string
  ageBuckets: {
    '0-30': AgingItem[]
    '31-60': AgingItem[]
    '61-90': AgingItem[]
    '90+': AgingItem[]
  }
  subtotals: {
    totalItems: number
    totalQuantity: number
    totalValue: number
    criticalItems: number
    expiredItems: number
    expiringItems: number // expiring within 7 days
    bucketSummaries: AgingBucketSummary[]
  }
  isExpanded: boolean
}

// Generic Grouping Types
export interface LocationGroup<T> {
  locationId: string
  locationName: string
  items: T[]
  subtotals: Record<string, number>
  isExpanded: boolean
}

export interface GroupedTableData<T> {
  groups: LocationGroup<T>[]
  grandTotals: Record<string, number>
  groupingOptions: {
    primaryGroup: 'location' | 'category' | 'status'
    secondaryGroup?: 'category' | 'ageBucket' | 'status'
    showSubtotals: boolean
    expandedGroups: Set<string>
  }
}

// Transfer suggestions between locations
export interface TransferSuggestion {
  itemCode: string
  itemName: string
  fromLocation: string
  toLocation: string
  suggestedQuantity: number
  reason: 'excess_stock' | 'low_stock' | 'expiring_soon' | 'high_demand'
  priority: 'high' | 'medium' | 'low'
  potentialSavings: Money
}

export const generateTransferSuggestions = (): TransferSuggestion[] => {
  const suggestions: TransferSuggestion[] = []
  const sampleItems = mockProducts.slice(0, 8)

  for (let i = 0; i < 6; i++) {
    const item = sampleItems[Math.floor(Math.random() * sampleItems.length)]
    const fromLoc = mockLocations[Math.floor(Math.random() * mockLocations.length)]
    const toLoc = mockLocations.filter(l => l.id !== fromLoc.id)[Math.floor(Math.random() * (mockLocations.length - 1))]

    suggestions.push({
      itemCode: item.productCode,
      itemName: item.productName,
      fromLocation: fromLoc.name,
      toLocation: toLoc.name,
      suggestedQuantity: Math.floor(Math.random() * 20) + 5,
      reason: ['excess_stock', 'low_stock', 'expiring_soon', 'high_demand'][Math.floor(Math.random() * 4)] as any,
      priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as any,
      potentialSavings: { amount: Math.floor(Math.random() * 500) + 100, currency: 'USD' }
    })
  }

  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

// Generate slow moving inventory data
export const generateSlowMovingData = (): SlowMovingGroup[] => {
  const slowMovingGroups: SlowMovingGroup[] = []

  mockLocations.forEach(location => {
    const items: SlowMovingItem[] = []
    const itemCount = Math.floor(Math.random() * 8) + 3 // 3-10 slow moving items per location

    for (let i = 0; i < itemCount; i++) {
      const product = mockProducts[Math.floor(Math.random() * mockProducts.length)]
      const daysSinceMovement = Math.floor(Math.random() * 120) + 30 // 30-150 days
      const currentStock = Math.floor(Math.random() * 200) + 50
      const averageCost = Math.random() * 50 + 10
      const value = currentStock * averageCost
      const turnoverRate = Math.random() * 0.5 + 0.1 // 0.1 - 0.6 movements per month

      let riskLevel: 'low' | 'medium' | 'high' | 'critical'
      let suggestedAction: 'transfer' | 'promote' | 'writeoff' | 'hold'

      if (daysSinceMovement > 120) {
        riskLevel = 'critical'
        suggestedAction = 'writeoff'
      } else if (daysSinceMovement > 90) {
        riskLevel = 'high'
        suggestedAction = 'promote'
      } else if (daysSinceMovement > 60) {
        riskLevel = 'medium'
        suggestedAction = 'transfer'
      } else {
        riskLevel = 'low'
        suggestedAction = 'hold'
      }

      const lastMovementDate = new Date()
      lastMovementDate.setDate(lastMovementDate.getDate() - daysSinceMovement)

      items.push({
        id: `slow-${location.id}-${i}`,
        productId: product.id,
        productCode: product.productCode,
        productName: product.productName,
        category: product.categoryId || 'Unknown',
        unit: product.baseUnit || 'pcs',
        locationId: location.id,
        locationName: location.name,
        lastMovementDate,
        daysSinceMovement,
        currentStock,
        value,
        averageCost,
        turnoverRate,
        suggestedAction,
        riskLevel
      })
    }

    // Calculate subtotals
    const subtotals = {
      totalItems: items.length,
      totalQuantity: items.reduce((sum, item) => sum + item.currentStock, 0),
      totalValue: items.reduce((sum, item) => sum + item.value, 0),
      averageDaysSinceMovement: items.reduce((sum, item) => sum + item.daysSinceMovement, 0) / items.length,
      criticalItems: items.filter(item => item.riskLevel === 'critical').length,
    }

    slowMovingGroups.push({
      locationId: location.id,
      locationName: location.name,
      items: items.sort((a, b) => b.daysSinceMovement - a.daysSinceMovement),
      subtotals,
      isExpanded: false
    })
  })

  return slowMovingGroups
}

// Generate individual slow moving items
export const generateSlowMovingItems = (): SlowMovingItem[] => {
  const allItems: SlowMovingItem[] = []

  mockLocations.forEach(location => {
    const itemCount = Math.floor(Math.random() * 8) + 3 // 3-10 slow moving items per location

    for (let i = 0; i < itemCount; i++) {
      const product = mockProducts[Math.floor(Math.random() * mockProducts.length)]
      const daysSinceMovement = Math.floor(Math.random() * 120) + 30 // 30-150 days
      const currentStock = Math.floor(Math.random() * 200) + 50
      const unitCost = Math.random() * 25 + 5
      const value = currentStock * unitCost
      const turnoverRate = Math.random() * 2 + 0.1 // 0.1-2.1x per year

      // Determine risk level based on days since movement and turnover rate
      let riskLevel: SlowMovingItem['riskLevel']
      let suggestedAction: SlowMovingItem['suggestedAction']

      if (daysSinceMovement > 90 || turnoverRate < 0.5) {
        riskLevel = 'critical'
        suggestedAction = Math.random() > 0.7 ? 'writeoff' : 'transfer'
      } else if (daysSinceMovement > 60 || turnoverRate < 1.0) {
        riskLevel = 'high'
        suggestedAction = Math.random() > 0.5 ? 'promote' : 'transfer'
      } else if (daysSinceMovement > 45 || turnoverRate < 1.5) {
        riskLevel = 'medium'
        suggestedAction = 'promote'
      } else {
        riskLevel = 'low'
        suggestedAction = 'hold'
      }

      const lastMovementDate = new Date()
      lastMovementDate.setDate(lastMovementDate.getDate() - daysSinceMovement)

      allItems.push({
        id: `slow-${location.id}-${product.id}-${i}`,
        productId: product.id,
        productCode: product.productCode,
        productName: product.productName,
        category: product.categoryId,
        unit: product.baseUnit,
        locationId: location.id,
        locationName: location.name,
        lastMovementDate,
        daysSinceMovement,
        currentStock,
        value,
        averageCost: unitCost,
        turnoverRate,
        suggestedAction,
        riskLevel
      })
    }
  })

  return allItems
}

// Generate aging inventory data
export const generateAgingData = (): LocationAgingGroup[] => {
  const agingGroups: LocationAgingGroup[] = []

  mockLocations.forEach(location => {
    const ageBuckets: LocationAgingGroup['ageBuckets'] = {
      '0-30': [],
      '31-60': [],
      '61-90': [],
      '90+': []
    }

    const itemCount = Math.floor(Math.random() * 15) + 10 // 10-25 aging items per location

    for (let i = 0; i < itemCount; i++) {
      const product = mockProducts[Math.floor(Math.random() * mockProducts.length)]
      const ageInDays = Math.floor(Math.random() * 180) + 1 // 1-180 days old
      const quantity = Math.floor(Math.random() * 100) + 20
      const unitCost = Math.random() * 30 + 5
      const value = quantity * unitCost

      const receivedDate = new Date()
      receivedDate.setDate(receivedDate.getDate() - ageInDays)

      // Generate expiry date for some items (60-70% have expiry dates)
      let expiryDate: Date | undefined
      let daysToExpiry: number | undefined
      let isExpired = false

      if (Math.random() > 0.3) {
        expiryDate = new Date(receivedDate)
        const shelfLife = Math.floor(Math.random() * 90) + 30 // 30-120 days shelf life
        expiryDate.setDate(expiryDate.getDate() + shelfLife)

        const now = new Date()
        daysToExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        isExpired = daysToExpiry < 0
      }

      let ageBucket: '0-30' | '31-60' | '61-90' | '90+'
      if (ageInDays <= 30) ageBucket = '0-30'
      else if (ageInDays <= 60) ageBucket = '31-60'
      else if (ageInDays <= 90) ageBucket = '61-90'
      else ageBucket = '90+'

      let riskLevel: 'low' | 'medium' | 'high' | 'critical'
      if (isExpired || (daysToExpiry !== undefined && daysToExpiry < 7)) {
        riskLevel = 'critical'
      } else if (daysToExpiry !== undefined && daysToExpiry < 14) {
        riskLevel = 'high'
      } else if (ageInDays > 90) {
        riskLevel = 'medium'
      } else {
        riskLevel = 'low'
      }

      const writeOffValue = (riskLevel === 'critical' && isExpired) ? value * 0.8 : undefined

      const agingItem: AgingItem = {
        id: `aging-${location.id}-${i}`,
        productId: product.id,
        productCode: product.productCode,
        productName: product.productName,
        category: product.categoryId || 'Unknown',
        unit: product.baseUnit || 'pcs',
        locationId: location.id,
        locationName: location.name,
        lotNumber: Math.random() > 0.5 ? `LOT-${receivedDate.toISOString().slice(0, 10).replace(/-/g, '')}${i}` : undefined,
        receivedDate,
        expiryDate,
        ageInDays,
        ageBucket,
        quantity,
        value,
        unitCost,
        riskLevel,
        daysToExpiry,
        isExpired,
        writeOffValue
      }

      ageBuckets[ageBucket].push(agingItem)
    }

    // Sort items within each bucket by age (oldest first)
    Object.values(ageBuckets).forEach(bucket => {
      bucket.sort((a, b) => b.ageInDays - a.ageInDays)
    })

    // Calculate bucket summaries
    const allItems = [...ageBuckets['0-30'], ...ageBuckets['31-60'], ...ageBuckets['61-90'], ...ageBuckets['90+']]
    const totalValue = allItems.reduce((sum, item) => sum + item.value, 0)

    const bucketSummaries: AgingBucketSummary[] = (['0-30', '31-60', '61-90', '90+'] as const).map(bucket => {
      const bucketItems = ageBuckets[bucket]
      const bucketValue = bucketItems.reduce((sum, item) => sum + item.value, 0)

      return {
        bucket,
        quantity: bucketItems.reduce((sum, item) => sum + item.quantity, 0),
        value: bucketValue,
        itemCount: bucketItems.length,
        percentage: totalValue > 0 ? (bucketValue / totalValue) * 100 : 0,
        criticalCount: bucketItems.filter(item => item.riskLevel === 'critical').length
      }
    })

    // Calculate subtotals
    const subtotals = {
      totalItems: allItems.length,
      totalQuantity: allItems.reduce((sum, item) => sum + item.quantity, 0),
      totalValue,
      criticalItems: allItems.filter(item => item.riskLevel === 'critical').length,
      expiredItems: allItems.filter(item => item.isExpired).length,
      expiringItems: allItems.filter(item => item.daysToExpiry !== undefined && item.daysToExpiry >= 0 && item.daysToExpiry <= 7).length,
      bucketSummaries
    }

    agingGroups.push({
      locationId: location.id,
      locationName: location.name,
      ageBuckets,
      subtotals,
      isExpanded: false
    })
  })

  return agingGroups
}

// Generate individual aging items
export const generateAgingItems = (): AgingItem[] => {
  const allItems: AgingItem[] = []

  mockLocations.forEach(location => {
    const itemCount = Math.floor(Math.random() * 15) + 10 // 10-25 aging items per location

    for (let i = 0; i < itemCount; i++) {
      const product = mockProducts[Math.floor(Math.random() * mockProducts.length)]
      const ageInDays = Math.floor(Math.random() * 180) + 1 // 1-180 days old
      const quantity = Math.floor(Math.random() * 100) + 20
      const unitCost = Math.random() * 30 + 5
      const value = quantity * unitCost

      const receivedDate = new Date()
      receivedDate.setDate(receivedDate.getDate() - ageInDays)

      // Generate expiry date for some items (60-70% have expiry dates)
      let expiryDate: Date | undefined
      let daysToExpiry: number | undefined
      let isExpired = false

      if (Math.random() > 0.3) {
        expiryDate = new Date(receivedDate)
        const shelfLife = Math.floor(Math.random() * 90) + 30 // 30-120 days shelf life
        expiryDate.setDate(expiryDate.getDate() + shelfLife)

        const today = new Date()
        daysToExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (daysToExpiry < 0) {
          isExpired = true
        }
      }

      // Determine age bucket
      let ageBucket: AgingItem['ageBucket']
      if (ageInDays <= 30) {
        ageBucket = '0-30'
      } else if (ageInDays <= 60) {
        ageBucket = '31-60'
      } else if (ageInDays <= 90) {
        ageBucket = '61-90'
      } else {
        ageBucket = '90+'
      }

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' | 'critical'
      if (isExpired || (daysToExpiry !== undefined && daysToExpiry < 7)) {
        riskLevel = 'critical'
      } else if (daysToExpiry !== undefined && daysToExpiry < 14) {
        riskLevel = 'high'
      } else if (ageInDays > 90) {
        riskLevel = 'medium'
      } else {
        riskLevel = 'low'
      }

      const writeOffValue = (riskLevel === 'critical' && isExpired) ? value * 0.8 : undefined

      allItems.push({
        id: `aging-${location.id}-${product.id}-${i}`,
        productId: product.id,
        productCode: product.productCode,
        productName: product.productName,
        category: product.categoryId,
        unit: product.baseUnit,
        locationId: location.id,
        locationName: location.name,
        lotNumber: `LOT-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        receivedDate: receivedDate,
        expiryDate,
        ageInDays,
        ageBucket,
        quantity,
        value,
        unitCost,
        riskLevel,
        daysToExpiry,
        isExpired,
        writeOffValue
      })
    }
  })

  return allItems
}

// Utility function to group items by location
export const groupItemsByLocation = <T extends { locationId: string; locationName: string }>(
  items: T[],
  calculateSubtotals: (items: T[]) => Record<string, number>
): LocationGroup<T>[] => {
  const groupMap = new Map<string, T[]>()

  items.forEach(item => {
    const key = item.locationId
    if (!groupMap.has(key)) {
      groupMap.set(key, [])
    }
    groupMap.get(key)!.push(item)
  })

  return Array.from(groupMap.entries()).map(([locationId, locationItems]) => ({
    locationId,
    locationName: locationItems[0].locationName,
    items: locationItems,
    subtotals: calculateSubtotals(locationItems),
    isExpanded: false
  }))
}

// Specific grouping functions for slow moving inventory
export const groupSlowMovingByLocation = (items: SlowMovingItem[]): LocationGroup<SlowMovingItem>[] => {
  return groupItemsByLocation(items, (locationItems) => ({
    totalItems: locationItems.length,
    currentStock: locationItems.reduce((sum, item) => sum + item.currentStock, 0),
    value: locationItems.reduce((sum, item) => sum + item.value, 0),
    averageDaysSinceMovement: locationItems.reduce((sum, item) => sum + item.daysSinceMovement, 0) / locationItems.length,
    criticalItems: locationItems.filter(item => item.riskLevel === 'critical').length,
  }))
}

// Specific grouping functions for aging inventory
export const groupAgingByLocation = (items: AgingItem[]): LocationGroup<AgingItem>[] => {
  return groupItemsByLocation(items, (locationItems) => ({
    totalItems: locationItems.length,
    quantity: locationItems.reduce((sum, item) => sum + item.quantity, 0),
    value: locationItems.reduce((sum, item) => sum + item.value, 0),
    averageAge: locationItems.reduce((sum, item) => sum + item.ageInDays, 0) / locationItems.length,
    expiredItems: locationItems.filter(item => item.isExpired).length,
    nearExpiryItems: locationItems.filter(item => item.daysToExpiry !== undefined && item.daysToExpiry >= 0 && item.daysToExpiry <= 7).length
  }))
}

export const groupAgingByAgeBucket = (items: AgingItem[]): LocationGroup<AgingItem>[] => {
  const buckets = ['0-30', '31-60', '61-90', '90+'] as const
  const groupedByBucket = new Map<string, AgingItem[]>()

  // Group items by age bucket
  items.forEach(item => {
    const bucket = item.ageBucket
    if (!groupedByBucket.has(bucket)) {
      groupedByBucket.set(bucket, [])
    }
    groupedByBucket.get(bucket)!.push(item)
  })

  return Array.from(groupedByBucket.entries()).map(([bucket, bucketItems]) => ({
    locationId: bucket,
    locationName: `${bucket} Days`,
    items: bucketItems,
    subtotals: {
      totalItems: bucketItems.length,
      quantity: bucketItems.reduce((sum, item) => sum + item.quantity, 0),
      value: bucketItems.reduce((sum, item) => sum + item.value, 0),
      averageAge: bucketItems.reduce((sum, item) => sum + item.ageInDays, 0) / bucketItems.length,
      expiredItems: bucketItems.filter(item => item.isExpired).length,
      nearExpiryItems: bucketItems.filter(item => item.daysToExpiry !== undefined && item.daysToExpiry >= 0 && item.daysToExpiry <= 7).length
    },
    isExpanded: false
  }))
}

export default {
  generateLocationStock,
  getAllLocationStock,
  generateLocationComparison,
  getAggregateMetrics,
  generateTransferSuggestions,
  generateRecentMovements,
  generateSlowMovingItems,
  generateAgingItems,
  groupItemsByLocation,
  groupSlowMovingByLocation,
  groupAgingByLocation,
  groupAgingByAgeBucket
}