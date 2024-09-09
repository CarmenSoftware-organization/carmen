import ComingSoon from '@/components/ComingSoon';
import { notFound } from 'next/navigation';

export default function ReportingAnalyticsSubItemPage({ params }: { params: { subItem: string } }) {
  const title = params.subItem.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  if (!['operational-reports', 'financial-reports', 'inventory-reports', 'vendor-performance', 'cost-analysis', 'sales-analysis'].includes(params.subItem)) {
    notFound();
  }

  return <ComingSoon title={`Reporting & Analytics: ${title}`} />;
}