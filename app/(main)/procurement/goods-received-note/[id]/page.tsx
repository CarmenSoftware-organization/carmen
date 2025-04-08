'use client'

import { useSearchParams } from 'next/navigation'
import { GoodsReceiveNoteComponent } from '../components/goods-receive-note'
import { mockGoodsReceiveNotes } from '@/lib/mock/mock_goodsReceiveNotes'
import { GoodsReceiveNote, GoodsReceiveNoteMode } from '@/lib/types'

interface PageProps {
  params: {
    id: string
  }
}

export default function GoodsReceiveNotePage({ params }: PageProps) {
  const searchParams = useSearchParams()
  const mode = searchParams?.get('mode') as GoodsReceiveNoteMode || 'view'
  const id = decodeURIComponent(params.id)

  let grnData: GoodsReceiveNote | undefined

  // Handle create mode
  if (id === 'create') {
    grnData = {
      id: '',
      ref: `GRN/${new Date().getFullYear()}/${String(mockGoodsReceiveNotes.length + 1).padStart(3, '0')}`,
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
    // Find existing GRN
    grnData = mockGoodsReceiveNotes.find(grn => grn.id === id || grn.ref === id)
  }

  if (!grnData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Goods Receive Note not found</h2>
          <p className="text-muted-foreground">The requested GRN could not be found.</p>
        </div>
      </div>
    )
  }

  return <GoodsReceiveNoteComponent initialData={grnData} mode={mode} />
}