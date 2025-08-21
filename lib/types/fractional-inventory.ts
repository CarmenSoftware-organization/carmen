// Fractional Inventory Management Types
// Specialized types for handling fractional items with multi-state tracking

export type FractionalItemState = 
  | "RAW"           // Original whole item
  | "PREPARED"      // Item prepared/processed but not portioned
  | "PORTIONED"     // Item divided into sellable portions
  | "PARTIAL"       // Partially consumed item with remaining portions
  | "COMBINED"      // Multiple portions combined back to bulk
  | "WASTE"         // Waste generated during conversion

export type ConversionType = 
  | "SPLIT"         // Whole item → multiple portions
  | "COMBINE"       // Multiple portions → bulk item
  | "PREPARE"       // Raw → prepared
  | "PORTION"       // Prepared → portioned
  | "CONSUME"       // Portioned → consumed
  | "WASTE"         // Any state → waste

export interface FractionalUnit {
  id: string
  name: string
  abbreviation: string
  baseQuantity: number        // How many of this unit equals 1 base unit
  isBase: boolean            // True for the base measurement unit
  conversionFactor: number   // Multiplier to convert to base unit
  displayOrder: number       // Order for displaying in UI
}

export interface PortionSize {
  id: string
  name: string              // e.g., "Slice", "Half", "Quarter", "Individual"
  portionsPerWhole: number  // How many portions per whole item
  standardWeight?: number   // Standard weight per portion (optional)
  description?: string      // User-friendly description
  isActive: boolean
}

export interface FractionalItem {
  id: string
  itemCode: string
  itemName: string
  category: string
  baseUnit: string          // Base unit of measurement (e.g., "Whole Pizza", "Whole Cake")
  
  // Fractional configuration
  supportsFractional: boolean
  allowPartialSales: boolean
  trackPortions: boolean
  
  // Available portion sizes
  availablePortions: PortionSize[]
  defaultPortionId?: string
  
  // Quality and time constraints
  shelfLifeHours?: number      // Shelf life after preparation
  maxQualityHours?: number     // Hours before quality degradation
  temperatureRequired?: number  // Storage temperature requirement
  
  // Conversion settings
  allowAutoConversion: boolean  // Allow automatic state transitions
  wastePercentage: number      // Expected waste percentage during conversion
  
  // Costing
  baseCostPerUnit: number
  conversionCostPerUnit?: number // Additional cost for preparation/portioning
  
  createdAt: string
  updatedAt: string
}

export interface FractionalStock {
  id: string
  itemId: string
  locationId: string
  batchId?: string
  
  // Current state
  currentState: FractionalItemState
  stateTransitionDate: string
  qualityGrade: "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "EXPIRED"
  
  // Quantity tracking
  wholeUnitsAvailable: number      // Complete whole units
  partialQuantityAvailable: number // Remaining partial quantity
  totalPortionsAvailable: number   // Total sellable portions
  reservedPortions: number         // Reserved for orders
  
  // Original quantities
  originalWholeUnits: number
  originalTotalPortions: number
  
  // Conversion tracking
  conversionsApplied: ConversionRecord[]
  totalWasteGenerated: number
  
  // Quality tracking
  preparedAt?: string
  portionedAt?: string
  expiresAt?: string
  lastQualityCheck?: string
  qualityNotes?: string
  
  // Location and batch info
  storageLocation?: string
  batchNumber?: string
  supplierLotNumber?: string
  
  createdAt: string
  updatedAt: string
}

export interface ConversionRecord {
  id: string
  conversionType: ConversionType
  fromState: FractionalItemState
  toState: FractionalItemState
  
  // Quantities before conversion
  beforeWholeUnits: number
  beforePartialQuantity: number
  beforeTotalPortions: number
  
  // Quantities after conversion
  afterWholeUnits: number
  afterPartialQuantity: number
  afterTotalPortions: number
  
  // Conversion details
  wasteGenerated: number
  conversionEfficiency: number     // Actual vs expected conversion ratio
  conversionCost: number
  
  // Metadata
  performedBy: string
  performedAt: string
  reason?: string
  notes?: string
  qualityBefore?: string
  qualityAfter?: string
  
  // References
  sourceStockIds: string[]         // Stock items used in conversion
  targetStockIds: string[]         // Stock items created from conversion
  relatedOrderId?: string          // If conversion was for specific order
}

export interface InventoryAlert {
  id: string
  type: "PORTION_LOW" | "QUALITY_DEGRADING" | "CONVERSION_RECOMMENDED" | 
        "WASTE_HIGH" | "EXPIRING_SOON" | "OPTIMAL_CONVERSION_TIME"
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  
  itemId: string
  stockId: string
  locationId: string
  
  title: string
  message: string
  
  // Alert conditions
  triggeredAt: string
  triggeredBy: string
  
  // Recommended actions
  recommendedActions: {
    action: "CONVERT" | "COMBINE" | "MARK_WASTE" | "QUALITY_CHECK" | "REORDER"
    priority: number
    description: string
    estimatedImpact?: string
  }[]
  
  // Status
  isActive: boolean
  acknowledgedAt?: string
  acknowledgedBy?: string
  resolvedAt?: string
  resolutionNotes?: string
}

export interface ConversionRule {
  id: string
  name: string
  description: string
  
  // Conditions
  sourceState: FractionalItemState
  targetState: FractionalItemState
  itemIds?: string[]              // Specific items (empty = all items)
  categoryIds?: string[]          // Specific categories
  
  // Triggers
  autoTrigger: boolean
  triggerConditions: {
    minPortionsRemaining?: number
    maxQualityHours?: number
    demandThreshold?: number       // Convert when demand reaches this level
    timeOfDay?: string            // Convert at specific time
    daysOfWeek?: number[]         // Convert on specific days
  }
  
  // Conversion parameters
  conversionRatio: number         // How much of source becomes target
  expectedWastePercentage: number
  conversionCostPerUnit: number
  timeRequiredMinutes: number
  
  // Quality impact
  qualityImpactFactor: number     // How conversion affects quality (0-1)
  shelfLifeReductionHours?: number
  
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface FractionalInventoryOperation {
  id: string
  type: "STOCK_IN" | "CONVERSION" | "SALE" | "WASTE" | "ADJUSTMENT" | "TRANSFER"
  
  // Basic info
  date: string
  reference: string
  performedBy: string
  locationId: string
  
  // Items involved
  items: {
    itemId: string
    stockId: string
    
    // Before operation
    beforeState: FractionalItemState
    beforeWholeUnits: number
    beforePartialQuantity: number
    beforePortions: number
    
    // After operation
    afterState: FractionalItemState
    afterWholeUnits: number
    afterPartialQuantity: number
    afterPortions: number
    
    // Operation details
    conversionType?: ConversionType
    wasteGenerated?: number
    costImpact: number
    qualityImpact?: number
  }[]
  
  // Totals
  totalCost: number
  totalWaste: number
  totalValueChange: number
  
  // Status and notes
  status: "PENDING" | "COMPLETED" | "CANCELLED" | "PARTIAL"
  notes?: string
  completedAt?: string
  
  createdAt: string
  updatedAt: string
}

export interface FractionalInventoryMetrics {
  // Inventory levels
  totalWholeUnits: number
  totalPortionsAvailable: number
  totalReservedPortions: number
  totalValueOnHand: number
  
  // Conversion metrics
  dailyConversions: number
  conversionEfficiency: number    // Average efficiency across all conversions
  wastePercentage: number         // Total waste as % of input
  
  // Quality metrics
  averageQualityGrade: number
  itemsNearExpiry: number
  qualityDegradationRate: number
  
  // Operational metrics
  turnoverRate: number            // How fast inventory turns
  stockoutEvents: number
  conversionBacklog: number       // Items waiting for conversion
  
  // Alerts and recommendations
  activeAlerts: InventoryAlert[]
  recommendedConversions: ConversionRecommendation[]
}

export interface ConversionRecommendation {
  id: string
  itemId: string
  stockId: string
  
  recommendationType: "IMMEDIATE" | "SCHEDULED" | "DEMAND_BASED"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  
  fromState: FractionalItemState
  toState: FractionalItemState
  
  // Quantities
  recommendedWholeUnits: number
  recommendedPortions: number
  
  // Reasoning
  reason: string
  expectedBenefits: string[]
  potentialRisks: string[]
  
  // Impact estimates
  estimatedWaste: number
  estimatedCost: number
  estimatedRevenue?: number
  qualityImpact?: number
  
  // Timing
  recommendedBy: string
  recommendedAt: string
  optimalExecutionTime?: string
  expirationTime?: string        // When recommendation is no longer valid
  
  // Status
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "EXECUTED"
  acceptedBy?: string
  acceptedAt?: string
  executionNotes?: string
}

// Utility types for filters and display
export interface FractionalInventoryFilter {
  itemIds?: string[]
  categoryIds?: string[]
  locationIds?: string[]
  states?: FractionalItemState[]
  qualityGrades?: ("EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "EXPIRED")[]
  
  // Quantity filters
  minWholeUnits?: number
  maxWholeUnits?: number
  minPortions?: number
  maxPortions?: number
  
  // Time filters
  preparedAfter?: string
  expiringBefore?: string
  lastMovementAfter?: string
  
  // Alert filters
  hasActiveAlerts?: boolean
  alertSeverity?: ("LOW" | "MEDIUM" | "HIGH" | "CRITICAL")[]
  
  // Conversion filters
  hasConversions?: boolean
  conversionTypes?: ConversionType[]
  wasteAbovePercentage?: number
}

export interface FractionalInventoryView {
  groupBy?: "ITEM" | "CATEGORY" | "LOCATION" | "STATE" | "QUALITY"
  sortBy?: "NAME" | "QUANTITY" | "VALUE" | "QUALITY" | "EXPIRY" | "LAST_MOVEMENT"
  sortOrder?: "ASC" | "DESC"
  
  // Display options
  showAlerts: boolean
  showRecommendations: boolean
  showMetrics: boolean
  showConversionHistory: boolean
  
  // Pagination
  page?: number
  pageSize?: number
}