'use client'
import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Plus, Save, X, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Template, NotificationEventTrigger } from "../types/workflow"

interface WorkflowTemplatesProps {
  templates: Template[]
  isEditing: boolean
  onSave: (templates: Template[]) => void
}

// Define variable groups and their items
const templateVariables = {
  "Request Information": [
    { label: "Request Number", value: "{{request.number}}" },
    { label: "Request Date", value: "{{request.date}}" },
    { label: "Request Type", value: "{{request.type}}" },
    { label: "Request Status", value: "{{request.status}}" },
    { label: "Total Amount", value: "{{request.amount}}" },
  ],
  "User Information": [
    { label: "Requester Name", value: "{{requester.name}}" },
    { label: "Requester Department", value: "{{requester.department}}" },
    { label: "Requester Email", value: "{{requester.email}}" },
    { label: "Approver Name", value: "{{approver.name}}" },
    { label: "Approver Email", value: "{{approver.email}}" },
  ],
  "Workflow Information": [
    { label: "Current Stage", value: "{{workflow.currentStage}}" },
    { label: "Next Stage", value: "{{workflow.nextStage}}" },
    { label: "Previous Stage", value: "{{workflow.previousStage}}" },
    { label: "Due Date", value: "{{workflow.dueDate}}" },
    { label: "SLA Remaining", value: "{{workflow.slaRemaining}}" },
  ],
  "System Information": [
    { label: "Current Date", value: "{{system.date}}" },
    { label: "Current Time", value: "{{system.time}}" },
    { label: "Company Name", value: "{{system.companyName}}" },
    { label: "System URL", value: "{{system.url}}" },
  ]
}

export function WorkflowTemplates({ 
  templates: initialTemplates = [], 
  isEditing: parentIsEditing,
  onSave 
}: WorkflowTemplatesProps) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates)
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  const [isTemplateEditing, setIsTemplateEditing] = useState(false)

  useEffect(() => {
    setTemplates(initialTemplates)
  }, [initialTemplates])

  useEffect(() => {
    if (!parentIsEditing) {
      setIsTemplateEditing(false)
    }
  }, [parentIsEditing])

  const selectedTemplate = templates.find(template => template.id === selectedTemplateId)

  const handleTemplateSelect = (templateId: number) => {
    setSelectedTemplateId(templateId)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!selectedTemplate) return

    const updatedTemplates = templates.map(template => {
      if (template.id === selectedTemplate.id) {
        return { ...template, [e.target.id]: e.target.value }
      }
      return template
    })
    setTemplates(updatedTemplates)
  }

  const handleSelectChange = (field: string, value: NotificationEventTrigger) => {
    if (!selectedTemplate) return

    const updatedTemplates = templates.map(template => {
      if (template.id === selectedTemplate.id) {
        return { ...template, [field]: value }
      }
      return template
    })
    setTemplates(updatedTemplates)
  }

  const handleInsertVariable = (variable: string) => {
    if (!selectedTemplate) return

    const activeElement = document.activeElement
    if (!activeElement) return

    const field = activeElement.id === 'subjectLine' ? 'subjectLine' : 'content'
    const updatedTemplates = templates.map(template => {
      if (template.id === selectedTemplate.id) {
        const currentValue = template[field] || ''
        return {
          ...template,
          [field]: currentValue + variable
        }
      }
      return template
    })
    setTemplates(updatedTemplates)
  }

  const handleSaveTemplate = () => {
    onSave(templates)
    setIsTemplateEditing(false)
  }

  const handleCancelTemplate = () => {
    const updatedTemplates = templates.map(template => {
      if (template.id === selectedTemplateId) {
        const initialTemplate = initialTemplates.find(t => t.id === selectedTemplateId)
        return initialTemplate || template
      }
      return template
    })
    setTemplates(updatedTemplates)
    setIsTemplateEditing(false)
  }

  const handleAddTemplate = () => {
    const newTemplate: Template = {
      id: Math.max(0, ...templates.map(n => n.id)) + 1,
      name: "",
      eventTrigger: "onSubmit",
      description: "",
      subjectLine: "",
      content: ""
    }
    const updatedTemplates = [...templates, newTemplate]
    setTemplates(updatedTemplates)
    setSelectedTemplateId(newTemplate.id)
    setIsTemplateEditing(true)
  }

  const handleDeleteTemplate = () => {
    if (!selectedTemplate) return
    const updatedTemplates = templates.filter(template => template.id !== selectedTemplate.id)
    setTemplates(updatedTemplates)
    setSelectedTemplateId(null)
    onSave(updatedTemplates)
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Notification Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {templates.map((template) => (
              <li
                key={template.id}
                className={`p-2 rounded-md cursor-pointer ${
                  selectedTemplateId === template.id 
                    ? 'bg-secondary' 
                    : 'hover:bg-secondary/50'
                }`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                {template.name || 'Unnamed Template'}
              </li>
            ))}
          </ul>
          {parentIsEditing && (
            <Button className="w-full mt-4" onClick={handleAddTemplate}>
              <Plus className="mr-2 h-4 w-4" /> Add Template
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Template Details</CardTitle>
          {selectedTemplate && parentIsEditing && !isTemplateEditing && (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleDeleteTemplate}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Template
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsTemplateEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Template
              </Button>
            </div>
          )}
          {selectedTemplate && isTemplateEditing && (
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={handleCancelTemplate}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveTemplate}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {selectedTemplate ? (
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input 
                  id="name" 
                  value={selectedTemplate.name} 
                  onChange={handleInputChange}
                  placeholder="Enter template name"
                  disabled={!isTemplateEditing}
                />
              </div>
              
              <div>
                <Label>Template Content</Label>
                <div className="space-y-4 mt-2">
                  <div>
                    <Label htmlFor="subjectLine">Subject Line</Label>
                    <Input 
                      id="subjectLine"
                      value={selectedTemplate.subjectLine}
                      onChange={handleInputChange}
                      placeholder="Enter subject line"
                      disabled={!isTemplateEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea 
                      id="content"
                      value={selectedTemplate.content}
                      onChange={handleInputChange}
                      placeholder="Enter content"
                      className="min-h-[200px]"
                      disabled={!isTemplateEditing}
                    />
                  </div>
                  <div className="flex justify-between">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" disabled={!isTemplateEditing}>Insert Variable</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-72">
                        {Object.entries(templateVariables).map(([group, variables]) => (
                          <React.Fragment key={group}>
                            <DropdownMenuLabel>{group}</DropdownMenuLabel>
                            <DropdownMenuGroup>
                              {variables.map((variable) => (
                                <DropdownMenuItem
                                  key={variable.value}
                                  onClick={() => handleInsertVariable(variable.value)}
                                >
                                  {variable.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                          </React.Fragment>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" disabled={!isTemplateEditing}>Preview</Button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <p className="text-muted-foreground">Select a template to view or edit details</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 