import { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MappingNav } from "./components"

interface MappingLayoutProps {
  children: ReactNode
}

export default function MappingLayout({ children }: MappingLayoutProps) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
          <Link href="/system-administration/system-integrations/pos">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">POS Mapping</h1>
      </div>
      
      <MappingNav />
      
      {children}
    </div>
  )
} 