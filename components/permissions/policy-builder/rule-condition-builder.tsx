'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Minus,
  ChevronDown,
  ChevronRight,
  Trash2,
  Copy,
  Save,
  Code,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { 
  ConditionNode, 
  RuleConditionBuilderProps,
  ConditionTemplate,
  AttributeDefinition 
} from '@/lib/types/policy-builder';
import { Operator, LogicalOperator } from '@/lib/types/permissions';
import { DEFAULT_OPERATORS_BY_TYPE } from '@/lib/types/policy-builder';

// Mock condition templates
const conditionTemplates: ConditionTemplate[] = [
  {
    id: 'financial-approval',
    name: 'Financial Approval Template',
    description: 'Standard template for financial approval workflows',
    category: 'Financial',
    conditions: [
      {
        attribute: 'subject.role.name',
        operator: Operator.IN,
        value: ['financial-manager', 'department-manager'],
        description: 'User must be a financial or department manager'
      },
      {
        attribute: 'resource.totalValue.amount',
        operator: Operator.GREATER_THAN,
        value: 1000,
        description: 'Resource value must exceed $1000'
      }
    ],
    tags: ['approval', 'financial'],
    isSystem: true
  },
  {
    id: 'business-hours',
    name: 'Business Hours Template',
    description: 'Restrict access to business hours only',
    category: 'Temporal',
    conditions: [
      {
        attribute: 'environment.isBusinessHours',
        operator: Operator.EQUALS,
        value: true,
        description: 'Must be during business hours'
      },
      {
        attribute: 'environment.dayOfWeek',
        operator: Operator.NOT_IN,
        value: ['saturday', 'sunday'],
        description: 'Not on weekends'
      }
    ],
    tags: ['temporal', 'business-hours'],
    isSystem: true
  }
];

interface ConditionNodeDisplayProps {
  node: ConditionNode;
  availableAttributes: AttributeDefinition[];
  onUpdate: (nodeId: string, updates: Partial<ConditionNode>) => void;
  onDelete: (nodeId: string) => void;
  onAddChild: (parentId: string) => void;
  level: number;
  maxDepth: number;
  allowNesting: boolean;
}

function ConditionNodeDisplay({
  node,
  availableAttributes,
  onUpdate,
  onDelete,
  onAddChild,
  level,
  maxDepth,
  allowNesting
}: ConditionNodeDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(node.isExpanded);

  const selectedAttribute = useMemo(() => {
    return availableAttributes.find(attr => attr.path === node.attribute);
  }, [availableAttributes, node.attribute]);

  const availableOperators = useMemo(() => {
    if (!selectedAttribute) return [];
    return DEFAULT_OPERATORS_BY_TYPE[selectedAttribute.dataType] || [];
  }, [selectedAttribute]);

  const handleToggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onUpdate(node.id, { isExpanded: newExpanded });
  };

  const handleAttributeChange = (attributePath: string) => {
    const attribute = availableAttributes.find(attr => attr.path === attributePath);
    onUpdate(node.id, {
      attribute: attributePath,
      operator: undefined,
      value: undefined,
      isValid: false
    });
  };

  const handleOperatorChange = (operator: Operator) => {
    onUpdate(node.id, {
      operator,
      value: getDefaultValueForOperator(operator, selectedAttribute?.dataType),
      isValid: validateCondition(node.attribute!, operator, undefined)
    });
  };

  const handleValueChange = (value: any) => {
    onUpdate(node.id, {
      value,
      isValid: validateCondition(node.attribute!, node.operator!, value)
    });
  };

  const handleLogicalOperatorChange = (logicalOperator: LogicalOperator) => {
    onUpdate(node.id, { logicalOperator });
  };

  const getDefaultValueForOperator = (operator: Operator, dataType?: string) => {
    switch (dataType) {
      case 'boolean':
        return true;
      case 'number':
        return 0;
      case 'array':
        return [];
      default:
        return '';
    }
  };

  const validateCondition = (attribute?: string, operator?: Operator, value?: any): boolean => {
    if (!attribute || !operator) return false;
    if (value === undefined || value === null || value === '') return false;
    
    // Additional validation based on operator type
    if (operator === Operator.IN || operator === Operator.NOT_IN) {
      return Array.isArray(value) && value.length > 0;
    }
    
    return true;
  };

  const renderValueInput = () => {
    if (!selectedAttribute || !node.operator) return null;

    const commonProps = {
      value: node.value || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleValueChange(e.target.value)
    };

    switch (selectedAttribute.dataType) {
      case 'boolean':
        return (
          <Select value={node.value?.toString()} onValueChange={(value) => handleValueChange(value === 'true')}>
            <SelectTrigger>
              <SelectValue placeholder="Select boolean value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder="Enter number"
            {...commonProps}
            onChange={(e) => handleValueChange(parseFloat(e.target.value) || 0)}
          />
        );

      case 'date':
        return (
          <Input
            type="datetime-local"
            {...commonProps}
            onChange={(e) => handleValueChange(e.target.value)}
          />
        );

      case 'array':
        return (
          <div className="space-y-2">
            <Label className="text-sm">Array values (one per line)</Label>
            <Textarea
              placeholder="Enter values, one per line"
              value={Array.isArray(node.value) ? node.value.join('\n') : ''}
              onChange={(e) => {
                const lines = e.target.value.split('\n').filter(line => line.trim());
                handleValueChange(lines);
              }}
            />
          </div>
        );

      default:
        // Check if attribute has predefined examples for dropdown
        if (selectedAttribute.examples && selectedAttribute.examples.length > 0 && 
            [Operator.EQUALS, Operator.NOT_EQUALS, Operator.IN, Operator.NOT_IN].includes(node.operator)) {
          return (
            <Select value={node.value} onValueChange={handleValueChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select value" />
              </SelectTrigger>
              <SelectContent>
                {selectedAttribute.examples.map((example, idx) => (
                  <SelectItem key={idx} value={example.toString()}>
                    {example.toString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        
        return (
          <Input
            placeholder="Enter value"
            {...commonProps}
          />
        );
    }
  };

  if (node.type === 'group') {
    return (
      <Card className={`ml-${level * 4} border-l-4 ${node.isValid ? 'border-l-green-500' : 'border-l-red-500'}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleExpanded}
                className="p-0 h-auto"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              
              <Select value={node.logicalOperator} onValueChange={handleLogicalOperatorChange}>
                <SelectTrigger className="w-20 h-7">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LogicalOperator.AND}>AND</SelectItem>
                  <SelectItem value={LogicalOperator.OR}>OR</SelectItem>
                </SelectContent>
              </Select>

              <Badge variant={node.isValid ? "default" : "destructive"} className="text-xs">
                Group ({node.children?.length || 0} conditions)
              </Badge>
            </div>

            <div className="flex items-center space-x-1">
              {allowNesting && level < maxDepth && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAddChild(node.id)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add condition to group</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(node.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete group</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>

        {isExpanded && node.children && (
          <CardContent className="space-y-2">
            {node.children.map((child) => (
              <ConditionNodeDisplay
                key={child.id}
                node={child}
                availableAttributes={availableAttributes}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onAddChild={onAddChild}
                level={level + 1}
                maxDepth={maxDepth}
                allowNesting={allowNesting}
              />
            ))}
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card className={`ml-${level * 4} ${node.isValid ? 'border-green-200' : 'border-red-200'}`}>
      <CardContent className="p-4">
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Attribute Selection */}
            <div className="space-y-2">
              <Label className="text-sm">Attribute</Label>
              <Select value={node.attribute} onValueChange={handleAttributeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select attribute" />
                </SelectTrigger>
                <SelectContent>
                  {availableAttributes.map((attr) => (
                    <SelectItem key={attr.path} value={attr.path}>
                      <div className="flex items-center space-x-2">
                        <span>{attr.displayName}</span>
                        <Badge variant="outline" className="text-xs">
                          {attr.dataType}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Operator Selection */}
            <div className="space-y-2">
              <Label className="text-sm">Operator</Label>
              <Select value={node.operator} onValueChange={handleOperatorChange} disabled={!node.attribute}>
                <SelectTrigger>
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  {availableOperators.map((op) => (
                    <SelectItem key={op} value={op}>
                      {op}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Value Input */}
            <div className="space-y-2">
              <Label className="text-sm">Value</Label>
              {renderValueInput()}
            </div>
          </div>

          {/* Validation Status and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {node.isValid ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm text-muted-foreground">
                {node.isValid ? 'Valid condition' : 'Invalid condition'}
              </span>
              
              {node.errors && node.errors.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <ul className="list-disc list-inside">
                        {node.errors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <div className="flex items-center space-x-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(node.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete condition</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Attribute Info */}
          {selectedAttribute && (
            <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
              <p>{selectedAttribute.description}</p>
              {selectedAttribute.examples && (
                <p className="mt-1">
                  Examples: {selectedAttribute.examples.slice(0, 3).map(ex => JSON.stringify(ex)).join(', ')}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function RuleConditionBuilder({
  initialConditions = [],
  availableAttributes,
  onChange,
  onValidationChange,
  showTemplates = true,
  allowNesting = true,
  maxDepth = 3
}: RuleConditionBuilderProps) {
  const [conditions, setConditions] = useState<ConditionNode[]>(initialConditions);
  const [showCodeView, setShowCodeView] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ConditionTemplate | null>(null);

  const generateId = () => `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const createCondition = (parentId?: string): ConditionNode => ({
    id: generateId(),
    type: 'condition',
    parentId,
    level: parentId ? (conditions.find(c => c.id === parentId)?.level || 0) + 1 : 0,
    isExpanded: true,
    isValid: false
  });

  const createGroup = (parentId?: string): ConditionNode => ({
    id: generateId(),
    type: 'group',
    parentId,
    level: parentId ? (conditions.find(c => c.id === parentId)?.level || 0) + 1 : 0,
    logicalOperator: LogicalOperator.AND,
    children: [],
    isExpanded: true,
    isValid: false
  });

  const addCondition = useCallback((parentId?: string) => {
    const newCondition = createCondition(parentId);
    setConditions(prev => [...prev, newCondition]);
  }, []);

  const addGroup = useCallback((parentId?: string) => {
    const newGroup = createGroup(parentId);
    setConditions(prev => [...prev, newGroup]);
  }, []);

  const updateCondition = useCallback((nodeId: string, updates: Partial<ConditionNode>) => {
    setConditions(prev => prev.map(condition => 
      condition.id === nodeId ? { ...condition, ...updates } : condition
    ));
  }, []);

  const deleteCondition = useCallback((nodeId: string) => {
    setConditions(prev => prev.filter(condition => condition.id !== nodeId));
  }, []);

  const applyTemplate = useCallback((template: ConditionTemplate) => {
    const templateConditions: ConditionNode[] = template.conditions.map(cond => ({
      id: generateId(),
      type: 'condition',
      level: 0,
      attribute: cond.attribute,
      operator: cond.operator,
      value: cond.value,
      isExpanded: true,
      isValid: true
    }));
    
    setConditions(templateConditions);
    setSelectedTemplate(null);
  }, []);

  // Update parent component when conditions change
  useMemo(() => {
    onChange(conditions);
    
    // Validate all conditions
    const validation = {
      isValid: conditions.every(c => c.isValid),
      errors: conditions.filter(c => !c.isValid).map(c => ({
        field: c.id,
        message: 'Invalid condition configuration',
        type: 'invalid' as const
      })),
      warnings: []
    };
    
    onValidationChange(validation);
  }, [conditions, onChange, onValidationChange]);

  const generateCodeView = () => {
    const formatCondition = (node: ConditionNode): string => {
      if (node.type === 'group') {
        const childConditions = node.children?.map(formatCondition).join(` ${node.logicalOperator} `) || '';
        return `(${childConditions})`;
      }
      return `${node.attribute} ${node.operator} ${JSON.stringify(node.value)}`;
    };

    return conditions.map(formatCondition).join(' AND ');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Rule Conditions</CardTitle>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCodeView(!showCodeView)}
                  >
                    {showCodeView ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {showCodeView ? 'Hide code view' : 'Show code view'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {showTemplates && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Templates
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Condition Templates</DialogTitle>
                    <DialogDescription>
                      Choose from pre-built condition templates to get started quickly.
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-96">
                    <div className="space-y-4">
                      {conditionTemplates.map(template => (
                        <Card key={template.id} className="cursor-pointer hover:bg-muted/50" onClick={() => applyTemplate(template)}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-base">{template.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{template.description}</p>
                              </div>
                              <Badge variant="outline">{template.category}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {template.conditions.map((condition, idx) => (
                                <div key={idx} className="text-xs font-mono bg-muted p-2 rounded">
                                  {condition.attribute} {condition.operator} {JSON.stringify(condition.value)}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            )}

            <Button onClick={() => addCondition()} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Condition
            </Button>

            {allowNesting && (
              <Button onClick={() => addGroup()} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Group
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {showCodeView && (
          <div className="mb-4">
            <Label className="text-sm">Generated Expression</Label>
            <div className="mt-2 p-3 bg-muted rounded font-mono text-sm">
              {generateCodeView() || 'No conditions defined'}
            </div>
          </div>
        )}

        <ScrollArea className="max-h-96">
          <div className="space-y-4">
            {conditions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No conditions defined. Add a condition to get started.</p>
              </div>
            ) : (
              conditions.map(condition => (
                <ConditionNodeDisplay
                  key={condition.id}
                  node={condition}
                  availableAttributes={availableAttributes}
                  onUpdate={updateCondition}
                  onDelete={deleteCondition}
                  onAddChild={addCondition}
                  level={0}
                  maxDepth={maxDepth}
                  allowNesting={allowNesting}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}