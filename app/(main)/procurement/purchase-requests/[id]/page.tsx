import PRDetailPage from '../components/PRDetailPage'

interface PageProps {
  params: {
    id: string;
  };
}

export default function PRDetailByIdPage({ params }: PageProps) {
  return <PRDetailPage prId={params.id} />
}