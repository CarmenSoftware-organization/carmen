/**
 * Rule Testing Management Service Tests
 * 
 * Tests for rule simulation, versioning, approval workflow,
 * audit trail, and emergency management capabilities.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RuleTestingManagementService } from '../rule-testing-management-service';

// Mock fetch globally
global.fetch = vi.fn() as any;

describe('RuleTestingManagementService', () => {
  let service: RuleTestingManagementService;
  const mockFetch = global.fetch as any;

  beforeEach(() => {
    service = new RuleTestingManagementService();
    mockFetch.mockClear();
  });

  describe('Rule Simulation', () => {
    it('should run rule simulation with test data', async () => {
      const mockTestResult = {
        testId: 'test-123',
        scenarioId: 'scenario-001',
        scenarioName: 'Basic Vendor Selection',
        ruleId: 'rule-001',
        overallResult: 'pass',
        ruleResults: [
          {
            ruleId: 'rule-001',
            ruleName: 'Preferred Vendor Priority',
            expected: true,
            actual: true,
            action: 'assignVendor',
            confidence: 95,
            status: 'pass',
            message: 'Rule executed successfully',
            executionTime: 120
          }
        ],
        executionTime: 150,
        timestamp: '2024-01-25T10:30:00Z',
        coverage: {
          conditionsCovered: 4,
          totalConditions: 4,
          actionsCovered: 1,
          totalActions: 1,
          coveragePercentage: 100
        },
        performanceMetrics: {
          memoryUsage: 1024,
          cpuUsage: 15,
          networkCalls: 2,
          cacheHits: 5,
          cacheMisses: 1
        }
      };

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ testResults: mockTestResult }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const testData = {
        product: { id: 'prod-001', name: 'Office Chair', category: 'furniture' },
        request: { quantity: 10, urgency: 'normal', department: 'admin' },
        vendor: { id: 'vendor-001', name: 'Office Supplies Inc', isPreferred: true }
      };

      const result = await service.runRuleSimulation('rule-001', testData, {
        includePerformanceMetrics: true,
        includeCoverage: true,
        testType: 'comprehensive'
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/price-management/business-rules/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ruleId: 'rule-001',
          testData,
          options: {
            includePerformanceMetrics: true,
            includeCoverage: true,
            testType: 'comprehensive'
          }
        })
      });

      expect(result).toEqual(mockTestResult);
      expect(result.overallResult).toBe('pass');
      expect(result.coverage.coveragePercentage).toBe(100);
    });

    it('should run batch simulation with multiple scenarios', async () => {
      const mockBatchResults = [
        {
          testId: 'batch-test-001',
          scenarioId: 'scenario-001',
          overallResult: 'pass',
          executionTime: 120
        },
        {
          testId: 'batch-test-002',
          scenarioId: 'scenario-002',
          overallResult: 'fail',
          executionTime: 95
        }
      ];

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ testResults: mockBatchResults }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const testScenarios = [
        {
          id: 'scenario-001',
          name: 'Preferred Vendor Test',
          description: 'Test preferred vendor selection',
          testData: {
            product: { id: 'prod-001', name: 'Office Chair', category: 'furniture' },
            request: { quantity: 10, urgency: 'normal', department: 'admin' },
            vendor: { id: 'vendor-001', name: 'Office Supplies Inc', isPreferred: true },
            price: { total: 500, currency: 'USD' }
          },
          expectedResults: [
            {
              ruleId: 'rule-001',
              shouldTrigger: true,
              expectedAction: 'assignVendor',
              confidence: 90
            }
          ]
        }
      ];

      const result = await service.runBatchSimulation(
        ['rule-001', 'rule-002'],
        testScenarios,
        { parallel: true, maxConcurrency: 5 }
      );

      expect(result).toEqual(mockBatchResults);
      expect(result).toHaveLength(2);
    });

    it('should handle simulation errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(null, {
          status: 500,
          statusText: 'Internal Server Error'
        })
      );

      await expect(
        service.runRuleSimulation('rule-001', {})
      ).rejects.toThrow('Failed to run rule simulation: Internal Server Error');
    });
  });

  describe('Rule Versioning', () => {
    it('should fetch rule versions', async () => {
      const mockVersions = [
        {
          id: 'version-001',
          ruleId: 'rule-001',
          version: 3,
          name: 'Preferred Vendor Priority v3',
          description: 'Updated with location-based priority',
          conditions: [],
          actions: [],
          createdAt: '2024-01-25T10:30:00Z',
          createdBy: 'john.doe',
          changeReason: 'Added location-based selection',
          isActive: true,
          approvalStatus: 'approved',
          rollbackAvailable: true,
          changeImpact: {
            riskLevel: 'medium',
            affectedSystems: ['price-assignment'],
            estimatedImpact: 'Improved delivery times',
            rollbackComplexity: 'simple'
          }
        }
      ];

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ versions: mockVersions }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const result = await service.getRuleVersions('rule-001');

      expect(mockFetch).toHaveBeenCalledWith('/api/price-management/business-rules/versions?ruleId=rule-001');
      expect(result).toEqual(mockVersions);
      expect(result[0].version).toBe(3);
      expect(result[0].rollbackAvailable).toBe(true);
    });

    it('should create new rule version', async () => {
      const mockVersion = {
        id: 'version-002',
        ruleId: 'rule-001',
        version: 4,
        name: 'Preferred Vendor Priority v4',
        description: 'Enhanced with cost optimization',
        conditions: [],
        actions: [],
        createdAt: '2024-01-25T11:00:00Z',
        createdBy: 'current-user',
        changeReason: 'Cost optimization improvements',
        isActive: false,
        approvalStatus: 'pending',
        rollbackAvailable: false
      };

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ version: mockVersion }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const versionData = {
        name: 'Preferred Vendor Priority v4',
        description: 'Enhanced with cost optimization',
        conditions: [],
        actions: [],
        changeReason: 'Cost optimization improvements',
        requiresApproval: true
      };

      const result = await service.createRuleVersion('rule-001', versionData);

      expect(result).toEqual(mockVersion);
      expect(result.approvalStatus).toBe('pending');
    });
  });

  describe('Rule Rollback', () => {
    it('should rollback rule to previous version', async () => {
      const mockRollbackResult = {
        success: true,
        rollbackId: 'rollback-123',
        fromVersion: 3,
        toVersion: 2,
        executionTime: 1500,
        validationResults: {
          preRollbackTests: { passed: 8, failed: 0, skipped: 2 },
          postRollbackTests: { passed: 10, failed: 0, skipped: 0 }
        }
      };

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ rollbackResult: mockRollbackResult }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const result = await service.rollbackRule('rule-001', 2, {
        reason: 'Performance issues with version 3',
        emergencyRollback: false,
        notifyStakeholders: true
      });

      expect(result).toEqual(mockRollbackResult);
      expect(result.success).toBe(true);
      expect(result.fromVersion).toBe(3);
      expect(result.toVersion).toBe(2);
    });

    it('should handle emergency rollback', async () => {
      const mockEmergencyResult = {
        success: true,
        rollbackId: 'emergency-rollback-456',
        fromVersion: 3,
        toVersion: 1,
        executionTime: 800,
        validationResults: {
          preRollbackTests: { passed: 5, failed: 0, skipped: 5 },
          postRollbackTests: { passed: 8, failed: 0, skipped: 2 }
        }
      };

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ rollbackResult: mockEmergencyResult }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const result = await service.rollbackRule('rule-001', 1, {
        reason: 'Critical bug causing system failures',
        emergencyRollback: true,
        skipValidation: true
      });

      expect(result.success).toBe(true);
      expect(result.executionTime).toBeLessThan(1000); // Emergency rollbacks should be fast
    });
  });

  describe('Emergency Deactivation', () => {
    it('should emergency deactivate rule', async () => {
      const mockDeactivationResult = {
        success: true,
        deactivationId: 'emergency-deactivation-789',
        executedAt: '2024-01-25T12:00:00Z',
        impactAssessment: {
          activeExecutionsTerminated: 3,
          affectedSystems: ['price-assignment-engine'],
          estimatedBusinessImpact: 'medium'
        },
        incidentId: 'incident-001'
      };

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ deactivationResult: mockDeactivationResult }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const result = await service.emergencyDeactivateRule('rule-001', {
        reason: 'Critical security vulnerability detected',
        severity: 'critical',
        immediateEffect: true,
        createIncident: true
      });

      expect(result).toEqual(mockDeactivationResult);
      expect(result.success).toBe(true);
      expect(result.incidentId).toBe('incident-001');
    });

    it('should handle high severity deactivation', async () => {
      const mockResult = {
        success: true,
        deactivationId: 'deactivation-high-001',
        executedAt: '2024-01-25T12:30:00Z',
        impactAssessment: {
          activeExecutionsTerminated: 1,
          affectedSystems: ['vendor-selection-service'],
          estimatedBusinessImpact: 'low'
        }
      };

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ deactivationResult: mockResult }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const result = await service.emergencyDeactivateRule('rule-002', {
        reason: 'Performance degradation',
        severity: 'high',
        immediateEffect: false
      });

      expect(result.success).toBe(true);
      expect(result.incidentId).toBeUndefined(); // No incident for high severity
    });
  });

  describe('Audit Trail', () => {
    it('should fetch audit trail entries', async () => {
      const mockAuditEntries = [
        {
          id: 'audit-001',
          ruleId: 'rule-001',
          action: 'updated',
          userId: 'user-001',
          userName: 'John Doe',
          timestamp: '2024-01-25T10:30:00Z',
          details: {
            changes: { priority: { from: 1, to: 2 } },
            reason: 'Increased priority for better performance'
          },
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          sessionId: 'session-123',
          complianceFlags: ['sensitive_change']
        }
      ];

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ auditEntries: mockAuditEntries }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const result = await service.getAuditTrail({
        ruleId: 'rule-001',
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      });

      expect(result).toEqual(mockAuditEntries);
      expect(result[0].action).toBe('updated');
      expect(result[0].complianceFlags).toContain('sensitive_change');
    });

    it('should create audit entry', async () => {
      const mockAuditEntry = {
        id: 'audit-002',
        ruleId: 'rule-001',
        action: 'activated',
        userId: 'user-002',
        userName: 'Jane Smith',
        timestamp: '2024-01-25T11:00:00Z',
        details: { reason: 'Approved for production use' },
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0...',
        sessionId: 'session-456',
        complianceFlags: ['production_deployment']
      };

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ auditEntry: mockAuditEntry }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const result = await service.createAuditEntry({
        ruleId: 'rule-001',
        action: 'activated',
        userId: 'user-002',
        userName: 'Jane Smith',
        details: { reason: 'Approved for production use' },
        complianceFlags: ['production_deployment']
      });

      expect(result).toEqual(mockAuditEntry);
      expect(result.action).toBe('activated');
    });
  });

  describe('Approval Workflow', () => {
    it('should fetch approval requests', async () => {
      const mockApprovalRequests = [
        {
          id: 'approval-001',
          ruleId: 'rule-001',
          ruleName: 'Preferred Vendor Priority',
          requestType: 'update',
          requestedBy: 'john.doe',
          requestedByName: 'John Doe',
          requestedAt: '2024-01-25T09:00:00Z',
          reason: 'Performance optimization',
          changes: { priority: { from: 1, to: 2 } },
          status: 'pending',
          approvers: [
            {
              userId: 'manager-001',
              userName: 'Sarah Johnson',
              role: 'Finance Manager',
              status: 'pending'
            }
          ],
          priority: 'medium',
          impactAssessment: {
            affectedRules: 1,
            riskLevel: 'medium',
            estimatedImpact: 'Improved performance'
          },
          businessJustification: 'Optimization will improve system performance'
        }
      ];

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ approvalRequests: mockApprovalRequests }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const result = await service.getApprovalRequests({
        status: 'pending',
        priority: 'medium'
      });

      expect(result).toEqual(mockApprovalRequests);
      expect(result[0].status).toBe('pending');
    });

    it('should create approval request', async () => {
      const mockApprovalRequest = {
        id: 'approval-002',
        ruleId: 'rule-002',
        ruleName: 'Bulk Discount Application',
        requestType: 'create',
        requestedBy: 'current-user',
        requestedByName: 'Current User',
        requestedAt: '2024-01-25T12:00:00Z',
        reason: 'New bulk discount rule',
        changes: { new_rule: { from: null, to: {} } },
        status: 'pending',
        approvers: [],
        priority: 'low',
        impactAssessment: {
          affectedRules: 0,
          riskLevel: 'low',
          estimatedImpact: 'New functionality'
        },
        businessJustification: 'Improve cost savings through bulk discounts'
      };

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ approvalRequest: mockApprovalRequest }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const result = await service.createApprovalRequest({
        ruleId: 'rule-002',
        ruleName: 'Bulk Discount Application',
        requestType: 'create',
        reason: 'New bulk discount rule',
        changes: { new_rule: { from: null, to: {} } },
        approvers: [],
        businessJustification: 'Improve cost savings through bulk discounts'
      });

      expect(result).toEqual(mockApprovalRequest);
      expect(result.requestType).toBe('create');
    });

    it('should process approval request', async () => {
      const mockProcessedRequest = {
        id: 'approval-001',
        status: 'approved',
        approvedAt: '2024-01-25T13:00:00Z',
        approverComments: 'Approved after review',
        processedBy: 'manager-001'
      };

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ approvalRequest: mockProcessedRequest }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const result = await service.processApprovalRequest('approval-001', 'approve', {
        comments: 'Approved after review',
        approverId: 'manager-001'
      });

      expect(result).toEqual(mockProcessedRequest);
      expect(result.status).toBe('approved');
    });
  });

  describe('Performance Metrics', () => {
    it('should fetch performance metrics', async () => {
      const mockMetrics = [
        {
          ruleId: 'rule-001',
          ruleName: 'Preferred Vendor Priority',
          version: 3,
          testCoverage: {
            totalConditions: 4,
            coveredConditions: 4,
            coveragePercentage: 100
          },
          executionMetrics: {
            totalExecutions: 45,
            successfulExecutions: 42,
            averageExecutionTime: 1.2,
            successRate: 93.3
          },
          effectivenessMetrics: {
            impactScore: 8.5,
            costSavings: 2450.75,
            automationRate: 93.3
          },
          qualityMetrics: {
            codeComplexity: 'medium',
            maintainabilityScore: 7.8,
            securityScore: 9.5
          }
        }
      ];

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ performanceMetrics: mockMetrics }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const result = await service.getPerformanceMetrics('rule-001', {
        timeRange: '30d',
        includeHistory: true,
        includeTrends: true
      });

      expect(result).toEqual(mockMetrics);
      expect(result[0].testCoverage.coveragePercentage).toBe(100);
      expect(result[0].executionMetrics.successRate).toBe(93.3);
    });

    it('should update performance metrics', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      await service.updatePerformanceMetrics('rule-001', {
        testResults: { passed: 10, failed: 0 },
        executionMetrics: { averageTime: 1.1, successRate: 95.0 }
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/price-management/business-rules/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ruleId: 'rule-001',
          testResults: { passed: 10, failed: 0 },
          executionMetrics: { averageTime: 1.1, successRate: 95.0 }
        })
      });
    });
  });

  describe('Compliance Reporting', () => {
    it('should generate compliance report', async () => {
      const mockReport = {
        reportId: 'report-001',
        generatedAt: '2024-01-25T14:00:00Z',
        format: 'json',
        downloadUrl: '/api/reports/compliance-001.json',
        data: {
          totalRules: 5,
          auditEntries: 25,
          approvalRequests: 3,
          complianceScore: 95.2
        }
      };

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ report: mockReport }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const result = await service.generateComplianceReport({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        ruleIds: ['rule-001', 'rule-002'],
        includeAuditTrail: true,
        includeApprovals: true,
        format: 'json'
      });

      expect(result).toEqual(mockReport);
      expect(result.format).toBe('json');
      expect(result.data.complianceScore).toBe(95.2);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        service.runRuleSimulation('rule-001', {})
      ).rejects.toThrow('Network error');
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(null, {
          status: 400,
          statusText: 'Bad Request'
        })
      );

      await expect(
        service.getRuleVersions('invalid-rule')
      ).rejects.toThrow('Failed to fetch rule versions: Bad Request');
    });

    it('should handle malformed responses', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response('invalid json', {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );

      await expect(
        service.getAuditTrail()
      ).rejects.toThrow();
    });
  });
});