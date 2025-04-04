import { Metadata } from "next"

export const metadata: Metadata = {
  title: "POS Mapping",
  description: "Map POS items to inventory items",
}

interface PosOperationsMappingLayoutProps {
  children: React.ReactNode
}

export default function PosOperationsMappingLayout({
  children,
}: PosOperationsMappingLayoutProps) {
  return (
    <div className="flex-1">
      {children}
    </div>
  )
} 