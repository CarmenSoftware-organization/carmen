import ComingSoon from '@/components/ComingSoon';
import { notFound } from 'next/navigation';

export default function VendorManagementSubItemPage({ params }: { params: { subItem: string } }) {
  const title = params.subItem.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  if (!['manage-vendors', 'price-lists', 'price-comparisons'].includes(params.subItem)) {
    notFound();
  }

  return <ComingSoon title={`Vendor Management: ${title}`} />;
}