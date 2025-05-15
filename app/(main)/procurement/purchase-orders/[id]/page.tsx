import PODetailPage from '../components/PODetailPage';

export default function PurchaseOrderDetailPage({ params }: { params: { id: string } }) {
  return <PODetailPage params={params} />
}
