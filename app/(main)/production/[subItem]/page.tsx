import { notFound } from 'next/navigation';
import ComingSoon from '@/components/ComingSoon';

interface PageProps {
  params: {
    subItem: string
  }
}

export default function ProductionSubItemPage({ params }: PageProps) {
  const title = params.subItem.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  if (!['recipe-execution', 'batch-production', 'wastage-tracking', 'quality-control'].includes(params.subItem)) {
    notFound();
  }

  return <ComingSoon title={`Production: ${title}`} />;
}