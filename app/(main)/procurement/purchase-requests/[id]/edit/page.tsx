"use client"

import PRDetailPage from "../../components/PRDetailPage"
import { Skeleton } from "@/components/ui/skeleton"

function LoadingFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-[200px]" />
      <Skeleton className="h-[400px]" />
    </div>
  )
}

export default function EditPRPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-6">
      <PRDetailPage mode="edit" id={params.id} />
    </div>
  )
} 