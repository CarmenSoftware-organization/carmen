import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil } from 'lucide-react'
import { RoutingRule, RoutingCondition, RoutingAction } from "../types/workflow"

interface WorkflowRoutingProps {
  rules: RoutingRule[]
  stages: string[]
  onSave: (rules: RoutingRule[]) => void
}

export function WorkflowRouting({ rules: initialRules, stages, onSave }: WorkflowRoutingProps) {
  const [rules, setRules] = useState<RoutingRule[]>(initialRules)
  const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const selectedRule = rules.find(rule => rule.id === selectedRuleId)

  const handleRuleSelect = (ruleId: number) => {
    setSelectedRuleId(ruleId)
    setIsEditing(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!selectedRule) return

    const updatedRules = rules.map(rule => {
      if (rule.id === selectedRule.id) {
        return { ...rule, [e.target.id]: e.target.value }
      }
      return rule
    })
    setRules(updatedRules)
  }

  const handleConditionChange = (field: keyof RoutingCondition, value: string) => {
    if (!selectedRule) return

    const updatedRules = rules.map(rule => {
      if (rule.id === selectedRule.id) {
        return {
          ...rule,
          condition: { ...rule.condition, [field]: value }
        }
      }
      return rule
    })
    setRules(updatedRules)
  }

  const handleActionChange = (field: keyof RoutingAction | keyof RoutingAction['parameters'], value: string) => {
    if (!selectedRule) return

    const updatedRules = rules.map(rule => {
      if (rule.id === selectedRule.id) {
        if (field === 'type') {
          return {
            ...rule,
            action: {
              type: value as RoutingAction['type'],
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
    setSelectedRuleId(null)
    setIsEditing(false)
  }

  const handleAddRule = () => {
    const newRule: RoutingRule = {
      id: Math.max(0, ...rules.map(r => r.id)) + 1,
      name: "",
      description: "",
      triggerStage: "",
      condition: { field: '', operator: 'eq', value: '' },
      action: { type: 'NEXT_STAGE', parameters: { targetStage: '' } }
    }
    const updatedRules = [...rules, newRule]
    setRules(updatedRules)
    setSelectedRuleId(newRule.id)
    setIsEditing(true)
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
                className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                  selectedRuleId === rule.id 
                    ? 'bg-secondary' 
                    : 'hover:bg-secondary/50'
                }`}
                onClick={() => handleRuleSelect(rule.id)}
              >
                <span className="flex-1">{rule.name || 'Unnamed Rule'}</span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRuleSelect(rule.id)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
          <Button className="w-full mt-4" onClick={handleAddRule}>
            <Plus className="mr-2 h-4 w-4" /> Add Rule
          </Button>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Rule" : "Add New Rule"}</CardTitle>
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
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={selectedRule.description} 
                  onChange={handleInputChange}
                  placeholder="Enter rule description" 
                />
              </div>
              <div>
                <Label htmlFor="triggerStage">Trigger Stage</Label>
                <Select 
                  value={selectedRule.triggerStage} 
                  onValueChange={(value) => handleInputChange({ target: { id: 'triggerStage', value } } as any)}
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
                    onValueChange={(value) => handleConditionChange('operator', value as RoutingCondition['operator'])}
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
                  />
                </div>
              </div>
              <div>
                <Label>Action</Label>
                <div className="space-y-2 mt-2 p-2 border rounded">
                  <Select 
                    value={selectedRule.action.type} 
                    onValueChange={(value) => handleActionChange('type', value)}
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
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedRuleId(null)}>Cancel</Button>
                <Button onClick={handleSaveRule}>
                  {isEditing ? "Update Rule" : "Add Rule"}
                </Button>
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

