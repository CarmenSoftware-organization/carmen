import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Save, X } from 'lucide-react'
import { roles } from "../../role-assignment/data/mockData"

interface Stage {
  id: number
  name: string
  approver: string
  sla: string
  slaUnit: string
  approverRoles: string[]
  availableActions: string[]
}

interface WorkflowStagesProps {
  stages: Stage[]
  isEditing: boolean
  onSave: (stages: Stage[]) => void
}

export function WorkflowStages({ 
  stages: initialStages, 
  isEditing: parentIsEditing, 
  onSave
}: WorkflowStagesProps) {
  const [stages, setStages] = useState<Stage[]>(initialStages)
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null)
  const [isStageEditing, setIsStageEditing] = useState(false)

  useEffect(() => {
    setStages(initialStages)
  }, [initialStages])

  useEffect(() => {
    if (!parentIsEditing) {
      setIsStageEditing(false)
    }
  }, [parentIsEditing])

  const selectedStage = stages.find(stage => stage.id === selectedStageId)

  const handleStageSelect = (stageId: number) => {
    setSelectedStageId(stageId)
    setIsStageEditing(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedStage) return

    const updatedStages = stages.map(stage => {
      if (stage.id === selectedStage.id) {
        return { ...stage, [e.target.name]: e.target.value }
      }
      return stage
    })
    setStages(updatedStages)
  }

  const handleSelectChange = (name: string, value: string) => {
    if (!selectedStage) return

    const updatedStages = stages.map(stage => {
      if (stage.id === selectedStage.id) {
        return { ...stage, [name]: value }
      }
      return stage
    })
    setStages(updatedStages)
  }

  const handleActionToggle = (action: string) => {
    if (!selectedStage) return

    const updatedStages = stages.map(stage => {
      if (stage.id === selectedStage.id) {
        const updatedActions = stage.availableActions.includes(action)
          ? stage.availableActions.filter(a => a !== action)
          : [...stage.availableActions, action]
        return { ...stage, availableActions: updatedActions }
      }
      return stage
    })
    setStages(updatedStages)
  }

  const handleSaveStage = () => {
    setIsStageEditing(false)
    onSave(stages)
  }

  const handleCancelStage = () => {
    const updatedStages = stages.map(stage => {
      if (stage.id === selectedStageId) {
        const initialStage = initialStages.find(s => s.id === selectedStageId)
        return initialStage || stage
      }
      return stage
    })
    setStages(updatedStages)
    setIsStageEditing(false)
  }

  const handleAddStage = () => {
    const newStage: Stage = {
      id: stages.length + 1,
      name: `Stage ${stages.length + 1}`,
      approver: "",
      sla: "24",
      slaUnit: "hours",
      approverRoles: roles.map(role => role.name),
      availableActions: ["Submit"]
    }
    setStages([...stages, newStage])
    setSelectedStageId(newStage.id)
    setIsStageEditing(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Workflow Stages</h2>
          <p className="text-sm text-muted-foreground">Configure workflow stages and their settings</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Stages</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {stages.map((stage) => (
                <li
                  key={stage.id}
                  className={`p-2 rounded-md cursor-pointer ${
                    selectedStageId === stage.id 
                      ? 'bg-secondary' 
                      : 'hover:bg-secondary/50'
                  }`}
                  onClick={() => handleStageSelect(stage.id)}
                >
                  {stage.name}
                </li>
              ))}
            </ul>
            {parentIsEditing && (
              <Button className="w-full mt-4" onClick={handleAddStage}>
                Add Stage
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Stage Details</CardTitle>
            {selectedStage && parentIsEditing && !isStageEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsStageEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Stage
              </Button>
            )}
            {selectedStage && parentIsEditing && isStageEditing && (
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={handleCancelStage}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveStage}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {selectedStage ? (
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <Label htmlFor="name">Stage Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={selectedStage.name}
                    onChange={handleInputChange}
                    disabled={!isStageEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="approver">Assigned Role</Label>
                  <Select
                    value={selectedStage.approver}
                    onValueChange={(value) => handleSelectChange("approver", value)}
                    disabled={!isStageEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assigned role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedStage.approver && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {roles.find(r => r.name === selectedStage.approver)?.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sla">SLA</Label>
                    <Input
                      id="sla"
                      name="sla"
                      value={selectedStage.sla}
                      onChange={handleInputChange}
                      disabled={!isStageEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="slaUnit">SLA Unit</Label>
                    <Select
                      value={selectedStage.slaUnit}
                      onValueChange={(value) => handleSelectChange("slaUnit", value)}
                      disabled={!isStageEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Available Actions</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["Submit", "Approve", "Reject", "Send Back"].map((action) => (
                      <Button
                        key={action}
                        variant={selectedStage.availableActions.includes(action) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleActionToggle(action)}
                        disabled={!isStageEditing}
                      >
                        {action}
                      </Button>
                    ))}
                  </div>
                </div>
              </form>
            ) : (
              <p className="text-muted-foreground">Select a stage to view or edit details</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

