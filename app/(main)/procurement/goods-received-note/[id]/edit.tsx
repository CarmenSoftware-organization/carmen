'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { GoodsReceiveNoteComponent} from '../components/goods-receive-note'
import { GoodsReceiveNoteMode, GoodsReceiveNote } from '@/lib/types'
import { mockGoodsReceiveNotes } from '@/lib/mock/mock_goodsReceiveNotes'

export default function EditGoodsReceiveNote() {
  const router = useRouter()
  const params = useParams()
  const [mode, setMode] = useState<GoodsReceiveNoteMode>('edit')
  const [loading, setLoading] = useState(true)
  const [grnData, setGrnData] = useState<GoodsReceiveNote | null>(null)

  useEffect(() => {
    // In a real application, you would fetch the GRN data from an API
    // For this example, we'll use the sample data
    const loadGRN = () => {
      const grn = mockGoodsReceiveNotes.find(grn => grn.id === params?.id)
      if (grn) {
        setGrnData(grn)
      } else {
        // Handle case where GRN is not found
        console.error('GRN not found')
        router.push('/procurement/goods-received-note')
      }
      setLoading(false)
    }

    loadGRN()
  }, [router, params?.id]) // Include params.id in dependencies since it's used in the effect

  if (loading) {
    return <div>Loading...</div>
  }

  if (!grnData) {
    return <div>GRN not found</div>
  }

  return (
    <GoodsReceiveNoteComponent 
      mode={mode} 
      initialData={grnData}
    />
  )
}