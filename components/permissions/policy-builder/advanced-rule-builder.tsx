'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
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
  CheckCircle,
  Settings,
  Target,
  GitBranch,
  Layers,
  Workflow,
  FileText,
  Zap,
  TestTube,
  Play,
  Square,
  RotateCcw,
  Download,
  Upload,
  Link,
  Move,
  MousePointer,
  Grid,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

import { 
  ConditionNode, 
  RuleConditionBuilderProps,
  ConditionTemplate,
  AttributeDefinition,
  PolicyBuilderValidation
} from '@/lib/types/policy-builder';
import { Operator, LogicalOperator } from '@/lib/types/permissions';
import { DEFAULT_OPERATORS_BY_TYPE } from '@/lib/types/policy-builder';

// Enhanced visual node types
interface VisualRuleNode {
  id: string;
  type: 'condition' | 'group' | 'operator' | 'connector';
  position: { x: number; y: number };
  size: { width: number; height: number };
  data: {
    attribute?: string;
    operator?: Operator;
    value?: any;
    logicalOperator?: LogicalOperator;
    label?: string;
    isValid: boolean;
    errors?: string[];
    color?: string;
  };
  connections: {
    inputs: string[];
    outputs: string[];
  };
  isSelected: boolean;
  isDragging: boolean;
}

// Visual editor modes
type VisualEditorMode = 'select' | 'connect' | 'draw' | 'test';

// Rule templates with visual layouts
const advancedRuleTemplates: (ConditionTemplate & { 
  layout?: { nodePositions: Record<string, { x: number; y: number }> } 
})[] = [
  {
    id: 'financial-approval-workflow',
    name: 'Financial Approval Workflow',
    description: 'Complete financial approval process with multi-level authorization',
    category: 'Financial',
    conditions: [
      {
        attribute: 'subject.role.name',
        operator: Operator.IN,
        value: ['financial-manager', 'department-manager', 'cfo'],
        description: 'User must have financial authorization role'
      },
      {
        attribute: 'resource.totalValue.amount',
        operator: Operator.GREATER_THAN,
        value: 1000,
        description: 'Transaction amount exceeds approval threshold'
      },
      {
        attribute: 'resource.category',
        operator: Operator.NOT_IN,
        value: ['restricted', 'confidential'],
        description: 'Resource category must not be restricted'
      },
      {
        attribute: 'environment.isBusinessHours',
        operator: Operator.EQUALS,
        value: true,
        description: 'Must be during business hours'
      }
    ],
    tags: ['approval', 'financial', 'workflow', 'multi-level'],
    isSystem: true,
    layout: {
      nodePositions: {
        'node-1': { x: 100, y: 100 },
        'node-2': { x: 350, y: 100 },
        'node-3': { x: 100, y: 200 },
        'node-4': { x: 350, y: 200 },
        'operator-1': { x: 225, y: 150 }
      }
    }
  },
  {
    id: 'security-clearance-check',
    name: 'Security Clearance Validation',
    description: 'Multi-factor security clearance validation for sensitive resources',
    category: 'Security',
    conditions: [
      {
        attribute: 'subject.clearanceLevel',
        operator: Operator.IN,
        value: ['secret', 'top-secret'],
        description: 'User must have appropriate security clearance'
      },
      {
        attribute: 'environment.isInternalNetwork',
        operator: Operator.EQUALS,
        value: true,
        description: 'Access must be from internal network'
      },
      {
        attribute: 'environment.mfaVerified',
        operator: Operator.EQUALS,
        value: true,
        description: 'Multi-factor authentication required'
      },
      {
        attribute: 'resource.classificationLevel',
        operator: Operator.LESS_THAN_OR_EQUAL,
        value: 'subject.clearanceLevel',
        description: 'Resource classification must not exceed user clearance'
      }
    ],
    tags: ['security', 'clearance', 'mfa', 'classification'],
    isSystem: true,
    layout: {
      nodePositions: {
        'node-1': { x: 50, y: 80 },
        'node-2': { x: 250, y: 80 },
        'node-3': { x: 50, y: 180 },
        'node-4': { x: 250, y: 180 },
        'operator-1': { x: 150, y: 130 }
      }
    }
  },
  {
    id: 'time-location-access',
    name: 'Time & Location Based Access',
    description: 'Temporal and geographical access control with emergency overrides',
    category: 'Temporal',
    conditions: [
      {
        attribute: 'environment.currentTime',
        operator: Operator.GREATER_THAN,
        value: '08:00',
        description: 'Access allowed after 8 AM'
      },
      {
        attribute: 'environment.currentTime',
        operator: Operator.LESS_THAN,
        value: '18:00',
        description: 'Access allowed before 6 PM'
      },
      {
        attribute: 'environment.userLocation.country',
        operator: Operator.EQUALS,
        value: 'US',
        description: 'Access limited to US locations'
      },
      {
        attribute: 'subject.isEmergencyOverride',
        operator: Operator.EQUALS,
        value: true,
        description: 'Emergency override available'
      }
    ],
    tags: ['temporal', 'location', 'emergency', 'geofencing'],
    isSystem: true
  }
];

interface AdvancedRuleBuilderProps extends RuleConditionBuilderProps {
  enableVisualMode?: boolean;
  enableTestMode?: boolean;
  enableCollaboration?: boolean;
}

export function AdvancedRuleBuilder({
  initialConditions = [],
  availableAttributes,
  onChange,
  onValidationChange,
  showTemplates = true,
  allowNesting = true,
  maxDepth = 5,
  enableVisualMode = true,
  enableTestMode = true,
  enableCollaboration = false
}: AdvancedRuleBuilderProps) {
  // State management
  const [editorMode, setEditorMode] = useState<'form' | 'visual' | 'code'>('form');
  const [visualMode, setVisualMode] = useState<VisualEditorMode>('select');
  const [conditions, setConditions] = useState<ConditionNode[]>(initialConditions);
  const [visualNodes, setVisualNodes] = useState<VisualRuleNode[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  
  // Canvas state
  const [canvasState, setCanvasState] = useState({
    zoom: 1,
    pan: { x: 0, y: 0 },
    showGrid: true,
    snapToGrid: true,
    gridSize: 20
  });
  
  // UI state
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ isDragging: false, startPos: { x: 0, y: 0 } });

  // Initialize visual nodes from conditions
  useEffect(() => {
    if (conditions.length > 0 && visualNodes.length === 0) {
      convertConditionsToVisualNodes(conditions);
    }
  }, [conditions, visualNodes.length]);

  // Generate unique ID
  const generateId = () => `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Convert conditions to visual nodes
  const convertConditionsToVisualNodes = (conditions: ConditionNode[]) => {
    const nodes: VisualRuleNode[] = [];
    let yPos = 100;
    
    conditions.forEach((condition, index) => {
      const node: VisualRuleNode = {
        id: condition.id || generateId(),
        type: condition.type,
        position: { x: 100 + (index % 3) * 250, y: yPos + Math.floor(index / 3) * 120 },
        size: { width: 220, height: condition.type === 'group' ? 100 : 80 },
        data: {
          attribute: condition.attribute,
          operator: condition.operator,
          value: condition.value,
          logicalOperator: condition.logicalOperator,
          label: condition.attribute ? 
            `${condition.attribute} ${condition.operator} ${JSON.stringify(condition.value)}` : 
            `${condition.logicalOperator} Group`,
          isValid: condition.isValid,
          errors: condition.errors,
          color: condition.type === 'group' ? 
            'bg-purple-100 border-purple-300' : 
            condition.isValid ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
        },
        connections: { inputs: [], outputs: [] },
        isSelected: false,
        isDragging: false
      };
      nodes.push(node);
    });
    
    setVisualNodes(nodes);
  };

  // Create new condition
  const createCondition = useCallback(() => {
    const newCondition: ConditionNode = {
      id: generateId(),
      type: 'condition',
      level: 0,
      isExpanded: true,
      isValid: false
    };
    
    setConditions(prev => [...prev, newCondition]);
    
    // Add visual node if in visual mode
    if (editorMode === 'visual') {
      const visualNode: VisualRuleNode = {
        id: newCondition.id,
        type: 'condition',
        position: { x: 100 + visualNodes.length * 250, y: 100 },
        size: { width: 220, height: 80 },
        data: {
          isValid: false,
          label: 'New Condition',
          color: 'bg-gray-100 border-gray-300'
        },
        connections: { inputs: [], outputs: [] },
        isSelected: false,
        isDragging: false
      };
      setVisualNodes(prev => [...prev, visualNode]);
    }
  }, [conditions, visualNodes.length, editorMode]);

  // Create new group
  const createGroup = useCallback(() => {
    const newGroup: ConditionNode = {
      id: generateId(),
      type: 'group',
      level: 0,
      logicalOperator: LogicalOperator.AND,
      children: [],
      isExpanded: true,
      isValid: false
    };
    
    setConditions(prev => [...prev, newGroup]);
    
    if (editorMode === 'visual') {
      const visualNode: VisualRuleNode = {
        id: newGroup.id,
        type: 'group',
        position: { x: 100 + visualNodes.length * 250, y: 100 },
        size: { width: 220, height: 100 },
        data: {
          logicalOperator: LogicalOperator.AND,
          isValid: false,
          label: 'AND Group',
          color: 'bg-purple-100 border-purple-300'
        },
        connections: { inputs: [], outputs: [] },
        isSelected: false,
        isDragging: false
      };
      setVisualNodes(prev => [...prev, visualNode]);
    }
  }, [conditions, visualNodes.length, editorMode]);

  // Update condition
  const updateCondition = useCallback((nodeId: string, updates: Partial<ConditionNode>) => {
    setConditions(prev => prev.map(condition => 
      condition.id === nodeId ? { ...condition, ...updates } : condition
    ));
    
    // Update visual node
    if (editorMode === 'visual') {
      setVisualNodes(prev => prev.map(node => 
        node.id === nodeId ? {
          ...node,
          data: {
            ...node.data,
            ...updates,
            label: updates.attribute ? 
              `${updates.attribute} ${updates.operator} ${JSON.stringify(updates.value)}` :
              node.data.label,
            color: updates.isValid ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
          }
        } : node
      ));
    }
  }, [editorMode]);

  // Delete condition
  const deleteCondition = useCallback((nodeId: string) => {
    setConditions(prev => prev.filter(condition => condition.id !== nodeId));
    setVisualNodes(prev => prev.filter(node => node.id !== nodeId));
    setSelectedNodes(prev => prev.filter(id => id !== nodeId));
  }, []);

  // Handle node selection in visual mode
  const handleNodeSelect = useCallback((nodeId: string, isMultiSelect = false) => {
    if (isMultiSelect) {
      setSelectedNodes(prev => 
        prev.includes(nodeId) 
          ? prev.filter(id => id !== nodeId)
          : [...prev, nodeId]
      );
    } else {
      setSelectedNodes([nodeId]);
    }
    
    setVisualNodes(prev => prev.map(node => ({
      ...node,
      isSelected: isMultiSelect 
        ? node.id === nodeId ? !node.isSelected : node.isSelected
        : node.id === nodeId
    })));
  }, []);

  // Handle node drag
  const handleNodeDrag = useCallback((nodeId: string, newPosition: { x: number; y: number }) => {
    setVisualNodes(prev => prev.map(node => 
      node.id === nodeId ? {
        ...node,
        position: canvasState.snapToGrid ? {
          x: Math.round(newPosition.x / canvasState.gridSize) * canvasState.gridSize,
          y: Math.round(newPosition.y / canvasState.gridSize) * canvasState.gridSize
        } : newPosition
      } : node
    ));
  }, [canvasState.snapToGrid, canvasState.gridSize]);

  // Apply template
  const applyTemplate = useCallback((template: typeof advancedRuleTemplates[0]) => {
    const templateConditions: ConditionNode[] = template.conditions.map((cond, index) => ({
      id: `template-${template.id}-${index}`,
      type: 'condition',
      level: 0,
      attribute: cond.attribute,
      operator: cond.operator,
      value: cond.value,
      isExpanded: true,
      isValid: true
    }));
    
    setConditions(templateConditions);
    
    if (editorMode === 'visual' && template.layout) {
      const visualNodes: VisualRuleNode[] = templateConditions.map((cond, index) => {
        const nodeId = `template-${template.id}-${index}`;
        const position = template.layout?.nodePositions[`node-${index + 1}`] || { x: 100 + index * 250, y: 100 };
        
        return {
          id: cond.id,
          type: 'condition',
          position,
          size: { width: 220, height: 80 },
          data: {
            attribute: cond.attribute,
            operator: cond.operator,
            value: cond.value,
            isValid: true,
            label: `${cond.attribute} ${cond.operator} ${JSON.stringify(cond.value)}`,
            color: 'bg-green-100 border-green-300'
          },
          connections: { inputs: [], outputs: [] },
          isSelected: false,
          isDragging: false
        };
      });
      
      setVisualNodes(visualNodes);
    }
    
    setShowTemplateDialog(false);
  }, [editorMode]);

  // Test rule with sample data
  const testRule = useCallback(async () => {
    setIsTestMode(true);
    try {
      // Mock test execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResults = {
        success: Math.random() > 0.3,
        evaluationTime: Math.floor(Math.random() * 100) + 50,
        conditionsEvaluated: conditions.length,
        passedConditions: Math.floor(conditions.length * (0.7 + Math.random() * 0.3)),
        details: conditions.map(condition => ({
          id: condition.id,
          passed: Math.random() > 0.2,
          evaluationTime: Math.floor(Math.random() * 20) + 5
        }))
      };
      
      setTestResults(mockResults);
    } catch (error) {
      console.error('Rule test failed:', error);
    } finally {
      setIsTestMode(false);
    }
  }, [conditions]);

  // Generate code representation
  const generateCode = useCallback(() => {
    const formatCondition = (condition: ConditionNode): string => {
      if (condition.type === 'group') {
        const childConditions = condition.children?.map(formatCondition).join(` ${condition.logicalOperator} `) || '';
        return `(${childConditions})`;
      }
      return `${condition.attribute} ${condition.operator} ${JSON.stringify(condition.value)}`;
    };

    return conditions.map(formatCondition).join(' AND ');
  }, [conditions]);

  // Validate all conditions
  const validation = useMemo((): PolicyBuilderValidation => {
    const errors = conditions.filter(c => !c.isValid).map(c => ({
      field: c.id,
      message: 'Invalid condition configuration',
      type: 'invalid' as const
    }));

    const warnings = [];
    if (conditions.length > 10) {
      warnings.push({
        field: 'performance',
        message: 'Large number of conditions may impact performance',
        type: 'performance' as const
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [conditions]);

  // Update parent when conditions change
  useEffect(() => {
    onChange(conditions);
    onValidationChange(validation);
  }, [conditions, validation, onChange, onValidationChange]);

  // Render visual node
  const renderVisualNode = (node: VisualRuleNode) => {
    return (
      <ContextMenu key={node.id}>
        <ContextMenuTrigger>
          <div
            className={`absolute border-2 rounded-lg shadow-md cursor-pointer transition-all hover:shadow-lg ${
              node.data.color || 'bg-white border-gray-300'
            } ${node.isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
            style={{
              left: node.position.x,
              top: node.position.y,
              width: node.size.width,
              height: node.size.height,
              transform: `scale(${canvasState.zoom})`
            }}
            onClick={(e) => handleNodeSelect(node.id, e.ctrlKey || e.metaKey)}
            onMouseDown={(e) => {
              if (visualMode === 'select') {
                dragState.current.isDragging = true;
                dragState.current.startPos = { x: e.clientX, y: e.clientY };
              }
            }}
          >
            <div className="p-3 h-full flex flex-col justify-center">
              <div className="flex items-center space-x-2 mb-1">
                {node.type === 'condition' && <Target className="h-4 w-4" />}
                {node.type === 'group' && <GitBranch className="h-4 w-4" />}
                <span className="font-medium text-sm truncate">{node.data.label}</span>
                {!node.data.isValid && <AlertCircle className="h-4 w-4 text-red-500" />}
                {node.data.isValid && <CheckCircle className="h-4 w-4 text-green-500" />}
              </div>
              
              {node.type === 'condition' && (
                <div className="text-xs text-muted-foreground">
                  {node.data.attribute || 'No attribute selected'}
                </div>
              )}
              
              {node.type === 'group' && (
                <Badge variant="secondary" className="text-xs w-fit">
                  {node.data.logicalOperator} Group
                </Badge>
              )}
            </div>
            
            {/* Connection points */}
            {visualMode === 'connect' && (
              <>
                <div className="absolute -left-2 top-1/2 w-4 h-4 bg-white border-2 border-blue-400 rounded-full transform -translate-y-1/2 hover:bg-blue-100 cursor-crosshair" />
                <div className="absolute -right-2 top-1/2 w-4 h-4 bg-white border-2 border-blue-400 rounded-full transform -translate-y-1/2 hover:bg-blue-100 cursor-crosshair" />
              </>
            )}
          </div>
        </ContextMenuTrigger>
        
        <ContextMenuContent>
          <ContextMenuItem onClick={() => handleNodeSelect(node.id)}>
            Select Node
          </ContextMenuItem>
          <ContextMenuItem onClick={() => {
            // Clone node logic
            const clonedCondition = { ...conditions.find(c => c.id === node.id)!, id: generateId() };
            setConditions(prev => [...prev, clonedCondition]);
          }}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </ContextMenuItem>
          <ContextMenuItem onClick={() => deleteCondition(node.id)} className="text-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  return (
    <div className="space-y-4">
      {/* Enhanced Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Workflow className="h-5 w-5" />
                <span>Advanced Rule Builder</span>
                {validation.isValid ? (
                  <Badge variant="default">Valid</Badge>
                ) : (
                  <Badge variant="destructive">
                    {validation.errors.length} Error{validation.errors.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Build complex policy rules with visual editing, templates, and real-time testing
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Editor Mode Switcher */}
              <div className="flex border rounded-lg">
                <Button
                  variant={editorMode === 'form' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setEditorMode('form')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Form
                </Button>
                {enableVisualMode && (
                  <Button
                    variant={editorMode === 'visual' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setEditorMode('visual')}
                  >
                    <Workflow className="h-4 w-4 mr-2" />
                    Visual
                  </Button>
                )}
                <Button
                  variant={editorMode === 'code' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setEditorMode('code')}
                >
                  <Code className="h-4 w-4 mr-2" />
                  Code
                </Button>
              </div>
              
              {/* Action Buttons */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={createCondition}>
                    <Target className="h-4 w-4 mr-2" />
                    Add Condition
                  </DropdownMenuItem>
                  {allowNesting && (
                    <DropdownMenuItem onClick={createGroup}>
                      <GitBranch className="h-4 w-4 mr-2" />
                      Add Group
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {showTemplates && (
                    <DropdownMenuItem onClick={() => setShowTemplateDialog(true)}>
                      <Save className="h-4 w-4 mr-2" />
                      Apply Template
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {enableTestMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testRule}
                  disabled={isTestMode || !validation.isValid}
                >
                  {isTestMode ? (
                    <Square className="h-4 w-4 mr-2 animate-pulse" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {isTestMode ? 'Testing...' : 'Test Rule'}
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Advanced Options
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowPerformanceMetrics(!showPerformanceMetrics)}>
                    <Zap className="h-4 w-4 mr-2" />
                    Performance Metrics
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Export Rule
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Rule
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        {/* Quick Stats */}
        <CardContent className="pt-0">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{conditions.length}</div>
              <div className="text-xs text-muted-foreground">Total Conditions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {conditions.filter(c => c.isValid).length}
              </div>
              <div className="text-xs text-muted-foreground">Valid</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {validation.errors.length}
              </div>
              <div className="text-xs text-muted-foreground">Errors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {validation.warnings.length}
              </div>
              <div className="text-xs text-muted-foreground">Warnings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Editor Content */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={editorMode} className="w-full">
            {/* Form Editor */}
            <TabsContent value="form" className="p-6">
              <div className="space-y-6">
                {conditions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="font-semibold mb-2">No conditions defined</h3>
                    <p className="mb-4">Create your first condition to get started</p>
                    <Button onClick={createCondition}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Condition
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conditions.map(condition => (
                      <ConditionFormEditor
                        key={condition.id}
                        condition={condition}
                        availableAttributes={availableAttributes}
                        onUpdate={updateCondition}
                        onDelete={deleteCondition}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Visual Editor */}
            {enableVisualMode && (
              <TabsContent value="visual" className="p-0">
                <div className="h-96 relative overflow-hidden border-t">
                  {/* Visual Editor Toolbar */}
                  <div className="absolute top-4 left-4 z-10 bg-background border rounded-lg p-2 shadow-lg">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant={visualMode === 'select' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setVisualMode('select')}
                      >
                        <MousePointer className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={visualMode === 'connect' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setVisualMode('connect')}
                      >
                        <Link className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCanvasState(prev => ({ ...prev, showGrid: !prev.showGrid }))}
                      >
                        <Grid className={`h-4 w-4 ${canvasState.showGrid ? 'text-primary' : ''}`} />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Zoom Controls */}
                  <div className="absolute top-4 right-4 z-10 bg-background border rounded-lg p-2 shadow-lg">
                    <div className="flex flex-col space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCanvasState(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 3) }))}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCanvasState(prev => ({ ...prev, zoom: Math.max(prev.zoom * 0.8, 0.25) }))}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCanvasState(prev => ({ ...prev, zoom: 1, pan: { x: 0, y: 0 } }))}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Canvas */}
                  <div
                    ref={canvasRef}
                    className="w-full h-full relative cursor-move"
                    style={{
                      backgroundImage: canvasState.showGrid 
                        ? `radial-gradient(circle, #e2e8f0 1px, transparent 1px)`
                        : 'none',
                      backgroundSize: `${canvasState.gridSize * canvasState.zoom}px ${canvasState.gridSize * canvasState.zoom}px`,
                      backgroundPosition: `${canvasState.pan.x}px ${canvasState.pan.y}px`
                    }}
                  >
                    {visualNodes.map(renderVisualNode)}
                    
                    {visualNodes.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <h3 className="font-semibold mb-2">Visual Rule Builder</h3>
                          <p className="mb-4">Add conditions to see them in the visual editor</p>
                          <Button onClick={createCondition}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Condition
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Canvas Status */}
                  <div className="absolute bottom-4 left-4 bg-background border rounded px-3 py-1 text-sm">
                    Zoom: {Math.round(canvasState.zoom * 100)}% | Nodes: {visualNodes.length} | Mode: {visualMode}
                  </div>
                </div>
              </TabsContent>
            )}

            {/* Code Editor */}
            <TabsContent value="code" className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Generated Rule Expression</Label>
                  <Badge variant="outline" className="text-xs">
                    Read-only
                  </Badge>
                </div>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto">
                    {generateCode() || '// No conditions defined'}
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => navigator.clipboard.writeText(generateCode())}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Rule Analysis */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Complexity Score</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Progress value={Math.min(conditions.length * 10, 100)} className="flex-1" />
                      <span className="text-sm text-muted-foreground">
                        {Math.min(conditions.length * 10, 100)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">Estimated Evaluation Time</Label>
                    <div className="text-lg font-semibold mt-1">
                      {Math.floor(conditions.length * 5 + 20)}ms
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TestTube className="h-5 w-5" />
              <span>Test Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${testResults.success ? 'text-green-600' : 'text-red-600'}`}>
                  {testResults.success ? 'PASS' : 'FAIL'}
                </div>
                <div className="text-xs text-muted-foreground">Result</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{testResults.evaluationTime}ms</div>
                <div className="text-xs text-muted-foreground">Evaluation Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{testResults.conditionsEvaluated}</div>
                <div className="text-xs text-muted-foreground">Conditions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{testResults.passedConditions}</div>
                <div className="text-xs text-muted-foreground">Passed</div>
              </div>
            </div>
            
            <div className="space-y-2">
              {testResults.details.map((detail: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">Condition {index + 1}</span>
                  <div className="flex items-center space-x-2">
                    {detail.passed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-xs text-muted-foreground">{detail.evaluationTime}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Advanced Rule Templates</DialogTitle>
            <DialogDescription>
              Choose from pre-built templates with complex rule logic and visual layouts
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {advancedRuleTemplates.map(template => (
                <Card key={template.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
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
                    <div className="space-y-2 mb-4">
                      <div className="text-sm font-medium">Conditions ({template.conditions.length}):</div>
                      {template.conditions.slice(0, 2).map((condition, idx) => (
                        <div key={idx} className="text-xs font-mono bg-muted p-2 rounded">
                          {condition.attribute} {condition.operator} {JSON.stringify(condition.value)}
                        </div>
                      ))}
                      {template.conditions.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{template.conditions.length - 2} more conditions...
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button 
                      onClick={() => applyTemplate(template)}
                      className="w-full"
                      size="sm"
                    >
                      Apply Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Individual condition form editor component
interface ConditionFormEditorProps {
  condition: ConditionNode;
  availableAttributes: AttributeDefinition[];
  onUpdate: (nodeId: string, updates: Partial<ConditionNode>) => void;
  onDelete: (nodeId: string) => void;
}

function ConditionFormEditor({
  condition,
  availableAttributes,
  onUpdate,
  onDelete
}: ConditionFormEditorProps) {
  const selectedAttribute = useMemo(() => {
    return availableAttributes.find(attr => attr.path === condition.attribute);
  }, [availableAttributes, condition.attribute]);

  const availableOperators = useMemo(() => {
    if (!selectedAttribute) return [];
    return DEFAULT_OPERATORS_BY_TYPE[selectedAttribute.dataType] || [];
  }, [selectedAttribute]);

  const handleAttributeChange = (attributePath: string) => {
    onUpdate(condition.id, {
      attribute: attributePath,
      operator: undefined,
      value: undefined,
      isValid: false
    });
  };

  const handleOperatorChange = (operator: Operator) => {
    onUpdate(condition.id, {
      operator,
      value: undefined,
      isValid: false
    });
  };

  const handleValueChange = (value: any) => {
    const isValid = !!(condition.attribute && condition.operator && value !== undefined && value !== '');
    onUpdate(condition.id, {
      value,
      isValid
    });
  };

  return (
    <Card className={`border-l-4 ${condition.isValid ? 'border-l-green-500' : 'border-l-red-500'}`}>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="space-y-2">
            <Label className="text-sm">Attribute</Label>
            <Select value={condition.attribute} onValueChange={handleAttributeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select attribute" />
              </SelectTrigger>
              <SelectContent>
                {availableAttributes.map(attr => (
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

          <div className="space-y-2">
            <Label className="text-sm">Operator</Label>
            <Select value={condition.operator} onValueChange={handleOperatorChange} disabled={!condition.attribute}>
              <SelectTrigger>
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                {availableOperators.map(op => (
                  <SelectItem key={op} value={op}>
                    {op}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Value</Label>
            <Input
              placeholder="Enter value"
              value={condition.value || ''}
              onChange={(e) => handleValueChange(e.target.value)}
              disabled={!condition.operator}
            />
          </div>

          <div className="flex items-end space-x-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(condition.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {condition.isValid ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm text-muted-foreground">
              {condition.isValid ? 'Valid condition' : 'Complete all fields to validate'}
            </span>
          </div>
          
          {selectedAttribute && (
            <div className="text-xs text-muted-foreground">
              Type: {selectedAttribute.dataType}
            </div>
          )}
        </div>

        {selectedAttribute && (
          <div className="mt-3 text-xs text-muted-foreground p-2 bg-muted rounded">
            {selectedAttribute.description}
          </div>
        )}
      </CardContent>
    </Card>
  );
}