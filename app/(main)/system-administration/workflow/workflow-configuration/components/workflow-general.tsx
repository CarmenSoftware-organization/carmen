'use client'
import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface WorkflowGeneralProps {
  workflow: {
    id: string
    name: string
    type: string
    description: string
    documentReferencePattern: string
  }
  isEditing: boolean
  onSave: (updatedWorkflow: any) => void
}

export function WorkflowGeneral({ workflow, isEditing, onSave }: WorkflowGeneralProps) {
  const [editedWorkflow, setEditedWorkflow] = useState(workflow)

  useEffect(() => {
    setEditedWorkflow(workflow)
  }, [workflow])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const updatedWorkflow = {
      ...editedWorkflow,
      [e.target.id]: e.target.value,
    }
    setEditedWorkflow(updatedWorkflow)
    onSave(updatedWorkflow)
  }

  const handleSelectChange = (value: string) => {
    const updatedWorkflow = {
      ...editedWorkflow,
      type: value,
    }
    setEditedWorkflow(updatedWorkflow)
    onSave(updatedWorkflow)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Workflow Name</Label>
              <Input
                id="name"
                value={editedWorkflow.name}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="type">Type Selection</Label>
              <Select
                value={editedWorkflow.type}
                onValueChange={handleSelectChange}
                disabled={!isEditing}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Purchase Request">Purchase Request</SelectItem>
                  <SelectItem value="Store Requisition">Store Requisition</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedWorkflow.description}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="documentReferencePattern">Document Reference Pattern</Label>
            <Input
              id="documentReferencePattern"
              value={editedWorkflow.documentReferencePattern}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Configuration Guide</h3>
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Getting Started</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Begin by setting up the basic workflow information and stages.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Next Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Configure routing rules and notification settings for each stage.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Best Practices</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Ensure clear stage definitions and appropriate approval levels.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

