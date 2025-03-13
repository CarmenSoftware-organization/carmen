import ComingSoon from '@/components/ComingSoon';
import { notFound } from 'next/navigation';

export default function SystemAdministrationSubItem({ params }: { params: { subItem: string } }) {
  const subItem = params.subItem;
  
  // Skip ComingSoon for system-integrations path
  if (subItem === 'system-integrations') {
    notFound();
  }

  return <ComingSoon title={`${subItem.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`} />;
}