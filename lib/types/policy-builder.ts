// Policy Builder UI Types for Carmen ERP ABAC System

import {
  Policy,
  Rule,
  Expression,
  AttributeCondition,
  Operator,
  LogicalOperator,
  EffectType,
  SubjectAttributes,
  ResourceAttributes,
  EnvironmentAttributes,
  PolicyTestScenario
} from './permissions';

// Re-export types that are used by policy-builder consumers
export type { PolicyTestScenario } from './permissions';

// ============================================================================
// Policy Builder State Types
// ============================================================================

export interface PolicyBuilderState {
  // Basic policy information
  name: string;
  description: string;
  priority: number;
  enabled: boolean;
  category?: string;
  tags?: string[];

  // Policy conditions
  subjectConditions: AttributeCondition[];
  resourceConditions: AttributeCondition[];
  actionConditions: string[];
  environmentConditions: AttributeCondition[];

  // Rules and logic
  rules: Rule[];
  effect: EffectType;
  logicalOperator: LogicalOperator;

  // Testing
  testScenarios: PolicyTestScenario[];

  // Metadata
  version: string;
  effectiveFrom?: Date;
  effectiveTo?: Date;
}

export interface PolicyBuilderValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'invalid' | 'conflict' | 'performance';
}

export interface ValidationWarning {
  field: string;
  message: string;
  type: 'performance' | 'best_practice' | 'compatibility';
}

// ============================================================================
// Attribute Inspector Types
// ============================================================================

export interface AttributeDefinition {
  path: string;
  name: string;
  displayName: string;
  description: string;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  category: 'subject' | 'resource' | 'environment' | 'action';
  examples?: any[];
  validOperators: Operator[];
  isRequired: boolean;
  isSystem: boolean;
  tags?: string[];
}

export interface AttributeCategory {
  category: 'subject' | 'resource' | 'environment' | 'action';
  displayName: string;
  description: string;
  icon: string;
  attributes: AttributeDefinition[];
}

export interface AttributeSearchResult {
  attribute: AttributeDefinition;
  relevanceScore: number;
  matchType: 'name' | 'description' | 'path' | 'tag';
  highlightedText?: string;
}

// ============================================================================
// Visual Policy Editor Types
// ============================================================================

export interface PolicyEditorNode {
  id: string;
  type: 'subject' | 'resource' | 'action' | 'environment' | 'rule' | 'operator';
  position: { x: number; y: number };
  data: PolicyNodeData;
  connections: PolicyConnection[];
}

export interface PolicyNodeData {
  label: string;
  conditions?: AttributeCondition[];
  actions?: string[];
  operator?: LogicalOperator;
  isValid: boolean;
  errors?: string[];
}

export interface PolicyConnection {
  id: string;
  source: string;
  target: string;
  type: LogicalOperator;
  isValid: boolean;
}

export interface PolicyEditorState {
  nodes: PolicyEditorNode[];
  connections: PolicyConnection[];
  selectedNodeId?: string;
  draggedNodeId?: string;
  zoom: number;
  pan: { x: number; y: number };
}

// ============================================================================
// Rule Condition Builder Types
// ============================================================================

export interface ConditionNode {
  id: string;
  type: 'condition' | 'group';
  parentId?: string;
  level: number;
  
  // For condition nodes
  attribute?: string;
  operator?: Operator;
  value?: any;
  
  // For group nodes
  logicalOperator?: LogicalOperator;
  children?: ConditionNode[];
  
  // UI state
  isExpanded: boolean;
  isValid: boolean;
  errors?: string[];
}

export interface ConditionTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  conditions: AttributeCondition[];
  tags?: string[];
  isSystem: boolean;
}

// ============================================================================
// Policy Tester Types
// ============================================================================

export interface MockRequest {
  userId: string;
  resourceId: string;
  resourceType: string;
  action: string;
  additionalContext?: Record<string, any>;
}

export interface PolicyEvaluationTrace {
  policyId: string;
  policyName: string;
  effect: EffectType | 'not_applicable';
  evaluationSteps: EvaluationStep[];
  executionTime: number;
  finalResult: boolean;
}

export interface EvaluationStep {
  stepNumber: number;
  stepType: 'target_match' | 'rule_evaluation' | 'condition_check' | 'final_decision';
  description: string;
  result: boolean | 'not_applicable';
  details?: Record<string, any>;
  executionTime: number;
}

export interface PolicyTestResult {
  requestId: string;
  allowed: boolean;
  finalEffect: EffectType;
  evaluationTrace: PolicyEvaluationTrace[];
  totalExecutionTime: number;
  cacheHit: boolean;
  warnings?: string[];
  performanceMetrics: {
    policiesEvaluated: number;
    conditionsChecked: number;
    averageStepTime: number;
    slowestPolicy?: string;
  };
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface PolicyDashboardStats {
  totalPolicies: number;
  activePolicies: number;
  draftPolicies: number;
  expiredPolicies: number;
  recentActivity: PolicyActivity[];
  performanceMetrics: PolicyPerformanceMetrics;
}

export interface PolicyActivity {
  id: string;
  type: 'created' | 'updated' | 'activated' | 'deactivated' | 'deleted' | 'tested';
  policyId: string;
  policyName: string;
  userId: string;
  userName: string;
  timestamp: Date;
  details?: Record<string, any>;
}

export interface PolicyPerformanceMetrics {
  averageEvaluationTime: number;
  evaluationsPerDay: number;
  cacheHitRate: number;
  slowestPolicies: Array<{
    policyId: string;
    name: string;
    averageTime: number;
  }>;
  errorRate: number;
}

export interface PolicyFilter {
  search: string;
  effect: EffectType | 'all';
  status: 'active' | 'inactive' | 'draft' | 'expired' | 'all';
  category: string | 'all';
  priority: {
    min: number;
    max: number;
  };
  tags: string[];
  dateRange: {
    from?: Date;
    to?: Date;
  };
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface PolicyBuilderDashboardProps {
  onCreatePolicy: () => void;
  onEditPolicy: (policyId: string) => void;
  onViewPolicy: (policyId: string) => void;
  onDeletePolicy: (policyId: string) => void;
  onDuplicatePolicy: (policyId: string) => void;
}

export interface VisualPolicyEditorProps {
  initialPolicy?: Partial<PolicyBuilderState>;
  onSave: (policy: PolicyBuilderState) => void;
  onCancel: () => void;
  onChange: (policy: PolicyBuilderState) => void;
  readonly?: boolean;
}

export interface AttributeInspectorProps {
  onAttributeSelect: (attribute: AttributeDefinition) => void;
  selectedAttributes?: string[];
  category?: 'subject' | 'resource' | 'environment' | 'action';
  showSearch?: boolean;
  showFavorites?: boolean;
}

export interface PolicyTesterProps {
  policies?: Policy[];
  onTestComplete: (result: PolicyTestResult) => void;
  showPerformanceMetrics?: boolean;
  enableBatchTesting?: boolean;
}

export interface RuleConditionBuilderProps {
  initialConditions?: ConditionNode[];
  availableAttributes: AttributeDefinition[];
  onChange: (conditions: ConditionNode[]) => void;
  onValidationChange: (validation: PolicyBuilderValidation) => void;
  showTemplates?: boolean;
  allowNesting?: boolean;
  maxDepth?: number;
}

// ============================================================================
// Utility Types
// ============================================================================

export type PolicyBuilderStep = 'basic' | 'subject' | 'resource' | 'action' | 'environment' | 'rules' | 'test' | 'review';

export type AttributeFilterType = 'all' | 'required' | 'optional' | 'system' | 'custom';

export type ConditionBuilderMode = 'simple' | 'advanced' | 'visual';

// ============================================================================
// Constants
// ============================================================================

export const POLICY_BUILDER_STEPS: Array<{
  key: PolicyBuilderStep;
  label: string;
  description: string;
  isOptional: boolean;
}> = [
  { key: 'basic', label: 'Basic Info', description: 'Policy name, description, and metadata', isOptional: false },
  { key: 'subject', label: 'Subject', description: 'Who this policy applies to', isOptional: false },
  { key: 'resource', label: 'Resource', description: 'What resources this policy covers', isOptional: false },
  { key: 'action', label: 'Actions', description: 'What actions are allowed or denied', isOptional: false },
  { key: 'environment', label: 'Environment', description: 'When and where this policy applies', isOptional: true },
  { key: 'rules', label: 'Rules', description: 'Complex conditions and logic', isOptional: true },
  { key: 'test', label: 'Test', description: 'Test the policy with scenarios', isOptional: true },
  { key: 'review', label: 'Review', description: 'Review and save the policy', isOptional: false }
];

export const DEFAULT_OPERATORS_BY_TYPE: Record<string, Operator[]> = {
  string: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.CONTAINS, Operator.NOT_CONTAINS, Operator.STARTS_WITH, Operator.ENDS_WITH, Operator.IN, Operator.NOT_IN],
  number: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.GREATER_THAN, Operator.LESS_THAN, Operator.GREATER_THAN_OR_EQUAL, Operator.LESS_THAN_OR_EQUAL, Operator.IN, Operator.NOT_IN],
  boolean: [Operator.EQUALS, Operator.NOT_EQUALS],
  date: [Operator.EQUALS, Operator.NOT_EQUALS, Operator.GREATER_THAN, Operator.LESS_THAN, Operator.GREATER_THAN_OR_EQUAL, Operator.LESS_THAN_OR_EQUAL],
  array: [Operator.CONTAINS, Operator.NOT_CONTAINS, Operator.IN, Operator.NOT_IN],
  object: [Operator.EXISTS, Operator.NOT_EXISTS, Operator.CONTAINS, Operator.NOT_CONTAINS]
};