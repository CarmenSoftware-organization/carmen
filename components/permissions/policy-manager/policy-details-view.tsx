'use client';

import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Edit, 
  Copy, 
  Clock, 
  User, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Activity,
  Target,
  Settings,
  FileText,
  Calendar,
  MapPin,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  ChevronRight,
  ChevronDown,
  Info,
  AlertCircle,
  Archive,
  GitBranch
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Policy, EffectType, Rule, AttributeCondition, Obligation, Advice } from '@/lib/types/permissions';
import { ResourceType } from '@/lib/types/permission-resources';
import { PolicyTestModal } from './policy-test-modal';

interface PolicyDetailsViewProps {
  policy: Policy;
  onEdit?: () => void;
  onClone?: () => void;
  onToggleStatus?: (enabled: boolean) => void;
  onTest?: () => void;
  className?: string;
}

// Mock performance data - in real app would come from API
const mockPolicyMetrics = {
  evaluationsLast30Days: 1247,
  averageEvaluationTime: 12.5, // ms
  successRate: 98.6,
  deniedRequests: 18,
  permittedRequests: 1229,
  peakUsageHour: 14,
  coverageScore: 85,
  conflictCount: 0,
  lastTriggered: new Date('2024-01-15T14:32:00'),
  performanceTrend: 'stable', // 'improving' | 'declining' | 'stable'
  ruleEvaluationBreakdown: [
    { ruleId: 'rule-proc-001-1', evaluations: 847, successRate: 99.2, avgTime: 8.5 },
    { ruleId: 'rule-proc-001-2', evaluations: 400, successRate: 97.5, avgTime: 15.2 }
  ],
  recentEvaluations: [
    { timestamp: new Date('2024-01-15T14:32:00'), result: 'permit', userId: 'user-123', resourceId: 'pr-456' },
    { timestamp: new Date('2024-01-15T14:28:00'), result: 'permit', userId: 'user-124', resourceId: 'pr-457' },
    { timestamp: new Date('2024-01-15T14:25:00'), result: 'deny', userId: 'user-125', resourceId: 'pr-458' }
  ]
};

// Mock version history
const mockVersionHistory = [
  { version: '1.2', createdAt: new Date('2024-01-10'), createdBy: 'john.doe', changes: 'Updated approval thresholds', current: true },
  { version: '1.1', createdAt: new Date('2024-01-01'), createdBy: 'admin', changes: 'Added new rule for department validation', current: false },
  { version: '1.0', createdAt: new Date('2023-12-15'), createdBy: 'system', changes: 'Initial policy creation', current: false }
];

export function PolicyDetailsView({ 
  policy, 
  onEdit, 
  onClone, 
  onToggleStatus, 
  onTest,
  className 
}: PolicyDetailsViewProps) {
  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('overview');
  const [showTestModal, setShowTestModal] = useState(false);

  const toggleExpanded = (key: string) => {
    setIsExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getEffectBadge = (effect: EffectType) => (
    <Badge variant={effect === 'permit' ? 'default' : 'destructive'} className="text-xs">
      {effect === 'permit' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
      {effect.toUpperCase()}
    </Badge>
  );

  const getStatusBadge = (enabled: boolean) => (
    <Badge variant={enabled ? 'default' : 'secondary'} className="text-xs">
      {enabled ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
      {enabled ? 'Active' : 'Disabled'}
    </Badge>
  );

  const getPerformanceTrendIcon = () => {
    switch (mockPolicyMetrics.performanceTrend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderRuleVisualization = (rule: Rule) => (
    <Card key={rule.id} className="mb-3">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">{rule.description}</CardTitle>
            <CardDescription className="text-xs">Rule ID: {rule.id}</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {rule.condition.type === 'simple' ? 'Simple' : 'Composite'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {rule.condition.type === 'simple' ? (
            <div className="flex items-center space-x-2 text-sm bg-muted/50 p-2 rounded">
              <code className="bg-background px-1 rounded text-xs">{rule.condition.attribute}</code>
              <Badge variant="secondary" className="text-xs">{rule.condition.operator}</Badge>
              <code className="bg-background px-1 rounded text-xs">{String(rule.condition.value)}</code>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">{rule.condition.logicalOperator}</Badge>
                <span className="text-xs text-muted-foreground">
                  {rule.condition.expressions?.length} conditions
                </span>
              </div>
              {rule.condition.expressions?.map((expr, idx) => (
                <div key={idx} className="ml-4 flex items-center space-x-2 text-sm bg-muted/50 p-2 rounded">
                  <code className="bg-background px-1 rounded text-xs">{expr.attribute}</code>
                  <Badge variant="secondary" className="text-xs">{expr.operator}</Badge>
                  <code className="bg-background px-1 rounded text-xs">{String(expr.value)}</code>
                </div>
              ))}
            </div>
          )}
          
          {/* Rule Performance Metrics */}
          {mockPolicyMetrics.ruleEvaluationBreakdown.find(r => r.ruleId === rule.id) && (
            <div className="mt-3 pt-3 border-t">
              {(() => {
                const ruleMetrics = mockPolicyMetrics.ruleEvaluationBreakdown.find(r => r.ruleId === rule.id)!;
                return (
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <div className="text-muted-foreground">Evaluations</div>
                      <div className="font-semibold">{ruleMetrics.evaluations.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Success Rate</div>
                      <div className="font-semibold text-green-600">{ruleMetrics.successRate}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Avg Time</div>
                      <div className="font-semibold">{ruleMetrics.avgTime}ms</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderTargetConditions = () => {
    const { subjects, resources, actions, environment } = policy.target;

    return (
      <div className="space-y-4">
        {/* Subject Conditions */}
        {subjects && subjects.length > 0 && (
          <Collapsible open={isExpanded['subjects']} onOpenChange={() => toggleExpanded('subjects')}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Subject Conditions ({subjects.length})</span>
                </div>
                {isExpanded['subjects'] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="space-y-2">
                {subjects.map((condition, idx) => (
                  <div key={idx} className="flex items-center space-x-2 p-3 bg-blue-50 rounded-md">
                    <User className="w-4 h-4 text-blue-600" />
                    <code className="bg-white px-2 py-1 rounded text-sm">{condition.attribute}</code>
                    <Badge variant="secondary">{condition.operator}</Badge>
                    <code className="bg-white px-2 py-1 rounded text-sm">{String(condition.value)}</code>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Resource Conditions */}
        {resources && resources.length > 0 && (
          <Collapsible open={isExpanded['resources']} onOpenChange={() => toggleExpanded('resources')}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Resource Conditions ({resources.length})</span>
                </div>
                {isExpanded['resources'] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="space-y-2">
                {resources.map((condition, idx) => (
                  <div key={idx} className="flex items-center space-x-2 p-3 bg-green-50 rounded-md">
                    <Shield className="w-4 h-4 text-green-600" />
                    <code className="bg-white px-2 py-1 rounded text-sm">{condition.attribute}</code>
                    <Badge variant="secondary">{condition.operator}</Badge>
                    <code className="bg-white px-2 py-1 rounded text-sm">{String(condition.value)}</code>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Action Conditions */}
        {actions && actions.length > 0 && (
          <Collapsible open={isExpanded['actions']} onOpenChange={() => toggleExpanded('actions')}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Allowed Actions ({actions.length})</span>
                </div>
                {isExpanded['actions'] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="flex flex-wrap gap-2">
                {actions.map((action, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    <Activity className="w-3 h-3 mr-1" />
                    {action}
                  </Badge>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Environment Conditions */}
        {environment && environment.length > 0 && (
          <Collapsible open={isExpanded['environment']} onOpenChange={() => toggleExpanded('environment')}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Environment Conditions ({environment.length})</span>
                </div>
                {isExpanded['environment'] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="space-y-2">
                {environment.map((condition, idx) => (
                  <div key={idx} className="flex items-center space-x-2 p-3 bg-purple-50 rounded-md">
                    <Settings className="w-4 h-4 text-purple-600" />
                    <code className="bg-white px-2 py-1 rounded text-sm">{condition.attribute}</code>
                    <Badge variant="secondary">{condition.operator}</Badge>
                    <code className="bg-white px-2 py-1 rounded text-sm">{String(condition.value)}</code>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold">{policy.name}</h1>
              {getStatusBadge(policy.enabled)}
              {getEffectBadge(policy.effect)}
            </div>
            <p className="text-muted-foreground max-w-2xl">{policy.description}</p>
            
            {/* Policy Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4" />
                <span>Priority: {policy.priority}</span>
              </div>
              <div className="flex items-center space-x-1">
                <GitBranch className="w-4 h-4" />
                <span>Version: {policy.version}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>Created by: {policy.createdBy}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(policy.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setShowTestModal(true)}>
                  <Play className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Test Policy</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onClone}>
                  <Copy className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clone Policy</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onToggleStatus?.(!policy.enabled)}
                >
                  {policy.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{policy.enabled ? 'Disable Policy' : 'Enable Policy'}</TooltipContent>
            </Tooltip>

            <Button onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Policy
            </Button>
          </div>
        </div>

        {/* Performance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Evaluations (30d)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{mockPolicyMetrics.evaluationsLast30Days.toLocaleString()}</div>
                {getPerformanceTrendIcon()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Last triggered: {mockPolicyMetrics.lastTriggered.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{mockPolicyMetrics.successRate}%</div>
              <Progress value={mockPolicyMetrics.successRate} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {mockPolicyMetrics.permittedRequests} permits, {mockPolicyMetrics.deniedRequests} denies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockPolicyMetrics.averageEvaluationTime}ms</div>
              <p className="text-xs text-muted-foreground mt-1">Average evaluation time</p>
              <div className="flex items-center mt-2">
                <Activity className="w-3 h-3 mr-1 text-blue-500" />
                <span className="text-xs">Peak: {mockPolicyMetrics.peakUsageHour}:00</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{mockPolicyMetrics.coverageScore}/100</div>
                {mockPolicyMetrics.conflictCount === 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
              </div>
              <Progress value={mockPolicyMetrics.coverageScore} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {mockPolicyMetrics.conflictCount} conflicts detected
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rules">Rules & Logic</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
            <TabsTrigger value="versions">Versions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Policy Structure */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Policy Target Conditions</span>
                </CardTitle>
                <CardDescription>
                  Defines when this policy applies based on subject, resource, action, and environment attributes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderTargetConditions()}
              </CardContent>
            </Card>

            {/* Obligations and Advice */}
            {(policy.obligations && policy.obligations.length > 0) || (policy.advice && policy.advice.length > 0) ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {policy.obligations && policy.obligations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5" />
                        <span>Obligations</span>
                      </CardTitle>
                      <CardDescription>
                        Actions that must be performed when this policy is triggered
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {policy.obligations.map((obligation, idx) => (
                          <div key={idx} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="secondary">{obligation.type}</Badge>
                              <span className="text-xs text-muted-foreground">{obligation.id}</span>
                            </div>
                            {obligation.description && (
                              <p className="text-sm text-muted-foreground mb-2">{obligation.description}</p>
                            )}
                            {obligation.attributes && Object.keys(obligation.attributes).length > 0 && (
                              <div className="text-xs">
                                <div className="font-medium mb-1">Attributes:</div>
                                <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                                  {JSON.stringify(obligation.attributes, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {policy.advice && policy.advice.length > 0 && (
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
                        {policy.advice.map((advice, idx) => (
                          <div key={idx} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline">{advice.type}</Badge>
                              <span className="text-xs text-muted-foreground">{advice.id}</span>
                            </div>
                            <p className="text-sm">{advice.message}</p>
                            {advice.attributes && Object.keys(advice.attributes).length > 0 && (
                              <div className="text-xs mt-2">
                                <div className="font-medium mb-1">Attributes:</div>
                                <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                                  {JSON.stringify(advice.attributes, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : null}

            {/* Tags and Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Categories & Tags</h4>
                    <div className="space-y-2">
                      {policy.category && (
                        <div>
                          <span className="text-sm text-muted-foreground">Category: </span>
                          <Badge variant="outline" className="capitalize">{policy.category}</Badge>
                        </div>
                      )}
                      {policy.tags && policy.tags.length > 0 && (
                        <div>
                          <span className="text-sm text-muted-foreground">Tags: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {policy.tags.map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Lifecycle</h4>
                    <div className="space-y-2 text-sm">
                      {policy.effectiveFrom && (
                        <div>
                          <span className="text-muted-foreground">Effective From: </span>
                          <span>{new Date(policy.effectiveFrom).toLocaleDateString()}</span>
                        </div>
                      )}
                      {policy.effectiveTo && (
                        <div>
                          <span className="text-muted-foreground">Effective To: </span>
                          <span>{new Date(policy.effectiveTo).toLocaleDateString()}</span>
                        </div>
                      )}
                      {policy.updatedBy && policy.updatedAt && (
                        <div>
                          <span className="text-muted-foreground">Last Updated: </span>
                          <span>{new Date(policy.updatedAt).toLocaleDateString()} by {policy.updatedBy}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Policy Rules ({policy.rules.length})</span>
                </CardTitle>
                <CardDescription>
                  Logical conditions that determine when this policy should be applied
                </CardDescription>
              </CardHeader>
              <CardContent>
                {policy.rules.length > 0 ? (
                  <div className="space-y-4">
                    {policy.rules.map(renderRuleVisualization)}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No rules defined for this policy
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Policy Testing Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Test Scenarios */}
                  {policy.testScenarios && policy.testScenarios.length > 0 ? (
                    <div>
                      <h4 className="font-medium mb-3">Test Scenarios ({policy.testScenarios.length})</h4>
                      <div className="space-y-3">
                        {policy.testScenarios.map((scenario, idx) => (
                          <div key={idx} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium">{scenario.name}</h5>
                              <Badge variant={scenario.expectedResult === 'permit' ? 'default' : 'destructive'}>
                                Expected: {scenario.expectedResult.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{scenario.description}</p>
                            <div className="text-xs">
                              <span className="text-muted-foreground">Action: </span>
                              <code className="bg-muted px-1 rounded">{scenario.action}</code>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No test scenarios defined</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Test Scenario
                      </Button>
                    </div>
                  )}

                  {/* Recent Evaluations */}
                  <div>
                    <h4 className="font-medium mb-3">Recent Evaluations</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Result</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Resource</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockPolicyMetrics.recentEvaluations.map((evaluation, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="text-sm">
                              {evaluation.timestamp.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={evaluation.result === 'permit' ? 'default' : 'destructive'} className="text-xs">
                                {evaluation.result.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{evaluation.userId}</TableCell>
                            <TableCell className="text-sm">{evaluation.resourceId}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Archive className="w-5 h-5" />
                  <span>Audit Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Usage Statistics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="p-3 bg-muted/50 rounded">
                        <div className="text-muted-foreground">Total Evaluations</div>
                        <div className="text-lg font-semibold">{mockPolicyMetrics.evaluationsLast30Days.toLocaleString()}</div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <div className="text-muted-foreground">Permits Granted</div>
                        <div className="text-lg font-semibold text-green-600">{mockPolicyMetrics.permittedRequests}</div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <div className="text-muted-foreground">Denies Issued</div>
                        <div className="text-lg font-semibold text-red-600">{mockPolicyMetrics.deniedRequests}</div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <div className="text-muted-foreground">Avg Response</div>
                        <div className="text-lg font-semibold">{mockPolicyMetrics.averageEvaluationTime}ms</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Compliance & Risk</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-medium">Compliance Status</span>
                        </div>
                        <Badge variant="default">Compliant</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-5 h-5 text-blue-600" />
                          <span className="font-medium">Risk Assessment</span>
                        </div>
                        <Badge variant="secondary">Low Risk</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="versions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GitBranch className="w-5 h-5" />
                  <span>Version History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockVersionHistory.map((version, idx) => (
                    <div key={idx} className={`p-4 border rounded-lg ${version.current ? 'border-primary bg-primary/5' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={version.current ? 'default' : 'outline'}>
                            v{version.version}
                          </Badge>
                          {version.current && <Badge variant="secondary">Current</Badge>}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <User className="w-4 h-4" />
                          <span>{version.createdBy}</span>
                          <Clock className="w-4 h-4 ml-2" />
                          <span>{version.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-sm">{version.changes}</p>
                      {!version.current && (
                        <div className="mt-3 flex space-x-2">
                          <Button variant="outline" size="sm">
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Rollback
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Compare
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Policy Testing Modal */}
        <PolicyTestModal
          policy={policy}
          isOpen={showTestModal}
          onClose={() => setShowTestModal(false)}
        />
      </div>
    </TooltipProvider>
  );
}