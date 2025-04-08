import { ReactNode } from "react"


interface VendorManagementLayoutProps {
  children: ReactNode
}

export default function VendorManagementLayout({ children }: VendorManagementLayoutProps) {
  return (
    <div className="flex-1">
      {children}
    </div>
  )
} 