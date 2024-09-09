import ComingSoon from '@/components/ComingSoon';
import { notFound } from 'next/navigation';

export default function StoreOperationsSubItemPage({ params }: { params: { subItem: string } }) {
  const title = params.subItem.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  if (!['store-requisitions', 'issues-management', 'stock-replenishment', 'wastage-reporting'].includes(params.subItem)) {
    notFound();
  }

  return <ComingSoon title={`Store Operations: ${title}`} />;
}