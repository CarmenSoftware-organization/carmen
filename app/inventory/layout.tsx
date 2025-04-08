import { ReactNode } from "react"


interface InventoryLayoutProps {
  children: ReactNode
}

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex-1">
      {children}
    </div>
  )
} 