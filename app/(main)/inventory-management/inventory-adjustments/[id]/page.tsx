'use client'

import { ArrowLeftIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { InventoryAdjustmentDetail } from "../components/inventory-adjustment-detail"

export default function InventoryAdjustmentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-4 p-4">
      <InventoryAdjustmentDetail id={params.id} />
    </div>
  )
}
