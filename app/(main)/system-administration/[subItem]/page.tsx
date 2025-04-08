import ComingSoon from '@/components/ComingSoon';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    subItem: string;
  };
}

export default function SystemAdministrationSubItem({ params }: PageProps) {
  const subItem = params.subItem;
  
  // Skip ComingSoon for system-integrations path
  if (subItem === 'system-integrations') {
    notFound();
  }

  return <ComingSoon title={`${subItem.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`} />;
}