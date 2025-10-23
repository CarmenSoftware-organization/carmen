'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Save,
  X,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Pause,
  Settings,
  Eye,
  EyeOff,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Copy,
  Link,
  MousePointer,
  Move,
  Grid,
  Layout,
  TestTube,
  BarChart3,
  RefreshCw,
  Minimize2,
  Maximize2,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { 
  VisualPolicyEditorProps,
  PolicyBuilderState,
  PolicyEditorNode,
  PolicyEditorState,
  PolicyBuilderStep 
} from '@/lib/types/policy-builder';
import { EffectType, LogicalOperator } from '@/lib/types/permissions';
import { AttributeInspector } from './attribute-inspector';
import { RuleConditionBuilder } from './rule-condition-builder';
import { allAttributes } from '@/lib/mock-data/policy-builder-attributes';

const initialPolicyState: PolicyBuilderState = {
  name: '',
  description: '',
  priority: 500,
  enabled: false,
  effect: EffectType.PERMIT,
  logicalOperator: LogicalOperator.AND,
  subjectConditions: [],
  resourceConditions: [],
  actionConditions: [],
  environmentConditions: [],
  rules: [],
  testScenarios: [],
  version: '1.0'
};

export function VisualPolicyEditor({
  initialPolicy,
  onSave,
  onCancel,
  onChange,
  readonly = false
}: VisualPolicyEditorProps) {
  const [policy, setPolicy] = useState<PolicyBuilderState>({
    ...initialPolicyState,
    ...initialPolicy
  });
  const [currentStep, setCurrentStep] = useState<PolicyBuilderStep>('basic');
  const [showPreview, setShowPreview] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>({
    isValid: false,
    errors: [],
    warnings: []
  });

  const [editorState, setEditorState] = useState<PolicyEditorState>({
    nodes: [],
    connections: [],
    zoom: 1,
    pan: { x: 0, y: 0 }
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  // Policy validation
  const validatePolicy = useCallback(() => {
    setIsValidating(true);
    
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!policy.name.trim()) errors.push('Policy name is required');
    if (!policy.description.trim()) errors.push('Policy description is required');
    if (policy.priority < 0 || policy.priority > 1000) errors.push('Priority must be between 0 and 1000');

    // Condition validation
    const hasAnyConditions = 
      policy.subjectConditions.length > 0 ||
      policy.resourceConditions.length > 0 ||
      policy.actionConditions.length > 0 ||
      policy.environmentConditions.length > 0 ||
      policy.rules.length > 0;

    if (!hasAnyConditions) {
      errors.push('At least one condition must be defined');
    }

    // Action validation
    if (policy.actionConditions.length === 0) {
      warnings.push('No actions specified - policy may be too broad');
    }

    // Performance warnings
    if (policy.subjectConditions.length + policy.resourceConditions.length > 10) {
      warnings.push('Large number of conditions may impact performance');
    }

    const results = {
      isValid: errors.length === 0,
      errors,
      warnings
    };

    setValidationResults(results);
    setIsValidating(false);
    
    return results;
  }, [policy]);

  // Handle policy updates
  const updatePolicy = useCallback((updates: Partial<PolicyBuilderState>) => {
    const updatedPolicy = { ...policy, ...updates };
    setPolicy(updatedPolicy);
    onChange(updatedPolicy);
  }, [policy, onChange]);

  // Handle save
  const handleSave = useCallback(() => {
    const validation = validatePolicy();
    if (validation.isValid) {
      onSave(policy);
    }
  }, [policy, onSave, validatePolicy]);

  // Step navigation
  const steps: Array<{
    key: PolicyBuilderStep;
    label: string;
    description: string;
    isComplete: boolean;
  }> = [
    {
      key: 'basic',
      label: 'Basic Info',
      description: 'Policy name, description, and metadata',
      isComplete: !!(policy.name && policy.description)
    },
    {
      key: 'subject',
      label: 'Subject',
      description: 'Who this policy applies to',
      isComplete: policy.subjectConditions.length > 0
    },
    {
      key: 'resource',
      label: 'Resource',
      description: 'What resources this policy covers',
      isComplete: policy.resourceConditions.length > 0
    },
    {
      key: 'action',
      label: 'Actions',
      description: 'What actions are allowed or denied',
      isComplete: policy.actionConditions.length > 0
    },
    {
      key: 'environment',
      label: 'Environment',
      description: 'When and where this policy applies',
      isComplete: true // Optional step
    },
    {
      key: 'rules',
      label: 'Rules',
      description: 'Complex conditions and logic',
      isComplete: true // Optional step
    },
    {
      key: 'review',
      label: 'Review',
      description: 'Review and save the policy',
      isComplete: validationResults.isValid
    }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);
  const canGoNext = currentStepIndex < steps.length - 1;
  const canGoPrevious = currentStepIndex > 0;

  const goToNext = () => {
    if (canGoNext) {
      setCurrentStep(steps[currentStepIndex + 1].key);
    }
  };

  const goToPrevious = () => {
    if (canGoPrevious) {
      setCurrentStep(steps[currentStepIndex - 1].key);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="policy-name">Policy Name *</Label>
                  <Input
                    id="policy-name"
                    placeholder="Enter policy name"
                    value={policy.name}
                    onChange={(e) => updatePolicy({ name: e.target.value })}
                    disabled={readonly}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="policy-effect">Effect *</Label>
                  <Select value={policy.effect} onValueChange={(value) => updatePolicy({ effect: value as EffectType })} disabled={readonly}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EffectType.PERMIT}>Permit (Allow)</SelectItem>
                      <SelectItem value={EffectType.DENY}>Deny (Block)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="policy-description">Description *</Label>
                <Textarea
                  id="policy-description"
                  placeholder="Describe what this policy does and when it applies"
                  value={policy.description}
                  onChange={(e) => updatePolicy({ description: e.target.value })}
                  rows={3}
                  disabled={readonly}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="policy-priority">Priority (0-1000)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[policy.priority]}
                      onValueChange={([value]) => updatePolicy({ priority: value })}
                      max={1000}
                      step={10}
                      disabled={readonly}
                    />
                    <Input
                      type="number"
                      min={0}
                      max={1000}
                      value={policy.priority}
                      onChange={(e) => updatePolicy({ priority: parseInt(e.target.value) || 0 })}
                      disabled={readonly}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policy-version">Version</Label>
                  <Input
                    id="policy-version"
                    placeholder="1.0"
                    value={policy.version}
                    onChange={(e) => updatePolicy({ version: e.target.value })}
                    disabled={readonly}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={policy.enabled}
                      onCheckedChange={(enabled) => updatePolicy({ enabled })}
                      disabled={readonly}
                    />
                    <span className="text-sm">{policy.enabled ? 'Active' : 'Draft'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="policy-tags">Tags (optional)</Label>
                <Input
                  id="policy-tags"
                  placeholder="Enter tags separated by commas"
                  value={policy.tags?.join(', ') || ''}
                  onChange={(e) => updatePolicy({ 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) 
                  })}
                  disabled={readonly}
                />
              </div>
            </div>
          </div>
        );

      case 'subject':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Subject Conditions</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Define who this policy applies to. Add conditions based on user attributes like roles, departments, or employment details.
              </p>
            </div>
            
            <RuleConditionBuilder
              initialConditions={policy.subjectConditions.map(condition => ({
                id: `subject-${Date.now()}-${Math.random()}`,
                type: 'condition',
                level: 0,
                attribute: condition.attribute,
                operator: condition.operator,
                value: condition.value,
                isExpanded: true,
                isValid: true
              }))}
              availableAttributes={allAttributes.filter(attr => attr.category === 'subject')}
              onChange={(conditions) => {
                const subjectConditions = conditions
                  .filter(c => c.type === 'condition' && c.attribute && c.operator && c.value !== undefined)
                  .map(c => ({
                    attribute: c.attribute!,
                    operator: c.operator!,
                    value: c.value,
                    description: `${c.attribute} ${c.operator} ${JSON.stringify(c.value)}`
                  }));
                updatePolicy({ subjectConditions });
              }}
              onValidationChange={() => {}}
              showTemplates={true}
              allowNesting={true}
            />
          </div>
        );

      case 'resource':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Resource Conditions</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Define what resources this policy applies to. Add conditions based on resource type, ownership, value, or status.
              </p>
            </div>
            
            <RuleConditionBuilder
              initialConditions={policy.resourceConditions.map(condition => ({
                id: `resource-${Date.now()}-${Math.random()}`,
                type: 'condition',
                level: 0,
                attribute: condition.attribute,
                operator: condition.operator,
                value: condition.value,
                isExpanded: true,
                isValid: true
              }))}
              availableAttributes={allAttributes.filter(attr => attr.category === 'resource')}
              onChange={(conditions) => {
                const resourceConditions = conditions
                  .filter(c => c.type === 'condition' && c.attribute && c.operator && c.value !== undefined)
                  .map(c => ({
                    attribute: c.attribute!,
                    operator: c.operator!,
                    value: c.value,
                    description: `${c.attribute} ${c.operator} ${JSON.stringify(c.value)}`
                  }));
                updatePolicy({ resourceConditions });
              }}
              onValidationChange={() => {}}
              showTemplates={true}
              allowNesting={true}
            />
          </div>
        );

      case 'action':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Actions</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select which actions this policy controls. These are the operations users can perform on resources.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {[
                'create', 'read', 'update', 'delete',
                'approve', 'reject', 'submit_for_approval',
                'place_order', 'receive_goods', 'process_invoice',
                'adjust_stock', 'transfer_stock', 'conduct_count',
                'process_payment', 'view_financial_reports', 'manage_budget',
                'manage_users', 'configure_system', 'view_audit_logs',
                'export_data', 'import_data', 'backup_data'
              ].map(action => (
                <div key={action} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={action}
                    checked={policy.actionConditions.includes(action)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updatePolicy({ 
                          actionConditions: [...policy.actionConditions, action] 
                        });
                      } else {
                        updatePolicy({ 
                          actionConditions: policy.actionConditions.filter(a => a !== action) 
                        });
                      }
                    }}
                    disabled={readonly}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={action} className="text-sm capitalize">
                    {action.replace('_', ' ')}
                  </label>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-actions">Custom Actions (optional)</Label>
              <Input
                id="custom-actions"
                placeholder="Enter custom actions separated by commas"
                onChange={(e) => {
                  const customActions = e.target.value.split(',').map(a => a.trim()).filter(Boolean);
                  updatePolicy({ 
                    actionConditions: [
                      ...policy.actionConditions.filter(a => ![...customActions].includes(a)),
                      ...customActions
                    ]
                  });
                }}
                disabled={readonly}
              />
            </div>
          </div>
        );

      case 'environment':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Environment Conditions</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Define when and where this policy applies. Add conditions based on time, location, device, or system state.
              </p>
            </div>
            
            <RuleConditionBuilder
              initialConditions={policy.environmentConditions.map(condition => ({
                id: `environment-${Date.now()}-${Math.random()}`,
                type: 'condition',
                level: 0,
                attribute: condition.attribute,
                operator: condition.operator,
                value: condition.value,
                isExpanded: true,
                isValid: true
              }))}
              availableAttributes={allAttributes.filter(attr => attr.category === 'environment')}
              onChange={(conditions) => {
                const environmentConditions = conditions
                  .filter(c => c.type === 'condition' && c.attribute && c.operator && c.value !== undefined)
                  .map(c => ({
                    attribute: c.attribute!,
                    operator: c.operator!,
                    value: c.value,
                    description: `${c.attribute} ${c.operator} ${JSON.stringify(c.value)}`
                  }));
                updatePolicy({ environmentConditions });
              }}
              onValidationChange={() => {}}
              showTemplates={true}
              allowNesting={true}
            />
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Policy Review</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Review your policy configuration before saving.
              </p>
            </div>

            {/* Validation Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {validationResults.isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span>Validation Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {validationResults.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-600">Errors</h4>
                    <ul className="text-sm space-y-1">
                      {validationResults.errors.map((error, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {validationResults.warnings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-yellow-600">Warnings</h4>
                    <ul className="text-sm space-y-1">
                      {validationResults.warnings.map((warning, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {validationResults.isValid && validationResults.warnings.length === 0 && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Policy is valid and ready to save</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Policy Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Policy Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>Name</Label>
                    <p className="font-medium">{policy.name || 'Untitled Policy'}</p>
                  </div>
                  <div>
                    <Label>Effect</Label>
                    <Badge variant={policy.effect === EffectType.PERMIT ? "default" : "destructive"}>
                      {policy.effect}
                    </Badge>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <p className="font-medium">{policy.priority}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge variant={policy.enabled ? "default" : "secondary"}>
                      {policy.enabled ? 'Active' : 'Draft'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <p className="text-sm">{policy.description || 'No description provided'}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Subject Conditions</Label>
                    <p className="font-medium">{policy.subjectConditions.length}</p>
                  </div>
                  <div>
                    <Label>Resource Conditions</Label>
                    <p className="font-medium">{policy.resourceConditions.length}</p>
                  </div>
                  <div>
                    <Label>Actions</Label>
                    <p className="font-medium">{policy.actionConditions.length}</p>
                  </div>
                  <div>
                    <Label>Environment Conditions</Label>
                    <p className="font-medium">{policy.environmentConditions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">
              {readonly ? 'View Policy' : (initialPolicy ? 'Edit Policy' : 'Create New Policy')}
            </h2>
            {policy.name && (
              <Badge variant="outline">{policy.name}</Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}>
                    {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {showPreview ? 'Hide preview' : 'Show preview'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {!readonly && (
              <>
                <Button variant="outline" onClick={onCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isValidating}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Policy
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="border-b bg-muted/50">
        <ScrollArea className="w-full">
          <div className="flex items-center px-4 py-2 space-x-1">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <Button
                  variant={currentStep === step.key ? "default" : step.isComplete ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentStep(step.key)}
                  className="whitespace-nowrap"
                >
                  {step.isComplete && currentStep !== step.key && (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  )}
                  {step.label}
                </Button>
                {index < steps.length - 1 && (
                  <Separator orientation="vertical" className="mx-2 h-4" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {renderStepContent()}
          </div>
        </div>

        {/* Sidebar for AttributeInspector when relevant */}
        {['subject', 'resource', 'environment'].includes(currentStep) && (
          <div className="w-80 border-l overflow-y-auto">
            <AttributeInspector
              onAttributeSelect={(attribute) => {
                console.log('Selected attribute:', attribute);
                // This would integrate with the condition builder
              }}
              category={currentStep as 'subject' | 'resource' | 'environment'}
              showSearch={true}
              showFavorites={true}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 justify-between">
          <div className="text-sm text-muted-foreground">
            Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex].description}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={goToPrevious}
              disabled={!canGoPrevious}
            >
              Previous
            </Button>
            
            {currentStep === 'review' ? (
              <Button
                onClick={handleSave}
                disabled={!validationResults.isValid || readonly}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Policy
              </Button>
            ) : (
              <Button
                onClick={goToNext}
                disabled={!canGoNext}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Validation on step change */}
      {currentStep === 'review' && validatePolicy() && null}
    </div>
  );
}