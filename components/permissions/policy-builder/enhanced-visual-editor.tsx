'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from '@hello-pangea/dnd';
import {
  Save,
  X,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  TestTube,
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
  BarChart3,
  RefreshCw,
  Minimize2,
  Maximize2,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  FileText,
  Globe,
  Zap,
  Settings,
  Code,
  Target,
  Filter,
  GitBranch
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { 
  VisualPolicyEditorProps,
  PolicyBuilderState,
  PolicyEditorNode,
  PolicyEditorState,
  PolicyBuilderStep,
  AttributeDefinition
} from '@/lib/types/policy-builder';
import { EffectType, LogicalOperator } from '@/lib/types/permissions';
import { AttributeInspector } from './attribute-inspector';
import { RuleConditionBuilder } from './rule-condition-builder';
import { allAttributes } from '@/lib/mock-data/policy-builder-attributes';

// Enhanced Policy Node Types
interface VisualPolicyNode {
  id: string;
  type: 'subject' | 'resource' | 'action' | 'environment' | 'rule' | 'operator' | 'connector';
  position: { x: number; y: number };
  size: { width: number; height: number };
  data: {
    label: string;
    conditions?: any[];
    actions?: string[];
    operator?: LogicalOperator;
    isValid: boolean;
    errors?: string[];
    description?: string;
    icon?: any;
    color?: string;
  };
  connections: {
    inputs: string[];
    outputs: string[];
  };
}

interface VisualEditorMode {
  mode: 'select' | 'connect' | 'draw' | 'drag';
  isConnecting: boolean;
  connectionStart?: string;
}

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

const nodeTypes = [
  {
    type: 'subject',
    label: 'Subject',
    icon: User,
    color: 'bg-blue-100 border-blue-300 text-blue-700',
    description: 'Who can access the resource'
  },
  {
    type: 'resource',
    label: 'Resource',
    icon: FileText,
    color: 'bg-green-100 border-green-300 text-green-700',
    description: 'What is being accessed'
  },
  {
    type: 'action',
    label: 'Action',
    icon: Zap,
    color: 'bg-yellow-100 border-yellow-300 text-yellow-700',
    description: 'What action is being performed'
  },
  {
    type: 'environment',
    label: 'Environment',
    icon: Globe,
    color: 'bg-purple-100 border-purple-300 text-purple-700',
    description: 'When and where the access occurs'
  },
  {
    type: 'rule',
    label: 'Rule',
    icon: Filter,
    color: 'bg-orange-100 border-orange-300 text-orange-700',
    description: 'Complex condition logic'
  },
  {
    type: 'operator',
    label: 'Operator',
    icon: GitBranch,
    color: 'bg-gray-100 border-gray-300 text-gray-700',
    description: 'Logical AND/OR/NOT operator'
  }
];

export function EnhancedVisualPolicyEditor({
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
  
  const [visualNodes, setVisualNodes] = useState<VisualPolicyNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<VisualEditorMode>({ 
    mode: 'select', 
    isConnecting: false 
  });
  
  const [canvasState, setCanvasState] = useState({
    zoom: 1,
    pan: { x: 0, y: 0 },
    showGrid: true,
    snapToGrid: true,
    gridSize: 20
  });
  
  const [showSidebar, setShowSidebar] = useState(true);
  const [showInspector, setShowInspector] = useState(true);
  const [activeTab, setActiveTab] = useState('design');
  const [testResults, setTestResults] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ isDragging: false, dragNode: null as VisualPolicyNode | null });

  // Initialize canvas with default nodes
  useEffect(() => {
    if (visualNodes.length === 0) {
      const defaultNodes = createDefaultNodes();
      setVisualNodes(defaultNodes);
    }
  }, [visualNodes.length]);

  // Create default visual nodes
  const createDefaultNodes = (): VisualPolicyNode[] => {
    const nodes: VisualPolicyNode[] = [];
    let yPos = 100;
    
    if (policy.subjectConditions.length > 0) {
      nodes.push(createNodeFromData('subject', { x: 100, y: yPos }, policy.subjectConditions));
      yPos += 120;
    }
    
    if (policy.resourceConditions.length > 0) {
      nodes.push(createNodeFromData('resource', { x: 100, y: yPos }, policy.resourceConditions));
      yPos += 120;
    }
    
    if (policy.actionConditions.length > 0) {
      nodes.push(createNodeFromData('action', { x: 100, y: yPos }, policy.actionConditions));
      yPos += 120;
    }
    
    if (policy.environmentConditions.length > 0) {
      nodes.push(createNodeFromData('environment', { x: 100, y: yPos }, policy.environmentConditions));
    }
    
    return nodes;
  };

  const createNodeFromData = (
    type: VisualPolicyNode['type'], 
    position: { x: number; y: number }, 
    data: any
  ): VisualPolicyNode => {
    const nodeType = nodeTypes.find(nt => nt.type === type);
    return {
      id: `${type}-${Date.now()}`,
      type,
      position,
      size: { width: 200, height: 80 },
      data: {
        label: nodeType?.label || type,
        conditions: Array.isArray(data) ? data : [],
        isValid: true,
        icon: nodeType?.icon,
        color: nodeType?.color,
        description: nodeType?.description
      },
      connections: {
        inputs: [],
        outputs: []
      }
    };
  };

  // Handle node drag and drop
  const handleNodeDrag = useCallback((nodeId: string, newPosition: { x: number; y: number }) => {
    setVisualNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { 
            ...node, 
            position: canvasState.snapToGrid 
              ? {
                  x: Math.round(newPosition.x / canvasState.gridSize) * canvasState.gridSize,
                  y: Math.round(newPosition.y / canvasState.gridSize) * canvasState.gridSize
                }
              : newPosition
          }
        : node
    ));
  }, [canvasState.snapToGrid, canvasState.gridSize]);

  // Handle adding new nodes from palette
  const addNodeToCanvas = (nodeType: string) => {
    const nodeTypeInfo = nodeTypes.find(nt => nt.type === nodeType);
    if (!nodeTypeInfo) return;

    const newNode: VisualPolicyNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType as VisualPolicyNode['type'],
      position: { 
        x: 300 + Math.random() * 200, 
        y: 200 + Math.random() * 200 
      },
      size: { width: 200, height: 80 },
      data: {
        label: nodeTypeInfo.label,
        conditions: [],
        isValid: true,
        icon: nodeTypeInfo.icon,
        color: nodeTypeInfo.color,
        description: nodeTypeInfo.description
      },
      connections: {
        inputs: [],
        outputs: []
      }
    };

    setVisualNodes(prev => [...prev, newNode]);
  };

  // Handle node selection
  const selectNode = (nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  };

  // Handle node deletion
  const deleteNode = (nodeId: string) => {
    setVisualNodes(prev => prev.filter(node => node.id !== nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  };

  // Handle policy validation
  const validatePolicy = async () => {
    setIsValidating(true);
    try {
      // Convert visual nodes back to policy state
      const updatedPolicy = convertNodesToPolicy(visualNodes);
      
      // Call validation API
      const response = await fetch('/api/policy-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyBuilderState: updatedPolicy,
          validationLevel: 'comprehensive'
        })
      });

      const result = await response.json();
      
      // Update node validation states
      if (result.success) {
        updateNodeValidationStates(result.data);
      }
      
      return result.data;
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  // Convert visual nodes to policy state
  const convertNodesToPolicy = (nodes: VisualPolicyNode[]): PolicyBuilderState => {
    const updatedPolicy = { ...policy };
    
    nodes.forEach(node => {
      switch (node.type) {
        case 'subject':
          updatedPolicy.subjectConditions = node.data.conditions || [];
          break;
        case 'resource':
          updatedPolicy.resourceConditions = node.data.conditions || [];
          break;
        case 'action':
          updatedPolicy.actionConditions = node.data.actions || [];
          break;
        case 'environment':
          updatedPolicy.environmentConditions = node.data.conditions || [];
          break;
      }
    });
    
    return updatedPolicy;
  };

  // Update node validation states
  const updateNodeValidationStates = (validation: any) => {
    setVisualNodes(prev => prev.map(node => ({
      ...node,
      data: {
        ...node.data,
        isValid: validation.isValid,
        errors: validation.errors?.filter((err: any) => err.field === node.type) || []
      }
    })));
  };

  // Test policy with scenarios
  const testPolicy = async () => {
    try {
      const policyToTest = convertNodesToPolicy(visualNodes);
      
      const response = await fetch('/api/policies/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policy: policyToTest,
          testScenarios: policy.testScenarios
        })
      });

      const result = await response.json();
      setTestResults(result.data);
      setActiveTab('test');
    } catch (error) {
      console.error('Test error:', error);
    }
  };

  // Handle save
  const handleSave = async () => {
    const validation = await validatePolicy();
    if (validation?.isValid) {
      const finalPolicy = convertNodesToPolicy(visualNodes);
      onSave(finalPolicy);
    }
  };

  // Render visual node
  const renderVisualNode = (node: VisualPolicyNode) => {
    const Icon = node.data.icon || FileText;
    const isSelected = selectedNodeId === node.id;
    
    return (
      <div
        key={node.id}
        className={`absolute border-2 rounded-lg shadow-md cursor-pointer transition-all hover:shadow-lg ${
          node.data.color || 'bg-white border-gray-300'
        } ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''} ${
          !node.data.isValid ? 'border-red-400 bg-red-50' : ''
        }`}
        style={{
          left: node.position.x,
          top: node.position.y,
          width: node.size.width,
          height: node.size.height
        }}
        onClick={() => selectNode(node.id)}
        onMouseDown={(e) => {
          if (editorMode.mode === 'drag' || e.shiftKey) {
            dragState.current.isDragging = true;
            dragState.current.dragNode = node;
          }
        }}
      >
        <div className="p-3 h-full flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <Icon className="h-4 w-4" />
            <span className="font-medium text-sm">{node.data.label}</span>
            {!node.data.isValid && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          
          <div className="flex-1 text-xs text-muted-foreground">
            {node.data.description}
          </div>
          
          {node.data.conditions && node.data.conditions.length > 0 && (
            <Badge variant="secondary" className="text-xs mt-1">
              {node.data.conditions.length} condition{node.data.conditions.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        
        {/* Connection points */}
        <div className="absolute -left-2 top-1/2 w-4 h-4 bg-white border-2 border-gray-400 rounded-full transform -translate-y-1/2" />
        <div className="absolute -right-2 top-1/2 w-4 h-4 bg-white border-2 border-gray-400 rounded-full transform -translate-y-1/2" />
      </div>
    );
  };

  // Handle canvas mouse events
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (dragState.current.isDragging && dragState.current.dragNode) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const newPos = {
          x: (e.clientX - rect.left - canvasState.pan.x) / canvasState.zoom,
          y: (e.clientY - rect.top - canvasState.pan.y) / canvasState.zoom
        };
        handleNodeDrag(dragState.current.dragNode.id, newPos);
      }
    }
  };

  const handleCanvasMouseUp = () => {
    dragState.current.isDragging = false;
    dragState.current.dragNode = null;
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header Toolbar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">Visual Policy Designer</h2>
            {policy.name && <Badge variant="outline">{policy.name}</Badge>}
          </div>

          <div className="flex items-center space-x-1">
            <TooltipProvider>
              {/* Editor Mode Controls */}
              <div className="flex items-center border rounded-md">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={editorMode.mode === 'select' ? 'default' : 'ghost'} 
                      size="sm"
                      onClick={() => setEditorMode({ mode: 'select', isConnecting: false })}
                    >
                      <MousePointer className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Select Mode</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={editorMode.mode === 'drag' ? 'default' : 'ghost'} 
                      size="sm"
                      onClick={() => setEditorMode({ mode: 'drag', isConnecting: false })}
                    >
                      <Move className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Drag Mode</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={editorMode.mode === 'connect' ? 'default' : 'ghost'} 
                      size="sm"
                      onClick={() => setEditorMode({ mode: 'connect', isConnecting: false })}
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Connect Mode</TooltipContent>
                </Tooltip>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Canvas Controls */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => setCanvasState(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 3) }))}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom In</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => setCanvasState(prev => ({ ...prev, zoom: Math.max(prev.zoom * 0.8, 0.25) }))}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom Out</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => setCanvasState(prev => ({ ...prev, zoom: 1, pan: { x: 0, y: 0 } }))}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset View</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => setCanvasState(prev => ({ ...prev, showGrid: !prev.showGrid }))}>
                    <Grid className={`h-4 w-4 ${canvasState.showGrid ? 'text-primary' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle Grid</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6" />

              {/* Action Controls */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={validatePolicy} disabled={isValidating}>
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Validate Policy</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={testPolicy}>
                    <TestTube className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Test Policy</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6" />

              {/* Panel Controls */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => setShowSidebar(!showSidebar)}>
                    {showSidebar ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle Sidebar</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6" />

              {/* Save/Cancel */}
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
            </TooltipProvider>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Node Palette */}
        {showSidebar && (
          <div className="w-80 border-r bg-muted/20">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="test">Test</TabsTrigger>
              </TabsList>

              <TabsContent value="design" className="p-4 space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Node Palette</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {nodeTypes.map(nodeType => {
                      const Icon = nodeType.icon;
                      return (
                        <Button
                          key={nodeType.type}
                          variant="outline"
                          className="justify-start h-auto p-3"
                          onClick={() => addNodeToCanvas(nodeType.type)}
                          disabled={readonly}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded ${nodeType.color}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium">{nodeType.label}</div>
                              <div className="text-xs text-muted-foreground">{nodeType.description}</div>
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Canvas Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="snap-to-grid" className="text-sm">Snap to Grid</Label>
                      <Switch
                        id="snap-to-grid"
                        checked={canvasState.snapToGrid}
                        onCheckedChange={(checked) => 
                          setCanvasState(prev => ({ ...prev, snapToGrid: checked }))
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Grid Size</Label>
                      <Slider
                        value={[canvasState.gridSize]}
                        onValueChange={([value]) => 
                          setCanvasState(prev => ({ ...prev, gridSize: value }))
                        }
                        min={10}
                        max={50}
                        step={5}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Zoom: {Math.round(canvasState.zoom * 100)}%</Label>
                      <Slider
                        value={[canvasState.zoom]}
                        onValueChange={([value]) => 
                          setCanvasState(prev => ({ ...prev, zoom: value }))
                        }
                        min={0.25}
                        max={3}
                        step={0.25}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="properties" className="p-4">
                {selectedNodeId ? (
                  <NodePropertiesPanel 
                    node={visualNodes.find(n => n.id === selectedNodeId)!}
                    onNodeUpdate={(updatedNode) => {
                      setVisualNodes(prev => prev.map(n => 
                        n.id === updatedNode.id ? updatedNode : n
                      ));
                    }}
                    readonly={readonly}
                  />
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Layout className="h-8 w-8 mx-auto mb-2" />
                    <p>Select a node to view properties</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="test" className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Policy Testing</h3>
                    <Button size="sm" onClick={testPolicy}>
                      <Play className="h-4 w-4 mr-2" />
                      Run Tests
                    </Button>
                  </div>
                  
                  {testResults ? (
                    <div className="space-y-2">
                      <div className={`p-3 rounded-lg ${
                        testResults.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-center space-x-2">
                          {testResults.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium">
                            {testResults.success ? 'Tests Passed' : 'Tests Failed'}
                          </span>
                        </div>
                      </div>
                      
                      {testResults.details && (
                        <ScrollArea className="h-48">
                          <pre className="text-xs bg-muted p-2 rounded">
                            {JSON.stringify(testResults.details, null, 2)}
                          </pre>
                        </ScrollArea>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <TestTube className="h-8 w-8 mx-auto mb-2" />
                      <p>Run tests to see results</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full relative"
            style={{
              transform: `scale(${canvasState.zoom}) translate(${canvasState.pan.x}px, ${canvasState.pan.y}px)`,
              transformOrigin: '0 0',
              backgroundImage: canvasState.showGrid 
                ? `radial-gradient(circle, #e2e8f0 1px, transparent 1px)`
                : 'none',
              backgroundSize: `${canvasState.gridSize}px ${canvasState.gridSize}px`
            }}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
          >
            {/* Render visual nodes */}
            {visualNodes.map(node => renderVisualNode(node))}
            
            {/* Connection lines would be rendered here */}
          </div>

          {/* Canvas status bar */}
          <div className="absolute bottom-4 left-4 bg-background border rounded-lg px-3 py-1 text-sm">
            Zoom: {Math.round(canvasState.zoom * 100)}% | Nodes: {visualNodes.length} | Mode: {editorMode.mode}
          </div>
        </div>

        {/* Inspector Panel */}
        {showInspector && (
          <div className="w-80 border-l">
            <AttributeInspector
              onAttributeSelect={(attribute) => {
                console.log('Selected attribute:', attribute);
                // Handle attribute selection for selected node
              }}
              showSearch={true}
              showFavorites={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Node Properties Panel Component
interface NodePropertiesPanelProps {
  node: VisualPolicyNode;
  onNodeUpdate: (node: VisualPolicyNode) => void;
  readonly?: boolean;
}

function NodePropertiesPanel({ node, onNodeUpdate, readonly = false }: NodePropertiesPanelProps) {
  const updateNodeData = (updates: Partial<VisualPolicyNode['data']>) => {
    onNodeUpdate({
      ...node,
      data: { ...node.data, ...updates }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-3">{node.data.label} Properties</h3>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="node-label">Label</Label>
          <Input
            id="node-label"
            value={node.data.label}
            onChange={(e) => updateNodeData({ label: e.target.value })}
            disabled={readonly}
          />
        </div>

        <div>
          <Label htmlFor="node-description">Description</Label>
          <Textarea
            id="node-description"
            value={node.data.description || ''}
            onChange={(e) => updateNodeData({ description: e.target.value })}
            rows={3}
            disabled={readonly}
          />
        </div>

        <div>
          <Label>Position</Label>
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="X"
              value={node.position.x}
              onChange={(e) => onNodeUpdate({ 
                ...node, 
                position: { ...node.position, x: parseInt(e.target.value) || 0 } 
              })}
              disabled={readonly}
            />
            <Input
              type="number"
              placeholder="Y"
              value={node.position.y}
              onChange={(e) => onNodeUpdate({ 
                ...node, 
                position: { ...node.position, y: parseInt(e.target.value) || 0 } 
              })}
              disabled={readonly}
            />
          </div>
        </div>

        {node.data.conditions && (
          <div>
            <Label>Conditions</Label>
            <div className="text-sm text-muted-foreground">
              {node.data.conditions.length} condition{node.data.conditions.length !== 1 ? 's' : ''} defined
            </div>
            <Button variant="outline" size="sm" className="mt-2" disabled={readonly}>
              <Plus className="h-4 w-4 mr-2" />
              Add Condition
            </Button>
          </div>
        )}

        {!node.data.isValid && node.data.errors && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Validation Errors</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {node.data.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}