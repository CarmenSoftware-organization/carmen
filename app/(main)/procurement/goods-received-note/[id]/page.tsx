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
      description: '',
      receiver: '',
      vendor: '',
      location: '',
      currency: '',
      status: 'Pending',
      isConsignment: false,
      isCash: false,
      items: [],
      selectedItems: [],
      stockMovements: [],
      extraCosts: [],
      comments: [],
      attachments: [],
      activityLog: [],
      financialSummary: [],
    }
  } else {
    grnData = mockGoodsReceiveNotes.find(grn => grn.id === id)
  }

  if (!grnData) {
    return <div>Goods Receive Note not found</div>
  }

  return <GoodsReceiveNoteComponent initialData={grnData} mode={mode} />
}