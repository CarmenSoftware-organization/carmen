import ComingSoon from '@/components/ComingSoon';
import { notFound } from 'next/navigation';

export default function ProductionSubItemPage({ params }: { params: { subItem: string } }) {
  const title = params.subItem.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  if (!['recipe-execution', 'batch-production', 'wastage-tracking', 'quality-control'].includes(params.subItem)) {
    notFound();
  }

  return <ComingSoon title={`Production: ${title}`} />;
}