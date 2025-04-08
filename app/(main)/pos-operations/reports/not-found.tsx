'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <FileQuestion className="h-10 w-10 text-muted-foreground" />
      <h2 className="text-2xl font-bold">Report Not Found</h2>
      <p className="text-muted-foreground">The report you&apos;re looking for doesn&apos;t exist.</p>
      <Button asChild>
        <Link href="/pos-operations/reports">Return to Reports</Link>
      </Button>
    </div>
  )
} 