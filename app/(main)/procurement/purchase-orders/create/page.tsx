"use client"

import { ArrowLeft } from "lucide-react"
import { PODetailPage } from "../components/PODetailPage"
import { getRecentPRById } from "../../purchase-requests/data/mock-recent-prs"
import { Skeleton } from "@/components/ui/skeleton"

export default function CreatePurchaseOrderPage() {
  return (
    <div>
      <PODetailPage />
    </div>
  )
} 