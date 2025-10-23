'use client';

import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Shield, 
  Settings,
  AlertCircle,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

import { Policy, EffectType } from '@/lib/types/permissions';

interface PolicyTestModalProps {
  policy: Policy;
  isOpen: boolean;
  onClose: () => void;
}

interface TestScenario {
  name: string;
  description: string;
  userId: string;
  userRole: string;
  resourceId: string;
  resourceType: string;
  action: string;
  context?: Record<string, any>;
}

interface TestResult {
  scenario: TestScenario;
  result: EffectType | 'error';
  reason: string;
  evaluationTime: number;
  ruleResults: Record<string, boolean>;
  obligations: string[];
  advice: string[];
}

const predefinedScenarios: TestScenario[] = [
  {
    name: 'Department Manager Approval',
    description: 'Test department manager approving a purchase request from their department',
    userId: 'user-dept-mgr-001',
    userRole: 'Department Manager',
    resourceId: 'pr-001',
    resourceType: 'PURCHASE_REQUEST',
    action: 'approve_department',
    context: {
      'subject.department.id': 'dept-kitchen',
      'resource.ownerDepartment': 'dept-kitchen',
      'resource.totalValue.amount': 2500,
      'resource.documentStatus.status': 'pending_department_approval'
    }
  },
  {
    name: 'Cross-Department Access',
    description: 'Test user trying to access resources from different department',
    userId: 'user-staff-002',
    userRole: 'Staff',
    resourceId: 'pr-002',
    resourceType: 'PURCHASE_REQUEST',
    action: 'view',
    context: {
      'subject.department.id': 'dept-kitchen',
      'resource.ownerDepartment': 'dept-housekeeping',
      'resource.totalValue.amount': 1500
    }
  },
  {
    name: 'High Value Approval',
    description: 'Test high-value purchase request requiring GM approval',
    userId: 'user-gm-001',
    userRole: 'General Manager',
    resourceId: 'pr-003',
    resourceType: 'PURCHASE_REQUEST',
    action: 'approve_gm',
    context: {
      'resource.totalValue.amount': 35000,
      'resource.documentStatus.status': 'pending_gm_approval',
      'subject.approvalLimit.amount': 50000
    }
  }
];

export function PolicyTestModal({ policy, isOpen, onClose }: PolicyTestModalProps) {
  const [selectedScenario, setSelectedScenario] = useState<TestScenario | null>(null);
  const [customScenario, setCustomScenario] = useState<Partial<TestScenario>>({});
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [activeTab, setActiveTab] = useState<'predefined' | 'custom'>('predefined');

  const runTest = async (scenario: TestScenario) => {
    setIsRunningTest(true);
    
    // Simulate policy evaluation
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Mock evaluation logic based on policy rules
    const mockResult: TestResult = {
      scenario,
      result: Math.random() > 0.3 ? EffectType.PERMIT : EffectType.DENY,
      reason: generateMockReason(scenario, policy),
      evaluationTime: Math.floor(Math.random() * 50) + 10,
      ruleResults: policy.rules.reduce((acc, rule) => ({
        ...acc,
        [rule.id]: Math.random() > 0.2
      }), {}),
      obligations: policy.obligations?.map(o => o.description || o.type) || [],
      advice: policy.advice?.map(a => a.message) || []
    };

    setTestResults(prev => [mockResult, ...prev.slice(0, 4)]);
    setIsRunningTest(false);
  };

  const generateMockReason = (scenario: TestScenario, policy: Policy): string => {
    const reasons = [
      `Policy '${policy.name}' evaluated successfully`,
      `User '${scenario.userRole}' has required permissions for action '${scenario.action}'`,
      `Resource type '${scenario.resourceType}' matches policy target`,
      `Department access validation passed`,
      `Approval limit check successful`
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  };

  const handleRunPredefinedTest = () => {
    if (selectedScenario) {
      runTest(selectedScenario);
    }
  };

  const handleRunCustomTest = () => {
    if (customScenario.name && customScenario.userId && customScenario.action) {
      runTest({
        name: customScenario.name || 'Custom Test',
        description: customScenario.description || 'Custom test scenario',
        userId: customScenario.userId || '',
        userRole: customScenario.userRole || 'Unknown',
        resourceId: customScenario.resourceId || 'test-resource',
        resourceType: customScenario.resourceType || 'UNKNOWN',
        action: customScenario.action || '',
        context: {}
      });
    }
  };

  const getResultIcon = (result: EffectType | 'error') => {
    switch (result) {
      case EffectType.PERMIT:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case EffectType.DENY:
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getResultBadge = (result: EffectType | 'error') => (
    <Badge variant={result === EffectType.PERMIT ? 'default' : result === EffectType.DENY ? 'destructive' : 'secondary'}>
      {result.toString().toUpperCase()}
    </Badge>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Play className="w-5 h-5" />
            <span>Test Policy: {policy.name}</span>
          </DialogTitle>
          <DialogDescription>
            Test your policy against different scenarios to validate its behavior
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Test Scenario Selection */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <Button
              variant={activeTab === 'predefined' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('predefined')}
              className="flex-1"
            >
              Predefined Scenarios
            </Button>
            <Button
              variant={activeTab === 'custom' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('custom')}
              className="flex-1"
            >
              Custom Test
            </Button>
          </div>

          {activeTab === 'predefined' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Predefined Test Scenarios</CardTitle>
                <CardDescription>
                  Choose from common scenarios to test your policy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Select Scenario</Label>
                  <Select 
                    value={selectedScenario?.name} 
                    onValueChange={(value) => setSelectedScenario(predefinedScenarios.find(s => s.name === value) || null)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose a test scenario..." />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedScenarios.map((scenario) => (
                        <SelectItem key={scenario.name} value={scenario.name}>
                          {scenario.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedScenario && (
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <div>
                      <h4 className="font-medium">{selectedScenario.name}</h4>
                      <p className="text-sm text-muted-foreground">{selectedScenario.description}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">User Role:</span>
                        <div className="font-medium">{selectedScenario.userRole}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Resource:</span>
                        <div className="font-medium">{selectedScenario.resourceType}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Action:</span>
                        <div className="font-medium">{selectedScenario.action}</div>
                      </div>
                    </div>
                    <Button 
                      onClick={handleRunPredefinedTest} 
                      disabled={isRunningTest}
                      className="w-full"
                    >
                      {isRunningTest ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Running Test...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Run Test
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'custom' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Custom Test Scenario</CardTitle>
                <CardDescription>
                  Create your own test scenario with specific parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scenario-name">Scenario Name *</Label>
                    <Input
                      id="scenario-name"
                      value={customScenario.name || ''}
                      onChange={(e) => setCustomScenario(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter scenario name..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="user-id">User ID *</Label>
                    <Input
                      id="user-id"
                      value={customScenario.userId || ''}
                      onChange={(e) => setCustomScenario(prev => ({ ...prev, userId: e.target.value }))}
                      placeholder="user-123"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="user-role">User Role</Label>
                    <Select 
                      value={customScenario.userRole} 
                      onValueChange={(value) => setCustomScenario(prev => ({ ...prev, userRole: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select user role..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Staff">Staff</SelectItem>
                        <SelectItem value="Department Manager">Department Manager</SelectItem>
                        <SelectItem value="Finance Manager">Finance Manager</SelectItem>
                        <SelectItem value="General Manager">General Manager</SelectItem>
                        <SelectItem value="Procurement Staff">Procurement Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="resource-type">Resource Type</Label>
                    <Select 
                      value={customScenario.resourceType} 
                      onValueChange={(value) => setCustomScenario(prev => ({ ...prev, resourceType: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select resource type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PURCHASE_REQUEST">Purchase Request</SelectItem>
                        <SelectItem value="PURCHASE_ORDER">Purchase Order</SelectItem>
                        <SelectItem value="INVENTORY_ITEM">Inventory Item</SelectItem>
                        <SelectItem value="VENDOR">Vendor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="action">Action *</Label>
                  <Input
                    id="action"
                    value={customScenario.action || ''}
                    onChange={(e) => setCustomScenario(prev => ({ ...prev, action: e.target.value }))}
                    placeholder="create, update, approve, view..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={customScenario.description || ''}
                    onChange={(e) => setCustomScenario(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this test scenario validates..."
                    className="mt-1"
                  />
                </div>

                <Button 
                  onClick={handleRunCustomTest} 
                  disabled={isRunningTest || !customScenario.name || !customScenario.userId || !customScenario.action}
                  className="w-full"
                >
                  {isRunningTest ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Running Test...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Custom Test
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Test Results */}
          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Results</CardTitle>
                <CardDescription>
                  Recent test executions and their outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getResultIcon(result.result)}
                          <div>
                            <h4 className="font-medium">{result.scenario.name}</h4>
                            <p className="text-sm text-muted-foreground">{result.scenario.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getResultBadge(result.result)}
                          <div className="text-xs text-muted-foreground flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{result.evaluationTime}ms</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-sm">
                        <span className="font-medium">Reason: </span>
                        <span className="text-muted-foreground">{result.reason}</span>
                      </div>

                      {result.obligations.length > 0 && (
                        <div>
                          <span className="text-sm font-medium">Obligations:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {result.obligations.map((obligation, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{obligation}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {Object.keys(result.ruleResults).length > 0 && (
                        <div>
                          <span className="text-sm font-medium">Rule Results:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(result.ruleResults).map(([ruleId, passed]) => (
                              <Badge key={ruleId} variant={passed ? 'default' : 'destructive'} className="text-xs">
                                {ruleId}: {passed ? 'PASS' : 'FAIL'}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}