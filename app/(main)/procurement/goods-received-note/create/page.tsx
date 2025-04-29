'use client'
import { useState, Suspense } from 'react'
import { GoodsReceiveNoteComponent } from '../components/goods-receive-note'
import { GoodsReceiveNote, GoodsReceiveNoteMode } from '@/lib/types'

export default function CreateGoodsReceiveNote() {
  const [initialGrnData] = useState<GoodsReceiveNote>(() => ({
    id: `new-${crypto.randomUUID()}`,
    ref: '',
    date: new Date(),
    invoiceDate: new Date(),
    invoiceNumber: '',
    taxInvoiceDate: undefined,
    taxInvoiceNumber: '',
    description: '',
    receiver: '',
    vendor: '',
    vendorId: '',
    location: '',
    currency: 'USD',
    exchangeRate: 1,
    baseCurrency: 'USD',
    status: 'Received',
    isConsignment: false,
    isCash: false,
    cashBook: '',
    items: [],
    selectedItems: [],
    stockMovements: [],
    extraCosts: [],
    comments: [],
    attachments: [],
    activityLog: [],
    financialSummary: null,
    baseSubTotalPrice: 0,
    subTotalPrice: 0,
    baseNetAmount: 0,
    netAmount: 0,
    baseDiscAmount: 0,
    discountAmount: 0,
    baseTaxAmount: 0,
    taxAmount: 0,
    baseTotalAmount: 0,
    totalAmount: 0
  }));

  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={<div>Loading GRN Form...</div>}>
        <GoodsReceiveNoteComponent 
          initialData={initialGrnData}
        />
      </Suspense>
    </div>
  )
}