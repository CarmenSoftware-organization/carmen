'use client'
import React from 'react'
import { mockGoodsReceiveNotes } from '@/lib/mock/mock_goodsReceiveNotes'
import { GRNShadcnDataTable } from './grn-shadcn-data-table'

export function GoodsReceiveNoteList() {
  return (
    <div className="w-full">
      {/* Shadcn-based Data Table with all integrated functionality */}
      <GRNShadcnDataTable data={mockGoodsReceiveNotes} />
    </div>
  )
}
