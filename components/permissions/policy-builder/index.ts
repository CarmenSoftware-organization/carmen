// Policy Builder Components Export Index

export { PolicyBuilderDashboard } from './policy-builder-dashboard';
export { VisualPolicyEditor } from './visual-policy-editor';
export { AttributeInspector } from './attribute-inspector';
export { PolicyTester } from './policy-tester';
export { RuleConditionBuilder } from './rule-condition-builder';

// Re-export types for convenience
export type {
  PolicyBuilderDashboardProps,
  VisualPolicyEditorProps,
  AttributeInspectorProps,
  PolicyTesterProps,
  RuleConditionBuilderProps,
  PolicyBuilderState,
  PolicyBuilderValidation,
  AttributeDefinition,
  PolicyTestResult,
  MockRequest
} from '@/lib/types/policy-builder';