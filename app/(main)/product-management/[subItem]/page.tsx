import ComingSoon from '@/components/ComingSoon';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    subItem: string
  }
}

export default function ProduutSubItemPage({ params }: PageProps) {
  const title = params.subItem.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  if (!['products', 'categories', 'reports'].includes(params.subItem)) {
    notFound();
  }

  return <ComingSoon title={`Product: ${title}`} />;
}