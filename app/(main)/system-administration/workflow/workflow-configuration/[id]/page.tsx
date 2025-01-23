import { WorkflowDetail } from "../components/workflow-detail"
import { sampleWorkflows } from "../data/mockData"

export default function WorkflowDetailPage({ params }: { params: { id: string } }) {
  const workflowId = params.id
  return <WorkflowDetail workflowId={workflowId} />
}

export async function generateStaticParams() {
  return sampleWorkflows.map((workflow) => ({
    id: workflow.id,
  }))
}

