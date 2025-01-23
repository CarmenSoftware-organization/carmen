'use client'

import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InventoryAdjustmentList } from "./components/inventory-adjustment-list"
import { Card, CardContent } from "@/components/ui/card"

export default function InventoryAdjustmentsPage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Inventory Adjustments</h1>
        <Button>
          <PlusIcon className="w-4 h-4 mr-2" />
          New Adjustment
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <InventoryAdjustmentList />
        </CardContent>
      </Card>
    </div>
  )
}
