'use client'
import { useState } from 'react'
import { GoodsReceiveNoteComponent } from '../components/goods-receive-note'
import { GoodsReceiveNoteMode } from '@/lib/types'

export default function CreateGoodsReceiveNote() {
  const [mode, setMode] = useState<GoodsReceiveNoteMode>('add')

  return (
    <div className="container mx-auto p-6">
      <GoodsReceiveNoteComponent 
        mode={mode}  
        initialData={{
          id: '0',
          ref: '',
          date: new Date(),
          invoiceDate: new Date(),
          invoiceNumber: '',
          taxInvoiceDate: undefined,
          taxInvoiceNumber: '',
          description: '',
          receiver: '',
          vendor: '',
          location: '',
          currency: '',
          exchangeRate: 1,
          baseCurrency: '',
          status: 'Pending',
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
          financialSummary: undefined,
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
        }}
      />
    </div>
  )
}