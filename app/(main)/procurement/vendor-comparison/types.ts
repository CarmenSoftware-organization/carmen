import { PurchaseRequestItem as CorePurchaseRequestItem, PurchaseRequestItemStatus } from "@/lib/types";

// Re-export the core PurchaseRequestItem type
export type PurchaseRequestItem = CorePurchaseRequestItem;

// Adapt our PurchaseRequest interface to use the core PurchaseRequestItem
export interface PurchaseRequest {
  id: string
  number: string
  date: Date
  department: string
  total: number
  status: 'Pending' | 'Approved' | 'In-progress'
  items: PurchaseRequestItem[]
}

export interface Vendor {
  id: string
  name: string
  price: number
  leadTime: string
  leadTimeDays: number
  rating: number
  reliability: number
  paymentTerms: string
} 