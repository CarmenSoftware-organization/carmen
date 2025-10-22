'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { GoodsReceiveNoteComponent } from '../components/goods-receive-note'
import { mockGoodsReceiveNotes } from '@/lib/mock-data'
import { GoodsReceiveNote, GRNStatus } from '@/lib/types'
import { useGRNCreationStore } from '@/lib/store/grn-creation.store'
import { useEffect, useState } from 'react'
import { GRNDetailMode } from '../components/GoodsReceiveNoteDetail'

export default function GoodsReceiveNotePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const modeParam = searchParams?.get('mode') as GRNDetailMode | 'confirm' || 'view'
  const id = params.id

  // Select state using the hook outside useEffect
  const newlyCreatedGRNDataFromStore = useGRNCreationStore((state) => state.newlyCreatedGRNData)
  const setNewlyCreatedGRNData = useGRNCreationStore((state) => state.setNewlyCreatedGRNData)

  const [grnData, setGrnData] = useState<GoodsReceiveNote | null | undefined>(undefined)
  // Remove internal mode state - child component handles its mode now
  // const [currentMode, setCurrentMode] = useState<GRNDetailMode | 'confirm' | undefined>(undefined)

  useEffect(() => {
    console.log('[Effect] Running for ID:', id, 'Mode Param:', modeParam, 'Store Data:', newlyCreatedGRNDataFromStore);
    let data: GoodsReceiveNote | null | undefined = undefined
    // Remove finalMode calculation - child component handles its mode now
    // let finalMode = modeParam;

    if (id.startsWith('new-')) {
      console.log('[Effect] Handling new ID. Checking store data from hook:', newlyCreatedGRNDataFromStore);
      if (newlyCreatedGRNDataFromStore && newlyCreatedGRNDataFromStore.id === id) {
        data = newlyCreatedGRNDataFromStore
        // finalMode = 'confirm' // No longer needed here
        setNewlyCreatedGRNData(null) 
        console.log('[Effect] Loaded from store via hook:', data);
      } else {
        console.warn('[Effect] No data in store for new GRN. Creating default draft GRN.');
        data = ({
          id: id, // Use the ID from the URL
          grnNumber: 'NEW GRN',
          receiptDate: new Date(),
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
          status: GRNStatus.RECEIVED,
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
        } as any);
        // finalMode = 'add'; // No longer needed here
        console.log('[Effect] Created new draft GRN:', data);
      }
    } else if (id === '0') {
      console.warn('[Effect] Accessing ID 0 - likely deprecated flow.')
      data = ({
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
        vendorId: '',
        location: '',
        currency: '',
        exchangeRate: 1,
        baseCurrency: '',
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
      } as any)
      // finalMode = 'add' // No longer needed here
    } else {
      console.log('[Effect] Fetching existing GRN with ID:', id)
      data = mockGoodsReceiveNotes.find(grn => grn.id === id) || null
      // finalMode = modeParam // No longer needed here
      if (!data) {
        console.error('[Effect] Existing GRN not found:', id)
      }
    }

    console.log('[Effect] Setting final data state. Data:', data);
    setGrnData(data)
    // Remove setting mode state - child handles its mode
    // setCurrentMode(finalMode) 

  }, [id, modeParam, router, newlyCreatedGRNDataFromStore, setNewlyCreatedGRNData])

  // Add console log to see render cycles
  console.log('[Render] GRN Page. ID:', id, 'GRN Data State:', grnData);

  // Show loading only based on data
  if (grnData === undefined) { 
    console.log('[Render] Showing Loading state (data pending)...');
    return <div>Loading Goods Receive Note...</div>
  }

  // Show error/not found if data is null (e.g., fetch failed or redirect happened)
  if (grnData === null) { 
    console.log('[Render] Showing Not Found / Error state (data is null)...');
    return <div>Goods Receive Note not found or error loading data.</div>
  }

  // Render child component without mode prop
  console.log('[Render] Rendering GoodsReceiveNoteComponent with props:', {initialData: grnData});
  return <GoodsReceiveNoteComponent initialData={grnData} />
}