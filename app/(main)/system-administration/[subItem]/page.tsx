import ComingSoon from '@/components/ComingSoon';

export default function SystemAdministrationSubItem({ params }: { params: { subItem: string } }) {
  const subItem = params.subItem;

  return <ComingSoon title={`${subItem.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`} />;
}