import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pencil, Copy, Trash2, Save, X } from 'lucide-react'

interface WorkflowHeaderProps {
  workflow: {
    id: string
    name: string
    type: string
    description: string
    documentReferencePattern: string
    status?: string
  }
  isEditing: boolean
  onEditToggle: () => void
  onSave?: () => void
}

export function WorkflowHeader({ workflow, isEditing, onEditToggle, onSave }: WorkflowHeaderProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <div className="flex items-center space-x-2">
            <CardTitle className="text-2xl font-bold">{workflow.name}</CardTitle>
            {workflow.status && (
              <Badge variant={workflow.status === "Active" ? "default" : "secondary"}>{workflow.status}</Badge>
            )}
          </div>
          <CardDescription>ID: {workflow.id} | Type: {workflow.type}</CardDescription>
        </div>
        <div className="flex space-x-2">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={onEditToggle}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline">
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </Button>
              <Button variant="outline">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={onEditToggle}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button variant="default" onClick={onSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{workflow.description}</p>
        <p className="text-sm text-muted-foreground mt-2">Document Reference Pattern: {workflow.documentReferencePattern}</p>
      </CardContent>
    </Card>
  )
}

