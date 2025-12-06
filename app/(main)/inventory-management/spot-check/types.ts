// Spot Check Types and Interfaces

export type SpotCheckType = 'random' | 'targeted' | 'high-value' | 'variance-based' | 'cycle-count'
export type SpotCheckStatus = 'draft' | 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold'
export type ItemCheckStatus = 'pending' | 'counted' | 'variance' | 'skipped'
export type ItemCondition = 'good' | 'damaged' | 'expired' | 'missing'

export interface SpotCheckItem {
  id: string
  itemId: string
  itemCode: string
  itemName: string
  category: string
  unit: string
  location: string
  systemQuantity: number
  countedQuantity: number | null
  variance: number
  variancePercent: number
  condition: ItemCondition
  status: ItemCheckStatus
  countedBy: string | null
  countedAt: Date | null
  notes: string
  value: number
  lastCountDate: Date | null
}

export interface SpotCheck {
  id: string
  checkNumber: string
  checkType: SpotCheckType
  status: SpotCheckStatus
  priority: 'low' | 'medium' | 'high' | 'critical'

  // Assignment
  locationId: string
  locationName: string
  departmentId: string
  departmentName: string
  assignedTo: string
  assignedToName: string

  // Timing
  scheduledDate: Date
  startedAt: Date | null
  completedAt: Date | null
  dueDate: Date | null

  // Items
  items: SpotCheckItem[]
  totalItems: number
  countedItems: number
  matchedItems: number
  varianceItems: number

  // Metrics
  accuracy: number
  totalValue: number
  varianceValue: number

  // Notes and metadata
  reason: string
  notes: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface SpotCheckSummary {
  total: number
  draft: number
  pending: number
  inProgress: number
  completed: number
  cancelled: number
  onHold: number
}

export interface SpotCheckFilter {
  search: string
  status: SpotCheckStatus | 'all'
  type: SpotCheckType | 'all'
  location: string | 'all'
  department: string | 'all'
  assignee: string | 'all'
  dateFrom: Date | null
  dateTo: Date | null
  priority: 'low' | 'medium' | 'high' | 'critical' | 'all'
}

export interface SpotCheckFormData {
  checkType: SpotCheckType
  locationId: string
  departmentId: string
  assignedTo: string
  scheduledDate: Date
  dueDate: Date | null
  selectionMethod: 'random' | 'manual' | 'category' | 'value-based'
  itemCount: number
  minimumValue: number | null
  categoryFilter: string | null
  reason: string
  notes: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

// Legacy compatibility
export interface SpotCheckDetails {
  countId: string
  counter: string
  department: string
  store: string
  date: Date
  selectedItems: Array<{
    id: string
    code: string
    name: string
    description: string
    expectedQuantity: number
    unit: string
  }>
}
