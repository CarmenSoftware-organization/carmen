'use client'

import { useSearchParams } from 'next/navigation'
import { GoodsReceiveNoteComponent } from '../components/goods-receive-note'
import { mockGoodsReceiveNotes } from '@/lib/mock/mock_goodsReceiveNotes'
import { GoodsReceiveNote, GoodsReceiveNoteMode } from '@/lib/types'

export default function GoodsReceiveNotePage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const mode = searchParams?.get('mode') as GoodsReceiveNoteMode || 'view'
  const id = params.id

  let grnData: GoodsReceiveNote | undefined

  if (id === '0') {
    // Create a new GRN with default values
    grnData = {
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
      baseSubTotalPrice: 0,
      subTotalPrice: 0,
      baseNetAmount: 0,
      netAmount: 0,
      baseDiscAmount: 0,
      discountAmount: 0,
      baseTaxAmount: 0,
      taxAmount: 0,
      baseTotalAmount: 0,
      totalAmount: 0,

    }
  } else {
    grnData = mockGoodsReceiveNotes.find(grn => grn.id === id)
  }

  if (!grnData) {
    return <div>Goods Receive Note not found</div>
  }

  return <GoodsReceiveNoteComponent initialData={grnData} mode={mode} />
}