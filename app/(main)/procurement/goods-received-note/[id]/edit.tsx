'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GoodsReceiveNoteComponent} from '../components/goods-receive-note'
import { GoodsReceiveNoteMode, GoodsReceiveNote } from '@/lib/types'
import { mockGoodsReceiveNotes } from '@/lib/mock/mock_goodsReceiveNotes'

export default function EditGoodsReceiveNote({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [mode, setMode] = useState<GoodsReceiveNoteMode>('edit')
  const [loading, setLoading] = useState(true)
  const [grnData, setGrnData] = useState<GoodsReceiveNote | null>(null)

  useEffect(() => {
    // In a real application, you would fetch the GRN data from an API
    // For this example, we'll use the sample data
    const grn = mockGoodsReceiveNotes.find(grn => grn.id === params.id)
    if (grn) {
      setGrnData(grn)
    } else {
      // Handle case where GRN is not found
      console.error('GRN not found')
      router.push('/procurement/goods-received-note')
    }
    setLoading(false)
  }, [params.id, router])

  const handleModeChange = (newMode: GoodsReceiveNoteMode) => {
    if (newMode === 'view') {
      // Navigate back to the view page
      router.push(`/procurement/goods-received-note/${params.id}`)
    } else {
      setMode(newMode)
    }
  }

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