'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Plus, FileDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { GoodsReceiveNoteList } from './components/GoodsReceiveNoteList'

export default function GoodsReceiveNotePage() {
  const router = useRouter()

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Goods Receive Notes</h1>
        <div className="space-x-2">
          <Button onClick={() => router.push('/procurement/goods-received-note/create')}>
            <Plus className="h-4 w-4 mr-2" /> Create New
          </Button>
          <Button variant="outline">
            <FileDown className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>
      <GoodsReceiveNoteList />
    </div>
  )
}