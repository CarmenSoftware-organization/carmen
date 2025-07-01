export type UserRole = "requestor" | "department-manager" | "purchasing-staff"

export interface User {
  id: string
  name: string
  role: UserRole
  department?: string
}

export interface OrderItem {
  id: string
  location: string
  product: string
  productDescription: string
  sku: string // Product SKU/Item Code
  orderUnit: string
  invUnit: string
  requestQuantity: number
  onOrderQuantity: number
  onOrderInvUnit: number // On Order in inventory units
  approvedQuantity: number
  onHandQuantity: number
  onHandInvUnit: number // On Hand in inventory units
  currency: string
  baseCurrency: string // Base currency (e.g., "USD")
  price: number
  lastPrice: number
  baseCurrencyPrice: number // Price in base currency
  baseCurrencyLastPrice: number // Last price in base currency
  total: number
  baseCurrencyTotal: number // Total in base currency
  conversionRate: number // Exchange rate to base currency
  status: "pending" | "approved" | "rejected" | "Review"
  requestorId: string
  requestorName: string
  department: string
  requestDate: string
  expectedDeliveryDate?: string
  approvalDate?: string
  approvedBy?: string
  reviewDate?: string
  reviewedBy?: string
  vendorAllocationDate?: string
  vendorAllocatedBy?: string
  vendor: string // Vendor/Supplier name
  lastVendor?: string
  vendorCode?: string // Vendor code/ID
  vendorContact?: string // Vendor contact information
  comment?: string
}
