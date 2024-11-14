export interface FilterCondition {
  field: string
  operator: string
  value: string
}

export interface Requisition {
  date: string
  refNo: string
  requestTo: string
  storeName: string
  description: string
  status: 'In Process' | 'Complete' | 'Reject' | 'Void' | 'Draft'
  totalAmount: number
} 