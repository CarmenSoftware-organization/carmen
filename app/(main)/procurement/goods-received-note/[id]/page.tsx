import { GoodsReceiveNoteDetail } from '@/components/goods-receive/GoodsReceiveNoteDetail'
import React from 'react'
export default function GoodsReceiveNoteDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto p-4">
      <GoodsReceiveNoteDetail id={params.id} />
    </div>
  )
}