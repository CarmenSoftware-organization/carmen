import { PurchaseRequest, PurchaseRequestItem } from "../types"

export interface TemplateItem {
  id: string
  name: string
  itemCode: string
  description?: string
  uom: string
  quantity: number
  unitPrice: number
  currency: string
  taxRate: number
  discountRate: number
  deliveryPoint?: string
  location: string
  unit: string
  quantityRequested: number
  quantityApproved: number
  deliveryDate: Date
  currencyRate: number
  price: number
  foc: number
  taxIncluded: boolean
  adjustments: {
    discount?: boolean
    tax: boolean
  }
  vendor: string
  pricelistNumber: string
  comment: string
  itemCategory: string
  itemSubcategory: string
  inventoryInfo: {
    onHand: number
    onOrdered: number
    reorderLevel: number
    restockLevel: number
    averageMonthlyUsage: number
    lastPrice: number
    lastOrderDate: Date
    lastVendor: string
    inventoryUnit: string
  }
  accountCode: string
  jobCode: string
  baseSubTotalPrice: number
  subTotalPrice: number
  baseNetAmount: number
  netAmount: number
  baseDiscAmount: number
  discountAmount: number
  baseTaxAmount: number
  taxAmount: number
  baseTotalAmount: number
  totalAmount: number
}

export interface PRTemplate {
  id: string
  name: string
  description?: string
  type: 'template' | 'recent'
  items: TemplateItem[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
  department?: string
  category?: string
  tags?: string[]
  isDefault?: boolean
  version?: number
}

export interface TemplateSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: PRTemplate | { type: "recent"; pr: Partial<PurchaseRequest> } | null) => void
}

export interface SaveTemplateDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  purchaseRequest: PurchaseRequest
} 