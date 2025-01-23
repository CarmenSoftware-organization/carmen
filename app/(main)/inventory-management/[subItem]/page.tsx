import ComingSoon from '@/components/ComingSoon';
import { notFound } from 'next/navigation';

export default function InventoryManagementSubItemPage({ params }: { params: { subItem: string } }) {
  const title = params.subItem.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  if (!['stock-overview', 'stock-in', 'stock-out', 'transfer-between-locations', 'physical-count', 'stock-take', 'inventory-valuation'].includes(params.subItem)) {
    notFound();
  }

  return <ComingSoon title={`Inventory Management: ${title}`} />;
}