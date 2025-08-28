'use client';

import React, { useState, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Eye, 
  Plus, 
  Edit, 
  Trash, 
  CheckCircle, 
  Settings, 
  Download,
  Upload,
  Share,
  Lock,
  Unlock,
  FileText,
  Search
} from 'lucide-react';

import { ResourceType, getResourceActions } from '@/lib/types/permission-resources';
import { Operator } from '@/lib/types/permissions';

// Form schema for Step 3
const step3Schema = z.object({
  actions: z.array(z.string()).min(1, 'At least one action must be selected'),
  actionConditions: z.array(z.object({
    action: z.string(),
    attribute: z.string(),
    operator: z.nativeEnum(Operator),
    value: z.any()
  })).optional()
});

type Step3FormData = z.infer<typeof step3Schema>;

interface PolicyBuilderStep3Props {
  onNext: (data: Step3FormData) => void;
  onPrevious: () => void;
  onCancel: () => void;
  initialData?: Partial<Step3FormData>;
  selectedResourceTypes: ResourceType[];
}

interface ActionCondition {
  id: string;
  action: string;
  attribute: string;
  operator: Operator;
  value: any;
}

// Action grouping for better UX
const actionGroups = [
  {
    name: 'Read Operations',
    description: 'View and access operations',
    icon: Eye,
    actions: ['view', 'view_stock', 'view_costs', 'view_vendor', 'view_recipe', 'view_details', 'search']
  },
  {
    name: 'Write Operations', 
    description: 'Create, update, and modify operations',
    icon: Edit,
    actions: ['create', 'create_draft', 'update', 'modify', 'edit', 'create_vendor', 'create_recipe', 'add_items']
  },
  {
    name: 'Workflow Operations',
    description: 'Approval, submission, and process operations',
    icon: CheckCircle,
    actions: ['submit', 'approve', 'reject', 'submit_for_approval', 'approve_department', 'approve_finance', 'approve_gm', 'activate', 'deactivate']
  },
  {
    name: 'Special Operations',
    description: 'Advanced and specialized operations', 
    icon: Settings,
    actions: ['delete', 'export', 'import', 'transfer', 'convert', 'calculate', 'generate', 'send', 'print', 'archive']
  }
];

export function PolicyBuilderStep3({ onNext, onPrevious, onCancel, initialData, selectedResourceTypes }: PolicyBuilderStep3Props) {
  const [actionConditions, setActionConditions] = useState<ActionCondition[]>([]);
  const [newCondition, setNewCondition] = useState({
    action: '',
    attribute: '',
    operator: Operator.EQUALS,
    value: ''
  });

  const form = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      actions: initialData?.actions || [],
      actionConditions: initialData?.actionConditions || []
    }
  });

  const watchedActions = form.watch('actions');

  // Get all available actions from selected resource types
  const availableActions = useMemo(() => {
    const allActions = new Set<string>();
    selectedResourceTypes.forEach(resourceType => {
      const actions = getResourceActions(resourceType);
      actions.forEach(action => allActions.add(action));
    });
    return Array.from(allActions);
  }, [selectedResourceTypes]);

  // Group actions by category
  const groupedActions = useMemo(() => {
    return actionGroups.map(group => ({
      ...group,
      availableActions: group.actions.filter(action => availableActions.includes(action))
    })).filter(group => group.availableActions.length > 0);
  }, [availableActions]);

  // Get actions that don't fit into predefined groups
  const ungroupedActions = useMemo(() => {
    const groupedActionsList = actionGroups.flatMap(group => group.actions);
    return availableActions.filter(action => !groupedActionsList.includes(action));
  }, [availableActions]);

  // Handle action selection
  const handleActionToggle = (action: string) => {
    const current = watchedActions;
    const updated = current.includes(action)
      ? current.filter(a => a !== action)
      : [...current, action];
    form.setValue('actions', updated);
  };

  // Handle select all in group
  const handleSelectAllInGroup = (groupActions: string[]) => {
    const current = watchedActions;
    const allSelected = groupActions.every(action => current.includes(action));
    
    if (allSelected) {
      // Deselect all in group
      const updated = current.filter(a => !groupActions.includes(a));
      form.setValue('actions', updated);
    } else {
      // Select all in group
      const updated = [...new Set([...current, ...groupActions])];
      form.setValue('actions', updated);
    }
  };

  // Add action condition
  const addActionCondition = () => {
    if (newCondition.action && newCondition.attribute && newCondition.value) {
      const condition: ActionCondition = {
        id: `cond-${Date.now()}`,
        action: newCondition.action,
        attribute: newCondition.attribute,
        operator: newCondition.operator,
        value: newCondition.value
      };
      setActionConditions([...actionConditions, condition]);
      setNewCondition({ action: '', attribute: '', operator: Operator.EQUALS, value: '' });
    }
  };

  // Remove action condition
  const removeActionCondition = (conditionId: string) => {
    setActionConditions(actionConditions.filter(c => c.id !== conditionId));
  };

  // Get action display name
  const getActionDisplayName = (action: string): string => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Get action icon
  const getActionIcon = (action: string) => {
    if (action.includes('view') || action.includes('search')) return Eye;
    if (action.includes('create') || action.includes('add')) return Plus;
    if (action.includes('update') || action.includes('edit') || action.includes('modify')) return Edit;
    if (action.includes('delete') || action.includes('remove')) return Trash;
    if (action.includes('approve') || action.includes('submit')) return CheckCircle;
    if (action.includes('export')) return Download;
    if (action.includes('import')) return Upload;
    if (action.includes('share') || action.includes('send')) return Share;
    if (action.includes('lock') || action.includes('restrict')) return Lock;
    if (action.includes('unlock') || action.includes('activate')) return Unlock;
    return FileText;
  };

  const handleNext = (data: Step3FormData) => {
    const finalData = {
      ...data,
      actionConditions: actionConditions.map(c => ({
        action: c.action,
        attribute: c.attribute,
        operator: c.operator,
        value: c.value
      }))
    };
    onNext(finalData);
  };

  // Available attributes for action conditions
  const conditionAttributes = [
    'resource.totalValue.amount',
    'resource.priority',
    'resource.documentStatus.status',
    'resource.ownerDepartment',
    'resource.location',
    'environment.isBusinessHours',
    'environment.currentTime',
    'subject.approvalLimit.amount'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Step 3: Action Assignment</h2>
        <p className="text-muted-foreground">
          Select the specific actions that subjects can perform on the selected resources.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleNext)} className="space-y-6">
          {/* Selected Resources Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Selected Resources</CardTitle>
              <CardDescription>
                These are the resource types selected in the previous step
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedResourceTypes.slice(0, 8).map((resourceType) => (
                  <Badge key={resourceType} variant="secondary">
                    {resourceType.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </Badge>
                ))}
                {selectedResourceTypes.length > 8 && (
                  <Badge variant="secondary">
                    +{selectedResourceTypes.length - 8} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Selection by Groups */}
          <Card>
            <CardHeader>
              <CardTitle>Available Actions</CardTitle>
              <CardDescription>
                Select the actions that should be permitted by this policy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {groupedActions.map((group) => {
                const Icon = group.icon;
                const groupActions = group.availableActions;
                const allSelected = groupActions.every(action => watchedActions.includes(action));
                const someSelected = groupActions.some(action => watchedActions.includes(action));

                return (
                  <div key={group.name} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{group.name}</h4>
                          <p className="text-sm text-muted-foreground">{group.description}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectAllInGroup(groupActions)}
                      >
                        {allSelected ? 'Deselect All' : someSelected ? 'Select All' : 'Select All'}
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pl-7">
                      {groupActions.map((action) => {
                        const ActionIcon = getActionIcon(action);
                        const isSelected = watchedActions.includes(action);
                        
                        return (
                          <div key={action} className="flex items-center space-x-2">
                            <Checkbox
                              id={action}
                              checked={isSelected}
                              onCheckedChange={() => handleActionToggle(action)}
                            />
                            <label 
                              htmlFor={action}
                              className="text-sm cursor-pointer flex items-center space-x-2 flex-1"
                            >
                              <ActionIcon className="h-3 w-3" />
                              <span>{getActionDisplayName(action)}</span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                    <Separator />
                  </div>
                );
              })}

              {/* Ungrouped actions */}
              {ungroupedActions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Other Actions</h4>
                      <p className="text-sm text-muted-foreground">Additional available actions</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pl-7">
                    {ungroupedActions.map((action) => {
                      const ActionIcon = getActionIcon(action);
                      const isSelected = watchedActions.includes(action);
                      
                      return (
                        <div key={action} className="flex items-center space-x-2">
                          <Checkbox
                            id={action}
                            checked={isSelected}
                            onCheckedChange={() => handleActionToggle(action)}
                          />
                          <label 
                            htmlFor={action}
                            className="text-sm cursor-pointer flex items-center space-x-2 flex-1"
                          >
                            <ActionIcon className="h-3 w-3" />
                            <span>{getActionDisplayName(action)}</span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Actions Summary */}
          {watchedActions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Actions ({watchedActions.length})</CardTitle>
                <CardDescription>
                  Actions that will be permitted by this policy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {watchedActions.map((action) => {
                    const ActionIcon = getActionIcon(action);
                    return (
                      <Badge key={action} variant="default" className="flex items-center gap-1">
                        <ActionIcon className="h-3 w-3" />
                        {getActionDisplayName(action)}
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action-Specific Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Action Conditions (Optional)</CardTitle>
              <CardDescription>
                Add specific conditions that must be met for certain actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new condition */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="text-sm font-medium">Action</label>
                  <Select value={newCondition.action} onValueChange={(value) => 
                    setNewCondition({ ...newCondition, action: value })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      {watchedActions.map((action) => (
                        <SelectItem key={action} value={action}>
                          {getActionDisplayName(action)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Attribute</label>
                  <Select value={newCondition.attribute} onValueChange={(value) => 
                    setNewCondition({ ...newCondition, attribute: value })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select attribute" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditionAttributes.map((attr) => (
                        <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Operator</label>
                  <Select value={newCondition.operator} onValueChange={(value) => 
                    setNewCondition({ ...newCondition, operator: value as Operator })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Operator.EQUALS}>Equals</SelectItem>
                      <SelectItem value={Operator.NOT_EQUALS}>Not Equals</SelectItem>
                      <SelectItem value={Operator.GREATER_THAN}>Greater Than</SelectItem>
                      <SelectItem value={Operator.LESS_THAN}>Less Than</SelectItem>
                      <SelectItem value={Operator.LESS_THAN_OR_EQUAL}>Less Than or Equal</SelectItem>
                      <SelectItem value={Operator.IN}>In</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Value</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter value"
                      value={newCondition.value}
                      onChange={(e) => setNewCondition({ ...newCondition, value: e.target.value })}
                    />
                    <Button
                      type="button"
                      onClick={addActionCondition}
                      disabled={!newCondition.action || !newCondition.attribute || !newCondition.value}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Existing conditions */}
              {actionConditions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Action Conditions:</h4>
                  <div className="space-y-2">
                    {actionConditions.map((condition) => (
                      <Badge key={condition.id} variant="outline" className="flex items-center justify-between p-2">
                        <span className="text-sm">
                          {getActionDisplayName(condition.action)}: {condition.attribute} {condition.operator} {condition.value}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeActionCondition(condition.id)}
                          className="h-auto p-1 ml-2"
                        >
                          ×
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={onPrevious}>
              Previous: Resource Configuration
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Next: Review & Conditions
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}