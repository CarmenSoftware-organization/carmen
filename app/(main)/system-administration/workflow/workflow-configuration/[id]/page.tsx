import { WorkflowDetail } from "../components/workflow-detail"
import { sampleWorkflows } from "../data/mockData"

interface WorkflowDetailPageProps {
  params: {
    id: string
  }
}

export default function WorkflowDetailPage({ params }: WorkflowDetailPageProps) {
  const workflowId = params.id
  return <WorkflowDetail workflowId={workflowId} />
}

export async function generateStaticParams() {
  return sampleWorkflows.map((workflow) => ({
    id: workflow.id,
  }))
}

