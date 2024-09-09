import ComingSoon from '@/components/ComingSoon';
import { notFound } from 'next/navigation';

export default function HelpSupportSubItemPage({ params }: { params: { subItem: string } }) {
  const title = params.subItem.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  if (!['user-manuals', 'video-tutorials', 'faqs', 'support-ticket-system', 'system-updates-and-release-notes'].includes(params.subItem)) {
    notFound();
  }

  return <ComingSoon title={`Help & Support: ${title}`} />;
}