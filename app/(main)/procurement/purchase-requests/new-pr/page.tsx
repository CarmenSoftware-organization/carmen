"use client"

import { Suspense } from 'react'
import PRDetailPage from '../components/PRDetailPage'
import { Skeleton } from '@/components/ui/skeleton'

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-12 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  )
}

export default function NewPRPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PRDetailPage />
    </Suspense>
  )
} 