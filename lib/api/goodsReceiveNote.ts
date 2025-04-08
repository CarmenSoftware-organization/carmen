import { GoodsReceiveNote } from "@/lib/types"
import { mockGoodsReceiveNotes } from "@/lib/mock/mock_goodsReceiveNotes"


export async function getGoodsReceiveNoteById(id: string): Promise<GoodsReceiveNote | null> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // Find the GoodsReceiveNote with the matching id
  const goodsReceiveNote = mockGoodsReceiveNotes.find(grn => grn.id === id)

  // If found, return the GoodsReceiveNote, otherwise return null
  return goodsReceiveNote || null
}