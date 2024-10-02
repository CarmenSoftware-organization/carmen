'use client'
import { useState } from 'react'
import { GoodsReceiveNoteDetail } from '@/components/goods-receive/GoodsReceiveNoteDetail'
import { GoodsReceiveNoteMode } from '@/lib/types'

export default function CreateGoodsReceiveNote() {
  const [mode, setMode] = useState<GoodsReceiveNoteMode>('add')

  return (
    <div className="container mx-auto p-6">
      <GoodsReceiveNoteDetail mode={mode} onModeChange={setMode} />
    </div>
  )
}