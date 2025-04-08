import { PODetailPage } from './../components/PODetailPage'

interface PageProps {
  params: {
    id: string
  }
}

export default function PurchaseOrderDetailPage({ params }: PageProps) {
  return <PODetailPage params={params} />
}
