import { PurchaseRequest } from '@/lib/types'
import { ReactNode } from 'react'


export interface PRListTemplateProps {
  data: PurchaseRequest[]
  onCreateNew?: () => void
  onExport?: () => void
  onPrint?: () => void
  onSearch?: (term: string) => void
  renderFilters?: () => ReactNode
  renderBulkActions?: (selectedItems: string[]) => ReactNode
  onRowClick?: (id: string) => void
  title?: string
  selectedItems?: string[]
} 