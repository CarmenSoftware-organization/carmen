'use client'
import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Save, X, UserPlus, Trash2, Filter, MoreHorizontal } from 'lucide-react'
import { Stage } from "../types/workflow"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mockUsers } from '@/lib/mock-data'

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
  const [userFilter, setUserFilter] = useState<'all' | 'assigned' | 'unassigned'>('all')

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
  }

  const handleDeleteStage = () => {
    if (!selectedStage) return
    const updatedStages = stages.filter(stage => stage.id !== selectedStage.id)
    setStages(updatedStages)
    setSelectedStageId(null)
    onSave(updatedStages)
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

  const handleSelectChange = (field: string, value: string) => {
    if (!selectedStage) return

    const updatedStages = stages.map(stage => {
      if (stage.id === selectedStage.id) {
        return { ...stage, [field]: value }
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

  const handleAssignUser = (user: import('@/lib/types').User) => {
    if (!selectedStage) return

    const updatedStages = stages.map(stage => {
      if (stage.id === selectedStage.id) {
        const isUserAssigned = stage.assignedUsers.some(u => u.id === user.id)
        const updatedUsers = isUserAssigned
          ? stage.assignedUsers.filter(u => u.id !== user.id)
          : [...stage.assignedUsers, user]
        return { ...stage, assignedUsers: updatedUsers }
      }
      return stage
    })
    setStages(updatedStages)
  }

  const handleHideFieldToggle = (field: 'pricePerUnit' | 'totalPrice') => {
    if (!selectedStage) return

    const updatedStages = stages.map(stage => {
      if (stage.id === selectedStage.id) {
        return {
          ...stage,
          hideFields: {
            ...stage.hideFields,
            [field]: !stage.hideFields[field]
          }
        }
      }
      return stage
    })
    setStages(updatedStages)
  }

  const handleAddStage = () => {
    const newStage: Stage = {
      id: stages.length + 1,
      name: `Stage ${stages.length + 1}`,
      description: "",
      sla: "24",
      slaUnit: "hours",
      availableActions: ["Submit"],
      hideFields: {
        pricePerUnit: false,
        totalPrice: false
      },
      assignedUsers: [],
      roleType: 'requester'
    }
    setStages([...stages, newStage])
    setSelectedStageId(newStage.id)
    setIsStageEditing(true)
  }

  const handleSaveStage = () => {
    onSave(stages)
    setIsStageEditing(false)
  }

  const handleCancelStage = () => {
    setStages(initialStages)
    setIsStageEditing(false)
  }

  const filteredUsers = mockUsers.filter(user => {
    const isAssigned = selectedStage?.assignedUsers.some(u => u.id === user.id) ?? false
    switch (userFilter) {
      case 'assigned':
        return isAssigned
      case 'unassigned':
        return !isAssigned
      default:
        return true
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Workflow Stages</h2>
        <p className="text-sm text-muted-foreground">Configure workflow stages and their settings</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card>
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
                <UserPlus className="mr-2 h-4 w-4" /> Add Stage
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Stage Details</CardTitle>
            {selectedStage && parentIsEditing && !isStageEditing && (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => setIsStageEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Stage
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeleteStage}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Stage
                </Button>
              </div>
            )}
            {selectedStage && isStageEditing && (
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
              <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="assigned-users">Assigned Users</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
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
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        name="description"
                        value={selectedStage.description}
                        onChange={handleInputChange}
                        disabled={!isStageEditing}
                      />
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

                    <div>
                      <Label>Hidden Fields</Label>
                      <div className="space-y-3 mt-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="hide-price-per-unit" className="cursor-pointer">Price Per Unit</Label>
                          <Switch
                            id="hide-price-per-unit"
                            checked={selectedStage.hideFields.pricePerUnit}
                            onCheckedChange={() => handleHideFieldToggle('pricePerUnit')}
                            disabled={!isStageEditing}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="hide-total-price" className="cursor-pointer">Total Price</Label>
                          <Switch
                            id="hide-total-price"
                            checked={selectedStage.hideFields.totalPrice}
                            onCheckedChange={() => handleHideFieldToggle('totalPrice')}
                            disabled={!isStageEditing}
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="notifications">
                  <div className="space-y-6">
                    <div className="grid gap-6">
                      {selectedStage.availableActions.includes("Submit") && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Submit Notification</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label>Recipients</Label>
                              <div className="grid gap-3 mt-2">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center space-x-2 min-w-[200px]">
                                    <Switch id="submit-requestor" disabled={!isStageEditing} />
                                    <Label htmlFor="submit-requestor" className="cursor-pointer">Requestor</Label>
                                  </div>
                                  <div className="flex-1">
                                    <Select disabled={!isStageEditing}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select template" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="1">Request Submitted</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                {selectedStage.availableActions.includes("Approve") && (
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center space-x-2 min-w-[200px]">
                                      <Switch id="submit-next-approver" disabled={!isStageEditing} />
                                      <Label htmlFor="submit-next-approver" className="cursor-pointer">Next Stage Approver</Label>
                                    </div>
                                    <div className="flex-1">
                                      <Select disabled={!isStageEditing}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="1">Request Submitted</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {selectedStage.availableActions.includes("Approve") && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Approve Notification</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label>Recipients</Label>
                              <div className="grid gap-3 mt-2">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center space-x-2 min-w-[200px]">
                                    <Switch id="approve-requestor" disabled={!isStageEditing} />
                                    <Label htmlFor="approve-requestor" className="cursor-pointer">Requestor</Label>
                                  </div>
                                  <div className="flex-1">
                                    <Select disabled={!isStageEditing}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select template" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="2">Request Approved</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center space-x-2 min-w-[200px]">
                                    <Switch id="approve-current-approver" disabled={!isStageEditing} />
                                    <Label htmlFor="approve-current-approver" className="cursor-pointer">Current Approver</Label>
                                  </div>
                                  <div className="flex-1">
                                    <Select disabled={!isStageEditing}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select template" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="2">Request Approved</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                {selectedStage.availableActions.includes("Approve") && (
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center space-x-2 min-w-[200px]">
                                      <Switch id="approve-next-approver" disabled={!isStageEditing} />
                                      <Label htmlFor="approve-next-approver" className="cursor-pointer">Next Stage Approver</Label>
                                    </div>
                                    <div className="flex-1">
                                      <Select disabled={!isStageEditing}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="2">Request Approved</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {selectedStage.availableActions.includes("Reject") && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Reject Notification</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label>Recipients</Label>
                              <div className="grid gap-3 mt-2">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center space-x-2 min-w-[200px]">
                                    <Switch id="reject-requestor" disabled={!isStageEditing} />
                                    <Label htmlFor="reject-requestor" className="cursor-pointer">Requestor</Label>
                                  </div>
                                  <div className="flex-1">
                                    <Select disabled={!isStageEditing}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select template" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="3">Request Rejected</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center space-x-2 min-w-[200px]">
                                    <Switch id="reject-previous-approvers" disabled={!isStageEditing} />
                                    <Label htmlFor="reject-previous-approvers" className="cursor-pointer">Previous Stage Approvers</Label>
                                  </div>
                                  <div className="flex-1">
                                    <Select disabled={!isStageEditing}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select template" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="3">Request Rejected</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {selectedStage.availableActions.includes("Send Back") && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Send Back Notification</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label>Recipients</Label>
                              <div className="grid gap-3 mt-2">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center space-x-2 min-w-[200px]">
                                    <Switch id="sendback-requestor" disabled={!isStageEditing} />
                                    <Label htmlFor="sendback-requestor" className="cursor-pointer">Requestor</Label>
                                  </div>
                                  <div className="flex-1">
                                    <Select disabled={!isStageEditing}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select template" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="4">Request Sent Back</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center space-x-2 min-w-[200px]">
                                    <Switch id="sendback-previous-approver" disabled={!isStageEditing} />
                                    <Label htmlFor="sendback-previous-approver" className="cursor-pointer">Previous Stage Approver</Label>
                                  </div>
                                  <div className="flex-1">
                                    <Select disabled={!isStageEditing}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select template" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="4">Request Sent Back</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <Card>
                        <CardHeader>
                          <CardTitle>SLA Warning Notification</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label>Recipients</Label>
                            <div className="grid gap-3 mt-2">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center space-x-2 min-w-[200px]">
                                  <Switch id="sla-requestor" disabled={!isStageEditing} />
                                  <Label htmlFor="sla-requestor" className="cursor-pointer">Requestor</Label>
                                </div>
                                <div className="flex-1">
                                  <Select disabled={!isStageEditing}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="5">SLA Warning</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center space-x-2 min-w-[200px]">
                                  <Switch id="sla-current-approver" disabled={!isStageEditing} />
                                  <Label htmlFor="sla-current-approver" className="cursor-pointer">Current Approver</Label>
                                </div>
                                <div className="flex-1">
                                  <Select disabled={!isStageEditing}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="5">SLA Warning</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="assigned-users">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-lg font-semibold">Stage Users</h2>
                        <p className="text-sm text-muted-foreground">
                          Manage users assigned to this stage
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <Input
                        className="flex-grow"
                        placeholder="Search users..."
                        onChange={(e) => console.log("Search:", e.target.value)}
                      />
                      <Select
                        value={userFilter}
                        onValueChange={(value: 'all' | 'assigned' | 'unassigned') => setUserFilter(value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="assigned">Assigned</SelectItem>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                    </div>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-semibold">Total Users: {selectedStage.assignedUsers.length} / {mockUsers.length}</span>
                          <Button variant="outline" size="sm">Bulk Actions</Button>
                        </div>

                        <div className="space-y-4">
                          {filteredUsers.map((user) => {
                            const isAssigned = selectedStage.assignedUsers.some(u => u.id === user.id)
                            return (
                              <Card key={user.id} className={`p-4 hover:bg-gray-50 ${isAssigned ? 'border-primary' : ''}`}>
                                <div className="flex items-center space-x-4">
                                  <Avatar>
                                    <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`} />
                                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-grow">
                                    <h4 className="font-semibold">{user.name}</h4>
                                    <p className="text-sm text-gray-500">{user.department} • {user.location}</p>
                                  </div>
                                  <Button
                                    variant={isAssigned ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleAssignUser(user)}
                                    disabled={!isStageEditing}
                                  >
                                    {isAssigned ? 'Assigned' : 'Assign'}
                                  </Button>
                                </div>
                              </Card>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Showing all users
                      </span>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" disabled>Previous</Button>
                        <Button variant="outline" size="sm" disabled>Next</Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <p className="text-muted-foreground">Select a stage to view or edit details</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

