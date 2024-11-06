import { Card } from '@/components/ui/card'
import { StoreRequisitionDetailComponent } from '../components/store-requisition-detail'

interface StoreRequisitionDetailPageProps {
  params: {
    id: string
  }
}

export default function StoreRequisitionDetailPage({ params }: StoreRequisitionDetailPageProps) {
  return (
    <div className="container mx-auto py-6">
      <StoreRequisitionDetailComponent id={params.id} />
    </div>
  )
} 