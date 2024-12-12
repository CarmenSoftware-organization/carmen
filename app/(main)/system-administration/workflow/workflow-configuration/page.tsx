import { WorkflowList } from "./components/workflow-list"
import { sampleWorkflows } from "./data/mockData"

export default function Home() {
  const workflows = sampleWorkflows.map(workflow => ({
    id: workflow.id,
    name: workflow.name,
    type: workflow.type,
    status: workflow.status || "Active", // Ensure all workflows have a status
    lastModified: new Date().toISOString(), // In a real app, this would come from the workflow data
  }))

  return (
    <main>
      <WorkflowList workflows={workflows} />
    </main>
  )
}

