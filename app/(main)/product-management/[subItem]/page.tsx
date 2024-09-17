import ComingSoon from '@/components/ComingSoon';
import { notFound } from 'next/navigation';

export default function ProduutSubItemPage({ params }: { params: { subItem: string } }) {
  const title = params.subItem.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  if (!['products', 'categories', 'reports'].includes(params.subItem)) {
    notFound();
  }

  return <ComingSoon title={`Product: ${title}`} />;
}