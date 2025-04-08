import ComingSoon from '@/components/ComingSoon';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    subItem: string;
  };
}

export default function VendorManagementSubItemPage({ params }: PageProps) {
  const title = params.subItem.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  if (!['manage-vendors', 'price-lists', 'price-comparisons'].includes(params.subItem)) {
    notFound();
  }

  return <ComingSoon title={`Vendor Management: ${title}`} />;
}