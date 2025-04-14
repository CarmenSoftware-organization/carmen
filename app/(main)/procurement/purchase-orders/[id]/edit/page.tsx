import { PODetailPage } from '../../components/PODetailPage'

export default function PurchaseOrderEditPage({ params }: { params: { id: string } }) {
  return <PODetailPage params={params} />
} 