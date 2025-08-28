'use client';

import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Copy, 
  Play, 
  Eye, 
  EyeOff,
  Settings,
  Shield,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  Code,
  FileText,
  Calendar,
  Target,
  GitBranch,
  RotateCcw,
  Zap
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Policy, EffectType, Rule, Expression, AttributeCondition, Obligation, Advice, Operator, LogicalOperator } from '@/lib/types/permissions';
import { ResourceType } from '@/lib/types/permission-resources';

interface PolicyEditProps {
  policy: Policy;
  onSave?: (policy: Policy, saveAsNew?: boolean) => void;
  onCancel?: () => void;
  onTest?: (policy: Policy) => void;
  className?: string;
}

// Rule templates for quick creation
const ruleTemplates = [
  {
    id: 'department-access',
    name: 'Department Access Control',
    description: 'User can only access resources from their department',
    template: {
      description: 'Same department access',
      condition: {
        type: 'simple' as const,
        attribute: 'subject.department.id',
        operator: Operator.EQUALS,
        value: 'resource.ownerDepartment'
      }
    }
  },
  {
    id: 'approval-limit',
    name: 'Approval Limit Check',
    description: 'Check if user approval limit covers resource value',
    template: {
      description: 'Approval authority check',
      condition: {
        type: 'simple' as const,
        attribute: 'subject.approvalLimit.amount',
        operator: Operator.GREATER_THAN_OR_EQUAL,
        value: 'resource.totalValue.amount'
      }
    }
  },
  {
    id: 'business-hours',
    name: 'Business Hours Restriction',
    description: 'Allow action only during business hours',
    template: {
      description: 'Business hours validation',
      condition: {
        type: 'simple' as const,
        attribute: 'environment.isBusinessHours',
        operator: Operator.EQUALS,
        value: true
      }
    }
  },
  {
    id: 'location-based',
    name: 'Location-Based Access',
    description: 'User can access resources in their assigned locations',
    template: {
      description: 'Location access restriction',
      condition: {
        type: 'simple' as const,
        attribute: 'resource.location',
        operator: Operator.IN,
        value: 'subject.locations'
      }
    }
  }
];

// Available attributes for condition building
const subjectAttributes = [
  'subject.userId',
  'subject.role.id',
  'subject.department.id',
  'subject.location.id',
  'subject.employeeType',
  'subject.seniority',
  'subject.clearanceLevel',
  'subject.approvalLimit.amount',
  'subject.onDuty'
];

const resourceAttributes = [
  'resource.resourceType',
  'resource.owner',
  'resource.ownerDepartment',
  'resource.dataClassification',
  'resource.documentStatus.status',
  'resource.totalValue.amount',
  'resource.priority',
  'resource.location'
];

const environmentAttributes = [
  'environment.isBusinessHours',
  'environment.isHoliday',
  'environment.requestIP',
  'environment.deviceType',
  'environment.sessionAge',
  'environment.systemLoad',
  'environment.maintenanceMode'
];

export function PolicyEdit({ policy, onSave, onCancel, onTest, className }: PolicyEditProps) {
  const [editedPolicy, setEditedPolicy] = useState<Policy>({ ...policy });
  const [activeTab, setActiveTab] = useState('general');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Track changes to enable/disable save button
  useEffect(() => {
    const hasChanges = JSON.stringify(policy) !== JSON.stringify(editedPolicy);
    setHasUnsavedChanges(hasChanges);
  }, [policy, editedPolicy]);

  // Validation function
  const validatePolicy = (): string[] => {
    const errors: string[] = [];
    
    if (!editedPolicy.name.trim()) {
      errors.push('Policy name is required');
    }
    
    if (!editedPolicy.description.trim()) {
      errors.push('Policy description is required');
    }
    
    if (editedPolicy.priority < 1 || editedPolicy.priority > 1000) {
      errors.push('Priority must be between 1 and 1000');
    }
    
    if (editedPolicy.rules.length === 0) {
      errors.push('At least one rule is required');
    }
    
    // Validate rules
    editedPolicy.rules.forEach((rule, index) => {
      if (!rule.description.trim()) {
        errors.push(`Rule ${index + 1}: Description is required`);
      }
      
      if (rule.condition.type === 'simple') {
        if (!rule.condition.attribute || !rule.condition.operator) {
          errors.push(`Rule ${index + 1}: Attribute and operator are required`);
        }
      } else if (rule.condition.type === 'composite') {
        if (!rule.condition.expressions || rule.condition.expressions.length === 0) {
          errors.push(`Rule ${index + 1}: At least one expression is required for composite rules`);
        }
      }
    });
    
    return errors;
  };

  const handleSave = (saveAsNew = false) => {
    setIsValidating(true);
    const errors = validatePolicy();
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      const policyToSave = {
        ...editedPolicy,
        version: saveAsNew ? `${editedPolicy.version}.1` : editedPolicy.version,
        updatedBy: 'current-user', // Would come from auth context
        updatedAt: new Date()
      };
      
      onSave?.(policyToSave, saveAsNew);
      setHasUnsavedChanges(false);
    }
    
    setIsValidating(false);
    setShowSaveDialog(false);
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
    } else {
      onCancel?.();
    }
  };

  const handleTest = () => {
    onTest?.(editedPolicy);
  };

  const updatePolicy = (updates: Partial<Policy>) => {
    setEditedPolicy(prev => ({ ...prev, ...updates }));
  };

  const addRule = (template?: typeof ruleTemplates[0]) => {
    const newRule: Rule = template ? {
      id: `rule-${Date.now()}`,
      ...template.template
    } : {
      id: `rule-${Date.now()}`,
      description: 'New rule',
      condition: {
        type: 'simple',
        attribute: '',
        operator: Operator.EQUALS,
        value: ''
      }
    };
    
    updatePolicy({
      rules: [...editedPolicy.rules, newRule]
    });
  };

  const updateRule = (ruleIndex: number, updates: Partial<Rule>) => {
    const updatedRules = [...editedPolicy.rules];
    updatedRules[ruleIndex] = { ...updatedRules[ruleIndex], ...updates };
    updatePolicy({ rules: updatedRules });
  };

  const removeRule = (ruleIndex: number) => {
    const updatedRules = editedPolicy.rules.filter((_, index) => index !== ruleIndex);
    updatePolicy({ rules: updatedRules });
  };

  const addTargetCondition = (type: 'subjects' | 'resources' | 'environment') => {
    const newCondition: AttributeCondition = {
      attribute: '',
      operator: Operator.EQUALS,
      value: ''
    };
    
    const currentConditions = editedPolicy.target[type] || [];
    updatePolicy({
      target: {
        ...editedPolicy.target,
        [type]: [...currentConditions, newCondition]
      }
    });
  };

  const updateTargetCondition = (
    type: 'subjects' | 'resources' | 'environment',
    index: number,
    updates: Partial<AttributeCondition>
  ) => {
    const conditions = [...(editedPolicy.target[type] || [])];
    conditions[index] = { ...conditions[index], ...updates };
    
    updatePolicy({
      target: {
        ...editedPolicy.target,
        [type]: conditions
      }
    });
  };

  const removeTargetCondition = (type: 'subjects' | 'resources' | 'environment', index: number) => {
    const conditions = (editedPolicy.target[type] || []).filter((_, i) => i !== index);
    updatePolicy({
      target: {
        ...editedPolicy.target,
        [type]: conditions
      }
    });
  };

  const addAction = () => {
    const currentActions = editedPolicy.target.actions || [];
    updatePolicy({
      target: {
        ...editedPolicy.target,
        actions: [...currentActions, '']
      }
    });
  };

  const updateAction = (index: number, value: string) => {
    const actions = [...(editedPolicy.target.actions || [])];
    actions[index] = value;
    updatePolicy({
      target: {
        ...editedPolicy.target,
        actions
      }
    });
  };

  const removeAction = (index: number) => {
    const actions = (editedPolicy.target.actions || []).filter((_, i) => i !== index);
    updatePolicy({
      target: {
        ...editedPolicy.target,
        actions
      }
    });
  };

  const renderRuleEditor = (rule: Rule, ruleIndex: number) => (
    <Card key={rule.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <Label htmlFor={`rule-desc-${ruleIndex}`}>Rule Description</Label>
            <Input
              id={`rule-desc-${ruleIndex}`}
              value={rule.description}
              onChange={(e) => updateRule(ruleIndex, { description: e.target.value })}
              placeholder="Describe what this rule validates..."
              className="mt-1"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => removeRule(ruleIndex)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Condition Type</Label>
            <Select
              value={rule.condition.type}
              onValueChange={(value: 'simple' | 'composite') =>
                updateRule(ruleIndex, {
                  condition: {
                    type: value,
                    ...(value === 'simple' ? {
                      attribute: '',
                      operator: Operator.EQUALS,
                      value: ''
                    } : {
                      expressions: [],
                      logicalOperator: LogicalOperator.AND
                    })
                  }
                })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple Condition</SelectItem>
                <SelectItem value="composite">Composite Condition</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {rule.condition.type === 'simple' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Attribute</Label>
                <Select
                  value={rule.condition.attribute || ''}
                  onValueChange={(value) =>
                    updateRule(ruleIndex, {
                      condition: { ...rule.condition, attribute: value }
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select attribute..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="" disabled>Subject Attributes</SelectItem>
                    {subjectAttributes.map(attr => (
                      <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                    ))}
                    <Separator className="my-1" />
                    <SelectItem value="" disabled>Resource Attributes</SelectItem>
                    {resourceAttributes.map(attr => (
                      <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                    ))}
                    <Separator className="my-1" />
                    <SelectItem value="" disabled>Environment Attributes</SelectItem>
                    {environmentAttributes.map(attr => (
                      <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Operator</Label>
                <Select
                  value={rule.condition.operator || ''}
                  onValueChange={(value: Operator) =>
                    updateRule(ruleIndex, {
                      condition: { ...rule.condition, operator: value }
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select operator..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Operator).map(op => (
                      <SelectItem key={op} value={op}>{op}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Value</Label>
                <Input
                  value={rule.condition.value || ''}
                  onChange={(e) =>
                    updateRule(ruleIndex, {
                      condition: { ...rule.condition, value: e.target.value }
                    })
                  }
                  placeholder="Enter value..."
                  className="mt-1"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Logical Operator</Label>
                <Select
                  value={rule.condition.logicalOperator || LogicalOperator.AND}
                  onValueChange={(value: LogicalOperator) =>
                    updateRule(ruleIndex, {
                      condition: { ...rule.condition, logicalOperator: value }
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(LogicalOperator).map(op => (
                      <SelectItem key={op} value={op}>{op}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Expressions</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const expressions = rule.condition.expressions || [];
                      updateRule(ruleIndex, {
                        condition: {
                          ...rule.condition,
                          expressions: [...expressions, {
                            type: 'simple',
                            attribute: '',
                            operator: Operator.EQUALS,
                            value: ''
                          }]
                        }
                      });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Expression
                  </Button>
                </div>
                
                {rule.condition.expressions?.map((expr, exprIndex) => (
                  <div key={exprIndex} className="flex items-center space-x-2 mb-2 p-3 border rounded">
                    <Select
                      value={expr.attribute || ''}
                      onValueChange={(value) => {
                        const expressions = [...(rule.condition.expressions || [])];
                        expressions[exprIndex] = { ...expressions[exprIndex], attribute: value };
                        updateRule(ruleIndex, {
                          condition: { ...rule.condition, expressions }
                        });
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Attribute..." />
                      </SelectTrigger>
                      <SelectContent>
                        {[...subjectAttributes, ...resourceAttributes, ...environmentAttributes].map(attr => (
                          <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={expr.operator || ''}
                      onValueChange={(value: Operator) => {
                        const expressions = [...(rule.condition.expressions || [])];
                        expressions[exprIndex] = { ...expressions[exprIndex], operator: value };
                        updateRule(ruleIndex, {
                          condition: { ...rule.condition, expressions }
                        });
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Op..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(Operator).map(op => (
                          <SelectItem key={op} value={op}>{op}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input
                      value={expr.value || ''}
                      onChange={(e) => {
                        const expressions = [...(rule.condition.expressions || [])];
                        expressions[exprIndex] = { ...expressions[exprIndex], value: e.target.value };
                        updateRule(ruleIndex, {
                          condition: { ...rule.condition, expressions }
                        });
                      }}
                      placeholder="Value..."
                      className="flex-1"
                    />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const expressions = (rule.condition.expressions || []).filter((_, i) => i !== exprIndex);
                        updateRule(ruleIndex, {
                          condition: { ...rule.condition, expressions }
                        });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">
              {policy.id ? 'Edit Policy' : 'Create Policy'}
            </h1>
            <p className="text-muted-foreground">
              Configure policy rules and behavior for access control
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {validationErrors.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="destructive" className="cursor-help">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {validationErrors.length} errors
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <div className="space-y-1">
                    {validationErrors.map((error, idx) => (
                      <div key={idx} className="text-xs">{error}</div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            )}

            <Button variant="outline" onClick={handleTest} disabled={validationErrors.length > 0}>
              <Play className="w-4 h-4 mr-2" />
              Test Policy
            </Button>

            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>

            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button disabled={!hasUnsavedChanges || isValidating}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Policy
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Policy</DialogTitle>
                  <DialogDescription>
                    Choose how to save your policy changes
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Button
                    onClick={() => handleSave(false)}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Update Current Version
                    <span className="text-xs text-muted-foreground ml-auto">v{editedPolicy.version}</span>
                  </Button>
                  <Button
                    onClick={() => handleSave(true)}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <GitBranch className="w-4 h-4 mr-2" />
                    Save as New Version
                    <span className="text-xs text-muted-foreground ml-auto">v{editedPolicy.version}.1</span>
                  </Button>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                    Cancel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Main Edit Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="target">Target</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="obligations">Obligations</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Policy Information</CardTitle>
                <CardDescription>
                  Basic policy details and configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="policy-name">Policy Name *</Label>
                      <Input
                        id="policy-name"
                        value={editedPolicy.name}
                        onChange={(e) => updatePolicy({ name: e.target.value })}
                        placeholder="Enter policy name..."
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="policy-category">Category</Label>
                      <Select
                        value={editedPolicy.category || ''}
                        onValueChange={(value) => updatePolicy({ category: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select category..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="procurement">Procurement</SelectItem>
                          <SelectItem value="inventory">Inventory</SelectItem>
                          <SelectItem value="vendor">Vendor Management</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="access-control">Access Control</SelectItem>
                          <SelectItem value="workflow">Workflow</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="policy-priority">Priority *</Label>
                      <Input
                        id="policy-priority"
                        type="number"
                        min="1"
                        max="1000"
                        value={editedPolicy.priority}
                        onChange={(e) => updatePolicy({ priority: parseInt(e.target.value) || 1 })}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Higher numbers = higher priority (1-1000)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="policy-effect">Effect *</Label>
                      <Select
                        value={editedPolicy.effect}
                        onValueChange={(value: EffectType) => updatePolicy({ effect: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={EffectType.PERMIT}>
                            <div className="flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                              Permit
                            </div>
                          </SelectItem>
                          <SelectItem value={EffectType.DENY}>
                            <div className="flex items-center">
                              <X className="w-4 h-4 mr-2 text-red-600" />
                              Deny
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="policy-enabled"
                        checked={editedPolicy.enabled}
                        onCheckedChange={(checked) => updatePolicy({ enabled: checked })}
                      />
                      <Label htmlFor="policy-enabled" className="flex items-center space-x-2">
                        {editedPolicy.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        <span>{editedPolicy.enabled ? 'Enabled' : 'Disabled'}</span>
                      </Label>
                    </div>

                    <div>
                      <Label htmlFor="policy-version">Version</Label>
                      <Input
                        id="policy-version"
                        value={editedPolicy.version}
                        onChange={(e) => updatePolicy({ version: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="policy-description">Description *</Label>
                  <Textarea
                    id="policy-description"
                    value={editedPolicy.description}
                    onChange={(e) => updatePolicy({ description: e.target.value })}
                    placeholder="Describe what this policy does..."
                    className="mt-1 min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="policy-tags">Tags</Label>
                  <Input
                    id="policy-tags"
                    value={editedPolicy.tags?.join(', ') || ''}
                    onChange={(e) => updatePolicy({ 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                    })}
                    placeholder="Enter tags separated by commas..."
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="target" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Policy Target</CardTitle>
                <CardDescription>
                  Define when this policy applies based on subject, resource, action, and environment conditions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Subject Conditions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Subject Conditions</span>
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addTargetCondition('subjects')}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Condition
                    </Button>
                  </div>
                  
                  {(editedPolicy.target.subjects || []).map((condition, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2 p-3 border rounded bg-blue-50">
                      <Select
                        value={condition.attribute}
                        onValueChange={(value) => updateTargetCondition('subjects', index, { attribute: value })}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select attribute..." />
                        </SelectTrigger>
                        <SelectContent>
                          {subjectAttributes.map(attr => (
                            <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={condition.operator}
                        onValueChange={(value: Operator) => updateTargetCondition('subjects', index, { operator: value })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(Operator).map(op => (
                            <SelectItem key={op} value={op}>{op}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Input
                        value={condition.value || ''}
                        onChange={(e) => updateTargetCondition('subjects', index, { value: e.target.value })}
                        placeholder="Value..."
                        className="flex-1"
                      />
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeTargetCondition('subjects', index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Resource Conditions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Resource Conditions</span>
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addTargetCondition('resources')}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Condition
                    </Button>
                  </div>
                  
                  {(editedPolicy.target.resources || []).map((condition, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2 p-3 border rounded bg-green-50">
                      <Select
                        value={condition.attribute}
                        onValueChange={(value) => updateTargetCondition('resources', index, { attribute: value })}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select attribute..." />
                        </SelectTrigger>
                        <SelectContent>
                          {resourceAttributes.map(attr => (
                            <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={condition.operator}
                        onValueChange={(value: Operator) => updateTargetCondition('resources', index, { operator: value })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(Operator).map(op => (
                            <SelectItem key={op} value={op}>{op}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Input
                        value={condition.value || ''}
                        onChange={(e) => updateTargetCondition('resources', index, { value: e.target.value })}
                        placeholder="Value..."
                        className="flex-1"
                      />
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeTargetCondition('resources', index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center space-x-2">
                      <Activity className="w-4 h-4" />
                      <span>Allowed Actions</span>
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addAction}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Action
                    </Button>
                  </div>
                  
                  {(editedPolicy.target.actions || []).map((action, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <Input
                        value={action}
                        onChange={(e) => updateAction(index, e.target.value)}
                        placeholder="Action name (e.g., create, update, approve)..."
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeAction(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Environment Conditions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Environment Conditions</span>
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addTargetCondition('environment')}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Condition
                    </Button>
                  </div>
                  
                  {(editedPolicy.target.environment || []).map((condition, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2 p-3 border rounded bg-purple-50">
                      <Select
                        value={condition.attribute}
                        onValueChange={(value) => updateTargetCondition('environment', index, { attribute: value })}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select attribute..." />
                        </SelectTrigger>
                        <SelectContent>
                          {environmentAttributes.map(attr => (
                            <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={condition.operator}
                        onValueChange={(value: Operator) => updateTargetCondition('environment', index, { operator: value })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(Operator).map(op => (
                            <SelectItem key={op} value={op}>{op}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Input
                        value={condition.value || ''}
                        onChange={(e) => updateTargetCondition('environment', index, { value: e.target.value })}
                        placeholder="Value..."
                        className="flex-1"
                      />
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeTargetCondition('environment', index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Code className="w-5 h-5" />
                      <span>Policy Rules ({editedPolicy.rules.length})</span>
                    </CardTitle>
                    <CardDescription>
                      Define the logical conditions that must be met for this policy to apply
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Lightbulb className="w-4 h-4 mr-1" />
                          Templates
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Rule Templates</DialogTitle>
                          <DialogDescription>
                            Choose from pre-built rule templates to get started quickly
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                          {ruleTemplates.map((template) => (
                            <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => addRule(template)}>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">{template.name}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-xs text-muted-foreground">{template.description}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button onClick={() => addRule()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editedPolicy.rules.length > 0 ? (
                  <div className="space-y-4">
                    {editedPolicy.rules.map((rule, index) => renderRuleEditor(rule, index))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No rules defined yet</p>
                    <p className="text-sm">Add rules to define when this policy should apply</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="obligations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Obligations</span>
                  </CardTitle>
                  <CardDescription>
                    Actions that must be performed when this policy is triggered
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Would implement obligation editing here */}
                    <p className="text-sm text-muted-foreground">
                      Obligation editing interface would go here
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Info className="w-5 h-5" />
                    <span>Advice</span>
                  </CardTitle>
                  <CardDescription>
                    Recommendations provided when this policy is evaluated
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Would implement advice editing here */}
                    <p className="text-sm text-muted-foreground">
                      Advice editing interface would go here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Unsaved Changes Dialog */}
        <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes that will be lost if you continue. Are you sure you want to cancel?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Stay and Save</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowUnsavedDialog(false);
                  onCancel?.();
                }}
                className="bg-destructive text-destructive-foreground"
              >
                Discard Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}