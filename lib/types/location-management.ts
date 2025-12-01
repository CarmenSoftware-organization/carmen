/**
 * Location Management Types
 *
 * Types and interfaces for inventory location management,
 * shelves, user/product assignments, and delivery points.
 */

// ====== ENUMS ======

/**
 * Inventory location types based on accounting treatment
 * - inventory: Standard warehouse/storage with full tracking
 * - direct: Production areas with immediate expense treatment
 * - consignment: Vendor-owned inventory until consumed
 */
export enum InventoryLocationType {
  INVENTORY = 'inventory',
  DIRECT = 'direct',
  CONSIGNMENT = 'consignment'
}

/**
 * Storage zone types within a location
 */
export enum StorageZoneType {
  DRY = 'dry',
  COLD = 'cold',
  FROZEN = 'frozen',
  AMBIENT = 'ambient',
  CONTROLLED = 'controlled'
}

/**
 * Location status for lifecycle management
 */
export type LocationStatus = 'active' | 'inactive' | 'closed' | 'pending_setup'


// ====== CONFIGURATION INTERFACES ======

/**
 * Inventory behavior configuration per location type
 */
export interface InventoryLocationConfig {
  requiresStockIn: boolean
  allowsPhysicalCount: boolean
  tracksBatchNumbers: boolean
  tracksExpiryDates: boolean
  expenseOnReceipt: boolean
  eopEnabled: boolean
  eopCutoffDay?: number
  costingMethod?: 'FIFO' | 'PERIODIC_AVERAGE'
}

/**
 * Location Address
 */
export interface LocationAddress {
  addressLine1: string
  addressLine2?: string
  city: string
  state?: string
  postalCode: string
  country: string
  coordinates?: {
    latitude: number
    longitude: number
  }
}

/**
 * Time range for operating hours
 */
export interface TimeRange {
  open: string
  close: string
  isClosed?: boolean
}

/**
 * Operating hours by day of week
 */
export interface OperatingHours {
  monday?: TimeRange
  tuesday?: TimeRange
  wednesday?: TimeRange
  thursday?: TimeRange
  friday?: TimeRange
  saturday?: TimeRange
  sunday?: TimeRange
}

// ====== MAIN ENTITIES ======

/**
 * Inventory Location - Main entity for location management
 */
export interface InventoryLocation {
  id: string
  code: string // Unique, max 10 chars, uppercase alphanumeric
  name: string // Unique, max 100 chars
  description?: string

  type: InventoryLocationType
  status: LocationStatus
  physicalCountEnabled: boolean
  inventoryConfig: InventoryLocationConfig

  address?: LocationAddress

  // Organizational links
  departmentId?: string
  departmentName?: string
  costCenterId?: string
  costCenterName?: string

  // For consignment locations
  consignmentVendorId?: string
  consignmentVendorName?: string

  // Counts for summary display
  shelvesCount: number
  assignedUsersCount: number
  assignedProductsCount: number

  // Audit fields
  createdAt: Date
  createdBy: string
  updatedAt?: Date
  updatedBy?: string
}

/**
 * Shelf - Sub-location/storage area within an inventory location
 */
export interface Shelf {
  id: string
  locationId: string
  code: string // Unique within location, max 20 chars
  name: string
  description?: string

  zoneType: StorageZoneType

  capacity?: {
    maxWeight?: number
    maxWeightUnit?: string
    maxVolume?: number
    maxVolumeUnit?: string
    maxUnits?: number
  }

  position?: {
    aisle?: string
    row?: string
    level?: number
    bay?: string
  }

  isActive: boolean
  sortOrder: number

  // Audit fields
  createdAt: Date
  createdBy: string
  updatedAt?: Date
  updatedBy?: string
}

/**
 * User-Location Assignment - Links users to locations
 */
export interface UserLocationAssignment {
  id: string
  userId: string
  userName: string
  userEmail: string
  locationId: string

  isActive: boolean

  effectiveFrom?: Date
  effectiveTo?: Date

  // Audit fields
  assignedAt: Date
  assignedBy: string
}

/**
 * Product-Location Assignment - Links products to locations with inventory parameters
 */
export interface ProductLocationAssignment {
  id: string
  productId: string
  productCode: string
  productName: string
  categoryName: string
  baseUnit: string
  locationId: string

  // Default shelf for this product at this location
  shelfId?: string
  shelfName?: string
  binCode?: string

  // Inventory parameters
  minQuantity: number
  maxQuantity: number
  reorderPoint: number
  parLevel: number
  safetyStock?: number
  leadTimeDays?: number

  // For consignment products
  consignmentVendorId?: string
  consignmentPrice?: number

  isActive: boolean
  isStocked: boolean

  // Current stock info (read-only, from inventory)
  currentQuantity?: number
  lastReceiptDate?: Date
  lastIssueDate?: Date

  // Audit fields
  assignedAt: Date
  assignedBy: string
  updatedAt?: Date
  updatedBy?: string
}

/**
 * Delivery Point - Delivery address configuration for a location
 */
export interface DeliveryPoint {
  id: string
  locationId: string

  name: string
  code?: string
  description?: string

  address: LocationAddress

  contactName?: string
  contactPhone?: string
  contactEmail?: string

  deliveryInstructions?: string
  accessInstructions?: string

  operatingHours?: OperatingHours

  // Logistics info
  maxVehicleSize?: 'small_van' | 'large_van' | 'truck' | 'semi_trailer'
  hasDockLeveler?: boolean
  hasForklift?: boolean

  isPrimary: boolean
  isActive: boolean

  // Audit fields
  createdAt: Date
  createdBy: string
  updatedAt?: Date
  updatedBy?: string
}

// ====== CONSTANTS ======

/**
 * Location Type Configuration Defaults
 */
export const LOCATION_TYPE_DEFAULTS: Record<InventoryLocationType, InventoryLocationConfig> = {
  [InventoryLocationType.INVENTORY]: {
    requiresStockIn: true,
    allowsPhysicalCount: true,
    tracksBatchNumbers: true,
    tracksExpiryDates: true,
    expenseOnReceipt: false,
    eopEnabled: true,
    costingMethod: 'FIFO'
  },
  [InventoryLocationType.DIRECT]: {
    requiresStockIn: false,
    allowsPhysicalCount: false,
    tracksBatchNumbers: false,
    tracksExpiryDates: false,
    expenseOnReceipt: true,
    eopEnabled: false,
    costingMethod: undefined
  },
  [InventoryLocationType.CONSIGNMENT]: {
    requiresStockIn: true,
    allowsPhysicalCount: true,
    tracksBatchNumbers: true,
    tracksExpiryDates: true,
    expenseOnReceipt: false,
    eopEnabled: true,
    costingMethod: 'FIFO'
  }
}

/**
 * Location type display labels
 */
export const LOCATION_TYPE_LABELS: Record<InventoryLocationType, string> = {
  [InventoryLocationType.INVENTORY]: 'Inventory',
  [InventoryLocationType.DIRECT]: 'Direct',
  [InventoryLocationType.CONSIGNMENT]: 'Consignment'
}

/**
 * Location type descriptions for UI
 */
export const LOCATION_TYPE_DESCRIPTIONS: Record<InventoryLocationType, string> = {
  [InventoryLocationType.INVENTORY]: 'Standard warehouse/storage with full inventory tracking',
  [InventoryLocationType.DIRECT]: 'Production areas with immediate expense on receipt',
  [InventoryLocationType.CONSIGNMENT]: 'Vendor-owned inventory until consumed'
}

/**
 * Storage zone type labels
 */
export const STORAGE_ZONE_LABELS: Record<StorageZoneType, string> = {
  [StorageZoneType.DRY]: 'Dry Storage',
  [StorageZoneType.COLD]: 'Cold Storage',
  [StorageZoneType.FROZEN]: 'Frozen Storage',
  [StorageZoneType.AMBIENT]: 'Ambient',
  [StorageZoneType.CONTROLLED]: 'Controlled Environment'
}

// ====== FORM TYPES ======

/**
 * Location form data for create/edit
 */
export interface LocationFormData {
  code: string
  name: string
  description?: string
  type: InventoryLocationType
  physicalCountEnabled: boolean
  status: LocationStatus
  departmentId?: string
  costCenterId?: string
  consignmentVendorId?: string
  address?: LocationAddress
}

/**
 * Shelf form data for create/edit
 */
export interface ShelfFormData {
  code: string
  name: string
  description?: string
  zoneType: StorageZoneType
  isActive: boolean
  sortOrder: number
  capacity?: {
    maxWeight?: number
    maxWeightUnit?: string
    maxVolume?: number
    maxVolumeUnit?: string
    maxUnits?: number
  }
  position?: {
    aisle?: string
    row?: string
    level?: number
    bay?: string
  }
}

/**
 * Delivery point form data
 */
export interface DeliveryPointFormData {
  name: string
  code?: string
  description?: string
  address: LocationAddress
  contactName?: string
  contactPhone?: string
  contactEmail?: string
  deliveryInstructions?: string
  accessInstructions?: string
  isPrimary: boolean
  isActive: boolean
}

// ====== FILTER TYPES ======

/**
 * Location list filters
 */
export interface LocationFilters {
  search: string
  type: InventoryLocationType | 'all'
  status: LocationStatus | 'all'
  physicalCountEnabled: boolean | 'all'
  departmentId?: string
}

// ====== SUMMARY TYPES ======

/**
 * Summary view for location list
 */
export interface InventoryLocationSummary {
  id: string
  code: string
  name: string
  type: InventoryLocationType
  status: LocationStatus
  physicalCountEnabled: boolean
  totalProducts: number
  totalUsers: number
  totalShelves: number
  departmentName?: string
}
