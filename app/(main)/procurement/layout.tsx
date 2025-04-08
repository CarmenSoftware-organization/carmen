import { ReactNode } from "react"


interface ProcurementLayoutProps {
  children: ReactNode
}

export default function ProcurementLayout({ children }: ProcurementLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 space-y-4 px-2 py-4 md:px-4 md:py-8 pt-6">
        {children}
      </div>
    </div>
  )
} 