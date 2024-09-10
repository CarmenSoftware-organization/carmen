import ComingSoon from '@/components/ComingSoon';
import { notFound } from 'next/navigation';

export default function ProcurementSubItemPage({ params }: { params: { subItem: string } }) {
  console.log('Rendering ProcurementSubItemPage', params);  // Add this line
  const title = params.subItem.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  if (!['purchase-requests','purchase-orders', 'goods-received-note', 'credit-notes', 'vendor-management', 'purchase-request-templates'].includes(params.subItem)) {
    console.log('Invalid subItem, calling notFound()', params.subItem);  // Add this line
    notFound();
  }

  return <ComingSoon title={`Procurement: ${title}`} />;
}