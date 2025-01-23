import ComingSoon from '@/components/ComingSoon';
import { notFound } from 'next/navigation';

export default function FinanceSubItemPage({ params }: { params: { subItem: string } }) {
  const title = params.subItem.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  if (!['account-code-mapping', 'currency-management', 'exchange-rates', 'department-and-cost-center-management', 'budget-planning-and-control'].includes(params.subItem)) {
    notFound();
  }

  return <ComingSoon title={`Finance: ${title}`} />;
}