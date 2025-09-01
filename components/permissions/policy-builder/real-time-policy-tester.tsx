'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Save,
  Upload,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Zap,
  TrendingUp,
  BarChart3,
  Activity,
  RefreshCw,
  Target,
  Timer,
  Monitor,
  Layers,
  PlusCircle,
  MinusCircle,
  Edit3,
  Eye,
  Settings,
  Cpu,
  Database,
  Network,
  Shield
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  PolicyTesterProps,
  MockRequest,
  PolicyTestResult,
  PolicyEvaluationTrace,
  EvaluationStep,
  PolicyBuilderState
} from '@/lib/types/policy-builder';
import { Policy, EffectType } from '@/lib/types/permissions';

// Enhanced test scenario types
interface TestScenario {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'security' | 'functionality' | 'edge_case';
  priority: 'low' | 'medium' | 'high' | 'critical';
  request: MockRequest;
  expectedResult: EffectType;
  tags: string[];
  isEnabled: boolean;
  customAttributes?: Record<string, any>;
}

interface RealTimeTestConfig {
  autoRefresh: boolean;
  refreshInterval: number; // seconds
  enableLiveFeedback: boolean;
  performanceThreshold: number; // ms
  maxConcurrentTests: number;
  enableStressTest: boolean;
  stresTestDuration: number; // seconds
  enableComplianceCheck: boolean;
}

interface LiveTestMetrics {
  currentThroughput: number; // tests per second
  averageLatency: number; // ms
  errorRate: number; // percentage
  cacheHitRate: number; // percentage
  activePolicies: number;
  failedEvaluations: number;
  memoryUsage: number; // percentage
  cpuUsage: number; // percentage
}

// Enhanced mock data
const enhancedTestScenarios: TestScenario[] = [
  {
    id: 'perf-001',
    name: 'High-Volume Request Test',
    description: 'Test system performance under high-volume approval requests',
    category: 'performance',
    priority: 'high',
    request: {
      userId: 'user-1',
      resourceId: 'pr-001',
      resourceType: 'purchase_request',
      action: 'approve',
      additionalContext: {
        requestVolume: 1000,
        concurrentUsers: 50
      }
    },
    expectedResult: EffectType.PERMIT,
    tags: ['performance', 'approval', 'high-volume'],
    isEnabled: true
  },
  {
    id: 'sec-001',
    name: 'Privilege Escalation Test',
    description: 'Test protection against privilege escalation attempts',
    category: 'security',
    priority: 'critical',
    request: {
      userId: 'user-3',
      resourceId: 'admin-panel',
      resourceType: 'system_resource',
      action: 'admin_access',
      additionalContext: {
        attemptedEscalation: true,
        sourceIp: '192.168.1.100',
        userAgent: 'potential-threat'
      }
    },
    expectedResult: EffectType.DENY,
    tags: ['security', 'escalation', 'admin'],
    isEnabled: true
  },
  {
    id: 'func-001',
    name: 'Cross-Department Access Test',
    description: 'Test access controls across department boundaries',
    category: 'functionality',
    priority: 'medium',
    request: {
      userId: 'user-2',
      resourceId: 'kitchen-inventory',
      resourceType: 'inventory_item',
      action: 'update',
      additionalContext: {
        userDepartment: 'finance',
        resourceDepartment: 'kitchen'
      }
    },
    expectedResult: EffectType.DENY,
    tags: ['cross-department', 'inventory', 'access-control'],
    isEnabled: true
  },
  {
    id: 'edge-001',
    name: 'Null Value Handling Test',
    description: 'Test policy evaluation with null/undefined values',
    category: 'edge_case',
    priority: 'medium',
    request: {
      userId: 'user-4',
      resourceId: 'resource-null',
      resourceType: 'test_resource',
      action: 'read',
      additionalContext: {
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
        zeroValue: 0
      }
    },
    expectedResult: EffectType.PERMIT,
    tags: ['edge-case', 'null-handling', 'data-validation'],
    isEnabled: true
  }
];

export function RealTimePolicyTester({
  policies = [],
  policyBuilderState,
  onTestComplete,
  showPerformanceMetrics = true,
  enableBatchTesting = true,
  enableRealTimeMode = true
}: PolicyTesterProps & { 
  policyBuilderState?: PolicyBuilderState; 
  enableRealTimeMode?: boolean;
}) {
  const [isRealTimeMode, setIsRealTimeMode] = useState(enableRealTimeMode);
  const [testConfig, setTestConfig] = useState<RealTimeTestConfig>({
    autoRefresh: false,
    refreshInterval: 5,
    enableLiveFeedback: true,
    performanceThreshold: 200,
    maxConcurrentTests: 10,
    enableStressTest: false,
    stresTestDuration: 30,
    enableComplianceCheck: true
  });
  
  const [currentRequest, setCurrentRequest] = useState<MockRequest>({
    userId: '',
    resourceId: '',
    resourceType: '',
    action: ''
  });
  
  const [testResults, setTestResults] = useState<PolicyTestResult[]>([]);
  const [liveMetrics, setLiveMetrics] = useState<LiveTestMetrics>({
    currentThroughput: 0,
    averageLatency: 0,
    errorRate: 0,
    cacheHitRate: 75,
    activePolicies: policies.length,
    failedEvaluations: 0,
    memoryUsage: 45,
    cpuUsage: 32
  });
  
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isStressTesting, setIsStressTesting] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [testProgress, setTestProgress] = useState(0);

  // Real-time metrics update effect
  useEffect(() => {
    if (!isRealTimeMode || !testConfig.autoRefresh) return;

    const interval = setInterval(() => {
      updateLiveMetrics();
    }, testConfig.refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [isRealTimeMode, testConfig.autoRefresh, testConfig.refreshInterval]);

  // Mock live metrics update
  const updateLiveMetrics = useCallback(() => {
    setLiveMetrics(prev => ({
      ...prev,
      currentThroughput: Math.max(0, prev.currentThroughput + (Math.random() - 0.5) * 10),
      averageLatency: Math.max(50, prev.averageLatency + (Math.random() - 0.5) * 20),
      errorRate: Math.max(0, Math.min(100, prev.errorRate + (Math.random() - 0.5) * 2)),
      cacheHitRate: Math.max(0, Math.min(100, prev.cacheHitRate + (Math.random() - 0.5) * 5)),
      memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + (Math.random() - 0.5) * 3)),
      cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + (Math.random() - 0.5) * 5))
    }));
  }, []);

  // Enhanced policy evaluation with real-time feedback
  const evaluatePolicyRealTime = useCallback(async (
    request: MockRequest,
    enableLiveFeedback = false
  ): Promise<PolicyTestResult> => {
    const startTime = Date.now();
    
    if (enableLiveFeedback) {
      setTestProgress(0);
    }

    // Use policy builder state if provided, otherwise use policies
    const policiesToTest = policyBuilderState 
      ? [convertBuilderStateToPolicy(policyBuilderState)]
      : policies;

    const evaluationTraces: PolicyEvaluationTrace[] = [];
    
    for (let i = 0; i < policiesToTest.length; i++) {
      const policy = policiesToTest[i];
      const policyStartTime = Date.now();
      
      if (enableLiveFeedback) {
        setTestProgress(((i + 1) / policiesToTest.length) * 100);
      }

      // Enhanced evaluation steps with more detail
      const steps: EvaluationStep[] = [
        {
          stepNumber: 1,
          stepType: 'target_match',
          description: 'Checking request matches policy target',
          result: true,
          details: {
            subjectMatch: request.userId !== '',
            resourceMatch: request.resourceId !== '',
            actionMatch: request.action !== ''
          },
          executionTime: 5 + Math.random() * 10
        },
        {
          stepNumber: 2,
          stepType: 'condition_check',
          description: `Evaluating ${policy.rules?.length || 0} policy conditions`,
          result: Math.random() > 0.2, // 80% pass rate
          details: {
            conditionsEvaluated: policy.rules?.length || 0,
            passingConditions: Math.floor((policy.rules?.length || 0) * 0.8),
            failingConditions: Math.floor((policy.rules?.length || 0) * 0.2)
          },
          executionTime: 15 + Math.random() * 25
        },
        {
          stepNumber: 3,
          stepType: 'final_decision',
          description: `Applying policy effect: ${policy.effect}`,
          result: policy.effect === EffectType.PERMIT,
          details: {
            effect: policy.effect,
            priority: policy.priority,
            combiningAlgorithm: 'deny_overrides'
          },
          executionTime: 3 + Math.random() * 7
        }
      ];

      const totalTime = steps.reduce((sum, step) => sum + step.executionTime, 0);
      const finalResult = steps.every(step => step.result === true);

      evaluationTraces.push({
        policyId: policy.id,
        policyName: policy.name,
        effect: policy.effect,
        evaluationSteps: steps,
        executionTime: totalTime,
        finalResult
      });

      // Simulate processing delay for real-time effect
      if (enableLiveFeedback) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    // Determine final result using deny-overrides algorithm
    const denyPolicies = evaluationTraces.filter(trace => 
      trace.effect === EffectType.DENY && trace.finalResult
    );
    const permitPolicies = evaluationTraces.filter(trace => 
      trace.effect === EffectType.PERMIT && trace.finalResult
    );

    const finalEffect = denyPolicies.length > 0 ? EffectType.DENY : EffectType.PERMIT;
    const allowed = finalEffect === EffectType.PERMIT;

    const totalExecutionTime = Date.now() - startTime;
    const totalConditions = evaluationTraces.reduce(
      (sum, trace) => sum + trace.evaluationSteps.length, 
      0
    );

    const result: PolicyTestResult = {
      requestId: `rt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      allowed,
      finalEffect,
      evaluationTrace: evaluationTraces,
      totalExecutionTime,
      cacheHit: Math.random() > 0.6, // 40% cache hit rate
      warnings: [],
      performanceMetrics: {
        policiesEvaluated: policiesToTest.length,
        conditionsChecked: totalConditions,
        averageStepTime: totalExecutionTime / Math.max(totalConditions, 1),
        slowestPolicy: evaluationTraces.reduce((slowest, current) => 
          current.executionTime > slowest.executionTime ? current : slowest,
          evaluationTraces[0]
        )?.policyName
      }
    };

    // Add performance warnings based on thresholds
    if (totalExecutionTime > testConfig.performanceThreshold) {
      result.warnings!.push(
        `Slow evaluation: ${totalExecutionTime}ms exceeds threshold of ${testConfig.performanceThreshold}ms`
      );
    }
    
    if (policiesToTest.length > 20) {
      result.warnings!.push('Large policy set may impact performance');
    }

    // Add compliance warnings if enabled
    if (testConfig.enableComplianceCheck) {
      if (!request.additionalContext?.auditTrail) {
        result.warnings!.push('Missing audit trail information');
      }
      if (!request.additionalContext?.requestSource) {
        result.warnings!.push('Request source not specified');
      }
    }

    if (enableLiveFeedback) {
      setTestProgress(100);
      setTimeout(() => setTestProgress(0), 1000);
    }

    return result;
  }, [policies, policyBuilderState, testConfig]);

  // Convert policy builder state to policy format
  const convertBuilderStateToPolicy = (builderState: PolicyBuilderState): Policy => {
    return {
      id: `builder-policy-${Date.now()}`,
      name: builderState.name || 'Draft Policy',
      description: builderState.description || '',
      effect: builderState.effect,
      priority: builderState.priority,
      status: 'ACTIVE',
      combiningAlgorithm: 'DENY_OVERRIDES',
      target: {
        subjects: builderState.subjectConditions.map(cond => cond.value),
        resources: builderState.resourceConditions.map(cond => cond.value),
        actions: builderState.actionConditions,
        environment: builderState.environmentConditions.map(cond => cond.value)
      },
      rules: builderState.rules,
      version: builderState.version || '1.0',
      tags: builderState.tags || [],
      testScenarios: builderState.testScenarios,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      updatedBy: 'system'
    };
  };

  // Run single real-time test
  const runRealTimeTest = useCallback(async () => {
    if (!currentRequest.userId || !currentRequest.resourceId || !currentRequest.action) {
      return;
    }

    setIsRunning(true);
    try {
      const result = await evaluatePolicyRealTime(
        currentRequest, 
        testConfig.enableLiveFeedback
      );
      
      setTestResults(prev => [result, ...prev.slice(0, 19)]); // Keep last 20 results
      onTestComplete(result);

      // Update live metrics
      setLiveMetrics(prev => ({
        ...prev,
        currentThroughput: prev.currentThroughput + 1,
        averageLatency: (prev.averageLatency + result.totalExecutionTime) / 2,
        errorRate: result.allowed ? Math.max(0, prev.errorRate - 1) : prev.errorRate + 2,
        failedEvaluations: result.allowed ? prev.failedEvaluations : prev.failedEvaluations + 1
      }));

    } catch (error) {
      console.error('Real-time test execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  }, [currentRequest, evaluatePolicyRealTime, testConfig.enableLiveFeedback, onTestComplete]);

  // Run stress test
  const runStressTest = useCallback(async () => {
    if (selectedScenarios.length === 0) return;

    setIsStressTesting(true);
    const startTime = Date.now();
    const testDuration = testConfig.stresTestDuration * 1000;
    const results: PolicyTestResult[] = [];
    let testCount = 0;

    try {
      while (Date.now() - startTime < testDuration) {
        const scenarioId = selectedScenarios[testCount % selectedScenarios.length];
        const scenario = enhancedTestScenarios.find(s => s.id === scenarioId);
        
        if (scenario) {
          const result = await evaluatePolicyRealTime(scenario.request, false);
          results.push(result);
          testCount++;

          // Update progress
          const progress = ((Date.now() - startTime) / testDuration) * 100;
          setTestProgress(progress);

          // Brief delay to prevent overwhelming
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      setTestResults(prev => [...results, ...prev].slice(0, 50)); // Keep last 50 results
      
      // Update final metrics
      const avgLatency = results.reduce((sum, r) => sum + r.totalExecutionTime, 0) / results.length;
      const errorRate = (results.filter(r => !r.allowed).length / results.length) * 100;
      
      setLiveMetrics(prev => ({
        ...prev,
        currentThroughput: testCount / (testDuration / 1000),
        averageLatency: avgLatency,
        errorRate: errorRate,
        failedEvaluations: prev.failedEvaluations + results.filter(r => !r.allowed).length
      }));

    } finally {
      setIsStressTesting(false);
      setTestProgress(0);
    }
  }, [selectedScenarios, testConfig.stresTestDuration, evaluatePolicyRealTime]);

  // Performance statistics
  const performanceStats = useMemo(() => {
    if (testResults.length === 0) return null;

    const recentResults = testResults.slice(0, 10); // Last 10 tests
    const avgExecutionTime = recentResults.reduce((sum, result) => sum + result.totalExecutionTime, 0) / recentResults.length;
    const maxExecutionTime = Math.max(...recentResults.map(r => r.totalExecutionTime));
    const minExecutionTime = Math.min(...recentResults.map(r => r.totalExecutionTime));
    const successRate = (recentResults.filter(r => r.allowed).length / recentResults.length) * 100;
    const cacheHitRate = (recentResults.filter(r => r.cacheHit).length / recentResults.length) * 100;

    return {
      avgExecutionTime: Math.round(avgExecutionTime),
      maxExecutionTime,
      minExecutionTime,
      successRate: Math.round(successRate),
      cacheHitRate: Math.round(cacheHitRate),
      totalTests: testResults.length,
      recentTests: recentResults.length
    };
  }, [testResults]);

  return (
    <div className="space-y-6">
      {/* Real-Time Mode Toggle */}
      {enableRealTimeMode && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="h-5 w-5" />
                <span>Real-Time Testing Mode</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={isRealTimeMode}
                  onCheckedChange={setIsRealTimeMode}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowConfigDialog(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Config
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {isRealTimeMode && (
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {liveMetrics.currentThroughput.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Tests/sec</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {liveMetrics.averageLatency.toFixed(0)}ms
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Latency</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {liveMetrics.errorRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Error Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {liveMetrics.cacheHitRate.toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Cache Hit</div>
                </div>
              </div>

              {/* Live Progress Bar */}
              {(isRunning || isStressTesting) && testProgress > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Test Progress</span>
                    <span>{Math.round(testProgress)}%</span>
                  </div>
                  <Progress value={testProgress} className="w-full" />
                </div>
              )}

              {/* Auto-refresh indicator */}
              {testConfig.autoRefresh && (
                <div className="mt-2 flex items-center space-x-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Auto-refreshing every {testConfig.refreshInterval}s</span>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Enhanced Testing Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Enhanced Policy Tester</span>
            {policyBuilderState && (
              <Badge variant="outline">Live Policy Testing</Badge>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="single" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="single">Single Test</TabsTrigger>
              <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
              <TabsTrigger value="stress">Stress Test</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            {/* Single Test Tab */}
            <TabsContent value="single" className="space-y-4">
              <div className="grid gap-4">
                {/* Test Request Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>User ID</Label>
                    <Input
                      placeholder="user-123"
                      value={currentRequest.userId}
                      onChange={(e) => setCurrentRequest(prev => ({ ...prev, userId: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Resource ID</Label>
                    <Input
                      placeholder="resource-456"
                      value={currentRequest.resourceId}
                      onChange={(e) => setCurrentRequest(prev => ({ ...prev, resourceId: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Resource Type</Label>
                    <Select 
                      value={currentRequest.resourceType} 
                      onValueChange={(value) => setCurrentRequest(prev => ({ ...prev, resourceType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select resource type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="purchase_request">Purchase Request</SelectItem>
                        <SelectItem value="purchase_order">Purchase Order</SelectItem>
                        <SelectItem value="inventory_item">Inventory Item</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                        <SelectItem value="system_resource">System Resource</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Action</Label>
                    <Select 
                      value={currentRequest.action} 
                      onValueChange={(value) => setCurrentRequest(prev => ({ ...prev, action: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="create">Create</SelectItem>
                        <SelectItem value="read">Read</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                        <SelectItem value="delete">Delete</SelectItem>
                        <SelectItem value="approve">Approve</SelectItem>
                        <SelectItem value="reject">Reject</SelectItem>
                        <SelectItem value="admin_access">Admin Access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Additional Context */}
                <div className="space-y-2">
                  <Label>Additional Context (JSON)</Label>
                  <Textarea
                    placeholder='{"department": "finance", "urgency": "high"}'
                    rows={3}
                    onChange={(e) => {
                      try {
                        const context = JSON.parse(e.target.value || '{}');
                        setCurrentRequest(prev => ({ ...prev, additionalContext: context }));
                      } catch {
                        // Invalid JSON, ignore
                      }
                    }}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={runRealTimeTest}
                    disabled={isRunning || !currentRequest.userId || !currentRequest.resourceId || !currentRequest.action}
                    size="lg"
                  >
                    {isRunning ? (
                      <Activity className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    {isRealTimeMode ? 'Run Real-Time Test' : 'Run Test'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentRequest({ userId: '', resourceId: '', resourceType: '', action: '' })}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>

                  {isRealTimeMode && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => setTestConfig(prev => ({ ...prev, enableLiveFeedback: !prev.enableLiveFeedback }))}
                          >
                            <Eye className={`h-4 w-4 ${testConfig.enableLiveFeedback ? 'text-green-600' : ''}`} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Toggle live feedback</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Test Scenarios Tab */}
            <TabsContent value="scenarios" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Enhanced Test Scenarios</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select scenarios to test different aspects of your policies
                  </p>
                </div>

                <div className="grid gap-3">
                  {enhancedTestScenarios.map(scenario => (
                    <Card key={scenario.id} className={`cursor-pointer transition-colors ${
                      selectedScenarios.includes(scenario.id) ? 'border-primary bg-primary/5' : ''
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              checked={selectedScenarios.includes(scenario.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedScenarios(prev => [...prev, scenario.id]);
                                } else {
                                  setSelectedScenarios(prev => prev.filter(id => id !== scenario.id));
                                }
                              }}
                              className="mt-1 rounded border-gray-300"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium">{scenario.name}</h4>
                                <Badge 
                                  variant={
                                    scenario.priority === 'critical' ? 'destructive' :
                                    scenario.priority === 'high' ? 'default' :
                                    'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {scenario.priority}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {scenario.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {scenario.description}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {scenario.tags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <Switch
                            checked={scenario.isEnabled}
                            onCheckedChange={(checked) => {
                              // Update scenario enabled state
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={() => {
                      selectedScenarios.forEach(async (scenarioId) => {
                        const scenario = enhancedTestScenarios.find(s => s.id === scenarioId);
                        if (scenario) {
                          await runRealTimeTest();
                        }
                      });
                    }}
                    disabled={isRunning || selectedScenarios.length === 0}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Run Selected ({selectedScenarios.length})
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedScenarios(enhancedTestScenarios.map(s => s.id))}
                  >
                    Select All
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedScenarios([])}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Stress Test Tab */}
            <TabsContent value="stress" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Performance Stress Testing</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Run high-volume tests to evaluate policy performance under load
                  </p>
                </div>

                {/* Stress Test Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Test Duration (seconds)</Label>
                    <Slider
                      value={[testConfig.stresTestDuration]}
                      onValueChange={([value]) => setTestConfig(prev => ({ ...prev, stresTestDuration: value }))}
                      min={10}
                      max={300}
                      step={10}
                    />
                    <div className="text-sm text-muted-foreground">
                      {testConfig.stresTestDuration} seconds
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Max Concurrent Tests</Label>
                    <Slider
                      value={[testConfig.maxConcurrentTests]}
                      onValueChange={([value]) => setTestConfig(prev => ({ ...prev, maxConcurrentTests: value }))}
                      min={1}
                      max={50}
                      step={1}
                    />
                    <div className="text-sm text-muted-foreground">
                      {testConfig.maxConcurrentTests} concurrent tests
                    </div>
                  </div>
                </div>

                {/* Stress Test Controls */}
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={runStressTest}
                    disabled={isStressTesting || selectedScenarios.length === 0}
                    variant={isStressTesting ? 'destructive' : 'default'}
                  >
                    {isStressTesting ? (
                      <>
                        <Square className="h-4 w-4 mr-2" />
                        Stop Stress Test
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4 mr-2" />
                        Start Stress Test
                      </>
                    )}
                  </Button>
                  
                  <div className="text-sm text-muted-foreground">
                    Using {selectedScenarios.length} scenario{selectedScenarios.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Live Stress Test Metrics */}
                {isStressTesting && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Live Stress Test Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold">{liveMetrics.currentThroughput.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">Tests/sec</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{liveMetrics.averageLatency.toFixed(0)}ms</div>
                        <div className="text-xs text-muted-foreground">Avg Latency</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{liveMetrics.cpuUsage.toFixed(0)}%</div>
                        <div className="text-xs text-muted-foreground">CPU Usage</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{liveMetrics.memoryUsage.toFixed(0)}%</div>
                        <div className="text-xs text-muted-foreground">Memory</div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="space-y-4">
              {/* Performance Overview */}
              {showPerformanceMetrics && performanceStats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Performance Metrics</span>
                      <Badge variant="outline">Last {performanceStats.recentTests} tests</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Avg Execution</Label>
                      <p className="text-lg font-semibold">{performanceStats.avgExecutionTime}ms</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Success Rate</Label>
                      <p className="text-lg font-semibold text-green-600">{performanceStats.successRate}%</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Cache Hit</Label>
                      <p className="text-lg font-semibold text-blue-600">{performanceStats.cacheHitRate}%</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Min/Max</Label>
                      <p className="text-lg font-semibold">{performanceStats.minExecutionTime}/{performanceStats.maxExecutionTime}ms</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Total Tests</Label>
                      <p className="text-lg font-semibold">{performanceStats.totalTests}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Test Results List */}
              <div className="space-y-4">
                {testResults.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="font-semibold mb-2">No test results yet</h3>
                    <p>Run a test to see results here</p>
                  </div>
                ) : (
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {testResults.map((result, index) => (
                        <Card key={result.requestId} className="relative">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {result.allowed ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500" />
                                )}
                                <span className="font-medium">
                                  {result.allowed ? 'ALLOWED' : 'DENIED'}
                                </span>
                                <Badge variant={result.finalEffect === EffectType.PERMIT ? "default" : "destructive"}>
                                  {result.finalEffect}
                                </Badge>
                                {index === 0 && (
                                  <Badge variant="outline" className="text-xs">Latest</Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Timer className="h-4 w-4" />
                                <span>{result.totalExecutionTime}ms</span>
                                {result.cacheHit && (
                                  <Badge variant="secondary" className="text-xs">CACHED</Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent>
                            {/* Quick Metrics */}
                            <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                              <div>
                                <Label className="text-xs text-muted-foreground">Policies</Label>
                                <p>{result.performanceMetrics.policiesEvaluated}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Conditions</Label>
                                <p>{result.performanceMetrics.conditionsChecked}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Avg Step</Label>
                                <p>{Math.round(result.performanceMetrics.averageStepTime)}ms</p>
                              </div>
                            </div>

                            {/* Warnings */}
                            {result.warnings && result.warnings.length > 0 && (
                              <div className="mb-3">
                                {result.warnings.map((warning, idx) => (
                                  <div key={idx} className="flex items-start space-x-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>{warning}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Evaluation Trace */}
                            <Collapsible>
                              <CollapsibleTrigger className="flex items-center space-x-2 text-sm font-medium hover:text-primary">
                                <Layers className="h-4 w-4" />
                                <span>View Evaluation Details ({result.evaluationTrace.length} policies)</span>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="mt-2">
                                {result.evaluationTrace.map((trace, traceIdx) => (
                                  <div key={traceIdx} className="border rounded p-3 text-sm mb-2">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium">{trace.policyName}</span>
                                      <div className="flex items-center space-x-2">
                                        <Badge variant={trace.finalResult ? "default" : "secondary"}>
                                          {trace.effect}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                          {Math.round(trace.executionTime)}ms
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-1">
                                      {trace.evaluationSteps.map((step, stepIdx) => (
                                        <div key={stepIdx} className="flex items-center space-x-2 text-xs">
                                          {step.result ? (
                                            <CheckCircle className="h-3 w-3 text-green-500" />
                                          ) : (
                                            <XCircle className="h-3 w-3 text-red-500" />
                                          )}
                                          <span>{step.description}</span>
                                          <span className="text-muted-foreground">
                                            ({Math.round(step.executionTime)}ms)
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </CollapsibleContent>
                            </Collapsible>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Real-Time Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Real-Time Test Configuration</DialogTitle>
            <DialogDescription>
              Configure real-time testing behavior and performance settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Auto-refresh Metrics</Label>
                <Switch
                  checked={testConfig.autoRefresh}
                  onCheckedChange={(checked) => setTestConfig(prev => ({ ...prev, autoRefresh: checked }))}
                />
              </div>
              {testConfig.autoRefresh && (
                <div className="space-y-1">
                  <Label className="text-sm">Refresh Interval (seconds)</Label>
                  <Slider
                    value={[testConfig.refreshInterval]}
                    onValueChange={([value]) => setTestConfig(prev => ({ ...prev, refreshInterval: value }))}
                    min={1}
                    max={60}
                    step={1}
                  />
                  <div className="text-xs text-muted-foreground">{testConfig.refreshInterval} seconds</div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Live Feedback</Label>
                <Switch
                  checked={testConfig.enableLiveFeedback}
                  onCheckedChange={(checked) => setTestConfig(prev => ({ ...prev, enableLiveFeedback: checked }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Performance Threshold (ms)</Label>
              <Slider
                value={[testConfig.performanceThreshold]}
                onValueChange={([value]) => setTestConfig(prev => ({ ...prev, performanceThreshold: value }))}
                min={50}
                max={1000}
                step={50}
              />
              <div className="text-xs text-muted-foreground">{testConfig.performanceThreshold}ms warning threshold</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Compliance Checks</Label>
                <Switch
                  checked={testConfig.enableComplianceCheck}
                  onCheckedChange={(checked) => setTestConfig(prev => ({ ...prev, enableComplianceCheck: checked }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowConfigDialog(false)}>
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}