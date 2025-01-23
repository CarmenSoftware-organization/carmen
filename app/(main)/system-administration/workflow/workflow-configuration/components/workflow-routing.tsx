'use client'
import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Plus, Save, X, Trash2 } from 'lucide-react'
import { RoutingRule, OperatorType, ActionType } from "../types/workflow"

interface WorkflowRoutingProps {
  rules: RoutingRule[]
  stages: string[]
  isEditing: boolean
  onSave: (rules: RoutingRule[]) => void
}

export function WorkflowRouting({ 
  rules: initialRules = [], 
  stages,
  isEditing: parentIsEditing,
  onSave 
}: WorkflowRoutingProps) {
  const [rules, setRules] = useState<RoutingRule[]>(initialRules)
  const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null)
  const [isRuleEditing, setIsRuleEditing] = useState(false)

  useEffect(() => {
    setRules(initialRules)
  }, [initialRules])

  useEffect(() => {
    if (!parentIsEditing) {
      setIsRuleEditing(false)
      setSelectedRuleId(null)
    }
  }, [parentIsEditing])

  const selectedRule = rules.find(rule => rule.id === selectedRuleId)

  const handleRuleSelect = (ruleId: number) => {
    if (isRuleEditing) return
    setSelectedRuleId(ruleId)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!selectedRule || !isRuleEditing) return

    const updatedRules = rules.map(rule => {
      if (rule.id === selectedRule.id) {
        return { ...rule, [e.target.id]: e.target.value }
      }
      return rule
    })
    setRules(updatedRules)
  }

  const handleConditionChange = (field: keyof RoutingRule['condition'], value: string) => {
    if (!selectedRule || !isRuleEditing) return

    const updatedRules = rules.map(rule => {
      if (rule.id === selectedRule.id) {
        return {
          ...rule,
          condition: {
            ...rule.condition,
            [field]: field === 'operator' ? value as OperatorType : value
          }
        }
      }
      return rule
    })
    setRules(updatedRules)
  }

  const handleActionChange = (field: keyof RoutingRule['action'] | keyof RoutingRule['action']['parameters'], value: string) => {
    if (!selectedRule || !isRuleEditing) return

    const updatedRules = rules.map(rule => {
      if (rule.id === selectedRule.id) {
        if (field === 'type') {
          return {
            ...rule,
            action: {
              type: value as ActionType,
              parameters: { targetStage: '' }
            }
          }
        } else {
          return {
            ...rule,
            action: {
              ...rule.action,
              parameters: { ...rule.action.parameters, [field]: value }
            }
          }
        }
      }
      return rule
    })
    setRules(updatedRules)
  }

  const handleSaveRule = () => {
    onSave(rules)
    setIsRuleEditing(false)
  }

  const handleCancelRule = () => {
    const updatedRules = rules.map(rule => {
      if (rule.id === selectedRuleId) {
        const initialRule = initialRules.find(r => r.id === selectedRuleId)
        return initialRule || rule
      }
      return rule
    })
    setRules(updatedRules)
    setIsRuleEditing(false)
  }

  const handleAddRule = () => {
    const newRule: RoutingRule = {
      id: Math.max(0, ...rules.map(r => r.id)) + 1,
      name: "",
      description: "",
      triggerStage: stages[0] || "",
      condition: { field: '', operator: 'eq', value: '' },
      action: { type: 'NEXT_STAGE', parameters: { targetStage: '' } }
    }
    const updatedRules = [...rules, newRule]
    setRules(updatedRules)
    setSelectedRuleId(newRule.id)
    setIsRuleEditing(true)
  }

  const handleDeleteRule = () => {
    if (!selectedRule) return
    const updatedRules = rules.filter(rule => rule.id !== selectedRule.id)
    setRules(updatedRules)
    setSelectedRuleId(null)
    onSave(updatedRules)
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Routing Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {rules.map((rule) => (
              <li
                key={rule.id}
                className={`p-2 rounded-md cursor-pointer ${
                  selectedRuleId === rule.id 
                    ? 'bg-secondary' 
                    : 'hover:bg-secondary/50'
                }`}
                onClick={() => handleRuleSelect(rule.id)}
              >
                {rule.name || 'Unnamed Rule'}
              </li>
            ))}
          </ul>
          {parentIsEditing && (
            <Button className="w-full mt-4" onClick={handleAddRule}>
              <Plus className="mr-2 h-4 w-4" /> Add Rule
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Rule Details</CardTitle>
          {selectedRule && parentIsEditing && !isRuleEditing && (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleDeleteRule}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Rule
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsRuleEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Rule
              </Button>
            </div>
          )}
          {selectedRule && isRuleEditing && (
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={handleCancelRule}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveRule}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {selectedRule ? (
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <Label htmlFor="name">Rule Name</Label>
                <Input 
                  id="name" 
                  value={selectedRule.name} 
                  onChange={handleInputChange}
                  placeholder="Enter rule name"
                  disabled={!isRuleEditing}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={selectedRule.description} 
                  onChange={handleInputChange}
                  placeholder="Enter rule description"
                  disabled={!isRuleEditing}
                />
              </div>
              <div>
                <Label htmlFor="triggerStage">Trigger Stage</Label>
                <Select 
                  value={selectedRule.triggerStage} 
                  onValueChange={(value) => handleInputChange({ target: { id: 'triggerStage', value } } as any)}
                  disabled={!isRuleEditing}
                >
                  <SelectTrigger id="triggerStage">
                    <SelectValue placeholder="Select trigger stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Condition</Label>
                <div className="flex flex-col space-y-2 mt-2">
                  <Select 
                    value={selectedRule.condition.field} 
                    onValueChange={(value) => handleConditionChange('field', value)}
                    disabled={!isRuleEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amount">Amount</SelectItem>
                      <SelectItem value="department">Department</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select 
                    value={selectedRule.condition.operator} 
                    onValueChange={(value) => handleConditionChange('operator', value)}
                    disabled={!isRuleEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eq">Equals</SelectItem>
                      <SelectItem value="gt">Greater than</SelectItem>
                      <SelectItem value="lt">Less than</SelectItem>
                      <SelectItem value="gte">Greater than or equal</SelectItem>
                      <SelectItem value="lte">Less than or equal</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    placeholder="Enter value"
                    value={selectedRule.condition.value}
                    onChange={(e) => handleConditionChange('value', e.target.value)}
                    disabled={!isRuleEditing}
                  />
                </div>
              </div>
              <div>
                <Label>Action</Label>
                <div className="space-y-2 mt-2">
                  <Select 
                    value={selectedRule.action.type} 
                    onValueChange={(value) => handleActionChange('type', value)}
                    disabled={!isRuleEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select action type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SKIP_STAGE">Skip Stage</SelectItem>
                      <SelectItem value="NEXT_STAGE">Next Stage</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select 
                    value={selectedRule.action.parameters.targetStage} 
                    onValueChange={(value) => handleActionChange('targetStage', value)}
                    disabled={!isRuleEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </form>
          ) : (
            <p className="text-muted-foreground">Select a rule to view or edit details</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

