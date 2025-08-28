'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Play,
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
  Activity
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
  PolicyTesterProps,
  MockRequest,
  PolicyTestResult,
  PolicyEvaluationTrace,
  EvaluationStep
} from '@/lib/types/policy-builder';
import { Policy, EffectType } from '@/lib/types/permissions';

// Mock data for testing
const mockUsers = [
  { id: 'user-1', name: 'John Doe', role: 'purchasing-staff', department: 'procurement' },
  { id: 'user-2', name: 'Jane Smith', role: 'financial-manager', department: 'finance' },
  { id: 'user-3', name: 'Mike Johnson', role: 'chef', department: 'kitchen' },
  { id: 'user-4', name: 'Sarah Wilson', role: 'counter', department: 'front-office' }
];

const mockResources = [
  { id: 'pr-001', name: 'Kitchen Equipment Purchase Request', type: 'purchase_request', value: 5000 },
  { id: 'po-123', name: 'Monthly Food Order', type: 'purchase_order', value: 2500 },
  { id: 'inv-456', name: 'Premium Wine Inventory', type: 'inventory_item', value: 800 },
  { id: 'vendor-789', name: 'Local Farm Supplier Profile', type: 'vendor', value: 0 }
];

const mockTestScenarios = [
  {
    id: 'scenario-1',
    name: 'High-Value Approval Test',
    description: 'Test approval workflow for high-value purchase requests',
    request: {
      userId: 'user-1',
      resourceId: 'pr-001',
      resourceType: 'purchase_request',
      action: 'approve'
    },
    expectedResult: EffectType.DENY
  },
  {
    id: 'scenario-2',
    name: 'Standard Purchase Test',
    description: 'Test standard purchase order creation',
    request: {
      userId: 'user-2',
      resourceId: 'po-123',
      resourceType: 'purchase_order',
      action: 'create'
    },
    expectedResult: EffectType.PERMIT
  },
  {
    id: 'scenario-3',
    name: 'Inventory Access Test',
    description: 'Test inventory item viewing permissions',
    request: {
      userId: 'user-3',
      resourceId: 'inv-456',
      resourceType: 'inventory_item',
      action: 'read'
    },
    expectedResult: EffectType.PERMIT
  }
];

export function PolicyTester({
  policies = [],
  onTestComplete,
  showPerformanceMetrics = true,
  enableBatchTesting = true
}: PolicyTesterProps) {
  const [currentRequest, setCurrentRequest] = useState<MockRequest>({
    userId: '',
    resourceId: '',
    resourceType: '',
    action: ''
  });
  const [testResults, setTestResults] = useState<PolicyTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('');
  const [batchTestScenarios, setBatchTestScenarios] = useState<string[]>([]);
  const [customJson, setCustomJson] = useState('');

  // Mock policy evaluation function
  const evaluatePolicy = useCallback(async (request: MockRequest): Promise<PolicyTestResult> => {
    const startTime = Date.now();
    
    // Simulate policy evaluation delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    const evaluationTraces: PolicyEvaluationTrace[] = policies.map(policy => {
      const policyStartTime = Date.now();
      
      // Mock evaluation steps
      const steps: EvaluationStep[] = [
        {
          stepNumber: 1,
          stepType: 'target_match',
          description: 'Checking if request matches policy target',
          result: true,
          executionTime: 5 + Math.random() * 10
        },
        {
          stepNumber: 2,
          stepType: 'condition_check',
          description: `Evaluating ${policy.rules.length || 0} policy rules`,
          result: Math.random() > 0.3, // 70% pass rate
          executionTime: 10 + Math.random() * 20
        },
        {
          stepNumber: 3,
          stepType: 'final_decision',
          description: `Policy effect: ${policy.effect}`,
          result: policy.effect === EffectType.PERMIT,
          executionTime: 2 + Math.random() * 5
        }
      ];

      const totalTime = steps.reduce((sum, step) => sum + step.executionTime, 0);
      
      return {
        policyId: policy.id,
        policyName: policy.name,
        effect: policy.effect,
        evaluationSteps: steps,
        executionTime: totalTime,
        finalResult: steps[steps.length - 1].result
      };
    });

    // Determine overall result based on policy evaluation
    const permitPolicies = evaluationTraces.filter(trace => 
      trace.effect === EffectType.PERMIT && trace.finalResult
    );
    const denyPolicies = evaluationTraces.filter(trace => 
      trace.effect === EffectType.DENY && trace.finalResult
    );

    // Deny overrides permit (default combining algorithm)
    const finalEffect = denyPolicies.length > 0 ? EffectType.DENY : EffectType.PERMIT;
    const allowed = finalEffect === EffectType.PERMIT;

    const totalExecutionTime = Date.now() - startTime;
    const totalConditions = evaluationTraces.reduce((sum, trace) => sum + trace.evaluationSteps.length, 0);

    const result: PolicyTestResult = {
      requestId: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      allowed,
      finalEffect,
      evaluationTrace: evaluationTraces,
      totalExecutionTime,
      cacheHit: Math.random() > 0.7, // 30% cache hit rate
      warnings: [],
      performanceMetrics: {
        policiesEvaluated: policies.length,
        conditionsChecked: totalConditions,
        averageStepTime: totalExecutionTime / Math.max(totalConditions, 1),
        slowestPolicy: evaluationTraces.reduce((slowest, current) => 
          current.executionTime > slowest.executionTime ? current : slowest,
          evaluationTraces[0]
        )?.policyName
      }
    };

    // Add performance warnings
    if (totalExecutionTime > 200) {
      result.warnings!.push('Slow evaluation time - consider optimizing policy conditions');
    }
    if (policies.length > 10) {
      result.warnings!.push('Large number of policies may impact performance');
    }

    return result;
  }, [policies]);

  // Run single test
  const runTest = useCallback(async () => {
    if (!currentRequest.userId || !currentRequest.resourceId || !currentRequest.action) {
      return;
    }

    setIsRunning(true);
    try {
      const result = await evaluatePolicy(currentRequest);
      setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
      onTestComplete(result);
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  }, [currentRequest, evaluatePolicy, onTestComplete]);

  // Run batch tests
  const runBatchTest = useCallback(async () => {
    if (batchTestScenarios.length === 0) return;

    setIsRunning(true);
    const batchResults: PolicyTestResult[] = [];

    try {
      for (const scenarioId of batchTestScenarios) {
        const scenario = mockTestScenarios.find(s => s.id === scenarioId);
        if (scenario) {
          const result = await evaluatePolicy(scenario.request);
          batchResults.push(result);
        }
      }

      setTestResults(prev => [...batchResults, ...prev].slice(0, 20)); // Keep last 20 results
      
      // Notify about batch completion
      if (batchResults.length > 0) {
        onTestComplete(batchResults[batchResults.length - 1]);
      }
    } catch (error) {
      console.error('Batch test execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  }, [batchTestScenarios, evaluatePolicy, onTestComplete]);

  // Load scenario into current request
  const loadScenario = useCallback((scenarioId: string) => {
    const scenario = mockTestScenarios.find(s => s.id === scenarioId);
    if (scenario) {
      setCurrentRequest(scenario.request);
    }
  }, []);

  // Performance statistics
  const performanceStats = useMemo(() => {
    if (testResults.length === 0) return null;

    const avgExecutionTime = testResults.reduce((sum, result) => sum + result.totalExecutionTime, 0) / testResults.length;
    const maxExecutionTime = Math.max(...testResults.map(r => r.totalExecutionTime));
    const minExecutionTime = Math.min(...testResults.map(r => r.totalExecutionTime));
    const cacheHitRate = (testResults.filter(r => r.cacheHit).length / testResults.length) * 100;
    const successRate = (testResults.filter(r => r.allowed).length / testResults.length) * 100;

    return {
      avgExecutionTime: Math.round(avgExecutionTime),
      maxExecutionTime,
      minExecutionTime,
      cacheHitRate: Math.round(cacheHitRate),
      successRate: Math.round(successRate),
      totalTests: testResults.length
    };
  }, [testResults]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5" />
          <span>Policy Tester</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="single">Single Test</TabsTrigger>
            <TabsTrigger value="batch" disabled={!enableBatchTesting}>Batch Test</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          {/* Single Test Tab */}
          <TabsContent value="single" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>User</Label>
                  <Select 
                    value={currentRequest.userId} 
                    onValueChange={(value) => setCurrentRequest(prev => ({ ...prev, userId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Resource</Label>
                  <Select 
                    value={currentRequest.resourceId} 
                    onValueChange={(value) => {
                      const resource = mockResources.find(r => r.id === value);
                      setCurrentRequest(prev => ({ 
                        ...prev, 
                        resourceId: value,
                        resourceType: resource?.type || ''
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select resource" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockResources.map(resource => (
                        <SelectItem key={resource.id} value={resource.id}>
                          {resource.name} ({resource.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      {['create', 'read', 'update', 'delete', 'approve', 'reject'].map(action => (
                        <SelectItem key={action} value={action}>
                          {action}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Load Scenario</Label>
                  <Select 
                    value={selectedScenario} 
                    onValueChange={(value) => {
                      setSelectedScenario(value);
                      if (value) loadScenario(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select scenario" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTestScenarios.map(scenario => (
                        <SelectItem key={scenario.id} value={scenario.id}>
                          {scenario.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Custom JSON Request (optional)</Label>
                <Textarea
                  placeholder='{"additionalContext": {"customAttribute": "value"}}'
                  value={customJson}
                  onChange={(e) => setCustomJson(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Button 
                  onClick={runTest}
                  disabled={isRunning || !currentRequest.userId || !currentRequest.resourceId || !currentRequest.action}
                >
                  {isRunning ? (
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Run Test
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentRequest({ userId: '', resourceId: '', resourceType: '', action: '' })}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Batch Test Tab */}
          <TabsContent value="batch" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-base">Select Test Scenarios</Label>
                <p className="text-sm text-muted-foreground">
                  Choose multiple scenarios to run as a batch test
                </p>
              </div>

              <div className="space-y-2">
                {mockTestScenarios.map(scenario => (
                  <div key={scenario.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={scenario.id}
                      checked={batchTestScenarios.includes(scenario.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBatchTestScenarios(prev => [...prev, scenario.id]);
                        } else {
                          setBatchTestScenarios(prev => prev.filter(id => id !== scenario.id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={scenario.id} className="flex-1">
                      <div className="font-medium">{scenario.name}</div>
                      <div className="text-sm text-muted-foreground">{scenario.description}</div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <Button 
                  onClick={runBatchTest}
                  disabled={isRunning || batchTestScenarios.length === 0}
                >
                  {isRunning ? (
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Run Batch Test ({batchTestScenarios.length} scenarios)
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setBatchTestScenarios([])}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear Selection
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-4">
            {showPerformanceMetrics && performanceStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Performance Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Avg Execution Time</Label>
                    <p className="text-lg font-semibold">{performanceStats.avgExecutionTime}ms</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Cache Hit Rate</Label>
                    <p className="text-lg font-semibold">{performanceStats.cacheHitRate}%</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Success Rate</Label>
                    <p className="text-lg font-semibold">{performanceStats.successRate}%</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Total Tests</Label>
                    <p className="text-lg font-semibold">{performanceStats.totalTests}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Min/Max Time</Label>
                    <p className="text-lg font-semibold">{performanceStats.minExecutionTime}/{performanceStats.maxExecutionTime}ms</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <ScrollArea className="h-96">
              <div className="space-y-4">
                {testResults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Info className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p>No test results yet. Run a test to see results here.</p>
                  </div>
                ) : (
                  testResults.map((result, index) => (
                    <Card key={result.requestId}>
                      <CardHeader>
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
                          </div>
                          
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{result.totalExecutionTime}ms</span>
                            {result.cacheHit && (
                              <Badge variant="secondary" className="text-xs">CACHED</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        {/* Performance Metrics */}
                        <div className="text-sm">
                          <div className="flex justify-between">
                            <span>Policies Evaluated:</span>
                            <span>{result.performanceMetrics.policiesEvaluated}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Conditions Checked:</span>
                            <span>{result.performanceMetrics.conditionsChecked}</span>
                          </div>
                          {result.performanceMetrics.slowestPolicy && (
                            <div className="flex justify-between">
                              <span>Slowest Policy:</span>
                              <span className="truncate ml-2">{result.performanceMetrics.slowestPolicy}</span>
                            </div>
                          )}
                        </div>

                        {/* Warnings */}
                        {result.warnings && result.warnings.length > 0 && (
                          <div className="space-y-1">
                            {result.warnings.map((warning, idx) => (
                              <div key={idx} className="flex items-start space-x-2 text-sm text-yellow-600">
                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{warning}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Evaluation Trace */}
                        <Collapsible>
                          <CollapsibleTrigger className="flex items-center space-x-2 text-sm font-medium hover:text-primary">
                            <span>View Evaluation Trace ({result.evaluationTrace.length} policies)</span>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2 space-y-2">
                            {result.evaluationTrace.map((trace, traceIdx) => (
                              <div key={traceIdx} className="border rounded p-3 text-sm">
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
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}