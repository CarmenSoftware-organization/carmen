

export interface CreditNote {
  id: number
  refNumber: string
  description: string
  vendorId: number
  vendorName: string
  createdDate: Date
  docNumber: string
  docDate: Date
  netAmount: number
  taxAmount: number
  totalAmount: number
  currency: string
  status: string
  notes: string
  createdBy: string
  updatedDate: Date
  updatedBy: string
  items: CreditNoteItem[]
  attachments: CreditNoteAttachment[]
}

export type CreditNoteStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'void';

export type CreditNoteType = CreditNote


export interface CreditNoteItem {
  id: number
  description: string
  quantity: number
  unitPrice: number
  discountPercentage: number
  taxPercentage: number
}

export interface CreditNoteAttachment {
  id: number
  fileName: string
  fileSize: number
  uploadDate: Date
  uploadedBy: string
}

export interface EditedItem {
  id: string
  productName: string       
  productDescription: string
  location: string
  lotNo: string
  orderUnit: string
  inventoryUnit: string
  rcvQty: number
  cnQty: number
  unitPrice: number
  cnAmt: number
  costVariance: number
  discountAmount: number
  totalReceivedQty: number
  grnNumber: string
  grnDate: Date
  taxRate: number 
  tax: number
  total: number
  appliedLots?: Array<{ 
    lotNumber: string;
    receiveDate: Date;
    grnNumber: string;
    invoiceNumber: string;
  }>;
}