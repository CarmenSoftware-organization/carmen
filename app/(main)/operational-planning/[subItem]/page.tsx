import ComingSoon from '@/components/ComingSoon';
import { notFound } from 'next/navigation';

export default function OperationalPlanningSubItemPage({ params }: { params: { subItem: string } }) {
  const title = params.subItem.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  if (!['dashboard', 'recipes-management', 'menu-engineering', 'demand-forecasting', 'inventory-planning'].includes(params.subItem)) {
    notFound();
  }

  return <ComingSoon title={`Operational Planning: ${title}`} />;
}